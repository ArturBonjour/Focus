import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({ example: 'OldPass123', description: 'Current password' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  currentPassword!: string;

  @ApiProperty({
    example: 'NewPass456',
    description: 'New password (min 8 chars)',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
