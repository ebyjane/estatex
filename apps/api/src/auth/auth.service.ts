import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';

/** Ensured on first admin login if missing; password from env or default demo. */
const DEFAULT_ADMIN_EMAIL = 'admin@estatex.ai';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

  /** Creates default admin once if absent (idempotent; safe for concurrent first logins). */
  private async ensureDefaultAdminUser(): Promise<void> {
    const existing = await this.userRepo.findOne({
      where: { email: DEFAULT_ADMIN_EMAIL },
    });
    if (existing) return;

    const plain =
      process.env.ADMIN_BOOTSTRAP_PASSWORD?.trim() || 'admin123';
    const hash = await bcrypt.hash(plain, 10);
    const admin = this.userRepo.create({
      email: DEFAULT_ADMIN_EMAIL,
      passwordHash: hash,
      firstName: 'Admin',
      role: 'admin',
    });
    try {
      await this.userRepo.save(admin);
    } catch (e) {
      if (!this.isPostgresUniqueViolation(e)) throw e;
    }
  }

  private isPostgresUniqueViolation(err: unknown): boolean {
    if (!(err instanceof QueryFailedError)) return false;
    const code = (err.driverError as { code?: string } | undefined)?.code;
    return code === '23505';
  }

  async register(dto: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    investorType?: string;
    preferredCurrency?: string;
  }) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) throw new UnauthorizedException('Email already registered');
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

  async login(email: string, password: string) {
    if (!email || !password) throw new UnauthorizedException('Invalid credentials');
    const emailTrim = email.trim();
    const isAdminLogin =
      emailTrim.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase();
    if (isAdminLogin) await this.ensureDefaultAdminUser();

    const user = await this.userRepo.findOne({
      where: isAdminLogin ? { email: DEFAULT_ADMIN_EMAIL } : { email: emailTrim },
    });
    if (!user || !user.passwordHash) throw new UnauthorizedException('Invalid credentials');
    if (user.accountStatus === 'blocked') throw new UnauthorizedException('Account suspended');
    const ok = await bcrypt.compare(String(password), String(user.passwordHash));
    if (!ok) throw new UnauthorizedException('Invalid credentials');
    return this.loginResponse(user);
  }

  async validateUser(id: string): Promise<UserEntity | null> {
    return this.userRepo.findOne({ where: { id } });
  }

  private loginResponse(user: UserEntity) {
    const payload = { sub: user.id, email: user.email };
    return {
      user: this.sanitize(user),
      accessToken: this.jwtService.sign(payload),
      expiresIn: 604800, // 7 days in seconds
    };
  }

  sanitize(user: UserEntity) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}
