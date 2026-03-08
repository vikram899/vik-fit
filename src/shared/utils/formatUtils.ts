export function formatCalories(value: number): string {
  return `${Math.round(value)} kcal`;
}

export function formatMacro(value: number, unit: string = 'g'): string {
  return `${Math.round(value)}${unit}`;
}

export function formatWeight(value: number, unit: 'metric' | 'imperial' = 'metric'): string {
  return unit === 'metric' ? `${value} kg` : `${value} lbs`;
}

export function formatHeight(value: number, unit: 'metric' | 'imperial' = 'metric'): string {
  if (unit === 'metric') return `${value} cm`;
  const feet = Math.floor(value / 12);
  const inches = value % 12;
  return `${feet}'${inches}"`;
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
