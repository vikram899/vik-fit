import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { useTheme } from '@theme/index';
import { MealCategory } from '@shared/types/common';
import { MealTemplateRow } from '@database/repositories/mealTemplateRepo';
import { MealLogRow } from '@database/repositories/mealRepo';
import { logMeal, getRecentMeals } from '../services/mealLogService';
import { getAllTemplates, removeTemplate } from '../services/mealTemplateService';
import { toISOString } from '@shared/utils/dateUtils';
import { Radius } from '@theme/radius';
import { X, Search, Bookmark, Clock, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react-native';

type Ingredient = { id: string; name: string; calories: string; protein: string; carbs: string; fat: string };

const CATEGORY_LABEL: Record<MealCategory, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

type Tab = 'saved' | 'recent' | 'new';

interface Props {
  visible: boolean;
  category: MealCategory;
  onClose: () => void;
  onAdded: () => void;
}

export default function AddMealModal({ visible, category, onClose, onAdded }: Props) {
  const { colors, spacing } = useTheme();
  const [tab, setTab] = useState<Tab>('saved');
  const [search, setSearch] = useState('');
  const [templates, setTemplates] = useState<MealTemplateRow[]>([]);
  const [recent, setRecent] = useState<MealLogRow[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // New meal form
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  // Ingredients
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [showIngForm, setShowIngForm] = useState(false);
  const [ingName, setIngName] = useState('');
  const [ingCal, setIngCal] = useState('');
  const [ingProtein, setIngProtein] = useState('');
  const [ingCarbs, setIngCarbs] = useState('');
  const [ingFat, setIngFat] = useState('');

  const loadData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [tpls, rcnt] = await Promise.all([getAllTemplates(), getRecentMeals(4)]);
      setTemplates(tpls);
      setRecent(rcnt);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      loadData();
      setTab('saved');
      setSearch('');
      setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
      setIngredients([]); setShowIngForm(false);
      setIngName(''); setIngCal(''); setIngProtein(''); setIngCarbs(''); setIngFat('');
    }
  }, [visible, loadData]);

  // Auto-sum ingredient macros into the totals fields
  useEffect(() => {
    if (ingredients.length === 0) return;
    const t = ingredients.reduce(
      (acc, ing) => ({
        calories: acc.calories + parseFloat(ing.calories || '0'),
        protein:  acc.protein  + parseFloat(ing.protein  || '0'),
        carbs:    acc.carbs    + parseFloat(ing.carbs    || '0'),
        fat:      acc.fat      + parseFloat(ing.fat      || '0'),
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
    setCalories(String(Math.round(t.calories)));
    setProtein(String(Math.round(t.protein)));
    setCarbs(String(Math.round(t.carbs)));
    setFat(String(Math.round(t.fat)));
  }, [ingredients]);

  const handleClose = () => {
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFat('');
    onClose();
  };

  const instantLog = async (meal: { name: string; calories: number; protein: number; carbs: number; fat: number }) => {
    setSaving(true);
    try {
      await logMeal({
        name: meal.name,
        calories: String(meal.calories),
        protein: String(meal.protein),
        carbs: String(meal.carbs),
        fat: String(meal.fat),
        category,
        eatenAt: toISOString(),
        saveAsTemplate: false,
      });
      onAdded();
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = async () => {
    if (!name.trim() || !calories) return;
    setSaving(true);
    try {
      await logMeal({
        name: name.trim(),
        calories,
        protein: protein || '0',
        carbs: carbs || '0',
        fat: fat || '0',
        category,
        eatenAt: toISOString(),
        saveAsTemplate: false,
      });
      onAdded();
      handleClose();
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    await removeTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    setSearch('');
  };

  const addIngredient = () => {
    if (!ingName.trim() || !ingCal) return;
    setIngredients(prev => [...prev, {
      id: Date.now().toString(),
      name: ingName.trim(),
      calories: ingCal,
      protein: ingProtein || '0',
      carbs: ingCarbs || '0',
      fat: ingFat || '0',
    }]);
    setIngName(''); setIngCal(''); setIngProtein(''); setIngCarbs(''); setIngFat('');
    setShowIngForm(false);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => {
      const next = prev.filter(i => i.id !== id);
      if (next.length === 0) { setCalories(''); setProtein(''); setCarbs(''); setFat(''); }
      return next;
    });
  };

  const filteredTemplates = templates.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const inputStyle = {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    fontSize: 15,
    color: colors.textPrimary,
    minHeight: 48,
  };

  const tabActiveColor = (key: Tab) => key === 'new' ? '#84CC16' : '#3B82F6';

  const renderSavedRow = (meal: MealTemplateRow) => (
    <View
      key={`tpl-${meal.id}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      {/* Text area – tapping adds the meal */}
      <TouchableOpacity
        onPress={() => instantLog(meal)}
        activeOpacity={1}
        disabled={saving}
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: 8 }}>
            {meal.name}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#F59E0B' }}>
            {Math.round(meal.calories)} cal
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>P: {Math.round(meal.protein)}g</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginHorizontal: 5 }}>•</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>C: {Math.round(meal.carbs)}g</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginHorizontal: 5 }}>•</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>F: {Math.round(meal.fat)}g</Text>
        </View>
      </TouchableOpacity>

      {/* + button */}
      <TouchableOpacity
        onPress={() => instantLog(meal)}
        disabled={saving}
        activeOpacity={1}
        style={{
          width: 40, height: 40, borderRadius: 8,
          backgroundColor: 'rgba(132,204,22,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Plus size={18} color="#84CC16" />
      </TouchableOpacity>

      {/* Delete button */}
      <TouchableOpacity
        onPress={() => handleDeleteTemplate(meal.id)}
        activeOpacity={1}
        style={{
          width: 40, height: 40, borderRadius: 8,
          backgroundColor: 'rgba(239,68,68,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Trash2 size={18} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  const renderRecentRow = (meal: MealLogRow) => (
    <View
      key={`rcnt-${meal.id}`}
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        marginBottom: spacing.sm,
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 8,
      }}
    >
      <TouchableOpacity
        onPress={() => instantLog(meal)}
        activeOpacity={1}
        disabled={saving}
        style={{ flex: 1 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, flex: 1, marginRight: 8 }}>
            {meal.name}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#F59E0B' }}>
            {Math.round(meal.calories)} cal
          </Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>P: {Math.round(meal.protein)}g</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginHorizontal: 5 }}>•</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>C: {Math.round(meal.carbs)}g</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)', marginHorizontal: 5 }}>•</Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>F: {Math.round(meal.fat)}g</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => instantLog(meal)}
        disabled={saving}
        activeOpacity={1}
        style={{
          width: 40, height: 40, borderRadius: 8,
          backgroundColor: 'rgba(132,204,22,0.2)',
          alignItems: 'center', justifyContent: 'center',
        }}
      >
        <Plus size={18} color="#84CC16" />
      </TouchableOpacity>
    </View>
  );

  const TABS: { key: Tab; Icon: React.ComponentType<{ size: number; color: string }>; label: string }[] = [
    { key: 'saved',  Icon: Bookmark, label: 'Saved' },
    { key: 'recent', Icon: Clock,    label: 'Recent' },
    { key: 'new',    Icon: Plus,     label: 'New' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          {/* Backdrop */}
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.8)' }]}
            activeOpacity={1}
            onPress={handleClose}
          />

          {/* Sheet */}
          <View style={{
            maxHeight: '90%',
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
          }}>
            {/* Drag handle */}
            <View style={{ alignItems: 'center', paddingTop: 10, paddingBottom: 4 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>

            {/* Header + Tabs (fixed) */}
            <View style={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.base, borderBottomWidth: 1, borderBottomColor: colors.border }}>
              {/* Title row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.base }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: colors.textPrimary }}>
                  Add to {CATEGORY_LABEL[category]}
                </Text>
                <TouchableOpacity
                  onPress={handleClose}
                  style={{
                    width: 40, height: 40, borderRadius: 12,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={20} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {TABS.map(({ key, Icon, label }) => {
                  const active = tab === key;
                  const activeColor = tabActiveColor(key);
                  const iconColor = active ? '#fff' : colors.textSecondary;
                  return (
                    <TouchableOpacity
                      key={key}
                      onPress={() => setTab(key)}
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        paddingVertical: 10,
                        borderRadius: Radius.md,
                        backgroundColor: active ? activeColor : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      <Icon size={15} color={iconColor} />
                      <Text style={{
                        fontSize: 14,
                        fontWeight: active ? '600' : '400',
                        color: iconColor,
                      }}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={{ paddingHorizontal: spacing.xl }}
              contentContainerStyle={{ paddingTop: spacing.base, paddingBottom: spacing['3xl'] }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* ── SAVED ── */}
              {tab === 'saved' ? (
                <>
                  {/* Search bar */}
                  <View style={{
                    flexDirection: 'row', alignItems: 'center',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    borderRadius: 99, borderWidth: 1, borderColor: colors.border,
                    paddingHorizontal: spacing.base, marginBottom: spacing.base,
                    gap: 8,
                  }}>
                    <Search size={18} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      placeholder="Search saved meals..."
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      value={search}
                      onChangeText={setSearch}
                      style={{ flex: 1, fontSize: 15, color: colors.textPrimary, paddingVertical: spacing.sm }}
                    />
                  </View>

                  {dataLoading ? (
                    <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
                  ) : filteredTemplates.length === 0 ? (
                    <View style={{ paddingVertical: spacing.xl, alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginBottom: 6 }}>
                        {templates.length === 0 ? 'No saved meals yet' : `No meals found matching "${search}"`}
                      </Text>
                      {templates.length === 0 ? (
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
                          Add meals to your day and tap the bookmark icon to save them
                        </Text>
                      ) : null}
                    </View>
                  ) : (
                    filteredTemplates.map((t) => renderSavedRow(t))
                  )}
                </>
              ) : null}

              {/* ── RECENT ── */}
              {tab === 'recent' ? (
                dataLoading ? (
                  <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing.xl }} />
                ) : recent.length === 0 ? (
                  <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: spacing.xl }}>
                    No recent meals yet.
                  </Text>
                ) : (
                  recent.map((r) => renderRecentRow(r))
                )
              ) : null}

              {/* ── NEW ── */}
              {tab === 'new' ? (
                <>
                  {/* Meal Name */}
                  <View style={{ marginBottom: spacing.base }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Meal Name</Text>
                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="e.g. Oatmeal"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      autoCapitalize="sentences"
                      style={inputStyle}
                    />
                  </View>

                  {/* ── Ingredients ── */}
                  <View style={{ marginBottom: spacing.base }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        Ingredients{ingredients.length > 0 ? ` (${ingredients.length})` : ''}
                      </Text>
                      <TouchableOpacity
                        onPress={() => setShowIngForm(v => !v)}
                        activeOpacity={1}
                        style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, backgroundColor: 'rgba(132,204,22,0.12)', borderWidth: 1, borderColor: 'rgba(132,204,22,0.25)' }}
                      >
                        {showIngForm ? <ChevronUp size={14} color="#84CC16" /> : <Plus size={14} color="#84CC16" />}
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#84CC16' }}>
                          {showIngForm ? 'Cancel' : 'Add Ingredient'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Inline ingredient form */}
                    {showIngForm && (
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', padding: 12, marginBottom: spacing.sm, gap: 8 }}>
                        <TextInput
                          value={ingName}
                          onChangeText={setIngName}
                          placeholder="Ingredient name (e.g. Oats)"
                          placeholderTextColor="rgba(255,255,255,0.35)"
                          autoCapitalize="sentences"
                          style={[inputStyle, { marginBottom: 0 }]}
                        />
                        <View style={{ flexDirection: 'row', gap: 6 }}>
                          <View style={{ flex: 1.2 }}>
                            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>Calories *</Text>
                            <TextInput value={ingCal} onChangeText={setIngCal} placeholder="0" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="decimal-pad" style={[inputStyle, { paddingHorizontal: 10, textAlign: 'center' }]} />
                          </View>
                          {[
                            { label: 'Protein', val: ingProtein, set: setIngProtein },
                            { label: 'Carbs',   val: ingCarbs,   set: setIngCarbs },
                            { label: 'Fats',    val: ingFat,     set: setIngFat },
                          ].map(({ label, val, set }) => (
                            <View key={label} style={{ flex: 1 }}>
                              <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{label}</Text>
                              <TextInput value={val} onChangeText={set} placeholder="0" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="decimal-pad" style={[inputStyle, { paddingHorizontal: 6, textAlign: 'center' }]} />
                            </View>
                          ))}
                        </View>
                        <TouchableOpacity
                          onPress={addIngredient}
                          disabled={!ingName.trim() || !ingCal}
                          activeOpacity={1}
                          style={{ paddingVertical: 10, borderRadius: Radius.md, backgroundColor: !ingName.trim() || !ingCal ? 'rgba(132,204,22,0.3)' : '#84CC16', alignItems: 'center' }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>Add</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Ingredient rows */}
                    {ingredients.map((ing) => (
                      <View key={ing.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', paddingHorizontal: 12, paddingVertical: 10, marginBottom: 6, gap: 8 }}>
                        <View style={{ flex: 1 }}>
                          <Text style={{ fontSize: 13, fontWeight: '500', color: colors.textPrimary, marginBottom: 2 }}>{ing.name}</Text>
                          <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                            {Math.round(parseFloat(ing.calories))} cal · P {Math.round(parseFloat(ing.protein))}g · C {Math.round(parseFloat(ing.carbs))}g · F {Math.round(parseFloat(ing.fat))}g
                          </Text>
                        </View>
                        <TouchableOpacity onPress={() => removeIngredient(ing.id)} activeOpacity={1} style={{ padding: 4 }}>
                          <Trash2 size={16} color="rgba(239,68,68,0.7)" />
                        </TouchableOpacity>
                      </View>
                    ))}

                    {/* Totals row */}
                    {ingredients.length > 0 && (
                      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(132,204,22,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(132,204,22,0.2)', paddingHorizontal: 12, paddingVertical: 10, marginTop: 2 }}>
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#84CC16', flex: 1 }}>Total</Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                          {calories} cal · P {protein}g · C {carbs}g · F {fat}g
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Manual macro entry (shown always so user can override) */}
                  <View style={{ marginBottom: spacing.base }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>
                      Calories{ingredients.length > 0 ? ' (auto-summed)' : ''}
                    </Text>
                    <TextInput
                      value={calories}
                      onChangeText={setCalories}
                      placeholder="0"
                      placeholderTextColor="rgba(255,255,255,0.4)"
                      keyboardType="decimal-pad"
                      style={inputStyle}
                    />
                  </View>

                  <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
                    {[
                      { label: 'Protein (g)', value: protein, setter: setProtein },
                      { label: 'Carbs (g)',   value: carbs,   setter: setCarbs },
                      { label: 'Fats (g)',    value: fat,     setter: setFat },
                    ].map(({ label, value, setter }) => (
                      <View key={label} style={{ flex: 1 }}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>{label}</Text>
                        <TextInput
                          value={value}
                          onChangeText={setter}
                          placeholder="0"
                          placeholderTextColor="rgba(255,255,255,0.4)"
                          keyboardType="decimal-pad"
                          style={[inputStyle, { paddingHorizontal: spacing.sm, textAlign: 'center' }]}
                        />
                      </View>
                    ))}
                  </View>

                  {/* Add Meal button — lime green */}
                  <TouchableOpacity
                    onPress={handleAddNew}
                    disabled={!name.trim() || !calories || saving}
                    activeOpacity={1}
                    style={{
                      paddingVertical: 14,
                      borderRadius: Radius.md,
                      backgroundColor: '#84CC16',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      shadowColor: '#84CC16',
                      shadowOffset: { width: 0, height: 6 },
                      shadowOpacity: 0.3,
                      shadowRadius: 12,
                      elevation: 8,
                      opacity: !name.trim() || !calories || saving ? 0.5 : 1,
                    }}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Plus size={20} color="#fff" />
                        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>Add Meal</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
