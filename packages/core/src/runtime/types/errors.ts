/**
 * WPNuxt Error Types
 *
 * Type-safe error handling for WPNuxt operations.
 */

/**
 * Error codes for WPNuxt operations
 */
export type WPNuxtErrorCode
  = 'NETWORK_ERROR'
    | 'TIMEOUT_ERROR'
    | 'GRAPHQL_ERROR'
    | 'AUTH_ERROR'
    | 'VALIDATION_ERROR'
    | 'TRANSFORM_ERROR'
    | 'CONFIG_ERROR'

/**
 * Structured error object for WPNuxt
 */
export interface WPNuxtError {
  /** Error code for programmatic handling */
  code: WPNuxtErrorCode
  /** Human-readable error message */
  message: string
  /** Additional error details (e.g., GraphQL errors, stack trace) */
  details?: unknown
  /** The query/operation that caused the error */
  query?: string
  /** Timestamp when the error occurred */
  timestamp: number
}

/**
 * Create a typed WPNuxt error
 */
export function createWPNuxtError(
  code: WPNuxtErrorCode,
  message: string,
  options?: {
    details?: unknown
    query?: string
  }
): WPNuxtError {
  return {
    code,
    message,
    details: options?.details,
    query: options?.query,
    timestamp: Date.now()
  }
}

/**
 * Type guard to check if an error is a WPNuxtError
 */
export function isWPNuxtError(error: unknown): error is WPNuxtError {
  return (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && 'message' in error
    && 'timestamp' in error
    && typeof (error as WPNuxtError).code === 'string'
    && typeof (error as WPNuxtError).message === 'string'
    && typeof (error as WPNuxtError).timestamp === 'number'
  )
}

/**
 * Type-safe result type for operations that can fail
 */
export type WPNuxtResult<T>
  = { success: true, data: T, error: null }
    | { success: false, data: null, error: WPNuxtError }

/**
 * Create a successful result
 */
export function success<T>(data: T): WPNuxtResult<T> {
  return { success: true, data, error: null }
}

/**
 * Create a failed result
 */
export function failure<T>(error: WPNuxtError): WPNuxtResult<T> {
  return { success: false, data: null, error }
}

/**
 * Convert a standard Error to a WPNuxtError
 */
export function fromError(
  error: Error,
  code: WPNuxtErrorCode = 'NETWORK_ERROR',
  query?: string
): WPNuxtError {
  // Detect specific error types
  let errorCode = code

  if (error.name === 'AbortError') {
    errorCode = 'TIMEOUT_ERROR'
  } else if (error.message?.includes('GraphQL')) {
    errorCode = 'GRAPHQL_ERROR'
  } else if (error.message?.includes('401') || error.message?.includes('403')) {
    errorCode = 'AUTH_ERROR'
  }

  return createWPNuxtError(errorCode, error.message, {
    details: error.stack,
    query
  })
}
