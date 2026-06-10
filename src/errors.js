export class ApiError extends Error {
  constructor(status, message, validationErrors = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.validationErrors = validationErrors;
  }
}

const HTTP_ERRORS = {
  400: "Bad Request",
  404: "Not Found",
  500: "Internal Server Error"
};

export function errorHandler(error, request, response, _next) {
  const malformedJson = error?.type === "entity.parse.failed";
  const status = error instanceof ApiError
    ? error.status
    : malformedJson
      ? 400
      : 500;
  const message = error instanceof ApiError
    ? error.message
    : malformedJson
      ? "Malformed JSON request body"
      : "An unexpected error occurred";

  if (!(error instanceof ApiError) && !malformedJson) {
    console.error(error);
  }

  response.status(status).json({
    timestamp: new Date().toISOString().replace(/Z$/, ""),
    status,
    error: HTTP_ERRORS[status] || "Error",
    message,
    path: request.path,
    validationErrors:
      error instanceof ApiError ? error.validationErrors : {}
  });
}

export function notFoundHandler(request, _response, next) {
  next(new ApiError(404, `Route not found: ${request.method} ${request.path}`));
}
