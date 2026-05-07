import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFocusSessionDto {
  @ApiPropertyOptional() @IsString() @IsOptional() phase?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() taskTitle?: string;
  @ApiPropertyOptional() @IsNumber() @Min(1) @IsOptional() durationMin?: number;
}
