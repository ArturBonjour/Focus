import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: [{ completed: 'asc' }, { createdAt: 'desc' }],
    });
  }

  create(userId: string, dto: CreateGoalDto) {
    return this.prisma.goal.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        category: dto.category ?? 'personal',
        target: dto.target ?? 100,
        current: dto.current ?? 0,
        unit: dto.unit ?? '%',
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        color: dto.color ?? '#6366f1',
      },
    });
  }

  async update(userId: string, goalId: string, dto: UpdateGoalDto) {
    await this.ensureOwnership(userId, goalId);
    return this.prisma.goal.update({
      where: { id: goalId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.target !== undefined && { target: dto.target }),
        ...(dto.current !== undefined && { current: dto.current }),
        ...(dto.unit !== undefined && { unit: dto.unit }),
        ...(dto.deadline !== undefined && {
          deadline: dto.deadline ? new Date(dto.deadline) : null,
        }),
        ...(dto.color !== undefined && { color: dto.color }),
        ...(dto.completed !== undefined && {
          completed: dto.completed,
          completedAt: dto.completed ? new Date() : null,
        }),
      },
    });
  }

  async remove(userId: string, goalId: string) {
    await this.ensureOwnership(userId, goalId);
    return this.prisma.goal.delete({ where: { id: goalId } });
  }

  private async ensureOwnership(userId: string, goalId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id: goalId },
      select: { userId: true },
    });
    if (!goal || goal.userId !== userId)
      throw new NotFoundException('Goal not found');
    return goal;
  }
}
