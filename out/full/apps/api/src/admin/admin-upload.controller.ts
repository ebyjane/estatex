import {
  BadRequestException,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname, join } from 'path';
import * as fs from 'fs';
import { AdminRoleGuard } from '../auth/guards/admin-role.guard';

const LISTINGS_SUB = 'listings';

function ensureUploadDir(): string {
  const dir = join(process.cwd(), 'uploads', LISTINGS_SUB);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function mimeToExt(mime: string): string {
  const m: Record<string, string> = {
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

@Controller('admin')
@UseGuards(AuthGuard('jwt'), AdminRoleGuard)
export class AdminUploadController {
  @Post('uploads')
  @UseInterceptors(
    FilesInterceptor('files', 80, {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, ensureUploadDir());
        },
        filename: (_req, file, cb) => {
          const raw = extname(file.originalname || '').toLowerCase();
          const ext = /^\.[a-z0-9]{1,8}$/.test(raw) ? raw : mimeToExt(file.mimetype);
          cb(null, `${randomUUID()}${ext}`);
        },
      }),
      limits: { fileSize: 120 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/');
        cb(null, ok);
      },
    }),
  )
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('No files uploaded (images/videos only, max 120MB each)');
    const port = Number(process.env.PORT) || 8000;
    const origin = (process.env.UPLOADS_PUBLIC_ORIGIN || '').replace(/\/$/, '') || `http://localhost:${port}`;
    const base = `${origin}/uploads/${LISTINGS_SUB}`;
    return { urls: files.map((f) => `${base}/${f.filename}`) };
  }
}
