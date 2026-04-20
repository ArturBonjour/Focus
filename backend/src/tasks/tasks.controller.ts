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
import { TasksService, BulkUpdateDto } from './tasks.service';

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

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get tasks with deadline in the next N days (default 7)',
  })
  @ApiQuery({ name: 'days', type: Number, required: false })
  findUpcoming(
    @CurrentUser() user: JwtPayload,
    @Query('days') days?: string,
  ): Promise<unknown> {
    return this.tasksService.findUpcoming(
      user.sub,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all tasks as JSON or CSV file' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  async export(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
    @Query('format') format?: 'json' | 'csv',
  ): Promise<void> {
    const tasks = await this.tasksService.findAll(user.sub, {});
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const header =
        'id,title,description,priority,status,tags,deadline,createdAt,completedAt\n';
      const rows = tasks
        .map((t) =>
          [
            t.id,
            `"${(t.title ?? '').replace(/"/g, '""')}"`,
            `"${(t.description ?? '').replace(/"/g, '""')}"`,
            t.priority,
            t.status,
            `"${(t.tags ?? []).join(';')}"`,
            t.deadline ? new Date(t.deadline).toISOString() : '',
            new Date(t.createdAt).toISOString(),
            t.completedAt ? new Date(t.completedAt).toISOString() : '',
          ].join(','),
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="tasks-${date}.csv"`,
      );
      res.send(header + rows);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks-${date}.json"`,
    );
    res.send(JSON.stringify(tasks, null, 2));
  }

  @Patch('bulk')
  @ApiOperation({ summary: 'Bulk update or delete tasks by IDs' })
  bulkUpdate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: BulkUpdateDto,
  ): Promise<unknown> {
    return this.tasksService.bulkUpdate(user.sub, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateTaskDto,
  ): Promise<unknown> {
    return this.tasksService.create(user.sub, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.tasksService.findOne(user.sub, id);
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

  @Get('upcoming')
  @ApiOperation({
    summary: 'Get tasks with deadline in the next N days (default 7)',
  })
  @ApiQuery({ name: 'days', type: Number, required: false })
  findUpcoming(
    @CurrentUser() user: JwtPayload,
    @Query('days') days?: string,
  ): Promise<unknown> {
    return this.tasksService.findUpcoming(
      user.sub,
      days ? parseInt(days, 10) : 7,
    );
  }

  @Get('export')
  @ApiOperation({ summary: 'Export all tasks as JSON or CSV file' })
  @ApiQuery({ name: 'format', enum: ['json', 'csv'], required: false })
  async export(
    @CurrentUser() user: JwtPayload,
    @Res() res: Response,
    @Query('format') format?: 'json' | 'csv',
  ): Promise<void> {
    const tasks = await this.tasksService.findAll(user.sub, {});
    const date = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const header =
        'id,title,description,priority,status,deadline,createdAt,completedAt\n';
      const rows = tasks
        .map((t) =>
          [
            t.id,
            `"${(t.title ?? '').replace(/"/g, '""')}"`,
            `"${(t.description ?? '').replace(/"/g, '""')}"`,
            t.priority,
            t.status,
            t.deadline ? new Date(t.deadline).toISOString() : '',
            new Date(t.createdAt).toISOString(),
            t.completedAt ? new Date(t.completedAt).toISOString() : '',
          ].join(','),
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="tasks-${date}.csv"`,
      );
      res.send(header + rows);
      return;
    }

    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="tasks-${date}.json"`,
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

  @Get(':id')
  @ApiOperation({ summary: 'Get a single task by ID' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
  ): Promise<unknown> {
    return this.tasksService.findOne(user.sub, id);
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
