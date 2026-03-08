import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView,
  Platform, Modal, FlatList, ActivityIndicator, StyleSheet, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { Card } from '@shared/components/ui/Card';
import { WorkoutsStackParamList } from '@core/navigation/stacks/WorkoutsStack';
import { workoutsStyles } from '../styles';
import { useWorkoutEditor } from '../hooks/useWorkoutEditor';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { ExerciseType } from '@shared/types/common';
import { ExerciseTemplateRow } from '@database/repositories/exerciseRepo';

type Props = NativeStackScreenProps<WorkoutsStackParamList, 'CreateWorkout'>;
type PickerStep = 'list' | 'create';

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Core', 'Glutes', 'Quads', 'Hamstrings', 'Calves', 'Full Body',
];

const EXERCISE_TYPES: { value: ExerciseType; label: string }[] = [
  { value: 'strength',    label: 'Strength' },
  { value: 'bodyweight',  label: 'Bodyweight' },
  { value: 'cardio',      label: 'Cardio' },
  { value: 'flexibility', label: 'Flexibility' },
  { value: 'endurance',   label: 'Endurance' },
  { value: 'hiit',        label: 'HIIT' },
  { value: 'warmup',      label: 'Warm-up' },
  { value: 'other',       label: 'Other' },
];

const DURATION_TYPES: ExerciseType[] = ['cardio', 'flexibility', 'endurance', 'warmup'];
const NO_WEIGHT_TYPES: ExerciseType[] = ['bodyweight', 'cardio', 'flexibility', 'endurance', 'hiit', 'warmup'];

function getSetColumns(type: ExerciseType) {
  return {
    isDuration: DURATION_TYPES.includes(type),
    showWeight: !NO_WEIGHT_TYPES.includes(type),
    repLabel: DURATION_TYPES.includes(type) ? 'SECS' : 'REPS',
  };
}

