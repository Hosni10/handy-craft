import multer from 'multer';
import { config } from '../config/index.js';
import { AppError } from '../lib/AppError.js';

// Use memory storage — the StorageService handles disk writes
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: config.maxFileSizeBytes },
  fileFilter: (_req, file, cb) => {
    if (config.allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new AppError('نوع الملف غير مسموح به. يُسمح بصور JPEG وPNG وWebP ومقاطع MP4 فقط', 415));
    }
  },
});
