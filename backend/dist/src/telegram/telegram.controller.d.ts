import type { JwtPayload } from '../auth/strategies/jwt.strategy';
import { TelegramService } from './telegram.service';
declare class TelegramCommandDto {
    text: string;
}
export declare class TelegramController {
    private readonly telegramService;
    constructor(telegramService: TelegramService);
    processCommand(user: JwtPayload, dto: TelegramCommandDto): Promise<unknown>;
}
export {};
