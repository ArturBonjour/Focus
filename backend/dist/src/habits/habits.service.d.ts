import { PrismaService } from '../prisma/prisma.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { TrackHabitDto } from './dto/track-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
export declare class HabitsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): import("@prisma/client").Prisma.PrismaPromise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        streak: number;
        completedDays: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    create(userId: string, dto: CreateHabitDto): import("@prisma/client").Prisma.Prisma__HabitClient<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        streak: number;
        completedDays: import("@prisma/client/runtime/library").JsonValue;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    update(userId: string, habitId: string, dto: UpdateHabitDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        streak: number;
        completedDays: import("@prisma/client/runtime/library").JsonValue;
    }>;
    track(userId: string, habitId: string, dto: TrackHabitDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        streak: number;
        completedDays: import("@prisma/client/runtime/library").JsonValue;
    }>;
    untrack(userId: string, habitId: string, dto: TrackHabitDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        streak: number;
        completedDays: import("@prisma/client/runtime/library").JsonValue;
    }>;
    getStats(userId: string): Promise<HabitStats[]>;
    remove(userId: string, habitId: string): Promise<{
        success: boolean;
    }>;
    private ensureOwnership;
    private extractDays;
    private calculateStreak;
}
export interface HabitStats {
    id: string;
    name: string;
    streak: number;
    longestStreak: number;
    totalDays: number;
    completionRate30d: number;
    completedLast7: number;
    completedToday: boolean;
}
