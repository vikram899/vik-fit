import { StyleSheet } from 'react-native';
import { Spacing, Layout } from '@theme/spacing';

export const workoutsStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: Layout.screenPaddingHorizontal,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  weekdayRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  weekdayCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  setNumber: {
    width: 28,
    alignItems: 'center',
  },
  setInput: {
    flex: 1,
  },
  exerciseEditorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseDefaultsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  pickerSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '85%',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.base,
    borderBottomWidth: 1,
  },
  pickerSearchContainer: {
    padding: Spacing.base,
    borderBottomWidth: 1,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
  },
  configSection: {
    padding: Spacing.base,
  },
  configInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  typeToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  setTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    marginBottom: Spacing.xs,
  },
  setTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  setActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
});
