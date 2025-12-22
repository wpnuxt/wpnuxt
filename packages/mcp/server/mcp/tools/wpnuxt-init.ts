import { z } from 'zod'
import {
  executeGraphQL,
  CONTENT_TYPES_QUERY,
  TAXONOMIES_QUERY,
  MENUS_QUERY,
  SITE_SETTINGS_QUERY
} from '../../utils/graphql'
import { getNuxtUICSSSetup } from '../../utils/nuxt-ui-mcp'
import { getNuxtCSSSetup } from '../../utils/nuxt-docs'
import { getWordPressUrl } from '../../utils/wordpress-session'

interface ContentType {
  name: string
  graphqlSingleName: string
  graphqlPluralName: string
  hierarchical: boolean
}

// Built-in content types that WPNuxt already provides queries for
const BUILTIN_CONTENT_TYPES = ['post', 'page', 'attachment', 'nav_menu_item', 'revision']

/**
 * Generate GraphQL query file content for a custom post type
 * Uses interface fragments to only include fields the CPT actually supports
 */
function generateQueryForContentType(ct: ContentType): string {
  const singular = ct.graphqlSingleName
  const plural = ct.graphqlPluralName
  const singularCapitalized = singular.charAt(0).toUpperCase() + singular.slice(1)
  const pluralCapitalized = plural.charAt(0).toUpperCase() + plural.slice(1)

  // Use interface fragments - these only include fields if the type implements the interface
  // This handles CPTs that don't support all standard fields (title, excerpt, content, featured image)
  return `# ${pluralCapitalized} Queries
# Generated for custom post type: ${ct.name}
# Uses interface fragments for compatibility with CPT field support

fragment ${singularCapitalized} on ${singularCapitalized} {
  id
  databaseId
  slug
  uri
  date
  # Interface fragments - only included if CPT supports them
  ... on NodeWithTitle {
    title
  }
  ... on NodeWithContentEditor {
    content
  }
  ... on NodeWithExcerpt {
    excerpt
  }
  ... on NodeWithFeaturedImage {
    featuredImage {
      node {
        sourceUrl
        altText
        mediaDetails {
          width
          height
        }
      }
    }
  }
}

# List ${plural} with pagination
query ${pluralCapitalized}($first: Int = 10, $after: String) {
  ${plural}(first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    nodes {
      ...${singularCapitalized}
    }
  }
}

# Get single ${singular} by URI
query ${singularCapitalized}ByUri($uri: String!) {
  ${singular}(id: $uri, idType: URI) {
    ...${singularCapitalized}
  }
}

# Get single ${singular} by slug
query ${singularCapitalized}BySlug($slug: ID!) {
  ${singular}(id: $slug, idType: SLUG) {
    ...${singularCapitalized}
  }
}
`
}

interface Taxonomy {
  name: string
  graphqlSingleName: string
  graphqlPluralName: string
}

interface Menu {
  name: string
  slug: string
  locations: string[]
  menuItems: { nodes: Array<{ id: string }> }
}

interface SiteSettings {
  generalSettings: {
    title: string
    description: string
    url: string
    language: string
  }
  readingSettings: {
    showOnFront: string
    pageOnFront: number
    pageForPosts: number
  }
}

function generateNuxtConfig(settings: SiteSettings, wordpressUrl: string, includeNuxtUI: boolean): string {
  const modules = includeNuxtUI
    ? `['@nuxt/ui', '@wpnuxt/core']`
    : `['@wpnuxt/core']`

  // Add CSS reference when using Nuxt UI
  const cssConfig = includeNuxtUI
    ? `\n  css: ['~/assets/css/main.css'],\n`
    : ''

  return `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ${modules},
${cssConfig}
  wpNuxt: {
    wordpressUrl: process.env.WPNUXT_WORDPRESS_URL || '${wordpressUrl}',
  },

  devtools: { enabled: true },

  app: {
    head: {
      title: '${settings.generalSettings.title.replace(/'/g, '\\\'')}',
      meta: [
        { name: 'description', content: '${settings.generalSettings.description.replace(/'/g, '\\\'')}' }
      ],
      htmlAttrs: {
        lang: '${settings.generalSettings.language || 'en-US'}'
      }
    }
  },

  compatibilityDate: '${new Date().toISOString().split('T')[0]}'
})
`
}

function generateAppVue(includeNuxtUI: boolean): string {
  if (includeNuxtUI) {
    return `<template>
  <UApp>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
`
  }

  return `<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
`
}

