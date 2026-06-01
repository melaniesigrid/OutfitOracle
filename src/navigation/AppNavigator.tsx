import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';
import { useAppData } from '../contexts/AppContext';
import { useAuth } from '../contexts/AuthContext';
import { BadgeToast } from '../components/BadgeToast';
import { Confetti } from '../components/Confetti';
import { AuthScreen } from '../screens/AuthScreen';
import { WelcomeScreen } from '../screens/WelcomeScreen';
import { OnboardingCarousel } from '../screens/OnboardingCarousel';
import { PersonalityScreen } from '../screens/PersonalityScreen';
import { StyleOnboarding } from '../components/StyleOnboarding';
import { ProfileEditScreen } from '../screens/ProfileEditScreen';
import { MapScreen } from '../screens/MapScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TabNavigator } from './TabNavigator';
import { OraclePersonality } from '../hooks/useStyleProfile';
import { trackOnboardingCompleted } from '../services/analytics';

const ONBOARDING_KEY = '@onboarding_complete';

type OnboardingStep = 'welcome' | 'carousel' | 'personality' | 'style';

const Stack = createNativeStackNavigator();

function BadgeToastPortal() {
  const { newBadgeQueue, dismissBadgeToast } = useAppData();
  const badge = newBadgeQueue[0];
  return (
    <>
      <Confetti visible={!!badge} />
      <BadgeToast badge={badge} onDismiss={dismissBadgeToast} />
    </>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { profileCtx } = useAppData();
  const { state: authState } = useAuth();
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [pendingPersonality, setPendingPersonality] = useState<OraclePersonality>('editorial');

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setOnboardingDone(val === 'true');
    }).catch(() => setOnboardingDone(false));
  }, []);

  // Returning users with no profile: jump straight to the style step (skip welcome/carousel/personality)
  useEffect(() => {
    if (onboardingDone === true && profileCtx.profileState.status === 'not-set') {
      setStep('style');
    }
  }, [onboardingDone, profileCtx.profileState.status]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
    trackOnboardingCompleted();
  };

  const hydrated = onboardingDone !== null && profileCtx.profileState.status !== 'loading' && authState.status !== 'loading';

  // Hide splash only after both AsyncStorage and profile context have hydrated,
  // so the user never sees a blank frame between splash dismiss and first screen.
  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  if (!hydrated) return null;

  // Gate: show welcome + onboarding for fresh installs BEFORE auth
  if (!onboardingDone) {
    if (step === 'welcome') {
      return <WelcomeScreen onContinue={() => setStep('carousel')} />;
    }
    if (step === 'carousel') {
      return (
        <OnboardingCarousel
          onContinue={() => setStep('personality')}
        />
      );
    }
    if (step === 'personality') {
      return (
        <PersonalityScreen
          onSelect={p => {
            setPendingPersonality(p);
            setStep('style');
          }}
        />
      );
    }
    // step === 'style'
    return (
      <StyleOnboarding
        onSave={profile => {
          profileCtx.saveProfile({ ...profile, personality: pendingPersonality });
          completeOnboarding();
        }}
      />
    );
  }

  // After onboarding, require auth
  if (authState.status === 'unauthenticated') {
    return <AuthScreen />;
  }

  // Authenticated user without a style profile — show questionnaire
  if (profileCtx.profileState.status === 'not-set') {
    return (
      <StyleOnboarding
        onSave={profile => {
          profileCtx.saveProfile({ ...profile, personality: pendingPersonality });
          completeOnboarding();
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <MainStack />
      <BadgeToastPortal />
    </View>
  );
}
