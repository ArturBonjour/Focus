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
    findAll(userId) {
        return this.prisma.task.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
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
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map