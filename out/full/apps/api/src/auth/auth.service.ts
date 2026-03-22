import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    private jwtService: JwtService,
  ) {}

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
    const user = await this.userRepo.findOne({ where: { email } });
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
