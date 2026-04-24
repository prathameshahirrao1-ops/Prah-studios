import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LevelDetailScreen } from '../screens/profile/LevelDetailScreen';
import { SkillDetailScreen } from '../screens/profile/SkillDetailScreen';
import { AllMyWorksScreen } from '../screens/profile/AllMyWorksScreen';
import { ReferralScreen } from '../screens/profile/ReferralScreen';
import { SettingsScreen } from '../screens/profile/SettingsScreen';
import { NotificationsScreen } from '../screens/profile/NotificationsScreen';
import { AccountScreen } from '../screens/profile/AccountScreen';
import { BillingScreen } from '../screens/profile/BillingScreen';
import { JourneysScreen } from '../screens/profile/JourneysScreen';
import type { SkillType } from '../data/mockSkills';

export type ProfileStackParamList = {
  ProfileMain: undefined;
  LevelDetail: undefined;
  SkillDetail: { skill: SkillType };
  AllMyWorks: undefined;
  Referral: undefined;
  Journeys: undefined;
  Settings: undefined;
  SettingsNotifications: undefined;
  SettingsAccount: undefined;
  SettingsBilling: undefined;
};

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="LevelDetail" component={LevelDetailScreen} />
      <Stack.Screen name="SkillDetail" component={SkillDetailScreen} />
      <Stack.Screen name="AllMyWorks" component={AllMyWorksScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Journeys" component={JourneysScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="SettingsNotifications" component={NotificationsScreen} />
      <Stack.Screen name="SettingsAccount" component={AccountScreen} />
      <Stack.Screen name="SettingsBilling" component={BillingScreen} />
    </Stack.Navigator>
  );
}
