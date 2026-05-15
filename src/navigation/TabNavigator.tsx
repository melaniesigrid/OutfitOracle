import React, { useMemo } from 'react';
import { StyleSheet, Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TodayScreen } from '../screens/TodayScreen';
import { OracleScreen } from '../screens/OracleScreen';
import { YouScreen } from '../screens/YouScreen';
import { AppColors, AppFonts } from '../theme';
import { useTheme } from '../contexts/ThemeContext';
import { useAppData } from '../contexts/AppContext';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Today:  'weather-partly-cloudy',
  Oracle: 'eye-outline',
  You:    'account-outline',
};

export function TabNavigator() {
  const { colors, fonts } = useTheme();
  const styles = useMemo(() => makeStyles(colors, fonts), [colors, fonts]);
  const { oracle } = useAppData();
  const stale = oracle.isFromCache && oracle.cachedAt != null && (Date.now() - oracle.cachedAt > 2 * 60 * 60 * 1000);

  return (
    <Tab.Navigator
      initialRouteName="Today"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: ({ color, size }) => (
          <View>
            <MaterialCommunityIcons name={ICONS[route.name] as any} size={size} color={color} />
            {route.name === 'Oracle' && stale && <View style={styles.tabDot} />}
          </View>
        ),
      })}
    >
      <Tab.Screen name="Today"  component={TodayScreen} />
      <Tab.Screen name="Oracle" component={OracleScreen} />
      <Tab.Screen name="You"    component={YouScreen} />
    </Tab.Navigator>
  );
}

function makeStyles(colors: AppColors, fonts: AppFonts) {
  return StyleSheet.create({
    tabBar: {
      backgroundColor: colors.bg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      elevation: 0,
      shadowOpacity: 0,
      height: Platform.OS === 'ios' ? 84 : 64,
      paddingBottom: Platform.OS === 'ios' ? 28 : 8,
      paddingTop: 8,
    },
    tabLabel: {
      fontFamily: fonts.mono,
      fontSize: 11,
      letterSpacing: 1.5,
      textTransform: 'uppercase',
    },
    tabDot: {
      position: 'absolute',
      top: -1,
      right: -5,
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.scarlet,
    },
  });
}
