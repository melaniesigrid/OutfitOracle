import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  AuthUser,
  createLocalAccount,
  getStoredAuthSession,
  signInLocalAccount,
  signOutLocalAccount,
} from '../services/auth';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'unauthenticated'; user: null }
  | { status: 'authenticated'; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });

  useEffect(() => {
    let mounted = true;
    getStoredAuthSession()
      .then(user => {
        if (!mounted) return;
        setState(user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null });
      })
      .catch(() => {
        if (mounted) setState({ status: 'unauthenticated', user: null });
      });
    return () => { mounted = false; };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const user = await signInLocalAccount(email, password);
    setState({ status: 'authenticated', user });
  }, []);

  const signUp = useCallback(async (input: { name: string; email: string; password: string }) => {
    const user = await createLocalAccount(input);
    setState({ status: 'authenticated', user });
  }, []);

  const signOut = useCallback(async () => {
    await signOutLocalAccount();
    setState({ status: 'unauthenticated', user: null });
  }, []);

  const value = useMemo(
    () => ({ state, user: state.user, signIn, signUp, signOut }),
    [state, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
