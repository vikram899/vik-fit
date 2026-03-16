import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Sprout, Dumbbell, Zap, Check } from 'lucide-react-native';
import OnboardingLayout from '../components/OnboardingLayout';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { ExperienceLevel } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ExperienceLevel'>;

const LEVELS: {
  value: ExperienceLevel;
  label: string;
  tagline: string;
  description: string;
  bullets: string[];
  icon: React.ElementType;
  color: string;
  gradient: [string, string];
}[] = [
  {
    value: 'beginner',
    label: 'Beginner',
    tagline: 'Just getting started',
    description: 'Less than 1 year of consistent training. Still building habits and learning movement patterns.',
    bullets: [
      'Full-body workouts 2–3× per week',
      'Focus on form before adding weight',
      'Rest days are just as important',
      'Big gains come fast — enjoy it!',
    ],
    icon: Sprout,
    color: '#84CC16',
    gradient: ['rgba(132,204,22,0.18)', 'rgba(132,204,22,0.04)'],
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    tagline: '1–3 years of training',
    description: 'Consistent training history, familiar with major lifts. Ready for structured splits and progressive overload.',
    bullets: [
      'Push/Pull/Legs or Upper/Lower splits',
      'Tracks weight and reps each session',
      'Understands progressive overload',
      'Plateau-busting with variation',
    ],
    icon: Dumbbell,
    color: '#3B82F6',
    gradient: ['rgba(59,130,246,0.18)', 'rgba(59,130,246,0.04)'],
  },
  {
    value: 'advanced',
    label: 'Advanced',
    tagline: '3+ years of serious training',
    description: 'Deep experience with periodization and programming. Gains are hard-earned and require specialized techniques.',
    bullets: [
      'Periodized programs (linear, DUP, block)',
      'Deload weeks built into schedule',
      'Tracks Volume, Intensity & RIR',
      'Knows when to push and when to rest',
    ],
    icon: Zap,
    color: '#A855F7',
    gradient: ['rgba(168,85,247,0.18)', 'rgba(168,85,247,0.04)'],
  },
];

export default function ExperienceLevelScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();
  const selected = draft.experienceLevel as ExperienceLevel | '';

  return (
    <OnboardingLayout
      step={3}
      totalSteps={4}
      title="What's your experience level?"
      subtitle="This helps us recommend the right workout intensity for you"
      onNext={() => navigation.navigate('Summary')}
      onBack={() => navigation.goBack()}
      nextDisabled={selected === ''}
      nextLabel="Next"
    >
      <View style={{ gap: 14 }}>
        {LEVELS.map((level) => {
          const Icon = level.icon;
          const isSelected = selected === level.value;

          return (
            <TouchableOpacity
              key={level.value}
              onPress={() => updateDraft({ experienceLevel: level.value })}
              activeOpacity={1}
              style={{
                borderRadius: 20,
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? level.color : 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
              }}
            >
              <LinearGradient
                colors={isSelected ? level.gradient : ['rgba(255,255,255,0.03)', 'rgba(255,255,255,0.01)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ padding: 18 }}
              >
                {/* Header row */}
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                  <View style={{
                    width: 44, height: 44, borderRadius: 22,
                    backgroundColor: isSelected ? level.color + '30' : 'rgba(255,255,255,0.07)',
                    alignItems: 'center', justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Icon size={22} color={isSelected ? level.color : 'rgba(255,255,255,0.5)'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 17, fontWeight: '800', color: isSelected ? '#fff' : 'rgba(255,255,255,0.85)' }}>
                      {level.label}
                    </Text>
                    <Text style={{ fontSize: 12, color: isSelected ? level.color : 'rgba(255,255,255,0.4)', marginTop: 2, fontWeight: '500' }}>
                      {level.tagline}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={{
                      width: 24, height: 24, borderRadius: 12,
                      backgroundColor: level.color,
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Check size={14} color="#000" strokeWidth={3} />
                    </View>
                  )}
                </View>

                {/* Description */}
                <Text style={{
                  fontSize: 13, color: isSelected ? 'rgba(255,255,255,0.75)' : 'rgba(255,255,255,0.4)',
                  lineHeight: 19, marginBottom: 12,
                }}>
                  {level.description}
                </Text>

                {/* Bullet points */}
                <View style={{ gap: 7 }}>
                  {level.bullets.map((bullet, i) => (
                    <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
                      <View style={{
                        width: 5, height: 5, borderRadius: 3,
                        backgroundColor: isSelected ? level.color : 'rgba(255,255,255,0.2)',
                        marginTop: 6,
                      }} />
                      <Text style={{
                        fontSize: 12, flex: 1,
                        color: isSelected ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
                        lineHeight: 18,
                      }}>
                        {bullet}
                      </Text>
                    </View>
                  ))}
                </View>
              </LinearGradient>
            </TouchableOpacity>
          );
        })}
      </View>
    </OnboardingLayout>
  );
}
