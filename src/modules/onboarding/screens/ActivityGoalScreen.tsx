import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import {
  Flame, Dumbbell, Zap, Scale, Footprints, TrendingUp, Wind, Heart,
  Moon, Sunrise, Sun,
} from 'lucide-react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { DisplayGoal, DisplayActivityLevel } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ActivityGoal'>;

const GOALS: { value: DisplayGoal; label: string; icon: any; color: string }[] = [
  { value: 'lose-fat',        label: 'Lose Fat',      icon: Flame,      color: '#F59E0B' },
  { value: 'build-muscle',    label: 'Build Muscle',  icon: Dumbbell,   color: '#3B82F6' },
  { value: 'recomp',          label: 'Recompose',     icon: Zap,        color: '#EAB308' },
  { value: 'maintain',        label: 'Maintain',      icon: Scale,      color: '#84CC16' },
  { value: 'endurance',       label: 'Endurance',     icon: Footprints, color: '#10B981' },
  { value: 'strength',        label: 'Strength',      icon: TrendingUp, color: '#EF4444' },
  { value: 'flexibility',     label: 'Flexibility',   icon: Wind,       color: '#EC4899' },
  { value: 'improve-fitness', label: 'Fitness',       icon: TrendingUp, color: '#A855F7' },
  { value: 'general-health',  label: 'Health',        icon: Heart,      color: '#6B7280' },
];

const ACTIVITY: { value: DisplayActivityLevel; label: string; desc: string; icon: any }[] = [
  { value: 'sedentary',         label: 'Sedentary',         desc: 'Little or no exercise',   icon: Moon    },
  { value: 'lightly-active',    label: 'Lightly Active',    desc: 'Workout 1–3 days/week',   icon: Sunrise },
  { value: 'moderately-active', label: 'Moderately Active', desc: 'Workout 3–5 days/week',   icon: Sun     },
  { value: 'very-active',       label: 'Very Active',       desc: 'Hard training most days', icon: Zap     },
];

export default function ActivityGoalScreen({ navigation }: Props) {
  const { spacing } = useTheme();
  const { draft, updateDraft } = useOnboarding();

  const isValid = draft.goal !== '' && draft.activityLevel !== '';

  const sub = 'rgba(255,255,255,0.05)';
  const subBorder = 'rgba(255,255,255,0.1)';

  return (
    <OnboardingLayout
      step={2}
      totalSteps={4}
      title="What is your main goal?"
      subtitle="Choose what matters most to you"
      onNext={() => navigation.navigate('TargetWeight')}
      onBack={() => navigation.goBack()}
      nextDisabled={!isValid}
      nextLabel="Next"
    >
      {/* Goals grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.xl }}>
        {GOALS.map((opt) => {
          const Icon = opt.icon;
          const selected = draft.goal === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateDraft({ goal: opt.value })}
              activeOpacity={1}
              style={{
                width: '47%', padding: 16, borderRadius: 16, alignItems: 'center', gap: 10,
                backgroundColor: selected ? 'rgba(255,255,255,0.1)' : sub,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? opt.color : subBorder,
                transform: [{ scale: selected ? 1.02 : 1 }],
              }}
            >
              <View style={{
                width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center',
                backgroundColor: `${opt.color}20`,
              }}>
                <Icon size={24} color={opt.color} />
              </View>
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600', textAlign: 'center' }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Activity level */}
      <Text style={{ fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: spacing.sm }}>
        Activity Level
      </Text>
      <View style={{ gap: 10 }}>
        {ACTIVITY.map((opt) => {
          const Icon = opt.icon;
          const selected = draft.activityLevel === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateDraft({ activityLevel: opt.value })}
              activeOpacity={1}
              style={{
                padding: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 14,
                backgroundColor: selected ? '#3B82F6' : sub,
                borderWidth: 1,
                borderColor: selected ? '#3B82F6' : subBorder,
              }}
            >
              <View style={{
                width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
                backgroundColor: selected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
              }}>
                <Icon size={20} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>{opt.label}</Text>
                <Text style={{ color: selected ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 }}>
                  {opt.desc}
                </Text>
              </View>
              {selected && (
                <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
