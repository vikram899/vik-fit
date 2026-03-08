import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Vibration } from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';

interface RestTimerProps {
  seconds: number | null;
  onSkip: () => void;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}:${String(sec).padStart(2, '0')}` : `${sec}`;
}

export default function RestTimer({ seconds, onSkip }: RestTimerProps) {
  const { colors, typography, spacing } = useTheme();
  const prevSeconds = useRef<number | null>(null);

  // Vibrate when timer ends
  useEffect(() => {
    if (prevSeconds.current !== null && prevSeconds.current > 0 && seconds === null) {
      Vibration.vibrate([0, 200, 100, 200]);
    }
    prevSeconds.current = seconds;
  }, [seconds]);

  const visible = seconds !== null;
  const isLow = seconds !== null && seconds <= 5;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onSkip}>
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border }]}>
          <Text style={{ ...typography.caption, color: colors.textSecondary, marginBottom: spacing.sm, letterSpacing: 1 }}>
            REST
          </Text>

          <Text
            style={{
              fontSize: 80,
              fontWeight: '700',
              lineHeight: 88,
              color: isLow ? colors.error : colors.brandPrimary,
            }}
          >
            {seconds !== null ? formatTime(seconds) : ''}
          </Text>

          <Text style={{ ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs }}>
            seconds
          </Text>

          <TouchableOpacity
            onPress={onSkip}
            style={[
              styles.skipBtn,
              {
                borderColor: colors.border,
                borderRadius: Radius.full,
                marginTop: spacing.xl,
              },
            ]}
          >
            <Text style={{ ...typography.label, color: colors.textSecondary }}>Skip Rest</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  sheet: {
    width: '100%',
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  skipBtn: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderWidth: 1.5,
  },
});
