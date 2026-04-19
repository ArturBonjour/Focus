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
    async getSummary(userId) {
        const tasks = await this.prisma.task.findMany({
            where: { userId },
            select: {
                status: true,
                priority: true,
                deadline: true,
                createdAt: true,
                completedAt: true,
            },
        });
        const habits = await this.prisma.habit.findMany({
            where: { userId },
            select: { streak: true, completedDays: true },
        });
        const now = new Date();
        const total = tasks.length;
        const done = tasks.filter((t) => t.status === 'DONE').length;
        const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
        const todo = tasks.filter((t) => t.status === 'TODO').length;
        const overdue = tasks.filter((t) => t.deadline && t.deadline < now && t.status !== 'DONE').length;
        const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
        const completedWithBothDates = tasks.filter((t) => t.status === 'DONE' && t.completedAt);
        const avgCompletionDays = completedWithBothDates.length > 0
            ? Math.round(completedWithBothDates.reduce((acc, t) => acc +
                (t.completedAt.getTime() - t.createdAt.getTime()) / 86_400_000, 0) / completedWithBothDates.length)
            : null;
        const habitStreaks = habits.map((h) => h.streak);
        const totalStreakDays = habitStreaks.reduce((a, b) => a + b, 0);
        const longestStreak = habitStreaks.length > 0 ? Math.max(...habitStreaks) : 0;
        const avgStreak = habits.length > 0 ? Math.round(totalStreakDays / habits.length) : 0;
        const dayBuckets = Array(7).fill(0);
        const doneTasks = tasks.filter((t) => t.completedAt);
        doneTasks.forEach((t) => {
            dayBuckets[t.completedAt.getDay()] += 1;
        });
        const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
        const bestDayIndex = dayBuckets.indexOf(Math.max(...dayBuckets));
        const bestDayOfWeek = doneTasks.length > 0 ? dayNames[bestDayIndex] : null;
        const thirtyDaysAgo = new Date(now);
        thirtyDaysAgo.setDate(now.getDate() - 30);
        const recentDone = tasks.filter((t) => t.completedAt && t.completedAt >= thirtyDaysAgo).length;
        const avgDailyCompleted = Math.round((recentDone / 30) * 10) / 10;
        const hourBuckets = Array(24).fill(0);
        doneTasks.forEach((t) => {
            hourBuckets[t.completedAt.getHours()] += 1;
        });
        const peakHourIndex = hourBuckets.indexOf(Math.max(...hourBuckets));
        const peakHour = doneTasks.length > 0
            ? `${peakHourIndex}:00–${peakHourIndex + 1}:00`
            : null;
        return {
            tasks: {
                total,
                done,
                inProgress,
                todo,
                overdue,
                completionRate,
                avgCompletionDays,
            },
            habits: {
                total: habits.length,
                totalStreakDays,
                longestStreak,
                avgStreak,
            },
            productivity: {
                bestDayOfWeek,
                avgDailyCompleted,
                peakHour,
            },
        };
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
        const buckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };
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
            where: { userId, createdAt: { gte: start } },
            select: { createdAt: true, status: true },
        });
        const map = new Map();
        for (let i = 0; i < days; i += 1) {
            const date = new Date(start);
            date.setDate(start.getDate() + i);
            const key = date.toISOString().slice(0, 10);
            map.set(key, {
                date: key,
                completedTasksCount: 0,
                totalTasksCount: 0,
            });
        }
        tasks.forEach((task) => {
            const key = task.createdAt.toISOString().slice(0, 10);
            const point = map.get(key);
            if (!point)
                return;
            point.totalTasksCount += 1;
            if (task.status === client_1.TaskStatus.DONE) {
                point.completedTasksCount += 1;
            }
        });
        return [...map.values()];
    }
    async getTrends(userId) {
        const now = new Date();
        const thisWeekStart = new Date(now);
        thisWeekStart.setDate(now.getDate() - 6);
        thisWeekStart.setHours(0, 0, 0, 0);
        const lastWeekStart = new Date(thisWeekStart);
        lastWeekStart.setDate(thisWeekStart.getDate() - 7);
        const thisWeekTasks = await this.prisma.task.findMany({
            where: { userId, createdAt: { gte: thisWeekStart } },
            select: { status: true },
        });
        const lastWeekTasks = await this.prisma.task.findMany({
            where: { userId, createdAt: { gte: lastWeekStart, lt: thisWeekStart } },
            select: { status: true },
        });
        const allHabits = await this.prisma.habit.findMany({
            where: { userId },
            select: { completedDays: true },
        });
        const toDateStr = (d) => d.toISOString().slice(0, 10);
        const thisWeekDates = new Set(Array.from({ length: 7 }, (_, i) => {
            const d = new Date(thisWeekStart);
            d.setDate(thisWeekStart.getDate() + i);
            return toDateStr(d);
        }));
        const lastWeekDates = new Set(Array.from({ length: 7 }, (_, i) => {
            const d = new Date(lastWeekStart);
            d.setDate(lastWeekStart.getDate() + i);
            return toDateStr(d);
        }));
        const countHabitDays = (habits, dateSet) => habits.reduce((acc, h) => {
            const days = Array.isArray(h.completedDays)
                ? h.completedDays.filter((d) => typeof d === 'string')
                : [];
            return acc + days.filter((d) => dateSet.has(d)).length;
        }, 0);
        const thisCompleted = thisWeekTasks.filter((t) => t.status === 'DONE').length;
        const prevCompleted = lastWeekTasks.filter((t) => t.status === 'DONE').length;
        const thisTotal = thisWeekTasks.length;
        const prevTotal = lastWeekTasks.length;
        const thisHabits = countHabitDays(allHabits, thisWeekDates);
        const prevHabits = countHabitDays(allHabits, lastWeekDates);
        function pct(curr, prev) {
            if (prev === 0)
                return curr > 0 ? 100 : 0;
            return Math.round(((curr - prev) / prev) * 100);
        }
        const completedChange = pct(thisCompleted, prevCompleted);
        const trend = completedChange > 5 ? 'up' : completedChange < -5 ? 'down' : 'neutral';
        return {
            completedTasks: {
                current: thisCompleted,
                previous: prevCompleted,
                changePercent: completedChange,
            },
            totalTasks: {
                current: thisTotal,
                previous: prevTotal,
                changePercent: pct(thisTotal, prevTotal),
            },
            habitCompletions: {
                current: thisHabits,
                previous: prevHabits,
                changePercent: pct(thisHabits, prevHabits),
            },
            trend,
        };
    }
};
exports.AnalyticsService = AnalyticsService;
exports.AnalyticsService = AnalyticsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnalyticsService);
//# sourceMappingURL=analytics.service.js.map