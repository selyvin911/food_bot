/**
 * Maps the board API payload onto the view model in src/data/diary.ts.
 * Runs at build time only.
 */
import {
  ANCHOR_DATE,
  FALLBACK_MEAL_COLOR,
  MEAL_COLORS,
  PROFILE_DEFAULTS,
  RING_METRICS,
  WEEK_RENDER,
  WEEKS_BACK,
  type RingMetricConfig,
} from '../data/config';
import {
  addMacros,
  ZERO_MACROS,
  type Day,
  type DiaryWeek,
  type Macros,
  type Meal,
  type MealItem,
  type Metric,
  type Profile,
  type WeekGroup,
} from '../data/diary';
import { UI } from '../data/strings';
import { fetchBoard, tokenOwner } from './board-api';
import type { BoardDay, BoardEatenEntry, BoardMetric } from './board-types';
import { dayNumber, longLabel, rangeLabel, shortDow, weeksOf } from './dates';

/** Nutrients live at the top level for foods and nested for recipes. */
function nutrients(entry: BoardEatenEntry) {
  const recipe = entry.recipe_constructor?.nutrients;
  return {
    kcal: entry.calories ?? recipe?.calories ?? 0,
    protein: entry.protein ?? recipe?.protein ?? 0,
    fat: entry.fat ?? recipe?.fat ?? 0,
    carb: entry.carbohydrate ?? recipe?.carbohydrate ?? 0,
  };
}

const round = (n: number): number => Math.round(n);

function itemName(entry: BoardEatenEntry): string {
  return entry.food?.name ?? entry.recipe_constructor?.name ?? UI.meals.unnamed;
}

/** "400 г · Bonfesto" for foods, "200 г · рецепт" for recipes. */
function itemServing(entry: BoardEatenEntry): string {
  const amount = Number.isInteger(entry.serving_amount)
    ? String(entry.serving_amount)
    : entry.serving_amount.toFixed(1);
  const unit = entry.serving?.name_ru ?? entry.recipe_constructor?.metric_unit ?? entry.metric_unit;
  const qualifier = entry.recipe_constructor ? UI.meals.recipe : entry.food?.brand_name;
  return qualifier ? `${amount} ${unit} · ${qualifier}` : `${amount} ${unit}`;
}

const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);

/** Groups the day's entries into the meal buckets the API defines, in order. */
function buildMeals(day: BoardDay): Meal[] {
  const entries = day.report?.report_eaten_foods ?? [];

  return day.meals
    .filter((definition) => definition.is_enable)
    .map((definition) => {
      const own = entries.filter((entry) => entry.meal === definition.slug);
      const items: MealItem[] = own.map((entry) => ({
        name: itemName(entry),
        serving: itemServing(entry),
        kcal: round(nutrients(entry).kcal),
      }));
      const weight = own.reduce((sum, entry) => sum + (entry.metric_weight ?? 0), 0);
      const kcal = own.reduce((sum, entry) => sum + nutrients(entry).kcal, 0);
      const macros = own.reduce((total, entry) => addMacros(total, nutrients(entry)), ZERO_MACROS);

      return {
        name: capitalize(definition.name),
        slug: definition.slug,
        color: MEAL_COLORS[definition.slug] ?? FALLBACK_MEAL_COLOR,
        weight: `${round(weight)} г`,
        kcal,
        macros,
        items,
      };
    })
    .filter((meal) => meal.items.length > 0);
}

function buildMacros(day: BoardDay): Macros {
  const entries = day.report?.report_eaten_foods ?? [];
  return entries.reduce<Macros>((total, entry) => addMacros(total, nutrients(entry)), ZERO_MACROS);
}

const findMetric = (day: BoardDay, id: number): BoardMetric | undefined =>
  day.recommendations?.daily?.find((metric) => metric.id === id);

/**
 * Builds one ring metric. The green zone is the norm; metrics that only have
 * limit zones fall back to the first zone. `divisor` rescales the value and its
 * target together (граммы → килограммы), so the ratio is untouched.
 */
function toMetric(board: BoardDay | undefined, config: RingMetricConfig): Metric {
  const source = board ? findMetric(board, config.id) : undefined;
  const zone = source?.zones.find((z) => z.color_zone === 'green') ?? source?.zones[0];
  const divisor = config.divisor ?? 1;

  return {
    label: config.label,
    fact: (source?.fact_to_metric_unit ?? 0) / divisor,
    target: (zone?.value_metric ?? 0) / divisor,
    unit: config.unit ?? source?.metric_unit ?? '',
    targetTitle: zone?.title ?? '',
    decimals: config.decimals ?? 0,
  };
}

/**
 * Note under the day's heading. Days with entries get none — the meals speak
 * for themselves; only empty days need explaining.
 */
function noteFor(date: string, hasData: boolean): string {
  if (hasData) return '';
  return date > ANCHOR_DATE ? UI.notes.upcoming : UI.notes.missing;
}

function buildDay(date: string, index: number, board: BoardDay | undefined): Day {
  const meals = board ? buildMeals(board) : [];

  return {
    date,
    index,
    future: date > ANCHOR_DATE,
    isToday: date === ANCHOR_DATE,
    dow: shortDow(date),
    dayNum: dayNumber(date),
    label: date === ANCHOR_DATE ? `${longLabel(date)} · ${UI.today}` : longLabel(date),
    note: noteFor(date, meals.length > 0),
    macros: board ? buildMacros(board) : ZERO_MACROS,
    meals,
    metrics: RING_METRICS.map((config) => toMetric(board, config)),
  };
}

function buildProfile(): Profile {
  const owner = tokenOwner();
  const name = owner ? `${owner.firstName} ${owner.lastName}`.trim() : UI.profileFallback.name;
  const initials =
    name
      .split(/\s+/)
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase() || UI.profileFallback.initials;

  return { initials, name, ...PROFILE_DEFAULTS };
}

/**
 * The day to open on: the latest one with entries. Today is often still empty
 * (nothing logged yet), and landing on a blank day tells the reader nothing.
 */
function pickSelected(days: Day[]): number {
  const withEntries = days.filter((day) => day.meals.length > 0);
  if (withEntries.length === 0) {
    return Math.max(0, days.findIndex((day) => day.isToday));
  }
  // Days are ordered newest week first, so compare dates rather than indices.
  return withEntries.reduce((latest, day) => (day.date > latest.date ? day : latest)).index;
}

/**
 * Fetches the anchor week plus WEEKS_BACK earlier ones — all dates in a single
 * request — and maps them. Dates the API has no report for still get a day,
 * rendered as the design's empty state.
 */
export async function loadDiaryWeek(): Promise<DiaryWeek> {
  // Chronological — oldest week first, which is also the display order.
  const weekDates = weeksOf(ANCHOR_DATE, WEEKS_BACK);
  const allDates = weekDates.flat();

  const board = await fetchBoard(allDates, WEEK_RENDER);
  const byDate = new Map(board.map((day) => [day.date, day]));

  const days: Day[] = allDates.map((date, index) => buildDay(date, index, byDate.get(date)));

  // Slice the flat list back into weeks, so indices stay global.
  const weeks: WeekGroup[] = weekDates.map((dates, page) => ({
    range: rangeLabel(dates),
    days: days.slice(page * 7, page * 7 + 7),
  }));

  return {
    days,
    weeks,
    range: rangeLabel(allDates),
    selectedIndex: pickSelected(days),
    profile: buildProfile(),
  };
}
