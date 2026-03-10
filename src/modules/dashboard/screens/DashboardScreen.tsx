import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  LayoutChangeEvent,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import WeightPickerModal from '../components/WeightPickerModal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { Plus, TrendingDown, TrendingUp, Check, Flame, Drumstick, Footprints, Dumbbell, Calendar, CircleCheck, CircleAlert, UtensilsCrossed } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Text as SvgText } from 'react-native-svg';
import { useDashboard } from '../hooks/useDashboard';
import TodaysWorkoutCard from '../components/TodaysWorkoutCard';
import { dashboardStyles } from '../styles';
import { Radius } from '@theme/radius';
import { Card } from '@shared/components/ui/Card';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { CircularProgressRing } from '@shared/components/ui/CircularProgressRing';

// ─── Weight Sparkline ────────────────────────────────────────────────────────

function WeightSparkline({
  data,
  color,
  targetWeight,
}: {
  data: number[];
  color: string;
  targetWeight: number | null;
}) {
  const [width, setWidth] = useState(0);
  const HEIGHT = 56;
  const DOT = 5;

  const allValues = targetWeight != null ? [...data, targetWeight] : data;
  const min = Math.min(...allValues) - 1;
  const max = Math.max(...allValues) + 1;
  const range = max - min || 1;

  const toY = (v: number) => HEIGHT - ((v - min) / range) * HEIGHT;
  const toX = (i: number) => (i / (data.length - 1)) * width;
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  return (
    <View style={{ height: HEIGHT + DOT, width: '100%' }} onLayout={onLayout}>
      {width > 0 && (
        <>
          {targetWeight != null && (
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: toY(targetWeight),
                height: 1,
                borderStyle: 'dashed',
                borderWidth: 1,
                borderColor: color + '55',
              }}
            />
          )}
          {data.slice(0, -1).map((v, i) => {
            const x1 = toX(i);
            const y1 = toY(v);
            const x2 = toX(i + 1);
            const y2 = toY(data[i + 1]);
            const dx = x2 - x1;
            const dy = y2 - y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            return (
              <View
                key={i}
                style={{
                  position: 'absolute',
                  left: x1,
                  top: y1,
                  width: len,
                  height: 2,
                  backgroundColor: color,
                  transformOrigin: '0 50%',
                  transform: [{ rotate: `${angle}deg` }],
                }}
              />
            );
          })}
          {data.map((v, i) => (
            <View
              key={`d${i}`}
              style={{
                position: 'absolute',
                left: toX(i) - DOT / 2,
                top: toY(v) - DOT / 2,
                width: DOT,
                height: DOT,
                borderRadius: DOT / 2,
                backgroundColor: color,
              }}
            />
          ))}
        </>
      )}
    </View>
  );
}

// ─── Macro Ring ──────────────────────────────────────────────────────────────

