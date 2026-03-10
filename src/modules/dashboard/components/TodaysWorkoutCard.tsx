import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { LinearGradient } from 'expo-linear-gradient';
import { Calendar, Dumbbell, CheckCircle2 } from 'lucide-react-native';

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
  onBrowse: () => void;
}

export default function TodaysWorkoutCard({ workouts, onStart, onSkip, onBrowse }: TodaysWorkoutCardProps) {
  const { colors, spacing } = useTheme();

  const cardBase = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  };

  // ── Empty state ────────────────────────────────────────────────────────────
  if (workouts.length === 0) {
    return (
      <View style={[cardBase, { marginBottom: spacing.xl }]}>
        <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'], paddingHorizontal: spacing.xl }}>
          {/* Icon circle */}
          <LinearGradient
            colors={['rgba(59,130,246,0.2)', 'rgba(168,85,247,0.2)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              width: 64, height: 64, borderRadius: 32,
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
              marginBottom: spacing.base,
            }}
          >
            <Calendar size={28} color="#3B82F6" />
          </LinearGradient>

          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 6 }}>
            No workouts today
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: spacing.base }}>
            Schedule a workout to stay on track with your goals
          </Text>

          {/* CTA */}
          <TouchableOpacity onPress={onBrowse} activeOpacity={0.85} style={{ overflow: 'hidden', borderRadius: Radius.xl }}>
            <LinearGradient
              colors={['#3B82F6', 'rgba(59,130,246,0.8)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ paddingHorizontal: spacing.lg, paddingVertical: 9 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Browse Workouts</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Scheduled workouts ─────────────────────────────────────────────────────
  return (
    <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
      {workouts.map((workout) => (
        <View key={workout.id} style={[cardBase, { padding: spacing.base }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            {/* Icon */}
            <View style={{
              width: 48, height: 48, borderRadius: Radius.xl,
              backgroundColor: workout.isDone ? 'rgba(132,204,22,0.2)' : 'rgba(59,130,246,0.2)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {workout.isDone
                ? <CheckCircle2 size={22} color="#84CC16" />
                : <Dumbbell size={22} color="#3B82F6" />}
            </View>

            {/* Name + subtitle */}
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 14, fontWeight: '500',
                color: workout.isDone ? 'rgba(255,255,255,0.5)' : colors.textPrimary,
                textDecorationLine: workout.isDone ? 'line-through' : 'none',
                marginBottom: 2,
              }}>
                {workout.name}
              </Text>
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {workout.exerciseCount} exercises
              </Text>
            </View>

            {/* Action */}
            {workout.isDone ? (
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#84CC16' }}>Completed ✓</Text>
            ) : (
              <TouchableOpacity
                onPress={() => onStart(workout.id)}
                activeOpacity={0.85}
                style={{ overflow: 'hidden', borderRadius: Radius.xl }}
              >
                <LinearGradient
                  colors={['#3B82F6', 'rgba(59,130,246,0.8)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ paddingHorizontal: 14, paddingVertical: 8 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#fff' }}>Start</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}
