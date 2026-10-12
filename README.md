# Forte Europe — клиентский портал

Клиентский портал Forte Europe. Клиент входит в личный кабинет и видит свои сделки: программу по дням, описания ивентов, а дальше — костинг и proposal.

**Стек:** Vite + React + TypeScript, статический SPA. Данные отдаёт Make webhook (`VITE_API_URL`).

**Сайт:** https://duck-agency.com/forte-europe-portal/ — работает на реальных данных через Make (`.env.production`).

## Запуск

```bash
npm install
npm run dev
```

Локально без `VITE_API_URL` портал работает на тестовых данных из `src/api/mock.ts` (вход `demo@forteeurope.test` / `demo`).

Чтобы подключить Make:
1. Скопируй `.env.example` в `.env`.
2. Впиши в `VITE_API_URL` URL вебхука.

## Структура

```
src/api/        types.ts (формат данных), client.ts (вызовы API), mock.ts (демо-данные)
src/auth/       сессия (token в localStorage)
src/pages/      Login, HomeRedirect (выбор сделки по умолчанию), Deal, Event
src/components/ Header, DealSwitcher (My deals), ManagerCard, ScheduleCard
```

## Деплой

```bash
npm run deploy
```

Скрипт собирает сайт и публикует `dist/` в ветку `gh-pages`, откуда его раздаёт GitHub Pages.
