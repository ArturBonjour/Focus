import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService, Tokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import type { JwtPayload } from './strategies/jwt.strategy';
export declare class AuthController {
    private readonly authService;
    private readonly jwtService;
    private readonly configService;
    constructor(authService: AuthService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<Tokens>;
    login(dto: LoginDto): Promise<Tokens>;
    refresh(dto: RefreshDto): Promise<Tokens>;
    logout(user: JwtPayload): Promise<{
        success: boolean;
    }>;
}
