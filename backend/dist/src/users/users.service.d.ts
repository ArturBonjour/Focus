import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface UserStats {
    totalTasksCompleted: number;
    totalHabitsTracked: number;
    bestHabitStreak: number;
    longestActiveStreak: number;
    xp: number;
    level: number;
    levelTitle: string;
    achievements: Achievement[];
}
export interface Achievement {
    id: string;
    title: string;
    description: string;
    emoji: string;
    unlockedAt?: string;
    unlocked: boolean;
}
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    createUser(data: Prisma.UserCreateInput): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    updateRefreshTokenHash(userId: string, refreshTokenHash: string | null): Promise<User>;
    updateProfile(userId: string, data: {
        name?: string | null;
    }): Promise<User>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    getStats(userId: string): Promise<UserStats>;
}
