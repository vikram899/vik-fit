import React from 'react';
import { View, Text } from 'react-native';
import { useTheme } from '@theme/index';

interface ProfileStatItemProps {
  label: string;
  value: string;
}

export default function ProfileStatItem({ label, value }: ProfileStatItemProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      }}
    >
      <Text style={{ ...typography.body, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ ...typography.label, color: colors.textPrimary }}>{value}</Text>
    </View>
  );
}
