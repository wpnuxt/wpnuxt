import { consola } from 'consola'

/**
 * Logger utility for @wpnuxt/auth server routes.
 * Uses consola for consistent logging with the WPNuxt tag.
 */
export const logger = consola.withTag('wpnuxt:auth')
