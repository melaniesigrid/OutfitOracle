import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
// import * as AppleAuthentication from 'expo-apple-authentication'; // requires paid Apple Developer account
// import * as ExpoCrypto from 'expo-crypto'; // only needed for Apple Sign In
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

WebBrowser.maybeCompleteAuthSession();

type AuthMode = 'login' | 'create';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const FACEBOOK_APP_ID = process.env.EXPO_PUBLIC_FACEBOOK_APP_ID;

type AuthStyles = ReturnType<typeof makeStyles>;

function GoogleGMark({ styles }: { styles: AuthStyles }) {
  return (
    <View
      style={styles.googleLogo}
      accessibilityElementsHidden
      importantForAccessibility="no"
      pointerEvents="none"
    >
      <View style={styles.googleLogoRing} />
      <View style={styles.googleLogoCutout} />
      <View style={styles.googleLogoStem} />
    </View>
  );
}

function SocialSignInButton({
  styles,
  label,
  accessibilityLabel,
  icon,
  disabled,
  onPress,
}: {
  styles: AuthStyles;
  label: string;
  accessibilityLabel: string;
  icon: React.ReactNode;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [styles.socialBtn, pressed && styles.socialBtnPressed, disabled && styles.submitBtnDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
    >
      <View style={styles.socialBtnIconSlot} pointerEvents="none">
        {icon}
      </View>
      <Text style={styles.socialBtnText}>{label}</Text>
    </Pressable>
  );
}

export function AuthScreen() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const { signIn, signUp, signInWithGoogle, signInWithFacebook } = useAuth();

  const [showEmail, setShowEmail] = useState(false);
  const [mode, setMode] = useState<AuthMode>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);

  // ── Google OAuth ──
  const [_googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (googleResponse?.type !== 'success') return;
    const { authentication } = googleResponse;
    if (!authentication?.idToken) return;
    setSubmitting(true);
    setError(null);
    signInWithGoogle({
      userId: '', // resolved server-side from idToken sub claim
      email: null,
      name: null,
      idToken: authentication.idToken,
    })
      .then(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      .catch(e => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(e instanceof Error ? e.message : 'Google sign-in failed. Try again.');
      })
      .finally(() => setSubmitting(false));
  }, [googleResponse, signInWithGoogle]);

  // ── Facebook OAuth ──
  const [_fbRequest, fbResponse, fbPromptAsync] = Facebook.useAuthRequest({
    clientId: FACEBOOK_APP_ID ?? '',
  });

  useEffect(() => {
    if (fbResponse?.type !== 'success') return;
    const { authentication } = fbResponse;
    if (!authentication?.accessToken) return;
    setSubmitting(true);
    setError(null);
    signInWithFacebook({
      userId: '', // resolved server-side from access token
      email: null,
      name: null,
      accessToken: authentication.accessToken,
    })
      .then(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success))
      .catch(e => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError(e instanceof Error ? e.message : 'Facebook sign-in failed. Try again.');
      })
      .finally(() => setSubmitting(false));
  }, [fbResponse, signInWithFacebook]);

  const isCreate = mode === 'create';
  const disabled = submitting || !email.trim() || !password || (isCreate && !name.trim());

  // handleApple — disabled until paid Apple Developer account is set up
  // async function handleApple() { ... }

  async function submit() {
    if (disabled) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isCreate) {
        await signUp({ name, email, password });
      } else {
        await signIn(email, password);
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e instanceof Error ? e.message : 'The Oracle could not verify you. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    Haptics.selectionAsync();
    setMode(nextMode);
    setError(null);
    setShowForgotNote(false);
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={colors.bgDark} />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.eyebrow}>OUTFIT ORACLE</Text>
            <Text style={styles.title}>Join the Court</Text>
            <Text style={styles.note}>
              Save your profile, looks, and Oracle preferences on this device.
            </Text>
          </View>

          {/* ── Social sign-in buttons ── */}
          {/* Apple Sign In — re-enable once enrolled in paid Apple Developer Program
          <SocialSignInButton
            styles={styles}
            label="Sign in with Apple"
            accessibilityLabel="Sign in with Apple"
            icon={<MaterialCommunityIcons name="apple" size={22} color="#0D0B08" />}
            disabled={submitting}
            onPress={handleApple}
          />
          */}

          {GOOGLE_CLIENT_ID ? (
            <SocialSignInButton
              styles={styles}
              label="Sign in with Google"
              accessibilityLabel="Sign in with Google"
              icon={<GoogleGMark styles={styles} />}
              disabled={submitting}
              onPress={() => { Haptics.selectionAsync(); googlePromptAsync(); }}
            />
          ) : null}

          {FACEBOOK_APP_ID ? (
            <SocialSignInButton
              styles={styles}
              label="Sign in with Facebook"
              accessibilityLabel="Sign in with Facebook"
              icon={<MaterialCommunityIcons name="facebook" size={22} color="#1877F2" />}
              disabled={submitting}
              onPress={() => { Haptics.selectionAsync(); fbPromptAsync(); }}
            />
          ) : null}

          {error ? (
            <View style={styles.errorRow}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color={colors.scarletFg} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Secondary: Email / password ── */}
          {!showEmail ? (
            <Pressable
              style={styles.emailToggle}
              onPress={() => { Haptics.selectionAsync(); setShowEmail(true); }}
              accessibilityRole="button"
              accessibilityLabel="Continue with email"
            >
              <MaterialCommunityIcons name="email-outline" size={15} color="rgba(250,249,246,0.48)" />
              <Text style={styles.emailToggleText}>Continue with email</Text>
            </Pressable>
          ) : (
            <>
              <View style={styles.modeRow}>
                {(['create', 'login'] as const).map(opt => {
                  const active = mode === opt;
                  return (
                    <Pressable
                      key={opt}
                      style={[styles.modeBtn, active && styles.modeBtnActive]}
                      onPress={() => switchMode(opt)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected: active }}
                      accessibilityLabel={opt === 'create' ? 'Create account' : 'Log in'}
                    >
                      <Text style={[styles.modeText, active && styles.modeTextActive]}>
                        {opt === 'create' ? 'CREATE' : 'LOGIN'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <View style={styles.form}>
                {isCreate ? (
                  <View style={styles.field}>
                    <Text style={styles.label}>NAME</Text>
                    <TextInput
                      style={styles.input}
                      value={name}
                      onChangeText={setName}
                      placeholder="Melanie"
                      placeholderTextColor="rgba(250,249,246,0.28)"
                      autoCapitalize="words"
                      returnKeyType="next"
                      textContentType="name"
                      accessibilityLabel="Name"
                    />
                  </View>
                ) : null}

                <View style={styles.field}>
                  <Text style={styles.label}>EMAIL</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="rgba(250,249,246,0.28)"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    returnKeyType="next"
                    textContentType="emailAddress"
                    accessibilityLabel="Email"
                  />
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="At least 8 characters"
                    placeholderTextColor="rgba(250,249,246,0.28)"
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="done"
                    textContentType={isCreate ? 'newPassword' : 'password'}
                    onSubmitEditing={submit}
                    accessibilityLabel="Password"
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.submitBtn,
                    pressed && !disabled && styles.submitBtnPressed,
                    disabled && styles.submitBtnDisabled,
                  ]}
                  onPress={submit}
                  disabled={disabled}
                  accessibilityRole="button"
                  accessibilityLabel={isCreate ? 'Create account' : 'Log in'}
                  accessibilityState={{ disabled }}
                >
                  <Text style={styles.submitText}>
                    {submitting ? 'PLEASE WAIT...' : isCreate ? 'CREATE ACCOUNT' : 'LOGIN'}
                  </Text>
                  {!submitting ? <MaterialCommunityIcons name="arrow-right" size={15} color="#0D0B08" /> : null}
                </Pressable>
              </View>

              {!isCreate && (
                <View style={styles.forgotWrapper}>
                  <Pressable onPress={() => setShowForgotNote(v => !v)} accessibilityRole="button" accessibilityLabel="Forgot password">
                    <Text style={styles.forgotLink}>Forgot your password?</Text>
                  </Pressable>
                  {showForgotNote && (
                    <Text style={styles.forgotNote}>
                      Password recovery isn't available for local accounts — your credentials are stored only on this device, never on a server.
                      {'\n\n'}Try your password again. If you've forgotten it, use Settings → Reset all data to start fresh. This will erase all saved data on this device.
                    </Text>
                  )}
                </View>
              )}
            </>
          )}

          <Text style={styles.localNote}>
            Social sign-in syncs your profile and looks across devices.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: colors.bgDark,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 56,
      minHeight: '100%',
      justifyContent: 'center',
    },
    header: {
      marginBottom: spacing.xl,
    },
    eyebrow: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 3,
      color: 'rgba(250,249,246,0.40)',
      marginBottom: spacing.md,
    },
    title: {
      fontFamily: fonts.display,
      fontSize: 48,
      lineHeight: 50,
      letterSpacing: -0.8,
      color: '#FAF9F6',
      marginBottom: spacing.sm,
    },
    note: {
      fontFamily: fonts.serif,
      fontSize: 17,
      lineHeight: 24,
      color: 'rgba(250,249,246,0.58)',
    },
    socialBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      width: '100%',
      height: 52,
      backgroundColor: '#FAF9F6',
      marginBottom: spacing.sm,
      position: 'relative',
    },
    socialBtnPressed: {
      opacity: 0.82,
    },
    socialBtnIconSlot: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 64,
      alignItems: 'center',
      justifyContent: 'center',
    },
    socialBtnText: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: Platform.OS === 'ios' ? '600' : '500',
      letterSpacing: 0,
      color: '#0D0B08',
    },
    googleLogo: {
      width: 22,
      height: 22,
      position: 'relative',
    },
    googleLogoRing: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 3,
      borderTopColor: '#EA4335',
      borderRightColor: '#4285F4',
      borderBottomColor: '#34A853',
      borderLeftColor: '#FBBC05',
    },
    googleLogoCutout: {
      position: 'absolute',
      right: -1,
      top: 6,
      width: 9,
      height: 10,
      backgroundColor: '#FAF9F6',
    },
    googleLogoStem: {
      position: 'absolute',
      right: 1,
      top: 9,
      width: 10,
      height: 3,
      backgroundColor: '#4285F4',
    },
    dividerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.xs,
      marginBottom: spacing.md,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: 'rgba(250,249,246,0.12)',
    },
    dividerText: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 1,
      color: 'rgba(250,249,246,0.28)',
    },
    emailToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: 'rgba(250,249,246,0.16)',
      marginBottom: spacing.md,
    },
    emailToggleText: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 1.5,
      color: 'rgba(250,249,246,0.48)',
    },
    modeRow: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: 'rgba(250,249,246,0.16)',
      marginBottom: spacing.lg,
    },
    modeBtn: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 12,
    },
    modeBtnActive: {
      backgroundColor: '#FAF9F6',
    },
    modeText: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 2,
      color: 'rgba(250,249,246,0.48)',
    },
    modeTextActive: {
      color: '#0D0B08',
    },
    form: {
      gap: spacing.md,
    },
    field: {
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(250,249,246,0.16)',
      paddingBottom: spacing.xs,
    },
    label: {
      fontFamily: fonts.mono,
      fontSize: 10,
      letterSpacing: 2.2,
      color: 'rgba(250,249,246,0.36)',
      marginBottom: spacing.xs,
    },
    input: {
      fontFamily: fonts.display,
      fontSize: 25,
      color: '#FAF9F6',
      paddingVertical: 8,
      letterSpacing: -0.3,
    },
    errorRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      backgroundColor: colors.scarletDim,
      borderLeftWidth: 2,
      borderLeftColor: colors.scarletFg,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    errorText: {
      flex: 1,
      fontFamily: fonts.mono,
      fontSize: 11,
      lineHeight: 16,
      color: 'rgba(250,249,246,0.76)',
    },
    submitBtn: {
      marginTop: spacing.sm,
      backgroundColor: '#FAF9F6',
      paddingVertical: 16,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    submitBtnPressed: {
      opacity: 0.82,
    },
    submitBtnDisabled: {
      opacity: 0.42,
    },
    submitText: {
      fontFamily: fonts.monoMedium,
      fontSize: 12,
      letterSpacing: 2,
      color: '#0D0B08',
    },
    forgotWrapper: {
      marginTop: spacing.sm,
      gap: spacing.sm,
    },
    forgotLink: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 0.5,
      color: 'rgba(250,249,246,0.42)',
      textDecorationLine: 'underline',
    },
    forgotNote: {
      fontFamily: fonts.mono,
      fontSize: 11,
      lineHeight: 17,
      color: 'rgba(250,249,246,0.50)',
      backgroundColor: 'rgba(250,249,246,0.05)',
      borderLeftWidth: 2,
      borderLeftColor: 'rgba(250,249,246,0.16)',
      padding: spacing.sm,
    },
    localNote: {
      fontFamily: fonts.mono,
      fontSize: 10,
      lineHeight: 15,
      color: 'rgba(250,249,246,0.30)',
      marginTop: spacing.xl,
      textAlign: 'center',
    },
  });
}
