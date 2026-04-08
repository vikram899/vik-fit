import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { User, Target, Settings, ChevronRight, Flame, RotateCcw, Zap, Dumbbell, Scale } from 'lucide-react-native';
import { useProfile } from '../hooks/useProfile';
import { StreakCondition } from '@shared/types/common';
import { createProfileStyles } from '../styles';
import { formatWeight, formatHeight } from '@shared/utils/formatUtils';
import { calculateBMR } from '@shared/utils/bmrUtils';
import { useAuth } from '@core/AuthContext';
import { Radius } from '@theme/radius';

const ACTIVITY_SUBTITLE: Record<string, string> = {
  sedentary: 'Getting Started',
  lightly_active: 'Fitness Beginner',
  moderately_active: 'Fitness Enthusiast',
  very_active: 'Active Athlete',
  extra_active: 'Hybrid Athlete',
};

const GOAL_LABEL: Record<string, string> = {
  lose_weight: 'Lose Weight',
  gain_muscle: 'Gain Muscle',
  maintain: 'Maintain Weight',
};

const STREAK_OPTIONS: { value: StreakCondition; label: string; desc: string }[] = [
  { value: 'any',      label: 'Any Activity',       desc: 'Meal logged or workout completed' },
  { value: 'meals',    label: 'Meals Logged',        desc: 'At least one meal logged' },
  { value: 'workout',  label: 'Workout Completed',   desc: 'At least one workout finished' },
  { value: 'calories', label: 'Calories Hit',        desc: 'Hit ≥90% of daily calorie goal' },
  { value: 'protein',  label: 'Protein Hit',         desc: 'Hit ≥90% of daily protein goal' },
  { value: 'weight',   label: 'Weight Logged',       desc: 'Logged your weight for the day' },
];

