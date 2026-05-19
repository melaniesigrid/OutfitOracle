import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  AppleCredential,
  GoogleCredential,
  FacebookCredential,
  AuthUser,
  createLocalAccount,
  getStoredAuthSession,
  signInLocalAccount,
  signInWithApple as signInWithAppleLocal,
  signInWithGoogle as signInWithGoogleLocal,
  signInWithFacebook as signInWithFacebookLocal,
  signOutLocalAccount,
  updateLocalAccount,
} from '../services/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  cloudSignInWithApple,
  cloudSignInWithGoogle,
  cloudSignInWithFacebook,
  cloudSignOut,
  cloudMigrateLocalData,
  MigratePayload,
} from '../services/authApi';

const CLOUD_TOKEN_KEY = 'outfit_oracle_cloud_token_v1';
const PROXY_URL = process.env.EXPO_PUBLIC_PROXY_URL ?? '';

type AuthState =
  | { status: 'loading'; user: null }
  | { status: 'unauthenticated'; user: null }
  | { status: 'authenticated'; user: AuthUser };

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  /** Opaque cloud session token — null when not signed in via a social provider or proxy unavailable */
  token: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (input: { name: string; email: string; password: string }) => Promise<void>;
  signInWithApple: (credential: AppleCredential) => Promise<void>;
  signInWithGoogle: (credential: GoogleCredential & { idToken: string }) => Promise<void>;
  signInWithFacebook: (credential: FacebookCredential & { accessToken: string }) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: { name?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function uploadLocalDataToCloud(token: string): Promise<void> {
  const [styleRaw, historyRaw, savedRaw, archiveRaw, streakRaw] = await Promise.all([
    AsyncStorage.getItem('@outfit_oracle_style_profile').catch(() => null),
    AsyncStorage.getItem('@outfit_oracle_history').catch(() => null),
    AsyncStorage.getItem('@outfit_oracle_saved').catch(() => null),
    AsyncStorage.getItem('@outfit_oracle_look_archive_v1').catch(() => null),
    AsyncStorage.getItem('@outfit_oracle_streak').catch(() => null),
  ]);

  const payload: MigratePayload = {};

  if (styleRaw) {
    try {
      const parsed = JSON.parse(styleRaw);
      if (!parsed.skipped) payload.styleProfile = parsed;
    } catch {}
  }
  if (historyRaw) {
    try {
      const parsed = JSON.parse(historyRaw);
      if (Array.isArray(parsed) && parsed.length) payload.history = parsed;
    } catch {}
  }
  if (savedRaw) {
    try {
      const parsed = JSON.parse(savedRaw);
      if (Array.isArray(parsed) && parsed.length) payload.saved = parsed;
    } catch {}
  }
  if (archiveRaw) {
    try {
      const parsed = JSON.parse(archiveRaw);
      if (Array.isArray(parsed) && parsed.length) payload.archive = parsed;
    } catch {}
  }
  if (streakRaw) {
    try {
      payload.streak = JSON.parse(streakRaw);
    } catch {}
  }

  if (Object.keys(payload).length) {
    await cloudMigrateLocalData(token, payload);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: 'loading', user: null });
  const [cloudToken, setCloudToken] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const loadSession = async () => {
      const [user, token] = await Promise.all([
        getStoredAuthSession(),
        SecureStore.getItemAsync(CLOUD_TOKEN_KEY).catch(() => null),
      ]);

      if (!mounted) return;
      setState(user ? { status: 'authenticated', user } : { status: 'unauthenticated', user: null });
      if (token) setCloudToken(token);
    };

    loadSession().catch(() => {
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

  const signInWithApple = useCallback(async (credential: AppleCredential) => {
    // Cloud SIWA (verifies identityToken server-side) when proxy is configured
    let cloudResult = null;
    if (PROXY_URL && credential.identityToken) {
      try {
        cloudResult = await cloudSignInWithApple(credential.identityToken, credential.nonce ?? undefined);
        await SecureStore.setItemAsync(CLOUD_TOKEN_KEY, cloudResult.token);
        setCloudToken(cloudResult.token);
      } catch {
        // Cloud auth failed — continue with local auth only
      }
    }

    // Always maintain local account for offline use and existing UI compatibility
    const user = await signInWithAppleLocal(credential);
    setState({ status: 'authenticated', user });

    // On first cloud sign-in, upload any existing local data (fire-and-forget)
    if (cloudResult?.isNewUser && cloudResult.token) {
      uploadLocalDataToCloud(cloudResult.token).catch(() => {});
    }
  }, []);

  const signInWithGoogle = useCallback(async (credential: GoogleCredential & { idToken: string }) => {
    let cloudResult = null;
    if (PROXY_URL && credential.idToken) {
      try {
        cloudResult = await cloudSignInWithGoogle(credential.idToken);
        await SecureStore.setItemAsync(CLOUD_TOKEN_KEY, cloudResult.token);
        setCloudToken(cloudResult.token);
      } catch {
        // Cloud auth failed — continue with local auth only
      }
    }
    const user = await signInWithGoogleLocal(credential);
    setState({ status: 'authenticated', user });
    if (cloudResult?.isNewUser && cloudResult.token) {
      uploadLocalDataToCloud(cloudResult.token).catch(() => {});
    }
  }, []);

  const signInWithFacebook = useCallback(async (credential: FacebookCredential & { accessToken: string }) => {
    let cloudResult = null;
    if (PROXY_URL && credential.accessToken) {
      try {
        cloudResult = await cloudSignInWithFacebook(credential.accessToken);
        await SecureStore.setItemAsync(CLOUD_TOKEN_KEY, cloudResult.token);
        setCloudToken(cloudResult.token);
      } catch {
        // Cloud auth failed — continue with local auth only
      }
    }
    const user = await signInWithFacebookLocal(credential);
    setState({ status: 'authenticated', user });
    if (cloudResult?.isNewUser && cloudResult.token) {
      uploadLocalDataToCloud(cloudResult.token).catch(() => {});
    }
  }, []);

  const signOut = useCallback(async () => {
    if (cloudToken) {
      cloudSignOut(cloudToken); // fire-and-forget
      await SecureStore.deleteItemAsync(CLOUD_TOKEN_KEY).catch(() => {});
      setCloudToken(null);
    }
    await signOutLocalAccount();
    setState({ status: 'unauthenticated', user: null });
  }, [cloudToken]);

  const updateProfile = useCallback(async (
    updates: { name?: string; currentPassword?: string; newPassword?: string },
  ) => {
    const currentUser = state.user;
    if (!currentUser) throw new Error('Not signed in.');
    const updated = await updateLocalAccount(currentUser.id, updates);
    setState({ status: 'authenticated', user: updated });
  }, [state.user]);

  const value = useMemo(
    () => ({
      state,
      user: state.user,
      token: cloudToken,
      signIn,
      signUp,
      signInWithApple,
      signInWithGoogle,
      signInWithFacebook,
      signOut,
      updateProfile,
    }),
    [state, cloudToken, signIn, signUp, signInWithApple, signInWithGoogle, signInWithFacebook, signOut, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
