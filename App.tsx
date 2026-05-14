import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { Appearance, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { enableScreens } from 'react-native-screens';
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
import * as SplashScreen from 'expo-splash-screen';
import * as Sentry from '@sentry/react-native';
import { AppDataProvider } from './src/contexts/AppContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme';

enableScreens();
const _appearanceSub = Appearance.addChangeListener(() => {});
SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN ?? '',
  enabled: !__DEV__ && !!process.env.EXPO_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.05,
});

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
  });

  // If fonts fail to load, dismiss the splash so the app isn't bricked.
  useEffect(() => {
    if (fontError) SplashScreen.hideAsync();
  }, [fontError]);

  if (!fontsLoaded && !fontError) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppDataProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AppDataProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(App);
