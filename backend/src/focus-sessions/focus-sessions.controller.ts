import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { FocusSessionsService } from './focus-sessions.service';
import { CreateFocusSessionDto } from './dto/create-focus-session.dto';

@ApiTags('focus-sessions')
@UseGuards(JwtAuthGuard)
@Controller('focus-sessions')
export class FocusSessionsController {
  constructor(private readonly focusSessionsService: FocusSessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get focus session history' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(@CurrentUser() user: JwtPayload, @Query('limit') limit?: string) {
    return this.focusSessionsService.findAll(
      user.sub,
      limit ? parseInt(limit, 10) : 50,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get focus session stats' })
  getStats(@CurrentUser() user: JwtPayload) {
    return this.focusSessionsService.getStats(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Save a completed focus session' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateFocusSessionDto) {
    return this.focusSessionsService.create(user.sub, dto);
  }
}
