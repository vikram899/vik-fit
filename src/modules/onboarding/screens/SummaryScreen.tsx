import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, TextInput, KeyboardAvoidingView,
  Platform, ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Pencil, Check, RotateCcw } from 'lucide-react-native';
import OnboardingSlide from '../components/OnboardingSlide';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { useAuth } from '@core/AuthContext';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Summary'>;

export default function SummaryScreen({ navigation }: Props) {
  const { getNutritionSummary, completeOnboarding, loading, error, draft, updateDraft } = useOnboarding();
  const { setHasUser } = useAuth();
  const nutrition = getNutritionSummary();

  const computedCalories = Math.round(nutrition?.targetCalories ?? 0);
  const computedProtein  = Math.round(nutrition?.proteinGrams ?? 0);

  const [editing, setEditing]           = useState(false);
  const [calInput, setCalInput]         = useState('');
  const [proteinInput, setProteinInput] = useState('');

  const isCustom       = draft.customCalories !== null || draft.customProtein !== null;
  const displayCalories = draft.customCalories ?? computedCalories;
  const displayProtein  = draft.customProtein  ?? computedProtein;

  const openEdit = () => {
    setCalInput(String(Math.round(displayCalories)));
    setProteinInput(String(Math.round(displayProtein)));
    setEditing(true);
  };

  const saveEdit = () => {
    const cal  = parseInt(calInput, 10);
    const prot = parseInt(proteinInput, 10);
    updateDraft({
      customCalories: !isNaN(cal)  ? cal  : null,
      customProtein:  !isNaN(prot) ? prot : null,
    });
    setEditing(false);
  };

  const resetToComputed = () => {
    updateDraft({ customCalories: null, customProtein: null });
    setEditing(false);
  };

  const handleComplete = async () => {
    let customCal  = draft.customCalories;
    let customProt = draft.customProtein;
    if (editing) {
      const cal  = parseInt(calInput, 10);
      const prot = parseInt(proteinInput, 10);
      customCal  = !isNaN(cal)  ? cal  : null;
      customProt = !isNaN(prot) ? prot : null;
    }
    const success = await completeOnboarding(customCal, customProt);
    if (success) setHasUser(true);
  };

  const isMetric = draft.unitPreference === 'metric';

  return (
    <OnboardingSlide
      step={7} totalSteps={7}
      title={"Your Recommended\nNutrition Targets"}
      onNext={handleComplete}
      onBack={() => navigation.goBack()}
      nextLabel="Start Tracking"
      nextLoading={loading}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>

        {/* ── Calorie / Protein cards ── */}
        {nutrition ? (
          <>
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
              {/* Calories */}
              <View style={{
                flex: 1, borderRadius: 20,
                borderWidth: 1,
                borderColor: isCustom && draft.customCalories !== null
                  ? 'rgba(132,204,22,0.5)' : 'rgba(132,204,22,0.25)',
                backgroundColor: 'rgba(132,204,22,0.08)',
                padding: 20, alignItems: 'center',
              }}>
                {isCustom && draft.customCalories !== null && (
                  <View style={{
                    backgroundColor: 'rgba(132,204,22,0.2)', borderRadius: 6,
                    paddingHorizontal: 7, paddingVertical: 2, marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#84CC16', letterSpacing: 0.8 }}>CUSTOM</Text>
                  </View>
                )}
                <Text style={{ fontSize: 42, fontWeight: '800', color: '#84CC16', lineHeight: 48 }}>
                  {displayCalories}
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>kcal / day</Text>
              </View>

              {/* Protein */}
              <View style={{
                flex: 1, borderRadius: 20,
                borderWidth: 1,
                borderColor: isCustom && draft.customProtein !== null
                  ? 'rgba(59,130,246,0.5)' : 'rgba(59,130,246,0.25)',
                backgroundColor: 'rgba(59,130,246,0.08)',
                padding: 20, alignItems: 'center',
              }}>
                {isCustom && draft.customProtein !== null && (
                  <View style={{
                    backgroundColor: 'rgba(59,130,246,0.2)', borderRadius: 6,
                    paddingHorizontal: 7, paddingVertical: 2, marginBottom: 8,
                  }}>
                    <Text style={{ fontSize: 9, fontWeight: '700', color: '#3B82F6', letterSpacing: 0.8 }}>CUSTOM</Text>
                  </View>
                )}
                <Text style={{ fontSize: 42, fontWeight: '800', color: '#3B82F6', lineHeight: 48 }}>
                  {displayProtein}<Text style={{ fontSize: 22, fontWeight: '700' }}>g</Text>
                </Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>protein / day</Text>
              </View>
            </View>

            {/* ── Edit / Reset row ── */}
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {isCustom && !editing && (
                <TouchableOpacity
                  onPress={resetToComputed}
                  activeOpacity={1}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    paddingVertical: 13, borderRadius: 14,
                    backgroundColor: 'rgba(239,68,68,0.08)',
                    borderWidth: 1, borderColor: 'rgba(239,68,68,0.25)',
                  }}
                >
                  <RotateCcw size={13} color="#EF4444" />
                  <Text style={{ fontSize: 13, color: '#EF4444', fontWeight: '600' }}>Reset</Text>
                </TouchableOpacity>
              )}
              {!editing ? (
                <TouchableOpacity
                  onPress={openEdit}
                  activeOpacity={1}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    paddingVertical: 13, borderRadius: 14,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
                  }}
                >
                  <Pencil size={13} color="rgba(255,255,255,0.7)" />
                  <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Adjust targets</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={saveEdit}
                  activeOpacity={1}
                  style={{
                    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                    paddingVertical: 13, borderRadius: 14,
                    backgroundColor: 'rgba(132,204,22,0.12)',
                    borderWidth: 1, borderColor: 'rgba(132,204,22,0.35)',
                  }}
                >
                  <Check size={14} color="#84CC16" strokeWidth={2.5} />
                  <Text style={{ fontSize: 13, color: '#84CC16', fontWeight: '700' }}>Save targets</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* ── Edit inputs ── */}
            {editing && (
              <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 20 }}>
                  {/* Calories input */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Calories (kcal)</Text>
                    <View style={{
                      backgroundColor: 'rgba(132,204,22,0.08)', borderRadius: 14,
                      borderWidth: 1, borderColor: 'rgba(132,204,22,0.3)',
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
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, textAlign: 'center' }}>
                      Recommended: {computedCalories} kcal
                    </Text>
                  </View>

                  {/* Protein input */}
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Protein (g)</Text>
                    <View style={{
                      backgroundColor: 'rgba(59,130,246,0.08)', borderRadius: 14,
                      borderWidth: 1, borderColor: 'rgba(59,130,246,0.3)',
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
                    <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, textAlign: 'center' }}>
                      Recommended: {computedProtein}g
                    </Text>
                  </View>
                </View>
              </KeyboardAvoidingView>
            )}

            {!editing && !isCustom && (
              <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textAlign: 'center', marginBottom: 20 }}>
                Auto-calculated from your profile
              </Text>
            )}
          </>
        ) : null}

        {/* ── Profile summary ── */}
        <View style={{
          borderRadius: 18, borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(255,255,255,0.04)',
          padding: 18, gap: 12,
        }}>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontWeight: '600', letterSpacing: 0.5, marginBottom: 2 }}>
            PROFILE SUMMARY
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <SummaryRow label="Height" value={isMetric
              ? `${draft.heightCm} cm`
              : `${Math.floor(draft.heightCm / 30.48)}ft ${Math.round((draft.heightCm % 30.48) / 2.54)}in`}
            />
            <SummaryRow label="Weight" value={isMetric
              ? `${draft.weightKg} kg`
              : `${Math.round(draft.weightKg * 2.20462)} lbs`}
            />
          </View>
          {draft.targetWeightKg != null && (
            <SummaryRow label="Target Weight" value={isMetric
              ? `${draft.targetWeightKg} kg`
              : `${Math.round(draft.targetWeightKg * 2.20462)} lbs`}
            />
          )}
        </View>

        {error ? (
          <Text style={{ color: '#EF4444', textAlign: 'center', fontSize: 13, marginTop: 16 }}>{error}</Text>
        ) : null}
      </ScrollView>
    </OnboardingSlide>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 12 }}>
      <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>{value}</Text>
    </View>
  );
}
