export type ApiErrorDetails = unknown[] | Record<string, unknown> | undefined;

/**
 * Application-level error carrying an HTTP status code and a machine-readable code.
 * Thrown from services/controllers and handled centrally by the error middleware.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details: ApiErrorDetails;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: ApiErrorDetails,
    isOperational = true,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static badRequest(message: string, details?: ApiErrorDetails): ApiError {
    return new ApiError(400, 'BAD_REQUEST', message, details);
  }

  static validation(message = 'Validation failed', details?: ApiErrorDetails): ApiError {
    return new ApiError(422, 'VALIDATION_ERROR', message, details);
  }

  static unauthorized(message = 'Authentication required'): ApiError {
    return new ApiError(401, 'UNAUTHORIZED', message);
  }

  static forbidden(message = 'You do not have permission to perform this action'): ApiError {
    return new ApiError(403, 'FORBIDDEN', message);
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(404, 'NOT_FOUND', message);
  }

  static conflict(message: string, details?: ApiErrorDetails): ApiError {
    return new ApiError(409, 'CONFLICT', message, details);
  }

  static tooManyRequests(message = 'Too many requests'): ApiError {
    return new ApiError(429, 'RATE_LIMITED', message);
  }

  static internal(message = 'An unexpected error occurred'): ApiError {
    return new ApiError(500, 'INTERNAL_ERROR', message, undefined, false);
  }
}
