import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { config } from '../config/index.js';
import type { StorageService } from '../interfaces/StorageService.js';

/**
 * Local disk storage — saves files under /uploads.
 * Replace with an S3StorageService implementing the same interface for production.
 */
export class LocalStorageService implements StorageService {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = path.resolve(config.uploadDir);
    // Ensure directory exists at startup
    fs.mkdirSync(this.uploadDir, { recursive: true });
  }

  async save(file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  }): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    const filename = `${randomUUID()}${ext}`;
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.writeFile(filePath, file.buffer);
    return `/uploads/${filename}`;
  }

  async delete(urlPath: string): Promise<void> {
    const filename = path.basename(urlPath);
    const filePath = path.join(this.uploadDir, filename);
    await fs.promises.unlink(filePath).catch(() => {
      // Ignore if file already gone
    });
  }
}

export const storageService: StorageService = new LocalStorageService();