function generateDefaultLayout(siteName: string, includeNuxtUI: boolean): string {
  if (includeNuxtUI) {
    return `<script setup lang="ts">
// Fetch the primary menu from WordPress
const { data: menu } = await useMenu({ name: 'main' })

// Transform WordPress menu items to Nuxt UI navigation format
const navigationItems = computed(() => {
  if (!menu.value?.length) {
    return [{ label: 'Home', to: '/' }]
  }

  // Transform menu items to Nuxt UI format
  return menu.value
    .filter(item => !item.parentId) // Only top-level items
    .map(item => ({
      label: item.label,
      to: item.uri,
      children: item.childItems?.nodes?.map(child => ({
        label: child.label,
        to: child.uri
      }))
    }))
})
</script>

<template>
  <UContainer>
    <UHeader>
      <template #left>
        <NuxtLink to="/" class="text-xl font-bold">
          ${siteName}
        </NuxtLink>
      </template>

      <template #right>
        <UNavigationMenu :items="navigationItems" />
      </template>
    </UHeader>

    <UMain>
      <slot />
    </UMain>

    <UFooter>
      <template #left>
        <p class="text-sm text-muted">
          &copy; {{ new Date().getFullYear() }} ${siteName}
        </p>
      </template>
      <template #right>
        <p class="text-sm text-muted">
          Powered by WPNuxt
        </p>
      </template>
    </UFooter>
  </UContainer>
</template>
`
  }

  return `<script setup lang="ts">
const mobileMenuOpen = ref(false)
</script>

<template>
  <div class="app-layout">
    <header class="app-header">
      <div class="header-container">
        <NuxtLink to="/" class="logo">
          ${siteName}
        </NuxtLink>
        <!-- Add navigation components here -->
      </div>
    </header>

    <main class="app-main">
      <slot />
    </main>

    <footer class="app-footer">
      <div class="footer-container">
        <p>&copy; {{ new Date().getFullYear() }} ${siteName}</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  border-bottom: 1px solid #eee;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  font-size: 1.25rem;
  font-weight: bold;
  text-decoration: none;
  color: inherit;
}

.app-main {
  flex: 1;
}

.app-footer {
  border-top: 1px solid #eee;
  padding: 2rem 0;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;
}
</style>
`
}

function generateHomePage(includeNuxtUI: boolean): string {
  if (includeNuxtUI) {
    return `<script setup lang="ts">
// Fetch latest posts for the home page
const { data: posts, pending, error } = await useLazyPosts({
  first: 10
})

// Transform WordPress posts to Nuxt UI BlogPost format
const blogPosts = computed(() => {
  if (!posts.value) return []

  return posts.value.map(post => ({
    title: post.title,
    description: post.excerpt?.replace(/<[^>]*>/g, '').slice(0, 200) || '',
    date: post.date,
    image: post.featuredImage?.node?.sourceUrl,
    to: post.uri,
    authors: post.author?.node ? [{
      name: post.author.node.name,
      avatar: { src: post.author.node.avatar?.url }
    }] : undefined
  }))
})

useSeoMeta({
  title: 'Home'
})
</script>

<template>
  <UPage>
    <UPageHero
      title="Latest Posts"
      description="Discover our latest articles and updates"
    />

    <UPageBody>
      <div v-if="pending" class="flex justify-center py-12">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        icon="i-heroicons-exclamation-triangle"
        title="Error loading posts"
        :description="error.message"
      />

      <UBlogPosts v-else-if="blogPosts.length">
        <UBlogPost
          v-for="(post, index) in blogPosts"
          :key="index"
          :title="post.title"
          :description="post.description"
          :date="post.date"
          :image="post.image"
          :to="post.to"
          :authors="post.authors"
        />
      </UBlogPosts>

      <UAlert
        v-else
        color="neutral"
        icon="i-heroicons-document-text"
        title="No posts found"
        description="Check back later for new content."
      />
    </UPageBody>
  </UPage>
</template>
`
  }

  return `<script setup lang="ts">
// Fetch latest posts for the home page
const { data: posts, pending, error } = await useLazyPosts({
  first: 10
})

useSeoMeta({
  title: 'Home'
})
</script>

<template>
  <div class="home-page">
    <h1>Latest Posts</h1>

    <div v-if="pending" class="loading">
      Loading posts...
    </div>

    <div v-else-if="error" class="error">
      Error loading posts: {{ error.message }}
    </div>

    <div v-else-if="posts?.length" class="posts-grid">
      <article v-for="post in posts" :key="post.id" class="post-card">
        <NuxtLink :to="post.uri">
          <img
            v-if="post.featuredImage?.node"
            :src="post.featuredImage.node.sourceUrl"
            :alt="post.featuredImage.node.altText || post.title"
            class="post-image"
          />
          <h2>{{ post.title }}</h2>
          <div v-if="post.excerpt" v-html="post.excerpt" class="post-excerpt" />
        </NuxtLink>
      </article>
    </div>

    <p v-else>No posts found.</p>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.posts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.post-card {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.post-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.post-card a {
  text-decoration: none;
  color: inherit;
}

.post-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.post-card h2 {
  padding: 1rem;
  margin: 0;
  font-size: 1.25rem;
}

.post-excerpt {
  padding: 0 1rem 1rem;
  color: #666;
  font-size: 0.9rem;
}

.post-excerpt :deep(p) {
  margin: 0;
}
</style>
`
}

