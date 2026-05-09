# Battery Monitoring Frontend

React-приложение для просмотра аналитики батарей

## Стек

- React
- React Router
- TanStack Query
- Axios
- Vite

## Запуск

Установить зависимости:

```bash
npm install
```

Запустить dev-сервер:

```bash
npm run dev
```

Собрать production-версию и посмотреть production-сборку локально:

```bash
npm run build
```

```bash
npm run preview
```

## Backend / Gateway

Все запросы frontend делает через относительный путь `/api/...`.

В dev-режиме Vite проксирует такие запросы на backend. Текущая настройка в `vite.config.js`:

```js
server: {
  proxy: {
    "/api": "http://localhost:8000",
  },
}
```

## Авторизация

Авторизация cookie-based:

- `POST /api/auth/login` выставляет `httpOnly` cookie.
- Frontend не хранит access token в `localStorage`.
- Все Axios-запросы выполняются с `withCredentials: true`.
- При старте приложение вызывает `GET /api/auth/me`, чтобы восстановить сессию после обновления страницы.
- После успешной регистрации frontend пробует автоматически выполнить вход с теми же email/password.

## Страницы

- `/auth` - вход и регистрация.
- `/` - главная страница со списком устройств и недавними циклами.
- `/devices/:deviceId` - аналитика устройства, графики, сессии и циклы.
- `/profile` - профиль пользователя, выход и удаление аккаунта.
- `/help` - справка для случаев, когда устройство не отдаёт параметры батареи.
- `/admin` - панель администратора, доступна только пользователям с ролью `admin`.

## Структура

```text
src/
  api/          # Axios API modules
  auth/         # Auth context/provider
  components/   # Layout, UI, charts
  hooks/        # TanStack Query hooks
  pages/        # Route pages
  router/       # Route guards
  utils/        # Formatting, labels, data helpers
```

## Docker

В проекте есть `Dockerfile` и `nginx.conf` для сборки и отдачи production-версии через nginx.