import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

export interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  overdueCount: number;
  completionRate: number;
}

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string, filter: TaskFilter = {}) {
    const where: Record<string, unknown> = { userId };

    if (filter.status) {
      where['status'] = filter.status;
    }
    if (filter.priority) {
      where['priority'] = filter.priority;
    }
    if (filter.search) {
      where['OR'] = [
        { title: { contains: filter.search, mode: 'insensitive' } },
        { description: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    return this.prisma.task.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async getStats(userId: string): Promise<TaskStats> {
    const tasks = await this.prisma.task.findMany({
      where: { userId },
      select: { status: true, priority: true, deadline: true },
    });

    const now = new Date();
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === 'TODO').length;
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const done = tasks.filter((t) => t.status === 'DONE').length;
    const highPriority = tasks.filter((t) => t.priority === 'HIGH').length;
    const mediumPriority = tasks.filter((t) => t.priority === 'MEDIUM').length;
    const lowPriority = tasks.filter((t) => t.priority === 'LOW').length;
    const overdueCount = tasks.filter(
      (t) => t.deadline && t.deadline < now && t.status !== 'DONE',
    ).length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      total,
      todo,
      inProgress,
      done,
      highPriority,
      mediumPriority,
      lowPriority,
      overdueCount,
      completionRate,
    };
  }

  create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description,
        priority: dto.priority,
        status: dto.status,
        deadline: dto.deadline ? new Date(dto.deadline) : undefined,
        completedAt: dto.status === TaskStatus.DONE ? new Date() : undefined,
      },
    });
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    const nextStatus = dto.status ?? existing.status;

    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        ...dto,
        deadline: dto.deadline ? new Date(dto.deadline) : dto.deadline,
        completedAt:
          nextStatus === TaskStatus.DONE
            ? (existing.completedAt ?? new Date())
            : dto.status && dto.status !== TaskStatus.DONE
              ? null
              : existing.completedAt,
      },
    });
  }

  async remove(userId: string, taskId: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.delete({ where: { id: taskId } });
    return { success: true };
  }
}
