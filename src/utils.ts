import type { WPNuxtConfig } from './types/config'

/**
 * Validate the module options.
 */
export function validateConfig(options: Partial<WPNuxtConfig>) {
  if (!options.wordpressUrl || options.wordpressUrl.length === 0) {
    throw new Error('WPNuxt error: WordPress url is missing')
  } else if (options.wordpressUrl.substring(options.wordpressUrl.length - 1) === '/') {
    throw new Error('WPNuxt error: WordPress url should not have a trailing slash: ' + options.wordpressUrl)
  }
}

export function randHashGenerator(length = 12) {
  const randomChar = () => Math.floor(36 * Math.random()).toString(36)

  return Array<string>(length)
    .fill(String())
    .map(randomChar)
    .reduce((acc, cur) => {
      return acc + cur.toUpperCase()
    }, '')
}
