import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '@theme/index';
import { Input } from '@shared/components/ui/Input';
import { Button } from '@shared/components/ui/Button';
import { MealsStackParamList } from '@core/navigation/stacks/MealsStack';
import { getMealLogDetail, editMealLog, removeMealLog } from '../services/mealLogService';
import { MealLogRow } from '@database/repositories/mealRepo';
import { Layout, Spacing } from '@theme/spacing';

type Props = NativeStackScreenProps<MealsStackParamList, 'EditMeal'>;

export default function EditMealScreen({ navigation, route }: Props) {
  const { colors, typography, spacing } = useTheme();
  const { mealLogId } = route.params;

  const [log, setLog] = useState<MealLogRow | null>(null);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const result = await getMealLogDetail(mealLogId);
      if (result) {
        setLog(result);
        setName(result.name);
        setCalories(String(result.calories));
        setProtein(String(result.protein));
        setCarbs(String(result.carbs));
        setFat(String(result.fat));
      }
    })();
  }, [mealLogId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await editMealLog(mealLogId, { name, calories, protein, carbs, fat });
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Meal', 'Remove this meal log?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await removeMealLog(mealLogId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: Layout.screenPaddingHorizontal, paddingBottom: spacing.xl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ paddingTop: spacing.xl, paddingBottom: spacing.base, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={{ ...typography.body, color: colors.brandPrimary }}>← Back</Text>
            </TouchableOpacity>
            <Text style={{ ...typography.screenTitle, color: colors.textPrimary }}>Edit Meal</Text>
            <TouchableOpacity onPress={handleDelete}>
              <Text style={{ ...typography.label, color: colors.error }}>Delete</Text>
            </TouchableOpacity>
          </View>

          <Input label="Meal name" value={name} onChangeText={setName} containerStyle={{ marginBottom: spacing.base }} />
          <Input label="Calories (kcal)" value={calories} onChangeText={setCalories} keyboardType="decimal-pad" containerStyle={{ marginBottom: spacing.base }} />

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.base }}>
            <Input label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
            <Input label="Carbs (g)" value={carbs} onChangeText={setCarbs} keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
            <Input label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="decimal-pad" containerStyle={{ flex: 1 }} />
          </View>

          <Button label="Save Changes" onPress={handleSave} loading={loading} disabled={name.trim().length === 0} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
