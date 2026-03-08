export const DarkThemeColors = {
  // Brand / accent (Figma: neon-green #84CC16, neon-blue #3B82F6)
  brandPrimary:   '#84CC16',  // lime green — primary action, buttons
  brandSecondary: '#3B82F6',  // blue — FABs, active states, links
  accent:         '#F59E0B',  // amber — calories, highlights

  // Macro nutrients
  macroProtein: '#F59E0B',  // amber
  macroCarbs:   '#3B82F6',  // blue
  macroFat:     '#84CC16',  // lime green

  // Backgrounds  (Figma: --background #0F0F10, --card #1A1A1D, --secondary #27272A)
  backgroundPrimary:   '#0F0F10',  // screen background
  backgroundSecondary: '#1A1A1D',  // card / sheet background
  surface:             '#27272A',  // input bg, tile bg, secondary surfaces

  // Text  (Figma: --foreground #F5F5F7, --muted-foreground #A1A1AA)
  textPrimary:   '#F5F5F7',
  textSecondary: '#A1A1AA',
  textTertiary:  'rgba(255,255,255,0.4)',

  // Borders & states  (Figma: --border rgba(255,255,255,0.1), --input rgba(255,255,255,0.05))
  border:   'rgba(255,255,255,0.1)',
  inputBg:  'rgba(255,255,255,0.05)',
  pressed:  'rgba(255,255,255,0.07)',
  focused:  '#3B82F6',
  disabled: 'rgba(255,255,255,0.2)',

  // Semantic
  success: '#84CC16',
  warning: '#F59E0B',
  error:   '#EF4444',

  // Misc
  overlay:     'rgba(0,0,0,0.8)',
  transparent: 'transparent',
  white:       '#FFFFFF',
  black:       '#000000',
} as const;

export const LightThemeColors = {
  brandPrimary:   '#5FA800',
  brandSecondary: '#2563EB',
  accent:         '#D97706',

  macroProtein: '#D97706',
  macroCarbs:   '#2563EB',
  macroFat:     '#5FA800',

  backgroundPrimary:   '#FFFFFF',
  backgroundSecondary: '#F5F5F5',
  surface:             '#EBEBEB',

  textPrimary:   '#121212',
  textSecondary: '#4A4A4A',
  textTertiary:  'rgba(0,0,0,0.4)',

  border:   'rgba(0,0,0,0.1)',
  inputBg:  'rgba(0,0,0,0.04)',
  pressed:  'rgba(0,0,0,0.06)',
  focused:  '#2563EB',
  disabled: 'rgba(0,0,0,0.2)',

  success: '#5FA800',
  warning: '#D97706',
  error:   '#EF4444',

  overlay:     'rgba(0,0,0,0.4)',
  transparent: 'transparent',
  white:       '#FFFFFF',
  black:       '#000000',
} as const;

export type ThemeColors = typeof DarkThemeColors;
