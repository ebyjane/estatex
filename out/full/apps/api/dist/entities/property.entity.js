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
exports.PropertyEntity = void 0;
const typeorm_1 = require("typeorm");
const property_image_entity_1 = require("./property-image.entity");
let PropertyEntity = class PropertyEntity {
};
exports.PropertyEntity = PropertyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PropertyEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'country_id' }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "countryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_id', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "ownerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'agent_id', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "agentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], PropertyEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'property_type', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "propertyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'listing_type' }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "listingType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'currency_code', length: 3 }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "currencyCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_sqft', type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "areaSqft", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "bedrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "bathrooms", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 7, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address_line1', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "addressLine1", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "city", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "zip", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'draft' }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_name', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "ownerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_email', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "ownerEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_phone', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "ownerPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], PropertyEntity.prototype, "amenities", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "furnishing", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'floor_number', nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "floorNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'total_floors', nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "totalFloors", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'deposit_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "depositAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'maintenance_monthly', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "maintenanceMonthly", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'whatsapp_opt_in', default: false }),
    __metadata("design:type", Boolean)
], PropertyEntity.prototype, "whatsappOptIn", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reject_reason', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PropertyEntity.prototype, "rejectReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_value_score', nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "aiValueScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_price_suggestion', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "aiPriceSuggestion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_yield', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "rentalYield", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cagr_5y', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "cagr5y", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'risk_score', type: 'decimal', precision: 4, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_verified', default: false }),
    __metadata("design:type", Boolean)
], PropertyEntity.prototype, "isVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ai_category', nullable: true }),
    __metadata("design:type", String)
], PropertyEntity.prototype, "aiCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'growth_projection_5yr', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "growthProjection5yr", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'rental_estimate', type: 'decimal', precision: 18, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "rentalEstimate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_demand_index', nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "areaDemandIndex", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_featured', default: false }),
    __metadata("design:type", Boolean)
], PropertyEntity.prototype, "isFeatured", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'video_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PropertyEntity.prototype, "videoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'video_urls', type: 'simple-json', nullable: true }),
    __metadata("design:type", Object)
], PropertyEntity.prototype, "videoUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'owner_verified', default: false }),
    __metadata("design:type", Boolean)
], PropertyEntity.prototype, "ownerVerified", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'trust_score', type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "trustScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'data_completeness', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "dataCompleteness", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fraud_flag', default: false }),
    __metadata("design:type", Boolean)
], PropertyEntity.prototype, "fraudFlag", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'listing_expires_at', type: 'datetime', nullable: true }),
    __metadata("design:type", Object)
], PropertyEntity.prototype, "listingExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'report_count', default: 0 }),
    __metadata("design:type", Number)
], PropertyEntity.prototype, "reportCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PropertyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PropertyEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => property_image_entity_1.PropertyImageEntity, (img) => img.property),
    __metadata("design:type", Array)
], PropertyEntity.prototype, "images", void 0);
exports.PropertyEntity = PropertyEntity = __decorate([
    (0, typeorm_1.Entity)('properties')
], PropertyEntity);
//# sourceMappingURL=property.entity.js.map