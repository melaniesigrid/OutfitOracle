import * as SecureStore from 'expo-secure-store';
import {
  AUTH_SESSION_KEY,
  AUTH_USERS_KEY,
  createLocalAccount,
  getStoredAuthSession,
  signInLocalAccount,
  signOutLocalAccount,
} from '../src/services/auth';

beforeEach(() => {
  (SecureStore as any)._clear();
  jest.clearAllMocks();
});

describe('local auth service', () => {
  it('creates a normalized account and stores a session', async () => {
    const user = await createLocalAccount({
      name: 'Melanie',
      email: '  MELANIE@example.COM ',
      password: 'weather123',
    });

    const usersRaw = await SecureStore.getItemAsync(AUTH_USERS_KEY);
    const sessionRaw = await SecureStore.getItemAsync(AUTH_SESSION_KEY);

    expect(user.email).toBe('melanie@example.com');
    expect(user.name).toBe('Melanie');
    expect(usersRaw).toContain('melanie@example.com');
    expect(sessionRaw).toContain(user.id);
  });

  it('rejects duplicate emails on the same device', async () => {
    await createLocalAccount({ name: 'Melanie', email: 'melanie@example.com', password: 'weather123' });

    await expect(
      createLocalAccount({ name: 'Melanie Two', email: 'MELANIE@example.com', password: 'weather456' }),
    ).rejects.toThrow('already exists');
  });

  it('allows only one local account per install to avoid shared local data leakage', async () => {
    await createLocalAccount({ name: 'Melanie', email: 'melanie@example.com', password: 'weather123' });

    await expect(
      createLocalAccount({ name: 'Someone Else', email: 'someone@example.com', password: 'weather456' }),
    ).rejects.toThrow('local account already exists');
  });

  it('signs in with the stored password and restores the session', async () => {
    const created = await createLocalAccount({ name: 'Melanie', email: 'melanie@example.com', password: 'weather123' });
    await signOutLocalAccount();

    const signedIn = await signInLocalAccount('melanie@example.com', 'weather123');
    const restored = await getStoredAuthSession();

    expect(signedIn.id).toBe(created.id);
    expect(restored?.id).toBe(created.id);
  });

  it('rejects the wrong password', async () => {
    await createLocalAccount({ name: 'Melanie', email: 'melanie@example.com', password: 'weather123' });

    await expect(signInLocalAccount('melanie@example.com', 'wrongpass')).rejects.toThrow('password');
  });
});
