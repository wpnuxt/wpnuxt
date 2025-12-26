import { executeGraphQL, SITE_SETTINGS_QUERY } from '../../utils/graphql'

export default defineMcpTool({
  description: 'Fetch WordPress general settings including site title, description, URL, language, timezone, and reading settings.',
  async handler() {
    const result = await executeGraphQL<{
      generalSettings: {
        title: string
        description: string
        url: string
        language: string
        timezone: string
        dateFormat: string
        timeFormat: string
      }
      readingSettings: {
        postsPerPage: number
        showOnFront: string
        pageOnFront: number
        pageForPosts: number
      }
      discussionSettings: {
        defaultCommentStatus: string
      }
    }>(SITE_SETTINGS_QUERY)

    if (result.errors) {
      return textResult(`GraphQL Error: ${result.errors.map(e => e.message).join(', ')}`)
    }

    const data = result.data
    return jsonResult({
      general: {
        title: data?.generalSettings.title,
        description: data?.generalSettings.description,
        url: data?.generalSettings.url,
        language: data?.generalSettings.language,
        timezone: data?.generalSettings.timezone,
        dateFormat: data?.generalSettings.dateFormat,
        timeFormat: data?.generalSettings.timeFormat
      },
      reading: {
        postsPerPage: data?.readingSettings.postsPerPage,
        showOnFront: data?.readingSettings.showOnFront,
        pageOnFront: data?.readingSettings.pageOnFront,
        pageForPosts: data?.readingSettings.pageForPosts
      },
      discussion: {
        defaultCommentStatus: data?.discussionSettings.defaultCommentStatus
      }
    })
  }
})
