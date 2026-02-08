/**
 * Check if a URL points to the WordPress site (i.e., is an internal link).
 *
 * @param url - The URL to check (absolute or relative)
 * @param wordpressUrl - The WordPress site URL (e.g., 'https://wordpress.example.com')
 * @returns `true` if the link is internal
 */
function isInternalLink(url: string, wordpressUrl: string): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  const trimmed = url.trim()

  // Already-relative paths are internal
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true
  }

  // Non-http(s) schemes (mailto:, tel:, javascript:, etc.) are not internal
  if (/^(?!https?:\/\/)/i.test(trimmed) && !trimmed.startsWith('//')) {
    return false
  }

  if (!wordpressUrl || typeof wordpressUrl !== 'string') {
    return false
  }

  try {
    // Normalise protocol-relative URLs
    const fullUrl = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
    const parsedUrl = new URL(fullUrl)
    const parsedWp = new URL(wordpressUrl)

    return parsedUrl.hostname === parsedWp.hostname
  } catch {
    return false
  }
}

/**
 * Convert an absolute URL to a relative path, preserving query params and hash.
 *
 * Already-relative paths are returned unchanged.
 *
 * @param url - The URL to convert
 * @returns The relative path (e.g., '/hello-world/?preview=true#section')
 */
function toRelativePath(url: string): string {
  if (!url || typeof url !== 'string') {
    return ''
  }

  const trimmed = url.trim()

  // Already relative
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed
  }

  try {
    const fullUrl = trimmed.startsWith('//') ? `https:${trimmed}` : trimmed
    const parsed = new URL(fullUrl)
    return parsed.pathname + parsed.search + parsed.hash
  } catch {
    return trimmed
  }
}

export { isInternalLink, toRelativePath }
