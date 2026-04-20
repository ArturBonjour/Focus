import { IsArray, IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional() @IsString() @MaxLength(200) @IsOptional() title?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() content?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() mood?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() color?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() pinned?: boolean;
  @ApiPropertyOptional() @IsArray() @IsString({ each: true }) @IsOptional() tags?: string[];
}
