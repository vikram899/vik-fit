export const FontSize = {
  textXs: 12,
  textSm: 14,
  textMd: 16,
  textLg: 18,
  textXl: 22,
  text2Xl: 28,
  text3Xl: 32,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  // Body: 1.5 ratio
  xs: 18,   // 12 * 1.5
  sm: 21,   // 14 * 1.5
  md: 24,   // 16 * 1.5
  lg: 27,   // 18 * 1.5
  // Headings: 1.2–1.3 ratio
  xl: 28,   // 22 * 1.3
  '2xl': 34, // 28 * 1.2
  '3xl': 40, // 32 * 1.25
} as const;

export const Typography = {
  screenTitle: {
    fontSize: FontSize.text2Xl,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['2xl'],
  },
  sectionTitle: {
    fontSize: FontSize.textLg,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.lg,
  },
  body: {
    fontSize: FontSize.textMd,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.md,
  },
  caption: {
    fontSize: FontSize.textSm,
    fontWeight: FontWeight.regular,
    lineHeight: LineHeight.sm,
  },
  label: {
    fontSize: FontSize.textSm,
    fontWeight: FontWeight.medium,
    lineHeight: LineHeight.sm,
  },
  buttonText: {
    fontSize: FontSize.textMd,
    fontWeight: FontWeight.semiBold,
    lineHeight: LineHeight.md,
  },
  statLarge: {
    fontSize: FontSize.text3Xl,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight['3xl'],
  },
  statMedium: {
    fontSize: FontSize.textXl,
    fontWeight: FontWeight.bold,
    lineHeight: LineHeight.xl,
  },
} as const;

export type TypographyStyle = typeof Typography[keyof typeof Typography];
