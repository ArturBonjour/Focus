import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly configService;
    constructor(authService: AuthService, jwtService: JwtService, configService: ConfigService);
    private setRefreshCookie;
    private clearRefreshCookie;
    register(dto: RegisterDto, res: Response): Promise<{
        accessToken: string;
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        accessToken: string;
    }>;
    refresh(req: Request, dto: Partial<RefreshDto>, res: Response): Promise<{
        accessToken: string;
    }>;
    logout(user: JwtPayload, res: Response): Promise<{
        success: boolean;
    }>;
}
