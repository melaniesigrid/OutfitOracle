import * as SecureStore from 'expo-secure-store';
import * as ExpoCrypto from 'expo-crypto';

export const AUTH_USERS_KEY = 'outfit_oracle_auth_users_v1';
export const AUTH_SESSION_KEY = 'outfit_oracle_auth_session_v1';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  createdAt: number;
  lastLoginAt: number;
  appleUserId?: string;
}

interface StoredAuthUser extends AuthUser {
  passwordSalt: string;
  passwordHash: string;
  appleUserId?: string;
  googleUserId?: string;
  facebookUserId?: string;
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
  const raw = await SecureStore.getItemAsync(AUTH_USERS_KEY).catch(() => null);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    await SecureStore.deleteItemAsync(AUTH_USERS_KEY).catch(() => {});
    return [];
  }
}

async function writeUsers(users: StoredAuthUser[]) {
  await SecureStore.setItemAsync(AUTH_USERS_KEY, JSON.stringify(users));
}

function makeId(): string {
  const bytes = new Uint8Array(12);
  fillSecureRandomBytes(bytes);
  const suffix = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
  return `user_${Date.now()}_${suffix}`;
}

// ─── Pure-JS SHA-256 + HMAC-SHA256 + PBKDF2 ───────────────────────────────
// crypto.subtle is not available in all Hermes builds. This implementation
// works in any JS environment and produces the same output as the W3C spec.

const SHA256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
];

function sha256(data: Uint8Array): Uint8Array {
  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;

  const l = data.length;
  const bitLen = l * 8;
  const padLen = (l % 64 < 56) ? (56 - l % 64) : (120 - l % 64);
  const padded = new Uint8Array(l + padLen + 8);
  padded.set(data);
  padded[l] = 0x80;
  const dv = new DataView(padded.buffer);
  dv.setUint32(padded.length - 4, bitLen >>> 0, false);
  dv.setUint32(padded.length - 8, Math.floor(bitLen / 0x100000000), false);

  const w = new Array<number>(64);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4, false);
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i-15] >>> 7) | (w[i-15] << 25)) ^ ((w[i-15] >>> 18) | (w[i-15] << 14)) ^ (w[i-15] >>> 3);
      const s1 = ((w[i-2] >>> 17) | (w[i-2] << 15)) ^ ((w[i-2] >>> 19) | (w[i-2] << 13)) ^ (w[i-2] >>> 10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + SHA256_K[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    h0 = (h0+a)|0; h1 = (h1+b)|0; h2 = (h2+c)|0; h3 = (h3+d)|0;
    h4 = (h4+e)|0; h5 = (h5+f)|0; h6 = (h6+g)|0; h7 = (h7+h)|0;
  }

  const out = new Uint8Array(32);
  const ov = new DataView(out.buffer);
  ov.setUint32(0,  h0, false); ov.setUint32(4,  h1, false);
  ov.setUint32(8,  h2, false); ov.setUint32(12, h3, false);
  ov.setUint32(16, h4, false); ov.setUint32(20, h5, false);
  ov.setUint32(24, h6, false); ov.setUint32(28, h7, false);
  return out;
}

function hmacSha256(key: Uint8Array, msg: Uint8Array): Uint8Array {
  let k = key.length > 64 ? sha256(key) : key;
  const kp = new Uint8Array(64);
  kp.set(k);
  const ipad = kp.map(b => b ^ 0x36);
  const opad = kp.map(b => b ^ 0x5c);
  const inner = new Uint8Array(64 + msg.length);
  inner.set(ipad); inner.set(msg, 64);
  const outer = new Uint8Array(96);
  outer.set(opad); outer.set(sha256(inner), 64);
  return sha256(outer);
}

function fillSecureRandomBytes(bytes: Uint8Array): void {
  const c = globalThis.crypto as Crypto | undefined;
  if (c?.getRandomValues) {
    c.getRandomValues(bytes);
    return;
  }

  ExpoCrypto.getRandomValues(bytes);
}

// PBKDF2-SHA256: 10k iterations, 32-byte output (local-device auth only).
function makeSalt(): string {
  const bytes = new Uint8Array(16);
  fillSecureRandomBytes(bytes);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise(resolve => {
    const enc = new TextEncoder();
    const pw  = enc.encode(password);
    const sl  = enc.encode(salt);

    // PBKDF2 block 1: HMAC(password, salt || \x00\x00\x00\x01)
    const saltBlock = new Uint8Array(sl.length + 4);
    saltBlock.set(sl);
    saltBlock[sl.length + 3] = 1;

    let u  = hmacSha256(pw, saltBlock);
    const dk = new Uint8Array(u);
    for (let i = 1; i < 10_000; i++) {
      u = hmacSha256(pw, u);
      for (let j = 0; j < 32; j++) dk[j] ^= u[j];
    }
    resolve(Array.from(dk).map(b => b.toString(16).padStart(2, '0')).join(''));
  });
}

async function writeSession(userId: string) {
  // Session stored in SecureStore — encrypted at rest on all platforms.
  const now = Date.now();
  const session: StoredSession = { userId, startedAt: now, expiresAt: now + 90 * 24 * 60 * 60 * 1000 };
  await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(session));
}

