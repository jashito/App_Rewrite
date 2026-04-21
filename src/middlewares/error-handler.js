import { HttpError } from "../utils/http-error.js";
import { logger } from "../utils/logger.js";

export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
    }
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  const statusCode = error instanceof HttpError ? error.statusCode : 500;
  const message = error.message || "Error interno del servidor";
  const requestPath = `${req.method} ${req.originalUrl}`;

  if (statusCode >= 500) {
    logger.error("Request failed", { statusCode, requestPath, message });
  } else {
    logger.warn("Request failed", { statusCode, requestPath, message });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message
    }
  });
}
