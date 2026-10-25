import { defineEventHandler, getRequestURL, proxyRequest, removeResponseHeader, setResponseStatus } from 'h3'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const useRuntimeConfig: (event?: any) => any

/**
 * Whether an upstream redirect points back at the URL that was requested.
 * Headless redirect plugins (e.g. FaustWP) redirect a missing upload to the same path on the frontend,
 * which would bounce between the browser and this proxy until the browser gives up.
 */
export function isSelfRedirect(requestUrl: URL, status: number, location: string | null): boolean {
  if (status < 300 || status >= 400 || !location) return false
  const target = new URL(location, requestUrl)
  return target.host === requestUrl.host && target.pathname + target.search === requestUrl.pathname + requestUrl.search
}

// Proxies /wp-content/uploads/** to WordPress for plain <img> tags and v-sanitize-html content
export default defineEventHandler((event) => {
  const { wordpressUrl } = useRuntimeConfig(event).public.wpNuxt
  const requestUrl = getRequestURL(event, { xForwardedHost: true, xForwardedProto: true })

  return proxyRequest(event, `${wordpressUrl}${event.path}`, {
    // Pass upstream redirects to the client instead of following them back into this handler
    fetchOptions: { redirect: 'manual' },
    onResponse(event, response) {
      if (isSelfRedirect(requestUrl, response.status, response.headers.get('location'))) {
        removeResponseHeader(event, 'location')
        setResponseStatus(event, 404, 'Not Found')
      }
    }
  })
})
