# Forte Europe — клиентский портал

Клиентский портал Forte Europe. Клиент входит в личный кабинет и видит свои сделки: программу по дням, описания ивентов, а дальше — костинг и proposal.

**Стек:** Vite + React + TypeScript, статический SPA. Данные отдаёт backend по адресу из `VITE_API_URL`.

**Сайт:** хостится на Vercel (адрес backend берётся из `.env.production`).

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

Vercel собирает сайт сам из ветки `main` при каждом push (Framework: Vite, Build: `npm run build`, Output: `dist`).
Все пути отдают `index.html` (см. `vercel.json`), поэтому прямые ссылки вида `/deals/<id>` открываются.
