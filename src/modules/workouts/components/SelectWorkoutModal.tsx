import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, Modal, TouchableOpacity, ScrollView, TextInput,
  ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet,
} from 'react-native';
import { X, Search, Plus, Clock, Bookmark, Dumbbell } from 'lucide-react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Layout } from '@theme/spacing';
import {
  getAllTemplatesWithCounts,
  getLastPerformedLog,
  createTemplate,
} from '../services/workoutTemplateService';
import { WorkoutTemplateWithCountRow } from '@database/repositories/workoutRepo';

const WEEKDAY_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAYS_DISPLAY = [
  { label: 'Mon', index: 1 },
  { label: 'Tue', index: 2 },
  { label: 'Wed', index: 3 },
  { label: 'Thu', index: 4 },
  { label: 'Fri', index: 5 },
  { label: 'Sat', index: 6 },
  { label: 'Sun', index: 0 },
];

const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Biceps',
  'Triceps', 'Legs', 'Quads', 'Hamstrings',
  'Glutes', 'Calves', 'Core', 'Abs', 'Cardio', 'Full Body',
];

function formatRelativeTime(iso: string): string {
  const diffDays = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

interface WorkoutCardProps {
  t: WorkoutTemplateWithCountRow;
  lastIso?: string | null;
  onView: () => void;
  onStart: () => void;
  colors: ReturnType<typeof useTheme>['colors'];
  spacing: ReturnType<typeof useTheme>['spacing'];
}

function parseMeta(description: string | null): { muscleGroups?: string[]; duration?: number } {
  if (!description) return {};
  try { return JSON.parse(description); } catch { return {}; }
}

function WorkoutCard({ t, lastIso, onView, onStart, colors, spacing }: WorkoutCardProps) {
  const meta = parseMeta(t.description ?? null);
  const muscleGroups: string[] = meta.muscleGroups ?? [];
  const duration = meta.duration ?? Math.max(t.exerciseCount * 5, 10);

  return (
    <View style={{
      backgroundColor: colors.backgroundPrimary,
      borderRadius: Radius.lg,
      borderWidth: 1, borderColor: colors.border,
      padding: 12,
      marginBottom: 8,
      flexDirection: 'row', alignItems: 'center', gap: 10,
    }}>
      {/* Card body — tapping views detail */}
      <TouchableOpacity style={{ flex: 1 }} activeOpacity={0.75} onPress={onView}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.textPrimary }}>{t.name}</Text>
          <Text style={{ fontSize: 12, fontWeight: '500', color: '#3B82F6' }}>{duration} min</Text>
        </View>
        {muscleGroups.length > 0 ? (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {muscleGroups.map((g) => (
              <View
                key={g}
                style={{
                  backgroundColor: 'rgba(59,130,246,0.15)',
                  borderRadius: 99, paddingHorizontal: 8, paddingVertical: 2,
                  borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                }}
              >
                <Text style={{ fontSize: 10, color: '#3B82F6' }}>{g}</Text>
              </View>
            ))}
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Dumbbell size={12} color="rgba(255,255,255,0.4)" />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
              {t.exerciseCount} exercises
            </Text>
          </View>
          {lastIso ? (
            <Text style={{ fontSize: 12, color: '#84CC16' }}>Last: {formatRelativeTime(lastIso)}</Text>
          ) : null}
        </View>
      </TouchableOpacity>

      {/* Quick-start "+" button */}
      <TouchableOpacity
        onPress={onStart}
        activeOpacity={0.75}
        style={{
          width: 40, height: 40, borderRadius: Radius.md,
          backgroundColor: 'rgba(132,204,22,0.2)',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Plus size={18} color="#84CC16" />
      </TouchableOpacity>
    </View>
  );
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onViewWorkout: (workoutTemplateId: number) => void;
  onStartWorkout: (workoutTemplateId: number) => void;
  onCreateNew: (workoutTemplateId: number) => void;
}

export default function SelectWorkoutModal({
  visible,
  onClose,
  onViewWorkout,
  onStartWorkout,
  onCreateNew,
}: Props) {
  const { colors, spacing } = useTheme();

  const [activeTab, setActiveTab] = useState<'saved' | 'recent' | 'new'>('saved');
  const [templates, setTemplates] = useState<WorkoutTemplateWithCountRow[]>([]);
  const [lastPerformedMap, setLastPerformedMap] = useState<Map<number, string | null>>(new Map());
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New workout form
  const [newName, setNewName] = useState('');
  const [newMuscleGroups, setNewMuscleGroups] = useState<string[]>([]);
  const [newDuration, setNewDuration] = useState('');
  const [newWeekday, setNewWeekday] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const tmplList = await getAllTemplatesWithCounts();
      setTemplates(tmplList);
      const results = await Promise.all(
        tmplList.map((t) =>
          getLastPerformedLog(t.id).then((log) => ({ id: t.id, date: log?.endedAt ?? null }))
        )
      );
      const map = new Map<number, string | null>();
      results.forEach(({ id, date }) => map.set(id, date));
      setLastPerformedMap(map);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      setActiveTab('saved');
      setSearchQuery('');
      setNewName('');
      setNewMuscleGroups([]);
      setNewDuration('');
      setNewWeekday(null);
      loadData();
    }
  }, [visible, loadData]);

  const filteredSaved = templates.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const recentTemplates = templates
    .filter((t) => lastPerformedMap.get(t.id) != null)
    .sort((a, b) => {
      const da = lastPerformedMap.get(a.id)!;
      const db = lastPerformedMap.get(b.id)!;
      return new Date(db).getTime() - new Date(da).getTime();
    });

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const meta: Record<string, unknown> = {};
      if (newMuscleGroups.length > 0) meta.muscleGroups = newMuscleGroups;
      if (newDuration.trim()) meta.duration = parseInt(newDuration, 10);
      const description = Object.keys(meta).length > 0 ? JSON.stringify(meta) : null;

      const id = await createTemplate({
        name: newName.trim(),
        description,
        assignedWeekday: newWeekday,
        isFavorite: 0,
      });
      onClose();
      onCreateNew(id);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ flex: 1, justifyContent: 'flex-end' }}>
          <TouchableOpacity style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.75)' }]} activeOpacity={1} onPress={onClose} />
          <View style={{
            backgroundColor: colors.backgroundSecondary,
            borderTopLeftRadius: Radius.xl,
            borderTopRightRadius: Radius.xl,
            maxHeight: '90%',
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
                <Text style={{ fontSize: 20, fontWeight: '600', color: colors.textPrimary }}>Select Workout</Text>
                <TouchableOpacity
                  onPress={onClose}
                  activeOpacity={0.75}
                  style={{
                    width: 36, height: 36, borderRadius: Radius.md,
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={18} color="rgba(255,255,255,0.7)" />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setActiveTab('saved')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                    backgroundColor: activeTab === 'saved' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Bookmark size={14} color={activeTab === 'saved' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                  <Text style={{ fontSize: 13, fontWeight: '500', color: activeTab === 'saved' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Saved</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('recent')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                    backgroundColor: activeTab === 'recent' ? '#3B82F6' : 'rgba(255,255,255,0.05)',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Clock size={14} color={activeTab === 'recent' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                  <Text style={{ fontSize: 13, fontWeight: '500', color: activeTab === 'recent' ? '#fff' : 'rgba(255,255,255,0.6)' }}>Recent</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setActiveTab('new')}
                  activeOpacity={0.8}
                  style={{
                    flex: 1, paddingVertical: 10, borderRadius: Radius.md,
                    backgroundColor: activeTab === 'new' ? '#84CC16' : 'rgba(255,255,255,0.05)',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Plus size={14} color={activeTab === 'new' ? '#fff' : 'rgba(255,255,255,0.6)'} />
                  <Text style={{ fontSize: 13, fontWeight: '500', color: activeTab === 'new' ? '#fff' : 'rgba(255,255,255,0.6)' }}>New</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            <ScrollView
              contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingTop: 12, paddingBottom: spacing['3xl'] }}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {loading ? (
                <ActivityIndicator color={colors.brandPrimary} style={{ marginTop: spacing['2xl'] }} />
              ) : (
                <>
                  {/* ── Saved tab ── */}
                  {activeTab === 'saved' && (
                    <View style={{ paddingTop: 4 }}>
                      <View style={{
                        flexDirection: 'row', alignItems: 'center', gap: 10,
                        backgroundColor: colors.backgroundPrimary,
                        borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border,
                        paddingHorizontal: 12, marginBottom: spacing.base,
                      }}>
                        <Search size={16} color="rgba(255,255,255,0.4)" />
                        <TextInput
                          value={searchQuery}
                          onChangeText={setSearchQuery}
                          placeholder="Search workouts..."
                          placeholderTextColor="rgba(255,255,255,0.3)"
                          style={{ flex: 1, fontSize: 14, color: colors.textPrimary, paddingVertical: 12 }}
                        />
                      </View>

                      {filteredSaved.length === 0 ? (
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: spacing['2xl'] }}>
                          {searchQuery ? `No workouts matching "${searchQuery}"` : 'No saved workouts yet'}
                        </Text>
                      ) : (
                        filteredSaved.map((t) => (
                          <WorkoutCard
                            key={t.id}
                            t={t}
                            lastIso={null}
                            onView={() => { onClose(); onViewWorkout(t.id); }}
                            onStart={() => { onClose(); onStartWorkout(t.id); }}
                            colors={colors}
                            spacing={spacing}
                          />
                        ))
                      )}
                    </View>
                  )}

                  {/* ── Recent tab ── */}
                  {activeTab === 'recent' && (
                    <View style={{ paddingTop: 4 }}>
                      {recentTemplates.length === 0 ? (
                        <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textAlign: 'center', paddingVertical: spacing['2xl'] }}>
                          No workouts performed yet
                        </Text>
                      ) : (
                        recentTemplates.map((t) => (
                          <WorkoutCard
                            key={t.id}
                            t={t}
                            lastIso={lastPerformedMap.get(t.id)}
                            onView={() => { onClose(); onViewWorkout(t.id); }}
                            onStart={() => { onClose(); onStartWorkout(t.id); }}
                            colors={colors}
                            spacing={spacing}
                          />
                        ))
                      )}
                    </View>
                  )}

                  {/* ── New tab ── */}
                  {activeTab === 'new' && (
                    <View style={{ paddingTop: spacing.base, gap: 16 }}>
                      {/* Name input */}
                      <View>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Workout Name</Text>
                        <View style={{
                          backgroundColor: colors.backgroundPrimary,
                          borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border,
                          paddingHorizontal: 14,
                        }}>
                          <TextInput
                            value={newName}
                            onChangeText={setNewName}
                            placeholder="e.g., Upper Body Strength"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            style={{ fontSize: 14, color: colors.textPrimary, paddingVertical: 13 }}
                            autoCapitalize="words"
                          />
                        </View>
                      </View>

                      {/* Muscle Groups */}
                      <View>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                          Muscle Groups
                          {newMuscleGroups.length > 0 ? (
                            <Text style={{ color: 'rgba(255,255,255,0.4)' }}>  ({newMuscleGroups.length} selected)</Text>
                          ) : null}
                        </Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {MUSCLE_GROUPS.map((group) => {
                            const selected = newMuscleGroups.includes(group);
                            return (
                              <TouchableOpacity
                                key={group}
                                onPress={() =>
                                  setNewMuscleGroups((prev) =>
                                    selected ? prev.filter((g) => g !== group) : [...prev, group]
                                  )
                                }
                                activeOpacity={0.75}
                                style={{
                                  paddingHorizontal: 12, paddingVertical: 8,
                                  borderRadius: Radius.md,
                                  backgroundColor: selected ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.05)',
                                  borderWidth: 2,
                                  borderColor: selected ? 'rgba(59,130,246,0.5)' : 'rgba(255,255,255,0.1)',
                                }}
                              >
                                <Text style={{
                                  fontSize: 13, fontWeight: '500',
                                  color: selected ? '#3B82F6' : 'rgba(255,255,255,0.6)',
                                }}>
                                  {group}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Estimated Duration */}
                      <View>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                          Estimated Duration (minutes)
                        </Text>
                        <View style={{
                          backgroundColor: colors.backgroundPrimary,
                          borderRadius: Radius.md, borderWidth: 1, borderColor: colors.border,
                          paddingHorizontal: 14,
                        }}>
                          <TextInput
                            value={newDuration}
                            onChangeText={setNewDuration}
                            placeholder="45"
                            placeholderTextColor="rgba(255,255,255,0.3)"
                            keyboardType="number-pad"
                            style={{ fontSize: 14, color: colors.textPrimary, paddingVertical: 13 }}
                          />
                        </View>
                      </View>

                      {/* Assigned Days */}
                      <View>
                        <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Assigned Days</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                          {DAYS_DISPLAY.map((day) => {
                            const selected = newWeekday === day.index;
                            return (
                              <TouchableOpacity
                                key={day.index}
                                onPress={() => setNewWeekday(selected ? null : day.index)}
                                activeOpacity={0.75}
                                style={{
                                  width: '47%',
                                  paddingVertical: 14, borderRadius: Radius.md,
                                  alignItems: 'center',
                                  backgroundColor: selected ? 'rgba(132,204,22,0.2)' : 'rgba(255,255,255,0.05)',
                                  borderWidth: 2,
                                  borderColor: selected ? 'rgba(132,204,22,0.5)' : 'rgba(255,255,255,0.1)',
                                }}
                              >
                                <Text style={{
                                  fontSize: 14, fontWeight: '500',
                                  color: selected ? '#84CC16' : 'rgba(255,255,255,0.6)',
                                }}>
                                  {day.label}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>

                      {/* Info message */}
                      <View style={{
                        backgroundColor: 'rgba(132,204,22,0.1)',
                        borderRadius: Radius.md, borderWidth: 1, borderColor: 'rgba(132,204,22,0.2)',
                        padding: 12,
                      }}>
                        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                          After creating, you'll be able to add exercises to this workout.
                        </Text>
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
                          shadowColor: newName.trim() ? '#84CC16' : 'transparent',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
                        }}
                      >
                        {creating ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <>
                            <Plus size={20} color="#fff" />
                            <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff' }}>Create Workout</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
