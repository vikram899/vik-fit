import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@theme/index';
import { useMealLogs } from '../hooks/useMealLogs';
import MealLogCard from '../components/MealLogCard';
import AddMealModal from '../components/AddMealModal';
import { createMealsStyles } from '../styles';
import { MealCategory } from '@shared/types/common';
import { Card } from '@shared/components/ui/Card';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { CircularProgressRing } from '@shared/components/ui/CircularProgressRing';
import { removeMealLog, editMealLog } from '../services/mealLogService';
import { saveLogAsTemplate } from '../services/mealTemplateService';
import { MealLogRow } from '@database/repositories/mealRepo';
import { Coffee, Sun, Moon, Pizza } from 'lucide-react-native';

const CATEGORY_META: Record<MealCategory, { Icon: React.ComponentType<{ size: number; color: string }>; label: string }> = {
  breakfast: { Icon: Coffee, label: 'Breakfast' },
  lunch:     { Icon: Sun,    label: 'Lunch' },
  dinner:    { Icon: Moon,   label: 'Dinner' },
  snack:     { Icon: Pizza,  label: 'Snack' },
};

const SECTIONS: MealCategory[] = ['breakfast', 'lunch', 'snack', 'dinner'];


function categoryForCurrentTime(): MealCategory {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 15) return 'lunch';
  if (hour >= 15 && hour < 19) return 'snack';
  return 'dinner';
}

export default function MealsScreen() {
  const { colors } = useTheme();
  const s = useMemo(() => createMealsStyles(colors), [colors]);
  const { logsByCategory, totalMacros, userTargets, refresh } = useMealLogs();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalCategory, setModalCategory] = useState<MealCategory>('breakfast');

  useFocusEffect(
    React.useCallback(() => { refresh(); }, [refresh])
  );

  const openModal = (category: MealCategory) => {
    setModalCategory(category);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await removeMealLog(id);
    refresh();
  };

  const handleEdit = async (
    id: number,
    fields: { calories: number; protein: number; carbs: number; fat: number }
  ) => {
    await editMealLog(id, {
      calories: String(fields.calories),
      protein: String(fields.protein),
      carbs: String(fields.carbs),
      fat: String(fields.fat),
    });
    refresh();
  };

  const handleSaveToFavorites = async (log: MealLogRow) => {
    await saveLogAsTemplate(log);
  };

  const dateLabel = new Date().toLocaleDateString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const calConsumed = Math.round(totalMacros.calories);
  const calTarget = userTargets ? Math.round(userTargets.targetCalories) : 0;
  const calProgress = calTarget > 0 ? Math.min(calConsumed / calTarget, 1) : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerTitle}>Nutrition</Text>
            <Text style={s.headerSubtitle}>{dateLabel}</Text>
          </View>
          <TouchableOpacity
            onPress={() => openModal(categoryForCurrentTime())}
            style={s.fab}
            activeOpacity={0.8}
          >
            <Text style={s.fabText}>+</Text>
          </TouchableOpacity>
        </View>

        {/* ── Daily Summary ── */}
        <Card style={s.summaryCard}>
          <View style={s.summaryOverlay} pointerEvents="none" />
          <Text style={s.summaryTitle}>Daily Summary</Text>
          <View style={s.summaryRow}>
            <Text style={s.summaryCalLabel}>Calories</Text>
            <Text style={s.summaryCalValue}>
              {calConsumed.toLocaleString()}
              {calTarget > 0 ? (
                <Text style={s.summaryCalTarget}>{' / '}{calTarget.toLocaleString()}</Text>
              ) : null}
            </Text>
          </View>
          <ProgressBar progress={calProgress} gradientColors={['#F59E0B', '#EF4444']} height={8} />
        </Card>

        {/* ── Macros ── */}
        {userTargets ? (
          <Card style={s.macrosCard}>
            <Text style={s.macrosTitle}>Macros</Text>
            <View style={s.macrosRow}>
              {([
                { label: 'Protein', value: totalMacros.protein, target: userTargets.targetProtein, color: colors.macroProtein },
                { label: 'Carbs',   value: totalMacros.carbs,   target: userTargets.targetCarbs,   color: colors.macroCarbs },
                { label: 'Fats',    value: totalMacros.fat,     target: userTargets.targetFat,     color: colors.macroFat },
              ] as const).map(({ label, value, target, color }) => (
                <View key={label} style={s.macroItem}>
                  <CircularProgressRing
                    size={90}
                    strokeWidth={8}
                    progress={target > 0 ? Math.min(value / target, 1) : 0}
                    color={color}
                    trackColor="rgba(255,255,255,0.06)"
                  >
                    <View style={s.macroItem}>
                      <Text style={s.macroValueText}>{Math.round(value)}g</Text>
                      <Text style={s.macroTargetText}>/ {Math.round(target)}g</Text>
                    </View>
                  </CircularProgressRing>
                  <Text style={s.macroLabel}>{label}</Text>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {/* ── Today's Meals ── */}
        <Text style={s.todaysMealsTitle}>Today's Meals</Text>

        {SECTIONS.map((section) => {
          const meta = CATEGORY_META[section];
          const sectionLogs = logsByCategory(section);
          const secCal  = sectionLogs.reduce((a, l) => a + l.calories, 0);
          const secProt = sectionLogs.reduce((a, l) => a + l.protein,  0);
          const secCarb = sectionLogs.reduce((a, l) => a + l.carbs,    0);
          const secFat  = sectionLogs.reduce((a, l) => a + l.fat,      0);
          const timeLabel = sectionLogs.length > 0
            ? new Date(sectionLogs[0].eatenAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
            : '';

          return (
            <Card key={section} style={s.sectionCard}>
              {/* Section header */}
              <View style={s.sectionHeader}>
                <View style={s.sectionIconBox}>
                  <meta.Icon size={22} color="#3B82F6" />
                </View>
                <View style={s.sectionMeta}>
                  <View style={s.sectionTitleRow}>
                    <Text style={s.sectionName}>{meta.label}</Text>
                    {timeLabel ? <Text style={s.sectionTime}>{timeLabel}</Text> : null}
                  </View>
                  {sectionLogs.length > 0 ? (
                    <View style={s.sectionStatsRow}>
                      <Text style={s.sectionCalText}>{Math.round(secCal)} cal</Text>
                      <Text style={s.sectionDot}>•</Text>
                      <Text style={s.sectionMacroText}>
                        P: {Math.round(secProt)}g  C: {Math.round(secCarb)}g  F: {Math.round(secFat)}g
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              {/* Meal items */}
              {sectionLogs.length > 0 ? (
                <View style={s.mealItemsList}>
                  {sectionLogs.map((log) => (
                    <MealLogCard
                      key={log.id}
                      log={log}
                      onDelete={() => handleDelete(log.id)}
                      onSave={() => handleSaveToFavorites(log)}
                      onEdit={(fields) => handleEdit(log.id, fields)}
                    />
                  ))}
                </View>
              ) : null}

              {/* Add to section */}
              <TouchableOpacity
                onPress={() => openModal(section)}
                style={[s.addToSection, sectionLogs.length > 0 && s.addToSectionBordered]}
                activeOpacity={0.7}
              >
                <Text style={s.addToSectionText}>+  Add to {meta.label}</Text>
              </TouchableOpacity>
            </Card>
          );
        })}

      </ScrollView>

      <AddMealModal
        visible={modalVisible}
        category={modalCategory}
        onClose={() => setModalVisible(false)}
        onAdded={() => { setModalVisible(false); refresh(); }}
      />
    </SafeAreaView>
  );
}
