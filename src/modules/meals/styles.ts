import { Spacing, Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';
import { ThemeColors } from '@theme/colors';

export function createMealsStyles(colors: ThemeColors) {
  return {
    // ── Screen ──────────────────────────────────────────────────────────────
    container: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Spacing['3xl'],
    },

    // ── Header ──────────────────────────────────────────────────────────────
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'flex-start' as const,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.base,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600' as const,
      color: colors.textPrimary,
      lineHeight: 30,
    },
    headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 },

    // ── FAB ─────────────────────────────────────────────────────────────────
    fab: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: colors.brandSecondary,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      shadowColor: colors.brandSecondary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 8,
    },
    fabText: { color: colors.white, fontSize: 24, lineHeight: 28, fontWeight: '300' as const },

    // ── Daily Summary Card ───────────────────────────────────────────────────
    summaryCard: { marginBottom: Spacing.base, overflow: 'hidden' as const },
    summaryOverlay: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(245,158,11,0.08)',
    },
    summaryTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: Spacing.base,
    },
    summaryRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.sm,
    },
    summaryCalLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
    summaryCalValue: { fontSize: 14, fontWeight: '600' as const, color: colors.textPrimary },
    summaryCalTarget: { fontWeight: '400' as const, color: 'rgba(255,255,255,0.5)' },

    // ── Macros Card ──────────────────────────────────────────────────────────
    macrosCard: { marginBottom: Spacing.xl },
    macrosTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: Spacing.base,
    },
    macrosRow: { flexDirection: 'row' as const, justifyContent: 'space-around' as const },
    macroItem: { alignItems: 'center' as const },
    macroValueText: { fontSize: 16, fontWeight: '700' as const, color: colors.textPrimary },
    macroTargetText: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
    macroLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: Spacing.sm },

    // ── Today's Meals heading ────────────────────────────────────────────────
    todaysMealsTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: Spacing.sm,
    },

    // ── Section Card ─────────────────────────────────────────────────────────
    sectionCard: { marginBottom: Spacing.base, paddingBottom: 0 },
    sectionHeader: {
      flexDirection: 'row' as const,
      alignItems: 'flex-start' as const,
      gap: Spacing.base,
    },
    sectionIconBox: {
      width: 48,
      height: 48,
      borderRadius: Radius.md,
      backgroundColor: 'rgba(59,130,246,0.15)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexShrink: 0,
    },
    sectionMeta: { flex: 1 },
    sectionTitleRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 4,
    },
    sectionName: { fontSize: 16, fontWeight: '600' as const, color: colors.textPrimary },
    sectionTime: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    sectionStatsRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      flexWrap: 'wrap' as const,
    },
    sectionCalText: { fontSize: 13, fontWeight: '600' as const, color: colors.accent },
    sectionDot: { fontSize: 13, color: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
    sectionMacroText: { fontSize: 13, color: 'rgba(255,255,255,0.4)' },

    // ── Meal Items List ───────────────────────────────────────────────────────
    mealItemsList: { marginTop: Spacing.base, gap: Spacing.xs },
    mealItem: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.05)',
    },
    mealItemTopRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: 4,
    },
    mealItemName: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: colors.textPrimary,
      flex: 1,
      marginRight: 8,
    },
    mealItemCal: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
    mealItemMacros: { flexDirection: 'row' as const, alignItems: 'center' as const },
    mealItemMacroText: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
    mealItemMacroDot: { fontSize: 12, color: 'rgba(255,255,255,0.2)', marginHorizontal: 4 },

    // ── Kebab Menu ────────────────────────────────────────────────────────────
    kebabMenu: {
      marginTop: 8,
      backgroundColor: 'rgba(20,20,30,0.98)' as const,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)' as const,
      overflow: 'hidden' as const,
    },
    kebabItem: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 11,
    },
    kebabItemText: {
      fontSize: 14,
      fontWeight: '500' as const,
    },
    kebabDivider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.06)' as const,
    },

    // ── Inline Edit Form ──────────────────────────────────────────────────────
    editGrid: { marginTop: 8, gap: 6 },
    editRow: { flexDirection: 'row' as const, gap: 8 },
    editField: { flex: 1, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 4 },
    editLabel: { fontSize: 12, color: 'rgba(255,255,255,0.6)', width: 22 },
    editInput: {
      flex: 1,
      paddingHorizontal: 8,
      paddingVertical: 6,
      fontSize: 12,
      fontWeight: '500' as const,
      color: colors.white,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderWidth: 1,
      borderColor: 'rgba(59,130,246,0.5)',
      borderRadius: 8,
      textAlign: 'center' as const,
      minHeight: 30,
    },
    editUnit: { fontSize: 12, color: 'rgba(255,255,255,0.4)', width: 10 },
    editActions: { flexDirection: 'row' as const, gap: 8, marginTop: 8 },
    editSaveBtn: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(132,204,22,0.2)',
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    editSaveText: { fontSize: 12, color: '#84CC16', fontWeight: '500' as const },
    editCancelBtn: {
      flex: 1,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.05)',
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    editCancelText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '500' as const },

    // ── Add to Section Button ─────────────────────────────────────────────────
    addToSection: {
      paddingVertical: Spacing.base,
      alignItems: 'center' as const,
      flexDirection: 'row' as const,
      justifyContent: 'center' as const,
      gap: 4,
      marginTop: Spacing.base,
    },
    addToSectionBordered: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    addToSectionText: {
      fontSize: 14,
      color: colors.brandSecondary,
      fontWeight: '500' as const,
    },

    // ── Quick Add Card ────────────────────────────────────────────────────────
    quickAddCard: { marginTop: Spacing.sm, overflow: 'hidden' as const },
    quickAddOverlay: {
      position: 'absolute' as const,
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(132,204,22,0.08)',
    },
    quickAddTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: Spacing.sm,
    },
    quickAddGrid: {
      flexDirection: 'row' as const,
      flexWrap: 'wrap' as const,
      gap: 8,
    },
    quickAddItem: {
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.md,
      paddingHorizontal: 12,
      paddingVertical: 8,
      width: '48%' as const,
    },
    quickAddItemText: { fontSize: 14, color: colors.textPrimary },
  };
}
