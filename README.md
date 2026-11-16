# ymaxim.com

Личный сайт indie-разработчика: главная страница и юридические документы приложений
для App Store и Google Play. Статический сайт на Astro, без SSR и рантайм-зависимостей.

## Страницы

| URL | Что это |
| --- | --- |
| `/` | Главная: кто я + ссылки на документы приложений |
| `/menushka/privacy.html` | Menushka — Privacy Policy (EN) |
| `/menushka/privacy-ru.html` | Менюшка — Политика конфиденциальности (RU) |
| `/menushka/terms.html` | Menushka — Terms of Service (EN) |
| `/menushka/terms-ru.html` | Менюшка — Условия использования (RU) |

GitHub Pages отдаёт эти же страницы и без `.html` (например, `/menushka/privacy`).

## Откуда берётся текст документов

Тексты лежат в Markdown в [src/policies/](src/policies/) — по файлу на документ и язык
(`menushka-privacy-en.md` и т. д.). Страницы в [src/pages/menushka/](src/pages/menushka/)
просто импортируют нужный файл и оборачивают его в общий макет
[src/layouts/Policy.astro](src/layouts/Policy.astro) (шапка, переключатель EN/RU, подвал).

Чтобы поправить документ — редактируй Markdown и пересобери. Чтобы добавить новое
приложение — положи его `.md`-файлы в `src/policies/`, создай страницы-обёртки в
`src/pages/<app>/` и добавь карточку приложения на главной
([src/pages/index.astro](src/pages/index.astro)).

## Запуск

```bash
npm install
npm run dev       # localhost:4321
npm run build     # пишет dist/
npm run preview   # отдаёт dist/
npm run check     # astro check
npm run deploy    # build + публикация dist/ в ветку gh-pages (домен ymaxim.com)
```

`npm run deploy:ghio` собирает с `BASE_PATH=/food_bot` для проверки на
`selyvin911.github.io/food_bot` (без CNAME).

## Структура

| Путь | Роль |
| --- | --- |
| [src/policies/](src/policies/) | Markdown-тексты документов (источник правды) |
| [src/pages/](src/pages/) | Главная и страницы-обёртки документов |
| [src/layouts/Base.astro](src/layouts/Base.astro) | `<head>`, шрифт, фавиконка, Метрика |
| [src/layouts/Policy.astro](src/layouts/Policy.astro) | Общий макет страницы документа |
| [src/components/Analytics.astro](src/components/Analytics.astro) | Яндекс.Метрика (только в проде) |
| [src/data/config.ts](src/data/config.ts) | Имя разработчика, номер счётчика Метрики |
| [src/styles/global.css](src/styles/global.css) | Токены, макет, типографика документов |
| [dns/ymaxim.com.zone](dns/ymaxim.com.zone) | DNS-записи домена |

## История

Раньше в этом репозитории жил публичный дневник питания (DayPlate) — он удалён,
код остался в истории git до тега коммита `a6d4b78`.
