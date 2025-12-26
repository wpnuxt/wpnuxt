import { z } from 'zod'

/**
 * Migration patterns for WPNuxt 1.x to 2.x
 *
 * Each pattern specifies what to look for and how to fix it.
 */
const MIGRATION_PATTERNS = {
  composables: [
    {
      v1: 'useFeaturedImage',
      v2: null, // Removed - needs helper
      description: 'Extract featured image URL from post',
      replacement: 'Access post.featuredImage?.node?.sourceUrl directly or create a helper',
      helperCode: `export function useFeaturedImage(post: { featuredImage?: { node?: { sourceUrl?: string } } } | undefined): string | undefined {
  return post?.featuredImage?.node?.sourceUrl
}`
    },
    {
      v1: 'useWPUri',
      v2: null, // Removed - needs helper
      description: 'Get WordPress URL from runtime config',
      replacement: 'Use useRuntimeConfig().public.wordpressUrl',
      helperCode: `export function useWPUri() {
  return useRuntimeConfig().public.wordpressUrl
}`
    },
    {
      v1: 'usePrevNextPost',
      v2: null, // Removed - needs helper
      description: 'Get previous and next posts for navigation',
      replacement: 'Implement with usePosts() or create a custom query',
      helperCode: null // Too complex for auto-generation
    },
    {
      v1: 'isStaging',
      v2: null,
      description: 'Check if running in staging mode',
      replacement: 'Use process.env.NODE_ENV !== "production" or a custom env variable',
      helperCode: `export function isStaging() {
  return process.env.NODE_ENV !== 'production' || process.env.STAGING === 'true'
}`
    },
    {
      v1: /useWP(\w+)/,
      v2: 'use$1',
      description: 'Composable prefix changed from useWP to use',
      replacement: 'Rename useWPPosts to usePosts, useWPPages to usePages, etc.'
    },
    {
      v1: /useAsyncWP(\w+)/,
      v2: 'useLazy$1',
      description: 'Async composable naming changed',
      replacement: 'Rename useAsyncWPPosts to useLazyPosts, etc.'
    },
    {
      v1: /useAsync(\w+)(?!WP)/,
      v2: 'useLazy$1',
      description: 'Async variant renamed to Lazy',
      replacement: 'Rename useAsyncPosts to useLazyPosts, etc.'
    }
  ],
  directives: [
    {
      v1: 'v-sanitize',
      v2: 'v-sanitize-html',
      description: 'Sanitize directive renamed',
      replacement: 'Change v-sanitize to v-sanitize-html'
    }
  ],
  config: [
    {
      v1: 'frontendUrl',
      v2: null,
      description: 'frontendUrl config removed',
      replacement: 'Add to runtimeConfig.public if needed'
    },
    {
      v1: 'defaultMenuName',
      v2: null,
      description: 'defaultMenuName config removed',
      replacement: 'Pass menu name directly to useMenu()'
    },
    {
      v1: 'enableCache',
      v2: 'cache.enabled',
      description: 'Cache config restructured',
      replacement: 'Move to cache: { enabled: true }'
    },
    {
      v1: 'cacheMaxAge',
      v2: 'cache.maxAge',
      description: 'Cache config restructured',
      replacement: 'Move to cache: { maxAge: 300 }'
    },
    {
      v1: 'composablesPrefix',
      v2: null,
      description: 'composablesPrefix config removed',
      replacement: 'Composables now use fixed "use" prefix'
    },
    {
      v1: 'logLevel',
      v2: 'debug',
      description: 'logLevel replaced with debug boolean',
      replacement: 'Use debug: true/false instead'
    },
    {
      v1: 'staging',
      v2: null,
      description: 'staging config removed',
      replacement: 'Use environment variables instead'
    },
    {
      v1: 'extendDir',
      v2: 'extendFolder',
      description: 'Query config renamed',
      replacement: 'Rename extendDir to extendFolder'
    },
    {
      v1: 'outputDir',
      v2: 'mergedOutputFolder',
      description: 'Query config renamed',
      replacement: 'Rename outputDir to mergedOutputFolder'
    }
  ],
  components: [
    {
      v1: '<WPContent',
      v2: null,
      description: 'WPContent component removed',
      replacement: 'Use v-sanitize-html directive or @wpnuxt/blocks'
    },
    {
      v1: '<ContentRenderer',
      v2: null,
      description: 'ContentRenderer component removed',
      replacement: 'Use v-sanitize-html directive'
    },
    {
      v1: '<StagingBanner',
      v2: null,
      description: 'StagingBanner component removed',
      replacement: 'Implement yourself if needed'
    }
  ]
}

