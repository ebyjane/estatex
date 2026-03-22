import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { PropertyEntity } from '../entities/property.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { CountryEntity } from '../entities/country.entity';
import { LeadEntity } from '../entities/lead.entity';
import { UserEntity } from '../entities/user.entity';
import { PropertiesController } from './properties.controller';
import { LeadsController } from './leads.controller';
import { PropertiesService } from './properties.service';
import { AiService } from './ai.service';
import { AiScoreService } from '../ai/ai-score.service';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([PropertyEntity, PropertyImageEntity, CountryEntity, LeadEntity, UserEntity]),
  ],
  controllers: [PropertiesController, LeadsController],
  providers: [PropertiesService, AiService, AiScoreService],
  exports: [PropertiesService],
})
export class PropertiesModule {}