function generateEnvFile(wordpressUrl: string): string {
  return `# WordPress Configuration
WPNUXT_WORDPRESS_URL=${wordpressUrl}

# Optional: Enable debug mode
# WPNUXT_DEBUG=true
`
}

function generateGitignore(): string {
  return `# Nuxt dev/build outputs
.output
.data
.nuxt
.nitro
.cache
dist

# Node dependencies
node_modules

# Logs
logs
*.log

# Misc
.DS_Store
.fleet
.idea

# Local env files
.env
.env.*
!.env.example

# VS Code
.vscode/*
!.vscode/extensions.json
`
}

/**
 * Generate main.css content for Nuxt UI setup.
 * Attempts to fetch the latest setup from Nuxt UI MCP server,
 * falls back to Nuxt docs, then to default values.
 */
async function generateMainCSS(): Promise<string> {
  // Try to get CSS setup from Nuxt UI MCP server
  try {
    const nuxtUICss = await getNuxtUICSSSetup()
    if (nuxtUICss?.imports.length) {
      return nuxtUICss.imports.join('\n')
    }
  } catch {
    console.log('Nuxt UI MCP server not available, trying Nuxt docs...')
  }

  // Try to get CSS setup from Nuxt docs
  try {
    const nuxtCss = await getNuxtCSSSetup('nuxt-ui')
    if (nuxtCss?.cssFile?.content) {
      return nuxtCss.cssFile.content
    }
  } catch {
    console.log('Nuxt docs not available, using defaults...')
  }

  // Default CSS imports for Nuxt UI v3
  return `@import "tailwindcss";
@import "@nuxt/ui";`
}

