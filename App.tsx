import React from 'react';
import { Appearance } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';

// App uses a fixed editorial theme — register a no-op listener to silence
// the "appearanceChanged with no listeners" console warning from RN internals.
Appearance.addChangeListener(() => {});

export default function App() {
  return <HomeScreen />;
}
