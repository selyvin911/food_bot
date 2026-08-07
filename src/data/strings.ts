/**
 * Вся текстовая копия интерфейса — в одном месте.
 *
 * Данные из API (названия блюд, продуктов, единицы измерения, заголовки зон)
 * приходят на русском и подставляются как есть.
 */

export const LOCALE = 'ru-RU';

/** Русские формы множественного числа: 1 позиция, 2 позиции, 5 позиций. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const UI = {
  brand: 'PublicFitness',
  badge: 'ПУБЛИЧНЫЙ ДНЕВНИК',

  pageTitle: (name: string) => `${name} · DayPlate`,
  pageDescription: (name: string, range: string) =>
    `Дневник питания ${name} за ${range} — приёмы пищи, макронутриенты и калории по дням.`,

  ad: {
    title: 'Вступай в Клуб Физикл!',
    meta: 'Скидка -80% на 14 дней',
  },

  follow: 'Подписаться',

  week: {
    tablistLabel: 'Дни недели',
    /** Подписи стрелок карусели для скринридеров. */
    older: 'Предыдущая неделя',
    newer: 'Следующая неделя',
  },

  today: 'СЕГОДНЯ',

  macros: {
    carb: 'Углеводы',
    protein: 'Белки',
    fat: 'Жиры',
    /** Единица для баров макронутриентов. */
    unit: 'г',
  },

  rings: {
    calories: 'СЪЕДЕНО ККАЛ',
    /** Предлог перед целью: «2 663 из 2 700». */
    of: 'из',
  },

  meals: {
    kcal: 'ккал',
    /** Компактные подписи БЖУ в плашке приёма пищи. */
    macroShort: { protein: 'Б', fat: 'Ж', carb: 'У' },
    items: (n: number) => `${n} ${plural(n, 'позиция', 'позиции', 'позиций')}`,
    /** Пометка для блюд из конструктора рецептов. */
    recipe: 'рецепт',
    unnamed: 'Без названия',
  },

  notes: {
    upcoming: 'День ещё не наступил — записей нет.',
    missing: 'За этот день записи не опубликованы.',
  },

  empty: {
    title: 'Ничего не записано',
  },

  footer: {
    note: (author: string) =>
      `Записано ${author} в DayPlate. Значения — оценка по данным этикеток, а не медицинская рекомендация.`,
    generated: (stamp: string) => `Сформировано ${stamp}`,
    cta: 'Заведите свой публичный дневник (пиши в лс Максиму) →',
  },

  profileFallback: {
    name: 'Дневник питания',
    initials: 'ДП',
  },
} as const;
