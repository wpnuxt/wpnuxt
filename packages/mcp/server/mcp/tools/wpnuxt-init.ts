import { z } from 'zod'
import {
  executeGraphQL,
  CONTENT_TYPES_QUERY,
  TAXONOMIES_QUERY,
  MENUS_QUERY,
  SITE_SETTINGS_QUERY
} from '../../utils/graphql'

interface ContentType {
  name: string
  graphqlSingleName: string
  graphqlPluralName: string
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

  return `// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ${modules},

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
const links = [
  { label: 'Home', to: '/' },
  { label: 'Blog', to: '/blog' }
]
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
        <UNavigationMenu :items="links" />
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
- Include Nuxt UI: No
- Generate pages: Yes
- Generate components: Yes
- Setup menus: Yes
- Generate queries: Yes

Would you like to change any of these?"

NEVER call this tool without user confirmation of the settings first.`,
  inputSchema: {
    projectName: z.string().min(1).describe('Project folder name - CONFIRM WITH USER'),
    packageManager: z.enum(['pnpm', 'npm', 'yarn', 'bun']).optional().describe('Package manager - CONFIRM WITH USER (default: pnpm)'),
    includeNuxtUI: z.boolean().optional().describe('Include Nuxt UI v4 - CONFIRM WITH USER (default: false)'),
    generatePages: z.boolean().optional().describe('Generate blog archive and single post pages - CONFIRM WITH USER (default: true)'),
    generateComponents: z.boolean().optional().describe('Generate post cards and taxonomy list components - CONFIRM WITH USER (default: true)'),
    setupMenus: z.boolean().optional().describe('Generate WordPress navigation menu components - CONFIRM WITH USER (default: true)'),
    generateQueries: z.boolean().optional().describe('Generate custom GraphQL queries for content types - CONFIRM WITH USER (default: true)')
  },
  async handler({ projectName, packageManager = 'pnpm', includeNuxtUI = false, generatePages = true, generateComponents = true, setupMenus = true, generateQueries = true }) {
    // Get WordPress URL from request headers
    const event = useEvent()
    const wordpressUrl = getHeader(event, 'x-wordpress-url') || useRuntimeConfig().wordpressUrl

    if (!wordpressUrl) {
      return textResult('Error: WordPress URL not configured. Set X-WordPress-URL header.')
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

    // Get @wpnuxt/core version from runtime config (matches @wpnuxt/mcp version)
    const wpnuxtVersion = useRuntimeConfig().wpnuxtVersion || '2.0.0-alpha.1'

    // Generate package.json
    const dependencies: Record<string, string> = {
      '@wpnuxt/core': wpnuxtVersion,
      'nuxt': '^4.2.0',
      'vue': '^3.5.0'
    }

    if (includeNuxtUI) {
      dependencies['@nuxt/ui'] = '^4.3.0'
    }

    const packageJson = {
      name: projectName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      private: true,
      type: 'module',
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
    if (generateQueries) {
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
        'extend/queries',
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
        : 'Base project complete. No additional tools requested.'
    })
  }
})
