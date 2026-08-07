/**
 * Partial types for the food-tracker board endpoint:
 *   GET /api/v2/recommendation/calc/board/?dates=<csv>&week_render=<n>
 *
 * Only the fields this site reads are modelled. The payload carries a lot more
 * (per-entry micronutrients, unit conversion tables, gradients).
 */

/** A meal bucket defined for the user's plan. */
export interface BoardMeal {
  id: number;
  /** Lowercase display name, e.g. "завтрак". */
  name: string;
  /** Stable key referenced by each eaten entry's `meal`. */
  slug: string;
  icon: string;
  is_enable: boolean;
  is_default: boolean;
}

export interface BoardFood {
  id: number;
  name: string;
  brand_name: string | null;
}

export interface BoardServing {
  name_ru: string;
  name_en: string;
  metric_unit: string;
}

/** Nutrient block on a recipe — recipes carry their totals nested. */
export interface BoardRecipeNutrients {
  calories: number;
  protein: number;
  fat: number;
  carbohydrate: number;
}

export interface BoardRecipe {
  id: number;
  name: string;
  metric_unit: string;
  nutrients: BoardRecipeNutrients;
}

/**
 * One logged entry. Comes in two shapes: a plain food (`food` + `serving`, with
 * nutrients at the top level) or a user recipe (`recipe_constructor`, with
 * nutrients nested inside it and no `serving`).
 */
export interface BoardEatenEntry {
  id: number;
  meal: string;
  serving_amount: number;
  metric_weight: number;
  metric_unit: string;
  eaten_date: string;

  food?: BoardFood;
  serving?: BoardServing;
  recipe_constructor?: BoardRecipe;

  calories?: number;
  protein?: number;
  fat?: number;
  carbohydrate?: number;
}

export interface BoardReport {
  eaten_date: string;
  is_checked: boolean;
  report_eaten_foods: BoardEatenEntry[];
}

/** A threshold band on a recommendation metric. */
export interface BoardZone {
  color_zone: 'green' | 'blue' | 'yellow' | 'red' | string;
  title: string;
  /** Threshold expressed in the metric's `metric_unit`. */
  value_metric: number;
}

export interface BoardMetric {
  id: number;
  name: string;
  short_name: string;
  /** Raw value; scale varies by metric — prefer `fact_to_metric_unit`. */
  fact: number;
  /** Value in `metric_unit`, directly comparable with `zone.value_metric`. */
  fact_to_metric_unit: number;
  metric_unit: string;
  group: number;
  zones: BoardZone[];
}

export interface BoardRecommendations {
  daily: BoardMetric[];
  weekly: BoardMetric[];
}

/** One day of the board. The API omits dates that have no report at all. */
export interface BoardDay {
  date: string;
  recommendations: BoardRecommendations;
  report: BoardReport;
  meals: BoardMeal[];
}

export type BoardResponse = BoardDay[];
