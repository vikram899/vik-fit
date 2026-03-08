import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { MealCategory } from '@shared/types/common';

const CATEGORIES: { label: string; value: MealCategory | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Breakfast', value: 'breakfast' },
  { label: 'Lunch', value: 'lunch' },
  { label: 'Dinner', value: 'dinner' },
  { label: 'Snack', value: 'snack' },
];

interface CategoryTabsProps {
  selected: MealCategory | 'all';
  onSelect: (cat: MealCategory | 'all') => void;
}

export default function CategoryTabs({ selected, onSelect }: CategoryTabsProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
      {CATEGORIES.map((cat) => {
        const active = selected === cat.value;
        return (
          <TouchableOpacity
            key={cat.value}
            onPress={() => onSelect(cat.value)}
            style={{
              paddingHorizontal: spacing.base,
              paddingVertical: spacing.sm,
              borderRadius: Radius.full,
              backgroundColor: active ? colors.brandPrimary : colors.surface,
              borderWidth: 1,
              borderColor: active ? colors.brandPrimary : colors.border,
            }}
          >
            <Text
              style={{
                ...typography.label,
                color: active ? colors.white : colors.textSecondary,
              }}
            >
              {cat.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}
