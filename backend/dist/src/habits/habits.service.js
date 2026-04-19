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
exports.HabitsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let HabitsService = class HabitsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(userId) {
        return this.prisma.habit.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    create(userId, dto) {
        return this.prisma.habit.create({
            data: {
                userId,
                name: dto.name,
            },
        });
    }
    async update(userId, habitId, dto) {
        await this.ensureOwnership(userId, habitId);
        return this.prisma.habit.update({
            where: { id: habitId },
            data: dto,
        });
    }
    async track(userId, habitId, dto) {
        const habit = await this.ensureOwnership(userId, habitId);
        const normalizedDate = dto.date.slice(0, 10);
        const completedDays = this.extractDays(habit).includes(normalizedDate)
            ? this.extractDays(habit)
            : [...this.extractDays(habit), normalizedDate].sort();
        const streak = this.calculateStreak(completedDays);
        return this.prisma.habit.update({
            where: { id: habitId },
            data: {
                completedDays,
                streak,
            },
        });
    }
    async untrack(userId, habitId, dto) {
        const habit = await this.ensureOwnership(userId, habitId);
        const normalizedDate = dto.date.slice(0, 10);
        const completedDays = this.extractDays(habit).filter((d) => d !== normalizedDate);
        const streak = this.calculateStreak(completedDays);
        return this.prisma.habit.update({
            where: { id: habitId },
            data: { completedDays, streak },
        });
    }
    async remove(userId, habitId) {
        await this.ensureOwnership(userId, habitId);
        await this.prisma.habit.delete({ where: { id: habitId } });
        return { success: true };
    }
    async ensureOwnership(userId, habitId) {
        const habit = await this.prisma.habit.findFirst({
            where: { id: habitId, userId },
        });
        if (!habit) {
            throw new common_1.NotFoundException('Habit not found');
        }
        return habit;
    }
    extractDays(habit) {
        if (!Array.isArray(habit.completedDays)) {
            return [];
        }
        return habit.completedDays.filter((day) => typeof day === 'string');
    }
    calculateStreak(days) {
        if (days.length === 0) {
            return 0;
        }
        let streak = 1;
        for (let index = days.length - 1; index > 0; index -= 1) {
            const current = new Date(days[index]);
            const previous = new Date(days[index - 1]);
            const diff = (current.getTime() - previous.getTime()) / 86_400_000;
            if (diff === 1) {
                streak += 1;
            }
            else {
                break;
            }
        }
        return streak;
    }
};
exports.HabitsService = HabitsService;
exports.HabitsService = HabitsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], HabitsService);
//# sourceMappingURL=habits.service.js.map