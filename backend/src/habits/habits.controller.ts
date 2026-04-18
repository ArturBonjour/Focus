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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateHabitDto } from './dto/create-habit.dto';
import { TrackHabitDto } from './dto/track-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Get()
  findAll(@CurrentUser() user: JwtPayload): Promise<unknown> {
    return this.habitsService.findAll(user.sub);
  }

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateHabitDto,
  ): Promise<unknown> {
    return this.habitsService.create(user.sub, dto);
  }

  @Put(':id')
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateHabitDto,
  ): Promise<unknown> {
    return this.habitsService.update(user.sub, id, dto);
  }

  @Patch(':id/track')
  track(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: TrackHabitDto,
  ): Promise<unknown> {
    return this.habitsService.track(user.sub, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.habitsService.remove(user.sub, id);
  }
}
