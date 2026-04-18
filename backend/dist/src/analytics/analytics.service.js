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
exports.AnalyticsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
let AnalyticsService = class AnalyticsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWeekly(userId) {
        return this.getForPeriod(userId, 7);
    }
    async getMonthly(userId) {
        return this.getForPeriod(userId, 30);
    }
    async getRecommendations(userId) {
        const tasks = await this.prisma.task.findMany({
            where: { userId, status: client_1.TaskStatus.DONE, completedAt: { not: null } },
            select: { completedAt: true },
            orderBy: { completedAt: 'desc' },
            take: 300,
        });
        if (tasks.length === 0) {
            return {
                recommendations: [
                    'Начните с 3 небольших задач в день для формирования ритма.',
                    'Фиксируйте время выполнения задач, чтобы система дала точные инсайты.',
                ],
            };
        }
        const buckets = {
            morning: 0,
            afternoon: 0,
            evening: 0,
            night: 0,
        };
        tasks.forEach((task) => {
            const hour = task.completedAt?.getHours() ?? 0;
            if (hour >= 6 && hour < 12)
                buckets.morning += 1;
            else if (hour >= 12 && hour < 18)
                buckets.afternoon += 1;
            else if (hour >= 18 && hour < 24)
                buckets.evening += 1;
            else
                buckets.night += 1;
        });
        const bestPeriod = Object.entries(buckets).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'morning';
        const worstPeriod = Object.entries(buckets).sort((a, b) => a[1] - b[1])[0]?.[0] ?? 'night';
        const periodMap = {
            morning: 'утро',
            afternoon: 'день',
            evening: 'вечер',
            night: 'ночь',
        };
        return {
            recommendations: [
                `Лучшее окно фокуса: ${periodMap[bestPeriod]}. Планируйте сложные задачи именно туда.`,
                `Низкая активность в период: ${periodMap[worstPeriod]}. Переносите рутинные задачи в это время.`,
                'Используйте правило 50/10: 50 минут фокус-работы + 10 минут восстановления.',
            ],
            activityBuckets: buckets,
        };
    }
    async getForPeriod(userId, days) {
        const now = new Date();
        const start = new Date(now);
        start.setDate(now.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);
        const tasks = await this.prisma.task.findMany({
            where: {
                userId,
                createdAt: {
                    gte: start,
                },
            },
            select: {
                createdAt: true,
                status: true,
            },
        });
        const map = new Map();
        for (let i = 0; i < days; i += 1) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const key = date.toISOString().slice(0, 10);
            map.set(key, { date: key, completedTasksCount: 0, totalTasksCount: 0 });
        }
        tasks.forEach((task) => {
            const key = task.createdAt.toISOString().slice(0, 10);
            const point = map.get(key);
            if (!point) {
                return;
            }
            point.totalTasksCount += 1;
            if (task.status === client_1.TaskStatus.DONE) {
                point.completedTasksCount += 1;
            }
        });
        return [...map.values()];
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map