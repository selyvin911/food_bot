/**
 * Everything that is a choice rather than data.
 *
 * The board endpoint supplies logged meals, per-entry nutrition and the
 * micronutrient recommendation zones. It does NOT expose the user's calorie or
 * macro norms, so those targets live here.
 */
import { todayIso } from '../lib/dates';
import { readEnv, readNumber } from '../lib/env';
import type { Macros } from './diary';

/**
 * The day the page centres on — the build date, unless BOARD_DATE pins it.
 * Its Monday–Sunday week is the newest one shown, and it counts as "today":
 * later days are marked upcoming.
 */
export const ANCHOR_DATE: string = readEnv('BOARD_DATE') ?? todayIso();

/**
 * How many earlier weeks to show alongside the anchor's week.
 * 1 = this week + last week, fetched as 14 dates in one request.
 */
export const WEEKS_BACK: number = readNumber('BOARD_WEEKS_BACK', 1);

/** Passed straight through to the endpoint's `week_render` parameter. */
export const WEEK_RENDER: number = readNumber('BOARD_WEEK_RENDER', 20);

/** Not available from the board endpoint — set to match your plan. */
export const CALORIE_GOAL: number = readNumber('BOARD_CALORIE_GOAL', 2700);

/** Not available from the board endpoint — set to match your plan. */
export const MACRO_TARGETS: Macros = {
  carb: readNumber('BOARD_CARB_TARGET', 300),
  protein: readNumber('BOARD_PROTEIN_TARGET', 180),
  fat: readNumber('BOARD_FAT_TARGET', 90),
};

/**
 * Which recommendation metric fills the second ring. Unlike calories, these
 * come with real targets from the API's `zones`, so the ring is fully derived.
 * 110 = Клетчатка / dietary fibre.
 */
export interface RingMetricConfig {
  /** `recommendations.daily[].id` */
  id: number;
  label: string;
  /** Unit to display instead of the API's, when `divisor` rescales the value. */
  unit?: string;
  /** Divides both fact and target, e.g. 1000 to turn граммы into килограммы. */
  divisor?: number;
  /** Decimal places for display. */
  decimals?: number;
}

/**
 * Metrics shown as rings next to the calorie ring. Their targets come from the
 * API's own `zones`, so nothing here is invented.
 */
export const RING_METRICS: RingMetricConfig[] = [
  { id: 110, label: 'КЛЕТЧАТКА', decimals: 0 },
  { id: 1, label: 'РАСТИТЕЛЬНОСТЬ', unit: 'кг', divisor: 1000, decimals: 1 },
];

/** Meal accent colours, keyed by the API's meal slug. */
export const MEAL_COLORS: Record<string, string> = {
  zavtrak: '#F0A63C',
  obed: '#12876B',
  uzhin: '#8B6BD1',
  perekus: '#4A8FD6',
};

export const FALLBACK_MEAL_COLOR = '#7C918B';

/** Shows the sponsored slot from the original design. */
export const SHOW_AD = true;

/**
 * Номер счётчика Яндекс.Метрики. 0 — аналитика не подключается.
 * Грузится только в собранной версии, в `npm run dev` не срабатывает.
 */
export const METRIKA_ID = 111387776;

/** Кнопка «Подписаться» ведёт сюда. */
export const FOLLOW_URL = 'https://www.instagram.com/maxim.yurch/';

/** Логотип в баннере из public/. Пустая строка — показать первую букву. */
export const AD_LOGO_URL = '/physical_logo.png';

/** Рекламный баннер ведёт сюда. */
export const AD_URL =
  'https://fizikl.org/fizikl_club/promo?utm_source=instagram&utm_medium=bloggers&utm_campaign=maxim.yurch';

/**
 * Фото профиля из public/. Пустая строка — показать инициалы вместо фото.
 */
export const AVATAR_URL = '/avatar.webp';

export const PROFILE_DEFAULTS = {
  handle: '@maxim.yurch',
  status: 'Поддержка',
} as const;
