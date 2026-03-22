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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SeoPageEntity = void 0;
const typeorm_1 = require("typeorm");
let SeoPageEntity = class SeoPageEntity {
};
exports.SeoPageEntity = SeoPageEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SeoPageEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'page_path', unique: true }),
    __metadata("design:type", String)
], SeoPageEntity.prototype, "pagePath", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_title', type: 'text' }),
    __metadata("design:type", String)
], SeoPageEntity.prototype, "metaTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'meta_description', type: 'text' }),
    __metadata("design:type", String)
], SeoPageEntity.prototype, "metaDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SeoPageEntity.prototype, "keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'canonical_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SeoPageEntity.prototype, "canonicalUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'og_title', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SeoPageEntity.prototype, "ogTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'og_description', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SeoPageEntity.prototype, "ogDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'json_ld', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], SeoPageEntity.prototype, "jsonLd", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SeoPageEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SeoPageEntity.prototype, "updatedAt", void 0);
exports.SeoPageEntity = SeoPageEntity = __decorate([
    (0, typeorm_1.Entity)('seo_pages')
], SeoPageEntity);
//# sourceMappingURL=seo-page.entity.js.map