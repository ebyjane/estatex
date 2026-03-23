import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { InvestmentEntity } from '../entities/investment.entity';
import { InvestmentsController } from './investments.controller';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([InvestmentEntity])],
  controllers: [InvestmentsController],
})
export class InvestmentsModule {}
