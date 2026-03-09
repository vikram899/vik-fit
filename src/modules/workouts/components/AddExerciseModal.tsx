import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { X, Search, Plus, Dumbbell, Sparkles, History, User, Timer, Zap } from 'lucide-react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import { ExerciseType } from '@shared/types/common';
import { getAllExercises, createExercise } from '../services/exerciseService';
import { addExercise, getTemplateExercisesWithNames } from '../services/workoutTemplateService';
import { ExerciseTemplateRow } from '@database/repositories/exerciseRepo';

// ── Built-in exercise library ─────────────────────────────────────────────────

type LibraryExercise = { name: string; targetMuscle: string; type: ExerciseType };

const LIBRARY: LibraryExercise[] = [
  { name: 'Barbell Bench Press',    targetMuscle: 'Chest',     type: 'strength'   },
  { name: 'Incline Dumbbell Press', targetMuscle: 'Chest',     type: 'strength'   },
  { name: 'Cable Flyes',            targetMuscle: 'Chest',     type: 'strength'   },
  { name: 'Push-ups',               targetMuscle: 'Chest',     type: 'bodyweight' },
  { name: 'Pull-ups',               targetMuscle: 'Back',      type: 'bodyweight' },
  { name: 'Barbell Rows',           targetMuscle: 'Back',      type: 'strength'   },
  { name: 'Lat Pulldown',           targetMuscle: 'Back',      type: 'strength'   },
  { name: 'Deadlift',               targetMuscle: 'Back',      type: 'strength'   },
  { name: 'Squats',                 targetMuscle: 'Legs',      type: 'strength'   },
  { name: 'Leg Press',              targetMuscle: 'Legs',      type: 'strength'   },
  { name: 'Romanian Deadlift',      targetMuscle: 'Legs',      type: 'strength'   },
  { name: 'Lunges',                 targetMuscle: 'Legs',      type: 'strength'   },
  { name: 'Shoulder Press',         targetMuscle: 'Shoulders', type: 'strength'   },
  { name: 'Lateral Raises',         targetMuscle: 'Shoulders', type: 'strength'   },
  { name: 'Face Pulls',             targetMuscle: 'Shoulders', type: 'strength'   },
  { name: 'Bicep Curls',            targetMuscle: 'Arms',      type: 'strength'   },
  { name: 'Tricep Dips',            targetMuscle: 'Arms',      type: 'bodyweight' },
  { name: 'Hammer Curls',           targetMuscle: 'Arms',      type: 'strength'   },
  { name: 'Plank',                  targetMuscle: 'Core',      type: 'bodyweight' },
  { name: 'Cable Crunches',         targetMuscle: 'Core',      type: 'strength'   },
  { name: 'Running',                targetMuscle: 'Cardio',    type: 'cardio'     },
  { name: 'Cycling',                targetMuscle: 'Cardio',    type: 'cardio'     },
  { name: 'Jump Rope',              targetMuscle: 'Cardio',    type: 'hiit'       },
];

const MUSCLE_GROUPS = ['Chest', 'Back', 'Legs', 'Shoulders', 'Arms', 'Core'];

const EQUIPMENT_OPTIONS = ['Barbell', 'Dumbbells', 'Cable', 'Machine', 'Bodyweight', 'Kettlebell', 'Bands'];

const DIFFICULTY_LEVELS: { label: string; color: string; activeColor: string }[] = [
  { label: 'Beginner',     color: 'rgba(132,204,22,0.15)',  activeColor: '#84CC16' },
  { label: 'Intermediate', color: 'rgba(59,130,246,0.15)',  activeColor: '#3B82F6' },
  { label: 'Advanced',     color: 'rgba(239,68,68,0.15)',   activeColor: '#EF4444' },
];

