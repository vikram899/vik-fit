import { StyleSheet } from 'react-native';
import { Spacing, Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';

export const onboardingStyles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Layout.screenPaddingHorizontal,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing['2xl'],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing['2xl'],
  },
  fieldGap: {
    marginBottom: Spacing.base,
  },
  footer: {
    paddingBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  optionChip: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
});
