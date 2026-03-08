import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import { WorkoutTemplateRow } from '@database/repositories/workoutRepo';
import { WEEKDAY_LABELS, getCurrentWeekday } from '@shared/utils/dateUtils';
import { Radius } from '@theme/radius';

interface WeeklyScheduleCardProps {
  templates: WorkoutTemplateRow[];
  onDayPress: (template: WorkoutTemplateRow) => void;
}

export default function WeeklyScheduleCard({ templates, onDayPress }: WeeklyScheduleCardProps) {
  const { colors, typography, spacing } = useTheme();
  const today = getCurrentWeekday();
  const templateMap = new Map(templates.map((t) => [t.assignedWeekday, t]));

  return (
    <Card>
      <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.sm }}>
        Weekly Schedule
      </Text>
      <View style={{ flexDirection: 'row', gap: spacing.xs }}>
        {WEEKDAY_LABELS.map((label, day) => {
          const template = templateMap.get(day);
          const isToday = day === today;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => template && onDayPress(template)}
              disabled={!template}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: spacing.sm,
                borderRadius: Radius.sm,
                backgroundColor: isToday
                  ? `${colors.brandPrimary}22`
                  : template
                  ? colors.focused
                  : colors.transparent,
                borderWidth: isToday ? 1 : 0,
                borderColor: colors.brandPrimary,
              }}
            >
              <Text style={{ ...typography.caption, color: isToday ? colors.brandPrimary : colors.textSecondary }}>
                {label}
              </Text>
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: Radius.full,
                  backgroundColor: template ? colors.brandPrimary : colors.border,
                  marginTop: spacing.xs,
                }}
              />
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
}
