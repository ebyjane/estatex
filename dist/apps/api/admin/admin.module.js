"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const country_entity_1 = require("../entities/country.entity");
const property_image_entity_1 = require("../entities/property-image.entity");
const property_entity_1 = require("../entities/property.entity");
const user_entity_1 = require("../entities/user.entity");
const lead_entity_1 = require("../entities/lead.entity");
const seo_page_entity_1 = require("../entities/seo-page.entity");
const app_settings_entity_1 = require("../entities/app-settings.entity");
const investment_entity_1 = require("../entities/investment.entity");
const admin_controller_1 = require("./admin.controller");
const admin_panel_controller_1 = require("./admin-panel.controller");
const admin_upload_controller_1 = require("./admin-upload.controller");
const demo_seed_service_1 = require("./demo-seed.service");
const admin_panel_service_1 = require("./admin-panel.service");
const properties_module_1 = require("../properties/properties.module");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            properties_module_1.PropertiesModule,
            typeorm_1.TypeOrmModule.forFeature([
                country_entity_1.CountryEntity,
                user_entity_1.UserEntity,
                property_entity_1.PropertyEntity,
                property_image_entity_1.PropertyImageEntity,
                lead_entity_1.LeadEntity,
                seo_page_entity_1.SeoPageEntity,
                app_settings_entity_1.AppSettingsEntity,
                investment_entity_1.InvestmentEntity,
            ]),
        ],
        controllers: [admin_controller_1.AdminController, admin_panel_controller_1.AdminPanelController, admin_upload_controller_1.AdminUploadController],
        providers: [demo_seed_service_1.DemoSeedService, admin_panel_service_1.AdminPanelService],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map