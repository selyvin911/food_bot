/**
 * The view model the components render. Built from the board API at build time
 * by src/lib/map-board.ts — nothing in here is hand-authored content.
 */

export interface MealItem {
  name: string;
  /** e.g. "400 г · Из Лавки" */
  serving: string;
  kcal: number;
}

export interface Meal {
  name: string;
  slug: string;
  /** Accent colour for the meal's tag pill. */
  color: string;
  /** e.g. "756 г" — the design's per-meal subline. */
  weight: string;
  /**
   * Exact calorie total for the meal. Kept unrounded so day totals round once,
   * instead of accumulating the per-item rounding error.
   */
  kcal: number;
  /** Exact macro totals for the meal, in grams. */
  macros: Macros;
  items: MealItem[];
}

export interface Macros {
  carb: number;
  protein: number;
  fat: number;
}

/** Sums macros of several entries. */
export const addMacros = (a: Macros, b: Macros): Macros => ({
  carb: a.carb + b.carb,
  protein: a.protein + b.protein,
  fat: a.fat + b.fat,
});

export const ZERO_MACROS: Macros = { carb: 0, protein: 0, fat: 0 };

/** A recommendation metric with its target, straight from the API's zones. */
export interface Metric {
  label: string;
  /** Value in `unit`. */
  fact: number;
  /** Target for the metric's green zone, in `unit`. Zero when unknown. */
  target: number;
  unit: string;
  /** The zone's own wording, e.g. "Норма". */
  targetTitle: string;
  /** Decimal places for display. */
  decimals: number;
}

export interface Day {
  /** ISO date, YYYY-MM-DD. */
  date: string;
  /** Position in the flat day list — the tab/panel index. */
  index: number;
  /** Later than the anchor date, so nothing could have been logged yet. */
  future: boolean;
  /** The anchor date itself. Marked in the picker even when not selected. */
  isToday: boolean;
  dow: string;
  dayNum: string;
  label: string;
  note: string;
  macros: Macros;
  meals: Meal[];
  /**
   * Rings shown next to the calorie ring, in RING_METRICS order. Always the
   * same length so the ring row keeps its shape on days without a report.
   */
  metrics: Metric[];
}

export interface Profile {
  initials: string;
  name: string;
  handle: string;
  status: string;
}

/** One calendar week — a page in the day picker. */
export interface WeekGroup {
  /** «3 – 9 авг. 2026» */
  range: string;
  days: Day[];
}

/** Everything a page needs, assembled once per build. */
export interface DiaryWeek {
  /** All days across every week, in display order. */
  days: Day[];
  /** The same days grouped for the picker, oldest week first. */
  weeks: WeekGroup[];
  /** Full span of every day shown, oldest → newest. For the page description. */
  range: string;
  /**
   * Day shown on load: the most recent one that actually has entries, so the
   * first screen is never empty. Falls back to the anchor date.
   */
  selectedIndex: number;
  profile: Profile;
}
