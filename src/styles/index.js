import { StyleSheet } from 'react-native';

/**
 * CENTRALIZED STYLES FOR VIKFIT APP
 * All styles should be defined here and imported into components
 * This ensures consistency across the app and makes styling changes easy
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLORS = {
  // Primary & Secondary
  primary: '#007AFF',
  secondary: '#34C759',
  danger: '#FF3B30',

  // Grayscale
  white: '#ffffff',
  background: '#fff',
  lightGray: '#f9f9f9',
  gray: '#f0f0f0',
  mediumGray: '#e0e0e0',
  darkGray: '#999',
  textPrimary: '#000',
  textSecondary: '#666',
  textTertiary: '#999',

  // Status Colors
  success: '#4CAF50',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Background variants
  primaryLight: '#E8F4FF',
  secondaryLight: '#E8F5E9',
  dangerLight: '#FFEBEE',
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const TYPOGRAPHY = {
  screenTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
  bodyBold: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  caption: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    color: COLORS.textSecondary,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textTertiary,
  },
};

// ============================================================================
// SPACING & LAYOUT
// ============================================================================

export const SPACING = {
  // Dimensions
  container: 20,
  element: 16,
  small: 12,
  xs: 8,
  tiny: 4,

  // Border radius
  borderRadius: 8,
  borderRadiusLarge: 10,
  borderRadiusXL: 12,
  borderRadiusRound: 20,

  // Input/Button
  inputHeight: 48,
  minTouchTarget: 44,
};

// ============================================================================
// GLOBAL STYLES
// ============================================================================

export const globalStyles = StyleSheet.create({
  // Screen containers
  screenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.container,
  },
  screenContainerStart: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 0,
    backgroundColor: COLORS.background,
    paddingHorizontal: 0,
    alignItems: 'stretch',
  },
  flexContainer: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Common flex utilities
  row: {
    flexDirection: 'row',
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  spacer: {
    flex: 1,
  },

  // Common spacing
  gap8: {
    gap: 8,
  },
  gap10: {
    gap: 10,
  },
  gap12: {
    gap: 12,
  },
  gap16: {
    gap: 16,
  },
  gap20: {
    gap: 20,
  },

  // Dividers
  divider: {
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
    marginTop: SPACING.element,
    marginBottom: SPACING.element,
  },
  dividerSmall: {
    borderTopWidth: 1,
    borderTopColor: COLORS.mediumGray,
    marginVertical: SPACING.xs,
  },

  // Shadows
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  toastShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },

  // Empty/Loading states
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: SPACING.element,
    fontWeight: '500',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.element,
  },
});

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttonStyles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: SPACING.borderRadiusLarge,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.small,
  },
  buttonSmall: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: SPACING.borderRadius,
  },
  buttonLarge: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: SPACING.borderRadiusXL,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
  },
  buttonDanger: {
    backgroundColor: COLORS.danger,
  },
  buttonDisabled: {
    backgroundColor: COLORS.darkGray,
    opacity: 0.6,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.small,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSmall: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 4,
  },
  buttonHalf: {
    flex: 1,
  },
  buttonFull: {
    width: '100%',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: SPACING.element,
    marginTop: SPACING.small,
  },
  buttonGroupFixed: {
    flexDirection: 'row',
    gap: SPACING.element,
    paddingHorizontal: SPACING.container,
    paddingVertical: SPACING.element,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
  cancelButton: {
    backgroundColor: COLORS.mediumGray,
  },
});

// ============================================================================
// CARD STYLES
// ============================================================================

export const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cardWhite: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  cardHighlighted: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  cardAction: {
    backgroundColor: COLORS.danger,
    width: 44,
    height: 44,
    borderRadius: SPACING.borderRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// ============================================================================
// INPUT & FORM STYLES
// ============================================================================

export const formStyles = StyleSheet.create({
  formGroup: {
    marginBottom: SPACING.small,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadius,
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.small,
    fontSize: 14,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  inputError: {
    borderColor: COLORS.danger,
  },
  textArea: {
    textAlignVertical: 'top',
    paddingVertical: SPACING.element,
    minHeight: 100,
  },
  rowGroup: {
    flexDirection: 'row',
    gap: SPACING.element,
    marginBottom: SPACING.small,
  },
  rowGroupHalf: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.danger,
    marginTop: SPACING.xs,
  },
});

// ============================================================================
// MODAL STYLES
// ============================================================================

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  overlayBottom: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 0,
  },
  content: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    width: '90%',
    maxHeight: '95%',
    marginHorizontal: '5%',
  },
  mealNameLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.element,
  },
  editForm: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  editToggle: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  mealsList: {
    height: 400,
  },
  mealItemWrapper: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mealItemContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  mealMacros: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  buttonsGroup: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginLeft: 12,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    marginVertical: SPACING.element,
  },
  contentBottom: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: SPACING.container,
    width: '100%',
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.element,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  closeButton: {
    padding: SPACING.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.element,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: SPACING.element,
  },
  modalScrollContainer: {
    flex: 1,
  },
  modalFooter: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
  },
});

// ============================================================================
// MENU/DROPDOWN STYLES
// ============================================================================

export const menuStyles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    backgroundColor: COLORS.white,
    borderRadius: SPACING.borderRadiusXL,
    padding: 0,
    width: '80%',
    overflow: 'hidden',
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    padding: SPACING.element,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.element,
    padding: SPACING.element,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  menuItemDanger: {
    color: COLORS.danger,
  },
  kebabButton: {
    padding: SPACING.xs,
  },
});

// ============================================================================
// MACRO/NUTRITION STYLES
// ============================================================================

export const macroStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.element,
    marginBottom: SPACING.xs,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.element,
  },
  macroGridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SPACING.element,
  },
  macroCard: {
    width: '48%',
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SPACING.element,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  goal: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  macroGoal: {
    fontSize: 12,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
});

// ============================================================================
// BADGE/LABEL STYLES
// ============================================================================

export const badgeStyles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  badgePrimary: {
    backgroundColor: COLORS.primaryLight,
  },
  badgeSecondary: {
    backgroundColor: COLORS.secondaryLight,
  },
  badgeDanger: {
    backgroundColor: COLORS.dangerLight,
  },
  badgeTextDanger: {
    color: COLORS.danger,
  },
});

// ============================================================================
// LIST ITEM STYLES
// ============================================================================

export const listItemStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.element,
    paddingHorizontal: SPACING.element,
    marginHorizontal: SPACING.element,
    marginVertical: SPACING.xs,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.element,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.element,
    alignItems: 'center',
  },
});

// ============================================================================
// PROGRESS BADGE STYLES
// ============================================================================

export const progressBadgeStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.element,
    marginVertical: SPACING.element,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.element,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.element,
  },
  badgeContainer: {
    flex: 1,
    minWidth: '48%',
  },
  badgeContent: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  badgeLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.element,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.mediumGray,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: SPACING.element,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  badgeValue: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '700',
  },
  noBadgesContainer: {
    paddingHorizontal: SPACING.element,
    marginVertical: SPACING.element,
    backgroundColor: COLORS.gray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    alignItems: 'center',
  },
  noBadgesText: {
    fontSize: 14,
    color: COLORS.darkGray,
    fontWeight: '500',
  },
});

// ============================================================================
// TOAST STYLES
// ============================================================================

export const toastStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: SPACING.element,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: SPACING.element,
    borderRadius: SPACING.borderRadiusLarge,
    gap: SPACING.small,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    maxWidth: '90%',
  },
  toastSuccess: {
    backgroundColor: COLORS.success,
  },
  toastError: {
    backgroundColor: COLORS.danger,
  },
  toastWarning: {
    backgroundColor: COLORS.warning,
  },
  toastInfo: {
    backgroundColor: COLORS.info,
  },
  toastText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});

// ============================================================================
// EXERCISE CARD STYLES
// ============================================================================

export const exerciseCardStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginBottom: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.element,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: SPACING.element,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.element,
  },
  timeDisplay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    backgroundColor: COLORS.gray,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius,
  },
});

// ============================================================================
// MEAL CARD STYLES
// ============================================================================

export const mealCardStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.lightGray,
    borderRadius: SPACING.borderRadiusLarge,
    padding: SPACING.element,
    marginBottom: SPACING.element,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.element,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.xs,
    borderRadius: SPACING.borderRadius,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.element,
    alignItems: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    gap: SPACING.element,
  },
  nutritionItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.small,
    borderRadius: SPACING.borderRadius,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    alignItems: 'center',
  },
  nutritionLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '500',
    marginBottom: SPACING.xs,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
});

// ============================================================================
// TODAY'S MEALS LIST STYLES
// ============================================================================

export const todaysMealsStyles = StyleSheet.create({
  titleContainer: {
    paddingHorizontal: SPACING.element,
    paddingVertical: SPACING.element,
    backgroundColor: COLORS.white,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingBottom: SPACING.element,
  },
  mealItem: {
    backgroundColor: COLORS.white,
    padding: SPACING.element,
    borderRadius: SPACING.borderRadiusLarge,
    borderWidth: 1,
    borderColor: COLORS.mediumGray,
    marginBottom: SPACING.element,
    marginHorizontal: SPACING.element,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mealContent: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  mealMacros: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.darkGray,
    marginVertical: SPACING.element,
  },
});

