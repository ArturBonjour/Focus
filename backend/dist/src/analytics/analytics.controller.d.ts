import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AnalyticsService, AnalyticsSummary, HeatmapDay, OverviewPayload, ProductivityPoint, RecommendationPayload, TrendsPayload } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getOverview(user: JwtPayload): Promise<OverviewPayload>;
    getWeekly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getMonthly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getSummary(user: JwtPayload): Promise<AnalyticsSummary>;
    getRecommendations(user: JwtPayload): Promise<RecommendationPayload>;
    getTrends(user: JwtPayload): Promise<TrendsPayload>;
    getHeatmap(user: JwtPayload): Promise<HeatmapDay[]>;
}
