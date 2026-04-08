/**
 * Mifflin-St Jeor BMR formula (most accurate for general population).
 * Returns daily resting calories burned (kcal).
 *
 * @param weightKg  body weight in kilograms
 * @param heightCm  height in centimetres
 * @param age       age in years
 * @param gender    'male' | 'female' | 'other'
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other',
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male')   return Math.round(base + 5);
  if (gender === 'female') return Math.round(base - 161);
  return Math.round(base - 78); // average for 'other'
}

/**
 * Rough estimate of calories burned from steps.
 * Uses 0.04 kcal/step as a general approximation.
 */
export function stepsToCalories(steps: number): number {
  return Math.round(steps * 0.04);
}
