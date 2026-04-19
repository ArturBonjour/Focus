import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface UserStats {
  totalTasksCompleted: number;
  totalHabitsTracked: number;
  bestHabitStreak: number;
  longestActiveStreak: number;
  xp: number;
  level: number;
  levelTitle: string;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlockedAt?: string;
  unlocked: boolean;
}

const LEVEL_TITLES = [
  'Новичок',
  'Стажёр',
  'Практикант',
  'Специалист',
  'Продуктивный',
  'Мастер фокуса',
  'Эксперт',
  'Профессионал',
  'Гений продуктивности',
  'Легенда',
];

function getLevel(xp: number): { level: number; title: string } {
  // Each level needs (level * 100) XP: L1=100, L2=200, …
  let level = 0;
  let remaining = xp;
  while (remaining >= (level + 1) * 100) {
    remaining -= (level + 1) * 100;
    level++;
  }
  const capped = Math.min(level, LEVEL_TITLES.length - 1);
  return { level: capped + 1, title: LEVEL_TITLES[capped] };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  updateRefreshTokenHash(
    userId: string,
    refreshTokenHash: string | null,
  ): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }

  async getStats(userId: string): Promise<UserStats> {
    const [tasks, habits] = await Promise.all([
      this.prisma.task.findMany({
        where: { userId },
        select: { status: true, completedAt: true, createdAt: true },
      }),
      this.prisma.habit.findMany({
        where: { userId },
        select: { streak: true, completedDays: true, createdAt: true },
      }),
    ]);

    const totalTasksCompleted = tasks.filter((t) => t.status === 'DONE').length;

    const totalHabitsTracked = habits.reduce((acc, h) => {
      const days = Array.isArray(h.completedDays)
        ? (h.completedDays as unknown[]).filter(
            (d): d is string => typeof d === 'string',
          )
        : [];
      return acc + days.length;
    }, 0);

    const bestHabitStreak = habits.reduce(
      (max, h) => Math.max(max, h.streak),
      0,
    );

    const longestActiveStreak = bestHabitStreak; // simplification

    // XP calculation: 10 per task, 5 per habit day, 2 per streak day
    const xp =
      totalTasksCompleted * 10 + totalHabitsTracked * 5 + bestHabitStreak * 2;

    const { level, title: levelTitle } = getLevel(xp);

    const achievements: Achievement[] = [
      {
        id: 'first-task',
        emoji: '🎯',
        title: 'Первый шаг',
        description: 'Выполните первую задачу',
        unlocked: totalTasksCompleted >= 1,
      },
      {
        id: 'ten-tasks',
        emoji: '💪',
        title: 'Набираю обороты',
        description: 'Выполните 10 задач',
        unlocked: totalTasksCompleted >= 10,
      },
      {
        id: 'fifty-tasks',
        emoji: '🚀',
        title: 'Продуктивная машина',
        description: 'Выполните 50 задач',
        unlocked: totalTasksCompleted >= 50,
      },
      {
        id: 'first-habit',
        emoji: '🌱',
        title: 'Строю привычки',
        description: 'Отметьте привычку в первый раз',
        unlocked: totalHabitsTracked >= 1,
      },
      {
        id: 'week-streak',
        emoji: '🔥',
        title: 'Неделя подряд',
        description: 'Удержите streak 7 дней',
        unlocked: bestHabitStreak >= 7,
      },
      {
        id: 'month-streak',
        emoji: '⚡',
        title: 'Несгибаемый',
        description: 'Удержите streak 30 дней',
        unlocked: bestHabitStreak >= 30,
      },
      {
        id: 'level5',
        emoji: '🏆',
        title: 'Мастер фокуса',
        description: 'Достигните 5-го уровня',
        unlocked: level >= 5,
      },
    ];

    return {
      totalTasksCompleted,
      totalHabitsTracked,
      bestHabitStreak,
      longestActiveStreak,
      xp,
      level,
      levelTitle,
      achievements,
    };
  }
}
