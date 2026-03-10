import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { useTheme } from '@theme/index';
import { MealLogRow } from '@database/repositories/mealRepo';
import { createMealsStyles } from '../styles';
import { Edit3, Trash2, Bookmark, Check, X, MoreVertical } from 'lucide-react-native';

interface MealLogCardProps {
  log: MealLogRow;
  onDelete: () => void;
  onSave: () => void;
  onEdit: (fields: { calories: number; protein: number; carbs: number; fat: number }) => void;
}

export default function MealLogCard({ log, onDelete, onSave, onEdit }: MealLogCardProps) {
  const { colors } = useTheme();
  const s = useMemo(() => createMealsStyles(colors), [colors]);

  const [menuOpen, setMenuOpen] = useState(false);
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
    setMenuOpen(false);
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={s.mealItemCal}>{Math.round(log.calories)} cal</Text>
              <TouchableOpacity
                onPress={() => setMenuOpen(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.6}
              >
                <MoreVertical size={16} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.mealItemMacros}>
            <Text style={s.mealItemMacroText}>P: {Math.round(log.protein)}g</Text>
            <Text style={s.mealItemMacroDot}>•</Text>
            <Text style={s.mealItemMacroText}>C: {Math.round(log.carbs)}g</Text>
            <Text style={s.mealItemMacroDot}>•</Text>
            <Text style={s.mealItemMacroText}>F: {Math.round(log.fat)}g</Text>
          </View>

          {menuOpen && (
            <View style={s.kebabMenu}>
              <TouchableOpacity onPress={startEdit} style={s.kebabItem} activeOpacity={0.7}>
                <Edit3 size={14} color="#3B82F6" />
                <Text style={[s.kebabItemText, { color: '#3B82F6' }]}>Edit</Text>
              </TouchableOpacity>
              <View style={s.kebabDivider} />
              <TouchableOpacity
                onPress={() => { onSave(); setMenuOpen(false); }}
                style={s.kebabItem}
                activeOpacity={0.7}
              >
                <Bookmark size={14} color="#84CC16" />
                <Text style={[s.kebabItemText, { color: '#84CC16' }]}>Save to templates</Text>
              </TouchableOpacity>
              <View style={s.kebabDivider} />
              <TouchableOpacity
                onPress={() => { onDelete(); setMenuOpen(false); }}
                style={s.kebabItem}
                activeOpacity={0.7}
              >
                <Trash2 size={14} color="#EF4444" />
                <Text style={[s.kebabItemText, { color: '#EF4444' }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          )}
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
              <Text style={s.editSaveText}> Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditing(false)} style={s.editCancelBtn} activeOpacity={0.75}>
              <X size={14} color="rgba(255,255,255,0.6)" />
              <Text style={s.editCancelText}> Cancel</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
