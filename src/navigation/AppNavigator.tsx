import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAppData } from '../contexts/AppContext';
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
  const [onboardingDone, setOnboardingDone] = useState<boolean | null>(null);
  const [step, setStep] = useState<OnboardingStep>('welcome');
  const [pendingPersonality, setPendingPersonality] = useState<OraclePersonality>('editorial');

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then(val => {
      setOnboardingDone(val === 'true');
    });
  }, []);

  // Returning skipped users: once both sources have loaded, jump straight to the style step
  useEffect(() => {
    if (onboardingDone === true && (profileCtx.status === 'not-set' || profileCtx.status === 'skipped')) {
      setStep('style');
    }
  }, [onboardingDone, profileCtx.status]);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
    trackOnboardingCompleted();
  };

  // Wait for both AsyncStorage and profile context to hydrate
  if (onboardingDone === null || profileCtx.status === 'loading') return null;

  // Gate: show onboarding if fresh install OR returning user who previously skipped
  const needsOnboarding = !onboardingDone
    || profileCtx.status === 'not-set'
    || profileCtx.status === 'skipped';

  if (needsOnboarding) {
    if (step === 'welcome') {
      return <WelcomeScreen onContinue={() => setStep('carousel')} />;
    }
    if (step === 'carousel') {
      return (
        <OnboardingCarousel
          onContinue={() => setStep('personality')}
          onSkip={() => setStep('personality')}
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

  return <MainStack />;
}
