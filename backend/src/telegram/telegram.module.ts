import { Module } from '@nestjs/common';
import { TasksModule } from '../tasks/tasks.module';
import { TelegramService } from './telegram.service';
import { TelegramController } from './telegram.controller';

@Module({
  imports: [TasksModule],
  providers: [TelegramService],
  controllers: [TelegramController],
})
export class TelegramModule {}
