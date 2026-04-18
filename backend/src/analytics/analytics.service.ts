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

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getWeekly(userId: string): Promise<ProductivityPoint[]> {
    return this.getForPeriod(userId, 7);
  }

  async getMonthly(userId: string): Promise<ProductivityPoint[]> {
    return this.getForPeriod(userId, 30);
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

    const buckets = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

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
      where: {
        userId,
        createdAt: {
          gte: start,
        },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    const map = new Map<string, ProductivityPoint>();
    for (let i = 0; i < days; i += 1) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      map.set(key, { date: key, completedTasksCount: 0, totalTasksCount: 0 });
    }

    tasks.forEach((task) => {
      const key = task.createdAt.toISOString().slice(0, 10);
      const point = map.get(key);
      if (!point) {
        return;
      }

      point.totalTasksCount += 1;
      if (task.status === TaskStatus.DONE) {
        point.completedTasksCount += 1;
      }
    });

    return [...map.values()];
  }
}
