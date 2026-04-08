import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator, Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import {
  TrendingUp, TrendingDown, Minus, Trophy, Scale, Utensils,
  Dumbbell, CalendarDays, CheckCircle, AlertTriangle, Info,
  ChevronDown, ChevronUp, ChevronRight, Activity,
} from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useAnalytics } from '../hooks/useAnalytics';
import { Period, InsightType } from '../types';
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
      <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>{message}</Text>
      {sub && <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>{sub}</Text>}
    </View>
  );
}

function SkeletonBlock({ height = 16, width = '100%', radius = 6 }: { height?: number; width?: number | string; radius?: number }) {
  return <View style={{ height, width: width as any, borderRadius: radius, backgroundColor: 'rgba(255,255,255,0.06)' }} />;
}

const INSIGHT_CONFIG: Record<InsightType, { color: string; bg: string; border: string; Icon: React.ComponentType<any> }> = {
  success: { color: '#84CC16', bg: 'rgba(132,204,22,0.08)', border: 'rgba(132,204,22,0.25)', Icon: CheckCircle },
  warning: { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', Icon: AlertTriangle },
  info:    { color: '#3B82F6', bg: 'rgba(59,130,246,0.08)',  border: 'rgba(59,130,246,0.25)',  Icon: Info },
};

// ── Main screen ────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const { period, setPeriod, data, loading, saveThresholds } = useAnalytics();
  const navigation = useNavigation<AnalyticsNav>();
  const [chartsExpanded, setChartsExpanded] = useState(false);
  const [thresholdsVisible, setThresholdsVisible] = useState(false);
  const [calMin, setCalMin] = useState(85);
  const [calMax, setCalMax] = useState(115);
  const [protMin, setProtMin] = useState(85);

  const openThresholds = () => {
    setCalMin(data.goalThresholds.calorieMin);
    setCalMax(data.goalThresholds.calorieMax);
    setProtMin(data.goalThresholds.proteinMin);
    setThresholdsVisible(true);
  };

  const handleSaveThresholds = async () => {
    try { await saveThresholds(calMin, calMax, protMin); }
    finally { setThresholdsVisible(false); }
  };

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
  const unit = data?.unitLabel ?? 'kg';

  const { progress, consistency, goalHit, goalThresholds, insights } = data;
  const directionColor = progress.direction === 'losing' ? '#84CC16' : progress.direction === 'gaining' ? '#EF4444' : '#F59E0B';
  const DirectionIcon = progress.direction === 'losing' ? TrendingDown : progress.direction === 'gaining' ? TrendingUp : Minus;

  const calPct = goalHit.calorieDaysTracked > 0 ? Math.round((goalHit.calorieDaysHit / goalHit.calorieDaysTracked) * 100) : 0;
  const protPct = goalHit.proteinDaysTracked > 0 ? Math.round((goalHit.proteinDaysHit / goalHit.proteinDaysTracked) * 100) : 0;

  const hasTargetWeight = progress.targetWeight !== null && progress.currentWeight > 0;
  let targetPct = 0;
  if (hasTargetWeight && progress.targetWeight !== null) {
    const startApprox = progress.currentWeight - progress.weightChange;
    const totalNeeded = progress.targetWeight - startApprox;
    if (Math.abs(totalNeeded) > 0.01) {
      targetPct = Math.min(100, Math.max(0, Math.round((progress.weightChange / totalNeeded) * 100)));
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: spacing.base, marginBottom: spacing.base, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>Analytics</Text>
            <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Your progress at a glance</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('GoalTrackerCalendar')}
            activeOpacity={1}
            style={{
              marginTop: 4, width: 40, height: 40, borderRadius: 12,
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
              activeOpacity={1}
              style={{
                paddingHorizontal: 18, paddingVertical: 8, borderRadius: Radius.xl,
                backgroundColor: period === p ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                borderWidth: 1, borderColor: period === p ? '#3B82F6' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: period === p ? '#fff' : 'rgba(255,255,255,0.55)', textTransform: 'capitalize' }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Loading skeleton */}
        {loading && (
          <View style={{ gap: 12, marginBottom: spacing.base }}>
            <View style={[cardStyle, { gap: 10, marginBottom: 0 }]}>
              <SkeletonBlock height={14} width="50%" />
              <SkeletonBlock height={36} width="60%" />
              <SkeletonBlock height={8} />
              <SkeletonBlock height={12} width="40%" />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[cardStyle, { flex: 1, marginBottom: 0, gap: 8 }]}>
                <SkeletonBlock height={12} width="60%" />
                <SkeletonBlock height={32} width="50%" />
              </View>
              <View style={[cardStyle, { flex: 1, marginBottom: 0, gap: 8 }]}>
                <SkeletonBlock height={12} width="60%" />
                <SkeletonBlock height={32} width="50%" />
              </View>
            </View>
            <View style={[cardStyle, { gap: 8 }]}>
              <SkeletonBlock height={14} width="40%" />
              <SkeletonBlock height={50} />
              <SkeletonBlock height={50} />
            </View>
          </View>
        )}

        {!loading && (
          <>
            {/* ── 1. Weight Progress ── */}
            <View style={[cardStyle, { overflow: 'hidden' }]}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: `${directionColor}0D` }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Scale size={15} color={directionColor} />
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>Weight Progress</Text>
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{periodLabel}</Text>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 10 }}>
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${directionColor}20`,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <DirectionIcon size={22} color={directionColor} />
                </View>
                <View>
                  {data.hasWeightData ? (
                    <>
                      <Text style={{ fontSize: 30, fontWeight: '800', color: '#fff', lineHeight: 34 }}>
                        {progress.weightChange >= 0 ? '+' : ''}{progress.weightChange.toFixed(1)}
                        <Text style={{ fontSize: 16, fontWeight: '500', color: 'rgba(255,255,255,0.5)' }}> {unit}</Text>
                      </Text>
                      <Text style={{ fontSize: 12, color: directionColor, marginTop: 2 }}>
                        {progress.direction === 'losing' ? 'Losing' : progress.direction === 'gaining' ? 'Gaining' : 'Maintaining'}{' '}
                        · {Math.abs(progress.weeklyRate).toFixed(2)} {unit}/wk
                      </Text>
                    </>
                  ) : (
                    <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>No weight logged</Text>
                  )}
                </View>
                {progress.currentWeight > 0 && (
                  <View style={{ marginLeft: 'auto', alignItems: 'flex-end' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: '#fff' }}>{progress.currentWeight.toFixed(1)}</Text>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{unit} now</Text>
                  </View>
                )}
              </View>

              {hasTargetWeight && progress.targetWeight !== null && (
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>Progress to goal</Text>
                    <Text style={{ fontSize: 11, color: directionColor }}>
                      {progress.targetWeight.toFixed(1)} {unit} target · {targetPct}%
                    </Text>
                  </View>
                  <View style={{ height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                    <View style={{
                      width: `${Math.min(targetPct, 100)}%`,
                      height: 6, borderRadius: 3,
                      backgroundColor: directionColor,
                    }} />
                  </View>
                  {progress.weeksToGoal !== null && (
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 5, textAlign: 'right' }}>
                      ~{progress.weeksToGoal} week{progress.weeksToGoal !== 1 ? 's' : ''} to goal
                    </Text>
                  )}
                </View>
              )}
            </View>

            {/* ── 2. Consistency ── */}
              <View style={[cardStyle, { overflow: 'hidden' }]}>
              {/* Section header */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.85)' }}>Consistency</Text>
                <TouchableOpacity
                  onPress={openThresholds}
                  activeOpacity={1}
                  style={{
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: 'rgba(59,130,246,0.12)',
                    borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600' }}>Manage</Text>
                </TouchableOpacity>
              </View>

              {/* Workouts row */}
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Activity size={13} color="#84CC16" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>Workouts</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#84CC16', lineHeight: 24 }}>{consistency.score}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>%</Text>
                  </View>
                </View>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 6 }}>
                  {consistency.scheduled > 0
                    ? `${consistency.completed} of ${consistency.scheduled} scheduled days`
                    : 'Assign workouts to weekdays to track'}
                </Text>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <View style={{ width: `${consistency.score}%`, height: 4, borderRadius: 2, backgroundColor: '#84CC16' }} />
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

              {/* Calories row */}
              <View style={{ marginBottom: 14 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Utensils size={13} color="#F59E0B" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>Calories</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#F59E0B', lineHeight: 24 }}>{calPct}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>%</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {goalHit.calorieDaysTracked > 0
                      ? `${goalHit.calorieDaysHit} of ${goalHit.calorieDaysTracked} days in range`
                      : 'No meal data'}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(245,158,11,0.55)' }}>
                    {goalThresholds.calorieMin}%–{goalThresholds.calorieMax}% of target
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <View style={{ width: `${calPct}%`, height: 4, borderRadius: 2, backgroundColor: '#F59E0B' }} />
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 14 }} />

              {/* Protein row */}
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Dumbbell size={13} color="#A855F7" />
                    <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.65)' }}>Protein</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                    <Text style={{ fontSize: 22, fontWeight: '800', color: '#A855F7', lineHeight: 24 }}>{protPct}</Text>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>%</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {goalHit.proteinDaysTracked > 0
                      ? `${goalHit.proteinDaysHit} of ${goalHit.proteinDaysTracked} days hit target`
                      : 'No meal data'}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(168,85,247,0.55)' }}>
                    ≥{goalThresholds.proteinMin}% of target
                  </Text>
                </View>
                <View style={{ height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.08)' }}>
                  <View style={{ width: `${protPct}%`, height: 4, borderRadius: 2, backgroundColor: '#A855F7' }} />
                </View>
              </View>
              </View>

            {/* ── 3. Strength Analysis entry ── */}
            <TouchableOpacity
              onPress={() => navigation.navigate('Strength')}
              activeOpacity={1}
              style={{
                flexDirection: 'row', alignItems: 'center',
                backgroundColor: colors.backgroundSecondary,
                borderRadius: Radius.lg,
                borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
                padding: spacing.base,
                marginBottom: spacing.base,
                overflow: 'hidden',
              }}
            >
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(132,204,22,0.06)' }} />
              <View style={{
                width: 40, height: 40, borderRadius: 20,
                backgroundColor: 'rgba(132,204,22,0.15)',
                alignItems: 'center', justifyContent: 'center',
                marginRight: 14,
              }}>
                <Dumbbell size={20} color="#84CC16" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>Strength Analysis</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                  Track per-exercise trends · 1RM estimates · 30-day progress
                </Text>
              </View>
              <ChevronRight size={18} color="rgba(255,255,255,0.3)" />
            </TouchableOpacity>

            {/* ── 4. Personal Records ── */}
            <View style={[cardStyle, { overflow: 'hidden' }]}>
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(245,158,11,0.06)' }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <Trophy size={16} color="#F59E0B" />
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Personal Records</Text>
                <TouchableOpacity
                  onPress={() => navigation.navigate('PRManager')}
                  activeOpacity={1}
                  style={{
                    marginLeft: 'auto',
                    paddingHorizontal: 10, paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: 'rgba(59,130,246,0.12)',
                    borderWidth: 1, borderColor: 'rgba(59,130,246,0.25)',
                  }}
                >
                  <Text style={{ fontSize: 11, color: '#3B82F6', fontWeight: '600' }}>Manage</Text>
                </TouchableOpacity>
              </View>
              {data.personalRecords.length > 0 ? (
                data.personalRecords.map((record, i) => (
                  <View key={record.exerciseName}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>{record.exerciseName}</Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{formatDate(record.achievedAt)}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 18, fontWeight: '700', color: '#F59E0B' }}>{record.bestValue}</Text>
                        <Text style={{ fontSize: 11, color: 'rgba(245,158,11,0.6)' }}>{record.metricLabel}</Text>
                      </View>
                    </View>
                    {i < data.personalRecords.length - 1 && <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />}
                  </View>
                ))
              ) : (
                <EmptyState icon={<Trophy size={28} color="rgba(255,255,255,0.15)" />} message="No personal records yet" sub="Complete any workout to set your first PR" />
              )}
            </View>

            {/* ── 5. Insights ── */}
            {insights.length > 0 && (
              <View style={{ marginBottom: spacing.base }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 10 }}>
                  Insights
                </Text>
                {insights.map((insight, i) => {
                  const cfg = INSIGHT_CONFIG[insight.type];
                  const { Icon } = cfg;
                  return (
                    <View
                      key={i}
                      style={{
                        flexDirection: 'row', gap: 12, alignItems: 'flex-start',
                        backgroundColor: cfg.bg,
                        borderRadius: Radius.lg,
                        borderWidth: 1, borderColor: cfg.border,
                        padding: spacing.base,
                        marginBottom: spacing.sm,
                      }}
                    >
                      <View style={{
                        width: 32, height: 32, borderRadius: 16,
                        backgroundColor: `${cfg.color}20`,
                        alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0, marginTop: 1,
                      }}>
                        <Icon size={16} color={cfg.color} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '600', color: '#fff', marginBottom: 2 }}>
                          {insight.title}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 17 }}>
                          {insight.body}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ── 6. Detailed Charts (collapsible) ── */}
            <TouchableOpacity
              onPress={() => setChartsExpanded(v => !v)}
              activeOpacity={1}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingVertical: 12, paddingHorizontal: 16,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: Radius.lg,
                borderWidth: 1, borderColor: colors.border,
                marginBottom: chartsExpanded ? 12 : spacing.base,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                Detailed Charts
              </Text>
              {chartsExpanded
                ? <ChevronUp size={18} color="rgba(255,255,255,0.4)" />
                : <ChevronDown size={18} color="rgba(255,255,255,0.4)" />
              }
            </TouchableOpacity>

            {chartsExpanded && (
              <View style={cardStyle}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Scale size={15} color="#3B82F6" />
                    <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>Weight Trend</Text>
                  </View>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{periodLabel}</Text>
                </View>
                {data.hasWeightData ? (
                  <LineChart
                    data={{ labels: data.weightChart.labels, datasets: [{ data: data.weightChart.values, color: () => '#3B82F6', strokeWidth: 2 }] }}
                    width={CHART_WIDTH} height={190}
                    chartConfig={{ ...chartConfig, fillShadowGradient: '#3B82F6', fillShadowGradientOpacity: 0.15 }}
                    bezier withInnerLines withOuterLines={false} withDots={period === 'week'}
                    style={{ marginLeft: -16 }} fromZero={false}
                  />
                ) : (
                  <EmptyState icon={<Scale size={28} color="rgba(255,255,255,0.15)" />} message="No weight logged" sub="Log your weight from the Dashboard" />
                )}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ── Thresholds modal ── */}
      <Modal visible={thresholdsVisible} transparent animationType="fade" onRequestClose={() => setThresholdsVisible(false)}>
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setThresholdsVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => {}}
            style={{
              width: '88%',
              backgroundColor: colors.backgroundSecondary,
              borderRadius: Radius.xl,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.lg,
            }}
          >
            <Text style={{ fontSize: 17, fontWeight: '700', color: colors.textPrimary, marginBottom: 4 }}>Goal Thresholds</Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
              Set when a day counts as hitting your goal
            </Text>

            {/* Calorie range */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>Calorie range</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {/* Min */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Minimum %</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, padding: 8 }}>
                  <TouchableOpacity onPress={() => setCalMin(v => Math.max(50, Math.min(v - 5, calMax - 5)))} activeOpacity={1} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#3B82F6', fontWeight: '600' }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{calMin}%</Text>
                  <TouchableOpacity onPress={() => setCalMin(v => Math.min(v + 5, calMax - 5))} activeOpacity={1} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#3B82F6', fontWeight: '600' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
              {/* Max */}
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6 }}>Maximum %</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, padding: 8 }}>
                  <TouchableOpacity onPress={() => setCalMax(v => Math.max(calMin + 5, v - 5))} activeOpacity={1} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#3B82F6', fontWeight: '600' }}>−</Text>
                  </TouchableOpacity>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{calMax}%</Text>
                  <TouchableOpacity onPress={() => setCalMax(v => Math.min(200, v + 5))} activeOpacity={1} style={{ padding: 4 }}>
                    <Text style={{ fontSize: 18, color: '#3B82F6', fontWeight: '600' }}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Protein minimum */}
            <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>Protein minimum</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: Radius.md, padding: 8, marginBottom: 24 }}>
              <TouchableOpacity onPress={() => setProtMin(v => Math.max(50, v - 5))} activeOpacity={1} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: '#A855F7', fontWeight: '600' }}>−</Text>
              </TouchableOpacity>
              <Text style={{ fontSize: 16, fontWeight: '700', color: colors.textPrimary }}>{protMin}%</Text>
              <TouchableOpacity onPress={() => setProtMin(v => Math.min(100, v + 5))} activeOpacity={1} style={{ padding: 4 }}>
                <Text style={{ fontSize: 18, color: '#A855F7', fontWeight: '600' }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => setThresholdsVisible(false)}
                activeOpacity={1}
                style={{ flex: 1, paddingVertical: 13, borderRadius: Radius.lg, backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.55)' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveThresholds}
                activeOpacity={1}
                style={{ flex: 1, paddingVertical: 13, borderRadius: Radius.lg, backgroundColor: '#3B82F6', alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
