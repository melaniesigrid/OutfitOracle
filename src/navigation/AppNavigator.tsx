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
import { TabNavigator } from './TabNavigator';
import { OraclePersonality } from '../hooks/useStyleProfile';

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

  const completeOnboarding = async () => {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    setOnboardingDone(true);
  };

  if (onboardingDone === null) return null;

  if (!onboardingDone) {
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
        onSkip={() => {
          profileCtx.skip();
          completeOnboarding();
        }}
      />
    );
  }

  return <MainStack />;
}
