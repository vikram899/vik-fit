# Design System Requirements

## Stack
React Native (Expo), TypeScript, token-based design architecture.

## App Feel
- Premium (Apple Fitness / Whoop level)
- Minimal and clean
- Data-focused, performance-driven
- Dark theme first (default), scalable to light

---

## Dark Theme Colors

| Token | Value |
|---|---|
| brandPrimary | #1DB954 |
| brandSecondary | #FF3B30 |
| accent | #FFD60A |
| backgroundPrimary | #121212 |
| backgroundSecondary | #1E1E1E |
| surface / card | #242424 |
| textPrimary | #E0E0E0 |
| textSecondary | #A3A3A3 |
| textTertiary | #6D6D6D |
| border | #2C2C2C |
| success | #28A745 |
| warning | #FFC107 |
| error | #FF3B30 |
| pressed | rgba(255,255,255,0.08) |
| focused | #3D3D3D |
| disabled | #555555 |

Must meet WCAG contrast for dark mode.

---

## Light Theme Extension

| Token | Value |
|---|---|
| backgroundPrimary | #FFFFFF |
| textPrimary | #000000 |
| (retain all brand accent colors) | |

Use `useColorScheme()` from React Native to switch dynamically.

---

## Typography

Font: Inter or System default (Expo friendly)

| Token | Size |
|---|---|
| textXs | 12 |
| textSm | 14 |
| textMd | 16 |
| textLg | 18 |
| textXl | 22 |
| text2Xl | 28 |
| text3Xl | 32 |

Line heights:
- Body: 1.5 ratio
- Headings: 1.2–1.3 ratio

Usage:
- Screen Title → text2Xl / Bold
- Section Title → textLg / Medium
- Body → textMd / Regular
- Caption → textSm

Minimum body size: 16px.

---

## Spacing (Strict 4pt Grid)

Allowed tokens: `4, 8, 12, 16, 20, 24, 32, 40`

| Rule | Value |
|---|---|
| Screen horizontal padding | 16 |
| Card padding | 16 |
| Small inset | 8 |
| Section gap | 24 |
| Button vertical padding | 12 |
| Minimum tap height | 44 |

No random spacing values allowed.

---

## Component Rules

### Buttons
- **Primary**: filled brandPrimary, white text, radius 8–12, subtle pressed overlay, disabled reduces opacity
- **Secondary**: transparent, border 1–2px neutral, text in primaryColor

### Inputs
- Background: surface color
- Border: subtle gray
- Focus border: accent color
- Placeholder: textTertiary

### Cards
- Background: surfaceColor
- Border: borderPrimary
- Radius: 12
- Padding: 16
- Subtle shadow only

### Modals
- Overlay: rgba(0,0,0,0.5)
- Card-style body
- Rounded corners
- Optional subtle blur

### Tabs
- Bottom tab navigation (5 max)
- Active: primaryColor
- Inactive: textSecondary
- Minimal icons
- Respect safe area

### Graphs
- Dark background
- Minimal gridlines (#3D3D3D)
- Single highlight color
- No rainbow charts
- Smooth animation (200–300ms)

### Timers
- Large bold number (~48px)
- Accent color
- Circular progress ring

---

## Motion System

| Type | Duration |
|---|---|
| Micro interactions | 100–150ms |
| Screen transitions | 200–300ms |

Use: subtle scale, opacity feedback, slide transitions.
Avoid flashy or aggressive animation.

---

## Layout Rules

- One-column layout
- Content width = screen width - 32px
- Hierarchy: Title → Summary Card → Section → Data
- No clutter, no deep nesting

---

## Theme Folder Structure (REQUIRED)

```
src/theme/
  colors.ts
  typography.ts
  spacing.ts
  shadows.ts
  radius.ts
  index.ts
```

- All components consume theme via `useTheme()` hook or Context
- Use `useColorScheme()` for dark/light switching
- NO hardcoded colors inside components
- Everything from tokens only

---

## Strict Rules

- No hardcoded colors
- No inline style objects
- No random spacing
- No inconsistent typography
- No overdesign
- Everything from tokens
- Everything scalable
- Everything premium
