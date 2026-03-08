import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@theme/index';
import { MealLogRow } from '@database/repositories/mealRepo';
import { createMealsStyles } from '../styles';
import { Edit3, Trash2, Bookmark, Check, X } from 'lucide-react-native';

interface MealLogCardProps {
  log: MealLogRow;
  onDelete: () => void;
  onSave: () => void;
  onEdit: (fields: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

export default function MealLogCard({ log, onDelete, onSave, onEdit }: MealLogCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => createMealsStyles(colors), [colors]);

  const [editing, setEditing] = useState(false);
  const [cal, setCal] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const startEdit = () => {
    setCal(String(log.calories));
    setProtein(String(log.protein));
    setCarbs(String(log.carbs));
    setFat(String(log.fat));
    setEditing(true);
  };

  const saveEdit = () => {
    onEdit({
      calories: parseFloat(cal) || 0,
      protein: parseFloat(protein) || 0,
      carbs: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
    });
    setEditing(false);
  };

  return (
    <View style={s.mealItem}>
      {!editing ? (
        <>
          <View style={s.mealItemTopRow}>
            <Text style={s.mealItemName} numberOfLines={1}>{log.name}</Text>
            <Text style={s.mealItemCal}>{Math.round(log.calories)} cal</Text>
          </View>

          <View style={s.mealItemMacros}>
            <Text style={s.mealItemMacroText}>P: {Math.round(log.protein)}g</Text>
            <Text style={s.mealItemMacroDot}>•</Text>
            <Text style={s.mealItemMacroText}>C: {Math.round(log.carbs)}g</Text>
            <Text style={s.mealItemMacroDot}>•</Text>
            <Text style={s.mealItemMacroText}>F: {Math.round(log.fat)}g</Text>
          </View>

          <View style={s.mealItemActions}>
            <TouchableOpacity onPress={startEdit} style={s.mealActionBtn} activeOpacity={0.6}>
              <Edit3 size={12} color="rgba(255,255,255,0.5)" />
              <Text style={s.mealActionEdit}> Edit</Text>
            </TouchableOpacity>
            <Text style={s.mealActionDot}>•</Text>
            <TouchableOpacity onPress={onDelete} style={s.mealActionBtn} activeOpacity={0.6}>
              <Trash2 size={12} color="rgba(255,255,255,0.5)" />
              <Text style={s.mealActionRemove}> Remove</Text>
            </TouchableOpacity>
            <Text style={s.mealActionDot}>•</Text>
            <TouchableOpacity onPress={onSave} style={s.mealActionBtn} activeOpacity={0.6}>
              <Bookmark size={12} color="rgba(255,255,255,0.5)" />
              <Text style={s.mealActionSave}> Save</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <>
          <View style={s.editGrid}>
            <View style={s.editRow}>
              <View style={s.editField}>
                <Text style={s.editLabel}>Cal:</Text>
                <TextInput
                  style={s.editInput}
                  value={cal}
                  onChangeText={setCal}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
              </View>
              <View style={s.editField}>
                <Text style={s.editLabel}>P:</Text>
                <TextInput
                  style={s.editInput}
                  value={protein}
                  onChangeText={setProtein}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
                <Text style={s.editUnit}>g</Text>
              </View>
            </View>
            <View style={s.editRow}>
              <View style={s.editField}>
                <Text style={s.editLabel}>C:</Text>
                <TextInput
                  style={s.editInput}
                  value={carbs}
                  onChangeText={setCarbs}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
                <Text style={s.editUnit}>g</Text>
              </View>
              <View style={s.editField}>
                <Text style={s.editLabel}>F:</Text>
                <TextInput
                  style={s.editInput}
                  value={fat}
                  onChangeText={setFat}
                  keyboardType="numeric"
                  selectTextOnFocus
                  placeholderTextColor="rgba(255,255,255,0.3)"
                />
                <Text style={s.editUnit}>g</Text>
              </View>
            </View>
          </View>

          <View style={s.editActions}>
            <TouchableOpacity onPress={saveEdit} style={s.editSaveBtn} activeOpacity={0.75}>
              <Check size={14} color="#84CC16" />
              <Text style={s.editSaveText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} style={s.editCancelBtn} activeOpacity={0.75}>
              <X size={14} color="rgba(255,255,255,0.6)" />
              <Text style={s.editCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
