import 'react-native-gesture-handler';
import React, { useEffect, useRef } from 'react';
import { Appearance, View } from 'react-native';
import { NavigationContainerRef, createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
import * as Notifications from 'expo-notifications';
import { useFonts } from 'expo-font';
import {
  CormorantGaramond_700Bold_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_300Light,
  CormorantGaramond_400Regular_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  IBMPlexMono_400Regular,
  IBMPlexMono_500Medium,
} from '@expo-google-fonts/ibm-plex-mono';
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from '@expo-google-fonts/space-mono';
import {
  Baloo2_700Bold,
  Baloo2_800ExtraBold,
} from '@expo-google-fonts/baloo-2';
import { Knewave_400Regular } from '@expo-google-fonts/knewave';
import {
  Montserrat_500Medium,
  Montserrat_700Bold,
  Montserrat_900Black,
} from '@expo-google-fonts/montserrat';
import {
  Syne_400Regular,
  Syne_600SemiBold,
  Syne_700Bold,
  Syne_800ExtraBold,
} from '@expo-google-fonts/syne';
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { AppDataProvider } from './src/contexts/AppContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { TemperatureProvider } from './src/contexts/TemperatureContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

enableScreens();
const _appearanceSub = Appearance.addChangeListener(() => {});
SplashScreen.preventAutoHideAsync();

// Navigation ref used by notification tap handler (outside React tree)
const navigationRef = createNavigationContainerRef<any>();

// Show notifications while app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

if (!__DEV__ && process.env.EXPO_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.05,
  });
}

function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_700Bold_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_300Light,
    CormorantGaramond_400Regular_Italic,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    Baloo2_700Bold,
    Baloo2_800ExtraBold,
    Knewave_400Regular,
    Montserrat_500Medium,
    Montserrat_700Bold,
    Montserrat_900Black,
    Syne_400Regular,
    Syne_600SemiBold,
    Syne_700Bold,
    Syne_800ExtraBold,
  });

  // If fonts fail to load, dismiss the splash so the app isn't bricked.
  useEffect(() => {
    if (fontError) SplashScreen.hideAsync();
  }, [fontError]);

  // Deep-link: tap on any notification → navigate to Oracle tab
  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      if (navigationRef.isReady()) {
        navigationRef.navigate('Tabs', { screen: 'Oracle' });
      }
    });
    return () => sub.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <TemperatureProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppDataProvider>
              <NavigationContainer ref={navigationRef}>
                <AppNavigator />
              </NavigationContainer>
            </AppDataProvider>
          </AuthProvider>
        </ThemeProvider>
        </TemperatureProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const _sentryActive = !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN;
export default _sentryActive ? Sentry.wrap(App) : App;
