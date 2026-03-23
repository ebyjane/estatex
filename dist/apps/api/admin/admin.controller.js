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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const demo_seed_service_1 = require("./demo-seed.service");
const admin_panel_service_1 = require("./admin-panel.service");
let AdminController = class AdminController {
    constructor(demoSeed, panel) {
        this.demoSeed = demoSeed;
        this.panel = panel;
    }
    seed(body, secret) {
        this.demoSeed.assertCanRunRemote(secret);
        const mode = body?.mode?.toLowerCase();
        if (mode === 'indiarent' || mode === 'india-rent' || mode === 'india_rent') {
            return this.demoSeed.runIndiaRent5000().then((r) => {
                this.panel.pushIngestion('seed', `India rent: ${r.message ?? 'ok'}`);
                return r;
            });
        }
        return this.demoSeed.run().then((r) => {
            this.panel.pushIngestion('seed', r.message ?? 'demo seed');
            return r;
        });
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Post)('seed'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Headers)('x-demo-seed-secret')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "seed", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [demo_seed_service_1.DemoSeedService,
        admin_panel_service_1.AdminPanelService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map