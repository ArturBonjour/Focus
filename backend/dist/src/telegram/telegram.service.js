"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TelegramService = void 0;
const common_1 = require("@nestjs/common");
const tasks_service_1 = require("../tasks/tasks.service");
let TelegramService = class TelegramService {
    tasksService;
    constructor(tasksService) {
        this.tasksService = tasksService;
    }
    async processCommand(userId, text) {
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
                        .map((task, index) => `${index + 1}. ${task.title} [${task.status}]`)
                        .join('\n')
                    : 'Список задач пуст',
                tasks,
            };
        }
        return {
            message: 'Команда не распознана. Поддерживаемые команды: /add <title>, /tasks. Интеграция готова к подключению реального Telegram webhook.',
        };
    }
};
exports.TelegramService = TelegramService;
exports.TelegramService = TelegramService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [tasks_service_1.TasksService])
], TelegramService);
//# sourceMappingURL=telegram.service.js.map