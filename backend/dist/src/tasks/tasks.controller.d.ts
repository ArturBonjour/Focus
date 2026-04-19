import { TaskPriority, TaskStatus } from '@prisma/client';
import type { Response } from 'express';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(user: JwtPayload, status?: TaskStatus, priority?: TaskPriority, search?: string): Promise<unknown>;
    getStats(user: JwtPayload): Promise<unknown>;
    export(user: JwtPayload, res: Response): Promise<void>;
    create(user: JwtPayload, dto: CreateTaskDto): Promise<unknown>;
    updateStatus(user: JwtPayload, id: string, dto: UpdateTaskStatusDto): Promise<unknown>;
    update(user: JwtPayload, id: string, dto: UpdateTaskDto): Promise<unknown>;
    remove(user: JwtPayload, id: string): Promise<unknown>;
    duplicate(user: JwtPayload, id: string): Promise<unknown>;
}
