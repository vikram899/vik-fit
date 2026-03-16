import React, { useMemo } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { User, Target, Trophy, Settings, ChevronRight, Calendar, Flame, Award } from 'lucide-react-native';
import { useProfile } from '../hooks/useProfile';
import { createProfileStyles } from '../styles';
import { formatWeight, formatHeight } from '@shared/utils/formatUtils';
import { useAuth } from '@core/AuthContext';

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

export default function ProfileScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => createProfileStyles(colors), [colors]);
  const { user, nutrition, workoutCount, streak, loading } = useProfile();
  const { setHasUser } = useAuth();

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

  const heightM = user.height / 100;
  const bmi = (user.weight / (heightM * heightM)).toFixed(1);
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

  const FITNESS_GOALS = [
    {
      goal: 'Weight Goal',
      current: weightStr,
      target: targetWeightStr,
    },
    {
      goal: 'Daily Calories',
      current: nutrition ? `${Math.round(nutrition.targetCalories)} kcal` : '—',
      target:  nutrition ? `${Math.round(nutrition.targetCalories)} kcal` : '—',
    },
    {
      goal: 'Protein Intake',
      current: nutrition ? `${Math.round(nutrition.proteinGrams)}g` : '—',
      target:  nutrition ? `${Math.round(nutrition.proteinGrams)}g` : '—',
    },
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
          <TouchableOpacity style={s.headerBtn} activeOpacity={0.7}>
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
            <TouchableOpacity>
              <Text style={s.linkBtn}>Edit</Text>
            </TouchableOpacity>
          </View>
          {FITNESS_GOALS.map((item) => (
            <View key={item.goal} style={s.goalRow}>
              <Text style={s.goalLabel}>{item.goal}</Text>
              <View style={s.goalRight}>
                <Text style={s.goalCurrent}>{item.current}</Text>
                <Text style={s.goalArrow}>→</Text>
                <Text style={s.goalTarget}>{item.target}</Text>
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
          {SETTINGS_ITEMS.map((item) => (
            <TouchableOpacity key={item.label} style={s.settingsItem} activeOpacity={0.7}>
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
          activeOpacity={0.75}
        >
          <Text style={{ color: '#EF4444', fontWeight: '600', fontSize: 14 }}>
            [DEV] Go to Onboarding
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
