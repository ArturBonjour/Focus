import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  AnalyticsService,
  AnalyticsSummary,
  HeatmapDay,
  ProductivityPoint,
  RecommendationPayload,
  TrendsPayload,
} from './analytics.service';

@ApiTags('analytics')
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('weekly')
  @ApiOperation({ summary: 'Get weekly productivity chart data' })
  getWeekly(@CurrentUser() user: JwtPayload): Promise<ProductivityPoint[]> {
    return this.analyticsService.getWeekly(user.sub);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Get monthly productivity chart data' })
  getMonthly(@CurrentUser() user: JwtPayload): Promise<ProductivityPoint[]> {
    return this.analyticsService.getMonthly(user.sub);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Get comprehensive analytics summary' })
  getSummary(@CurrentUser() user: JwtPayload): Promise<AnalyticsSummary> {
    return this.analyticsService.getSummary(user.sub);
  }

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered behaviour recommendations' })
  getRecommendations(
    @CurrentUser() user: JwtPayload,
  ): Promise<RecommendationPayload> {
    return this.analyticsService.getRecommendations(user.sub);
  }

  @Get('trends')
  @ApiOperation({ summary: 'Week-over-week trends comparison' })
  getTrends(@CurrentUser() user: JwtPayload): Promise<TrendsPayload> {
    return this.analyticsService.getTrends(user.sub);
  }

  @Get('heatmap')
  @ApiOperation({
    summary: 'Full-year GitHub-style activity heatmap (tasks + habits)',
  })
  getHeatmap(@CurrentUser() user: JwtPayload): Promise<HeatmapDay[]> {
    return this.analyticsService.getHeatmap(user.sub);
  }
}
