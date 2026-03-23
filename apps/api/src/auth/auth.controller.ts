import { Body, Controller, Get, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';

class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  investorType?: string;

  @IsOptional()
  @IsString()
  preferredCurrency?: string;
}

class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.auth.login(dto.email, dto.password);
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      console.error('POST /auth/login', error);
      return {
        success: false,
        data: null,
        message: error instanceof Error ? error.message : 'Login failed',
        accessToken: null,
        user: null,
      };
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@CurrentUser() user: { id: string }) {
    return this.auth.validateUser(user.id).then((u) => (u ? this.auth.sanitize(u) : null));
  }
}
