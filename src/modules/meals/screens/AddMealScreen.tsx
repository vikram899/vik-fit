import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { MealsStackParamList } from '@core/navigation/stacks/MealsStack';
import { mealsStyles } from '../styles';
import { logMeal } from '../services/mealLogService';
import { saveTemplate, removeTemplate } from '../services/mealTemplateService';
import { useMealTemplates } from '../hooks/useMealTemplates';
import { MealFormData } from '../types';
import { MealCategory } from '@shared/types/common';
import { toISOString } from '@shared/utils/dateUtils';
import { Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';
import CategoryTabs from '../components/CategoryTabs';
import { formatCalories, formatMacro } from '@shared/utils/formatUtils';
import { MealTemplateRow } from '@database/repositories/mealTemplateRepo';

type Props = NativeStackScreenProps<MealsStackParamList, 'AddMeal'>;

const EMPTY_FORM: MealFormData = {
  name: '',
  calories: '',
  protein: '',
  carbs: '',
  fat: '',
  category: 'breakfast',
  eatenAt: toISOString(),
  saveAsTemplate: false,
};

export default function AddMealScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const initialCategory = (route.params?.category as MealCategory) ?? 'breakfast';
  const [form, setForm] = useState<MealFormData>({ ...EMPTY_FORM, category: initialCategory });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'manual' | 'saved'>('saved');
  const [showMacros, setShowMacros] = useState(false);
  const { templates, loading: templatesLoading, refresh: refreshTemplates } = useMealTemplates();

  const update = (fields: Partial<MealFormData>) => setForm((prev) => ({ ...prev, ...fields }));

  const applyTemplate = (t: MealTemplateRow) => {
    setForm({
      name: t.name,
      calories: String(t.calories),
      protein: String(t.protein),
      carbs: String(t.carbs),
      fat: String(t.fat),
      category: t.category as MealCategory,
      eatenAt: toISOString(),
      saveAsTemplate: false,
    });
    setShowMacros(true);
    setMode('manual');
  };

  const handleInstantLog = async (t: MealTemplateRow) => {
    setLoading(true);
    setError(null);
    try {
      await logMeal({
        name: t.name,
        calories: String(t.calories),
        protein: String(t.protein),
        carbs: String(t.carbs),
        fat: String(t.fat),
        category: t.category as MealCategory,
        eatenAt: toISOString(),
        saveAsTemplate: false,
      }, t.id);
      navigation.goBack();
    } catch {
      setError('Failed to log meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    await removeTemplate(id);
    await refreshTemplates();
  };

  const isValid = form.name.trim().length > 0 && form.calories.length > 0;

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      let templateId: number | undefined;
      if (form.saveAsTemplate) {
        templateId = await saveTemplate(form);
      }
      await logMeal(form, templateId);
      navigation.goBack();
    } catch {
      setError('Failed to save meal. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.base, flexDirection: 'row', alignItems: 'center', gap: spacing.base }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ ...typography.body, color: colors.brandPrimary }}>← Back</Text>
            </TouchableOpacity>
            <Text style={{ ...typography.screenTitle, color: colors.textPrimary }}>Add Meal</Text>
          </View>

          {/* Mode toggle */}
          <View style={{ flexDirection: 'row', backgroundColor: colors.backgroundSecondary, borderRadius: Radius.md, padding: 4, marginBottom: spacing.base }}>
            {(['saved', 'manual'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={{
                  flex: 1,
                  paddingVertical: spacing.sm,
                  borderRadius: Radius.sm,
                  alignItems: 'center',
                  backgroundColor: mode === m ? colors.backgroundPrimary : 'transparent',
                }}
              >
                <Text style={{ ...typography.label, color: mode === m ? colors.textPrimary : colors.textSecondary }}>
                  {m === 'manual' ? 'Manual Entry' : 'Saved Meals'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Saved templates */}
          {mode === 'saved' ? (
            templatesLoading ? (
              <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
            ) : templates.length === 0 ? (
              <View style={{ alignItems: 'center', paddingTop: spacing['2xl'] }}>
                <Text style={{ ...typography.body, color: colors.textTertiary }}>No saved meals yet.</Text>
                <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs }}>
                  Log a meal with "Save as reusable meal" enabled.
                </Text>
              </View>
            ) : (
              templates.map((t) => (
                <Card key={t.id} style={{ marginBottom: spacing.sm }}>
                  <TouchableOpacity onPress={() => applyTemplate(t)} activeOpacity={0.75}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Text style={{ ...typography.label, color: colors.textPrimary, flex: 1, marginRight: spacing.sm }}>{t.name}</Text>
                      <Text style={{ ...typography.label, color: colors.brandPrimary }}>{formatCalories(t.calories)}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: spacing.base, marginTop: spacing.xs }}>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>P: {formatMacro(t.protein)}</Text>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>C: {formatMacro(t.carbs)}</Text>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>F: {formatMacro(t.fat)}</Text>
                    </View>
                  </TouchableOpacity>
                  <View style={mealsStyles.templateActions}>
                    <TouchableOpacity onPress={() => handleDeleteTemplate(t.id)}>
                      <Text style={{ ...typography.caption, color: colors.error }}>Delete</Text>
                    </TouchableOpacity>
                    <View style={mealsStyles.templateActionsRight}>
                      <TouchableOpacity onPress={() => applyTemplate(t)}>
                        <Text style={{ ...typography.caption, color: colors.textSecondary }}>Customise</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleInstantLog(t)} disabled={loading}>
                        <Text style={{ ...typography.label, color: colors.brandPrimary }}>Log →</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Card>
              ))
            )
          ) : null}

          {/* Manual entry form */}
          {mode === 'manual' ? (
            <>
              <Input
                label="Meal name"
                value={form.name}
                onChangeText={(v) => update({ name: v })}
                placeholder="e.g. Oats with milk"
                containerStyle={mealsStyles.formField}
                autoCapitalize="sentences"
              />
              <Input
                label="Calories (kcal)"
                value={form.calories}
                onChangeText={(v) => update({ calories: v })}
                placeholder="e.g. 350"
                keyboardType="decimal-pad"
                containerStyle={mealsStyles.formField}
              />

              {/* Optional macros */}
              <TouchableOpacity
                onPress={() => setShowMacros((prev) => !prev)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.base }}
              >
                <Text style={{ ...typography.label, color: colors.brandPrimary }}>
                  {showMacros ? '▴  Hide macros' : '▾  Add macros (optional)'}
                </Text>
              </TouchableOpacity>

              {showMacros ? (
                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
                  <Input
                    label="Protein (g)"
                    value={form.protein}
                    onChangeText={(v) => update({ protein: v })}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="Carbs (g)"
                    value={form.carbs}
                    onChangeText={(v) => update({ carbs: v })}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="Fat (g)"
                    value={form.fat}
                    onChangeText={(v) => update({ fat: v })}
                    placeholder="0"
                    keyboardType="decimal-pad"
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              ) : null}

              <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>
                Category
              </Text>
              <View style={{ marginBottom: spacing.base }}>
                <CategoryTabs
                  selected={form.category}
                  onSelect={(cat) => cat !== 'all' && update({ category: cat })}
                />
              </View>

              <Card style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
                <View>
                  <Text style={{ ...typography.label, color: colors.textPrimary }}>Save as reusable meal</Text>
                  <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                    Add to your saved meals list
                  </Text>
                </View>
                <Switch
                  value={form.saveAsTemplate}
                  onValueChange={(v) => update({ saveAsTemplate: v })}
                  trackColor={{ false: colors.border, true: colors.brandPrimary }}
                  thumbColor={colors.white}
                />
              </Card>

              {error ? (
                <Text style={{ ...typography.caption, color: colors.error, marginBottom: spacing.sm }}>
                  {error}
                </Text>
              ) : null}

              <Button label="Log Meal" onPress={handleSave} disabled={!isValid} loading={loading} />
            </>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
