import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';

interface WorkoutEntry {
  id: number;
  name: string;
  isDone: boolean;
  exerciseCount: number;
  completedCount: number;
}

interface TodaysWorkoutCardProps {
  workouts: WorkoutEntry[];
  onStart: (workoutTemplateId: number) => void;
  onSkip: (workoutTemplateId: number) => void;
}

const ICON_PALETTE = [
  { bg: '#1E3A5F', color: '#60A5FA', emoji: '🏋️' },
  { bg: '#1A3320', color: '#4ADE80', emoji: '🏃' },
  { bg: '#2D1B5A', color: '#C084FC', emoji: '🧘' },
  { bg: '#3D2A10', color: '#FB923C', emoji: '🚴' },
];

export default function TodaysWorkoutCard({ workouts, onStart, onSkip }: TodaysWorkoutCardProps) {
  const { colors, typography, spacing } = useTheme();

  if (workouts.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
      {workouts.map((workout, index) => {
        const palette = ICON_PALETTE[index % ICON_PALETTE.length];
        const subtitle = workout.isDone
          ? `${workout.exerciseCount} exercises · Done`
          : workout.completedCount > 0
          ? `${workout.completedCount}/${workout.exerciseCount} exercises · In progress`
          : `${workout.exerciseCount} exercises`;

        return (
          <View key={workout.id}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => onStart(workout.id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface,
                borderRadius: Radius.lg,
                borderWidth: 1,
                borderColor: workout.isDone ? colors.success + '33' : colors.border,
                paddingHorizontal: spacing.base,
                paddingVertical: spacing.base,
              }}
            >
              {/* Icon circle */}
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 26,
                  backgroundColor: palette.bg,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.base,
                }}
              >
                <Text style={{ fontSize: 22 }}>{palette.emoji}</Text>
              </View>

              {/* Name + subtitle */}
              <View style={{ flex: 1 }}>
                <Text style={{ ...typography.body, fontWeight: '700', color: colors.textPrimary, marginBottom: 2 }}>
                  {workout.name}
                </Text>
                <Text style={{ ...typography.caption, color: colors.textTertiary }}>
                  {subtitle}
                </Text>
              </View>

              {/* Right label */}
              <Text
                style={{
                  ...typography.caption,
                  color: workout.isDone ? colors.success : colors.textTertiary,
                  fontWeight: workout.isDone ? '600' : '400',
                  marginLeft: spacing.sm,
                }}
              >
                {workout.isDone ? 'Done ✓' : 'Today'}
              </Text>
            </TouchableOpacity>

            {/* Skip link */}
            {!workout.isDone ? (
              <TouchableOpacity
                onPress={() => onSkip(workout.id)}
                style={{ alignSelf: 'flex-end', paddingVertical: 4, paddingHorizontal: spacing.xs }}
              >
                <Text style={{ ...typography.caption, color: colors.textTertiary }}>
                  Skip today
                </Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </View>
  );
}
