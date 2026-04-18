import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { IsString, MinLength } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TelegramService } from './telegram.service';

class TelegramCommandDto {
  @IsString()
  @MinLength(2)
  text!: string;
}

@UseGuards(JwtAuthGuard)
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  @Post('command')
  processCommand(
    @CurrentUser() user: JwtPayload,
    @Body() dto: TelegramCommandDto,
  ): Promise<unknown> {
    return this.telegramService.processCommand(user.sub, dto.text);
  }
}
