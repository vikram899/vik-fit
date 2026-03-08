import React from 'react';
import {
  Modal as RNModal, View, Text, TouchableOpacity,
  ViewStyle, StyleSheet, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useTheme } from '@theme/index';
import { Radius } from '@theme/radius';
import { Spacing } from '@theme/spacing';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  style?: ViewStyle;
}

export function Modal({ visible, onClose, title, children, style }: ModalProps) {
  const { colors, typography, spacing } = useTheme();

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.kav}
      >
        {/* Backdrop */}
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />

        {/* Content */}
        <TouchableOpacity
          activeOpacity={1}
          style={[
            styles.content,
            {
              backgroundColor: colors.surface,
              borderRadius: Radius.lg,
              borderWidth: 1,
              borderColor: colors.border,
              padding: spacing.xl,
            },
            style,
          ]}
        >
          {title ? (
            <Text style={{ ...typography.sectionTitle, color: colors.textPrimary, marginBottom: spacing.base }}>
              {title}
            </Text>
          ) : null}
          {children}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  kav: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
  },
});
