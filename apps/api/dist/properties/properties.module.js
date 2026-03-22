"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("../auth/auth.module");
const property_entity_1 = require("../entities/property.entity");
const property_image_entity_1 = require("../entities/property-image.entity");
const country_entity_1 = require("../entities/country.entity");
const lead_entity_1 = require("../entities/lead.entity");
const user_entity_1 = require("../entities/user.entity");
const properties_controller_1 = require("./properties.controller");
const leads_controller_1 = require("./leads.controller");
const properties_service_1 = require("./properties.service");
const ai_service_1 = require("./ai.service");
const ai_score_service_1 = require("../ai/ai-score.service");
let PropertiesModule = class PropertiesModule {
};
exports.PropertiesModule = PropertiesModule;
exports.PropertiesModule = PropertiesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            typeorm_1.TypeOrmModule.forFeature([property_entity_1.PropertyEntity, property_image_entity_1.PropertyImageEntity, country_entity_1.CountryEntity, lead_entity_1.LeadEntity, user_entity_1.UserEntity]),
        ],
        controllers: [properties_controller_1.PropertiesController, leads_controller_1.LeadsController],
        providers: [properties_service_1.PropertiesService, ai_service_1.AiService, ai_score_service_1.AiScoreService],
        exports: [properties_service_1.PropertiesService],
    })
], PropertiesModule);
//# sourceMappingURL=properties.module.js.map