export default function CreateWorkoutScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const existingId = route.params?.workoutTemplateId;

  const [name, setName] = useState('');
  const [assignedWeekday, setAssignedWeekday] = useState<number | null>(null);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerStep, setPickerStep] = useState<PickerStep>('list');
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState<string | null>(null);

  const [newExName, setNewExName] = useState('');
  const [newExType, setNewExType] = useState<ExerciseType>('strength');
  const [newExMuscle, setNewExMuscle] = useState('');
  const [creatingEx, setCreatingEx] = useState(false);

  const {
    templateData, pendingExercises, allExercises,
    loadingExercises, saving,
    addExerciseToList, removeExerciseFromList,
    updateSet, addSet, removeSet, updateRestTime,
    saveWorkout, createAndAddExercise, deleteExerciseFromLibrary,
  } = useWorkoutEditor(existingId);

  const confirmDeleteExercise = (id: number, name: string) => {
    Alert.alert(
      'Delete Exercise',
      `Delete "${name}" from the library? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteExerciseFromLibrary(id) },
      ]
    );
  };

  useEffect(() => {
    if (templateData) {
      setName(templateData.name);
      setAssignedWeekday(templateData.assignedWeekday ?? null);
    }
  }, [templateData]);

  const addedIds = useMemo(
    () => new Set(pendingExercises.map((e) => e.exerciseTemplateId)),
    [pendingExercises]
  );

  const availableMuscles = useMemo(
    () => [...new Set(allExercises.map((e) => e.targetMuscle))].sort(),
    [allExercises]
  );

  const filteredExercises = useMemo(
    () => allExercises.filter((e) => {
      const matchesSearch = e.name.toLowerCase().includes(pickerSearch.toLowerCase());
      const matchesMuscle = pickerMuscleFilter === null || e.targetMuscle === pickerMuscleFilter;
      return matchesSearch && matchesMuscle;
    }),
    [allExercises, pickerSearch, pickerMuscleFilter]
  );

  const handleSave = async () => {
    const ok = await saveWorkout(name.trim(), null, assignedWeekday);
    if (ok) navigation.goBack();
  };

  const openPicker = () => {
    setPickerStep('list');
    setPickerSearch('');
    setPickerMuscleFilter(null);
    setNewExName('');
    setNewExType('strength');
    setNewExMuscle('');
    setPickerVisible(true);
  };

  const closePicker = () => setPickerVisible(false);

  const handleTapExercise = (item: ExerciseTemplateRow) => {
    addExerciseToList(item);
    // Picker stays open
  };

  const handleCreateAndAdd = async () => {
    if (!newExName.trim() || !newExMuscle) return;
    setCreatingEx(true);
    try {
      await createAndAddExercise(newExName.trim(), newExType, newExMuscle);
      setPickerStep('list');
      setNewExName(''); setNewExMuscle('');
    } finally {
      setCreatingEx(false);
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
            <Text style={{ ...typography.screenTitle, color: colors.textPrimary }}>
              {existingId ? 'Edit Workout' : 'New Workout'}
            </Text>
          </View>

          <Input label="Workout name" value={name} onChangeText={setName} placeholder="e.g. Push Day" containerStyle={{ marginBottom: spacing.base }} />

          <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>Day (optional)</Text>
          <View style={{ flexDirection: 'row', marginBottom: spacing.xl }}>
            {['S','M','T','W','T','F','S'].map((letter, day) => {
              const selected = assignedWeekday === day;
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setAssignedWeekday(selected ? null : day)}
                  style={{
                    flex: 1, alignItems: 'center', paddingVertical: spacing.sm,
                    borderRadius: Radius.sm,
                    borderWidth: 1.5,
                    borderColor: selected ? colors.brandPrimary : colors.border,
                    backgroundColor: selected ? `${colors.brandPrimary}22` : colors.transparent,
                    marginHorizontal: 2,
                  }}
                >
                  <Text style={{ ...typography.caption, color: selected ? colors.brandPrimary : colors.textSecondary, fontWeight: selected ? '700' : '400' }}>
                    {letter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Exercises section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
            <Text style={{ ...typography.sectionTitle, color: colors.textPrimary }}>Exercises</Text>
            <TouchableOpacity onPress={openPicker}>
              <Text style={{ ...typography.label, color: colors.brandPrimary }}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {loadingExercises ? (
            <ActivityIndicator color={colors.brandPrimary} style={{ marginBottom: spacing.xl }} />
          ) : pendingExercises.length === 0 ? (
            <Card style={{ marginBottom: spacing.xl }}>
              <Text style={{ ...typography.body, color: colors.textTertiary, textAlign: 'center' }}>
                No exercises yet. Tap "+ Add" to add some.
              </Text>
            </Card>
          ) : (
            <View style={{ marginBottom: spacing.xl }}>
              {pendingExercises.map((ex, idx) => {
                const { isDuration, showWeight, repLabel } = getSetColumns(ex.exerciseType);
                const cellStyle = {
                  flex: 1,
                  backgroundColor: colors.surface,
                  borderRadius: 6,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingVertical: 6,
                  paddingHorizontal: spacing.sm,
                  textAlign: 'center' as const,
                  ...typography.body,
                  color: colors.textPrimary,
                };
                return (
                  <Card key={ex.exerciseTemplateId} style={{ marginBottom: spacing.sm }}>
                    {/* Name + remove */}
                    <View style={[workoutsStyles.exerciseEditorRow, { marginBottom: spacing.sm }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ ...typography.label, color: colors.textPrimary }}>
                          {idx + 1}. {ex.exerciseName}
                        </Text>
                        <Text style={{ ...typography.caption, color: colors.textTertiary }}>
                          {ex.exerciseType}
                        </Text>
                      </View>
                      <TouchableOpacity onPress={() => removeExerciseFromList(ex.exerciseTemplateId)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                        <Text style={{ ...typography.label, color: colors.error }}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Rest time row */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: spacing.sm }}>
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>Rest:</Text>
                      <TextInput
                        value={String(ex.restTimeSeconds)}
                        onChangeText={(v) => updateRestTime(ex.exerciseTemplateId, parseInt(v) || 0)}
                        keyboardType="number-pad"
                        style={[cellStyle, { flex: 0, width: 56, textAlign: 'center' }]}
                      />
                      <Text style={{ ...typography.caption, color: colors.textSecondary }}>s</Text>
                    </View>

                    {/* Set table header */}
                    <View style={[workoutsStyles.setTableHeader, { borderBottomColor: colors.border }]}>
                      <Text style={{ ...typography.caption, color: colors.textTertiary, width: 28, textAlign: 'center' }}>SET</Text>
                      <Text style={{ ...typography.caption, color: colors.textTertiary, flex: 1, textAlign: 'center' }}>{repLabel}</Text>
                      {showWeight && <Text style={{ ...typography.caption, color: colors.textTertiary, flex: 1, textAlign: 'center' }}>KG</Text>}
                    </View>

                    {/* Set rows */}
                    {ex.sets.map((set, si) => (
                      <View key={si} style={workoutsStyles.setTableRow}>
                        <Text style={{ ...typography.caption, color: colors.textSecondary, width: 28, textAlign: 'center' }}>
                          {si + 1}
                        </Text>
                        <TextInput
                          value={String(set.reps)}
                          onChangeText={(v) => updateSet(ex.exerciseTemplateId, si, { reps: parseInt(v) || 0 })}
                          keyboardType="number-pad"
                          style={cellStyle}
                          selectTextOnFocus
                          placeholder={isDuration ? 'secs' : 'reps'}
                          placeholderTextColor={colors.textTertiary}
                        />
                        {showWeight && (
                          <TextInput
                            value={String(set.weight)}
                            onChangeText={(v) => updateSet(ex.exerciseTemplateId, si, { weight: parseFloat(v) || 0 })}
                            keyboardType="decimal-pad"
                            style={cellStyle}
                            selectTextOnFocus
                          />
                        )}
                      </View>
                    ))}

                    {/* Add / remove set */}
                    <View style={[workoutsStyles.setActions, { borderTopColor: colors.border }]}>
                      <TouchableOpacity
                        onPress={() => removeSet(ex.exerciseTemplateId)}
                        disabled={ex.sets.length <= 1}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ ...typography.caption, color: ex.sets.length <= 1 ? colors.textTertiary : colors.error }}>
                          − Remove Set
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => addSet(ex.exerciseTemplateId)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ ...typography.caption, color: colors.brandPrimary }}>+ Add Set</Text>
                      </TouchableOpacity>
                    </View>
                  </Card>
                );
              })}
            </View>
          )}

          <Button
            label={existingId ? 'Update Workout' : 'Save Workout'}
            onPress={handleSave}
            loading={saving}
            disabled={name.trim().length === 0}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Exercise Picker Modal */}
      <Modal visible={pickerVisible} transparent animationType="slide" onRequestClose={closePicker}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'flex-end' }}
        >
          {/* Backdrop */}
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
            activeOpacity={1}
            onPress={closePicker}
          />

          {/* Sheet */}
          <View style={[workoutsStyles.pickerSheet, { backgroundColor: colors.backgroundSecondary }]}>
            {/* Modal header */}
            <View style={[workoutsStyles.pickerHeader, { borderBottomColor: colors.border }]}>
              {pickerStep === 'create' ? (
                <TouchableOpacity onPress={() => setPickerStep('list')}>
                  <Text style={{ ...typography.label, color: colors.brandPrimary }}>← Back</Text>
                </TouchableOpacity>
              ) : <View style={{ width: 48 }} />}
              <Text style={{ ...typography.sectionTitle, color: colors.textPrimary }}>
                {pickerStep === 'list'
                  ? `Add Exercises${pendingExercises.length > 0 ? ` · ${pendingExercises.length} added` : ''}`
                  : 'New Exercise'}
              </Text>
              <TouchableOpacity onPress={closePicker} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={{ ...typography.label, color: colors.brandPrimary }}>Done</Text>
              </TouchableOpacity>
            </View>

            {/* Step: browse exercises */}
            {pickerStep === 'list' ? (
              <>
                <View style={[workoutsStyles.pickerSearchContainer, { borderBottomColor: colors.border }]}>
                  <Input placeholder="Search exercises..." value={pickerSearch} onChangeText={setPickerSearch} />
                </View>
                {/* Muscle group filter pills */}
                {availableMuscles.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacing.base, paddingVertical: spacing.sm, gap: spacing.xs }}
                    style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}
                    keyboardShouldPersistTaps="handled"
                  >
                    {availableMuscles.map((muscle) => {
                      const active = pickerMuscleFilter === muscle;
                      return (
                        <TouchableOpacity
                          key={muscle}
                          onPress={() => setPickerMuscleFilter(active ? null : muscle)}
                          style={{
                            paddingHorizontal: spacing.sm,
                            paddingVertical: 4,
                            borderRadius: Radius.full,
                            borderWidth: 1.5,
                            borderColor: active ? colors.brandPrimary : colors.border,
                            backgroundColor: active ? `${colors.brandPrimary}22` : colors.transparent,
                          }}
                        >
                          <Text style={{ ...typography.caption, color: active ? colors.brandPrimary : colors.textSecondary, fontWeight: active ? '700' : '400' }}>
                            {muscle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                ) : null}
                <FlatList
                  data={filteredExercises}
                  keyExtractor={(item) => String(item.id)}
                  keyboardShouldPersistTaps="handled"
                  keyboardDismissMode="on-drag"
                  renderItem={({ item }) => {
                    const added = addedIds.has(item.id);
                    return (
                      <View style={[workoutsStyles.pickerItem, { borderBottomColor: colors.border }]}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => handleTapExercise(item)}
                          activeOpacity={added ? 1 : 0.7}
                        >
                          <Text style={{ ...typography.label, color: colors.textPrimary }}>{item.name}</Text>
                          <Text style={{ ...typography.caption, color: colors.textSecondary }}>
                            {item.targetMuscle} · {item.type}
                          </Text>
                        </TouchableOpacity>
                        <Text style={{ ...typography.label, color: added ? colors.brandPrimary : colors.textTertiary, width: 24, textAlign: 'center' }}>
                          {added ? '✓' : '+'}
                        </Text>
                        <TouchableOpacity
                          onPress={() => confirmDeleteExercise(item.id, item.name)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                          style={{ marginLeft: 12 }}
                        >
                          <Text style={{ ...typography.label, color: colors.error }}>🗑</Text>
                        </TouchableOpacity>
                      </View>
                    );
                  }}
                  ListEmptyComponent={
                    <View style={{ alignItems: 'center', padding: spacing['2xl'] }}>
                      <Text style={{ ...typography.body, color: colors.textTertiary }}>No exercises found.</Text>
                    </View>
                  }
                />
                <View style={{ padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Button label="+ Create New Exercise" variant="secondary" onPress={() => setPickerStep('create')} />
                </View>
              </>
            ) : null}

            {/* Step: create new exercise */}
            {pickerStep === 'create' ? (
              <>
                <ScrollView contentContainerStyle={workoutsStyles.configSection} keyboardShouldPersistTaps="handled">
                  <Input label="Exercise name" value={newExName} onChangeText={setNewExName} placeholder="e.g. Bench Press" containerStyle={{ marginBottom: spacing.base }} autoCapitalize="words" />
                  <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>Type</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.base }}>
                    {EXERCISE_TYPES.map(({ value, label }) => {
                      const sel = newExType === value;
                      return (
                        <TouchableOpacity
                          key={value}
                          onPress={() => setNewExType(value)}
                          style={{
                            paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
                            borderRadius: Radius.full, borderWidth: 1.5,
                            borderColor: sel ? colors.brandPrimary : colors.border,
                            backgroundColor: sel ? `${colors.brandPrimary}22` : colors.transparent,
                          }}
                        >
                          <Text style={{ ...typography.caption, color: sel ? colors.brandPrimary : colors.textSecondary, fontWeight: sel ? '700' : '400' }}>
                            {label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <Text style={{ ...typography.label, color: colors.textSecondary, marginBottom: spacing.sm }}>Target Muscle</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
                    {MUSCLE_GROUPS.map((muscle) => {
                      const sel = newExMuscle === muscle;
                      return (
                        <TouchableOpacity
                          key={muscle}
                          onPress={() => setNewExMuscle(sel ? '' : muscle)}
                          style={{
                            paddingHorizontal: spacing.sm, paddingVertical: spacing.xs,
                            borderRadius: Radius.full, borderWidth: 1.5,
                            borderColor: sel ? colors.brandPrimary : colors.border,
                            backgroundColor: sel ? `${colors.brandPrimary}22` : colors.transparent,
                          }}
                        >
                          <Text style={{ ...typography.caption, color: sel ? colors.brandPrimary : colors.textSecondary, fontWeight: sel ? '700' : '400' }}>
                            {muscle}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </ScrollView>
                <View style={{ padding: spacing.base, borderTopWidth: 1, borderTopColor: colors.border }}>
                  <Button
                    label="Create & Add"
                    onPress={handleCreateAndAdd}
                    loading={creatingEx}
                    disabled={!newExName.trim() || !newExMuscle}
                  />
                </View>
              </>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
