import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import {
  AnalyticsService,
  ProductivityPoint,
  RecommendationPayload,
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

  @Get('recommendations')
  @ApiOperation({ summary: 'Get AI-powered behaviour recommendations' })
  getRecommendations(
    @CurrentUser() user: JwtPayload,
  ): Promise<RecommendationPayload> {
    return this.analyticsService.getRecommendations(user.sub);
  }
}
