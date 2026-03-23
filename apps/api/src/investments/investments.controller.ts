import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Req } from '@nestjs/common';
import type { Request } from 'express';
import { InvestmentEntity } from '../entities/investment.entity';

type JwtUser = { id: string };

@Controller('investments')
export class InvestmentsController {
  constructor(
    @InjectRepository(InvestmentEntity)
    private readonly repo: Repository<InvestmentEntity>,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async list(@Req() req: Request & { user: JwtUser }) {
    const userId = req.user?.id;
    const rows = await this.repo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return { data: rows };
  }
}
