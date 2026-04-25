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
// onboarding flow. The auth-aware logic below ALSO routes correctly without
// this — it's just here so reloads on the preview land on MainApp directly
// while the dev account is logged in.
const DEV_SKIP_ONBOARDING = false;

export function RootNavigator() {
  const { status } = useAuth();

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface }}>
        <ActivityIndicator color={colors.textPrimary} />
      </View>
    );
  }

  // Pick the starting screen based on auth state.
  //   signed-out      → Splash → Welcome → SignIn
  //   needs-profile   → ProfileSetup (self-serve user without profile yet)
  //   ready           → MainApp
  let initialRoute: keyof RootNavigatorParamList;
  if (DEV_SKIP_ONBOARDING) {
    initialRoute = 'MainApp';
  } else if (status === 'ready') {
    initialRoute = 'MainApp';
  } else if (status === 'needs-profile') {
    initialRoute = 'ProfileSetup';
  } else {
    initialRoute = 'Splash';
  }

  return (
    <Stack.Navigator
      // The key forces the navigator to remount when auth status changes,
      // so the new initialRoute actually takes effect on sign-in/sign-out.
      key={status}
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false, animation: 'fade' }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="SignIn" component={SignInScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="MainApp" component={RootTabs} options={{ animation: 'fade' }} />
    </Stack.Navigator>
  );
}
