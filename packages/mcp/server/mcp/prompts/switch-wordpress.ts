import { z } from 'zod'

export default defineMcpPrompt({
  name: 'switch-wordpress',
  title: 'Switch WordPress Site',
  description: 'Switch to a different WordPress site or check current connection',
  inputSchema: {
    newWordpressUrl: z.string().url().optional().describe('New WordPress site URL to switch to (leave empty to check current connection)')
  },
  handler: async ({ newWordpressUrl }) => {
    if (newWordpressUrl) {
      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: `Please switch my WordPress connection to ${newWordpressUrl}.

After connecting to the new site:
1. Confirm the connection was successful
2. Show me the site name and description
3. List what content types are available
4. Let me know if there are any differences from my previous site`
            }
          }
        ]
      }
    }

    return {
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: `Please check my current WordPress connection status.

Show me:
1. Which WordPress site I'm connected to (if any)
2. When the connection was established
3. Whether I should reconnect or continue with this site

If I'm not connected, help me connect to a WordPress site.`
          }
        }
      ]
    }
  }
})
