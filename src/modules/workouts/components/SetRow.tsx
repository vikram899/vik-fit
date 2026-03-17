import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '@theme/index';
import { ActiveSet } from '../types';
import { ExerciseType } from '@shared/types/common';
import { Radius } from '@theme/radius';
import { Check } from 'lucide-react-native';

type TrackingMode = 'weight_reps' | 'reps_only' | 'duration' | 'time_reps';

function getTrackingMode(type: ExerciseType): TrackingMode {
  if (['cardio', 'flexibility', 'endurance', 'warmup'].includes(type)) return 'duration';
  if (type === 'hiit') return 'time_reps';
  if (type === 'bodyweight') return 'reps_only';
  return 'weight_reps';
}

interface SetRowProps {
  set: ActiveSet;
  exerciseType: ExerciseType;
  weightUnit: 'kg' | 'lbs';
  onUpdate: (fields: Partial<ActiveSet>) => void;
  onComplete: () => void;
  onDelete?: () => void;
}

const inputStyle = {
  flex: 1,
  textAlign: 'center' as const,
  fontSize: 15,
  fontWeight: '600' as const,
  color: '#fff',
  borderBottomWidth: 1,
  borderBottomColor: 'rgba(255,255,255,0.2)',
  paddingVertical: 4,
};

export default function SetRow({ set, exerciseType, weightUnit, onUpdate, onComplete, onDelete }: SetRowProps) {
  const { colors } = useTheme();
  const mode = getTrackingMode(exerciseType);

  const completedLabel = () => {
    if (mode === 'duration') return `${set.duration} sec`;
    if (mode === 'reps_only') return `${set.reps} reps`;
    if (mode === 'time_reps') return `${set.duration} sec × ${set.reps} reps`;
    return `${set.reps} reps × ${set.weight} ${weightUnit}`;
  };

  if (set.completed) {
    return (
      <TouchableOpacity
        onLongPress={onDelete}
        delayLongPress={400}
        onPress={onComplete}
        activeOpacity={1}
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
          {completedLabel()}
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
      {/* Set number badge */}
      <View style={{
        width: 28, height: 28, borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.5)' }}>
          {set.setNumber}
        </Text>
      </View>

      {/* Inputs */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {mode === 'duration' ? (
          <>
            <TextInput
              style={inputStyle}
              value={set.duration}
              onChangeText={(v) => onUpdate({ duration: v })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>sec</Text>
          </>
        ) : mode === 'time_reps' ? (
          <>
            <TextInput
              style={inputStyle}
              value={set.duration}
              onChangeText={(v) => onUpdate({ duration: v })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>sec</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>×</Text>
            <TextInput
              style={inputStyle}
              value={set.reps}
              onChangeText={(v) => onUpdate({ reps: v })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>reps</Text>
          </>
        ) : mode === 'reps_only' ? (
          <>
            <TextInput
              style={inputStyle}
              value={set.reps}
              onChangeText={(v) => onUpdate({ reps: v })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>reps</Text>
          </>
        ) : (
          <>
            <TextInput
              style={inputStyle}
              value={set.reps}
              onChangeText={(v) => onUpdate({ reps: v })}
              keyboardType="number-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>reps</Text>
            <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>×</Text>
            <TextInput
              style={inputStyle}
              value={set.weight}
              onChangeText={(v) => onUpdate({ weight: v })}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              selectTextOnFocus
            />
            <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{weightUnit}</Text>
          </>
        )}
      </View>

      {/* Done button */}
      <TouchableOpacity
        onPress={onComplete}
        activeOpacity={1}
        style={{
          backgroundColor: 'rgba(132,204,22,0.15)',
          borderRadius: Radius.md,
          borderWidth: 1,
          borderColor: 'rgba(132,204,22,0.35)',
          paddingHorizontal: 14,
          paddingVertical: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#84CC16' }}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}
