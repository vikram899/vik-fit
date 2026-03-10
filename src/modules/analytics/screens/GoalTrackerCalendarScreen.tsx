import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout, Spacing } from '@theme/spacing';
import {
  ChevronLeft, ChevronRight, ArrowLeft,
  Target, TrendingUp,
} from 'lucide-react-native';
import { useGoalCalendar } from '../hooks/useGoalCalendar';
import { GoalFilter, GoalStatus, DayGoalStatus } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_WIDTH   = SCREEN_WIDTH - Layout.screenPaddingHorizontal * 2 - Layout.cardPadding * 2;
const CELL_SIZE    = Math.floor(GRID_WIDTH / 7);

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_HEADERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_NAMES   = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const GOALS: { id: GoalFilter; label: string }[] = [
  { id: 'all',      label: 'All Goals' },
  { id: 'calories', label: 'Calories' },
  { id: 'protein',  label: 'Protein' },
  { id: 'workouts', label: 'Workouts' },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function statusColor(s: GoalStatus): string {
  switch (s) {
    case 'achieved': return '#84CC16';
    case 'partial':  return '#F59E0B';
    case 'missed':   return '#EF4444';
    default:         return 'rgba(255,255,255,0.12)';
  }
}

function aggregateStatus(day: DayGoalStatus, filter: GoalFilter): GoalStatus {
  if (filter !== 'all') return day[filter];

  const all = [day.calories, day.protein, day.workouts];
  if (all.every(s => s === 'none'))     return 'none';
  if (all.every(s => s === 'achieved')) return 'achieved';
  if (all.some(s => s === 'missed'))    return 'missed';
  return 'partial';
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StatusDot({ status, size = 8 }: { status: GoalStatus; size?: number }) {
  return (
    <View style={{
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: statusColor(status),
    }} />
  );
}

function Legend() {
  const entries = [
    { label: 'Achieved', color: '#84CC16' },
    { label: 'Partial',  color: '#F59E0B' },
    { label: 'Missed',   color: '#EF4444' },
    { label: 'No data',  color: 'rgba(255,255,255,0.12)' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16, paddingTop: 14, marginTop: 14, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)' }}>
      {entries.map(e => (
        <View key={e.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: e.color }} />
          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{e.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────────

export default function GoalTrackerCalendarScreen() {
  const { colors, spacing } = useTheme();
  const navigation = useNavigation();

  const {
    year, month, data, loading,
    goalFilter, setGoalFilter,
    selectedDate, setSelectedDate,
    viewMode, setViewMode,
    weekStart,
    goToPrevMonth, goToNextMonth,
    goToPrevWeek,  goToNextWeek,
    daysInMonth,
  } = useGoalCalendar();

  const cardStyle = {
    backgroundColor: colors.backgroundSecondary,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.base,
    marginBottom: spacing.base,
  };

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun

  const selectedDay = selectedDate != null
    ? data.days.find(d => d.date === selectedDate)
    : null;

  // ── Month grid ──
  const renderMonthView = () => (
    <>
      {/* Day-of-week headers */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {DAY_HEADERS.map((h, i) => (
          <View key={i} style={{ width: CELL_SIZE, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontWeight: '600' }}>{h}</Text>
          </View>
        ))}
      </View>

      {/* Grid cells */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {/* Leading empty cells */}
        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <View key={`e${i}`} style={{ width: CELL_SIZE, height: CELL_SIZE }} />
        ))}

        {data.days.map(day => {
          const status    = aggregateStatus(day, goalFilter);
          const isSelected = selectedDate === day.date;
          const isToday    = day.date === todayDate;

          return (
            <TouchableOpacity
              key={day.date}
              onPress={() => setSelectedDate(isSelected ? null : day.date)}
              activeOpacity={0.75}
              style={{
                width: CELL_SIZE,
                height: CELL_SIZE,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: CELL_SIZE / 2,
                backgroundColor: isSelected ? 'rgba(59,130,246,0.25)' : 'transparent',
                borderWidth: isSelected ? 1.5 : isToday ? 1 : 0,
                borderColor: isSelected ? '#3B82F6' : 'rgba(59,130,246,0.5)',
              }}
            >
              <Text style={{
                fontSize: 13,
                fontWeight: isToday ? '700' : '400',
                color: status === 'none' ? 'rgba(255,255,255,0.25)' : colors.textPrimary,
                marginBottom: 2,
              }}>
                {day.date}
              </Text>
              <StatusDot status={status} size={6} />
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

  // ── Week rows ──
  const renderWeekView = () => {
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const d = weekStart + i;
      if (d > daysInMonth) break;
      const day     = data.days.find(x => x.date === d);
      const status  = day ? aggregateStatus(day, goalFilter) : 'none';
      const isSelected = selectedDate === d;
      const isToday    = d === todayDate;
      const dayOfWeek  = new Date(year, month, d).getDay();

      rows.push(
        <TouchableOpacity
          key={d}
          onPress={() => setSelectedDate(isSelected ? null : d)}
          activeOpacity={0.75}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isSelected ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
            borderRadius: 12,
            borderWidth: isSelected ? 1.5 : 1,
            borderColor: isSelected ? '#3B82F6' : 'rgba(255,255,255,0.06)',
            padding: 12,
            marginBottom: 8,
          }}
        >
          {/* Date block */}
          <View style={{ width: 48, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>
              {DAY_NAMES[dayOfWeek]}
            </Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: status === 'none' ? 'rgba(255,255,255,0.25)' : colors.textPrimary }}>
              {d}
            </Text>
            {isToday && (
              <View style={{ marginTop: 2, paddingHorizontal: 6, paddingVertical: 1, backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 4 }}>
                <Text style={{ fontSize: 9, color: '#3B82F6', fontWeight: '600' }}>TODAY</Text>
              </View>
            )}
          </View>

          {/* Mini goal dots */}
          <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-around', marginLeft: 12 }}>
            {day ? (
              [
                { label: 'Cal', s: day.calories },
                { label: 'Pro', s: day.protein },
                { label: 'Wkt', s: day.workouts },
              ].map(g => (
                <View key={g.label} style={{ alignItems: 'center', gap: 4 }}>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{g.label}</Text>
                  <StatusDot status={g.s} size={10} />
                </View>
              ))
            ) : (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }}>No data</Text>
            )}
          </View>

          {/* Overall status dot */}
          <StatusDot status={status} size={14} />
        </TouchableOpacity>
      );
    }
    return <View>{rows}</View>;
  };

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
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          paddingTop: spacing.base, marginBottom: spacing.base,
        }}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={{
              width: 36, height: 36, borderRadius: 18,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
              marginRight: spacing.base,
            }}
          >
            <ArrowLeft size={18} color={colors.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
              Goal Tracker
            </Text>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 1 }}>
              Daily consistency
            </Text>
          </View>
        </View>

        {/* Goal filter pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingBottom: 4, marginBottom: spacing.base }}
        >
          {GOALS.map(g => (
            <TouchableOpacity
              key={g.id}
              onPress={() => { setGoalFilter(g.id); setSelectedDate(null); }}
              activeOpacity={0.8}
              style={{
                paddingHorizontal: 16, paddingVertical: 8,
                borderRadius: Radius.xl,
                backgroundColor: goalFilter === g.id ? '#3B82F6' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: goalFilter === g.id ? '#3B82F6' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600',
                color: goalFilter === g.id ? '#fff' : 'rgba(255,255,255,0.55)',
              }}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* View mode toggle */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: spacing.base }}>
          {(['month', 'week'] as const).map(v => (
            <TouchableOpacity
              key={v}
              onPress={() => setViewMode(v)}
              activeOpacity={0.8}
              style={{
                flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                backgroundColor: viewMode === v ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: viewMode === v ? '#3B82F6' : 'rgba(255,255,255,0.08)',
                alignItems: 'center',
              }}
            >
              <Text style={{
                fontSize: 13, fontWeight: '600', textTransform: 'capitalize',
                color: viewMode === v ? '#3B82F6' : 'rgba(255,255,255,0.5)',
              }}>
                {v}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Calendar card */}
        <View style={cardStyle}>
          {/* Navigation row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={viewMode === 'month' ? goToPrevMonth : goToPrevWeek}
              disabled={viewMode === 'week' && weekStart <= 1}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronLeft size={18} color={viewMode === 'week' && weekStart <= 1 ? 'rgba(255,255,255,0.2)' : colors.textSecondary} />
            </TouchableOpacity>

            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.textPrimary }}>
              {viewMode === 'month'
                ? `${MONTH_NAMES[month]} ${year}`
                : `${MONTH_NAMES[month]} ${weekStart}–${Math.min(weekStart + 6, daysInMonth)}`}
            </Text>

            <TouchableOpacity
              onPress={viewMode === 'month' ? goToNextMonth : goToNextWeek}
              disabled={viewMode === 'week' && weekStart + 6 >= daysInMonth}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{ padding: 6, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.06)' }}
            >
              <ChevronRight size={18} color={viewMode === 'week' && weekStart + 6 >= daysInMonth ? 'rgba(255,255,255,0.2)' : colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Loading */}
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: 40 }}>
              <ActivityIndicator color="#3B82F6" />
            </View>
          ) : viewMode === 'month' ? renderMonthView() : renderWeekView()}

          <Legend />
        </View>

        {/* Daily insight */}
        {selectedDay && (
          <View style={[cardStyle, { overflow: 'hidden' }]}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(59,130,246,0.05)' }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Target size={16} color="#3B82F6" />
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary }}>
                {MONTH_NAMES[month]} {selectedDate}
              </Text>
            </View>

            {[
              { label: 'Calories', status: selectedDay.calories, color: '#F59E0B',
                sub: `Target: ${data.targetCalories} cal` },
              { label: 'Protein',  status: selectedDay.protein,  color: '#3B82F6',
                sub: `Target: ${data.targetProtein}g` },
              { label: 'Workout',  status: selectedDay.workouts, color: '#A855F7',
                sub: 'Completed a workout' },
            ].map((g, i, arr) => {
              const label = g.status === 'achieved' ? 'Goal achieved'
                : g.status === 'partial' ? 'Partially achieved'
                : g.status === 'missed'  ? 'Goal missed'
                : 'No data';
              return (
                <View key={g.label}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10, paddingHorizontal: 12,
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    marginBottom: i < arr.length - 1 ? 6 : 0,
                  }}>
                    <View>
                      <Text style={{ fontSize: 14, color: colors.textPrimary, fontWeight: '500' }}>
                        {g.label}
                      </Text>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                        {g.sub}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{
                        fontSize: 12, fontWeight: '500',
                        color: g.status === 'achieved' ? '#84CC16'
                          : g.status === 'partial' ? '#F59E0B'
                          : g.status === 'missed'  ? '#EF4444'
                          : 'rgba(255,255,255,0.3)',
                      }}>
                        {label}
                      </Text>
                      <StatusDot status={g.status} size={9} />
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Monthly summary */}
        <View style={[cardStyle, { marginBottom: 0, overflow: 'hidden' }]}>
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(59,130,246,0.06)' }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <TrendingUp size={16} color="#3B82F6" />
            <Text style={{ fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.85)' }}>
              {MONTH_NAMES[month]} Summary
            </Text>
          </View>

          {/* Stat row */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
            {[
              { label: 'Achieved', val: data.summary.achieved, color: '#84CC16' },
              { label: 'Partial',  val: data.summary.partial,  color: '#F59E0B' },
              { label: 'Missed',   val: data.summary.missed,   color: '#EF4444' },
            ].map(s => (
              <View key={s.label} style={{
                flex: 1, backgroundColor: 'rgba(255,255,255,0.05)',
                borderRadius: 12, padding: 12, alignItems: 'center',
              }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: s.color }}>
                  {s.val}
                </Text>
                <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 3 }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Progress bar */}
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>Success Rate</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.textPrimary }}>
                {data.summary.successRate}%
              </Text>
            </View>
            <View style={{ height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' }}>
              <View style={{
                height: '100%',
                width: `${data.summary.successRate}%` as any,
                backgroundColor: '#84CC16',
                borderRadius: 5,
              }} />
            </View>
          </View>

          {/* Insight text */}
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 18 }}>
            {data.summary.successRate >= 80
              ? '🎉 Excellent consistency! Keep up the great work.'
              : data.summary.successRate >= 60
                ? '💪 Good progress! A few more consistent days will boost your results.'
                : data.summary.successRate >= 40
                  ? '⚠️ Room for improvement. Focus on building consistent habits.'
                  : data.summary.successRate > 0
                    ? '🎯 Let\'s work on consistency. Small daily wins add up!'
                    : 'Start logging meals and completing workouts to track consistency.'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
