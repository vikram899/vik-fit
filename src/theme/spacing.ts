// Strict 4pt grid — no other values allowed
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
} as const;

export const Layout = {
  screenPaddingHorizontal: Spacing.base,  // 16
  cardPadding: Spacing.base,              // 16
  smallInset: Spacing.sm,                 // 8
  sectionGap: Spacing.xl,                 // 24
  buttonPaddingVertical: Spacing.md,      // 12
  minTapHeight: 44,
} as const;

export type SpacingKey = keyof typeof Spacing;
