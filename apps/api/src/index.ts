import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config/index.js';
import router from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

// ─── Security ───────────────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // allow image loads from web app
  })
);

// ─── CORS ───────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })
);

// ─── Body parsers ───────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Static file serving (uploads) ──────────────────────────
const uploadsDir = path.resolve(__dirname, '..', config.uploadDir);
app.use('/uploads', express.static(uploadsDir));

// ─── API routes ─────────────────────────────────────────────
app.use('/api', router);

// ─── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'المسار غير موجود' });
});

// ─── Global error handler ───────────────────────────────────
app.use(errorHandler);

// ─── Start ──────────────────────────────────────────────────
app.listen(config.port, () => {
  console.log(`✅ Handy Craft API running on http://localhost:${config.port}`);
  console.log(`   ENV: ${config.nodeEnv}`);
});

export default app;
