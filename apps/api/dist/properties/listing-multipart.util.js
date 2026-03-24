"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubmitListingFileInterceptor = createSubmitListingFileInterceptor;
exports.publicUrlsForListingFiles = publicUrlsForListingFiles;
exports.flattenMultipartBody = flattenMultipartBody;
exports.parseListingFormFields = parseListingFormFields;
exports.mergeUploadedFilesIntoListingDto = mergeUploadedFilesIntoListingDto;
exports.buildListingDtoFromMultipart = buildListingDtoFromMultipart;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const crypto_1 = require("crypto");
const path_1 = require("path");
const fs = require("fs");
const LISTINGS_SUB = 'listings';
function ensureListingUploadDir() {
    const dir = (0, path_1.join)(process.cwd(), 'uploads', LISTINGS_SUB);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
}
function mimeToListingExt(mime) {
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
function createSubmitListingFileInterceptor(maxImages, maxVideos) {
    return (0, platform_express_1.FileFieldsInterceptor)([
        { name: 'images', maxCount: maxImages },
        { name: 'videos', maxCount: maxVideos },
    ], {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => cb(null, ensureListingUploadDir()),
            filename: (_req, file, cb) => {
                const raw = (0, path_1.extname)(file.originalname || '').toLowerCase();
                const ext = /^\.[a-z0-9]{1,8}$/.test(raw) ? raw : mimeToListingExt(file.mimetype);
                cb(null, `${(0, crypto_1.randomUUID)()}${ext || '.bin'}`);
            },
        }),
        limits: { fileSize: 120 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (file.fieldname === 'images' && !file.mimetype.startsWith('image/')) {
                cb(new common_1.BadRequestException('Field "images" must contain image files only'), false);
                return;
            }
            if (file.fieldname === 'videos' && !file.mimetype.startsWith('video/')) {
                cb(new common_1.BadRequestException('Field "videos" must contain video files only'), false);
                return;
            }
            cb(null, true);
        },
    });
}
function publicUrlsForListingFiles(files) {
    const port = Number(process.env.PORT) || 3000;
    const origin = (process.env.UPLOADS_PUBLIC_ORIGIN || '').replace(/\/$/, '') || `http://localhost:${port}`;
    const base = `${origin}/uploads/${LISTINGS_SUB}`;
    return (files ?? []).map((f) => `${base}/${f.filename}`);
}
function flattenMultipartBody(body) {
    const out = {};
    for (const [k, v] of Object.entries(body)) {
        if (v === undefined || v === null)
            continue;
        const s = Array.isArray(v) ? v[0] : v;
        if (s !== '')
            out[k] = String(s);
    }
    return out;
}
function tryJson(raw) {
    if (raw === undefined || raw === '')
        return undefined;
    try {
        return JSON.parse(raw);
    }
    catch {
        return undefined;
    }
}
function parseListingFormFields(flat) {
    const dto = {};
    const setStr = (key, raw) => {
        if (raw === undefined || raw === '')
            return;
        dto[key] = raw;
    };
    setStr('title', flat.title);
    setStr('description', flat.description);
    setStr('countryCode', flat.countryCode);
    setStr('city', flat.city);
    setStr('state', flat.state);
    setStr('addressLine1', flat.addressLine1);
    setStr('propertyType', flat.propertyType);
    setStr('listingType', flat.listingType);
    setStr('currencyCode', flat.currencyCode);
    setStr('ownerName', flat.ownerName);
    setStr('ownerEmail', flat.ownerEmail);
    setStr('ownerPhone', flat.ownerPhone);
    setStr('furnishing', flat.furnishing);
    setStr('primaryImageUrl', flat.primaryImageUrl);
    setStr('primaryVideoUrl', flat.primaryVideoUrl);
    setStr('videoUrl', flat.videoUrl);
    const num = (v) => {
        if (v === undefined || v === '')
            return undefined;
        const n = Number(v);
        return Number.isFinite(n) ? n : undefined;
    };
    const price = num(flat.price);
    if (price !== undefined)
        dto.price = price;
    const areaSqft = num(flat.areaSqft);
    if (areaSqft !== undefined)
        dto.areaSqft = areaSqft;
    const bedrooms = num(flat.bedrooms);
    if (bedrooms !== undefined)
        dto.bedrooms = bedrooms;
    const bathrooms = num(flat.bathrooms);
    if (bathrooms !== undefined)
        dto.bathrooms = bathrooms;
    const lat = num(flat.latitude);
    if (lat !== undefined)
        dto.latitude = lat;
    const lng = num(flat.longitude);
    if (lng !== undefined)
        dto.longitude = lng;
    const floorNumber = num(flat.floorNumber);
    if (floorNumber !== undefined)
        dto.floorNumber = floorNumber;
    const totalFloors = num(flat.totalFloors);
    if (totalFloors !== undefined)
        dto.totalFloors = totalFloors;
    const depositAmount = num(flat.depositAmount);
    if (depositAmount !== undefined)
        dto.depositAmount = depositAmount;
    const maintenanceMonthly = num(flat.maintenanceMonthly);
    if (maintenanceMonthly !== undefined)
        dto.maintenanceMonthly = maintenanceMonthly;
    const expectedRentMonthly = num(flat.expectedRentMonthly);
    if (expectedRentMonthly !== undefined)
        dto.expectedRentMonthly = expectedRentMonthly;
    if (flat.whatsappOptIn === 'true' || flat.whatsappOptIn === '1')
        dto.whatsappOptIn = true;
    if (flat.whatsappOptIn === 'false' || flat.whatsappOptIn === '0')
        dto.whatsappOptIn = false;
    const amenities = tryJson(flat.amenities);
    if (amenities?.length)
        dto.amenities = amenities.map(String);
    const imageUrls = tryJson(flat.imageUrls);
    if (imageUrls?.length)
        dto.imageUrls = imageUrls.map(String);
    const videoUrls = tryJson(flat.videoUrls);
    if (videoUrls?.length)
        dto.videoUrls = videoUrls.map(String);
    return dto;
}
function mergeUploadedFilesIntoListingDto(dto, files, opts) {
    const imageFileUrls = publicUrlsForListingFiles(files?.images ?? []);
    const videoFileUrls = publicUrlsForListingFiles(files?.videos ?? []);
    const textImages = Array.isArray(dto.imageUrls) ? dto.imageUrls.map(String).filter(Boolean) : [];
    const mergedImages = [...imageFileUrls, ...textImages].slice(0, opts.maxImages);
    if (mergedImages.length)
        dto.imageUrls = mergedImages;
    else
        delete dto.imageUrls;
    if (opts.allowMultiVideo) {
        const textVids = Array.isArray(dto.videoUrls) ? dto.videoUrls.map(String).filter(Boolean) : [];
        const mergedVids = [...videoFileUrls, ...textVids];
        if (mergedVids.length)
            dto.videoUrls = mergedVids;
        else
            delete dto.videoUrls;
    }
    else if (videoFileUrls.length) {
        dto.videoUrl = videoFileUrls[0];
    }
    return dto;
}
function buildListingDtoFromMultipart(body, files, opts) {
    const flat = flattenMultipartBody(body);
    const parsed = parseListingFormFields(flat);
    return mergeUploadedFilesIntoListingDto(parsed, files, opts);
}
//# sourceMappingURL=listing-multipart.util.js.map