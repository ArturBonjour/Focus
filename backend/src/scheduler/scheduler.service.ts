import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Runs every day at 00:05 — checks habit streaks for users who
   * missed yesterday and resets streaks where applicable.
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async validateHabitStreaks() {
    this.logger.log('Running daily habit streak validation...');

    const habits = await this.prisma.habit.findMany({
      select: { id: true, completedDays: true, streak: true },
    });

    let resetCount = 0;

    for (const habit of habits) {
      const days = Array.isArray(habit.completedDays)
        ? (habit.completedDays as string[]).filter(
            (d): d is string => typeof d === 'string',
          )
        : [];

      if (days.length === 0) {
        if (habit.streak !== 0) {
          await this.prisma.habit.update({
            where: { id: habit.id },
            data: { streak: 0 },
          });
          resetCount++;
        }
        continue;
      }

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const lastCompleted = days.sort().at(-1);
      if (lastCompleted && lastCompleted < yesterdayStr && habit.streak > 0) {
        await this.prisma.habit.update({
          where: { id: habit.id },
          data: { streak: 0 },
        });
        resetCount++;
      }
    }

    this.logger.log(
      `Habit streak validation complete. Reset ${resetCount} streaks.`,
    );
  }

  /**
   * Every hour — log a heartbeat so we know the scheduler is alive.
   */
  @Cron(CronExpression.EVERY_HOUR)
  logHeartbeat() {
    this.logger.verbose(`Scheduler heartbeat at ${new Date().toISOString()}`);
  }
}
