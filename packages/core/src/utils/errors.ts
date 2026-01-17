/**
 * Shared error utilities for WPNuxt modules
 * Provides consistent error message formatting across all packages
 */

export type WPNuxtModule = 'core' | 'blocks' | 'auth'

/**
 * Creates an Error with a consistent WPNuxt prefix
 * @param module - The module name ('core', 'blocks', or 'auth')
 * @param message - The error message
 * @returns Error with formatted message
 */
export function createModuleError(
  module: WPNuxtModule,
  message: string
): Error {
  return new Error(formatErrorMessage(module, message))
}

/**
 * Formats an error message with the WPNuxt module prefix
 * @param module - The module name ('core', 'blocks', or 'auth')
 * @param message - The error message
 * @returns Formatted error message string
 */
export function formatErrorMessage(
  module: WPNuxtModule,
  message: string
): string {
  return `[wpnuxt:${module}] ${message}`
}
