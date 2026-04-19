# NeuroTrack — AI Productivity System

> Интеллектуальная система планирования и анализа продуктивности пользователя

---

## Стек

| Слой | Технология |
|------|-----------|
| Frontend | Next.js 16 · React 19 · Tailwind CSS 4 · Recharts |
| Backend | NestJS 11 · Prisma 6 · PostgreSQL |
| Auth | JWT (access 15m + refresh 7d) + bcrypt |
| Docs | Swagger / OpenAPI (`/api/docs`) |
| Security | Helmet · @nestjs/throttler (60 req/min) · CORS |

---

## Быстрый старт

### Backend
```bash
cd backend
cp .env.example .env          # заполнить DATABASE_URL, JWT_*_SECRET
npm install
DATABASE_URL="postgresql://..." npx prisma generate
npx prisma migrate deploy      # или migrate dev для разработки
npm run start:dev
# API: http://localhost:3001/api
# Swagger: http://localhost:3001/api/docs
```

### Frontend
```bash
cd frontend
npm install
NEXT_PUBLIC_API_URL=http://localhost:3001/api npm run dev
# http://localhost:3000
# Demo-режим: без токена
# Live-режим: /?token=<JWT_ACCESS_TOKEN>
```

---

## API (Backend)

### Auth
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/auth/register | Регистрация |
| POST | /api/auth/login | Вход, получение токенов |
| POST | /api/auth/refresh | Обновление access token |
| POST | /api/auth/logout | Выход (инвалидация refresh) |

### Users
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/users/me | Профиль текущего пользователя |

### Tasks
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/tasks | Все задачи |
| GET | /api/tasks/stats | Статистика (по статусу, приоритету, overdue) |
| POST | /api/tasks | Создать задачу |
| PUT | /api/tasks/:id | Обновить задачу |
| DELETE | /api/tasks/:id | Удалить задачу |

### Habits
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/habits | Все привычки |
| POST | /api/habits | Создать привычку |
| PUT | /api/habits/:id | Обновить привычку |
| PATCH | /api/habits/:id/track | Отметить как выполнено за день |
| DELETE | /api/habits/:id | Удалить привычку |

### Analytics
| Метод | Путь | Описание |
|-------|------|----------|
| GET | /api/analytics/weekly | Продуктивность за 7 дней |
| GET | /api/analytics/monthly | Продуктивность за 30 дней |
| GET | /api/analytics/recommendations | AI-рекомендации (rule-based) |

### Telegram Bridge
| Метод | Путь | Описание |
|-------|------|----------|
| POST | /api/telegram/command | Команды бота: `/add <title>`, `/tasks` |

---

## Frontend — ключевые фичи

- **Светлая / тёмная тема** — мгновальное переключение без мерцания, сохраняется в localStorage
- **Glassmorphism карточки** — backdrop-blur, полупрозрачность, subtle glow
- **Sidebar** — фиксированная навигация (240px), адаптивна на мобилках
- **Stat Cards** — KPI-виджеты с glow orb и stagger-анимацией
- **Area Chart** — gradient fill, кастомный tooltip
- **Activity Heatmap** — GitHub-style grid (18 недель) для каждой привычки
- **Focus Timer** — Pomodoro 25/5 с SVG ring-progress, счётчик сессий
- **Task Cards** — priority color bar, deadline badge, hover slide
- **Habit Cards** — mini-calendar последних 7 дней, streak badge
- **CSS animations** — slide-up, fade-in, scale-in, stagger, skeleton shimmer
- **Demo / Live режим** — fallback на богатые demo-данные без API

---

## Проверки качества

```bash
# Backend
cd backend && npm run lint && npm run build && npm test && npm run test:e2e

# Frontend
cd frontend && npm run lint && npm run build
```

---

## Roadmap (следующие шаги)

- [ ] Redis refresh-token rotation + blacklist
- [ ] Real-time updates (WebSocket / SSE)
- [ ] Telegram bot webhook + привязка аккаунта
- [ ] Расширенная аналитика: anomaly detection, weekly report email
- [ ] RBAC, audit log, request tracing
- [ ] Docker Compose + CI/CD pipeline
- [ ] Мобильное приложение (React Native / Expo)
