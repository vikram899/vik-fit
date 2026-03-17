import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withDelay, withSpring,
  withRepeat, withSequence, FadeInDown, FadeIn, ZoomIn,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '@theme/index';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import { getWorkoutSummary } from '../services/workoutLogService';
import { formatDuration } from '@shared/utils/dateUtils';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { Trophy, Dumbbell, Clock, Zap, ChevronRight, Star } from 'lucide-react-native';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'WorkoutSummary'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CONFETTI_COLORS = ['#84CC16', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F97316'];

function ConfettiPiece({ x, color, delay, size }: { x: number; color: string; delay: number; size: number }) {
  const translateY = useSharedValue(-40);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);
  const translateX = useSharedValue(0);

  useEffect(() => {
    const drift = (Math.random() - 0.5) * 80;
    translateY.value = withDelay(delay, withTiming(SCREEN_WIDTH * 1.2, { duration: 2200, easing: Easing.in(Easing.quad) }));
    translateX.value = withDelay(delay, withTiming(drift, { duration: 2200 }));
    opacity.value = withDelay(delay, withSequence(
      withTiming(1, { duration: 150 }),
      withDelay(1500, withTiming(0, { duration: 550 }))
    ));
    rotate.value = withDelay(delay, withTiming((Math.random() > 0.5 ? 1 : -1) * 720, { duration: 2200 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const isRect = Math.random() > 0.5;
  return (
    <Animated.View style={[{
      position: 'absolute',
      left: x,
      top: 40,
      width: isRect ? size * 1.6 : size,
      height: size,
      borderRadius: isRect ? 2 : size / 2,
      backgroundColor: color,
    }, style]} />
  );
}

function PRBadge({ value }: { value: string }) {
  const scale = useSharedValue(0.8);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.06), withSpring(1)),
      3,
      false
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={ZoomIn.springify()} style={style}>
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(245,158,11,0.15)',
        borderRadius: 99, paddingHorizontal: 10, paddingVertical: 4,
        borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
      }}>
        <Trophy size={12} color="#F59E0B" />
        <Text style={{ fontSize: 11, fontWeight: '700', color: '#F59E0B', letterSpacing: 0.5 }}>
          PR · {value}
        </Text>
      </View>
    </Animated.View>
  );
}

function StatBox({ value, label, color, delay }: { value: string; label: string; color: string; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).springify()} style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 26, fontWeight: '700', color }}>{value}</Text>
      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{label}</Text>
    </Animated.View>
  );
}

