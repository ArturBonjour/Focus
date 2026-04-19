import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AnalyticsService, AnalyticsSummary, ProductivityPoint, RecommendationPayload, TrendsPayload } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getWeekly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getMonthly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getSummary(user: JwtPayload): Promise<AnalyticsSummary>;
    getRecommendations(user: JwtPayload): Promise<RecommendationPayload>;
    getTrends(user: JwtPayload): Promise<TrendsPayload>;
}
