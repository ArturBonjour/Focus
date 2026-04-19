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

export interface DashboardData {
  mode: 'live' | 'demo';
  tasks: Task[];
  habits: Habit[];
  weekly: ProductivityPoint[];
  recommendations: RecommendationPayload;
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

const DEMO_DATA: DashboardData = {
  mode: 'demo',
  tasks: [
    {
      id: 't1',
      title: 'Подготовить отчёт по продуктивности Q1',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 2 * 86_400_000).toISOString(),
    },
    {
      id: 't2',
      title: 'Разобрать входящие задачи',
      priority: 'MEDIUM',
      status: 'DONE',
      createdAt: new Date().toISOString(),
    },
    {
      id: 't3',
      title: 'Встреча с командой по новому спринту',
      priority: 'HIGH',
      status: 'TODO',
      createdAt: new Date().toISOString(),
      deadline: new Date(Date.now() + 86_400_000).toISOString(),
    },
    {
      id: 't4',
      title: 'Обновить документацию API',
      priority: 'LOW',
      status: 'TODO',
      createdAt: new Date().toISOString(),
    },
    {
      id: 't5',
      title: 'Провести code review PR #42',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
    },
  ],
  habits: [
    {
      id: 'h1',
      name: 'Deep Work 2h',
      streak: 6,
      completedDays: Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return i % 3 !== 0 ? d.toISOString().slice(0, 10) : '';
      }).filter(Boolean),
    },
    {
      id: 'h2',
      name: 'Планирование дня',
      streak: 11,
      completedDays: Array.from({ length: 21 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return i % 5 !== 0 ? d.toISOString().slice(0, 10) : '';
      }).filter(Boolean),
    },
    {
      id: 'h3',
      name: 'Чтение 30 минут',
      streak: 3,
      completedDays: Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return i < 4 ? d.toISOString().slice(0, 10) : '';
      }).filter(Boolean),
    },
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
      '🌅 Лучшее окно фокуса: утро 9–12. Планируйте самые сложные задачи в это время.',
      '📉 Вечером активность падает — переносите рутинные и административные задачи на после 17:00.',
      '⏱ Работайте блоками 50/10: 50 минут фокус + 10 минут отдых. Это даст +40% продуктивности.',
    ],
  },
};

export async function getDashboardData(token?: string): Promise<DashboardData> {
  if (!token) {
    return DEMO_DATA;
  }

  try {
    const [tasks, habits, weekly, recommendations] = await Promise.all([
      apiFetch<Task[]>('/tasks', token),
      apiFetch<Habit[]>('/habits', token),
      apiFetch<ProductivityPoint[]>('/analytics/weekly', token),
      apiFetch<RecommendationPayload>('/analytics/recommendations', token),
    ]);

    return {
      mode: 'live',
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
    return DEMO_DATA;
  }
}
