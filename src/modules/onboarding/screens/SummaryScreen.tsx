import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Pencil, Check, RotateCcw } from 'lucide-react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { useAuth } from '@core/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Summary'>;

const GOAL_LABEL: Record<string, string> = {
  'lose-fat': 'Lose Fat',
  'build-muscle': 'Build Muscle',
  'recomp': 'Recomposition',
  'maintain': 'Maintain Weight',
  'improve-fitness': 'Improve Fitness',
  'endurance': 'Endurance',
  'strength': 'Strength',
  'flexibility': 'Flexibility',
  'general-health': 'General Health',
};

const ACTIVITY_LABEL: Record<string, string> = {
  'sedentary': 'Sedentary',
  'lightly-active': 'Lightly Active',
  'moderately-active': 'Moderately Active',
  'very-active': 'Very Active',
};

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: 14 }}>
      <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{value}</Text>
    </View>
  );
}

export default function SummaryScreen({ navigation }: Props) {
  const { spacing } = useTheme();
  const { getNutritionSummary, completeOnboarding, loading, error, draft, updateDraft } = useOnboarding();
  const { setHasUser } = useAuth();
  const nutrition = getNutritionSummary();

  const computedCalories = nutrition?.targetCalories ?? 0;
  const computedProtein = nutrition?.proteinGrams ?? 0;

  const [editing, setEditing] = useState(false);
  const [calInput, setCalInput] = useState('');
  const [proteinInput, setProteinInput] = useState('');

  const isCustom = draft.customCalories !== null || draft.customProtein !== null;
  const displayCalories = draft.customCalories ?? computedCalories;
  const displayProtein = draft.customProtein ?? computedProtein;

  const openEdit = () => {
    setCalInput(String(displayCalories));
    setProteinInput(String(displayProtein));
    setEditing(true);
  };

  const saveEdit = () => {
    const cal = parseInt(calInput, 10);
    const prot = parseInt(proteinInput, 10);
    // Only store override if value differs from computed
    updateDraft({
      customCalories: !isNaN(cal) && cal !== computedCalories ? cal : null,
      customProtein: !isNaN(prot) && prot !== computedProtein ? prot : null,
    });
    setEditing(false);
  };

  const resetToComputed = () => {
    updateDraft({ customCalories: null, customProtein: null });
    setEditing(false);
  };

  const age = draft.dateOfBirth ? (() => {
    const birth = new Date(draft.dateOfBirth);
    const today = new Date();
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  })() : null;

  const handleComplete = async () => {
    const success = await completeOnboarding();
    if (success) setHasUser(true);
  };

  const isMetric = draft.unitPreference === 'metric';

  return (
    <OnboardingLayout
      step={4}
      totalSteps={4}
      title="You're ready to start!"
      subtitle="Your personalized fitness tracking is ready."
      onNext={handleComplete}
      onBack={() => navigation.goBack()}
      nextLabel="Start Tracking"
      nextLoading={loading}
    >
      {/* ── Profile card ── */}
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.04)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 20, borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.15)',
          padding: 20, marginBottom: spacing.base,
        }}
      >
        {/* Name + age row */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 14,
          paddingBottom: 16, borderBottomWidth: 1,
          borderBottomColor: 'rgba(255,255,255,0.1)', marginBottom: 16,
        }}>
          <LinearGradient
            colors={['#3B82F6', '#84CC16']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }}
          >
            <User size={28} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff' }}>{draft.name}</Text>
            {age ? (
              <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                {age} years old {'\u2022'} {draft.gender === 'male' ? 'Male' : draft.gender === 'female' ? 'Female' : 'Other'}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Stats tiles */}
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          <StatTile label="Goal" value={GOAL_LABEL[draft.goal] ?? '\u2014'} />
          <StatTile label="Activity" value={ACTIVITY_LABEL[draft.activityLevel] ?? '\u2014'} />
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <StatTile
            label="Height"
            value={isMetric
              ? `${draft.heightCm} cm`
              : `${Math.floor(draft.heightCm / 30.48)}ft ${Math.round((draft.heightCm % 30.48) / 2.54)}in`}
          />
          <StatTile
            label="Weight"
            value={isMetric
              ? `${draft.weightKg} kg`
              : `${Math.round(draft.weightKg * 2.20462)} lbs`}
          />
        </View>
        {draft.targetWeightKg != null && (
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
            <StatTile
              label="Target Weight"
              value={isMetric
                ? `${draft.targetWeightKg} kg`
                : `${Math.round(draft.targetWeightKg * 2.20462)} lbs`}
            />
          </View>
        )}
      </LinearGradient>

      {/* ── Nutrition targets ── */}
      {nutrition ? (
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 20,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
          padding: 20, marginBottom: spacing.base,
        }}>
          {/* Header row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)' }}>
              Daily Targets
            </Text>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
              {isCustom && !editing && (
                <TouchableOpacity
                  onPress={resetToComputed}
                  activeOpacity={1}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 4,
                    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12,
                    backgroundColor: 'rgba(239,68,68,0.12)',
                    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
                  }}
                >
                  <RotateCcw size={11} color="#EF4444" />
                  <Text style={{ fontSize: 11, color: '#EF4444', fontWeight: '600' }}>Reset</Text>
                </TouchableOpacity>
              )}
              {!editing ? (
                <TouchableOpacity
                  onPress={openEdit}
                  activeOpacity={1}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                    backgroundColor: 'rgba(132,204,22,0.12)',
                    borderWidth: 1, borderColor: 'rgba(132,204,22,0.25)',
                  }}
                >
                  <Pencil size={12} color="#84CC16" />
                  <Text style={{ fontSize: 12, color: '#84CC16', fontWeight: '600' }}>Edit</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={saveEdit}
                  activeOpacity={1}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: 5,
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12,
                    backgroundColor: 'rgba(132,204,22,0.2)',
                    borderWidth: 1, borderColor: 'rgba(132,204,22,0.4)',
                  }}
                >
                  <Check size={13} color="#84CC16" strokeWidth={2.5} />
                  <Text style={{ fontSize: 12, color: '#84CC16', fontWeight: '700' }}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {editing ? (
            /* ── Edit mode ── */
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                {/* Calories input */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: '500' }}>
                    Calories (kcal)
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(132,204,22,0.08)',
                    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
                    paddingHorizontal: 14, paddingVertical: 12,
                  }}>
                    <TextInput
                      value={calInput}
                      onChangeText={setCalInput}
                      keyboardType="number-pad"
                      style={{ fontSize: 24, fontWeight: '800', color: '#84CC16', textAlign: 'center' }}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectTextOnFocus
                    />
                  </View>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'center' }}>
                    Computed: {computedCalories} kcal
                  </Text>
                </View>

                {/* Protein input */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8, fontWeight: '500' }}>
                    Protein (g)
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(59,130,246,0.08)',
                    borderRadius: 14, borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
                    paddingHorizontal: 14, paddingVertical: 12,
                  }}>
                    <TextInput
                      value={proteinInput}
                      onChangeText={setProteinInput}
                      keyboardType="number-pad"
                      style={{ fontSize: 24, fontWeight: '800', color: '#3B82F6', textAlign: 'center' }}
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      selectTextOnFocus
                    />
                  </View>
                  <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 5, textAlign: 'center' }}>
                    Computed: {computedProtein}g
                  </Text>
                </View>
              </View>
            </KeyboardAvoidingView>
          ) : (
            /* ── Display mode ── */
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {/* Calories */}
              <View style={{
                flex: 1, borderRadius: 16, overflow: 'hidden',
              }}>
                <LinearGradient
                  colors={['rgba(132,204,22,0.15)', 'rgba(132,204,22,0.06)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    padding: 16, alignItems: 'center',
                    borderWidth: 1, borderColor: isCustom && draft.customCalories !== null ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.2)',
                    borderRadius: 16,
                  }}
                >
                  {isCustom && draft.customCalories !== null && (
                    <View style={{
                      backgroundColor: 'rgba(132,204,22,0.2)', borderRadius: 6,
                      paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6,
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#84CC16', letterSpacing: 0.5 }}>CUSTOM</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 32, fontWeight: '800', color: '#84CC16' }}>
                    {displayCalories}
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>kcal / day</Text>
                </LinearGradient>
              </View>

              {/* Protein */}
              <View style={{ flex: 1, borderRadius: 16, overflow: 'hidden' }}>
                <LinearGradient
                  colors={['rgba(59,130,246,0.15)', 'rgba(59,130,246,0.06)']}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                  style={{
                    padding: 16, alignItems: 'center',
                    borderWidth: 1, borderColor: isCustom && draft.customProtein !== null ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.2)',
                    borderRadius: 16,
                  }}
                >
                  {isCustom && draft.customProtein !== null && (
                    <View style={{
                      backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 6,
                      paddingHorizontal: 6, paddingVertical: 2, marginBottom: 6,
                    }}>
                      <Text style={{ fontSize: 9, fontWeight: '700', color: '#3B82F6', letterSpacing: 0.5 }}>CUSTOM</Text>
                    </View>
                  )}
                  <Text style={{ fontSize: 32, fontWeight: '800', color: '#3B82F6' }}>
                    {displayProtein}g
                  </Text>
                  <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>protein / day</Text>
                </LinearGradient>
              </View>
            </View>
          )}

          {/* Auto-calculated hint */}
          {!editing && !isCustom && (
            <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginTop: 12 }}>
              Auto-calculated from your profile · tap Edit to adjust
            </Text>
          )}
        </View>
      ) : null}

      {/* ── Motivational banner ── */}
      <LinearGradient
        colors={['rgba(59,130,246,0.2)', 'rgba(132,204,22,0.2)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 14, borderWidth: 1,
          borderColor: 'rgba(59,130,246,0.3)',
          padding: 16, marginBottom: spacing.base,
        }}
      >
        <Text style={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center', fontSize: 14, lineHeight: 20 }}>
          {'\U0001F4AA'} Let's crush your goals together! Every workout, every meal, and every step forward counts.
        </Text>
      </LinearGradient>

      {error ? (
        <Text style={{ color: '#EF4444', textAlign: 'center', fontSize: 13 }}>{error}</Text>
      ) : null}
    </OnboardingLayout>
  );
}
