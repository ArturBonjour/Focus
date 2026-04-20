"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let TasksService = class TasksService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(userId, filter = {}) {
        const where = { userId };
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
    async getStats(userId) {
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
        const overdueCount = tasks.filter((t) => t.deadline && t.deadline < now && t.status !== 'DONE').length;
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
    async findOne(userId, taskId) {
        const task = await this.prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!task) {
            throw new common_1.NotFoundException('Task not found');
        }
        return task;
    }
    create(userId, dto) {
        return this.prisma.task.create({
            data: {
                userId,
                title: dto.title,
                description: dto.description,
                priority: dto.priority,
                status: dto.status,
                deadline: dto.deadline ? new Date(dto.deadline) : undefined,
                completedAt: dto.status === client_1.TaskStatus.DONE ? new Date() : undefined,
            },
        });
    }
    async update(userId, taskId, dto) {
        const existing = await this.prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Task not found');
        }
        const nextStatus = dto.status ?? existing.status;
        return this.prisma.task.update({
            where: { id: taskId },
            data: {
                ...dto,
                deadline: dto.deadline ? new Date(dto.deadline) : dto.deadline,
                completedAt: nextStatus === client_1.TaskStatus.DONE
                    ? (existing.completedAt ?? new Date())
                    : dto.status && dto.status !== client_1.TaskStatus.DONE
                        ? null
                        : existing.completedAt,
            },
        });
    }
    async remove(userId, taskId) {
        const existing = await this.prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Task not found');
        }
        await this.prisma.task.delete({ where: { id: taskId } });
        return { success: true };
    }
    async duplicate(userId, taskId) {
        const existing = await this.prisma.task.findFirst({
            where: { id: taskId, userId },
        });
        if (!existing) {
            throw new common_1.NotFoundException('Task not found');
        }
        return this.prisma.task.create({
            data: {
                userId,
                title: `${existing.title} (копия)`,
                description: existing.description,
                priority: existing.priority,
                status: 'TODO',
                deadline: existing.deadline,
            },
        });
    }
    async findUpcoming(userId, days = 7) {
        const now = new Date();
        const future = new Date(now.getTime() + days * 86_400_000);
        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                status: { not: client_1.TaskStatus.DONE },
                deadline: { lte: future },
            },
            orderBy: { deadline: 'asc' },
        });
        return tasks.map((t) => {
            const deadlineMs = t.deadline ? t.deadline.getTime() : null;
            const daysLeft = deadlineMs !== null
                ? Math.ceil((deadlineMs - now.getTime()) / 86_400_000)
                : null;
            return { ...t, daysLeft };
        });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map