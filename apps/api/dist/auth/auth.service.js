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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const DEFAULT_ADMIN_EMAIL = 'admin@estatex.ai';
let AuthService = class AuthService {
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    async ensureDefaultAdminUser() {
        const existing = await this.userRepo.findOne({
            where: { email: DEFAULT_ADMIN_EMAIL },
        });
        if (existing)
            return;
        const plain = process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || 'admin123';
        const hash = await bcrypt.hash(plain, 10);
        const admin = this.userRepo.create({
            email: DEFAULT_ADMIN_EMAIL,
            passwordHash: hash,
            firstName: 'Admin',
            role: 'admin',
        });
        try {
            await this.userRepo.save(admin);
        }
        catch (e) {
            if (!this.isPostgresUniqueViolation(e))
                throw e;
        }
    }
    isPostgresUniqueViolation(err) {
        if (!(err instanceof typeorm_2.QueryFailedError))
            return false;
        const code = err.driverError?.code;
        return code === '23505';
    }
    async register(dto) {
        const existing = await this.userRepo.findOne({ where: { email: dto.email } });
        if (existing)
            throw new common_1.UnauthorizedException('Email already registered');
        const hash = await bcrypt.hash(dto.password, 10);
        const user = this.userRepo.create({
            email: dto.email,
            passwordHash: hash,
            firstName: dto.firstName,
            lastName: dto.lastName,
            investorType: dto.investorType,
            preferredCurrency: dto.preferredCurrency || 'USD',
            role: 'buyer',
        });
        await this.userRepo.save(user);
        return this.loginResponse(user);
    }
    async login(email, password) {
        if (!email || !password)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const emailTrim = email.trim();
        const isAdminLogin = emailTrim.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
        if (isAdminLogin)
            await this.ensureDefaultAdminUser();
        const user = await this.userRepo.findOne({
            where: isAdminLogin ? { email: DEFAULT_ADMIN_EMAIL } : { email: emailTrim },
        });
        if (!user || !user.passwordHash)
            throw new common_1.UnauthorizedException('Invalid credentials');
        if (user.accountStatus === 'blocked')
            throw new common_1.UnauthorizedException('Account suspended');
        const ok = await bcrypt.compare(String(password), String(user.passwordHash));
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        return this.loginResponse(user);
    }
    async validateUser(id) {
        return this.userRepo.findOne({ where: { id } });
    }
    loginResponse(user) {
        const payload = { sub: user.id, email: user.email };
        return {
            user: this.sanitize(user),
            accessToken: this.jwtService.sign(payload),
            expiresIn: 604800,
        };
    }
    sanitize(user) {
        const { passwordHash, ...rest } = user;
        return rest;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository, typeof (_a = typeof jwt_1.JwtService !== "undefined" && jwt_1.JwtService) === "function" ? _a : Object])
], AuthService);
//# sourceMappingURL=auth.service.js.map