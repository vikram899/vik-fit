import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  Share,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronLeft,
  Dumbbell,
  Trophy,
  Calendar,
  Flame,
  TrendingUp,
  Footprints,
  Drumstick,
  X,
  CheckCircle,
} from 'lucide-react-native';
import { useTheme } from '@theme/index';
import { DashboardData } from '../types';
import { Radius } from '@theme/radius';

// ─── Types ───────────────────────────────────────────────────────────────────

type PostType = 'workout' | 'pr' | 'daily' | 'streak' | 'monthly';
type Screen = 'choose' | 'customize';

interface Props {
  data: DashboardData;
  onClose: () => void;
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────

function ToggleSwitch({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={1}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        backgroundColor: value ? '#84CC16' : 'rgba(255,255,255,0.15)',
        justifyContent: 'center',
        paddingHorizontal: 3,
      }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 11,
          backgroundColor: value ? '#000' : '#fff',
          alignSelf: value ? 'flex-end' : 'flex-start',
        }}
      />
    </TouchableOpacity>
  );
}

// ─── Preview Card ─────────────────────────────────────────────────────────────

function PreviewCard({
  postType,
  data,
  toggles,
  todayFormatted,
}: {
  postType: PostType;
  data: DashboardData;
  toggles: Record<string, boolean>;
  todayFormatted: string;
}) {
  const unit = data.user?.unitPreference === 'imperial' ? 'lbs' : 'kg';
  const completedToday = data.todaysWorkouts.filter((w) => w.isDone);

  const titleMap: Record<PostType, string> = {
    workout: 'Workout Completed',
    pr: 'Weight Milestone',
    daily: 'Daily Fitness Summary',
    streak: 'Streak Achievement!',
    monthly: 'Monthly Summary',
  };

  return (
    <View
      style={{
        backgroundColor: '#1A1D24',
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        overflow: 'hidden',
      }}
    >
      {/* Card header — app branding */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 16,
          paddingTop: 16,
          marginBottom: 14,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: '#84CC16',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Dumbbell size={16} color="#000" />
        </View>
        <View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#fff' }}>FitnessApp</Text>
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{todayFormatted}</Text>
        </View>
      </View>

      {/* Title banner */}
      <LinearGradient
        colors={['#84CC16', '#65A30D']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ marginHorizontal: 16, borderRadius: Radius.md, paddingVertical: 10, marginBottom: 16 }}
      >
        <Text style={{ fontSize: 14, fontWeight: '800', color: '#000', textAlign: 'center' }}>
          {titleMap[postType]}
        </Text>
      </LinearGradient>

      {/* Stats */}
      <View style={{ paddingHorizontal: 16, gap: 10, marginBottom: 16 }}>
        {postType === 'workout' && (
          <>
            {toggles.workoutName && (
              <StatRow
                label="Workout"
                value={
                  completedToday.length > 0
                    ? completedToday[0].name
                    : data.todaysWorkouts.length > 0
                    ? data.todaysWorkouts[0].name
                    : 'Rest Day'
                }
              />
            )}
            {toggles.exercises && completedToday.length > 0 && (
              <StatRow
                label="Exercises"
                value={`${completedToday[0].completedCount} / ${completedToday[0].exerciseCount}`}
                highlight
              />
            )}
            {toggles.workoutsCompleted && (
              <StatRow
                label="Workouts Done"
                value={`${completedToday.length} of ${data.todaysWorkouts.length}`}
                highlight={completedToday.length === data.todaysWorkouts.length && data.todaysWorkouts.length > 0}
              />
            )}
          </>
        )}

        {postType === 'pr' && data.user && (
          <>
            {toggles.currentWeight && (
              <StatRow label="Current Weight" value={`${data.user.weight} ${unit}`} highlight />
            )}
            {toggles.targetWeight && data.user.targetWeight != null && (
              <StatRow label="Target Weight" value={`${data.user.targetWeight} ${unit}`} />
            )}
            {toggles.goal && (
              <StatRow
                label="Goal"
                value={
                  data.user.goal === 'lose_weight'
                    ? 'Lose Weight'
                    : data.user.goal === 'gain_muscle'
                    ? 'Build Muscle'
                    : 'Maintain'
                }
              />
            )}
          </>
        )}

        {postType === 'daily' && data.user && (
          <>
            {toggles.calories && (
              <StatRow
                label="Calories"
                value={`${Math.round(data.todayMacros.calories)} / ${Math.round(data.user.targetCalories)} kcal`}
                highlight
              />
            )}
            {toggles.protein && (
              <StatRow
                label="Protein"
                value={`${Math.round(data.todayMacros.protein)}g / ${Math.round(data.user.targetProtein)}g`}
              />
            )}
            {toggles.workouts && (
              <StatRow
                label="Workouts"
                value={`${completedToday.length} completed`}
                highlight={completedToday.length > 0}
              />
            )}
            {toggles.streak && data.streak > 0 && (
              <StatRow label="Streak" value={`${data.streak} Days 🔥`} highlight />
            )}
          </>
        )}

        {postType === 'streak' && (
          <>
            {toggles.streakDays && (
              <View style={{ alignItems: 'center', paddingVertical: 8 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                  Current Streak
                </Text>
                <Text style={{ fontSize: 42, fontWeight: '800', color: '#84CC16' }}>
                  {data.streak} Days 🔥
                </Text>
              </View>
            )}
            {toggles.workoutsCompleted && (
              <StatRow
                label="Workouts Today"
                value={`${completedToday.length} completed`}
                highlight={completedToday.length > 0}
              />
            )}
          </>
        )}

        {postType === 'monthly' && data.user && (
          <>
            {toggles.calories && (
              <StatRow
                label="Today's Calories"
                value={`${Math.round(data.todayMacros.calories)} kcal`}
                highlight
              />
            )}
            {toggles.protein && (
              <StatRow
                label="Protein Today"
                value={`${Math.round(data.todayMacros.protein)}g`}
              />
            )}
            {toggles.streak && (
              <StatRow label="Current Streak" value={`${data.streak} Days`} highlight={data.streak >= 7} />
            )}
          </>
        )}
      </View>

      {/* Quote footer */}
      <View
        style={{
          marginHorizontal: 16,
          paddingTop: 12,
          borderTopWidth: 1,
          borderTopColor: 'rgba(255,255,255,0.08)',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textAlign: 'center', fontStyle: 'italic' }}>
          Consistency builds progress.
        </Text>
      </View>
    </View>
  );
}

function StatRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>{label}</Text>
      <Text
        style={{
          fontSize: 13,
          fontWeight: '600',
          color: highlight ? '#84CC16' : '#fff',
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ShareableCard({ data, onClose }: Props) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();

  const [screen, setScreen] = useState<Screen>('choose');
  const [postType, setPostType] = useState<PostType>('daily');
  const [isSharing, setIsSharing] = useState(false);

  // Per-type toggles
  const [workoutToggles, setWorkoutToggles] = useState({
    workoutName: true,
    exercises: true,
    workoutsCompleted: true,
  });
  const [prToggles, setPrToggles] = useState({
    currentWeight: true,
    targetWeight: true,
    goal: true,
  });
  const [dailyToggles, setDailyToggles] = useState({
    calories: true,
    protein: true,
    workouts: true,
    streak: true,
  });
  const [streakToggles, setStreakToggles] = useState({
    streakDays: true,
    workoutsCompleted: false,
  });
  const [monthlyToggles, setMonthlyToggles] = useState({
    calories: true,
    protein: true,
    streak: true,
  });

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const unit = data.user?.unitPreference === 'imperial' ? 'lbs' : 'kg';
  const completedToday = data.todaysWorkouts.filter((w) => w.isDone);

  const activeToggles =
    postType === 'workout'
      ? workoutToggles
      : postType === 'pr'
      ? prToggles
      : postType === 'daily'
      ? dailyToggles
      : postType === 'streak'
      ? streakToggles
      : monthlyToggles;

  const setActiveToggles = (key: string, val: boolean) => {
    if (postType === 'workout') setWorkoutToggles((t) => ({ ...t, [key]: val }));
    else if (postType === 'pr') setPrToggles((t) => ({ ...t, [key]: val }));
    else if (postType === 'daily') setDailyToggles((t) => ({ ...t, [key]: val }));
    else if (postType === 'streak') setStreakToggles((t) => ({ ...t, [key]: val }));
    else setMonthlyToggles((t) => ({ ...t, [key]: val }));
  };

  const buildShareText = () => {
    const lines: string[] = ['💪 My Fitness Progress | FitnessApp', ''];

    if (postType === 'workout') {
      lines.push('🏋️ Workout Completed!');
      if (workoutToggles.workoutName) {
        const name =
          completedToday.length > 0
            ? completedToday[0].name
            : data.todaysWorkouts.length > 0
            ? data.todaysWorkouts[0].name
            : 'Rest Day';
        lines.push(`Workout: ${name}`);
      }
      if (workoutToggles.exercises && completedToday.length > 0) {
        lines.push(
          `Exercises: ${completedToday[0].completedCount} / ${completedToday[0].exerciseCount}`
        );
      }
      if (workoutToggles.workoutsCompleted) {
        lines.push(`Workouts Done: ${completedToday.length} of ${data.todaysWorkouts.length}`);
      }
    } else if (postType === 'pr' && data.user) {
      lines.push('🏆 Weight Milestone!');
      if (prToggles.currentWeight) lines.push(`Current Weight: ${data.user.weight} ${unit}`);
      if (prToggles.targetWeight && data.user.targetWeight != null)
        lines.push(`Target: ${data.user.targetWeight} ${unit}`);
      if (prToggles.goal)
        lines.push(
          `Goal: ${data.user.goal === 'lose_weight' ? 'Lose Weight' : data.user.goal === 'gain_muscle' ? 'Build Muscle' : 'Maintain'}`
        );
    } else if (postType === 'daily' && data.user) {
      lines.push(`📅 Daily Fitness Summary — ${todayFormatted}`);
      if (dailyToggles.calories)
        lines.push(
          `Calories: ${Math.round(data.todayMacros.calories)} / ${Math.round(data.user.targetCalories)} kcal`
        );
      if (dailyToggles.protein)
        lines.push(
          `Protein: ${Math.round(data.todayMacros.protein)}g / ${Math.round(data.user.targetProtein)}g`
        );
      if (dailyToggles.workouts)
        lines.push(`Workouts: ${completedToday.length} completed`);
      if (dailyToggles.streak && data.streak > 0)
        lines.push(`Streak: ${data.streak} Days 🔥`);
    } else if (postType === 'streak') {
      lines.push('🔥 Streak Achievement!');
      if (streakToggles.streakDays) lines.push(`Current Streak: ${data.streak} Days 🔥`);
      if (streakToggles.workoutsCompleted)
        lines.push(`Workouts Today: ${completedToday.length} completed`);
    } else if (postType === 'monthly' && data.user) {
      lines.push('📊 Monthly Summary');
      if (monthlyToggles.calories)
        lines.push(`Today's Calories: ${Math.round(data.todayMacros.calories)} kcal`);
      if (monthlyToggles.protein)
        lines.push(`Protein: ${Math.round(data.todayMacros.protein)}g`);
      if (monthlyToggles.streak) lines.push(`Streak: ${data.streak} Days`);
    }

    lines.push('', 'Tracked with FitnessApp 🏋️‍♂️');
    return lines.join('\n');
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      await Share.share({ message: buildShareText() });
    } catch {
      // User cancelled
    } finally {
      setIsSharing(false);
    }
  };

  // ── Screen 1: Choose post type ─────────────────────────────────────────────

  const templates: {
    id: PostType;
    icon: React.ElementType;
    title: string;
    description: string;
    color: string;
  }[] = [
    {
      id: 'workout',
      icon: Dumbbell,
      title: 'Workout Completed',
      description: 'Share your completed workout',
      color: '#3B82F6',
    },
    {
      id: 'pr',
      icon: Trophy,
      title: 'Weight Milestone',
      description: 'Celebrate weight progress',
      color: '#F59E0B',
    },
    {
      id: 'daily',
      icon: Calendar,
      title: 'Daily Summary',
      description: "Today's fitness snapshot",
      color: '#22D3EE',
    },
    {
      id: 'streak',
      icon: Flame,
      title: 'Streak Achievement',
      description: 'Celebrate your consistency',
      color: '#F97316',
    },
    {
      id: 'monthly',
      icon: TrendingUp,
      title: 'Monthly Summary',
      description: 'Your monthly fitness stats',
      color: '#A855F7',
    },
  ];

  const toggleOptions: Record<PostType, { key: string; label: string; icon: React.ElementType }[]> = {
    workout: [
      { key: 'workoutName', label: 'Workout Name', icon: Dumbbell },
      { key: 'exercises', label: 'Exercises Completed', icon: CheckCircle },
      { key: 'workoutsCompleted', label: 'Workouts Done', icon: CheckCircle },
    ],
    pr: [
      { key: 'currentWeight', label: 'Current Weight', icon: TrendingUp },
      { key: 'targetWeight', label: 'Target Weight', icon: TrendingUp },
      { key: 'goal', label: 'Goal', icon: Trophy },
    ],
    daily: [
      { key: 'calories', label: 'Calories', icon: Flame },
      { key: 'protein', label: 'Protein', icon: Drumstick },
      { key: 'workouts', label: 'Workouts', icon: Dumbbell },
      { key: 'streak', label: 'Streak', icon: Flame },
    ],
    streak: [
      { key: 'streakDays', label: 'Streak Days', icon: Flame },
      { key: 'workoutsCompleted', label: 'Workouts Today', icon: Dumbbell },
    ],
    monthly: [
      { key: 'calories', label: "Today's Calories", icon: Flame },
      { key: 'protein', label: 'Protein', icon: Drumstick },
      { key: 'streak', label: 'Streak', icon: Flame },
    ],
  };

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0E0E11' }}>
        {screen === 'choose' ? (
          <>
            {/* Header */}
            <View
              style={{
                paddingTop: insets.top + 12,
                paddingHorizontal: 16,
                paddingBottom: 16,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                <TouchableOpacity onPress={onClose} activeOpacity={1} style={{ marginRight: 12 }}>
                  <X size={22} color="#fff" />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
                  Create Share Post
                </Text>
              </View>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginLeft: 34 }}>
                Select a template to share your progress
              </Text>
            </View>

            {/* Template list */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {templates.map((t) => {
                const Icon = t.icon;
                return (
                  <TouchableOpacity
                    key={t.id}
                    activeOpacity={1}
                    onPress={() => {
                      setPostType(t.id);
                      setScreen('customize');
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      borderRadius: Radius.xl,
                      borderWidth: 1,
                      borderColor: 'rgba(255,255,255,0.08)',
                      padding: 16,
                    }}
                  >
                    <View
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 14,
                        backgroundColor: t.color + '22',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} color={t.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 3 }}>
                        {t.title}
                      </Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
                        {t.description}
                      </Text>
                    </View>
                    <ChevronLeft
                      size={18}
                      color="rgba(255,255,255,0.25)"
                      style={{ transform: [{ rotate: '180deg' }] }}
                    />
                  </TouchableOpacity>
                );
              })}
              <View style={{ height: insets.bottom }} />
            </ScrollView>
          </>
        ) : (
          <>
            {/* Header */}
            <View
              style={{
                paddingTop: insets.top + 12,
                paddingHorizontal: 16,
                paddingBottom: 14,
                borderBottomWidth: 1,
                borderBottomColor: 'rgba(255,255,255,0.08)',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <TouchableOpacity
                onPress={() => setScreen('choose')}
                activeOpacity={1}
                style={{ marginRight: 12 }}
              >
                <ChevronLeft size={24} color="#fff" />
              </TouchableOpacity>
              <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff' }}>
                Customize Post
              </Text>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ padding: 16, gap: 20 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Live preview */}
              <PreviewCard
                postType={postType}
                data={data}
                toggles={activeToggles}
                todayFormatted={todayFormatted}
              />

              {/* Toggle options */}
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  borderRadius: Radius.xl,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.08)',
                  padding: 16,
                  gap: 16,
                }}
              >
                <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                  Show in post
                </Text>
                {toggleOptions[postType].map((opt) => {
                  const Icon = opt.icon;
                  const val = (activeToggles as any)[opt.key] as boolean;
                  return (
                    <View
                      key={opt.key}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <Icon size={16} color={val ? '#84CC16' : 'rgba(255,255,255,0.4)'} />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: val ? '#fff' : 'rgba(255,255,255,0.5)',
                          }}
                        >
                          {opt.label}
                        </Text>
                      </View>
                      <ToggleSwitch value={val} onToggle={() => setActiveToggles(opt.key, !val)} />
                    </View>
                  );
                })}
              </View>

              <View style={{ height: insets.bottom + 80 }} />
            </ScrollView>

            {/* Share button */}
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                paddingHorizontal: 16,
                paddingTop: 12,
                paddingBottom: insets.bottom + 12,
                backgroundColor: '#0E0E11',
                borderTopWidth: 1,
                borderTopColor: 'rgba(255,255,255,0.08)',
              }}
            >
              <TouchableOpacity
                onPress={handleShare}
                activeOpacity={1}
                disabled={isSharing}
                style={{ borderRadius: Radius.md, overflow: 'hidden' }}
              >
                <LinearGradient
                  colors={['#84CC16', '#65A30D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                    gap: 8,
                  }}
                >
                  {isSharing ? (
                    <ActivityIndicator color="#000" size="small" />
                  ) : (
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#000' }}>
                      Share Post
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </Modal>
  );
}
