import { z } from 'zod'
import { executeGraphQL, SITE_SETTINGS_QUERY } from '../../utils/graphql'
import {
  setWordPressSession,
  clearWordPressSession,
  getSessionInfo
} from '../../utils/wordpress-session'

interface SiteSettings {
  generalSettings: {
    title: string
    description: string
    url: string
    language: string
  }
}

export default defineMcpTool({
  description: `Connect to a WordPress site for this session.

This tool sets the WordPress URL for all subsequent operations. The URL is remembered
for the duration of your session, so you don't need to specify it for every tool call.

**First time?** Call this tool with a WordPress URL to connect.
**Already connected?** Call without parameters to see current connection status.
**Want to change?** Call with a new URL to switch WordPress sites.
**Want to disconnect?** Call with disconnect: true.

The WordPress site must have WPGraphQL plugin installed and accessible.`,

  inputSchema: {
    wordpressUrl: z.string().url().optional().describe(
      'WordPress site URL (e.g., https://your-site.com). Must have WPGraphQL installed.'
    ),
    disconnect: z.boolean().optional().describe(
      'Set to true to disconnect from the current WordPress site'
    )
  },

  async handler({ wordpressUrl, disconnect }) {
    const event = useEvent()

    // Handle disconnect
    if (disconnect) {
      clearWordPressSession(event)
      return jsonResult({
        status: 'disconnected',
        message: 'Disconnected from WordPress. Call wp_connect with a URL to connect to a new site.'
      })
    }

    // If no URL provided, show current status
    if (!wordpressUrl) {
      const sessionInfo = getSessionInfo(event)

      if (!sessionInfo.hasSession) {
        return jsonResult({
          status: 'not_connected',
          message: 'No WordPress site connected. Please provide a WordPress URL to connect.',
          hint: 'Call wp_connect with wordpressUrl parameter, e.g., wordpressUrl: "https://your-site.com"',
          requiresInput: true,
          inputPrompt: 'What is the URL of your WordPress site?'
        })
      }

      return jsonResult({
        status: 'connected',
        wordpressUrl: sessionInfo.wordpressUrl,
        siteName: sessionInfo.siteName,
        source: sessionInfo.source,
        connectedAt: sessionInfo.connectedAt?.toISOString(),
        message: `Connected to ${sessionInfo.siteName || sessionInfo.wordpressUrl}`,
        hint: 'To change WordPress sites, call wp_connect with a different URL. To disconnect, use disconnect: true.'
      })
    }

    // Validate and connect to the new WordPress URL
    const normalizedUrl = wordpressUrl.replace(/\/+$/, '')

    // Test the connection by fetching site settings
    try {
      // Temporarily set the URL in the session for the test query
      setWordPressSession(event, normalizedUrl)

      const result = await executeGraphQL<SiteSettings>(SITE_SETTINGS_QUERY)

      if (result.errors) {
        // Clear the failed session
        clearWordPressSession(event)

        return jsonResult({
          status: 'error',
          message: `Could not connect to WordPress at ${normalizedUrl}`,
          errors: result.errors.map(e => e.message),
          hints: [
            'Make sure WPGraphQL plugin is installed and activated',
            'Check that the GraphQL endpoint is accessible at /graphql',
            'Verify the URL is correct and the site is reachable'
          ]
        })
      }

      const settings = result.data?.generalSettings
      const siteName = settings?.title || normalizedUrl

      // Update session with site name
      setWordPressSession(event, normalizedUrl, siteName)

      return jsonResult({
        status: 'connected',
        wordpressUrl: normalizedUrl,
        siteName,
        siteDescription: settings?.description,
        siteLanguage: settings?.language,
        message: `Successfully connected to "${siteName}"`,
        hint: 'You can now use other WPNuxt tools. The WordPress URL is remembered for this session.'
      })
    } catch (error) {
      // Clear the failed session
      clearWordPressSession(event)

      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      return jsonResult({
        status: 'error',
        message: `Failed to connect to WordPress at ${normalizedUrl}`,
        error: errorMessage,
        hints: [
          'Check that the WordPress site is online',
          'Make sure WPGraphQL plugin is installed',
          'Verify the URL does not have a trailing slash',
          'Try accessing /graphql directly in a browser'
        ]
      })
    }
  }
})
