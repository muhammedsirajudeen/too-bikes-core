// This file is server-only - winston is a Node.js library
import { env } from '@/config/env.config';
import { Logger } from 'winston';

// Use dynamic import to avoid client-side bundling
let winstonLogger: Logger | Console | null = null;

const createWinstonLogger = (): Logger | Console => {
  if (typeof window !== 'undefined') {
    // Client-side fallback
    return console;
  }

  try {
    const winston = require('winston');
    const DailyRotateFile = require('winston-daily-rotate-file');
    const { combine, timestamp, colorize, errors, format: winstonFormat } = winston;

    // Custom log format using winston's TransformableInfo
    const logFormat = winstonFormat.printf((info: unknown) => {
      const { level, message, timestamp: ts, stack } = info as {
        level: string;
        message: string;
        timestamp?: string;
        stack?: string;
      };
      return `${ts || new Date().toISOString()} [${level}]: ${stack || message}`;
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

// Initialize logger immediately
if (!winstonLogger) {
  winstonLogger = createWinstonLogger();
}

// Export with non-null assertion since we always initialize it
export default winstonLogger as Logger | Console;