export default function ProfileScreen() {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const s = useMemo(() => createProfileStyles(colors), [colors]);
  const { user, nutrition, workoutCount, streak, loading, saveNutritionTargets, saveStreakCondition, saveUnitPreference, saveRestingCalories } = useProfile();
  const { setHasUser } = useAuth();

  const [editTargetsVisible, setEditTargetsVisible] = useState(false);
  const [calInput, setCalInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');
  const [calPctInput, setCalPctInput] = useState(85);
  const [calUpperPctInput, setCalUpperPctInput] = useState(115);
  const [protPctInput, setProtPctInput] = useState(85);

  const [streakPickerVisible, setStreakPickerVisible] = useState(false);
  const [unitsVisible, setUnitsVisible] = useState(false);
  const [restingCalVisible, setRestingCalVisible] = useState(false);
  const [restingCalInput, setRestingCalInput] = useState('');

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary, alignItems: 'center', justifyContent: 'center' }} edges={['top']}>
        <ActivityIndicator color={colors.brandPrimary} />
      </SafeAreaView>
    );
  }

  if (!user) return null;

  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');

  const bmi = user.unitPreference === 'imperial'
    ? (703 * user.weight / (user.height * user.height)).toFixed(1)
    : (user.weight / ((user.height / 100) ** 2)).toFixed(1);
  const subtitle = ACTIVITY_SUBTITLE[user.activityLevel] ?? 'Fitness Enthusiast';
  const goalLabel = GOAL_LABEL[user.goal] ?? user.goal;

  const weightStr       = formatWeight(user.weight, user.unitPreference);
  const heightStr       = formatHeight(user.height, user.unitPreference);
  const targetWeightStr = user.targetWeight ? formatWeight(user.targetWeight, user.unitPreference) : '—';

  const computedCalories = nutrition ? Math.round(nutrition.targetCalories) : 0;
  const computedProtein  = nutrition ? Math.round(nutrition.proteinGrams) : 0;
  const effectiveCalories = user?.targetCaloriesOverride ?? computedCalories;
  const effectiveProtein  = user?.targetProteinOverride  ?? computedProtein;
  const hasCustomTargets  = user?.targetCaloriesOverride != null || user?.targetProteinOverride != null;

  const openEditTargets = () => {
    setCalInput(String(effectiveCalories));
    setProteinInput(String(effectiveProtein));
    setCalPctInput(user?.calorieGoalPct ?? 85);
    setCalUpperPctInput(user?.calorieGoalUpperPct ?? 115);
    setProtPctInput(user?.proteinGoalPct ?? 85);
    setEditTargetsVisible(true);
  };

  const saveTargets = async () => {
    const cal  = parseInt(calInput, 10);
    const prot = parseInt(proteinInput, 10);
    try {
      await saveNutritionTargets(
        !isNaN(cal)  ? cal  : null,
        !isNaN(prot) ? prot : null,
        calPctInput,
        calUpperPctInput,
        protPctInput,
      );
    } catch (e) {
      console.warn('[saveTargets]', e);
    } finally {
      setEditTargetsVisible(false);
    }
  };

  const resetTargets = async () => {
    try {
      await saveNutritionTargets(null, null, 85, 115, 85);
    } finally {
      setEditTargetsVisible(false);
    }
  };

  const isImperial = user.unitPreference === 'imperial';
  const weightKg = isImperial ? user.weight / 2.20462 : user.weight;
  const heightCm = isImperial ? user.height * 2.54 : user.height;
  const calculatedBMR = calculateBMR(weightKg, heightCm, user.age, user.gender);
  const effectiveResting = user.restingCaloriesOverride ?? calculatedBMR;

  const BODY_STATS = [
    { label: 'Weight', value: weightStr },
    { label: 'Height', value: heightStr },
    { label: 'BMI',    value: bmi },
    { label: 'Resting Calories', value: `${effectiveResting} kcal${user.restingCaloriesOverride ? '' : ' (auto)'}` },
  ];

  const FITNESS_GOALS = [
    { goal: 'Weight Goal',    current: weightStr,                    target: targetWeightStr },
    { goal: 'Daily Calories', current: `${effectiveCalories} kcal`,  target: `${computedCalories} kcal` },
    { goal: 'Protein Intake', current: `${effectiveProtein}g`,       target: `${computedProtein}g` },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Profile</Text>
          <TouchableOpacity style={s.headerBtn} activeOpacity={1}>
            <Settings size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* ── Profile Card ── */}
        <View style={s.profileCard}>
          <View style={s.profileCardOverlay} />
          <View style={s.profileRow}>
            <View style={s.avatar}>
              <Text style={s.avatarText}>{initials}</Text>
            </View>
            <View style={s.profileInfo}>
              <Text style={s.profileName}>{user.name}</Text>
              <Text style={s.profileSubtitle}>{subtitle}</Text>
              <Text style={s.profileGoal}>🎯 Goal: {goalLabel}</Text>
            </View>
          </View>
        </View>

        {/* ── Stats Row ── */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.base }}>
          {/* Workouts */}
          <View style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: Radius.lg,
            borderWidth: 1, borderColor: colors.border,
            padding: spacing.base, alignItems: 'center', gap: 4,
          }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Dumbbell size={18} color="#3B82F6" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#3B82F6' }}>{workoutCount}</Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Workouts</Text>
          </View>

          {/* Streak */}
          <View style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: Radius.lg,
            borderWidth: 1, borderColor: colors.border,
            padding: spacing.base, alignItems: 'center', gap: 4,
          }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(245,158,11,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} color="#F59E0B" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#F59E0B' }}>{streak}<Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(245,158,11,0.6)' }}>d</Text></Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>Streak</Text>
          </View>

          {/* BMI */}
          <View style={{
            flex: 1, backgroundColor: colors.surface, borderRadius: Radius.lg,
            borderWidth: 1, borderColor: colors.border,
            padding: spacing.base, alignItems: 'center', gap: 4,
          }}>
            <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(132,204,22,0.15)', alignItems: 'center', justifyContent: 'center' }}>
              <Scale size={18} color="#84CC16" />
            </View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#84CC16' }}>{bmi}</Text>
            <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>BMI</Text>
          </View>
        </View>

        {/* ── Body Stats ── */}
        <View style={s.card}>
          <Text style={s.cardStandaloneTitle}>Body Stats</Text>
          {BODY_STATS.map((row, idx) => {
            const isResting = row.label === 'Resting Calories';
            const isLast = idx === BODY_STATS.length - 1;
            return (
              <TouchableOpacity
                key={row.label}
                activeOpacity={1}
                disabled={!isResting}
                onPress={isResting ? () => { setRestingCalInput(String(effectiveResting)); setRestingCalVisible(true); } : undefined}
                style={[s.bodyStatRow, isLast && { borderBottomWidth: 0 }]}
              >
                <Text style={s.bodyStatLabel}>{row.label}</Text>
                <View style={[s.bodyStatRight, { flexDirection: 'row', alignItems: 'center', gap: 6 }]}>
                  <Text style={s.bodyStatValue}>{row.value}</Text>
                  {isResting && <ChevronRight size={14} color="rgba(255,255,255,0.3)" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Fitness Goals ── */}
        <View style={s.card}>
          <View style={s.greenOverlay} />
          <View style={s.cardHeader}>
            <View style={s.cardHeaderLeft}>
              <Target size={18} color="#84CC16" />
              <Text style={s.cardHeaderTitle}>Fitness Goals</Text>
            </View>
          </View>
          {FITNESS_GOALS.map((item) => (
            <View key={item.goal} style={s.goalRow}>
              <Text style={s.goalLabel}>{item.goal}</Text>
              <View style={s.goalRight}>
                <Text style={s.goalCurrent}>{item.current}</Text>
                {item.goal !== 'Weight Goal' && item.current !== item.target && (
                  <>
                    <Text style={s.goalArrow}>·</Text>
                    <Text style={[s.goalTarget, { fontSize: 11, color: 'rgba(255,255,255,0.3)' }]}>calc: {item.target}</Text>
                  </>
                )}
                {item.goal === 'Weight Goal' && (
                  <>
                    <Text style={s.goalArrow}>→</Text>
                    <Text style={s.goalTarget}>{item.target}</Text>
                  </>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* ── Preferences ── */}
        <View style={s.settingsSection}>
          <TouchableOpacity style={s.settingsItem} activeOpacity={1} onPress={() => setStreakPickerVisible(true)}>
            <View style={s.settingsItemLeft}>
              <Zap size={20} color="rgba(255,255,255,0.6)" />
              <View>
                <Text style={s.settingsItemLabel}>Streak Goal</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                  {STREAK_OPTIONS.find((o) => o.value === (user.streakCondition ?? 'any'))?.label ?? 'Any Activity'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={s.settingsItem} activeOpacity={1} onPress={openEditTargets}>
            <View style={s.settingsItemLeft}>
              <Target size={20} color="rgba(255,255,255,0.6)" />
              <View>
                <Text style={s.settingsItemLabel}>Nutrition Targets</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                  {effectiveCalories} kcal · {effectiveProtein}g protein
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>

          <TouchableOpacity style={s.settingsItem} activeOpacity={1} onPress={() => setUnitsVisible(true)}>
            <View style={s.settingsItemLeft}>
              <User size={20} color="rgba(255,255,255,0.6)" />
              <View>
                <Text style={s.settingsItemLabel}>Units &amp; Preferences</Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                  {user.unitPreference === 'imperial' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
          </TouchableOpacity>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>FitTrack Pro v1.0.0</Text>
        </View>

        {/* ── DEV: Reset Onboarding ── */}
        <TouchableOpacity
          onPress={() => setHasUser(false)}
          style={{
            marginHorizontal: 16,
            marginBottom: 32,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: 'rgba(239,68,68,0.4)',
            backgroundColor: 'rgba(239,68,68,0.1)',
            alignItems: 'center',
          }}
          activeOpacity={1}
        >
          <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>
            [DEV] Go to Onboarding
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ── Streak Goal Picker Modal ── */}
      <Modal visible={streakPickerVisible} transparent animationType="slide" onRequestClose={() => setStreakPickerVisible(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setStreakPickerVisible(false)} />
        <View style={{
          backgroundColor: colors.backgroundSecondary,
          borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
          paddingHorizontal: spacing.xl, paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.xl,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.base }}>Streak Goal</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: spacing.xl }}>
            Choose what counts as a streak day. You need to meet this goal every day to keep your streak alive.
          </Text>
          {STREAK_OPTIONS.map((opt) => {
            const isSelected = (user.streakCondition ?? 'any') === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={1}
                onPress={async () => {
                  await saveStreakCondition(opt.value);
                  setStreakPickerVisible(false);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingVertical: 14, paddingHorizontal: 16, borderRadius: Radius.md,
                  marginBottom: 8,
                  backgroundColor: isSelected ? 'rgba(132,204,22,0.1)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: isSelected ? 'rgba(132,204,22,0.35)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#84CC16' : colors.textPrimary }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#84CC16', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#000', fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>

      {/* ── Resting Calories Modal ── */}
      <Modal visible={restingCalVisible} transparent animationType="slide" onRequestClose={() => setRestingCalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setRestingCalVisible(false)} />
          <View style={{ backgroundColor: colors.backgroundSecondary, borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl, padding: spacing.xl, paddingBottom: spacing['3xl'] }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>Resting Calories</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: spacing.xl }}>
              Auto-calculated: {calculatedBMR} kcal/day (Mifflin-St Jeor). Edit to override.
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Calories burned at rest (kcal/day)</Text>
            <TextInput
              value={restingCalInput}
              onChangeText={setRestingCalInput}
              placeholder={String(calculatedBMR)}
              placeholderTextColor="rgba(255,255,255,0.3)"
              keyboardType="number-pad"
              autoFocus
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.base, paddingVertical: 14, fontSize: 22, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', marginBottom: spacing.base }}
            />
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              <TouchableOpacity
                onPress={async () => { await saveRestingCalories(null); setRestingCalVisible(false); }}
                activeOpacity={1}
                style={{ flex: 1, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>Reset to Auto</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={async () => {
                  const val = parseInt(restingCalInput, 10);
                  if (!isNaN(val) && val > 0) { await saveRestingCalories(val); setRestingCalVisible(false); }
                }}
                disabled={!restingCalInput || isNaN(parseInt(restingCalInput, 10))}
                activeOpacity={1}
                style={{ flex: 1, paddingVertical: 13, borderRadius: Radius.md, backgroundColor: '#84CC16', alignItems: 'center', opacity: !restingCalInput || isNaN(parseInt(restingCalInput, 10)) ? 0.5 : 1 }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Units & Preferences Modal ── */}
      <Modal visible={unitsVisible} transparent animationType="slide" onRequestClose={() => setUnitsVisible(false)}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setUnitsVisible(false)} />
        <View style={{
          backgroundColor: colors.backgroundSecondary,
          borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
          paddingHorizontal: spacing.xl, paddingTop: spacing.sm,
          paddingBottom: insets.bottom + spacing.xl,
        }}>
          <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl }} />
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.base }}>Units</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: spacing.xl }}>
            Choose your preferred measurement system. This affects all weight, height, and distance values across the app.
          </Text>
          {([
            { value: 'metric',   label: 'Metric',   desc: 'Kilograms (kg) · Centimetres (cm)' },
            { value: 'imperial', label: 'Imperial', desc: 'Pounds (lbs) · Feet &amp; inches (ft)' },
          ] as const).map((opt) => {
            const isSelected = user.unitPreference === opt.value;
            return (
              <TouchableOpacity
                key={opt.value}
                activeOpacity={1}
                onPress={async () => {
                  await saveUnitPreference(opt.value);
                  setUnitsVisible(false);
                }}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  paddingVertical: 14, paddingHorizontal: 16, borderRadius: Radius.md,
                  marginBottom: 8,
                  backgroundColor: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.04)',
                  borderWidth: 1,
                  borderColor: isSelected ? 'rgba(59,130,246,0.35)' : 'rgba(255,255,255,0.08)',
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isSelected ? '#3B82F6' : colors.textPrimary }}>
                    {opt.label}
                  </Text>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{opt.desc}</Text>
                </View>
                {isSelected && (
                  <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#3B82F6', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontSize: 12, color: '#fff', fontWeight: '700' }}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>

      {/* ── Edit Nutrition Targets Modal ── */}
      <Modal visible={editTargetsVisible} transparent animationType="slide" onRequestClose={() => setEditTargetsVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={() => setEditTargetsVisible(false)} />
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: Radius.xl, borderTopRightRadius: Radius.xl,
            paddingHorizontal: spacing.xl, paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xl,
          }}>
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.xl }} />

            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textPrimary }}>Daily Targets</Text>
              {hasCustomTargets && (
                <TouchableOpacity onPress={resetTargets} activeOpacity={1} style={{
                  flexDirection: 'row', alignItems: 'center', gap: 4,
                  paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
                  backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
                }}>
                  <RotateCcw size={11} color="#EF4444" />
                  <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600' }}>Reset to auto</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.xl }}>
              {/* Calories */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Calories (kcal)</Text>
                <View style={{ backgroundColor: 'rgba(132,204,22,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)', paddingHorizontal: 14, paddingVertical: 12 }}>
                  <TextInput
                    value={calInput}
                    onChangeText={setCalInput}
                    keyboardType="number-pad"
                    style={{ fontSize: 24, fontWeight: '800', color: '#84CC16', textAlign: 'center' }}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    selectTextOnFocus
                  />
                </View>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'center' }}>
                  Auto: {computedCalories} kcal
                </Text>
              </View>

              {/* Protein */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Protein (g)</Text>
                <View style={{ backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)', paddingHorizontal: 14, paddingVertical: 12 }}>
                  <TextInput
                    value={proteinInput}
                    onChangeText={setProteinInput}
                    keyboardType="number-pad"
                    style={{ fontSize: 24, fontWeight: '800', color: '#3B82F6', textAlign: 'center' }}
                    placeholderTextColor="rgba(255,255,255,0.2)"
                    selectTextOnFocus
                  />
                </View>
                <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'center' }}>
                  Auto: {computedProtein}g
                </Text>
              </View>
            </View>

            {/* Goal hit thresholds */}
            <View style={{ marginBottom: spacing.xl }}>
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>
                Goal hit thresholds
              </Text>

              {/* Calories: min–max range */}
              <Text style={{ fontSize: 12, color: '#84CC16', marginBottom: 8 }}>Calories range</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 4 }}>Min</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setCalPctInput(Math.max(50, calPctInput - 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#fff' }}>−</Text>
                    </TouchableOpacity>
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#84CC16' }}>{calPctInput}%</Text>
                    <TouchableOpacity activeOpacity={1} onPress={() => setCalPctInput(Math.min(calUpperPctInput - 1, calPctInput + 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#fff' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)', marginTop: 18 }}>–</Text>

                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 4 }}>Max</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <TouchableOpacity activeOpacity={1} onPress={() => setCalUpperPctInput(Math.max(calPctInput + 1, calUpperPctInput - 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#fff' }}>−</Text>
                    </TouchableOpacity>
                    <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#84CC16' }}>{calUpperPctInput}%</Text>
                    <TouchableOpacity activeOpacity={1} onPress={() => setCalUpperPctInput(Math.min(200, calUpperPctInput + 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: '#fff' }}>+</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Protein: min only */}
              <Text style={{ fontSize: 12, color: '#3B82F6', marginBottom: 8 }}>Protein minimum</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <TouchableOpacity activeOpacity={1} onPress={() => setProtPctInput(Math.max(50, protPctInput - 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#fff' }}>−</Text>
                </TouchableOpacity>
                <Text style={{ flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700', color: '#3B82F6' }}>{protPctInput}%</Text>
                <TouchableOpacity activeOpacity={1} onPress={() => setProtPctInput(Math.min(100, protPctInput + 1))} style={{ width: 34, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#fff' }}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={saveTargets} activeOpacity={1} style={{ backgroundColor: colors.brandPrimary, borderRadius: Radius.md, paddingVertical: spacing.base, alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditTargetsVisible(false)} activeOpacity={1} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: 13, color: colors.textTertiary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
