import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { TrendingUp, TrendingDown, Minus, ChevronLeft, Dumbbell } from 'lucide-react-native';
import { LineChart } from 'react-native-chart-kit';
import { useStrength, TrendDirection, ExerciseTrendData } from '../hooks/useStrength';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - Layout.screenPaddingHorizontal * 2 - 32;

const TREND_COLOR: Record<TrendDirection, string> = {
  improving: '#84CC16',
  stable: '#F59E0B',
  declining: '#EF4444',
};

const TREND_LABEL: Record<TrendDirection, string> = {
  improving: 'Improving',
  stable: 'Stable',
  declining: 'Declining',
};

const TREND_ARROW: Record<TrendDirection, string> = {
  improving: '↑',
  stable: '➖',
  declining: '↓',
};

function TrendIcon({ trend, size = 18 }: { trend: TrendDirection; size?: number }) {
  const color = TREND_COLOR[trend];
  if (trend === 'improving') return <TrendingUp size={size} color={color} />;
  if (trend === 'declining') return <TrendingDown size={size} color={color} />;
  return <Minus size={size} color={color} />;
}

function buildChartData(ex: ExerciseTrendData): { labels: string[]; values: number[] } {
  if (ex.sessions.length === 0) return { labels: [], values: [] };
  const points = ex.sessions.map(s => ({
    label: s.date.slice(5), // MM-DD
    value: Math.round(
      ex.exerciseType === 'strength'
        ? (s.estimated1RM > 0 ? s.estimated1RM : s.maxWeight)
        : ex.exerciseType === 'bodyweight'
        ? s.maxReps
        : parseFloat((s.maxDuration / 60).toFixed(1))
    ),
  }));
  // If too many points, thin out to max 8
  const max = 8;
  let thinned = points;
  if (points.length > max) {
    const step = Math.ceil(points.length / max);
    thinned = points.filter((_, i) => i % step === 0 || i === points.length - 1);
  }
  return { labels: thinned.map(p => p.label), values: thinned.map(p => p.value) };
}

function buildInsight(ex: ExerciseTrendData): string {
  const { trend, trendPct, sessions } = ex;
  if (sessions.length < 2) return 'Not enough sessions to detect a trend yet.';
  if (trend === 'improving') {
    if (trendPct >= 10) return `Excellent progress! You've improved by ${trendPct}% over the last 30 days.`;
    return `Good work — consistent improvement of ${trendPct}% in the last 30 days.`;
  }
  if (trend === 'declining') {
    return `Performance dropped by ${Math.abs(trendPct)}%. Consider checking your recovery and nutrition.`;
  }
  return 'Performance is stable. Keep training consistently to push past this plateau.';
}

