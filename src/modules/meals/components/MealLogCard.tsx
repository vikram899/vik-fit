import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';
import { MealLogRow } from '@database/repositories/mealRepo';
import { createMealsStyles } from '../styles';
import { Edit3, Trash2, Bookmark, BookmarkCheck, MoreVertical, ChevronLeft } from 'lucide-react-native';
import { Radius } from '@theme/radius';
import { removeTemplate } from '../services/mealTemplateService';

interface MealLogCardProps {
  log: MealLogRow;
  onDelete: () => void;
  onSave: () => Promise<number>;
  onEdit: (fields: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

export default function MealLogCard({ log, onDelete, onSave, onEdit }: MealLogCardProps) {
  const { colors, spacing } = useTheme();
  const s = useMemo(() => createMealsStyles(colors), [colors]);
  const insets = useSafeAreaInsets();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'menu' | 'edit'>('menu');
  const [isSaved, setIsSaved] = useState(log.templateId != null);
  const [savedTemplateId, setSavedTemplateId] = useState<number | null>(log.templateId ?? null);
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const openMenu = () => {
    setView('menu');
    setOpen(true);
  };

  const openEdit = () => {
    setCal(String(Math.round(log.calories)));
    setProtein(String(Math.round(log.protein)));
    setCarbs(String(Math.round(log.carbs)));
    setFat(String(Math.round(log.fat)));
    setView('edit');
  };

  const close = () => {
    setOpen(false);
    setView('menu');
  };

  const saveEdit = () => {
    onEdit({
      calories: parseFloat(cal) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    close();
  };

  return (
    <View style={s.mealItem}>
      <View style={s.mealItemTopRow}>
        <Text style={s.mealItemName} numberOfLines={1}>{log.name}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Text style={s.mealItemCal}>{Math.round(log.calories)} cal</Text>
          <TouchableOpacity
            onPress={openMenu}
            activeOpacity={1}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MoreVertical size={16} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={s.mealItemMacros}>
          <Text style={s.mealItemMacroText}>P: {Math.round(log.protein)}g</Text>
          <Text style={s.mealItemMacroDot}>•</Text>
          <Text style={s.mealItemMacroText}>C: {Math.round(log.carbs)}g</Text>
          <Text style={s.mealItemMacroDot}>•</Text>
          <Text style={s.mealItemMacroText}>F: {Math.round(log.fat)}g</Text>
        </View>
        {isSaved && (
          <BookmarkCheck size={13} color="#84CC16" />
        )}
      </View>

      {/* ── Single bottom sheet ── */}
      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={close}
        statusBarTranslucent
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            activeOpacity={1}
            onPress={close}
          />
          <View style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            paddingHorizontal: spacing.xl,
            paddingTop: spacing.sm,
            paddingBottom: insets.bottom + spacing.xl,
          }}>
            {/* Drag handle */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: spacing.base }} />

            {/* Header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              {view === 'edit' && (
                <TouchableOpacity onPress={() => setView('menu')} activeOpacity={1} style={{ padding: 2 }}>
                  <ChevronLeft size={18} color="rgba(255,255,255,0.5)" />
                </TouchableOpacity>
              )}
              <Text style={{ fontSize: 15, fontWeight: '600', color: colors.textPrimary, flex: 1 }} numberOfLines={1}>
                {view === 'edit' ? `Edit — ${log.name}` : log.name}
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: spacing.xl }}>
              {Math.round(log.calories)} cal · P: {Math.round(log.protein)}g · C: {Math.round(log.carbs)}g · F: {Math.round(log.fat)}g
            </Text>

            {/* ── Menu view ── */}
            {view === 'menu' && (
              <>
                {[
                  { label: 'Edit',              Icon: Edit3,     color: '#3B82F6', onPress: openEdit },
                  {
                    label: isSaved ? 'Unsave template' : 'Save to templates',
                    Icon: isSaved ? BookmarkCheck : Bookmark,
                    color: isSaved ? '#F59E0B' : '#84CC16',
                    onPress: async () => {
                      if (isSaved && savedTemplateId != null) {
                        await removeTemplate(savedTemplateId);
                        setIsSaved(false);
                        setSavedTemplateId(null);
                      } else if (!isSaved) {
                        const newId = await onSave();
                        setIsSaved(true);
                        setSavedTemplateId(newId);
                      }
                      close();
                    },
                  },
                  { label: 'Remove',            Icon: Trash2,    color: '#EF4444', onPress: () => { onDelete(); close(); } },
                ].map((action, idx) => (
                  <TouchableOpacity
                    key={action.label}
                    onPress={action.onPress}
                    activeOpacity={1}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 14,
                      paddingVertical: 16,
                      borderTopWidth: idx === 0 ? 0 : 1,
                      borderTopColor: 'rgba(255,255,255,0.07)',
                    }}
                  >
                    <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: action.color + '20', alignItems: 'center', justifyContent: 'center' }}>
                      <action.Icon size={18} color={action.color} />
                    </View>
                    <Text style={{ fontSize: 15, fontWeight: '500', color: action.color }}>{action.label}</Text>
                  </TouchableOpacity>
                ))}
              </>
            )}

            {/* ── Edit view ── */}
            {view === 'edit' && (
              <>
                <View style={{ marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>Calories</Text>
                  <View style={{ backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(245,158,11,0.25)', paddingHorizontal: 14, paddingVertical: 10 }}>
                    <TextInput
                      value={cal}
                      onChangeText={setCal}
                      keyboardType="numeric"
                      selectTextOnFocus
                      style={{ fontSize: 22, fontWeight: '700', color: '#F59E0B', textAlign: 'center' }}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl }}>
                  {[
                    { label: 'Protein (g)', value: protein, setter: setProtein, color: '#3B82F6' },
                    { label: 'Carbs (g)',   value: carbs,   setter: setCarbs,   color: '#84CC16' },
                    { label: 'Fats (g)',    value: fat,     setter: setFat,     color: '#F59E0B' },
                  ].map(({ label, value, setter, color }) => (
                    <View key={label} style={{ flex: 1 }}>
                      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>{label}</Text>
                      <View style={{ backgroundColor: color + '14', borderRadius: Radius.md, borderWidth: 1, borderColor: color + '40', paddingHorizontal: 8, paddingVertical: 10 }}>
                        <TextInput
                          value={value}
                          onChangeText={setter}
                          keyboardType="numeric"
                          selectTextOnFocus
                          style={{ fontSize: 18, fontWeight: '600', color, textAlign: 'center' }}
                          placeholderTextColor="rgba(255,255,255,0.2)"
                        />
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity onPress={saveEdit} activeOpacity={1} style={{ backgroundColor: colors.brandPrimary, borderRadius: Radius.md, paddingVertical: spacing.base, alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text style={{ fontSize: 15, fontWeight: '700', color: '#000' }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={close} activeOpacity={1} style={{ alignItems: 'center', paddingVertical: spacing.sm }}>
                  <Text style={{ fontSize: 13, color: colors.textTertiary }}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
