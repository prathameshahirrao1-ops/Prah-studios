import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { RootTabs } from './RootTabs';

export type RootNavigatorParamList = {
  Splash: undefined;
  Welcome: undefined;
  ProfileSetup: undefined;
  MainApp: undefined;
};

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="MainApp" component={RootTabs} options={{ animation: 'fade' }} />
    </Stack.Navigator>
  );
}
