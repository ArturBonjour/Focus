import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
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
