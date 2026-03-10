import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import {
  TrendingUp, TrendingDown, Activity, Trophy, Minus,
  Scale, Utensils, Dumbbell, CalendarDays,
} from 'lucide-react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { useAnalytics } from '../hooks/useAnalytics';
import { Period } from '../types';
import { formatDate } from '@shared/utils/dateUtils';
import { AnalyticsStackParamList } from '../../../core/navigation/stacks/AnalyticsStack';

type AnalyticsNav = NativeStackNavigationProp<AnalyticsStackParamList, 'Analytics'>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH  = SCREEN_WIDTH - Layout.screenPaddingHorizontal * 2 - 32;

// ── Sub-components ─────────────────────────────────────────────────────────

function EmptyState({ icon, message, sub }: { icon: React.ReactNode; message: string; sub?: string }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 32, gap: 6 }}>
      {icon}
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
        {message}
      </Text>
      {sub && (
        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
          {sub}
        </Text>
      )}
    </View>
  );
}

function SkeletonBlock({ height = 16, width = '100%', radius = 6 }: {
  height?: number; width?: number | string; radius?: number;
}) {
  return (
    <View
      style={{
        height,
        width: width as any,
        borderRadius: radius,
        backgroundColor: 'rgba(255,255,255,0.06)',
      }}
    />
  );
}

