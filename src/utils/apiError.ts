export class ApiError extends Error {
  statusCode: number;
  details?: any;

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.details = details;
    
    // Maintain proper stack trace for where the error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      error: this.name,
      message: this.message,
      statusCode: this.statusCode,
      ...(this.details && { details: this.details }),
    };
  }
}

export function isApiError(error: any): error is ApiError {
  return error instanceof ApiError || 
         (error && typeof error === 'object' && 
          'name' in error && 
          error.name === 'ApiError' &&
          'statusCode' in error);
}

export function handleApiError(error: any): never {
  if (isApiError(error)) {
    throw error;
  }
  
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    throw new ApiError(
      data?.message || 'An error occurred',
      status,
      data?.details
    );
  } else if (error.request) {
    // The request was made but no response was received
    throw new ApiError('No response from server. Please check your connection.', 0);
  } else {
    // Something happened in setting up the request that triggered an Error
    throw new ApiError(error.message || 'An unexpected error occurred');
  }
}
