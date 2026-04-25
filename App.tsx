import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation/RootNavigator';
import { AuthProvider } from './src/auth/AuthContext';
import { SkillsBridge } from './src/auth/SkillsBridge';
import { StreaksBridge } from './src/auth/StreaksBridge';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SkillsBridge />
        <StreaksBridge />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
