import React, { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../../components/Text';
import { colors, radius, spacing } from '../../theme';
import { HomeStateKey } from '../../data/homeState';

/**
 * Dev-only chip at the top of Home — lets us demo all four home states
 * without waiting for real clock time. Will be removed before production.
 */
export function DevStateSwitcher({
  active,
  onPick,
}: {
  active: HomeStateKey | 'auto';
  onPick: (key: HomeStateKey | 'auto') => void;
}) {
  const [open, setOpen] = useState(false);

  const OPTIONS: { key: HomeStateKey | 'auto'; label: string }[] = [
    { key: 'auto', label: 'Real time' },
    { key: 'class_ongoing', label: 'Class ongoing' },
    { key: 'post_class', label: 'Post-class summary' },
    { key: 'hw_pending', label: 'Homework pending' },
    { key: 'enrolled_idle', label: 'Between classes' },
  ];

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => setOpen((v) => !v)}
        style={({ pressed }) => [styles.chip, pressed && { opacity: 0.85 }]}
      >
        <Ionicons name="flask-outline" size={14} color={colors.textPrimary} />
        <Text variant="small" style={{ fontWeight: '600', marginHorizontal: spacing.xs }}>
          Dev · {labelFor(active)}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={14}
          color={colors.textMuted}
        />
      </Pressable>

      {open && (
        <View style={styles.menu}>
          {OPTIONS.map((o) => (
            <Pressable
              key={o.key}
              onPress={() => {
                onPick(o.key);
                setOpen(false);
              }}
              style={({ pressed }) => [
                styles.menuItem,
                o.key === active && styles.menuItemActive,
                pressed && { opacity: 0.8 },
              ]}
            >
              <Text
                variant="small"
                tone={o.key === active ? 'inverse' : 'primary'}
                style={{ fontWeight: o.key === active ? '600' : '400' }}
              >
                {o.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function labelFor(k: HomeStateKey | 'auto'): string {
  switch (k) {
    case 'auto': return 'Real time';
    case 'class_ongoing': return 'Class ongoing';
    case 'post_class': return 'Post-class';
    case 'hw_pending': return 'HW pending';
    case 'enrolled_idle': return 'Between classes';
  }
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
    zIndex: 100,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    gap: 2,
  },
  menu: {
    position: 'absolute',
    top: 32,
    left: 0,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuItemActive: {
    backgroundColor: colors.primary,
  },
});
