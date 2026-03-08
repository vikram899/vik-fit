import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Card } from '@shared/components/ui/Card';
import { Button } from '@shared/components/ui/Button';
import { Badge } from '@shared/components/ui/Badge';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import { getWorkoutSummary } from '../services/workoutLogService';
import { formatDuration } from '@shared/utils/dateUtils';
import { Layout, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutSummary'>;

export default function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { workoutLogId } = route.params;
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getWorkoutSummary>>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const result = await getWorkoutSummary(workoutLogId);
      setSummary(result);
      setLoading(false);
    })();
  }, [workoutLogId]);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brandPrimary} />
      </SafeAreaView>
    );
  }

  const completedSets = summary?.exercises.flatMap((e) => e.sets).filter((s) => s.completed === 1).length ?? 0;
  const totalSets = summary?.exercises.flatMap((e) => e.sets).length ?? 0;
  const duration = summary?.workoutLog.durationSeconds ?? 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: spacing['3xl'] }}>
        <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.base }}>
          <Badge label="Workout Complete" variant="success" style={{ marginBottom: spacing.sm }} />
          <Text style={{ ...typography.screenTitle, color: colors.textPrimary }}>
            {summary?.workoutLog.name ?? 'Workout'}
          </Text>
        </View>

        {/* Stats */}
        <Card style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.base }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ ...typography.statMedium, color: colors.brandPrimary }}>{formatDuration(duration)}</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>Duration</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ ...typography.statMedium, color: colors.textPrimary }}>{summary?.exercises.length ?? 0}</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>Exercises</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ ...typography.statMedium, color: colors.textPrimary }}>{completedSets}/{totalSets}</Text>
            <Text style={{ ...typography.caption, color: colors.textSecondary }}>Sets Done</Text>
          </View>
        </Card>

        {/* Exercise breakdown */}
        {summary?.exercises.map((exercise) => (
          <Card key={exercise.id} style={{ marginBottom: spacing.sm }}>
            <Text style={{ ...typography.label, color: colors.textPrimary, marginBottom: spacing.sm }}>
              Exercise #{exercise.orderIndex + 1}
            </Text>
            {exercise.sets.map((set) => (
              <View key={set.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                <Text style={{ ...typography.caption, color: colors.textSecondary }}>Set {set.setNumber}</Text>
                <Text style={{ ...typography.caption, color: set.completed ? colors.brandPrimary : colors.textTertiary }}>
                  {set.weight ?? 0}kg × {set.reps ?? 0} reps
                </Text>
              </View>
            ))}
          </Card>
        ))}

        <Button
          label="Back to Workouts"
          onPress={() => navigation.navigate('Workouts')}
          style={{ marginTop: spacing.base }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
