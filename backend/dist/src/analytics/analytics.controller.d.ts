import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { AnalyticsService, ProductivityPoint, RecommendationPayload } from './analytics.service';
export declare class AnalyticsController {
    private readonly analyticsService;
    constructor(analyticsService: AnalyticsService);
    getWeekly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getMonthly(user: JwtPayload): Promise<ProductivityPoint[]>;
    getRecommendations(user: JwtPayload): Promise<RecommendationPayload>;
}
