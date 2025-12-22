import { z } from 'zod'

export default defineMcpPrompt({
  name: 'connect-wordpress',
  title: 'Connect to WordPress',
  description: 'Connect to a WordPress site with WPGraphQL to start building your WPNuxt project',
  inputSchema: {
    wordpressUrl: z.string().url().describe('Your WordPress site URL (e.g., https://your-site.com)')
  },
  handler: async ({ wordpressUrl }) => {
    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please connect me to my WordPress site at ${wordpressUrl} and show me what content and features are available.

After connecting:
1. List the content types (posts, pages, custom post types)
2. Show what menus are configured
3. Detect any plugins (WooCommerce, ACF, etc.)
4. Tell me what WPNuxt composables are available

Then ask if I'd like to generate a new WPNuxt project based on this WordPress site.`
          }
        }
      ]
    }
  }
})
