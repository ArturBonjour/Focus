import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { JwtPayload } from './strategies/jwt.strategy';

/** Cookie name for the long-lived refresh token */
const REFRESH_COOKIE = 'nt_refresh';

/** Max-Age in seconds matching JWT_REFRESH_EXPIRES_IN = 7d */
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  private setRefreshCookie(res: Response, token: string): void {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    res.cookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      path: '/api/auth',
      maxAge: REFRESH_COOKIE_MAX_AGE * 1000,
    });
  }

  private clearRefreshCookie(res: Response): void {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.register(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and get JWT tokens' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    const tokens = await this.authService.login(dto);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token (cookie or body)' })
  async refresh(
    @Req() req: Request,
    @Body() dto: Partial<RefreshDto>,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ accessToken: string }> {
    // Accept refresh token from httpOnly cookie first, then body fallback
    const rawToken =
      (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE] ??
      dto.refreshToken;

    if (!rawToken) {
      const { UnauthorizedException } = await import('@nestjs/common');
      throw new UnauthorizedException('Refresh token missing');
    }

    const payload = await this.jwtService.verifyAsync<{ sub: string }>(
      rawToken,
      {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'dev-refresh-secret',
        ),
      },
    );

    const tokens = await this.authService.refresh(payload.sub, rawToken);
    this.setRefreshCookie(res, tokens.refreshToken);
    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout: invalidate refresh token & clear cookie' })
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ success: boolean }> {
    this.clearRefreshCookie(res);
    return this.authService.logout(user.sub);
  }
}
