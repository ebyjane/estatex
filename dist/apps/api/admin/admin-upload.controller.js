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
exports.AdminUploadController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const path_1 = require("path");
const fs = require("fs");
const admin_role_guard_1 = require("../auth/guards/admin-role.guard");
const LISTINGS_SUB = 'listings';
function ensureUploadDir() {
    const dir = (0, path_1.join)(process.cwd(), 'uploads', LISTINGS_SUB);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
function mimeToExt(mime) {
    const m = {
        'image/jpeg': '.jpg',
        'image/jpg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
        'video/mp4': '.mp4',
        'video/webm': '.webm',
        'video/quicktime': '.mov',
    };
    return m[mime] || '';
}
let AdminUploadController = class AdminUploadController {
    upload(files) {
        if (!files?.length)
            throw new common_1.BadRequestException('No files uploaded (images/videos only, max 120MB each)');
        const port = Number(process.env.PORT) || 8000;
        const origin = (process.env.UPLOADS_PUBLIC_ORIGIN || '').replace(/\/$/, '') || `http://localhost:${port}`;
        const base = `${origin}/uploads/${LISTINGS_SUB}`;
        return { urls: files.map((f) => `${base}/${f.filename}`) };
    }
};
exports.AdminUploadController = AdminUploadController;
__decorate([
    (0, common_1.Post)('uploads'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('files', 80, {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                cb(null, ensureUploadDir());
            },
            filename: (_req, file, cb) => {
                const raw = (0, path_1.extname)(file.originalname || '').toLowerCase();
                const ext = /^\.[a-z0-9]{1,8}$/.test(raw) ? raw : mimeToExt(file.mimetype);
                cb(null, `${(0, crypto_1.randomUUID)()}${ext}`);
            },
        }),
        limits: { fileSize: 120 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const ok = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
            cb(null, ok);
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", void 0)
], AdminUploadController.prototype, "upload", null);
exports.AdminUploadController = AdminUploadController = __decorate([
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), admin_role_guard_1.AdminRoleGuard)
], AdminUploadController);
//# sourceMappingURL=admin-upload.controller.js.map