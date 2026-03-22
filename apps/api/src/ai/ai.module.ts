import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PropertyEntity } from '../entities/property.entity';
import { CountryEntity } from '../entities/country.entity';
import { AiScoreService } from './ai-score.service';
import { AiSearchService } from './ai-search.service';
import { AiController } from './ai.controller';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([PropertyEntity, CountryEntity])],
  controllers: [AiController],
  providers: [AiScoreService, AiSearchService],
  exports: [AiScoreService, AiSearchService],
})
export class AiModule {}
