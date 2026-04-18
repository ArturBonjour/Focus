import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';

@Injectable()
export class TelegramService {
  constructor(private readonly tasksService: TasksService) {}

  async processCommand(userId: string, text: string) {
    const normalized = text.trim();

    if (normalized.startsWith('/add ')) {
      const title = normalized.replace('/add ', '').trim();
      const task = await this.tasksService.create(userId, { title });
      return { message: `Задача добавлена: ${task.title}`, task };
    }

    if (normalized === '/tasks') {
      const tasks = await this.tasksService.findAll(userId);
      return {
        message: tasks.length
          ? tasks
              .map(
                (task, index) => `${index + 1}. ${task.title} [${task.status}]`,
              )
              .join('\n')
          : 'Список задач пуст',
        tasks,
      };
    }

    return {
      message:
        'Команда не распознана. Поддерживаемые команды: /add <title>, /tasks. Интеграция готова к подключению реального Telegram webhook.',
    };
  }
}
