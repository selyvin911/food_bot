/**
 * Presentation maths: totals, ring geometry, bar widths. All of it runs at
 * build time, so the browser receives finished values.
 */
import { CALORIE_GOAL, MACRO_TARGETS } from './config';
import type { Day, Macros, Meal, Metric } from './diary';
import { LOCALE, UI } from './strings';

/** Radius of the progress rings, in the SVG's 120×120 user space. */
export const RING_RADIUS = 52;

/** Circumference of a ring — the dash cycle length. */
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** «2 663» — ru-RU groups thousands with a non-breaking space. */
const N = (n: number): string => Math.round(n).toLocaleString(LOCALE);

/** «4,3» / «64» — fixed decimals, ru-RU separators. */
const num = (n: number, decimals: number): string =>
  n.toLocaleString(LOCALE, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

/** Display total for one meal. */
export const mealKcal = (meal: Meal): number => Math.round(meal.kcal);

/** Display total for the day — rounded once, from the exact meal totals. */
export const dayKcal = (day: Day): number =>
  Math.round(day.meals.reduce((sum, meal) => sum + meal.kcal, 0));

/** `stroke-dasharray` for a ring filled to `pct` (0–1). */
export function ringDash(pct: number): string {
  const clamped = Math.min(1, Math.max(0, pct));
  return `${(clamped * RING_CIRCUMFERENCE).toFixed(1)} ${RING_CIRCUMFERENCE.toFixed(1)}`;
}

export interface RingModel {
  value: string;
  goal: string;
  dash: string;
  /** Ring is hidden rather than drawn at zero when there is nothing to show. */
  visible: boolean;
  caption: string;
}

export function calorieRing(day: Day): RingModel {
  const eaten = dayKcal(day);
  return {
    value: eaten ? N(eaten) : '—',
    goal: N(CALORIE_GOAL),
    dash: ringDash(eaten / CALORIE_GOAL),
    visible: eaten > 0,
    caption: UI.rings.calories,
  };
}

/** A metric ring — value and target both come from the API. */
export function metricRing(metric: Metric): RingModel {
  if (!metric.target) {
    // Цели нет вовсе — подпись под значением не рисуем, чтобы не было «из —».
    return { value: '—', goal: '', dash: ringDash(0), visible: false, caption: metric.label };
  }
  return {
    value: num(metric.fact, metric.decimals),
    goal: `${num(metric.target, metric.decimals)} ${metric.unit}`,
    dash: ringDash(metric.fact / metric.target),
    visible: metric.fact > 0,
    caption: metric.label,
  };
}

export interface MacroModel {
  label: string;
  key: keyof Macros;
  color: string;
  grams: string;
  pctText: string;
  width: string;
}

const MACRO_DEFS: ReadonlyArray<[label: string, key: keyof Macros, color: string]> = [
  [UI.macros.protein, 'protein', 'var(--protein)'],
  [UI.macros.fat, 'fat', 'var(--fat)'],
  [UI.macros.carb, 'carb', 'var(--carb)'],
];

export function macroModels(day: Day): MacroModel[] {
  return MACRO_DEFS.map(([label, key, color]) => {
    const grams = Math.round(day.macros[key]);
    const target = MACRO_TARGETS[key];
    const pct = Math.min(1, grams / target);
    return {
      label,
      key,
      color,
      grams: `${grams} / ${target} ${UI.macros.unit}`,
      pctText: `${Math.round(pct * 100)}%`,
      width: `${(pct * 100).toFixed(1)}%`,
    };
  });
}

/** «Б 89 · Ж 34 · У 120 г» — macro totals for one meal. */
export function mealMacroLine(meal: Meal): string {
  const { protein, fat, carb } = UI.meals.macroShort;
  const g = (n: number) => Math.round(n);
  return (
    `${protein} ${g(meal.macros.protein)} · ` +
    `${fat} ${g(meal.macros.fat)} · ` +
    `${carb} ${g(meal.macros.carb)} ${UI.macros.unit}`
  );
}

/** Meal subline; the item count is dropped once the card is expanded. */
export const mealSubline = (meal: Meal) => ({
  open: meal.weight,
  closed: `${meal.weight} · ${UI.meals.items(meal.items.length)}`,
});
