import morgan from 'morgan';
import { Response } from 'express';
import { statusCodes } from '@/lib/status_codes';
import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import stripAnsi from 'strip-ansi';
import path from 'path';

const { combine, timestamp, label, printf } = format;
const logDir = path.resolve(process.cwd(), 'logs');
const appLabel = label({ label: process.env.npm_package_name });
const printFmt = printf(
	({ level, message, label, timestamp }) =>
		`${timestamp} [${label}] ${level}: ${message}`,
);

const consoleFormat = combine(appLabel, timestamp(), printFmt);
const fileFormat = combine(
	appLabel,
	timestamp(),
	format((i) => ({ ...i, message: stripAnsi(i.message as string) }))(),
	printFmt,
);

const makeLogger = (level: 'info' | 'error', file: string, maxFiles: string) =>
	createLogger({
		level,
		transports: [
			new transports.Console({ format: consoleFormat }),
			new DailyRotateFile({
				filename: path.join(logDir, file),
				datePattern: 'YYYY-MM-DD',
				maxSize: '20m',
				maxFiles,
				level,
				format: fileFormat,
			}),
		],
	});

const infoLogger = makeLogger('info', 'app-%DATE%.log', '30d');
const errorLogger = makeLogger('error', 'error-%DATE%.log', '90d');

export const logger = {
	info: (message: string, ...meta: any[]) => infoLogger.info(message, ...meta),
	error: (message: string, ...meta: any[]) =>
		errorLogger.error(message, ...meta),
};

// Morgan
morgan.token('message', (_, res: Response) => res?.locals.errorMessage ?? '');
const fmt = ':remote-addr - :method :url :status - :response-time ms';
const skip =
	(min: number, max: number) =>
	(_: unknown, { statusCode, req: { url } }: Response) =>
		statusCode < min || statusCode >= max || url!.includes('no_logger');

export const Morgan = {
	successHandler: morgan(fmt, {
		skip: skip(100, statusCodes.BAD_REQUEST),
		stream: { write: (m) => logger.info(m.trim()) },
	}),
	errorHandler: morgan(fmt, {
		skip: skip(statusCodes.BAD_REQUEST, 600),
		stream: { write: (m) => logger.error(m.trim()) },
	}),
};
