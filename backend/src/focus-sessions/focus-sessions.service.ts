import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';

@Injectable()
export class FocusSessionsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, limit = 50) {
    return this.prisma.focusSession.findMany({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      take: limit,
    });
  }

  create(userId: string, dto: CreateFocusSessionDto) {
    return this.prisma.focusSession.create({
      data: {
        userId,
        phase: dto.phase ?? 'focus',
        taskTitle: dto.taskTitle,
        durationMin: dto.durationMin ?? 25,
      },
    });
  }

  async getStats(userId: string) {
    const sessions = await this.prisma.focusSession.findMany({
      where: { userId, phase: 'focus' },
      select: { durationMin: true, completedAt: true },
    });
    const totalSessions = sessions.length;
    const totalMinutes = sessions.reduce((acc, s) => acc + s.durationMin, 0);
    const todayStr = new Date().toISOString().slice(0, 10);
    const todaySessions = sessions.filter(
      (s) => s.completedAt.toISOString().slice(0, 10) === todayStr,
    );
    return {
      totalSessions,
      totalMinutes,
      totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      todaySessions: todaySessions.length,
      todayMinutes: todaySessions.reduce((acc, s) => acc + s.durationMin, 0),
    };
  }
}
