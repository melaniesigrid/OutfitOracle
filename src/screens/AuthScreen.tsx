import React, { useMemo, useState } from 'react';
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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { AppColors, AppFonts, spacing } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

type AuthMode = 'login' | 'create';

export function AuthScreen() {
  const { colors, fonts } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState<AuthMode>('create');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isCreate = mode === 'create';
  const disabled = submitting || !email.trim() || !password || (isCreate && !name.trim());

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
      setError(e instanceof Error ? e.message : 'Authentication failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(nextMode: AuthMode) {
    Haptics.selectionAsync();
    setMode(nextMode);
    setError(null);
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
            <Text style={styles.title}>{isCreate ? 'Create Account' : 'Welcome Back'}</Text>
            <Text style={styles.note}>
              {isCreate
                ? 'Save your profile, archive, and Oracle preferences on this device.'
                : 'Log in to continue with your saved Oracle profile on this device.'}
            </Text>
          </View>

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

            {error ? (
              <View style={styles.errorRow}>
                <MaterialCommunityIcons name="alert-circle-outline" size={15} color={colors.scarletFg} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

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

          <Text style={styles.localNote}>
            This local account is stored on this device. Cloud sync and password recovery require hosted auth.
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
    localNote: {
      fontFamily: fonts.mono,
      fontSize: 10,
      lineHeight: 15,
      color: 'rgba(250,249,246,0.30)',
      marginTop: spacing.xl,
    },
  });
}
