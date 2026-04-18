export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  deadline?: string | null;
  createdAt: string;
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  completedDays: string[];
}

export interface ProductivityPoint {
  date: string;
  completedTasksCount: number;
  totalTasksCount: number;
}

export interface RecommendationPayload {
  recommendations: string[];
  activityBuckets?: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api';

async function apiFetch<T>(path: string, token?: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`API ${path} failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function getDashboardData(token?: string) {
  if (!token) {
    return {
      mode: 'demo' as const,
      tasks: [
        {
          id: 't1',
          title: 'Подготовить отчёт по продуктивности',
          priority: 'HIGH' as const,
          status: 'IN_PROGRESS' as const,
          createdAt: new Date().toISOString(),
        },
        {
          id: 't2',
          title: 'Разобрать входящие задачи',
          priority: 'MEDIUM' as const,
          status: 'DONE' as const,
          createdAt: new Date().toISOString(),
        },
      ],
      habits: [
        { id: 'h1', name: 'Deep Work 2h', streak: 6, completedDays: [] },
        { id: 'h2', name: 'Планирование дня', streak: 11, completedDays: [] },
      ],
      weekly: [
        { date: 'Пн', completedTasksCount: 2, totalTasksCount: 4 },
        { date: 'Вт', completedTasksCount: 3, totalTasksCount: 5 },
        { date: 'Ср', completedTasksCount: 5, totalTasksCount: 6 },
        { date: 'Чт', completedTasksCount: 3, totalTasksCount: 7 },
        { date: 'Пт', completedTasksCount: 6, totalTasksCount: 8 },
        { date: 'Сб', completedTasksCount: 2, totalTasksCount: 3 },
        { date: 'Вс', completedTasksCount: 1, totalTasksCount: 2 },
      ],
      recommendations: {
        recommendations: [
          'Лучшее окно фокуса: утро. Ставьте главную задачу до 12:00.',
          'Вечером падает продуктивность — переносите рутину на это время.',
          'Поддерживайте ритм 50/10 для стабильной концентрации.',
        ],
      },
    };
  }

  try {
    const [tasks, habits, weekly, recommendations] = await Promise.all([
      apiFetch<Task[]>('/tasks', token),
      apiFetch<Habit[]>('/habits', token),
      apiFetch<ProductivityPoint[]>('/analytics/weekly', token),
      apiFetch<RecommendationPayload>('/analytics/recommendations', token),
    ]);

    return {
      mode: 'live' as const,
      tasks,
      habits: habits.map((habit) => ({
        ...habit,
        completedDays: Array.isArray(habit.completedDays)
          ? habit.completedDays.filter((day): day is string => typeof day === 'string')
          : [],
      })),
      weekly,
      recommendations,
    };
  } catch {
    return getDashboardData();
  }
}
