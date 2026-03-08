import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import { ActiveSet } from '../types';
import { ExerciseType } from '@shared/types/common';
import { Radius } from '@theme/radius';
import { Check } from 'lucide-react-native';

const NO_WEIGHT_TYPES: ExerciseType[] = ['bodyweight', 'cardio', 'flexibility', 'endurance', 'hiit', 'warmup'];

interface SetRowProps {
  set: ActiveSet;
  exerciseType: ExerciseType;
  onUpdate: (fields: Partial<ActiveSet>) => void;
  onComplete: () => void;
  onDelete?: () => void;
}

export default function SetRow({ set, exerciseType, onUpdate, onComplete, onDelete }: SetRowProps) {
  const { colors } = useTheme();
  const showWeight = !NO_WEIGHT_TYPES.includes(exerciseType);

  if (set.completed) {
    return (
      <TouchableOpacity
        onLongPress={onDelete}
        delayLongPress={400}
        onPress={onComplete}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          padding: 12,
          marginBottom: 6,
          backgroundColor: 'rgba(132,204,22,0.15)',
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: 'rgba(132,204,22,0.3)',
          gap: 10,
        }}
      >
        <View style={{
          width: 28, height: 28, borderRadius: 14,
          backgroundColor: '#84CC16',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Check size={14} color="#fff" strokeWidth={2.5} />
        </View>

        <Text style={{ fontSize: 14, fontWeight: '500', color: '#84CC16', flex: 1 }}>
          {showWeight ? `${set.reps} reps × ${set.weight} lbs` : `${set.reps} reps`}
        </Text>

        <Text style={{ fontSize: 11, color: 'rgba(132,204,22,0.6)' }}>Set {set.setNumber}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginBottom: 6,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: Radius.md,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        gap: 10,
      }}
    >
      <View style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>
          {set.setNumber}
        </Text>
      </View>

      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <TextInput
          style={{
            flex: 1, textAlign: 'center',
            fontSize: 15, fontWeight: '600', color: '#fff',
            borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
            paddingVertical: 4,
          }}
          value={set.reps}
          onChangeText={(v) => onUpdate({ reps: v })}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="rgba(255,255,255,0.3)"
          selectTextOnFocus
        />
        <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>reps</Text>

        {showWeight && (
          <>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>×</Text>
            <TextInput
              style={{
                flex: 1, textAlign: 'center',
                fontSize: 15, fontWeight: '600', color: '#fff',
                borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.2)',
                paddingVertical: 4,
              }}
              value={set.weight}
              onChangeText={(v) => onUpdate({ weight: v })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>lbs</Text>
          </>
        )}
      </View>

      <TouchableOpacity onPress={onComplete} activeOpacity={0.7}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#3B82F6' }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}