export default function WorkoutSummaryScreen({ navigation, route }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { workoutLogId } = route.params;
  const [summary, setSummary] = useState<Awaited<ReturnType<typeof getWorkoutSummary>>>(null);
  const [loading, setLoading] = useState(true);

  const heroScale = useSharedValue(0.7);
  const heroOpacity = useSharedValue(0);

  useEffect(() => {
    getWorkoutSummary(workoutLogId).then((result) => {
      setSummary(result);
      setLoading(false);
      heroScale.value = withSpring(1, { damping: 12, stiffness: 120 });
      heroOpacity.value = withTiming(1, { duration: 400 });
    });
  }, [workoutLogId]);

  const heroStyle = useAnimatedStyle(() => ({
    transform: [{ scale: heroScale.value }],
    opacity: heroOpacity.value,
  }));

  // Must be before any early return — Rules of Hooks
  const confettiPieces = React.useMemo(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * SCREEN_WIDTH,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      delay: Math.random() * 600,
      size: 6 + Math.random() * 6,
    })),
    []
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#84CC16" size="large" />
      </SafeAreaView>
    );
  }

  const allSets = summary?.exercises.flatMap((e) => e.sets) ?? [];
  const completedSets = allSets.filter((s) => s.completed === 1).length;
  const totalSets = allSets.length;
  const duration = summary?.workoutLog.durationSeconds ?? 0;
  const prExercises = summary?.exercises.filter((e) => e.isPR) ?? [];
  const hasPRs = prExercises.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      {/* Confetti layer */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
        {confettiPieces.map((p) => (
          <ConfettiPiece key={p.id} x={p.x} color={p.color} delay={p.delay} size={p.size} />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingBottom: 100 + insets.bottom,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <Animated.View style={[{ alignItems: 'center', paddingTop: spacing.xl, paddingBottom: spacing.xl }, heroStyle]}>
          <View style={{
            width: 88, height: 88, borderRadius: 44,
            backgroundColor: 'rgba(132,204,22,0.15)',
            borderWidth: 2, borderColor: 'rgba(132,204,22,0.4)',
            alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <Text style={{ fontSize: 42 }}>🎉</Text>
          </View>
          <Text style={{ fontSize: 28, fontWeight: '800', color: '#fff', textAlign: 'center', marginBottom: 6 }}>
            Workout Complete!
          </Text>
          <Text style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', textAlign: 'center' }}>
            {summary?.workoutLog.name}
          </Text>
          {hasPRs && (
            <Animated.View entering={FadeIn.delay(500)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12 }}>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#F59E0B' }}>
                {prExercises.length} new Personal Record{prExercises.length > 1 ? 's' : ''}!
              </Text>
              <Star size={14} color="#F59E0B" fill="#F59E0B" />
            </Animated.View>
          )}
        </Animated.View>

        {/* Stats row */}
        <Animated.View
          entering={FadeInDown.delay(200).springify()}
          style={{
            flexDirection: 'row',
            backgroundColor: colors.backgroundSecondary,
            borderRadius: Radius.lg, padding: spacing.base,
            borderWidth: 1, borderColor: colors.border,
            marginBottom: spacing.base,
            overflow: 'hidden',
          }}
        >
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(132,204,22,0.05)' }} />
          <StatBox value={formatDuration(duration)} label="Duration" color="#84CC16" delay={300} />
          <View style={{ width: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          <StatBox value={String(summary?.exercises.length ?? 0)} label="Exercises" color="#3B82F6" delay={400} />
          <View style={{ width: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          <StatBox value={`${completedSets}/${totalSets}`} label="Sets Done" color="#fff" delay={500} />
        </Animated.View>

        {/* PRs section */}
        {hasPRs && (
          <Animated.View entering={FadeInDown.delay(350).springify()} style={{ marginBottom: spacing.base }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Trophy size={16} color="#F59E0B" />
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>
                Personal Records
              </Text>
            </View>
            <View style={{
              backgroundColor: 'rgba(245,158,11,0.08)',
              borderRadius: Radius.lg,
              borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)',
              overflow: 'hidden',
            }}>
              {prExercises.map((ex, i) => (
                <View
                  key={ex.id}
                  style={{
                    flexDirection: 'row', alignItems: 'center',
                    paddingHorizontal: spacing.base, paddingVertical: 14,
                    borderBottomWidth: i < prExercises.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(245,158,11,0.15)',
                  }}
                >
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: 'rgba(245,158,11,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Trophy size={16} color="#F59E0B" />
                  </View>
                  <Text style={{ flex: 1, fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>
                    {ex.exerciseName}
                  </Text>
                  <PRBadge value={ex.prValue} />
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Exercise breakdown */}
        <Animated.View entering={FadeInDown.delay(500).springify()}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginBottom: 10 }}>
            Exercise Breakdown
          </Text>
          {summary?.exercises.map((exercise, idx) => {
            const exCompleted = exercise.sets.filter((s) => s.completed === 1).length;
            const type = exercise.exerciseType;
            const isDuration = ['cardio', 'flexibility', 'endurance', 'warmup'].includes(type);
            const isTimeReps = type === 'hiit';
            const isBodyweight = type === 'bodyweight';

            return (
              <View
                key={exercise.id}
                style={{
                  backgroundColor: colors.backgroundSecondary,
                  borderRadius: Radius.lg,
                  borderWidth: 1,
                  borderColor: exercise.isPR ? 'rgba(245,158,11,0.3)' : colors.border,
                  marginBottom: spacing.sm,
                  overflow: 'hidden',
                }}
              >
                <View style={{
                  paddingHorizontal: spacing.base,
                  paddingTop: spacing.base,
                  paddingBottom: exercise.sets.length > 0 ? spacing.sm : spacing.base,
                  flexDirection: 'row', alignItems: 'center', gap: 10,
                }}>
                  <View style={{
                    width: 36, height: 36, borderRadius: 18,
                    backgroundColor: exercise.isPR ? 'rgba(245,158,11,0.15)' : 'rgba(59,130,246,0.1)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    {exercise.isPR
                      ? <Trophy size={16} color="#F59E0B" />
                      : <Dumbbell size={16} color="#3B82F6" />
                    }
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{exercise.exerciseName}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                      {exCompleted}/{exercise.sets.length} sets completed
                    </Text>
                  </View>
                  {exercise.isPR && <PRBadge value={exercise.prValue} />}
                </View>

                {exercise.sets.length > 0 && (
                  <View style={{ paddingHorizontal: spacing.base, paddingBottom: spacing.base }}>
                    {exercise.sets.map((set) => {
                      let setLabel = '';
                      if (isDuration) setLabel = `${set.durationSeconds ?? 0}s`;
                      else if (isTimeReps) setLabel = `${set.durationSeconds ?? 0}s × ${set.reps ?? 0} reps`;
                      else if (isBodyweight) setLabel = `${set.reps ?? 0} reps`;
                      else setLabel = `${set.weight ?? 0}kg × ${set.reps ?? 0} reps`;

                      return (
                        <View
                          key={set.id}
                          style={{
                            flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                            paddingVertical: 5,
                            borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)',
                          }}
                        >
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Set {set.setNumber}</Text>
                          <Text style={{
                            fontSize: 12, fontWeight: '500',
                            color: set.completed === 1 ? '#84CC16' : 'rgba(255,255,255,0.3)',
                          }}>
                            {setLabel}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })}
        </Animated.View>
      </ScrollView>

      {/* Done button */}
      <View style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingBottom: insets.bottom + spacing.base,
        paddingTop: spacing.sm,
        backgroundColor: colors.backgroundPrimary,
        borderTopWidth: 1, borderTopColor: colors.border,
      }}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Workouts')}
          activeOpacity={1}
          style={{
            backgroundColor: '#84CC16',
            borderRadius: Radius.xl, paddingVertical: 16,
            alignItems: 'center',
            shadowColor: '#84CC16', shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff' }}>Back to Workouts</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
