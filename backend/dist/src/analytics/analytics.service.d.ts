import { PrismaService } from '../prisma/prisma.service';
export interface ProductivityPoint {
    date: string;
    completedTasksCount: number;
    totalTasksCount: number;
}
export interface RecommendationPayload {
    recommendations: string[];
    activityBuckets?: {
        morning: number;
        afternoon: number;
        evening: number;
        night: number;
    };
}
export interface AnalyticsSummary {
    tasks: {
        total: number;
        done: number;
        inProgress: number;
        todo: number;
        overdue: number;
        completionRate: number;
        avgCompletionDays: number | null;
    };
    habits: {
        total: number;
        totalStreakDays: number;
        longestStreak: number;
        avgStreak: number;
    };
    productivity: {
        bestDayOfWeek: string | null;
        avgDailyCompleted: number;
        peakHour: string | null;
    };
}
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWeekly(userId: string): Promise<ProductivityPoint[]>;
    getMonthly(userId: string): Promise<ProductivityPoint[]>;
    getSummary(userId: string): Promise<AnalyticsSummary>;
    getRecommendations(userId: string): Promise<RecommendationPayload>;
    private getForPeriod;
    getTrends(userId: string): Promise<TrendsPayload>;
}
export interface TrendsPayload {
    completedTasks: {
        current: number;
        previous: number;
        changePercent: number;
    };
    totalTasks: {
        current: number;
        previous: number;
        changePercent: number;
    };
    habitCompletions: {
        current: number;
        previous: number;
        changePercent: number;
    };
    trend: 'up' | 'down' | 'neutral';
}
