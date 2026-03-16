import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, ActivityIndicator, TouchableOpacity,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { User, Target, Trophy, Settings, ChevronRight, Calendar, Flame, Award, RotateCcw, Zap } from 'lucide-react-native';
import { useProfile } from '../hooks/useProfile';
import { StreakCondition } from '@shared/types/common';
import { createProfileStyles } from '../styles';
import { formatWeight, formatHeight } from '@shared/utils/formatUtils';
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

const PERSONAL_RECORDS = [
  { exercise: 'Bench Press', weight: '—', reps: '1RM' },
  { exercise: 'Squat', weight: '—', reps: '1RM' },
  { exercise: 'Deadlift', weight: '—', reps: '1RM' },
];

const SETTINGS_ITEMS: { label: string; Icon: React.ComponentType<{ size: number; color: string }> }[] = [
  { label: 'Account Settings', Icon: User },
  { label: 'Notifications', Icon: Settings },
  { label: 'Privacy & Security', Icon: Settings },
  { label: 'Help & Support', Icon: Settings },
];

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
  const { user, nutrition, workoutCount, streak, loading, saveNutritionTargets, saveStreakCondition } = useProfile();
  const { setHasUser } = useAuth();

  const [editTargetsVisible, setEditTargetsVisible] = useState(false);
  const [calInput, setCalInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');

  const [streakPickerVisible, setStreakPickerVisible] = useState(false);

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

  const STAT_TILES = [
    { label: 'Workouts', value: String(workoutCount), Icon: Trophy, color: '#3B82F6' },
    { label: 'Streak',   value: `${streak}d`,          Icon: Flame,   color: '#F59E0B' },
    { label: 'PRs',      value: '—',                   Icon: Award,   color: '#84CC16' },
    { label: 'Days Active', value: '—',                Icon: Calendar, color: '#A855F7' },
  ];

  const weightStr       = formatWeight(user.weight, user.unitPreference);
  const heightStr       = formatHeight(user.height, user.unitPreference);
  const targetWeightStr = user.targetWeight ? formatWeight(user.targetWeight, user.unitPreference) : '—';

  const BODY_STATS = [
    { label: 'Weight', value: weightStr },
    { label: 'Body Fat', value: '—' },
    { label: 'Height', value: heightStr },
    { label: 'BMI', value: bmi },
  ];

  const computedCalories = nutrition ? Math.round(nutrition.targetCalories) : 0;
  const computedProtein  = nutrition ? Math.round(nutrition.proteinGrams) : 0;
  const effectiveCalories = user?.targetCaloriesOverride ?? computedCalories;
  const effectiveProtein  = user?.targetProteinOverride  ?? computedProtein;
  const hasCustomTargets  = user?.targetCaloriesOverride != null || user?.targetProteinOverride != null;

  const openEditTargets = () => {
    setCalInput(String(effectiveCalories));
    setProteinInput(String(effectiveProtein));
    setEditTargetsVisible(true);
  };

  const saveTargets = async () => {
    const cal  = parseInt(calInput, 10);
    const prot = parseInt(proteinInput, 10);
    await saveNutritionTargets(
      !isNaN(cal)  && cal  !== computedCalories ? cal  : null,
      !isNaN(prot) && prot !== computedProtein  ? prot : null,
    );
    setEditTargetsVisible(false);
  };

  const resetTargets = async () => {
    await saveNutritionTargets(null, null);
    setEditTargetsVisible(false);
  };

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

        {/* ── Stats Grid ── */}
        <View style={s.statsGrid}>
          {STAT_TILES.map((tile) => (
            <View key={tile.label} style={s.statTile}>
              <View style={[s.statIconBox, { backgroundColor: tile.color + '33' }]}>
                <tile.Icon size={18} color={tile.color} />
              </View>
              <Text style={[s.statValue, { color: tile.color }]}>{tile.value}</Text>
              <Text style={s.statLabel}>{tile.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Body Stats ── */}
        <View style={s.card}>
          <Text style={s.cardStandaloneTitle}>Body Stats</Text>
          {BODY_STATS.map((row, idx) => (
            <View
              key={row.label}
              style={[s.bodyStatRow, idx === BODY_STATS.length - 1 && { borderBottomWidth: 0 }]}
            >
              <Text style={s.bodyStatLabel}>{row.label}</Text>
              <View style={s.bodyStatRight}>
                <Text style={s.bodyStatValue}>{row.value}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Fitness Goals ── */}
        <View style={s.card}>
          <View style={s.greenOverlay} />
          <View style={s.cardHeader}>
            <View style={s.cardHeaderLeft}>
              <Target size={18} color="#84CC16" />
              <Text style={s.cardHeaderTitle}>Fitness Goals</Text>
            </View>
            <TouchableOpacity onPress={openEditTargets} activeOpacity={1}>
              <Text style={s.linkBtn}>{hasCustomTargets ? 'Edit ✦' : 'Edit'}</Text>
            </TouchableOpacity>
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

        {/* ── Personal Records ── */}
        <View style={s.card}>
          <View style={s.amberOverlay} />
          <View style={s.cardHeader}>
            <View style={s.cardHeaderLeft}>
              <Trophy size={18} color="#F59E0B" />
              <Text style={s.cardHeaderTitle}>Personal Records</Text>
            </View>
            <TouchableOpacity>
              <Text style={s.linkBtn}>View All</Text>
            </TouchableOpacity>
          </View>
          {PERSONAL_RECORDS.map((record) => (
            <View key={record.exercise} style={s.prRow}>
              <Text style={s.prExercise}>{record.exercise}</Text>
              <View style={s.prRight}>
                <Text style={s.prWeight}>{record.weight}</Text>
                <Text style={s.prReps}>{record.reps}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* ── Settings ── */}
        <View style={s.settingsSection}>
          {/* Streak Goal row */}
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

          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={s.settingsItem} activeOpacity={1}>
              <View style={s.settingsItemLeft}>
                <item.Icon size={20} color="rgba(255,255,255,0.6)" />
                <Text style={s.settingsItemLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color="rgba(255,255,255,0.4)" />
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Footer ── */}
        <View style={s.footer}>
          <Text style={s.footerText}>FitTrack Pro v2.0.1</Text>
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
