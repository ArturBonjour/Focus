import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateGoalDto {
  @ApiPropertyOptional()
  @IsString()
  @MaxLength(200)
  @IsOptional()
  title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() description?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() target?: number;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() current?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() unit?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() deadline?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() color?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() completed?: boolean;
}
