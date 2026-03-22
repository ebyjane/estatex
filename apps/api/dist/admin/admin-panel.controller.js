"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminPanelController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const admin_role_guard_1 = require("../auth/guards/admin-role.guard");
const properties_service_1 = require("../properties/properties.service");
const admin_panel_service_1 = require("./admin-panel.service");
let AdminPanelController = class AdminPanelController {
    constructor(panel, properties) {
        this.panel = panel;
        this.properties = properties;
    }
    overview() {
        return this.panel.overview();
    }
    ingestionLogs() {
        return { data: this.panel.getIngestionLogs() };
    }
    logIngestion(body) {
        this.panel.pushIngestion(body.action || 'event', body.detail || '');
        return { ok: true };
    }
    listProperties(page, limit, city, minPrice, maxPrice, minAi, listingType, status) {
        return this.panel.listProperties({
            page: page ? +page : 1,
            limit: limit ? +limit : 20,
            city,
            minPrice: minPrice ? +minPrice : undefined,
            maxPrice: maxPrice ? +maxPrice : undefined,
            minAi: minAi ? +minAi : undefined,
            listingType,
            status,
        });
    }
    getProperty(id) {
        return this.panel.getPropertyAdmin(id);
    }
    patchProperty(id, body) {
        return this.panel.patchProperty(id, body);
    }
    deleteProperty(id) {
        return this.panel.deleteProperty(id);
    }
    listUsers(page, limit) {
        return this.panel.listUsers(page ? +page : 1, limit ? +limit : 20);
    }
    patchUser(id, body) {
        return this.panel.patchUser(id, body);
    }
    listLeads(page, limit) {
        return this.panel.listLeads(page ? +page : 1, limit ? +limit : 30);
    }
    patchLead(id, body) {
        return this.panel.patchLead(id, body);
    }
    listSeo() {
        return this.panel.listSeo();
    }
    upsertSeo(body) {
        return this.panel.upsertSeo(body);
    }
    deleteSeo(id) {
        return this.panel.deleteSeo(id);
    }
    getSettings() {
        return this.panel.getSettings();
    }
    patchSettings(body) {
        return this.panel.patchSettings(body);
    }
    submitListing(body) {
        return this.properties.submitPublicListing(body, { maxImages: 500, allowMultiVideo: true });
    }
};
exports.AdminPanelController = AdminPanelController;
__decorate([
    (0, common_1.Get)('overview'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "overview", null);
__decorate([
    (0, common_1.Get)('ingestion-logs'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "ingestionLogs", null);
__decorate([
    (0, common_1.Post)('ingestion-log'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "logIngestion", null);
__decorate([
    (0, common_1.Get)('properties'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('city')),
    __param(3, (0, common_1.Query)('minPrice')),
    __param(4, (0, common_1.Query)('maxPrice')),
    __param(5, (0, common_1.Query)('minAi')),
    __param(6, (0, common_1.Query)('listingType')),
    __param(7, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "listProperties", null);
__decorate([
    (0, common_1.Get)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "getProperty", null);
__decorate([
    (0, common_1.Patch)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "patchProperty", null);
__decorate([
    (0, common_1.Delete)('properties/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "deleteProperty", null);
__decorate([
    (0, common_1.Get)('users'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Patch)('users/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "patchUser", null);
__decorate([
    (0, common_1.Get)('leads'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "listLeads", null);
__decorate([
    (0, common_1.Patch)('leads/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "patchLead", null);
__decorate([
    (0, common_1.Get)('seo'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "listSeo", null);
__decorate([
    (0, common_1.Post)('seo'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "upsertSeo", null);
__decorate([
    (0, common_1.Delete)('seo/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "deleteSeo", null);
__decorate([
    (0, common_1.Get)('settings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "getSettings", null);
__decorate([
    (0, common_1.Patch)('settings'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "patchSettings", null);
__decorate([
    (0, common_1.Post)('submit-listing'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AdminPanelController.prototype, "submitListing", null);
exports.AdminPanelController = AdminPanelController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_role_guard_1.AdminRoleGuard),
    __metadata("design:paramtypes", [admin_panel_service_1.AdminPanelService,
        properties_service_1.PropertiesService])
], AdminPanelController);
//# sourceMappingURL=admin-panel.controller.js.map