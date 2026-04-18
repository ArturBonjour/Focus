import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  AnalyticsService,
  ProductivityPoint,
  RecommendationPayload,
} from './analytics.service';

@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  getWeekly(@CurrentUser() user: JwtPayload): Promise<ProductivityPoint[]> {
    return this.analyticsService.getWeekly(user.sub);
  }

  @Get('monthly')
  getMonthly(@CurrentUser() user: JwtPayload): Promise<ProductivityPoint[]> {
    return this.analyticsService.getMonthly(user.sub);
  }

  @Get('recommendations')
  getRecommendations(
    @CurrentUser() user: JwtPayload,
  ): Promise<RecommendationPayload> {
    return this.analyticsService.getRecommendations(user.sub);
  }
}
