// This file is server-only - winston is a Node.js library
import { env } from '@/config/env.config';

// Use dynamic import to avoid client-side bundling
let winstonLogger: any = null;

const createWinstonLogger = () => {
  if (typeof window !== 'undefined') {
    // Client-side fallback
    return console;
  }

  try {
    const winston = require('winston');
    const DailyRotateFile = require('winston-daily-rotate-file');
    const { combine, timestamp, printf, colorize, errors } = winston.format;

    const logFormat = printf(({ level, message, timestamp, stack }: any) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    });

    return winston.createLogger({
      level: 'debug',
      format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        errors({ stack: true }),
        logFormat
      ),
      // transports: [
      //   new winston.transports.Console(),
      //   new DailyRotateFile({
      //     filename: 'logs/error-%DATE%.log',
      //     datePattern: 'YYYY-MM-DD',
      //     level: 'error',
      //     maxFiles: env.ERROR_LOG_RETENTION_PERIOD,
      //     zippedArchive: false,
      //   }),
      // ],
    });
  } catch (error) {
    // Fallback to console if winston fails to load
    console.warn('Winston logger not available, using console fallback:', error);
    return console;
  }
};

if (!winstonLogger) {
  winstonLogger = createWinstonLogger();
}

export default winstonLogger;
