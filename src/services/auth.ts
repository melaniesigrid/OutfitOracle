import AsyncStorage from '@react-native-async-storage/async-storage';

export const AUTH_USERS_KEY = '@outfit_oracle_auth_users_v1';
export const AUTH_SESSION_KEY = '@outfit_oracle_auth_session_v1';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  lastLoginAt: number;
}

interface StoredAuthUser extends AuthUser {
  passwordSalt: string;
  passwordHash: string;
}

interface StoredSession {
  userId: string;
  startedAt: number;
  expiresAt: number;
}

export class AuthError extends Error {
  constructor(message: string, public code: 'invalid-input' | 'duplicate' | 'not-found' | 'wrong-password') {
    super(message);
    this.name = 'AuthError';
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function publicUser(user: StoredAuthUser): AuthUser {
  const { passwordSalt: _salt, passwordHash: _hash, ...rest } = user;
  return rest;
}

async function readUsers(): Promise<StoredAuthUser[]> {
  const raw = await AsyncStorage.getItem(AUTH_USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await AsyncStorage.removeItem(AUTH_USERS_KEY);
    return [];
  }
}

async function writeUsers(users: StoredAuthUser[]) {
  await AsyncStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function makeId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// In React Native/Hermes, 'crypto' is not accessible as a bare identifier
// in module scope even when the engine supports it — must use globalThis.
const _crypto: Crypto = globalThis.crypto;

// 16 cryptographically random bytes encoded as hex
function makeSalt(): string {
  const bytes = new Uint8Array(16);
  _crypto.getRandomValues(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// PBKDF2-SHA256 via the Web Crypto API (available in Hermes ≥ Expo SDK 50).
// 100k iterations, 32-byte output encoded as hex.
// Local-device auth only — replace with server-side auth before account sync.
async function hashPassword(password: string, salt: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await _crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const bits = await _crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100_000 },
    keyMaterial,
    256,
  );
  return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function writeSession(userId: string) {
  const now = Date.now();
  const session: StoredSession = { userId, startedAt: now, expiresAt: now + 90 * 24 * 60 * 60 * 1000 };
  await AsyncStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function getStoredAuthSession(): Promise<AuthUser | null> {
  const [rawSession, users] = await Promise.all([
    AsyncStorage.getItem(AUTH_SESSION_KEY),
    readUsers(),
  ]);
  if (!rawSession) return null;
  try {
    const session = JSON.parse(rawSession) as StoredSession;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    const user = users.find(u => u.id === session.userId);
    if (!user) {
      await AsyncStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return publicUser(user);
  } catch {
    await AsyncStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export async function createLocalAccount(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthUser> {
  const name = input.name.trim();
  const email = normalizeEmail(input.email);
  if (name.length < 2) {
    throw new AuthError('Enter your name to create an account.', 'invalid-input');
  }
  if (!isValidEmail(email)) {
    throw new AuthError('Enter a valid email address.', 'invalid-input');
  }
  if (input.password.length < 8) {
    throw new AuthError('Use at least 8 characters for your password.', 'invalid-input');
  }
  if (input.password.length > 1024) {
    throw new AuthError('Password is too long (maximum 1024 characters).', 'invalid-input');
  }

  const users = await readUsers();
  if (users.some(user => user.email === email)) {
    throw new AuthError('An account with this email already exists on this device.', 'duplicate');
  }
  if (users.length > 0) {
    throw new AuthError('A local account already exists on this device. Log in or reset app data to create a different account.', 'duplicate');
  }

  const now = Date.now();
  const salt = makeSalt();
  const stored: StoredAuthUser = {
    id: makeId(),
    name,
    email,
    createdAt: now,
    lastLoginAt: now,
    passwordSalt: salt,
    passwordHash: await hashPassword(input.password, salt),
  };
  await writeUsers([stored, ...users]);
  await writeSession(stored.id);
  return publicUser(stored);
}

export async function signInLocalAccount(emailInput: string, password: string): Promise<AuthUser> {
  const email = normalizeEmail(emailInput);
  const users = await readUsers();
  const idx = users.findIndex(user => user.email === email);
  if (idx < 0) {
    throw new AuthError('No account found for that email on this device.', 'not-found');
  }

  const user = users[idx];
  const attemptedHash = await hashPassword(password, user.passwordSalt);
  if (attemptedHash !== user.passwordHash) {
    throw new AuthError('That password does not match this account.', 'wrong-password');
  }

  const updated = { ...user, lastLoginAt: Date.now() };
  const next = [...users];
  next[idx] = updated;
  await writeUsers(next);
  await writeSession(updated.id);
  return publicUser(updated);
}

export async function signOutLocalAccount(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_SESSION_KEY);
}
