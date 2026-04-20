import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateHabitDto } from './dto/create-habit.dto';
import { TrackHabitDto } from './dto/track-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService, HabitStats } from './habits.service';

@ApiTags('habits')
@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all habits' })
  findAll(@CurrentUser() user: JwtPayload): Promise<unknown> {
    return this.habitsService.findAll(user.sub);
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get per-habit statistics (streak, completion rates, etc.)',
  })
  getStats(@CurrentUser() user: JwtPayload): Promise<HabitStats[]> {
    return this.habitsService.getStats(user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Create a habit' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateHabitDto,
  ): Promise<unknown> {
    return this.habitsService.create(user.sub, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a habit (full update)' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<unknown> {
    return this.habitsService.update(user.sub, id, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Partially update a habit (rename)' })
  patch(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<unknown> {
    return this.habitsService.update(user.sub, id, dto);
  }

  @Patch(':id/track')
  @ApiOperation({ summary: 'Mark habit as done for a day' })
  track(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TrackHabitDto,
  ): Promise<unknown> {
    return this.habitsService.track(user.sub, id, dto);
  }

  @Patch(':id/untrack')
  @ApiOperation({ summary: 'Remove habit completion mark for a day' })
  untrack(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TrackHabitDto,
  ): Promise<unknown> {
    return this.habitsService.untrack(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a habit' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.habitsService.remove(user.sub, id);
  }
}
