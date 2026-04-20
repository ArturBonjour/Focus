import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SubtaskDto {
  @IsString()
  id!: string;

  @IsString()
  @MaxLength(200)
  title!: string;

  @IsBoolean()
  done!: boolean;
}

export class CreateTaskDto {
  @ApiProperty({ example: 'Finish project report', maxLength: 120 })
  @IsString()
  @MaxLength(120)
  title!: string;

  @ApiPropertyOptional({
    example: 'Q1 2025 productivity analysis',
    maxLength: 2000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ enum: TaskPriority, default: TaskPriority.MEDIUM })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;

  @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @ApiPropertyOptional({ example: '2025-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsDateString()
  deadline?: string;

  @ApiPropertyOptional({ type: [String], example: ['work', 'urgent'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(30, { each: true })
  tags?: string[];

  @ApiPropertyOptional({ type: [SubtaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubtaskDto)
  subtasks?: SubtaskDto[];
}

// Explicit guard for unknown subtask shapes coming from DB
export function isSubtaskDto(v: unknown): v is SubtaskDto {
  return (
    typeof v === 'object' &&
    v !== null &&
    !Array.isArray(v) &&
    typeof (v as Record<string, unknown>)['id'] === 'string' &&
    typeof (v as Record<string, unknown>)['title'] === 'string' &&
    typeof (v as Record<string, unknown>)['done'] === 'boolean'
  );
}