// ── Main screen ────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const { period, setPeriod, data, loading } = useAnalytics();

  const cardStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.base,
  };

  const chartConfig = {
    backgroundGradientFrom: colors.backgroundSecondary,
    backgroundGradientTo:   colors.backgroundSecondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
    labelColor: () => 'rgba(255,255,255,0.45)',
    propsForDots: { r: '3', strokeWidth: '1', stroke: colors.backgroundSecondary },
    propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 4' },
    style: { borderRadius: Radius.lg },
  };

  const periodLabel = period === 'week' ? '7 days' : period === 'month' ? '30 days' : '12 months';

  // ── Stats values ──
  const stats = data?.stats;
  const weightChange = stats?.weightChange ?? 0;
  const weightChangePct = stats?.weightChangePct ?? 0;
  const isWeightLoss = weightChange < 0;
  const isWeightGain = weightChange > 0;
  const weightChangeColor = isWeightLoss ? '#84CC16' : isWeightGain ? '#EF4444' : '#F59E0B';
  const weightChangeIcon = isWeightLoss
    ? <TrendingDown size={16} color={weightChangeColor} />
    : isWeightGain
      ? <TrendingUp size={16} color={weightChangeColor} />
      : <Minus size={16} color={weightChangeColor} />;

  const unit = data?.unitLabel ?? 'kg';
  const avgWorkouts = stats ? stats.avgWorkoutsPerWeek.toFixed(1) : '—';
  const navigation = useNavigation<AnalyticsNav>();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: spacing.base, marginBottom: spacing.base, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>Analytics</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
              Track your progress
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('GoalTrackerCalendar')}
            activeOpacity={0.75}
            style={{
              marginTop: 4,
              width: 40, height: 40, borderRadius: 12,
              backgroundColor: 'rgba(59,130,246,0.12)',
              borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CalendarDays size={20} color="#3B82F6" />
          </TouchableOpacity>
        </View>

        {/* Period selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.base }}>
          {(['week', 'month', 'year'] as Period[]).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.xl,
                backgroundColor: period === p ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: period === p ? '#3B82F6' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: period === p ? '#fff' : 'rgba(255,255,255,0.55)',
                textTransform: 'capitalize',
              }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading skeleton */}
        {loading && (
          <View style={{ gap: 12, marginBottom: spacing.base }}>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[cardStyle, { flex: 1, marginBottom: 0, gap: 8 }]}>
                <SkeletonBlock height={12} width="60%" />
                <SkeletonBlock height={24} width="40%" />
                <SkeletonBlock height={10} width="70%" />
              </View>
              <View style={[cardStyle, { flex: 1, marginBottom: 0, gap: 8 }]}>
                <SkeletonBlock height={12} width="60%" />
                <SkeletonBlock height={24} width="40%" />
                <SkeletonBlock height={10} width="70%" />
              </View>
            </View>
            <View style={[cardStyle, { gap: 12 }]}>
              <SkeletonBlock height={14} width="50%" />
              <SkeletonBlock height={160} />
            </View>
            <View style={[cardStyle, { gap: 12 }]}>
              <SkeletonBlock height={14} width="50%" />
              <SkeletonBlock height={160} />
            </View>
          </View>
        )}

        {/* Actual content */}
        {!loading && (
          <>
            {/* Key stats row */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.base }}>
              {/* Weight Change */}
              <View style={[cardStyle, { flex: 1, marginBottom: 0, overflow: 'hidden' }]}>
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: `${weightChangeColor}14`,
                }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  {weightChangeIcon}
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Weight</Text>
                </View>
                {data.hasWeightData ? (
                  <>
                    <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>
                      {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} {unit}
                    </Text>
                    <Text style={{ fontSize: 11, color: weightChangeColor, marginTop: 4 }}>
                      {isWeightLoss ? '↓' : isWeightGain ? '↑' : '→'}{' '}
                      {Math.abs(weightChangePct).toFixed(1)}% in {periodLabel}
                    </Text>
                  </>
                ) : (
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
                    No data
                  </Text>
                )}
              </View>

              {/* Workouts */}
              <View style={[cardStyle, { flex: 1, marginBottom: 0, overflow: 'hidden' }]}>
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: 'rgba(59,130,246,0.08)',
                }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Activity size={16} color="#3B82F6" />
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>Workouts</Text>
                </View>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff' }}>
                  {stats?.totalWorkouts ?? 0}
                  <Text style={{ fontSize: 13, fontWeight: '400', color: 'rgba(255,255,255,0.4)' }}>
                    {' '}total
                  </Text>
                </Text>
                <Text style={{ fontSize: 11, color: '#3B82F6', marginTop: 4 }}>
                  {avgWorkouts}/wk avg in {periodLabel}
                </Text>
              </View>
            </View>

            {/* Weight Trend */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Scale size={15} color="#3B82F6" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                    Weight Trend
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {data.stats.latestWeight > 0
                    ? `${data.stats.latestWeight.toFixed(1)} ${unit} now`
                    : periodLabel}
                </Text>
              </View>

              {data.hasWeightData ? (
                <LineChart
                  data={{
                    labels: data.weightChart.labels,
                    datasets: [{
                      data: data.weightChart.values,
                      color: () => '#3B82F6',
                      strokeWidth: 2,
                    }],
                  }}
                  width={CHART_WIDTH}
                  height={190}
                  chartConfig={{
                    ...chartConfig,
                    fillShadowGradient: '#3B82F6',
                    fillShadowGradientOpacity: 0.15,
                  }}
                  bezier
                  withInnerLines
                  withOuterLines={false}
                  withDots={period === 'week'}
                  style={{ marginLeft: -16 }}
                  fromZero={false}
                />
              ) : (
                <EmptyState
                  icon={<Scale size={28} color="rgba(255,255,255,0.15)" />}
                  message="No weight logged in this period"
                  sub="Log your weight from the Dashboard"
                />
              )}
            </View>

            {/* Calorie Intake */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Utensils size={15} color="#F59E0B" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                    Calorie Intake
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {period === 'week' ? 'Daily totals' : period === 'month' ? 'Weekly totals' : 'Monthly totals'}
                </Text>
              </View>

              {data.hasCaloriesData ? (
                <BarChart
                  data={{
                    labels: data.caloriesChart.labels,
                    datasets: [{ data: data.caloriesChart.values }],
                  }}
                  width={CHART_WIDTH}
                  height={190}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(245,158,11,${opacity})`,
                    barPercentage: period === 'year' ? 0.5 : 0.65,
                  }}
                  withInnerLines
                  withHorizontalLabels
                  showBarTops={false}
                  style={{ marginLeft: -16 }}
                  yAxisLabel=""
                  yAxisSuffix=""
                  fromZero
                />
              ) : (
                <EmptyState
                  icon={<Utensils size={28} color="rgba(255,255,255,0.15)" />}
                  message="No meals logged in this period"
                  sub="Log meals to see calorie trends"
                />
              )}
            </View>

            {/* Strength Progress */}
            <View style={cardStyle}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Dumbbell size={15} color="#A855F7" />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                    Top Lifts
                  </Text>
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  Max weight • {periodLabel}
                </Text>
              </View>

              {data.hasStrengthData ? (
                <BarChart
                  data={{
                    labels: data.strengthChart.labels,
                    datasets: [{ data: data.strengthChart.values }],
                  }}
                  width={CHART_WIDTH}
                  height={190}
                  chartConfig={{
                    ...chartConfig,
                    color: (opacity = 1) => `rgba(168,85,247,${opacity})`,
                    barPercentage: 0.6,
                  }}
                  withInnerLines
                  withHorizontalLabels
                  showBarTops={false}
                  style={{ marginLeft: -16 }}
                  yAxisLabel=""
                  yAxisSuffix={` ${unit}`}
                  fromZero
                />
              ) : (
                <EmptyState
                  icon={<Dumbbell size={28} color="rgba(255,255,255,0.15)" />}
                  message="No strength data in this period"
                  sub="Complete a workout with weighted exercises"
                />
              )}
            </View>

            {/* Personal Records */}
            <View style={[cardStyle, { marginBottom: 0, overflow: 'hidden' }]}>
              <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'rgba(245,158,11,0.06)',
              }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Trophy size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
                  Personal Records
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginLeft: 'auto' }}>
                  All-time
                </Text>
              </View>

              {data.personalRecords.length > 0 ? (
                data.personalRecords.map((record, i) => (
                  <View key={record.exerciseName}>
                    <View style={{
                      flexDirection: 'row', alignItems: 'center',
                      justifyContent: 'space-between', paddingVertical: 10,
                    }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>
                          {record.exerciseName}
                        </Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                          {formatDate(record.achievedAt)}
                        </Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#F59E0B' }}>
                          {record.maxWeight}
                        </Text>
                        <Text style={{ fontSize: 11, color: 'rgba(245,158,11,0.6)' }}>{unit}</Text>
                      </View>
                    </View>
                    {i < data.personalRecords.length - 1 && (
                      <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
                    )}
                  </View>
                ))
              ) : (
                <EmptyState
                  icon={<Trophy size={28} color="rgba(255,255,255,0.15)" />}
                  message="No personal records yet"
                  sub="Complete a weighted workout to set your first PR"
                />
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
