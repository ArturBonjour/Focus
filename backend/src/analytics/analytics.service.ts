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
    const [tasks, habits] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        select: {
          status: true,
          priority: true,
          deadline: true,
          createdAt: true,
          completedAt: true,
        },
      }),
      this.prisma.habit.findMany({
        where: { userId },
        select: { streak: true, completedDays: true },
      }),
    ]);

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
    const tasks = await this.prisma.task.findMany({
      where: { userId, status: TaskStatus.DONE, completedAt: { not: null } },
      select: { completedAt: true },
      orderBy: { completedAt: 'desc' },
      take: 300,
    });

    if (tasks.length === 0) {
      return {
        recommendations: [
          'Начните с 3 небольших задач в день для формирования ритма.',
          'Фиксируйте время выполнения задач, чтобы система дала точные инсайты.',
        ],
      };
    }

    const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };

    tasks.forEach((task) => {
      const hour = task.completedAt?.getHours() ?? 0;
      if (hour >= 6 && hour < 12) buckets.morning += 1;
      else if (hour >= 12 && hour < 18) buckets.afternoon += 1;
      else if (hour >= 18 && hour < 24) buckets.evening += 1;
      else buckets.night += 1;
    });

    const bestPeriod =
      Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'morning';
    const worstPeriod =
      Object.entries(buckets).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'night';

    const periodMap: Record<string, string> = {
      morning: 'утро',
      afternoon: 'день',
      evening: 'вечер',
      night: 'ночь',
    };

    return {
      recommendations: [
        `Лучшее окно фокуса: ${periodMap[bestPeriod]}. Планируйте сложные задачи именно туда.`,
        `Низкая активность в период: ${periodMap[worstPeriod]}. Переносите рутинные задачи в это время.`,
        'Используйте правило 50/10: 50 минут фокус-работы + 10 минут восстановления.',
      ],
      activityBuckets: buckets,
    };
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
}