interface MigrationIssue {
  file: string
  line?: number
  pattern: string
  category: 'composable' | 'directive' | 'config' | 'component'
  severity: 'error' | 'warning' | 'info'
  description: string
  replacement: string
  autoFixable: boolean
}

interface HelperFile {
  path: string
  content: string
  description: string
}

function generateHelperFiles(issues: MigrationIssue[]): HelperFile[] {
  const helpers: HelperFile[] = []
  const neededHelpers = new Set<string>()

  for (const issue of issues) {
    if (issue.category === 'composable') {
      neededHelpers.add(issue.pattern)
    }
  }

  const composablesContent: string[] = []

  if (neededHelpers.has('useFeaturedImage')) {
    composablesContent.push(`/**
 * Extract featured image URL from a post object.
 * Migration helper from WPNuxt 1.x
 */
export function useFeaturedImage(post: { featuredImage?: { node?: { sourceUrl?: string } } } | undefined): string | undefined {
  return post?.featuredImage?.node?.sourceUrl
}`)
  }

  if (neededHelpers.has('useWPUri')) {
    composablesContent.push(`/**
 * Get WordPress URL from runtime config.
 * Migration helper from WPNuxt 1.x
 */
export function useWPUri() {
  return useRuntimeConfig().public.wordpressUrl
}`)
  }

  if (neededHelpers.has('isStaging')) {
    composablesContent.push(`/**
 * Check if running in staging mode.
 * Migration helper from WPNuxt 1.x
 */
export function isStaging() {
  return process.env.NODE_ENV !== 'production' || process.env.STAGING === 'true'
}`)
  }

  if (composablesContent.length > 0) {
    helpers.push({
      path: 'app/composables/wpnuxt-compat.ts',
      content: `// WPNuxt v1 → v2 Migration Helpers
// These composables provide backward compatibility with WPNuxt 1.x
// You can remove this file once you've updated your code to use v2 patterns

${composablesContent.join('\n\n')}
`,
      description: 'Compatibility composables for WPNuxt 1.x patterns'
    })
  }

  return helpers
}

function scanContent(content: string, filename: string): MigrationIssue[] {
  const issues: MigrationIssue[] = []
  const lines = content.split('\n')

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Check composables
    for (const pattern of MIGRATION_PATTERNS.composables) {
      if (typeof pattern.v1 === 'string') {
        if (line.includes(pattern.v1)) {
          issues.push({
            file: filename,
            line: lineNum,
            pattern: pattern.v1,
            category: 'composable',
            severity: pattern.v2 === null ? 'error' : 'warning',
            description: pattern.description,
            replacement: pattern.replacement,
            autoFixable: pattern.v2 !== null && typeof pattern.v2 === 'string'
          })
        }
      } else if (pattern.v1 instanceof RegExp) {
        const match = line.match(pattern.v1)
        if (match) {
          const isNewPattern = pattern.v2 && line.includes(match[0].replace(pattern.v1, pattern.v2 as string))
          if (!isNewPattern) {
            issues.push({
              file: filename,
              line: lineNum,
              pattern: match[0],
              category: 'composable',
              severity: 'warning',
              description: pattern.description,
              replacement: pattern.replacement,
              autoFixable: true
            })
          }
        }
      }
    }

    // Check directives
    for (const pattern of MIGRATION_PATTERNS.directives) {
      if (line.includes(pattern.v1) && !line.includes(pattern.v2!)) {
        issues.push({
          file: filename,
          line: lineNum,
          pattern: pattern.v1,
          category: 'directive',
          severity: 'error',
          description: pattern.description,
          replacement: pattern.replacement,
          autoFixable: true
        })
      }
    }

    // Check components
    for (const pattern of MIGRATION_PATTERNS.components) {
      if (line.includes(pattern.v1)) {
        issues.push({
          file: filename,
          line: lineNum,
          pattern: pattern.v1,
          category: 'component',
          severity: 'error',
          description: pattern.description,
          replacement: pattern.replacement,
          autoFixable: false
        })
      }
    }
  }

  return issues
}