export default function StrengthScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();
  const { exercises, selectedId, setSelectedId, selectedExercise, overallTrend, unitLabel, loading } = useStrength();
  const scrollRef = useRef<ScrollView>(null);

  const overallColor = TREND_COLOR[overallTrend.trend];

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
    backgroundGradientTo: colors.backgroundSecondary,
    decimalPlaces: 1,
    color: (opacity = 1) => `rgba(132,204,22,${opacity})`,
    labelColor: () => 'rgba(255,255,255,0.45)',
    propsForDots: { r: '4', strokeWidth: '2', stroke: '#84CC16' },
    propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 4' },
    style: { borderRadius: Radius.lg },
  };

  const selectedChartData = selectedExercise ? buildChartData(selectedExercise) : null;
  const hasChart = selectedChartData !== null && selectedChartData.values.length >= 2;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: Layout.screenPaddingHorizontal,
        paddingTop: spacing.base, paddingBottom: spacing.sm,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={1} style={{ padding: 4 }}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>Strength</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>Last 30 days</Text>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#84CC16" />
        </View>
      ) : exercises.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 32 }}>
          <Dumbbell size={48} color="rgba(255,255,255,0.15)" />
          <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.4)', textAlign: 'center' }}>No strength data yet</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
            Complete workouts with weighted or bodyweight exercises to see your strength trend.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: 40, paddingTop: spacing.sm }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── 1. Overall Strength Trend Card ── */}
          <View style={[cardStyle, { overflow: 'hidden' }]}>
            <View style={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: `${overallColor}0D`,
            }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Strength Trend · Last 30 Days
              </Text>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
                backgroundColor: `${overallColor}20`, borderWidth: 1, borderColor: `${overallColor}40`,
              }}>
                <Text style={{ fontSize: 11, fontWeight: '700', color: overallColor }}>
                  {TREND_ARROW[overallTrend.trend]} {TREND_LABEL[overallTrend.trend]}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{
                width: 52, height: 52, borderRadius: 26,
                backgroundColor: `${overallColor}20`,
                alignItems: 'center', justifyContent: 'center',
              }}>
                <TrendIcon trend={overallTrend.trend} size={24} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '800', color: '#fff', lineHeight: 22 }}>
                  {overallTrend.trend === 'improving'
                    ? 'Your strength is improving 🟢'
                    : overallTrend.trend === 'declining'
                    ? 'Strength is declining 🔴'
                    : 'Strength is stable 🟡'}
                </Text>
                {overallTrend.trendPct !== 0 && (
                  <Text style={{ fontSize: 13, color: overallColor, marginTop: 4 }}>
                    {overallTrend.trendPct > 0 ? '+' : ''}{overallTrend.trendPct}% improvement across {overallTrend.exerciseCount} exercise{overallTrend.exerciseCount !== 1 ? 's' : ''}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* ── 2. Exercise chips ── */}
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 2, gap: 8 }}
            style={{ marginBottom: spacing.base, marginHorizontal: -Layout.screenPaddingHorizontal, paddingHorizontal: Layout.screenPaddingHorizontal }}
          >
            {exercises.map(ex => {
              const isSelected = ex.exerciseTemplateId === selectedId;
              const tColor = TREND_COLOR[ex.trend];
              return (
                <TouchableOpacity
                  key={ex.exerciseTemplateId}
                  onPress={() => setSelectedId(ex.exerciseTemplateId)}
                  activeOpacity={1}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 6,
                    paddingHorizontal: 14, paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: isSelected ? 'rgba(132,204,22,0.15)' : 'rgba(255,255,255,0.05)',
                    borderWidth: 1.5,
                    borderColor: isSelected ? '#84CC16' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: isSelected ? '700' : '500', color: isSelected ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                    {ex.exerciseName}
                  </Text>
                  <Text style={{ fontSize: 12, color: tColor, fontWeight: '700' }}>
                    {TREND_ARROW[ex.trend]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* ── 3 + 4. Selected Exercise Detail + Graph ── */}
          {selectedExercise && (
            <>
              {/* Detail header */}
              <View style={[cardStyle, { overflow: 'hidden', marginBottom: 10 }]}>
                <View style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  backgroundColor: `${TREND_COLOR[selectedExercise.trend]}0A`,
                }} />
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1, marginRight: 12 }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#fff', marginBottom: 4 }}>
                      {selectedExercise.exerciseName}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <TrendIcon trend={selectedExercise.trend} size={14} />
                      <Text style={{ fontSize: 13, color: TREND_COLOR[selectedExercise.trend], fontWeight: '600' }}>
                        {TREND_LABEL[selectedExercise.trend]}
                      </Text>
                      {selectedExercise.trendPct !== 0 && (
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                          · {selectedExercise.trendPct > 0 ? '+' : ''}{selectedExercise.trendPct}% in 30 days
                        </Text>
                      )}
                    </View>
                  </View>
                  {/* Latest value */}
                  {selectedExercise.sessions.length > 0 && (() => {
                    const last = selectedExercise.sessions[selectedExercise.sessions.length - 1];
                    const val = selectedExercise.exerciseType === 'strength'
                      ? (last.estimated1RM > 0 ? last.estimated1RM.toFixed(1) : last.maxWeight.toFixed(1))
                      : selectedExercise.exerciseType === 'bodyweight'
                      ? last.maxReps.toString()
                      : (last.maxDuration / 60).toFixed(1);
                    return (
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 24, fontWeight: '800', color: TREND_COLOR[selectedExercise.trend] }}>
                          {val}
                        </Text>
                        <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{selectedExercise.unit} latest</Text>
                      </View>
                    );
                  })()}
                </View>
              </View>

              {/* Graph card */}
              <View style={[cardStyle, { overflow: 'hidden' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.7)' }}>
                    {selectedExercise.metricLabel}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>
                    {selectedExercise.sessions.length} session{selectedExercise.sessions.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {hasChart ? (
                  <LineChart
                    data={{
                      labels: selectedChartData!.labels,
                      datasets: [{
                        data: selectedChartData!.values,
                        color: () => TREND_COLOR[selectedExercise.trend],
                        strokeWidth: 2.5,
                      }],
                    }}
                    width={CHART_WIDTH} height={200}
                    chartConfig={{
                      ...chartConfig,
                      fillShadowGradient: TREND_COLOR[selectedExercise.trend],
                      fillShadowGradientOpacity: 0.18,
                      color: (opacity = 1) => `${TREND_COLOR[selectedExercise.trend]}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
                      decimalPlaces: selectedExercise.exerciseType === 'bodyweight' ? 0 : 1,
                    }}
                    bezier
                    withInnerLines
                    withOuterLines={false}
                    withDots
                    style={{ marginLeft: -16 }}
                    fromZero={false}
                    yAxisSuffix={` ${selectedExercise.unit}`}
                  />
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 32, gap: 6 }}>
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', textAlign: 'center' }}>
                      Need at least 2 sessions to show a trend
                    </Text>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                      {selectedExercise.sessions.length === 1 ? '1 session logged so far' : 'No sessions found'}
                    </Text>
                  </View>
                )}
              </View>

              {/* ── 5. Insight card ── */}
              {selectedExercise.sessions.length >= 2 && (
                <View style={{
                  flexDirection: 'row', alignItems: 'flex-start', gap: 12,
                  backgroundColor: `${TREND_COLOR[selectedExercise.trend]}0D`,
                  borderRadius: Radius.lg,
                  borderWidth: 1, borderColor: `${TREND_COLOR[selectedExercise.trend]}25`,
                  padding: spacing.base,
                  marginBottom: spacing.base,
                }}>
                  <TrendIcon trend={selectedExercise.trend} size={16} />
                  <Text style={{ flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 19 }}>
                    {buildInsight(selectedExercise)}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
