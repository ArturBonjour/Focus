import { TaskPriority, TaskStatus } from '@prisma/client';
import type { Response } from 'express';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';
import type { BulkUpdateDto } from './tasks.service';
type SortBy = 'createdAt' | 'deadline' | 'priority' | 'title';
type Order = 'asc' | 'desc';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(user: JwtPayload, status?: TaskStatus, priority?: TaskPriority, search?: string, sortBy?: SortBy, order?: Order, tags?: string): Promise<unknown>;
    getTags(user: JwtPayload): Promise<string[]>;
    getStats(user: JwtPayload): Promise<unknown>;
    findUpcoming(user: JwtPayload, days?: string): Promise<unknown>;
    export(user: JwtPayload, res: Response, format?: 'json' | 'csv'): Promise<void>;
    bulkUpdate(user: JwtPayload, dto: BulkUpdateDto): Promise<unknown>;
    create(user: JwtPayload, dto: CreateTaskDto): Promise<unknown>;
    findOne(user: JwtPayload, id: string): Promise<unknown>;
    updateStatus(user: JwtPayload, id: string, dto: UpdateTaskStatusDto): Promise<unknown>;
    update(user: JwtPayload, id: string, dto: UpdateTaskDto): Promise<unknown>;
    remove(user: JwtPayload, id: string): Promise<unknown>;
    duplicate(user: JwtPayload, id: string): Promise<unknown>;
}
export {};
