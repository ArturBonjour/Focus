# NeuroTrack (Focus)

Интеллектуальная fullstack-система планирования и анализа продуктивности пользователя.

## Что уже реализовано

### Backend (`/backend`, NestJS + Prisma + PostgreSQL)
- JWT Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`
- Task CRUD: `GET/POST/PUT/DELETE /api/tasks`
- Habit CRUD + tracking: `GET/POST/PUT/DELETE /api/habits`, `PATCH /api/habits/:id/track`
- Analytics:
  - `GET /api/analytics/weekly`
  - `GET /api/analytics/monthly`
  - `GET /api/analytics/recommendations` (rule-based AI)
- Telegram command bridge:
  - `POST /api/telegram/command` (`/add <title>`, `/tasks`)
- Prisma schema: `User`, `Task`, `Habit`, `ProductivityLog`

### Frontend (`/frontend`, Next.js + Tailwind + Recharts)
- Современный дашборд (Notion/Linear-подобный стиль)
- Виджеты:
  - график продуктивности
  - список задач
  - блок привычек и streak
  - AI-рекомендации
- Подключение к live API через query param:
  - `/?token=<JWT_ACCESS_TOKEN>`
- Fallback в demo-режим при отсутствии/ошибке API

## Быстрый старт

### 1) Backend
```bash
cd /home/runner/work/Focus/Focus/backend
cp .env.example .env
npm install
npx prisma generate
npm run start:dev
```

Backend по умолчанию: `http://localhost:3001/api`

### 2) Frontend
```bash
cd /home/runner/work/Focus/Focus/frontend
npm install
npm run dev
```

Frontend по умолчанию: `http://localhost:3000`

## Проверки качества

### Backend
```bash
cd /home/runner/work/Focus/Focus/backend
npm run lint
npm run build
npm test
npm run test:e2e
```

### Frontend
```bash
cd /home/runner/work/Focus/Focus/frontend
npm run lint
npm run build
```

## Что делать дальше (для уровня «топ-решений»)
- Refresh-token rotation + blacklist в Redis
- Реальные push-notifications/cron reminders
- Настоящая Telegram bot интеграция через webhook и user-linking flow
- Расширенная аналитика (heatmap, focus sessions, anomaly detection)
- RBAC/roles, audit logs, rate limiting, OpenAPI/Swagger
- CI/CD + Docker Compose + staging deployment
