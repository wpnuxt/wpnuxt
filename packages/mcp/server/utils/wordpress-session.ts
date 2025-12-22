/**
 * WordPress Session Manager
 *
 * Manages the WordPress URL for the current MCP session.
 * Stores the URL server-side and provides utilities to get/set it.
 */

interface WordPressSession {
  wordpressUrl: string
  siteName?: string
  connectedAt: Date
  lastUsed: Date
}

// In-memory session storage (per server instance)
// In production, this could be replaced with Redis or another persistent store
const sessions = new Map<string, WordPressSession>()

// Default session ID for when we can't identify the client
const DEFAULT_SESSION_ID = 'default'

/**
 * Get session ID from request event
 * Uses a combination of headers to identify the client
 */
export function getSessionId(event: H3Event): string {
  // Try to get a unique identifier from headers
  const clientId = getHeader(event, 'x-mcp-client-id')
  const userAgent = getHeader(event, 'user-agent')

  if (clientId) {
    return clientId
  }

  // Fallback to a hash of user-agent or default
  if (userAgent) {
    // Simple hash for session identification
    let hash = 0
    for (let i = 0; i < userAgent.length; i++) {
      const char = userAgent.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32bit integer
    }
    return `session_${Math.abs(hash)}`
  }

  return DEFAULT_SESSION_ID
}

/**
 * Get the current WordPress session
 */
export function getWordPressSession(event: H3Event): WordPressSession | null {
  const sessionId = getSessionId(event)
  const session = sessions.get(sessionId)

  if (session) {
    // Update last used time
    session.lastUsed = new Date()
  }

  return session || null
}

/**
 * Set the WordPress URL for the current session
 */
export function setWordPressSession(
  event: H3Event,
  wordpressUrl: string,
  siteName?: string
): WordPressSession {
  const sessionId = getSessionId(event)

  // Normalize URL (remove trailing slash)
  const normalizedUrl = wordpressUrl.replace(/\/+$/, '')

  const session: WordPressSession = {
    wordpressUrl: normalizedUrl,
    siteName,
    connectedAt: new Date(),
    lastUsed: new Date()
  }

  sessions.set(sessionId, session)
  return session
}

/**
 * Clear the WordPress session
 */
export function clearWordPressSession(event: H3Event): void {
  const sessionId = getSessionId(event)
  sessions.delete(sessionId)
}

/**
 * Get WordPress URL from session, header, or environment
 * Priority: Header > Session > Environment
 */
export function getWordPressUrl(event: H3Event): string | null {
  // 1. Check header first (explicit override)
  const headerUrl = getHeader(event, 'x-wordpress-url')
  if (headerUrl) {
    return headerUrl.replace(/\/+$/, '')
  }

  // 2. Check session
  const session = getWordPressSession(event)
  if (session?.wordpressUrl) {
    return session.wordpressUrl
  }

  // 3. Fall back to environment
  const runtimeConfig = useRuntimeConfig()
  if (runtimeConfig.wordpressUrl) {
    return runtimeConfig.wordpressUrl.replace(/\/+$/, '')
  }

  return null
}

/**
 * Check if a WordPress URL is configured (from any source)
 */
export function hasWordPressUrl(event: H3Event): boolean {
  return getWordPressUrl(event) !== null
}

/**
 * Get session info for display
 */
export function getSessionInfo(event: H3Event): {
  hasSession: boolean
  wordpressUrl: string | null
  siteName: string | null
  source: 'header' | 'session' | 'environment' | 'none'
  connectedAt: Date | null
} {
  const headerUrl = getHeader(event, 'x-wordpress-url')
  const session = getWordPressSession(event)
  const envUrl = useRuntimeConfig().wordpressUrl

  if (headerUrl) {
    return {
      hasSession: true,
      wordpressUrl: headerUrl.replace(/\/+$/, ''),
      siteName: null,
      source: 'header',
      connectedAt: null
    }
  }

  if (session) {
    return {
      hasSession: true,
      wordpressUrl: session.wordpressUrl,
      siteName: session.siteName || null,
      source: 'session',
      connectedAt: session.connectedAt
    }
  }

  if (envUrl) {
    return {
      hasSession: true,
      wordpressUrl: envUrl.replace(/\/+$/, ''),
      siteName: null,
      source: 'environment',
      connectedAt: null
    }
  }

  return {
    hasSession: false,
    wordpressUrl: null,
    siteName: null,
    source: 'none',
    connectedAt: null
  }
}

// Cleanup old sessions periodically (older than 24 hours)
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

setInterval(() => {
  const now = new Date()
  for (const [sessionId, session] of sessions.entries()) {
    if (now.getTime() - session.lastUsed.getTime() > SESSION_MAX_AGE) {
      sessions.delete(sessionId)
    }
  }
}, 60 * 60 * 1000) // Check every hour
