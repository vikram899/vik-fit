import { ThemeColors } from '@theme/colors';
import { Spacing, Layout } from '@theme/spacing';
import { Radius } from '@theme/radius';

export function createProfileStyles(colors: ThemeColors) {
  return {
    container: { flex: 1 },
    scrollContent: {
      paddingHorizontal: Layout.screenPaddingHorizontal,
      paddingBottom: Spacing['3xl'],
    },
    // ── Header ──
    header: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingTop: Spacing.xl,
      paddingBottom: Spacing.base,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    headerBtn: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      backgroundColor: 'rgba(255,255,255,0.05)',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    // ── Profile Card ──
    profileCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      marginBottom: Spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden' as const,
    },
    profileCardOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(59,130,246,0.06)',
    },
    profileRow: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: Spacing.base,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: Radius.lg,
      backgroundColor: '#3B82F6',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexShrink: 0,
    },
    avatarText: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: '#FFFFFF',
    },
    profileInfo: { flex: 1 },
    profileName: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    profileSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    profileGoal: {
      fontSize: 12,
      color: colors.textTertiary,
      marginTop: 6,
    },
    // ── Stats Grid ──
    statsGrid: {
      flexDirection: 'row' as const,
      gap: Spacing.sm,
      marginBottom: Spacing.base,
    },
    statTile: {
      flex: 1,
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      padding: Spacing.sm,
      alignItems: 'center' as const,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statIconBox: {
      width: 40,
      height: 40,
      borderRadius: Radius.md,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      marginBottom: Spacing.xs,
    },
    statValue: {
      fontSize: 18,
      fontWeight: '700' as const,
    },
    statLabel: {
      fontSize: 10,
      color: colors.textTertiary,
      marginTop: 2,
      textAlign: 'center' as const,
    },
    // ── Generic Card ──
    card: {
      backgroundColor: colors.surface,
      borderRadius: Radius.lg,
      padding: Spacing.base,
      marginBottom: Spacing.base,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden' as const,
    },
    cardStandaloneTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
      marginBottom: Spacing.base,
    },
    cardHeader: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      marginBottom: Spacing.base,
    },
    cardHeaderLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    cardHeaderTitle: {
      fontSize: 14,
      fontWeight: '500' as const,
      color: 'rgba(255,255,255,0.8)',
    },
    linkBtn: {
      fontSize: 12,
      color: '#3B82F6',
    },
    // ── Body Stats ──
    bodyStatRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    bodyStatLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    bodyStatRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    bodyStatValue: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: colors.textPrimary,
    },
    bodyStatChange: {
      fontSize: 12,
    },
    // ── Overlays ──
    greenOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(132,204,22,0.08)',
    },
    amberOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(245,158,11,0.08)',
    },
    // ── Fitness Goals ──
    goalRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: Spacing.sm,
    },
    goalLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    goalRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 6,
    },
    goalCurrent: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    goalArrow: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    goalTarget: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#84CC16',
    },
    // ── Personal Records ──
    prRow: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      paddingVertical: 10,
      paddingHorizontal: 12,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 12,
      marginBottom: 6,
    },
    prExercise: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    prRight: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 8,
    },
    prWeight: {
      fontSize: 14,
      fontWeight: '600' as const,
      color: '#F59E0B',
    },
    prReps: {
      fontSize: 12,
      color: colors.textTertiary,
    },
    // ── Settings ──
    settingsSection: {
      gap: Spacing.sm,
      marginBottom: Spacing.base,
    },
    settingsItem: {
      flexDirection: 'row' as const,
      justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.base,
      paddingVertical: Spacing.base,
    },
    settingsItemLeft: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      gap: 12,
    },
    settingsItemLabel: {
      fontSize: 14,
      color: colors.textPrimary,
    },
    // ── Footer ──
    footer: {
      paddingVertical: Spacing.base,
      alignItems: 'center' as const,
    },
    footerText: {
      fontSize: 12,
      color: 'rgba(255,255,255,0.3)',
    },
  };
}
