import { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { TErrorHandler, TErrorMessage } from "@/types/errors";
import { statusCodes } from "@/lib/status_codes";
import { handleZodError, ServerError } from "@/errors";
import { logger } from "@/utils/logger";

export const defaultError: TErrorHandler = {
  statusCode: statusCodes.INTERNAL_SERVER_ERROR,
  message: "Something went wrong",
  errorMessages: [],
};

const globalErrorHandler: ErrorRequestHandler = async (error, req, res, _) => {
  logger.error("[globalErrorHandler] Error: %o", error);

  const { statusCode, message, errorMessages } = formatError(error);

  res.statusMessage = message;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errorMessages,
    stack: process.env.NODE_ENV !== "production" ? error.stack : undefined,
  });
};

export default globalErrorHandler;

export const formatError = (error: any): TErrorHandler => {
  if (error instanceof ZodError) return handleZodError(error);
  if (error instanceof ServerError)
    return {
      statusCode: error.statusCode,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };
  if (error instanceof Error)
    return {
      ...defaultError,
      message: error.message,
      errorMessages: createErrorMessage(error.message),
    };

  return defaultError;
};

export const createErrorMessage = (message: string): TErrorMessage[] => [
  { path: "", message },
];
