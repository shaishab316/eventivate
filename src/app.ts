import cors from 'cors';
import express from 'express';
import globalErrorHandler from './middlewares/globalErrorHandler';
import { v1Routes } from './routes/v1';
import { notFoundError } from './errors';
import serveResponse from './middlewares/serveResponse';
import cookieParser from 'cookie-parser';
import { Morgan } from './utils/logger';

/**
 * The main application instance
 *
 * This is the main application instance that sets up the Express server.
 * It configures middleware, routes, and error handling.
 */
const app = express();

// Configure middleware
app.use(
	cors({
		origin: '*',
		credentials: true,
	}),

	Morgan.successHandler,
	Morgan.errorHandler,

	(req, res, next) =>
		(req.headers['stripe-signature'] ?
			express.raw({ type: 'application/json' })
		:	express.json())(req, res, next),

	express.text(),
	express.urlencoded({ extended: true }),
	cookieParser(),
);

// Serve static files
app.use(express.static('public'));
app.use(express.static('uploads'));

app.get('/', (_, res) => {
	res.redirect('/health');
});

// Health check
app.get('/health', (_, res) => {
	serveResponse(res, {
		message: `${process.env.npm_package_name} is healthy!`,
		meta: {
			timestamp: new Date(),
			version: process.env.npm_package_version,
			env: process.env.NODE_ENV,
		},
	});
});

// API routes
app.use('/api/v1', v1Routes);

// 404 handler
app.use(({ originalUrl }, _, next) => {
	next(notFoundError(originalUrl));
});

// Error handler
app.use(globalErrorHandler);

export default app;