function MacroRing({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
}) {
  const { colors, typography } = useTheme();
  const progress = target > 0 ? value / target : 0;

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <CircularProgressRing
        size={88}
        strokeWidth={9}
        progress={progress}
        color={color}
        trackColor={colors.border}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: colors.textPrimary, lineHeight: 18 }}>
            {Math.round(value)}{unit}
          </Text>
          <Text style={{ ...typography.caption, color: colors.textTertiary, fontSize: 11 }}>
            / {Math.round(target)}{unit}
          </Text>
        </View>
      </CircularProgressRing>
      <Text style={{ ...typography.caption, color: colors.textSecondary, marginTop: 8, fontWeight: '500' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Constants ───────────────────────────────────────────────────────────────

const GOAL_GREETING: Record<string, string> = {
  lose_weight: 'Stay in your deficit today',
  gain_muscle: 'Hit your protein target',
  maintain: 'Keep it balanced',
};

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const { colors, typography, spacing } = useTheme();
  const { data, loading, skipWorkout, logWeightEntry, setTargetWeight } = useDashboard();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [weightModalVisible, setWeightModalVisible] = useState(false);

  const [targetModalVisible, setTargetModalVisible] = useState(false);
  const [targetInput, setTargetInput] = useState('');

  const [trendPeriod, setTrendPeriod] = useState<'7D' | '30D' | '90D'>('7D');

  const openWeightModal = () => {
    setWeightModalVisible(true);
  };

  const openTargetModal = () => {
    setTargetInput(data?.user?.targetWeight ? String(data.user.targetWeight) : '');
    setTargetModalVisible(true);
  };

  const saveTargetWeight = async () => {
    const val = parseFloat(targetInput);
    if (isNaN(val) || val <= 0) return;
    await setTargetWeight(val);
    setTargetModalVisible(false);
  };

  const todayLabel = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const initials = data?.user?.name
    ? data.user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        style={dashboardStyles.container}
        contentContainerStyle={dashboardStyles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: spacing.xl, paddingBottom: spacing.base }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, lineHeight: 34 }}>
              {data?.user ? `Welcome back,` : 'Welcome back'}
            </Text>
            {data?.user ? (
              <Text style={{ fontSize: 28, fontWeight: '800', color: colors.textPrimary, lineHeight: 34 }}>
                {data.user.name.split(' ')[0]}
              </Text>
            ) : null}
          </View>
          {/* Avatar */}
          <View style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: '#7C3AED',
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: 4,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#FFFFFF' }}>{initials}</Text>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing['2xl'] }} />
        ) : data ? (
          <>
            {/* ── Today's Progress card ── */}
            {data.user ? (() => {
              const calConsumed = Math.round(data.todayMacros.calories);
              const calGoal = Math.round(data.user.targetCalories);
              const calsBurned = 0; // health tracking not yet integrated
              const netCalories = calConsumed - calsBurned;
              const calProgress = calGoal > 0 ? netCalories / calGoal : 0;
              const calRemaining = calGoal - netCalories;

              const proteinConsumed = Math.round(data.todayMacros.protein);
              const proteinGoal = Math.round(data.user.targetProtein);
              const proteinProgress = proteinGoal > 0 ? proteinConsumed / proteinGoal : 0;
              const proteinRemaining = proteinGoal - proteinConsumed;

              const workoutsDone = data.todaysWorkouts.filter((w) => w.isDone).length;
              const workoutsTotal = data.todaysWorkouts.length;

              const isBalanced = calRemaining >= -50 && calRemaining <= 50;
              const isOnTrack = isBalanced && proteinProgress >= 1;

              const calBarColor = calProgress > 1 ? '#EF4444' : calProgress > 0.9 ? '#84CC16' : '#F59E0B';
              const calStatusText = isBalanced
                ? 'Perfect balance achieved'
                : calRemaining > 0
                ? "Eat more to hit today's goal"
                : 'Burn more to reach deficit target';
              const calStatusColor = isBalanced ? '#84CC16' : calRemaining > 0 ? '#3B82F6' : '#F59E0B';

              const bannerText = isOnTrack
                ? 'On track for today'
                : proteinProgress < 1 && Math.abs(calRemaining) > 200
                ? 'Protein goal still pending'
                : calRemaining > 200
                ? `Eat ${calRemaining} kcal more`
                : calRemaining < -200
                ? `Burn ${Math.abs(calRemaining)} kcal to stay in deficit`
                : proteinProgress < 1
                ? `${proteinRemaining}g protein remaining`
                : 'On track for today';

              const sub = 'rgba(255,255,255,0.05)';
              const subBorder = 'rgba(255,255,255,0.1)';

              return (
                <Card style={{ marginBottom: spacing.base, overflow: 'hidden' }}>
                  {/* Blue → purple gradient overlay */}
                  <LinearGradient
                    colors={['rgba(59,130,246,0.12)', 'rgba(168,85,247,0.12)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                  />

                  {/* Header */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>Today's Progress</Text>
                    <Calendar size={18} color="#3B82F6" />
                  </View>

                  {/* Calorie Balance — full width */}
                  {(() => {
                    const isAtGoal = Math.abs(calRemaining) < 50;
                    const isOverGoal = calRemaining < 0;
                    const balColor = isAtGoal ? '#84CC16' : isOverGoal ? '#EF4444' : '#00E5FF';
                    const barColor = isAtGoal ? '#84CC16' : isOverGoal ? '#EF4444' : '#F59E0B';
                    const balMsg = isAtGoal
                      ? "Perfect! You've hit today's goal"
                      : isOverGoal
                      ? `Burn ${Math.abs(calRemaining)} more kcal to hit today's goal`
                      : `Eat ${calRemaining} more kcal to hit today's goal`;
                    const BalIcon = isAtGoal ? Check : isOverGoal ? TrendingDown : TrendingUp;
                    return (
                      <View style={{ backgroundColor: sub, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: subBorder, marginBottom: 12 }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                          <Flame size={18} color="#F59E0B" />
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' }}>Balance</Text>
                        </View>

                        {/* Big balance number — gradient */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          {(() => {
                            const label = Math.abs(calRemaining).toLocaleString();
                            const gradStart = isAtGoal ? '#84CC16' : isOverGoal ? '#EF4444' : '#22D3EE';
                            const gradEnd   = isAtGoal ? '#84CC16' : isOverGoal ? '#F87171' : '#3B82F6';
                            const W = label.length * 30 + 8;
                            return (
                              <Svg width={W} height={58}>
                                <Defs>
                                  <SvgGradient id="numGrad" x1="0" y1="0" x2="1" y2="0">
                                    <Stop offset="0" stopColor={gradStart} stopOpacity="1" />
                                    <Stop offset="1" stopColor={gradEnd}   stopOpacity="1" />
                                  </SvgGradient>
                                </Defs>
                                <SvgText
                                  x="0" y="50"
                                  fontSize="48"
                                  fontWeight="700"
                                  fill="url(#numGrad)"
                                >
                                  {label}
                                </SvgText>
                              </Svg>
                            );
                          })()}
                          <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>kcal</Text>
                        </View>

                        {/* Progress bar */}
                        <View style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden', marginBottom: 10 }}>
                          <View style={{ width: `${Math.min(Math.abs(calProgress) * 100, 100)}%`, height: '100%', backgroundColor: barColor, borderRadius: 3 }} />
                        </View>

                        {/* Message row */}
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                          <BalIcon size={16} color={balColor} />
                          <Text style={{ fontSize: 13, fontWeight: '500', color: balColor, flex: 1 }}>{balMsg}</Text>
                        </View>

                        {/* Divider */}
                        <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 12 }} />

                        {/* Goal / Eaten / Burned */}
                        <View style={{ flexDirection: 'row' }}>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Goal</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>{calGoal}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Eaten</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#84CC16' }}>{calConsumed}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>Burned</Text>
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#EF4444' }}>{calsBurned > 0 ? calsBurned : '—'}</Text>
                          </View>
                        </View>
                      </View>
                    );
                  })()}

                  {/* 3-column grid: Protein | Steps | Workouts */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                    {/* Protein */}
                    <View style={{ flex: 1, backgroundColor: sub, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: subBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                        <Drumstick size={14} color="#F59E0B" />
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Protein</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>
                          {proteinProgress >= 1 ? proteinConsumed : proteinRemaining}
                        </Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}> g</Text>
                      </View>
                      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <View style={{ width: `${Math.min(proteinProgress * 100, 100)}%`, height: '100%', backgroundColor: proteinProgress >= 1 ? '#84CC16' : '#F59E0B', borderRadius: 2 }} />
                      </View>
                      <Text style={{ fontSize: 10, fontWeight: '600', color: proteinProgress >= 1 ? '#84CC16' : '#F59E0B' }}>
                        {proteinProgress >= 1 ? 'Goal achieved' : 'remaining'}
                      </Text>
                    </View>

                    {/* Steps */}
                    <View style={{ flex: 1, backgroundColor: sub, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: subBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                        <Footprints size={14} color="#3B82F6" />
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Steps</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>—</Text>
                      </View>
                      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <View style={{ width: '0%', height: '100%', backgroundColor: '#3B82F6', borderRadius: 2 }} />
                      </View>
                      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>10,000 goal</Text>
                    </View>

                    {/* Workouts */}
                    <View style={{ flex: 1, backgroundColor: sub, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: subBorder }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                        <Dumbbell size={14} color="#A855F7" />
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Workouts</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                        <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>
                          {workoutsTotal === 0 ? '—' : workoutsDone}
                        </Text>
                        {workoutsTotal > 0 && (
                          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}> / {workoutsTotal}</Text>
                        )}
                      </View>
                      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                        <View style={{ width: workoutsTotal > 0 ? `${(workoutsDone / workoutsTotal) * 100}%` : '0%', height: '100%', backgroundColor: '#A855F7', borderRadius: 2 }} />
                      </View>
                      <Text style={{ fontSize: 10, color: workoutsDone === workoutsTotal && workoutsTotal > 0 ? '#84CC16' : 'rgba(255,255,255,0.5)' }}>
                        {workoutsTotal === 0 ? 'No workouts' : workoutsDone === workoutsTotal ? 'All done!' : `${workoutsTotal - workoutsDone} remaining`}
                      </Text>
                    </View>
                  </View>

                  {/* Status banner */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 8,
                    paddingHorizontal: 12, paddingVertical: 10,
                    borderRadius: 8,
                    backgroundColor: isOnTrack ? 'rgba(132,204,22,0.1)' : 'rgba(245,158,11,0.1)',
                    borderWidth: 1,
                    borderColor: isOnTrack ? 'rgba(132,204,22,0.2)' : 'rgba(245,158,11,0.2)',
                  }}>
                    {isOnTrack
                      ? <CircleCheck size={16} color="#84CC16" />
                      : <CircleAlert size={16} color="#F59E0B" />
                    }
                    <Text style={{ fontSize: 12, fontWeight: '500', color: isOnTrack ? '#84CC16' : '#F59E0B' }}>
                      {bannerText}
                    </Text>
                  </View>
                </Card>
              );
            })() : null}

            {/* ── Nutrition Overview ── */}
            {data.user ? (
              <Card style={{ marginBottom: spacing.xl }}>
                <Text style={{ ...typography.label, color: colors.textPrimary, fontWeight: '600', marginBottom: spacing.base }}>
                  Nutrition Overview
                </Text>

                {data.todayMacros.calories === 0 ? (
                  <View style={{ alignItems: 'center', paddingVertical: spacing['2xl'] }}>
                    {/* Icon circle */}
                    <LinearGradient
                      colors={['rgba(245,158,11,0.2)', 'rgba(132,204,22,0.2)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{
                        width: 80, height: 80, borderRadius: 40,
                        alignItems: 'center', justifyContent: 'center',
                        borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
                        marginBottom: spacing.base,
                      }}
                    >
                      <UtensilsCrossed size={32} color="#F59E0B" />
                    </LinearGradient>

                    <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: 8 }}>
                      No meals logged yet
                    </Text>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.xl }}>
                      Start tracking your nutrition to see your daily macro breakdown
                    </Text>

                    {/* CTA button */}
                    <TouchableOpacity
                      onPress={() => navigation.navigate('MealsTab', { screen: 'AddMeal' })}
                      activeOpacity={0.85}
                      style={{ overflow: 'hidden', borderRadius: Radius.xl, marginBottom: spacing.xl }}
                    >
                      <LinearGradient
                        colors={['#F59E0B', 'rgba(245,158,11,0.8)']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={{ paddingHorizontal: spacing.xl, paddingVertical: 10 }}
                      >
                        <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Log Your First Meal</Text>
                      </LinearGradient>
                    </TouchableOpacity>

                    {/* Daily goal footer */}
                    <View style={{ width: '100%', paddingTop: spacing.base, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Daily Goal</Text>
                        <Text style={{ fontSize: 11, fontWeight: '500', color: 'rgba(255,255,255,0.6)' }}>
                          {Math.round(data.user.targetProtein)}g P · {Math.round(data.user.targetCarbs)}g C · {Math.round(data.user.targetFat)}g F
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                        {Math.round(data.user.targetCalories)} calories/day
                      </Text>
                    </View>
                  </View>
                ) : (
                  <>
                    {/* 3 macro rings */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: spacing.base }}>
                      <MacroRing
                        label="Protein"
                        value={data.todayMacros.protein}
                        target={data.user.targetProtein}
                        unit="g"
                        color={colors.macroProtein}
                      />
                      <MacroRing
                        label="Carbs"
                        value={data.todayMacros.carbs}
                        target={data.user.targetCarbs}
                        unit="g"
                        color={colors.macroCarbs}
                      />
                      <MacroRing
                        label="Fats"
                        value={data.todayMacros.fat}
                        target={data.user.targetFat}
                        unit="g"
                        color={colors.macroFat}
                      />
                    </View>

                    {/* Divider */}
                    <View style={{ height: 1, backgroundColor: colors.border, marginBottom: spacing.sm }} />

                    {/* Total calories row */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>Total Calories</Text>
                      <Text style={{ ...typography.label, color: colors.textPrimary, fontWeight: '700' }}>
                        {Math.round(data.todayMacros.calories)}
                        <Text style={{ ...typography.caption, color: colors.textTertiary, fontWeight: '400' }}>
                          {' '}/ {Math.round(data.user.targetCalories)}
                        </Text>
                      </Text>
                    </View>
                    {(() => {
                      const pct = Math.min(data.user.targetCalories > 0 ? data.todayMacros.calories / data.user.targetCalories : 0, 1);
                      return (
                        <View style={{ height: 7, backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 4, overflow: 'hidden' }}>
                          <LinearGradient
                            colors={['#3B82F6', '#84CC16']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={{ height: 7, borderRadius: 4, width: `${Math.round(pct * 100)}%` as any }}
                          />
                        </View>
                      );
                    })()}
                  </>
                )}
              </Card>
            ) : null}

            {/* ── Today's Workout cards ── */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ ...typography.label, color: 'rgba(255,255,255,0.8)', fontWeight: '600' }}>
                Today's Workouts
              </Text>
            </View>
            <TodaysWorkoutCard
              workouts={data.todaysWorkouts}
              onStart={(id) =>
                navigation.navigate('WorkoutsTab', {
                  screen: 'ExecuteWorkout',
                  params: { workoutTemplateId: id },
                })
              }
              onSkip={skipWorkout}
              onBrowse={() => navigation.navigate('WorkoutsTab')}
            />

            {/* ── Weight Progress ── */}
            {data.user ? (() => {
              const unit = data.user.unitPreference === 'metric' ? 'kg' : 'lbs';
              const currentWeight = data.user.weight;
              const targetWeight = data.user.targetWeight;
              const startWeight = data.weightLogs.length > 0 ? data.weightLogs[0] : currentWeight;
              const isLose = data.user.goal === 'lose_weight';

              // Progress %
              let progressPct = 0;
              if (targetWeight != null && startWeight !== targetWeight) {
                if (isLose) {
                  const totalToLose = startWeight - targetWeight;
                  progressPct = totalToLose > 0 ? Math.max(0, Math.min((startWeight - currentWeight) / totalToLose, 1)) : 0;
                } else {
                  const totalToGain = targetWeight - startWeight;
                  progressPct = totalToGain > 0 ? Math.max(0, Math.min((currentWeight - startWeight) / totalToGain, 1)) : 0;
                }
              }

              // Status + diff
              const absDiff = targetWeight != null ? Math.abs(currentWeight - targetWeight) : null;
              let onTrack = false;
              if (absDiff != null && absDiff >= 0.1) {
                onTrack = isLose ? currentWeight < startWeight : currentWeight > startWeight;
              }
              const diffNum = absDiff != null && absDiff >= 0.1 ? `${Math.round(absDiff)} ${unit}` : null;
              const diffDir = absDiff != null && absDiff >= 0.1 ? (isLose ? 'to lose' : 'to gain') : null;

              // Last logged footer text
              let lastLoggedText = '';
              if (data.lastWeightLoggedAt) {
                const logDate = new Date(data.lastWeightLoggedAt);
                const todayStr = new Date().toDateString();
                const yest = new Date();
                yest.setDate(yest.getDate() - 1);
                if (logDate.toDateString() === todayStr) {
                  lastLoggedText = `${currentWeight} ${unit} – Today`;
                } else if (logDate.toDateString() === yest.toDateString()) {
                  lastLoggedText = `${currentWeight} ${unit} – Yesterday`;
                } else {
                  lastLoggedText = `${currentWeight} ${unit} – ${logDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
                }
              }

              return (
                <Card style={{ marginBottom: spacing.xl, overflow: 'hidden' }}>
                  {/* Lime overlay */}
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(132,204,22,0.08)' }} />

                  {/* Card header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.base }}>
                    <Text style={{ fontSize: 14, fontWeight: '500', color: 'rgba(255,255,255,0.8)' }}>
                      Weight Progress
                    </Text>
                    <TouchableOpacity
                      onPress={openWeightModal}
                      activeOpacity={0.75}
                      style={{
                        backgroundColor: 'rgba(132,204,22,0.2)',
                        borderRadius: Radius.md,
                        borderWidth: 1,
                        borderColor: 'rgba(132,204,22,0.3)',
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 6,
                      }}
                    >
                      <Plus size={14} color="#84CC16" strokeWidth={2.5} />
                      <Text style={{ fontSize: 12, fontWeight: '500', color: '#84CC16' }}>Log Weight</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Stats row: current weight (left) + on-track / diff (right) */}
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: spacing.base }}>
                    {/* Left: label + big number + target */}
                    <View>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Current Weight</Text>
                      <TouchableOpacity onPress={openWeightModal} activeOpacity={0.7}>
                        <Text style={{ fontSize: 36, fontWeight: '800', color: colors.textPrimary, lineHeight: 42 }}>
                          {currentWeight} {unit}
                        </Text>
                      </TouchableOpacity>
                      {targetWeight != null ? (
                        <TouchableOpacity onPress={openTargetModal} activeOpacity={0.7}>
                          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                            Target: {targetWeight} {unit}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity onPress={openTargetModal} activeOpacity={0.7}>
                          <Text style={{ fontSize: 12, color: '#84CC16', fontWeight: '600', marginTop: 4 }}>Set target →</Text>
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* Right: on-track status + big diff number + direction */}
                    {diffNum && diffDir ? (
                      <View style={{ alignItems: 'flex-end', paddingBottom: 2 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                          <TrendingDown size={16} color="#84CC16" />
                          <Text style={{ fontSize: 12, fontWeight: '500', color: '#84CC16' }}>
                            {onTrack ? 'On Track' : 'In Progress'}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 18, fontWeight: '600', color: colors.textPrimary }}>{diffNum}</Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{diffDir}</Text>
                      </View>
                    ) : absDiff != null && absDiff < 0.1 ? (
                      <Text style={{ fontSize: 13, fontWeight: '600', color: '#84CC16', paddingBottom: 2 }}>
                        Target reached! 🎯
                      </Text>
                    ) : null}
                  </View>

                  {/* Progress bar */}
                  {targetWeight != null ? (
                    <View style={{ marginBottom: spacing.base }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xs }}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Progress</Text>
                        <Text style={{ fontSize: 12, fontWeight: '500', color: colors.textPrimary }}>{Math.round(progressPct * 100)}%</Text>
                      </View>
                      <ProgressBar progress={progressPct} color="#84CC16" height={10} />
                    </View>
                  ) : null}

                  {/* Trend selector + sparkline */}
                  {data.weightLogs.length > 1 ? (
                    <>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm, marginTop: spacing.xs }}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>Trend</Text>
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          {(['7D', '30D', '90D'] as const).map((t) => (
                            <TouchableOpacity
                              key={t}
                              onPress={() => setTrendPeriod(t)}
                              style={{
                                paddingHorizontal: 10,
                                paddingVertical: 4,
                                borderRadius: Radius.sm,
                                backgroundColor: trendPeriod === t ? 'rgba(132,204,22,0.2)' : 'rgba(255,255,255,0.05)',
                                borderWidth: trendPeriod === t ? 1 : 0,
                                borderColor: trendPeriod === t ? 'rgba(132,204,22,0.3)' : 'transparent',
                              }}
                            >
                              <Text style={{
                                fontSize: 12,
                                fontWeight: trendPeriod === t ? '600' : '400',
                                color: trendPeriod === t ? '#84CC16' : 'rgba(255,255,255,0.4)',
                              }}>{t}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                      <WeightSparkline data={data.weightLogs} color="#84CC16" targetWeight={targetWeight ?? null} />
                    </>
                  ) : (
                    <TouchableOpacity onPress={openWeightModal} activeOpacity={0.7} style={{ paddingVertical: spacing.sm }}>
                      <Text style={{ fontSize: 12, color: '#84CC16' }}>Log more weights to see your trend</Text>
                    </TouchableOpacity>
                  )}

                  {/* Footer */}
                  {lastLoggedText ? (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.base, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>Last logged</Text>
                      <Text style={{ fontSize: 13, fontWeight: '600', color: colors.textPrimary }}>{lastLoggedText}</Text>
                    </View>
                  ) : null}
                </Card>
              );
            })() : null}

            {/* ── Streak card ── */}
            {data.streak > 0 ? (
              <Card
                style={{
                  marginBottom: spacing.xl,
                  backgroundColor: '#1A2318',
                  borderColor: '#2A3828',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <View>
                  <Text style={{ ...typography.caption, color: colors.textTertiary, marginBottom: 4 }}>
                    Current Streak
                  </Text>
                  <Text style={{ fontSize: 26, fontWeight: '800', color: colors.textPrimary, lineHeight: 32 }}>
                    {data.streak} {data.streak === 1 ? 'Day' : 'Days'} {'🔥'}
                  </Text>
                  <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: 4 }}>
                    {data.streak >= 7 ? 'Incredible, keep going!' : data.streak >= 3 ? 'Keep it up!' : 'Great start!'}
                  </Text>
                </View>
                <Text style={{ fontSize: 40 }}>{'💪'}</Text>
              </Card>
            ) : null}
          </>
        ) : null}
      </ScrollView>

      {/* ── Log Weight Modal ── */}
      <WeightPickerModal
        visible={weightModalVisible}
        initialWeight={data?.user?.weight ?? 70}
        imperial={data?.user?.unitPreference === 'imperial'}
        onSave={(weight) => logWeightEntry(weight)}
        onClose={() => setWeightModalVisible(false)}
      />

      {/* ── Set Target Weight Modal ── */}
      <Modal visible={targetModalVisible} transparent animationType="slide" onRequestClose={() => setTargetModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setTargetModalVisible(false)} />
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              borderTopLeftRadius: Radius.xl,
              borderTopRightRadius: Radius.xl,
              paddingHorizontal: spacing.xl,
              paddingTop: spacing.sm,
              paddingBottom: insets.bottom + spacing.xl,
            }}
          >
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl }} />
            <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.xl }}>Set Target Weight</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: colors.backgroundPrimary, borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.base, marginBottom: spacing.xl }}>
              <TextInput
                value={targetInput}
                onChangeText={setTargetInput}
                keyboardType="decimal-pad"
                style={{ flex: 1, ...typography.statLarge, color: colors.textPrimary, paddingVertical: spacing.base }}
                placeholderTextColor={colors.textTertiary}
                placeholder="0"
                autoFocus
              />
              <Text style={{ ...typography.body, color: colors.textSecondary }}>
                {data?.user?.unitPreference === 'imperial' ? 'lbs' : 'kg'}
              </Text>
            </View>
            <TouchableOpacity onPress={saveTargetWeight} style={{ backgroundColor: colors.brandPrimary, borderRadius: Radius.md, paddingVertical: spacing.base, alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ ...typography.buttonText, color: colors.white }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTargetModalVisible(false)} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
              <Text style={{ ...typography.caption, color: colors.textTertiary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
