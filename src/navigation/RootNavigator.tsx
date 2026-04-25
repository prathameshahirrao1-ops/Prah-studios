import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/onboarding/SplashScreen';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SignInScreen } from '../screens/onboarding/SignInScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { RootTabs } from './RootTabs';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme';

export type RootNavigatorParamList = {
  Splash: undefined;
  Welcome: undefined;
  SignIn: undefined;
  ProfileSetup: undefined;
  MainApp: undefined;
};

const Stack = createNativeStackNavigator<RootNavigatorParamList>();

// DEV: skip the welcome flow on hot-reload. Set to false to test the real
// onboarding flow.
const DEV_SKIP_ONBOARDING = false;

/**
 * Render a different navigator stack per auth status.
 *
 * Conditionally rendering different <Stack.Navigator> trees (rather than one
 * tree with `key={status}`) is the React Navigation v7 recommended pattern
 * for auth flows. NavigationContainer treats each as a fresh navigator, so
 * sign-in/sign-out correctly swaps the screen tree without needing a hard
 * refresh.
 */
export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  if (DEV_SKIP_ONBOARDING || status === 'ready') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="MainApp" component={RootTabs} />
      </Stack.Navigator>
    );
  }

  if (status === 'needs-profile') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      </Stack.Navigator>
    );
  }

  // signed-out → onboarding flow
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ animation: 'slide_from_right' }} />
    </Stack.Navigator>
  );
}
