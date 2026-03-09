import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { TrendingUp, TrendingDown, Activity, Trophy } from 'lucide-react-native';
import {
  LineChart,
  BarChart,
} from 'react-native-chart-kit';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - Layout.screenPaddingHorizontal * 2 - 32; // card padding

// ── Static data (replace with real DB queries later) ──────────────────────────

const weightData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{ data: [185, 183, 180, 178, 176, 175], color: () => '#3B82F6', strokeWidth: 3 }],
};

const caloriesData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    { data: [2200, 2400, 2100, 2300, 2500, 2200, 2350], color: () => '#3B82F6' },
    { data: [450, 520, 380, 490, 610, 540, 470],        color: () => '#84CC16' },
  ],
  legend: ['Intake', 'Burned'],
};

const strengthData = {
  labels: ['Bench', 'Squat', 'Deadlift'],
  datasets: [
    { data: [135, 185, 225], color: () => '#A855F7', strokeWidth: 2 },
    { data: [145, 195, 235], color: () => '#3B82F6', strokeWidth: 2 },
    { data: [155, 205, 245], color: () => '#84CC16', strokeWidth: 2 },
    { data: [165, 215, 255], color: () => '#F59E0B', strokeWidth: 2 },
  ],
};

const PERSONAL_RECORDS = [
  { exercise: 'Bench Press', weight: '225 lbs', date: '2 days ago' },
  { exercise: 'Squat',       weight: '315 lbs', date: '1 week ago' },
  { exercise: 'Deadlift',    weight: '405 lbs', date: '3 weeks ago' },
];

type Period = 'week' | 'month' | 'year';

// ── Component ─────────────────────────────────────────────────────────────────

export default function AnalyticsScreen() {
  const { colors, spacing } = useTheme();
  const [period, setPeriod] = useState<Period>('month');

  const chartConfig = {
    backgroundGradientFrom: colors.backgroundSecondary,
    backgroundGradientTo:   colors.backgroundSecondary,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
    labelColor: () => 'rgba(255,255,255,0.5)',
    propsForDots: { r: '4', strokeWidth: '1', stroke: colors.backgroundSecondary },
    propsForBackgroundLines: { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '4 4' },
    style: { borderRadius: Radius.lg },
  };

  const cardStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.base,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: Layout.screenPaddingHorizontal,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ paddingTop: spacing.base, marginBottom: spacing.base }}>
          <Text style={{ fontSize: 24, fontWeight: '700', color: colors.textPrimary }}>Analytics</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>Track your progress</Text>
        </View>

        {/* Period selector */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.base }}>
          {(['week', 'month', 'year'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              onPress={() => setPeriod(p)}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16, paddingVertical: 8, borderRadius: Radius.xl,
                backgroundColor: period === p ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                shadowColor: period === p ? '#3B82F6' : 'transparent',
                shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
                elevation: period === p ? 4 : 0,
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '500',
                color: period === p ? '#fff' : 'rgba(255,255,255,0.6)',
                textTransform: 'capitalize',
              }}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Key stats row */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: spacing.base }}>
          {/* Weight Change */}
          <View style={[cardStyle, { flex: 1, marginBottom: 0, overflow: 'hidden' }]}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(132,204,22,0.08)' } as any} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <TrendingUp size={16} color="#84CC16" />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Weight Change</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>-10 lbs</Text>
            <Text style={{ fontSize: 11, color: '#84CC16', marginTop: 4 }}>↓ 5.4% this month</Text>
          </View>

          {/* Avg Workouts */}
          <View style={[cardStyle, { flex: 1, marginBottom: 0, overflow: 'hidden' }]}>
            <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(59,130,246,0.08)' } as any} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <Activity size={16} color="#3B82F6" />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Avg Workouts</Text>
            </View>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#fff' }}>5.2/wk</Text>
            <Text style={{ fontSize: 11, color: '#3B82F6', marginTop: 4 }}>↑ 12% vs last month</Text>
          </View>
        </View>

        {/* Weight Trend */}
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Weight Trend</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Last 6 months</Text>
          </View>
          <LineChart
            data={weightData}
            width={CHART_WIDTH}
            height={200}
            chartConfig={{
              ...chartConfig,
              fillShadowGradient: '#3B82F6',
              fillShadowGradientOpacity: 0.2,
            }}
            bezier
            withInnerLines
            withOuterLines={false}
            withDots={false}
            style={{ marginLeft: -16 }}
            fromZero={false}
          />
        </View>

        {/* Calories This Week */}
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Calories This Week</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Intake vs Burned</Text>
          </View>
          <BarChart
            data={caloriesData}
            width={CHART_WIDTH}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
              barPercentage: 0.55,
            }}
            withInnerLines
            withHorizontalLabels
            showBarTops={false}
            style={{ marginLeft: -16 }}
            yAxisLabel=""
            yAxisSuffix=""
            fromZero
          />
          {/* Legend */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Intake</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: '#84CC16' }} />
              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>Burned</Text>
            </View>
          </View>
        </View>

        {/* Strength Progress */}
        <View style={cardStyle}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Strength Progress</Text>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Last 4 weeks</Text>
          </View>
          <LineChart
            data={strengthData}
            width={CHART_WIDTH}
            height={200}
            chartConfig={{
              ...chartConfig,
              color: (opacity = 1) => `rgba(255,255,255,${opacity})`,
            }}
            bezier
            withInnerLines
            withOuterLines={false}
            style={{ marginLeft: -16 }}
            fromZero={false}
          />
        </View>

        {/* Personal Records */}
        <View style={[cardStyle, { marginBottom: 0, overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(245,158,11,0.08)' } as any} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Trophy size={16} color="#F59E0B" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)' }}>Personal Records</Text>
          </View>
          {PERSONAL_RECORDS.map((record, i) => (
            <View key={record.exercise}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 10 }}>
                <View>
                  <Text style={{ fontSize: 14, fontWeight: '500', color: colors.textPrimary }}>{record.exercise}</Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{record.date}</Text>
                </View>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#F59E0B' }}>{record.weight}</Text>
              </View>
              {i < PERSONAL_RECORDS.length - 1 && (
                <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)' }} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