function scanConfigContent(content: string, filename: string): MigrationIssue[] {
  const issues: MigrationIssue[] = []

  for (const pattern of MIGRATION_PATTERNS.config) {
    if (content.includes(pattern.v1)) {
      issues.push({
        file: filename,
        pattern: pattern.v1,
        category: 'config',
        severity: pattern.v2 === null ? 'error' : 'warning',
        description: pattern.description,
        replacement: pattern.replacement,
        autoFixable: pattern.v2 !== null
      })
    }
  }

  return issues
}

export default defineMcpTool({
  description: `Analyze a project for WPNuxt v1 patterns and generate a migration report with compatibility helpers.

This tool scans for:
- Removed composables (useFeaturedImage, useWPUri, usePrevNextPost, isStaging)
- Renamed composables (useWPPosts → usePosts, useAsyncWPPosts → useLazyPosts)
- Renamed directives (v-sanitize → v-sanitize-html)
- Removed components (<WPContent>, <ContentRenderer>, <StagingBanner>)
- Changed configuration options

Returns:
- List of issues found with file locations
- Severity levels (error = breaking, warning = needs attention)
- Auto-fix suggestions
- Generated compatibility helper file content

The AI assistant should:
1. Create the compatibility helpers if any removed composables are used
2. Help update renamed composables
3. Update the nuxt.config.ts if needed`,
  inputSchema: {
    fileContents: z.array(z.object({
      path: z.string().describe('File path relative to project root'),
      content: z.string().describe('File content to scan')
    })).describe('Files to scan for v1 patterns. Include Vue components, composables, and nuxt.config.ts'),
    generateHelpers: z.boolean().optional().describe('Generate compatibility helper files (default: true)')
  },
  handler({ fileContents, generateHelpers = true }) {
    const allIssues: MigrationIssue[] = []

    for (const file of fileContents) {
      // Scan Vue files and TypeScript files
      if (file.path.endsWith('.vue') || file.path.endsWith('.ts') || file.path.endsWith('.js')) {
        allIssues.push(...scanContent(file.content, file.path))
      }

      // Scan config files for config patterns
      if (file.path.includes('nuxt.config')) {
        allIssues.push(...scanConfigContent(file.content, file.path))
      }
    }

    // Group issues by category
    const issuesByCategory = {
      composable: allIssues.filter(i => i.category === 'composable'),
      directive: allIssues.filter(i => i.category === 'directive'),
      config: allIssues.filter(i => i.category === 'config'),
      component: allIssues.filter(i => i.category === 'component')
    }

    // Count by severity
    const errorCount = allIssues.filter(i => i.severity === 'error').length
    const warningCount = allIssues.filter(i => i.severity === 'warning').length

    // Generate helper files if needed
    const helperFiles = generateHelpers ? generateHelperFiles(allIssues) : []

    // Generate summary
    const summary = {
      totalIssues: allIssues.length,
      errors: errorCount,
      warnings: warningCount,
      autoFixable: allIssues.filter(i => i.autoFixable).length,
      needsManualFix: allIssues.filter(i => !i.autoFixable).length
    }

    // Generate migration steps
    const migrationSteps: string[] = []

    if (issuesByCategory.config.length > 0) {
      migrationSteps.push('1. Update nuxt.config.ts with new option names and structure')
    }

    if (helperFiles.length > 0) {
      migrationSteps.push(`2. Create compatibility helpers: ${helperFiles.map(f => f.path).join(', ')}`)
    }

    if (issuesByCategory.composable.filter(i => i.autoFixable).length > 0) {
      migrationSteps.push('3. Rename composables: useWP* → use*, useAsync* → useLazy*')
    }

    if (issuesByCategory.directive.length > 0) {
      migrationSteps.push('4. Update directives: v-sanitize → v-sanitize-html')
    }

    if (issuesByCategory.component.length > 0) {
      migrationSteps.push('5. Replace removed components with v-sanitize-html or @wpnuxt/blocks')
    }

    migrationSteps.push('6. Run pnpm dev:prepare to regenerate types')
    migrationSteps.push('7. Test all pages')

    return jsonResult({
      summary,
      migrationSteps,
      issues: {
        composables: issuesByCategory.composable,
        directives: issuesByCategory.directive,
        config: issuesByCategory.config,
        components: issuesByCategory.component
      },
      helperFiles: helperFiles.length > 0 ? helperFiles : undefined,
      migrationGuideUrl: 'https://wpnuxt.com/migration/v1-to-v2'
    })
  }
})
