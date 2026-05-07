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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const register_dto_1 = require("./dto/register.dto");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const REFRESH_COOKIE = 'nt_refresh';
const REFRESH_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
let AuthController = class AuthController {
    authService;
    jwtService;
    configService;
    constructor(authService, jwtService, configService) {
        this.authService = authService;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    setRefreshCookie(res, token) {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        res.cookie(REFRESH_COOKIE, token, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax',
            path: '/api/auth',
            maxAge: REFRESH_COOKIE_MAX_AGE * 1000,
        });
    }
    clearRefreshCookie(res) {
        res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    }
    async register(dto, res) {
        const tokens = await this.authService.register(dto);
        this.setRefreshCookie(res, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }
    async login(dto, res) {
        const tokens = await this.authService.login(dto);
        this.setRefreshCookie(res, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }
    async refresh(req, dto, res) {
        const rawToken = req.cookies[REFRESH_COOKIE] ??
            dto.refreshToken;
        if (!rawToken) {
            const { UnauthorizedException } = await import('@nestjs/common');
            throw new UnauthorizedException('Refresh token missing');
        }
        const payload = await this.jwtService.verifyAsync(rawToken, {
            secret: this.configService.get('JWT_REFRESH_SECRET', 'dev-refresh-secret'),
        });
        const tokens = await this.authService.refresh(payload.sub, rawToken);
        this.setRefreshCookie(res, tokens.refreshToken);
        return { accessToken: tokens.accessToken };
    }
    async logout(user, res) {
        this.clearRefreshCookie(res);
        return this.authService.logout(user.sub);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    (0, throttler_1.Throttle)({ default: { ttl: 60_000, limit: 5 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Register a new user' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    (0, throttler_1.Throttle)({ default: { ttl: 60_000, limit: 10 } }),
    (0, swagger_1.ApiOperation)({ summary: 'Login and get JWT tokens' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token (cookie or body)' }),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Logout: invalidate refresh token & clear cookie' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map