const TRACKING_METHODS: { type: ExerciseType; label: string; sub: string; Icon: React.ComponentType<any> }[] = [
  { type: 'strength',   label: 'Weight + Reps',       sub: 'Track sets, reps, and weight',      Icon: Dumbbell },
  { type: 'bodyweight', label: 'Bodyweight Reps',      sub: 'Track sets and reps without weight', Icon: User    },
  { type: 'cardio',     label: 'Time-Based',           sub: 'Track exercise duration',            Icon: Timer   },
  { type: 'hiit',       label: 'Time + Reps (HIIT)',   sub: 'Track reps completed within time',   Icon: Zap     },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  visible: boolean;
  onClose: () => void;
  workoutTemplateId: number;
  onAdded: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AddExerciseModal({ visible, onClose, workoutTemplateId, onAdded }: Props) {
  const { colors, spacing } = useTheme();

  const [tab, setTab] = useState<'library' | 'custom' | 'new'>('library');
  const [search, setSearch] = useState('');
  const [customExercises, setCustomExercises] = useState<ExerciseTemplateRow[]>([]);
  const [addingId, setAddingId] = useState<number | string | null>(null);

  // New exercise form
  const [newName, setNewName] = useState('');
  const [newMuscle, setNewMuscle] = useState(MUSCLE_GROUPS[0]);
  const [newType, setNewType] = useState<ExerciseType>('strength');
  const [newEquipment, setNewEquipment] = useState<string | null>(null);
  const [newDifficulty, setNewDifficulty] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const loadCustom = useCallback(async () => {
    const all = await getAllExercises();
    setCustomExercises(all);
  }, []);

  useEffect(() => {
    if (visible) {
      setTab('library');
      setSearch('');
      setNewName('');
      setNewMuscle(MUSCLE_GROUPS[0]);
      setNewType('strength');
      setNewEquipment(null);
      setNewDifficulty(null);
      loadCustom();
    }
  }, [visible, loadCustom]);

  const getNextOrder = async () => {
    const exs = await getTemplateExercisesWithNames(workoutTemplateId);
    return exs.length;
  };

  const doAdd = async (exerciseTemplateId: number) => {
    const orderIndex = await getNextOrder();
    await addExercise({
      workoutTemplateId,
      exerciseTemplateId,
      orderIndex,
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 0,
      defaultRestTimeSeconds: 90,
    });
    onAdded();
    onClose();
  };

  const handleAddLibrary = async (ex: LibraryExercise) => {
    setAddingId(ex.name);
    try {
      const all = await getAllExercises();
      const match = all.find((e) => e.name.toLowerCase() === ex.name.toLowerCase());
      const exerciseId = match ? match.id : await createExercise({ name: ex.name, type: ex.type, targetMuscle: ex.targetMuscle });
      await doAdd(exerciseId);
    } finally {
      setAddingId(null);
    }
  };

  const handleAddCustom = async (ex: ExerciseTemplateRow) => {
    setAddingId(ex.id);
    try {
      await doAdd(ex.id);
    } finally {
      setAddingId(null);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const exerciseId = await createExercise({ name: newName.trim(), type: newType, targetMuscle: newMuscle });
      await doAdd(exerciseId);
      await loadCustom();
    } finally {
      setCreating(false);
    }
  };

  const filteredLibrary = LIBRARY.filter((ex) =>
    ex.name.toLowerCase().includes(search.toLowerCase())
  );

  const bg = 'rgba(255,255,255,0.05)';
  const border = 'rgba(255,255,255,0.1)';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity
            style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.75)' }]}
            activeOpacity={1}
            onPress={onClose}
          />
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            maxHeight: '92%',
          }}>
            {/* Handle */}
            <View style={{ alignItems: 'center', paddingTop: spacing.sm }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: colors.border }} />
            </View>

            {/* Header */}
            <View style={{
              paddingHorizontal: Layout.screenPaddingHorizontal,
              paddingVertical: spacing.base,
              borderBottomWidth: 1, borderBottomColor: colors.border,
            }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>Add Exercise</Text>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.75}
                  style={{ width: 36, height: 36, borderRadius: Radius.md, backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}
                >
                  <X size={18} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {([
                  { key: 'library', label: 'Library',     Icon: Dumbbell,  activeColor: '#3B82F6' },
                  { key: 'custom',  label: 'Your Custom', Icon: History,   activeColor: '#3B82F6' },
                  { key: 'new',     label: 'Create New',  Icon: Sparkles,  activeColor: '#84CC16' },
                ] as const).map(({ key, label, Icon, activeColor }) => (
                  <TouchableOpacity
                    key={key}
                    onPress={() => setTab(key)}
                    activeOpacity={0.8}
                    style={{
                      flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                      backgroundColor: tab === key ? activeColor : 'rgba(255,255,255,0.05)',
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Icon size={13} color={tab === key ? '#fff' : 'rgba(255,255,255,0.6)'} />
                    <Text style={{ fontSize: 12, fontWeight: '500', color: tab === key ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 12, paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ── Library ── */}
              {tab === 'library' && (
                <View style={{ gap: 8 }}>
                  <View style={{
                    flexDirection: 'row', alignItems: 'center', gap: 10,
                    backgroundColor: bg, borderRadius: Radius.md, borderWidth: 1, borderColor: border,
                    paddingHorizontal: 12, marginBottom: 4,
                  }}>
                    <Search size={16} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      value={search}
                      onChangeText={setSearch}
                      placeholder="Search exercises..."
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 12 }}
                    />
                  </View>

                  {filteredLibrary.length === 0 ? (
                    <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: 24 }}>
                      No exercises matching "{search}"
                    </Text>
                  ) : filteredLibrary.map((ex) => (
                    <View key={ex.name} style={{
                      backgroundColor: bg, borderRadius: Radius.md, borderWidth: 1, borderColor: border,
                      padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}>
                      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={() => handleAddLibrary(ex)}>
                        <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: 3 }}>
                          {ex.name}
                        </Text>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                          {ex.targetMuscle} · {ex.type}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAddLibrary(ex)}
                        disabled={addingId === ex.name}
                        activeOpacity={0.75}
                        style={{ width: 36, height: 36, borderRadius: Radius.md, backgroundColor: 'rgba(132,204,22,0.15)', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {addingId === ex.name
                          ? <ActivityIndicator size="small" color="#84CC16" />
                          : <Plus size={18} color="#84CC16" />}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Custom ── */}
              {tab === 'custom' && (
                <View style={{ gap: 8 }}>
                  {customExercises.length === 0 ? (
                    <View style={{ alignItems: 'center', paddingVertical: 32 }}>
                      <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>No custom exercises yet</Text>
                      <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>Create one in the "Create New" tab</Text>
                    </View>
                  ) : customExercises.map((ex) => (
                    <View key={ex.id} style={{
                      backgroundColor: bg, borderRadius: Radius.md, borderWidth: 1, borderColor: border,
                      padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
                    }}>
                      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={() => handleAddCustom(ex)}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{ex.name}</Text>
                          <View style={{
                            backgroundColor: 'rgba(132,204,22,0.15)', borderRadius: 4,
                            paddingHorizontal: 5, paddingVertical: 1,
                            borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
                          }}>
                            <Text style={{ fontSize: 9, fontWeight: '700', color: '#84CC16', letterSpacing: 0.5 }}>CUSTOM</Text>
                          </View>
                        </View>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                          {ex.targetMuscle} · {ex.type}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => handleAddCustom(ex)}
                        disabled={addingId === ex.id}
                        activeOpacity={0.75}
                        style={{ width: 36, height: 36, borderRadius: Radius.md, backgroundColor: 'rgba(132,204,22,0.15)', alignItems: 'center', justifyContent: 'center' }}
                      >
                        {addingId === ex.id
                          ? <ActivityIndicator size="small" color="#84CC16" />
                          : <Plus size={18} color="#84CC16" />}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {/* ── Create New ── */}
              {tab === 'new' && (
                <View style={{ gap: 16 }}>
                  {/* Name */}
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Exercise Name</Text>
                    <View style={{ backgroundColor: bg, borderRadius: Radius.md, borderWidth: 1, borderColor: border, paddingHorizontal: 14 }}>
                      <TextInput
                        value={newName}
                        onChangeText={setNewName}
                        placeholder="e.g., Cable Crossover"
                        placeholderTextColor="rgba(255,255,255,0.3)"
                        style={{ fontSize: 14, color: colors.textPrimary, paddingVertical: 13 }}
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  {/* Muscle Group */}
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Muscle Group</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {MUSCLE_GROUPS.map((m) => (
                        <TouchableOpacity
                          key={m}
                          onPress={() => setNewMuscle(m)}
                          activeOpacity={0.75}
                          style={{
                            paddingHorizontal: 16, paddingVertical: 10, borderRadius: Radius.md,
                            backgroundColor: newMuscle === m ? '#3B82F6' : bg,
                            borderWidth: 1, borderColor: newMuscle === m ? '#3B82F6' : border,
                          }}
                        >
                          <Text style={{ fontSize: 13, fontWeight: '500', color: newMuscle === m ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                            {m}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Equipment */}
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Equipment</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                      {EQUIPMENT_OPTIONS.map((eq) => {
                        const active = newEquipment === eq;
                        return (
                          <TouchableOpacity
                            key={eq}
                            onPress={() => setNewEquipment(active ? null : eq)}
                            activeOpacity={0.75}
                            style={{
                              paddingHorizontal: 16, paddingVertical: 10, borderRadius: 99,
                              backgroundColor: active ? '#9333EA' : bg,
                              borderWidth: 1, borderColor: active ? '#9333EA' : border,
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '500', color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                              {eq}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Tracking Method */}
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Tracking Method</Text>
                    <View style={{ gap: 8 }}>
                      {TRACKING_METHODS.map(({ type, label, sub: desc, Icon }) => {
                        const active = newType === type;
                        return (
                          <TouchableOpacity
                            key={type}
                            onPress={() => setNewType(type)}
                            activeOpacity={0.75}
                            style={{
                              flexDirection: 'row', alignItems: 'center', gap: 12,
                              padding: 12, borderRadius: Radius.md,
                              backgroundColor: active ? '#3B82F6' : bg,
                              borderWidth: 1, borderColor: active ? '#3B82F6' : border,
                            }}
                          >
                            <View style={{
                              width: 40, height: 40, borderRadius: Radius.md,
                              backgroundColor: active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.05)',
                              alignItems: 'center', justifyContent: 'center',
                            }}>
                              <Icon size={18} color={active ? '#fff' : '#3B82F6'} />
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ fontSize: 14, fontWeight: '600', color: active ? '#fff' : colors.textPrimary }}>
                                {label}
                              </Text>
                              <Text style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.4)', marginTop: 1 }}>
                                {desc}
                              </Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Difficulty Level */}
                  <View>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Difficulty Level</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      {DIFFICULTY_LEVELS.map(({ label, activeColor }) => {
                        const active = newDifficulty === label;
                        return (
                          <TouchableOpacity
                            key={label}
                            onPress={() => setNewDifficulty(active ? null : label)}
                            activeOpacity={0.75}
                            style={{
                              flex: 1, paddingVertical: 12, borderRadius: Radius.md,
                              backgroundColor: active ? activeColor : bg,
                              borderWidth: 1, borderColor: active ? activeColor : border,
                              alignItems: 'center',
                            }}
                          >
                            <Text style={{ fontSize: 13, fontWeight: '600', color: active ? '#fff' : 'rgba(255,255,255,0.6)' }}>
                              {label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  {/* Create button */}
                  <TouchableOpacity
                    onPress={handleCreate}
                    disabled={!newName.trim() || creating}
                    activeOpacity={0.85}
                    style={{
                      backgroundColor: newName.trim() ? '#84CC16' : 'rgba(132,204,22,0.3)',
                      borderRadius: Radius.xl,
                      paddingVertical: 16,
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    }}
                  >
                    {creating
                      ? <ActivityIndicator color="#fff" size="small" />
                      : (<><Plus size={20} color="#fff" /><Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Add Custom Exercise</Text></>)
                    }
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
