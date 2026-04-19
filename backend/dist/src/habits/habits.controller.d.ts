import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { CreateHabitDto } from './dto/create-habit.dto';
import { TrackHabitDto } from './dto/track-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { HabitsService } from './habits.service';
export declare class HabitsController {
    private readonly habitsService;
    constructor(habitsService: HabitsService);
    findAll(user: JwtPayload): Promise<unknown>;
    create(user: JwtPayload, dto: CreateHabitDto): Promise<unknown>;
    update(user: JwtPayload, id: string, dto: UpdateHabitDto): Promise<unknown>;
    track(user: JwtPayload, id: string, dto: TrackHabitDto): Promise<unknown>;
    untrack(user: JwtPayload, id: string, dto: TrackHabitDto): Promise<unknown>;
    remove(user: JwtPayload, id: string): Promise<unknown>;
}
