import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/HomeScreen';
import { JourneyScreen } from '../screens/JourneyScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { colors, spacing } from '../theme';

export type RootTabParamList = {
  Journey: undefined;
  Home: undefined;
  Community: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

type IoniconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof RootTabParamList, { active: IoniconName; inactive: IoniconName }> = {
  Journey: { active: 'trail-sign', inactive: 'trail-sign-outline' },
  Home: { active: 'home', inactive: 'home-outline' },
  Community: { active: 'people', inactive: 'people-outline' },
  Profile: { active: 'person', inactive: 'person-outline' },
};

export function RootTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.textPrimary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarItemStyle: { paddingVertical: spacing.xs },
        tabBarIcon: ({ color, focused, size }) => {
          const name = TAB_ICONS[route.name][focused ? 'active' : 'inactive'];
          return <Ionicons name={name} size={size - 2} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Journey" component={JourneyScreen} options={{ tabBarLabel: 'Journey' }} />
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    height: Platform.select({ ios: 84, android: 64 }),
    paddingTop: spacing.xs,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: -2,
  },
});
