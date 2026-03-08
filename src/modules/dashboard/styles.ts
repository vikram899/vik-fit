import { StyleSheet } from 'react-native';
import { Spacing, Layout } from '@theme/spacing';

export const dashboardStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  sectionGap: {
    marginTop: Spacing.xl,
  },
  macroRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  macroItem: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.xs,
  },
});
