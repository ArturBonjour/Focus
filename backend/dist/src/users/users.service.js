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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const LEVEL_TITLES = [
    'Новичок',
    'Стажёр',
    'Практикант',
    'Специалист',
    'Продуктивный',
    'Мастер фокуса',
    'Эксперт',
    'Профессионал',
    'Гений продуктивности',
    'Легенда',
];
function getLevel(xp) {
    let level = 0;
    let remaining = xp;
    while (remaining >= (level + 1) * 100) {
        remaining -= (level + 1) * 100;
        level++;
    }
    const capped = Math.min(level, LEVEL_TITLES.length - 1);
    return { level: capped + 1, title: LEVEL_TITLES[capped] };
}
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    createUser(data) {
        return this.prisma.user.create({ data });
    }
    findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    updateRefreshTokenHash(userId, refreshTokenHash) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { refreshTokenHash },
        });
    }
    updateProfile(userId, data) {
        return this.prisma.user.update({
            where: { id: userId },
            data,
        });
    }
    async getStats(userId) {
        const [tasks, habits] = await Promise.all([
            this.prisma.task.findMany({
                where: { userId },
                select: { status: true, completedAt: true, createdAt: true },
            }),
            this.prisma.habit.findMany({
                where: { userId },
                select: { streak: true, completedDays: true, createdAt: true },
            }),
        ]);
        const totalTasksCompleted = tasks.filter((t) => t.status === 'DONE').length;
        const totalHabitsTracked = habits.reduce((acc, h) => {
            const days = Array.isArray(h.completedDays)
                ? h.completedDays.filter((d) => typeof d === 'string')
                : [];
            return acc + days.length;
        }, 0);
        const bestHabitStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
        const longestActiveStreak = bestHabitStreak;
        const xp = totalTasksCompleted * 10 + totalHabitsTracked * 5 + bestHabitStreak * 2;
        const { level, title: levelTitle } = getLevel(xp);
        const achievements = [
            {
                id: 'first-task',
                emoji: '🎯',
                title: 'Первый шаг',
                description: 'Выполните первую задачу',
                unlocked: totalTasksCompleted >= 1,
            },
            {
                id: 'ten-tasks',
                emoji: '💪',
                title: 'Набираю обороты',
                description: 'Выполните 10 задач',
                unlocked: totalTasksCompleted >= 10,
            },
            {
                id: 'fifty-tasks',
                emoji: '🚀',
                title: 'Продуктивная машина',
                description: 'Выполните 50 задач',
                unlocked: totalTasksCompleted >= 50,
            },
            {
                id: 'first-habit',
                emoji: '🌱',
                title: 'Строю привычки',
                description: 'Отметьте привычку в первый раз',
                unlocked: totalHabitsTracked >= 1,
            },
            {
                id: 'week-streak',
                emoji: '🔥',
                title: 'Неделя подряд',
                description: 'Удержите streak 7 дней',
                unlocked: bestHabitStreak >= 7,
            },
            {
                id: 'month-streak',
                emoji: '⚡',
                title: 'Несгибаемый',
                description: 'Удержите streak 30 дней',
                unlocked: bestHabitStreak >= 30,
            },
            {
                id: 'level5',
                emoji: '🏆',
                title: 'Мастер фокуса',
                description: 'Достигните 5-го уровня',
                unlocked: level >= 5,
            },
        ];
        return {
            totalTasksCompleted,
            totalHabitsTracked,
            bestHabitStreak,
            longestActiveStreak,
            xp,
            level,
            levelTitle,
            achievements,
        };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map