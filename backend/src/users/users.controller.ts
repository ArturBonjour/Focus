import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { UsersService } from './users.service';

interface UserProfile {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@ApiTags('users')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async me(@CurrentUser() user: JwtPayload): Promise<UserProfile | null> {
    const found = await this.usersService.findById(user.sub);
    if (!found) return null;
    return {
      id: found.id,
      email: found.email,
      createdAt: found.createdAt,
      updatedAt: found.updatedAt,
    };
  }
}
