import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TodayScreen } from '../screens/TodayScreen';
import { OracleScreen } from '../screens/OracleScreen';
import { YouScreen } from '../screens/YouScreen';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS: Record<string, string> = {
  Today:  'weather-partly-cloudy',
  Oracle: 'eye-outline',
  You:    'account-outline',
};

export function TabNavigator() {
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
          <MaterialCommunityIcons
            name={ICONS[route.name] as any}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Today"  component={TodayScreen} />
      <Tab.Screen name="Oracle" component={OracleScreen} />
      <Tab.Screen name="You"    component={YouScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
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
    fontSize: 9,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
