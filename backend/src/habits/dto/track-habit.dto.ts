import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class TrackHabitDto {
  @ApiProperty({ example: '2025-04-19' })
  @IsDateString()
  date!: string;
}
