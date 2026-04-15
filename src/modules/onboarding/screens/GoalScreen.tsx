import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Zap, Flame, Dumbbell, Heart, Scale } from 'lucide-react-native';
import OnboardingSlide from '../components/OnboardingSlide';
import { useOnboarding } from '../hooks/useOnboarding';
import { OnboardingStackParamList } from '@core/navigation/stacks/OnboardingStack';
import { DisplayGoal } from '../types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Goal'>;

const GOALS: { value: DisplayGoal; label: string; desc: string; Icon: any }[] = [
  { value: 'lose-fat-gain-muscle', label: 'Lose Fat and Gain Muscle', desc: 'Burn fat while building muscle',             Icon: Zap      },
  { value: 'lose-fat',             label: 'Lose Fat',                 desc: 'Start easy and gradually cut excess fat',    Icon: Flame    },
  { value: 'build-muscle',         label: 'Gain Muscle',              desc: 'Bulk up your body and add size',             Icon: Dumbbell },
  { value: 'improve-fitness',      label: 'Improve Lifestyle',        desc: 'Improve nutrition and overall fitness',      Icon: Heart    },
  { value: 'maintain',             label: 'Maintain Weight',          desc: 'Keep your current weight stable',            Icon: Scale    },
];

export default function GoalScreen({ navigation }: Props) {
  const { draft, updateDraft } = useOnboarding();

  return (
    <OnboardingSlide
      step={5} totalSteps={7}
      title={'What is your current\nprimary goal?'}
      onNext={() => navigation.navigate('Activity')}
      onBack={() => navigation.goBack()}
      nextDisabled={!draft.goal}
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 16 }}>
        {GOALS.map(({ value, label, desc, Icon }) => {
          const selected = draft.goal === value;
          return (
            <TouchableOpacity
              key={value}
              onPress={() => updateDraft({ goal: value })}
              activeOpacity={1}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 18,
                paddingHorizontal: 18,
                borderRadius: 16,
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? '#fff' : 'rgba(255,255,255,0.18)',
                backgroundColor: selected ? 'rgba(255,255,255,0.06)' : 'transparent',
              }}
            >
              <Icon size={22} color={selected ? '#fff' : 'rgba(255,255,255,0.5)'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#fff', marginBottom: 2 }}>{label}</Text>
                <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{desc}</Text>
              </View>
            </TouchableOpacity>
          );
        })}

        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 6 }}>
          ⓘ  Why do we need this information?
        </Text>
      </ScrollView>
    </OnboardingSlide>
  );
}
