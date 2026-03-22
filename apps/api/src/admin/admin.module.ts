import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CountryEntity } from '../entities/country.entity';
import { PropertyImageEntity } from '../entities/property-image.entity';
import { PropertyEntity } from '../entities/property.entity';
import { UserEntity } from '../entities/user.entity';
import { LeadEntity } from '../entities/lead.entity';
import { SeoPageEntity } from '../entities/seo-page.entity';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { AdminController } from './admin.controller';
import { AdminPanelController } from './admin-panel.controller';
import { AdminUploadController } from './admin-upload.controller';
import { DemoSeedService } from './demo-seed.service';
import { AdminPanelService } from './admin-panel.service';
import { PropertiesModule } from '../properties/properties.module';

@Module({
  imports: [
    AuthModule,
    PropertiesModule,
    TypeOrmModule.forFeature([
      CountryEntity,
      UserEntity,
      PropertyEntity,
      PropertyImageEntity,
      LeadEntity,
      SeoPageEntity,
      AppSettingsEntity,
    ]),
  ],
  controllers: [AdminController, AdminPanelController, AdminUploadController],
  providers: [DemoSeedService, AdminPanelService],
})
export class AdminModule {}
