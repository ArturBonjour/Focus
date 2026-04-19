import { Injectable, NotFoundException } from '@nestjs/common';
import { Habit } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { TrackHabitDto } from './dto/track-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.habit.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        userId,
        name: dto.name,
      },
    });
  }

  async update(userId: string, habitId: string, dto: UpdateHabitDto) {
    await this.ensureOwnership(userId, habitId);

    return this.prisma.habit.update({
      where: { id: habitId },
      data: dto,
    });
  }

  async track(userId: string, habitId: string, dto: TrackHabitDto) {
    const habit = await this.ensureOwnership(userId, habitId);

    const normalizedDate = dto.date.slice(0, 10);
    const completedDays = this.extractDays(habit).includes(normalizedDate)
      ? this.extractDays(habit)
      : [...this.extractDays(habit), normalizedDate].sort();

    const streak = this.calculateStreak(completedDays);

    return this.prisma.habit.update({
      where: { id: habitId },
      data: {
        completedDays,
        streak,
      },
    });
  }

  async untrack(userId: string, habitId: string, dto: TrackHabitDto) {
    const habit = await this.ensureOwnership(userId, habitId);

    const normalizedDate = dto.date.slice(0, 10);
    const completedDays = this.extractDays(habit).filter(
      (d) => d !== normalizedDate,
    );
    const streak = this.calculateStreak(completedDays);

    return this.prisma.habit.update({
      where: { id: habitId },
      data: { completedDays, streak },
    });
  }

  async remove(userId: string, habitId: string) {
    await this.ensureOwnership(userId, habitId);
    await this.prisma.habit.delete({ where: { id: habitId } });
    return { success: true };
  }

  private async ensureOwnership(
    userId: string,
    habitId: string,
  ): Promise<Habit> {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
    if (!habit) {
      throw new NotFoundException('Habit not found');
    }

    return habit;
  }

  private extractDays(habit: Habit): string[] {
    if (!Array.isArray(habit.completedDays)) {
      return [];
    }

    return habit.completedDays.filter(
      (day): day is string => typeof day === 'string',
    );
  }

  private calculateStreak(days: string[]): number {
    if (days.length === 0) {
      return 0;
    }

    let streak = 1;
    for (let index = days.length - 1; index > 0; index -= 1) {
      const current = new Date(days[index]);
      const previous = new Date(days[index - 1]);
      const diff = (current.getTime() - previous.getTime()) / 86_400_000;
      if (diff === 1) {
        streak += 1;
      } else {
        break;
      }
    }

    return streak;
  }
}
