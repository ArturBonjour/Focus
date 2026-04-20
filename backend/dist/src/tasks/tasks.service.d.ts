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
export declare class TasksService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string, filter?: TaskFilter): import("@prisma/client").Prisma.PrismaPromise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        completedAt: Date | null;
        userId: string;
    }[]>;
    getStats(userId: string): Promise<TaskStats>;
    findOne(userId: string, taskId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        completedAt: Date | null;
        userId: string;
    }>;
    create(userId: string, dto: CreateTaskDto): import("@prisma/client").Prisma.Prisma__TaskClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        completedAt: Date | null;
        userId: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(userId: string, taskId: string, dto: UpdateTaskDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        completedAt: Date | null;
        userId: string;
    }>;
    remove(userId: string, taskId: string): Promise<{
        success: boolean;
    }>;
    duplicate(userId: string, taskId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        priority: import("@prisma/client").$Enums.TaskPriority;
        status: import("@prisma/client").$Enums.TaskStatus;
        deadline: Date | null;
        completedAt: Date | null;
        userId: string;
    }>;
}
