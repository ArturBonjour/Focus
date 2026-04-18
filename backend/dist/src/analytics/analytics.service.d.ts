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
export declare class AnalyticsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getWeekly(userId: string): Promise<ProductivityPoint[]>;
    getMonthly(userId: string): Promise<ProductivityPoint[]>;
    getRecommendations(userId: string): Promise<RecommendationPayload>;
    private getForPeriod;
}