export default defineMcpTool({
  description: `Generate WPNuxt project files based on WordPress site analysis. Returns all files as output for the AI assistant to create locally.

IMPORTANT: Before calling this tool, the AI assistant MUST present ALL options to the user and ask for confirmation:

1. Project folder name (suggest based on context, but let user confirm or change)
2. Package manager: pnpm, npm, yarn, or bun (default: pnpm)
3. Include Nuxt UI v4? (adds ready-to-use blog components)
4. Generate pages? (blog archive and single post pages)
5. Generate components? (post cards and taxonomy lists)
6. Setup menus? (WordPress navigation menus)
7. Generate queries? (custom GraphQL queries for content types)

Example prompt to user:
"I'll create a WPNuxt project with these settings:
- Folder name: [suggested-name]
- Package manager: pnpm
- Include Nuxt UI: Yes
- Generate pages: Yes
- Generate components: Yes
- Setup menus: Yes
- Generate queries: Yes

Would you like to change any of these?"

NEVER call this tool without user confirmation of the settings first.

AFTER calling this tool: If the response contains "userQuestions", the AI MUST ask the user these questions about how to display custom post type content. Use the suggested questions to understand:
- Display style preference (grid, list, cards)
- Whether archive pages are needed
- What routes/URLs to use
Then use wpnuxt_generate_pages with these preferences to create the appropriate pages.`,
  inputSchema: {
    projectName: z.string().min(1).describe('Project folder name - CONFIRM WITH USER'),
    packageManager: z.enum(['pnpm', 'npm', 'yarn', 'bun']).optional().describe('Package manager - CONFIRM WITH USER (default: pnpm)'),
    includeNuxtUI: z.boolean().optional().describe('Include Nuxt UI v4 for styled components (default: true)'),
    generatePages: z.boolean().optional().describe('Generate blog archive and single post pages - CONFIRM WITH USER (default: true)'),
    generateComponents: z.boolean().optional().describe('Generate post cards and taxonomy list components - CONFIRM WITH USER (default: true)'),
    setupMenus: z.boolean().optional().describe('Generate WordPress navigation menu components - CONFIRM WITH USER (default: true)'),
    generateQueries: z.boolean().optional().describe('Generate custom GraphQL queries for content types - CONFIRM WITH USER (default: true)')
  },
  async handler({ projectName, packageManager = 'pnpm', includeNuxtUI = true, generatePages = true, generateComponents = true, setupMenus = true, generateQueries = true }) {
    // Get WordPress URL from session, header, or environment
    const event = useEvent()
    const wordpressUrl = getWordPressUrl(event)

    if (!wordpressUrl) {
      return textResult('Error: WordPress URL not configured. Use wp_connect first to connect to a WordPress site.')
    }

    // Analyze WordPress site
    const [ctResult, taxResult, menuResult, settingsResult] = await Promise.all([
      executeGraphQL<{ contentTypes: { nodes: ContentType[] } }>(CONTENT_TYPES_QUERY),
      executeGraphQL<{ taxonomies: { nodes: Taxonomy[] } }>(TAXONOMIES_QUERY),
      executeGraphQL<{ menus: { nodes: Menu[] } }>(MENUS_QUERY),
      executeGraphQL<SiteSettings>(SITE_SETTINGS_QUERY)
    ])

    if (ctResult.errors) {
      return textResult(`GraphQL Error: ${ctResult.errors.map(e => e.message).join(', ')}. Is WPGraphQL installed?`)
    }

    const contentTypes = ctResult.data?.contentTypes.nodes ?? []
    const taxonomies = taxResult.data?.taxonomies.nodes ?? []
    const menus = menuResult.data?.menus.nodes ?? []
    const settings = settingsResult.data ?? {
      generalSettings: { title: projectName, description: '', url: wordpressUrl, language: 'en-US' },
      readingSettings: { showOnFront: 'posts', pageOnFront: 0, pageForPosts: 0 }
    }

    // Generate package.json
    // IMPORTANT: Update these versions when releasing new versions
    const dependencies: Record<string, string> = {
      '@wpnuxt/core': '2.0.0-alpha.1',
      'nuxt': '^4.2.2',
      'vue': '^3.5.13'
    }

    if (includeNuxtUI) {
      dependencies['@nuxt/ui'] = '^4.3.0'
      // Tailwind must be explicitly added for pnpm (peer dependency not auto-installed)
      dependencies['tailwindcss'] = '^4.0.17'
    }

    // Package manager versions (updated December 2025)
    const packageManagerVersions: Record<string, string> = {
      pnpm: 'pnpm@10.26.1',
      npm: 'npm@11.7.0',
      yarn: 'yarn@4.12.0',
      bun: 'bun@1.3.5'
    }

    const packageJson: Record<string, unknown> = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      private: true,
      type: 'module',
      packageManager: packageManagerVersions[packageManager],
      scripts: {
        'build': 'nuxt build',
        'dev': 'nuxt dev',
        'generate': 'nuxt generate',
        'preview': 'nuxt preview',
        'postinstall': 'nuxt prepare',
        'dev:prepare': 'nuxt prepare'
      },
      dependencies,
      devDependencies: {
        typescript: '^5.7.0'
      }
    }

    // Generate all files (Nuxt 4 structure with app/ directory)
    const files: Array<{ path: string, content: string }> = [
      { path: 'package.json', content: JSON.stringify(packageJson, null, 2) },
      { path: 'nuxt.config.ts', content: generateNuxtConfig(settings, wordpressUrl, includeNuxtUI) },
      { path: 'app/app.vue', content: generateAppVue(includeNuxtUI) },
      { path: 'app/layouts/default.vue', content: generateDefaultLayout(settings.generalSettings.title, includeNuxtUI) },
      { path: 'app/pages/index.vue', content: generateHomePage(includeNuxtUI) },
      { path: '.env', content: generateEnvFile(wordpressUrl) },
      { path: '.env.example', content: generateEnvFile(wordpressUrl) },
      { path: '.gitignore', content: generateGitignore() },
      { path: 'tsconfig.json', content: '{\n  "extends": "./.nuxt/tsconfig.json"\n}\n' },
      { path: 'server/tsconfig.json', content: '{\n  "extends": "../.nuxt/tsconfig.server.json"\n}\n' }
    ]

    // Add main.css for Nuxt UI (fetches setup from Nuxt UI MCP or Nuxt docs)
    if (includeNuxtUI) {
      const mainCssContent = await generateMainCSS()
      files.push({ path: 'app/assets/css/main.css', content: mainCssContent })
    }

    // Detect custom post types and generate queries for them
    // Queries go in app/extend/queries/ since srcDir is 'app' in Nuxt 4
    const customPostTypes = contentTypes.filter(ct => !BUILTIN_CONTENT_TYPES.includes(ct.name))
    if (generateQueries && customPostTypes.length > 0) {
      for (const ct of customPostTypes) {
        const queryContent = generateQueryForContentType(ct)
        const filename = ct.graphqlPluralName.charAt(0).toUpperCase() + ct.graphqlPluralName.slice(1)
        files.push({
          path: `app/extend/queries/${filename}.gql`,
          content: queryContent
        })
      }
    }

    // Build install commands
    const installCommands: Record<string, string> = {
      pnpm: 'pnpm install',
      npm: 'npm install',
      yarn: 'yarn install',
      bun: 'bun install'
    }

    const prepareCommands: Record<string, string> = {
      pnpm: 'pnpm run dev:prepare',
      npm: 'npm run dev:prepare',
      yarn: 'yarn dev:prepare',
      bun: 'bun run dev:prepare'
    }

    const devCommands: Record<string, string> = {
      pnpm: 'pnpm run dev',
      npm: 'npm run dev',
      yarn: 'yarn dev',
      bun: 'bun run dev'
    }

    // Build next steps based on selected options
    const followUpTools: string[] = []
    // Only suggest wpnuxt_generate_queries if no custom post types were found (nothing to generate inline)
    if (generateQueries && customPostTypes.length === 0) {
      followUpTools.push('wpnuxt_generate_queries - Generate GraphQL queries for content types')
    }
    if (generatePages) {
      followUpTools.push('wpnuxt_generate_pages - Generate blog archive and single post pages')
    }
    if (generateComponents) {
      followUpTools.push('wpnuxt_generate_components - Generate post cards and taxonomy lists')
    }
    if (setupMenus) {
      followUpTools.push('wpnuxt_setup_menus - Generate navigation menu components')
    }

    return jsonResult({
      projectName,
      options: {
        includeNuxtUI,
        generatePages,
        generateComponents,
        setupMenus,
        generateQueries
      },
      wordpress: {
        url: wordpressUrl,
        title: settings.generalSettings.title,
        contentTypes: contentTypes.map(ct => ct.name),
        customPostTypes: customPostTypes.map(ct => ({
          name: ct.name,
          singular: ct.graphqlSingleName,
          plural: ct.graphqlPluralName,
          queryFile: `app/extend/queries/${ct.graphqlPluralName.charAt(0).toUpperCase() + ct.graphqlPluralName.slice(1)}.gql`
        })),
        taxonomies: taxonomies.map(t => t.name),
        menus: menus.map(m => m.name)
      },
      files: files.map(f => ({
        path: f.path,
        content: f.content
      })),
      directories: [
        'app/layouts',
        'app/pages',
        'app/components',
        'app/composables',
        ...(includeNuxtUI ? ['app/assets', 'app/assets/css'] : []),
        'app/extend/queries',
        'public',
        'server'
      ],
      setup: {
        step1: `Create project directory: mkdir ${projectName} && cd ${projectName}`,
        step2: `Install dependencies: ${installCommands[packageManager]}`,
        step3: `Prepare project: ${prepareCommands[packageManager]}`,
        step4: `Start dev server: ${devCommands[packageManager]}`
      },
      followUpTools: followUpTools.length > 0 ? followUpTools : undefined,
      instructions: followUpTools.length > 0
        ? `After creating the base project files, call these tools in order:\n${followUpTools.map((t, i) => `${i + 1}. ${t}`).join('\n')}`
        : 'Base project complete. No additional tools requested.',
      // When custom post types are found, prompt the AI to ask the user about display preferences
      userQuestions: customPostTypes.length > 0
        ? {
            prompt: 'Custom post types were detected. Ask the user how they want to display this content:',
            contentTypes: customPostTypes.map(ct => ({
              name: ct.name,
              plural: ct.graphqlPluralName,
              singular: ct.graphqlSingleName,
              suggestedQuestions: [
                `How should "${ct.graphqlPluralName}" be displayed? (grid of cards, simple list, or detailed list with images)`,
                `Should there be an archive page listing all ${ct.graphqlPluralName}?`,
                `What route should ${ct.graphqlPluralName} use? (e.g., /${ct.graphqlPluralName}/ or /shop/ for products)`
              ]
            }))
          }
        : undefined
    })
  }
})
