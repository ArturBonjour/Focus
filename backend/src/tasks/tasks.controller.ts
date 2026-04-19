import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { TasksService } from './tasks.service';

@ApiTags('tasks')
@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get tasks with optional filtering' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false })
  @ApiQuery({ name: 'priority', enum: TaskPriority, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('status') status?: TaskStatus,
    @Query('priority') priority?: TaskPriority,
    @Query('search') search?: string,
  ): Promise<unknown> {
    return this.tasksService.findAll(user.sub, { status, priority, search });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics by status and priority' })
  getStats(@CurrentUser() user: JwtPayload): Promise<unknown> {
    return this.tasksService.getStats(user.sub);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all tasks as JSON file' })
  async export(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
  ): Promise<void> {
    const tasks = await this.tasksService.findAll(user.sub, {});
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks-${new Date().toISOString().slice(0, 10)}.json"`,
    );
    res.send(JSON.stringify(tasks, null, 2));
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTaskDto,
  ): Promise<unknown> {
    return this.tasksService.create(user.sub, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Quick status update for a task' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskStatusDto,
  ): Promise<unknown> {
    return this.tasksService.update(user.sub, id, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<unknown> {
    return this.tasksService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.tasksService.remove(user.sub, id);
  }

  @Post(':id/duplicate')
  @ApiOperation({ summary: 'Duplicate a task' })
  duplicate(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.tasksService.duplicate(user.sub, id);
  }
}
