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

export type SortBy = 'createdAt' | 'deadline' | 'priority' | 'title';
export type Order = 'asc' | 'desc';

export interface TaskFilter {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: SortBy;
  order?: Order;
}

export interface BulkUpdateDto {
  ids: string[];
  status?: TaskStatus;
  delete?: boolean;
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

    const PRIORITY_SORT_MAP: Record<string, string> = { HIGH: 'asc', MEDIUM: 'asc', LOW: 'asc' };
    void PRIORITY_SORT_MAP; // suppress unused
    const dir = filter.order ?? 'desc';
    // Build orderBy as a plain object array to avoid generic parameter issues
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let orderBy: any[];
    switch (filter.sortBy) {
      case 'deadline':
        orderBy = [{ deadline: { sort: dir, nulls: 'last' } }, { createdAt: 'desc' }];
        break;
      case 'priority':
        orderBy = [{ priority: dir === 'asc' ? 'desc' : 'asc' }, { createdAt: 'desc' }];
        break;
      case 'title':
        orderBy = [{ title: dir }, { createdAt: 'desc' }];
        break;
      case 'createdAt':
      default:
        orderBy = [{ createdAt: dir }];
        break;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return this.prisma.task.findMany({ where, orderBy });
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

  async findOne(userId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
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
        tags: dto.tags ?? [],
        subtasks: (dto.subtasks ?? []) as unknown as import('@prisma/client').Prisma.InputJsonValue,
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
        tags: dto.tags !== undefined ? dto.tags : undefined,
        subtasks: dto.subtasks !== undefined ? (dto.subtasks as unknown as import('@prisma/client').Prisma.InputJsonValue) : undefined,
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

  async duplicate(userId: string, taskId: string) {
    const existing = await this.prisma.task.findFirst({
      where: { id: taskId, userId },
    });
    if (!existing) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.create({
      data: {
        userId,
        title: `${existing.title} (копия)`,
        description: existing.description,
        priority: existing.priority,
        status: 'TODO',
        deadline: existing.deadline,
        tags: existing.tags,
        subtasks: [],
      },
    });
  }

  async findUpcoming(userId: string, days = 7) {
    const now = new Date();
    const future = new Date(now.getTime() + days * 86_400_000);

    const tasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: { not: TaskStatus.DONE },
        deadline: { lte: future },
      },
      orderBy: { deadline: 'asc' },
    });

    return tasks.map((t) => {
      const deadlineMs = t.deadline ? t.deadline.getTime() : null;
      const daysLeft =
        deadlineMs !== null
          ? Math.ceil((deadlineMs - now.getTime()) / 86_400_000)
          : null;
      return { ...t, daysLeft };
    });
  }

  async bulkUpdate(userId: string, dto: BulkUpdateDto) {
    // Verify all tasks belong to this user
    const tasks = await this.prisma.task.findMany({
      where: { id: { in: dto.ids }, userId },
      select: { id: true },
    });
    const ownedIds = tasks.map((t) => t.id);

    if (dto.delete) {
      await this.prisma.task.deleteMany({
        where: { id: { in: ownedIds } },
      });
      return { affected: ownedIds.length, action: 'deleted' };
    }

    if (dto.status) {
      const now = new Date();
      await this.prisma.task.updateMany({
        where: { id: { in: ownedIds } },
        data: {
          status: dto.status,
          completedAt: dto.status === TaskStatus.DONE ? now : null,
        },
      });
      return {
        affected: ownedIds.length,
        action: 'status_updated',
        status: dto.status,
      };
    }

    return { affected: 0, action: 'noop' };
  }
}
