import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CompareController } from './compare.controller';
import { CompareService } from './compare.service';
import { FxModule } from '../fx/fx.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PropertyEntity]),
    FxModule,
  ],
  controllers: [CompareController],
  providers: [CompareService],
})
export class CompareModule {}
