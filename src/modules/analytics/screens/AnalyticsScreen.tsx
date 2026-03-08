import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@theme/index';

export default function AnalyticsScreen() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.backgroundPrimary }} edges={['top']}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 18, color: colors.textSecondary }}>Analytics coming soon</Text>
      </View>
    </SafeAreaView>
  );
}
