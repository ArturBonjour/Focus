import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    findAll(user: JwtPayload): Promise<unknown>;
    getStats(user: JwtPayload): Promise<unknown>;
    create(user: JwtPayload, dto: CreateTaskDto): Promise<unknown>;
    update(user: JwtPayload, id: string, dto: UpdateTaskDto): Promise<unknown>;
    remove(user: JwtPayload, id: string): Promise<unknown>;
}
