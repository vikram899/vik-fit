import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Monitor, Coffee, Footprints, Zap, Repeat } from 'lucide-react-native';
import OnboardingSlide from '../components/OnboardingSlide';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { DisplayActivityLevel } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Activity'>;

const LEVELS: { value: DisplayActivityLevel; label: string; desc: string; steps: string; Icon: any }[] = [
  { value: 'sedentary',         label: 'Sedentary',   desc: 'I have a desk job and mostly sit.',          steps: '<3K STEPS',   Icon: Monitor   },
  { value: 'lightly-active',    label: 'Light',       desc: 'I do occasional light activity.',            steps: '3-7K STEPS',  Icon: Coffee    },
  { value: 'moderately-active', label: 'Active',      desc: 'I move and exercise regularly.',             steps: '7-10K STEPS', Icon: Footprints },
  { value: 'very-active',       label: 'Very Active', desc: 'I perform intense physical activity.',       steps: '10K+ STEPS',  Icon: Zap       },
  { value: 'athlete',           label: 'Dynamic',     desc: 'My activity changes day to day.',            steps: '5-20K STEPS', Icon: Repeat    },
];

export default function ActivityScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();

  return (
    <OnboardingSlide
      step={6} totalSteps={7}
      title={"What's your\ntypical day like?"}
      onNext={() => navigation.navigate('TargetWeight')}
      onBack={() => navigation.goBack()}
      nextDisabled={!draft.activityLevel}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        {LEVELS.map(({ value, label, desc, steps, Icon }) => {
          const selected = draft.activityLevel === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => updateDraft({ activityLevel: value })}
              activeOpacity={1}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 16,
                paddingHorizontal: 18,
                borderRadius: 16,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? '#fff' : 'rgba(255,255,255,0.18)',
                backgroundColor: selected ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
            >
              <Icon size={20} color={selected ? '#fff' : 'rgba(255,255,255,0.4)'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 }}>{label}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{desc}</Text>
              </View>
              <View style={{
                paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
                backgroundColor: selected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)',
                borderWidth: 1,
                borderColor: selected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
              }}>
                <Text style={{ fontSize: 10, fontWeight: '700', color: selected ? '#fff' : 'rgba(255,255,255,0.4)', letterSpacing: 0.3 }}>
                  {steps}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 4 }}>
          ⓘ  Why do we need this information?
        </Text>
      </ScrollView>
    </OnboardingSlide>
  );
}
