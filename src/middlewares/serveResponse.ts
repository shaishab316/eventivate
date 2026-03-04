import { statusCodes } from "@/lib/status_codes";
import type { Response } from "express";

export type TPagination = {
  page: number;
  limit: number;
  total_pages: number;
  total: number;
};

export type TServeResponse<T> = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: Record<string, unknown> & { pagination?: TPagination };
  data?: T;
};

/**
 * Sends a standardized API response with consistent formatting
 * including success status, message, metadata and optional data payload
 */
const serveResponse = <T>(
  res: Response,
  {
    statusCode = statusCodes.OK,
    success = true,
    message = "Success",
    meta,
    data,
  }: Partial<TServeResponse<T>> = {},
) => {
  res.statusMessage = message;

  res.status(statusCode).json({ success, statusCode, message, meta, data });
};

export default serveResponse;
