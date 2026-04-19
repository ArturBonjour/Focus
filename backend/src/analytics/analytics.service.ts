import { Injectable } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

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

export interface AnalyticsSummary {
  tasks: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    overdue: number;
    completionRate: number;
    avgCompletionDays: number | null;
  };
  habits: {
    total: number;
    totalStreakDays: number;
    longestStreak: number;
    avgStreak: number;
  };
  productivity: {
    bestDayOfWeek: string | null;
    avgDailyCompleted: number;
    peakHour: string | null;
  };
}

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeekly(userId: string): Promise<ProductivityPoint[]> {
    return this.getForPeriod(userId, 7);
  }

  async getMonthly(userId: string): Promise<ProductivityPoint[]> {
    return this.getForPeriod(userId, 30);
  }

  async getSummary(userId: string): Promise<AnalyticsSummary> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      select: {
        status: true,
        priority: true,
        deadline: true,
        createdAt: true,
        completedAt: true,
      },
    });
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      select: { streak: true, completedDays: true },
    });

    const now = new Date();

    // Task metrics
    const total = tasks.length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const overdue = tasks.filter(
      (t) => t.deadline && t.deadline < now && t.status !== 'DONE',
    ).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    // Average completion time (days from created to completed)
    const completedWithBothDates = tasks.filter(
      (t) => t.status === 'DONE' && t.completedAt,
    );
    const avgCompletionDays =
      completedWithBothDates.length > 0
        ? Math.round(
            completedWithBothDates.reduce(
              (acc, t) =>
                acc +
                (t.completedAt!.getTime() - t.createdAt.getTime()) / 86_400_000,
              0,
            ) / completedWithBothDates.length,
          )
        : null;

    // Habit metrics
    const habitStreaks = habits.map((h) => h.streak);
    const totalStreakDays = habitStreaks.reduce((a, b) => a + b, 0);
    const longestStreak =
      habitStreaks.length > 0 ? Math.max(...habitStreaks) : 0;
    const avgStreak =
      habits.length > 0 ? Math.round(totalStreakDays / habits.length) : 0;

    // Productivity patterns — best day of week
    const dayBuckets = Array(7).fill(0) as number[];
    const doneTasks = tasks.filter((t) => t.completedAt);
    doneTasks.forEach((t) => {
      dayBuckets[t.completedAt!.getDay()] += 1;
    });
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const bestDayIndex = dayBuckets.indexOf(Math.max(...dayBuckets));
    const bestDayOfWeek = doneTasks.length > 0 ? dayNames[bestDayIndex] : null;

    // Avg daily completed (last 30 days)
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(now.getDate() - 30);
    const recentDone = tasks.filter(
      (t) => t.completedAt && t.completedAt >= thirtyDaysAgo,
    ).length;
    const avgDailyCompleted = Math.round((recentDone / 30) * 10) / 10;

    // Peak hour
    const hourBuckets = Array(24).fill(0) as number[];
    doneTasks.forEach((t) => {
      hourBuckets[t.completedAt!.getHours()] += 1;
    });
    const peakHourIndex = hourBuckets.indexOf(Math.max(...hourBuckets));
    const peakHour =
      doneTasks.length > 0
        ? `${peakHourIndex}:00–${peakHourIndex + 1}:00`
        : null;

    return {
      tasks: {
        total,
        done,
        inProgress,
        todo,
        overdue,
        completionRate,
        avgCompletionDays,
      },
      habits: {
        total: habits.length,
        totalStreakDays,
        longestStreak,
        avgStreak,
      },
      productivity: {
        bestDayOfWeek,
        avgDailyCompleted,
        peakHour,
      },
    };
  }

  async getRecommendations(userId: string): Promise<RecommendationPayload> {
    const [tasks, habits, allTasks] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId, status: TaskStatus.DONE, completedAt: { not: null } },
        select: { completedAt: true, createdAt: true },
        orderBy: { completedAt: 'desc' },
        take: 300,
      }),
      this.prisma.habit.findMany({
        where: { userId },
        select: { streak: true, completedDays: true, name: true },
      }),
      this.prisma.task.findMany({
        where: { userId },
        select: { status: true, priority: true, deadline: true },
      }),
    ]);

    const recs: string[] = [];
    const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    if (tasks.length === 0) {
      return {
        recommendations: [
          '🌱 Начните с 3 небольших задач в день для формирования ритма работы.',
          '📊 Фиксируйте выполнение задач — через неделю система даст точные инсайты.',
          '⏱ Попробуйте технику Pomodoro: 25 минут фокус, 5 минут отдых.',
        ],
      };
    }

    tasks.forEach((task) => {
      const hour = task.completedAt?.getHours() ?? 0;
      if (hour >= 6 && hour < 12) buckets.morning += 1;
      else if (hour >= 12 && hour < 18) buckets.afternoon += 1;
      else if (hour >= 18 && hour < 24) buckets.evening += 1;
      else buckets.night += 1;
    });

    const periodMap: Record<string, string> = {
      morning: 'утро (6–12)',
      afternoon: 'день (12–18)',
      evening: 'вечер (18–24)',
      night: 'ночь (0–6)',
    };
    const periodEmoji: Record<string, string> = {
      morning: '🌅',
      afternoon: '☀️',
      evening: '🌆',
      night: '🌙',
    };

    const sorted = Object.entries(buckets).sort((a, b) => b[1] - a[1]);
    const bestPeriod = sorted[0]?.[0] ?? 'morning';
    const worstPeriod = sorted[sorted.length - 1]?.[0] ?? 'night';

    recs.push(
      `${periodEmoji[bestPeriod]} Пик продуктивности: ${periodMap[bestPeriod]}. Планируйте самые важные задачи именно в это время.`,
    );

    // Day-of-week analysis
    const dayBuckets = Array(7).fill(0) as number[];
    tasks.forEach((t) => {
      if (t.completedAt) dayBuckets[t.completedAt.getDay()] += 1;
    });
    const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const bestDayIdx = dayBuckets.indexOf(Math.max(...dayBuckets));
    if (dayBuckets[bestDayIdx] > 0) {
      recs.push(
        `📅 Лучший день недели: ${dayNames[bestDayIdx]} (${dayBuckets[bestDayIdx]} задач выполнено). Концентрируйте ключевые задачи на этот день.`,
      );
    }

    // Low activity period recommendation
    if (buckets[worstPeriod as keyof typeof buckets] < tasks.length * 0.1) {
      recs.push(
        `⚡ Низкая активность в период ${periodMap[worstPeriod]}. Используйте это время для лёгких задач: email, чтение, планирование.`,
      );
    }

    // Overdue tasks warning
    const now = new Date();
    const overdue = allTasks.filter(
      (t) => t.deadline && t.deadline < now && t.status !== TaskStatus.DONE,
    ).length;
    if (overdue > 0) {
      recs.push(
        `⚠️ ${overdue} задач${overdue > 1 ? 'и' : 'а'} просрочен${overdue > 1 ? 'о' : 'а'}. Разберитесь с ними первыми или перенесите дедлайн — это снизит стресс.`,
      );
    }

    // High priority tasks in backlog
    const highPrioTodo = allTasks.filter(
      (t) => t.priority === 'HIGH' && t.status === TaskStatus.TODO,
    ).length;
    if (highPrioTodo > 0) {
      recs.push(
        `🔴 ${highPrioTodo} задач высокого приоритета ждёт начала. Возьмите одну в работу прямо сейчас.`,
      );
    }

    // Habit streak advice
    const bestHabit = habits.sort((a, b) => b.streak - a.streak)[0];
    if (bestHabit && bestHabit.streak >= 7) {
      recs.push(
        `🔥 Ваш лучший streak по привычке "${bestHabit.name}": ${bestHabit.streak} дней! Продолжайте — через ${21 - bestHabit.streak > 0 ? 21 - bestHabit.streak : 0} дней привычка станет автоматической.`,
      );
    }

    // Completion velocity
    const recent7 = tasks.filter((t) => {
      if (!t.completedAt) return false;
      const diff = (now.getTime() - t.completedAt.getTime()) / 86_400_000;
      return diff <= 7;
    }).length;
    const dailyRate = Math.round((recent7 / 7) * 10) / 10;
    if (dailyRate > 0) {
      recs.push(
        `📈 Средний темп: ${dailyRate} задач/день за последнюю неделю. ${dailyRate >= 3 ? 'Отличный ритм!' : 'Постарайтесь добавить ещё 1–2 задачи в день.'}`,
      );
    }

    // Pomodoro generic tip
    recs.push(
      '⏱ Правило 52/17: работайте 52 минуты, отдыхайте 17 — это оптимально для глубокого фокуса по данным исследований.',
    );

    return {
      recommendations: recs.slice(0, 6),
      activityBuckets: buckets,
    };
  }

  async getHeatmap(userId: string): Promise<HeatmapDay[]> {
    const days = 365;
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);

    // Build day map
    const map = new Map<string, HeatmapDay>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const key = toDateStr(d);
      map.set(key, { date: key, count: 0, tasksDone: 0, habitsDone: 0 });
    }

    // Completed tasks
    const doneTasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: TaskStatus.DONE,
        completedAt: { gte: start },
      },
      select: { completedAt: true },
    });
    doneTasks.forEach((t) => {
      if (!t.completedAt) return;
      const key = toDateStr(t.completedAt);
      const day = map.get(key);
      if (day) {
        day.tasksDone += 1;
        day.count += 1;
      }
    });

    // Habit completions
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      select: { completedDays: true },
    });
    habits.forEach((h) => {
      const completedDays = Array.isArray(h.completedDays)
        ? (h.completedDays as unknown[]).filter(
            (d): d is string => typeof d === 'string',
          )
        : [];
      completedDays.forEach((dateStr) => {
        if (dateStr >= toDateStr(start)) {
          const day = map.get(dateStr);
          if (day) {
            day.habitsDone += 1;
            day.count += 1;
          }
        }
      });
    });

    return [...map.values()];
  }

  private async getForPeriod(
    userId: string,
    days: number,
  ): Promise<ProductivityPoint[]> {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - (days - 1));
    start.setHours(0, 0, 0, 0);

    const tasks = await this.prisma.task.findMany({
      where: { userId, createdAt: { gte: start } },
      select: { createdAt: true, status: true },
    });

    const map = new Map<string, ProductivityPoint>();
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      map.set(key, {
        date: key,
        completedTasksCount: 0,
        totalTasksCount: 0,
      });
    }

    tasks.forEach((task) => {
      const key = task.createdAt.toISOString().slice(0, 10);
      const point = map.get(key);
      if (!point) return;
      point.totalTasksCount += 1;
      if (task.status === TaskStatus.DONE) {
        point.completedTasksCount += 1;
      }
    });

    return [...map.values()];
  }

  async getTrends(userId: string): Promise<TrendsPayload> {
    const now = new Date();

    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - 6);
    thisWeekStart.setHours(0, 0, 0, 0);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    const thisWeekTasks = await this.prisma.task.findMany({
      where: { userId, createdAt: { gte: thisWeekStart } },
      select: { status: true },
    });
    const lastWeekTasks = await this.prisma.task.findMany({
      where: { userId, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
      select: { status: true },
    });
    const allHabits = await this.prisma.habit.findMany({
      where: { userId },
      select: { completedDays: true },
    });

    const toDateStr = (d: Date) => d.toISOString().slice(0, 10);
    const thisWeekDates = new Set(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(thisWeekStart);
        d.setDate(thisWeekStart.getDate() + i);
        return toDateStr(d);
      }),
    );
    const lastWeekDates = new Set(
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(lastWeekStart);
        d.setDate(lastWeekStart.getDate() + i);
        return toDateStr(d);
      }),
    );

    const countHabitDays = (
      habits: { completedDays: unknown }[],
      dateSet: Set<string>,
    ) =>
      habits.reduce((acc, h) => {
        const days = Array.isArray(h.completedDays)
          ? (h.completedDays as unknown[]).filter(
              (d): d is string => typeof d === 'string',
            )
          : [];
        return acc + days.filter((d) => dateSet.has(d)).length;
      }, 0);

    const thisCompleted = thisWeekTasks.filter(
      (t) => t.status === 'DONE',
    ).length;
    const prevCompleted = lastWeekTasks.filter(
      (t) => t.status === 'DONE',
    ).length;
    const thisTotal = thisWeekTasks.length;
    const prevTotal = lastWeekTasks.length;
    const thisHabits = countHabitDays(allHabits, thisWeekDates);
    const prevHabits = countHabitDays(allHabits, lastWeekDates);

    function pct(curr: number, prev: number) {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    }

    const completedChange = pct(thisCompleted, prevCompleted);
    const trend: 'up' | 'down' | 'neutral' =
      completedChange > 5 ? 'up' : completedChange < -5 ? 'down' : 'neutral';

    return {
      completedTasks: {
        current: thisCompleted,
        previous: prevCompleted,
        changePercent: completedChange,
      },
      totalTasks: {
        current: thisTotal,
        previous: prevTotal,
        changePercent: pct(thisTotal, prevTotal),
      },
      habitCompletions: {
        current: thisHabits,
        previous: prevHabits,
        changePercent: pct(thisHabits, prevHabits),
      },
      trend,
    };
  }
}

export interface TrendsPayload {
  completedTasks: { current: number; previous: number; changePercent: number };
  totalTasks: { current: number; previous: number; changePercent: number };
  habitCompletions: {
    current: number;
    previous: number;
    changePercent: number;
  };
  trend: 'up' | 'down' | 'neutral';
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // 0–5+ (tasks done + habit checks, capped for colour scale)
  tasksDone: number;
  habitsDone: number;
}