export async function getStoredAuthSession(): Promise<AuthUser | null> {
  const [rawSession, users] = await Promise.all([
    SecureStore.getItemAsync(AUTH_SESSION_KEY).catch(() => null),
    readUsers(),
  ]);
  if (!rawSession) return null;
  try {
    const session = JSON.parse(rawSession) as StoredSession;
    if (session.expiresAt && Date.now() > session.expiresAt) {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {});
      return null;
    }
    const user = users.find(u => u.id === session.userId);
    if (!user) {
      await SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {});
      return null;
    }
    return publicUser(user);
  } catch {
    await SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {});
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
  if (!timingSafeEqual(attemptedHash, user.passwordHash)) {
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
  await SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {});
}

export async function deleteAllLocalAuth(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(AUTH_SESSION_KEY).catch(() => {}),
    SecureStore.deleteItemAsync(AUTH_USERS_KEY).catch(() => {}),
  ]);
}

export interface AppleCredential {
  user: string;
  identityToken?: string | null;
  fullName?: { givenName?: string | null; familyName?: string | null } | null;
  email?: string | null;
  nonce?: string | null;
}

export interface GoogleCredential {
  userId: string;
  email: string | null;
  name: string | null;
}

export interface FacebookCredential {
  userId: string;
  email: string | null;
  name: string | null;
}

export async function signInWithApple(credential: AppleCredential): Promise<AuthUser> {
  const users = await readUsers();
  const existing = users.findIndex(u => u.appleUserId === credential.user);

  if (existing >= 0) {
    const updated = { ...users[existing], lastLoginAt: Date.now() };
    const next = [...users];
    next[existing] = updated;
    await writeUsers(next);
    await writeSession(updated.id);
    return publicUser(updated);
  }

  // First time: create a local account linked to this Apple user ID.
  const given = credential.fullName?.givenName ?? '';
  const family = credential.fullName?.familyName ?? '';
  const name = [given, family].filter(Boolean).join(' ') || 'Oracle Member';
  const email = credential.email ?? `apple_${credential.user.slice(0, 8)}@device.local`;

  const now = Date.now();
  const stored: StoredAuthUser = {
    id: makeId(),
    name,
    email,
    createdAt: now,
    lastLoginAt: now,
    passwordSalt: '',
    passwordHash: '',
    appleUserId: credential.user,
  };
  await writeUsers([stored, ...users]);
  await writeSession(stored.id);
  return publicUser(stored);
}

export async function signInWithGoogle(credential: GoogleCredential): Promise<AuthUser> {
  const users = await readUsers();
  const existing = users.findIndex(u => u.googleUserId === credential.userId);

  if (existing >= 0) {
    const updated = { ...users[existing], lastLoginAt: Date.now() };
    const next = [...users];
    next[existing] = updated;
    await writeUsers(next);
    await writeSession(updated.id);
    return publicUser(updated);
  }

  const name = credential.name ?? 'Oracle Member';
  const email = credential.email ?? `google_${credential.userId.slice(0, 8)}@device.local`;
  const now = Date.now();
  const stored: StoredAuthUser = {
    id: makeId(),
    name,
    email,
    createdAt: now,
    lastLoginAt: now,
    passwordSalt: '',
    passwordHash: '',
    googleUserId: credential.userId,
  };
  await writeUsers([stored, ...users]);
  await writeSession(stored.id);
  return publicUser(stored);
}

export async function signInWithFacebook(credential: FacebookCredential): Promise<AuthUser> {
  const users = await readUsers();
  const existing = users.findIndex(u => u.facebookUserId === credential.userId);

  if (existing >= 0) {
    const updated = { ...users[existing], lastLoginAt: Date.now() };
    const next = [...users];
    next[existing] = updated;
    await writeUsers(next);
    await writeSession(updated.id);
    return publicUser(updated);
  }

  const name = credential.name ?? 'Oracle Member';
  const email = credential.email ?? `facebook_${credential.userId.slice(0, 8)}@device.local`;
  const now = Date.now();
  const stored: StoredAuthUser = {
    id: makeId(),
    name,
    email,
    createdAt: now,
    lastLoginAt: now,
    passwordSalt: '',
    passwordHash: '',
    facebookUserId: credential.userId,
  };
  await writeUsers([stored, ...users]);
  await writeSession(stored.id);
  return publicUser(stored);
}

export async function updateLocalAccount(
  userId: string,
  updates: { name?: string; currentPassword?: string; newPassword?: string },
): Promise<AuthUser> {
  const users = await readUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx < 0) throw new AuthError('Account not found on this device.', 'not-found');

  let user = users[idx];

  if (updates.name !== undefined) {
    const name = updates.name.trim();
    if (name.length < 2) throw new AuthError('Name must be at least 2 characters.', 'invalid-input');
    user = { ...user, name };
  }

  if (updates.newPassword !== undefined) {
    if (!updates.currentPassword) {
      throw new AuthError('Enter your current password to set a new one.', 'invalid-input');
    }
    const currentHash = await hashPassword(updates.currentPassword, user.passwordSalt);
    if (!timingSafeEqual(currentHash, user.passwordHash)) {
      throw new AuthError('Current password is incorrect.', 'wrong-password');
    }
    if (updates.newPassword.length < 8) {
      throw new AuthError('New password must be at least 8 characters.', 'invalid-input');
    }
    if (updates.newPassword.length > 1024) {
      throw new AuthError('New password is too long.', 'invalid-input');
    }
    const newSalt = makeSalt();
    user = { ...user, passwordSalt: newSalt, passwordHash: await hashPassword(updates.newPassword, newSalt) };
  }

  const next = [...users];
  next[idx] = user;
  await writeUsers(next);
  return publicUser(user);
}
