/**
 * HTTP client for fetching Nuxt documentation
 * Provides access to Nuxt framework documentation at https://nuxt.com/docs/
 */

const NUXT_DOCS_BASE_URL = 'https://nuxt.com'
const NUXT_API_URL = 'https://api.nuxt.com'

export interface NuxtDocsPage {
  title: string
  description?: string
  content: string
  path: string
}

export interface NuxtDocsSection {
  title: string
  path: string
  children?: NuxtDocsSection[]
}

export interface NuxtModuleInfo {
  name: string
  description: string
  repo?: string
  npm?: string
  compatibility?: {
    nuxt: string
  }
}

/**
 * Fetch a documentation page from Nuxt docs
 */
export async function fetchNuxtDocsPage(path: string): Promise<NuxtDocsPage | null> {
  try {
    // Nuxt docs uses a content API, try multiple endpoints
    const cleanPath = path.replace(/^\/docs\/?/, '').replace(/^\//, '')

    // Try the Nuxt content API first
    const apiUrl = `${NUXT_API_URL}/api/content/docs/${cleanPath}`
    const response = await fetch(apiUrl, {
      headers: {
        Accept: 'application/json'
      }
    })

    if (response.ok) {
      const data = await response.json()
      return {
        title: data.title || cleanPath,
        description: data.description,
        content: data.body || data.content || '',
        path: `/docs/${cleanPath}`
      }
    }

    // Fallback: fetch the HTML page and extract content
    const htmlUrl = `${NUXT_DOCS_BASE_URL}/docs/${cleanPath}`
    const htmlResponse = await fetch(htmlUrl)

    if (htmlResponse.ok) {
      const html = await htmlResponse.text()
      return parseDocsFromHtml(html, `/docs/${cleanPath}`)
    }

    return null
  }
  catch (error) {
    console.error(`Failed to fetch Nuxt docs page ${path}:`, error)
    return null
  }
}

/**
 * Fetch the Nuxt getting started documentation
 */
export async function fetchNuxtGettingStarted(): Promise<NuxtDocsPage | null> {
  return fetchNuxtDocsPage('getting-started/installation')
}

/**
 * Fetch Nuxt configuration documentation
 */
export async function fetchNuxtConfigDocs(): Promise<NuxtDocsPage | null> {
  return fetchNuxtDocsPage('getting-started/configuration')
}

/**
 * Fetch Nuxt styling documentation
 */
export async function fetchNuxtStylingDocs(): Promise<NuxtDocsPage | null> {
  return fetchNuxtDocsPage('getting-started/styling')
}

/**
 * Fetch information about a Nuxt module
 */
export async function fetchNuxtModuleInfo(moduleName: string): Promise<NuxtModuleInfo | null> {
  try {
    // Use the Nuxt modules API
    const response = await fetch(`${NUXT_API_URL}/api/modules/${moduleName}`)

    if (response.ok) {
      const data = await response.json()
      return {
        name: data.name || moduleName,
        description: data.description || '',
        repo: data.repo,
        npm: data.npm,
        compatibility: data.compatibility
      }
    }

    return null
  }
  catch (error) {
    console.error(`Failed to fetch module info for ${moduleName}:`, error)
    return null
  }
}

/**
 * Search Nuxt documentation
 */
export async function searchNuxtDocs(query: string): Promise<NuxtDocsPage[]> {
  try {
    // Use Nuxt's search API if available
    const response = await fetch(`${NUXT_API_URL}/api/search?q=${encodeURIComponent(query)}`)

    if (response.ok) {
      const data = await response.json()
      return (data.results || []).map((result: Record<string, string>) => ({
        title: result.title,
        description: result.description,
        content: result.content || '',
        path: result.path || result.url
      }))
    }

    return []
  }
  catch (error) {
    console.error(`Failed to search Nuxt docs for "${query}":`, error)
    return []
  }
}

/**
 * Get Nuxt 4 specific setup requirements
 */
export async function getNuxt4SetupRequirements(): Promise<{
  nuxtConfig: Record<string, unknown>
  dependencies: string[]
  devDependencies: string[]
  directories: string[]
}> {
  // Nuxt 4 specific configuration
  return {
    nuxtConfig: {
      compatibilityDate: new Date().toISOString().split('T')[0],
      future: {
        compatibilityVersion: 4
      }
    },
    dependencies: ['nuxt', 'vue', 'vue-router'],
    devDependencies: ['typescript', 'vue-tsc'],
    directories: ['app', 'app/pages', 'app/components', 'app/layouts', 'app/composables', 'public', 'server']
  }
}

/**
 * Get CSS/styling setup for Nuxt with various frameworks
 */
export async function getNuxtCSSSetup(framework: 'tailwind' | 'nuxt-ui' | 'unocss' | 'none' = 'none'): Promise<{
  dependencies: string[]
  cssFile?: { path: string; content: string }
  nuxtConfig: Record<string, unknown>
  postcssConfig?: Record<string, unknown>
}> {
  switch (framework) {
    case 'nuxt-ui':
      return {
        dependencies: ['@nuxt/ui'],
        cssFile: {
          path: 'app/assets/css/main.css',
          content: '@import "tailwindcss";\n@import "@nuxt/ui";'
        },
        nuxtConfig: {
          modules: ['@nuxt/ui'],
          css: ['~/assets/css/main.css']
        }
      }

    case 'tailwind':
      return {
        dependencies: ['@nuxtjs/tailwindcss'],
        cssFile: {
          path: 'app/assets/css/main.css',
          content: '@import "tailwindcss";'
        },
        nuxtConfig: {
          modules: ['@nuxtjs/tailwindcss'],
          css: ['~/assets/css/main.css']
        }
      }

    case 'unocss':
      return {
        dependencies: ['@unocss/nuxt'],
        nuxtConfig: {
          modules: ['@unocss/nuxt']
        }
      }

    case 'none':
    default:
      return {
        dependencies: [],
        nuxtConfig: {}
      }
  }
}

/**
 * Parse documentation from HTML page
 */
function parseDocsFromHtml(html: string, path: string): NuxtDocsPage {
  // Extract title from HTML
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i)
  const title = titleMatch ? titleMatch[1].replace(' | Nuxt', '').trim() : path

  // Extract description from meta tag
  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
  const description = descMatch ? descMatch[1] : undefined

  // Extract main content - look for article or main content area
  let content = ''
  const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i)
  if (articleMatch) {
    content = stripHtmlTags(articleMatch[1])
  }
  else {
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
    if (mainMatch) {
      content = stripHtmlTags(mainMatch[1])
    }
  }

  return { title, description, content, path }
}

/**
 * Strip HTML tags from content
 */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Get recommended Nuxt project structure
 */
export function getNuxtProjectStructure(): {
  directories: string[]
  files: Array<{ path: string; description: string }>
} {
  return {
    directories: [
      'app',
      'app/assets',
      'app/assets/css',
      'app/components',
      'app/composables',
      'app/layouts',
      'app/pages',
      'app/plugins',
      'app/utils',
      'public',
      'server',
      'server/api',
      'server/middleware'
    ],
    files: [
      { path: 'nuxt.config.ts', description: 'Nuxt configuration file' },
      { path: 'app/app.vue', description: 'Root Vue component' },
      { path: 'app/app.config.ts', description: 'App configuration (optional)' },
      { path: 'tsconfig.json', description: 'TypeScript configuration' },
      { path: 'package.json', description: 'Node.js package configuration' },
      { path: '.env', description: 'Environment variables' },
      { path: '.gitignore', description: 'Git ignore patterns' }
    ]
  }
}
