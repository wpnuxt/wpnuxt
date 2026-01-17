import { z } from 'zod'

/**
 * Complete list of WPNuxt composable renames from v1 to v2
 * The prefix changed from 'useWP' to 'use' and 'useAsyncWP' to 'useLazy'
 */
const COMPOSABLE_RENAMES: Record<string, string> = {
  // Sync composables: useWP* → use*
  useWPMenu: 'useMenu',
  useWPPosts: 'usePosts',
  useWPPages: 'usePages',
  useWPPostByUri: 'usePostByUri',
  useWPPostById: 'usePostById',
  useWPPageByUri: 'usePageByUri',
  useWPPageById: 'usePageById',
  useWPNodeByUri: 'useNodeByUri',
  useWPGeneralSettings: 'useGeneralSettings',
  useWPViewer: 'useViewer',
  useWPRevisions: 'useRevisions',
  useWPPostsByCategoryName: 'usePostsByCategoryName',
  useWPPostsByCategoryId: 'usePostsByCategoryId',

  // Async composables: useAsyncWP* → useLazy*
  useAsyncWPMenu: 'useLazyMenu',
  useAsyncWPPosts: 'useLazyPosts',
  useAsyncWPPages: 'useLazyPages',
  useAsyncWPPostByUri: 'useLazyPostByUri',
  useAsyncWPPostById: 'useLazyPostById',
  useAsyncWPPageByUri: 'useLazyPageByUri',
  useAsyncWPPageById: 'useLazyPageById',
  useAsyncWPNodeByUri: 'useLazyNodeByUri',
  useAsyncWPGeneralSettings: 'useLazyGeneralSettings',
  useAsyncWPViewer: 'useLazyViewer',
  useAsyncWPRevisions: 'useLazyRevisions',
  useAsyncWPPostsByCategoryName: 'useLazyPostsByCategoryName',
  useAsyncWPPostsByCategoryId: 'useLazyPostsByCategoryId',

  // useAsync* without WP → useLazy* (for projects that already dropped WP prefix)
  useAsyncMenu: 'useLazyMenu',
  useAsyncPosts: 'useLazyPosts',
  useAsyncPages: 'useLazyPages',
  useAsyncPostByUri: 'useLazyPostByUri',
  useAsyncPostById: 'useLazyPostById',
  useAsyncPageByUri: 'useLazyPageByUri',
  useAsyncPageById: 'useLazyPageById',
  useAsyncNodeByUri: 'useLazyNodeByUri',
  useAsyncGeneralSettings: 'useLazyGeneralSettings',
  useAsyncViewer: 'useLazyViewer',
  useAsyncRevisions: 'useLazyRevisions',
  useAsyncPostsByCategoryName: 'useLazyPostsByCategoryName',
  useAsyncPostsByCategoryId: 'useLazyPostsByCategoryId'
}

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
  const imageUrl = post?.featuredImage?.node?.sourceUrl
  if (imageUrl && imageUrl.startsWith(useWPUri().url)) {
    return imageUrl.replace(useWPUri().url, '')
  }
  return imageUrl
}`
    },
    {
      v1: 'useWPUri',
      v2: null, // Removed - needs helper
      description: 'Get WordPress URL from runtime config',
      replacement: 'Use useRuntimeConfig().public.wordpressUrl',
      helperCode: `export function useWPUri() {
  return { url: useRuntimeConfig().public.wordpressUrl as string }
}`
    },
    {
      v1: 'usePrevNextPost',
      v2: 'usePrevNextPost', // Available in v2 - API unchanged
      description: 'Get previous and next posts for navigation',
      replacement: 'No change needed - usePrevNextPost is available in v2 with the same API',
      helperCode: null
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
  category: 'composable' | 'directive' | 'config' | 'component' | 'usage'
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

interface FindReplaceItem {
  find: string
  replace: string
  description: string
}

/**
 * Generate a list of find/replace operations for composable renames
 * based on what was actually found in the scanned files
 */
function generateFindReplaceList(issues: MigrationIssue[]): FindReplaceItem[] {
  const findReplaceList: FindReplaceItem[] = []
  const seenPatterns = new Set<string>()

  for (const issue of issues) {
    if (issue.category === 'composable' && issue.autoFixable) {
      // Check if it's a known rename
      if (COMPOSABLE_RENAMES[issue.pattern] && !seenPatterns.has(issue.pattern)) {
        seenPatterns.add(issue.pattern)
        findReplaceList.push({
          find: issue.pattern,
          replace: COMPOSABLE_RENAMES[issue.pattern],
          description: issue.description
        })
      } else if (!seenPatterns.has(issue.pattern)) {
        // Handle dynamic patterns (custom queries with useWP prefix)
        seenPatterns.add(issue.pattern)

        let replacement = issue.pattern
        if (issue.pattern.startsWith('useAsyncWP')) {
          replacement = issue.pattern.replace('useAsyncWP', 'useLazy')
        } else if (issue.pattern.startsWith('useWP')) {
          replacement = issue.pattern.replace('useWP', 'use')
        } else if (issue.pattern.startsWith('useAsync')) {
          replacement = issue.pattern.replace('useAsync', 'useLazy')
        }

        if (replacement !== issue.pattern) {
          findReplaceList.push({
            find: issue.pattern,
            replace: replacement,
            description: issue.description
          })
        }
      }
    }

    // Handle directives
    if (issue.category === 'directive' && issue.autoFixable && !seenPatterns.has(issue.pattern)) {
      seenPatterns.add(issue.pattern)
      findReplaceList.push({
        find: issue.pattern,
        replace: 'v-sanitize-html',
        description: issue.description
      })
    }
  }

  return findReplaceList
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
    // Ensure useWPUri is also included since useFeaturedImage depends on it
    neededHelpers.add('useWPUri')
    composablesContent.push(`/**
 * Extract featured image URL from a post object.
 * Converts absolute WordPress URLs to relative paths.
 * Migration helper from WPNuxt 1.x
 */
export function useFeaturedImage(post: { featuredImage?: { node?: { sourceUrl?: string } } } | undefined): string | undefined {
  const imageUrl = post?.featuredImage?.node?.sourceUrl
  if (imageUrl && imageUrl.startsWith(useWPUri().url)) {
    return imageUrl.replace(useWPUri().url, '')
  }
  return imageUrl
}`)
  }

  if (neededHelpers.has('useWPUri')) {
    composablesContent.push(`/**
 * Get WordPress URL from runtime config.
 * Migration helper from WPNuxt 1.x
 */
export function useWPUri() {
  return { url: useRuntimeConfig().public.wordpressUrl as string }
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

/**
 * WPNuxt composables that return Refs and must be called at top level
 */
const WPNUXT_COMPOSABLES = [
  'usePosts', 'usePages', 'useMenu', 'useNode', 'useViewer',
  'useLazyPosts', 'useLazyPages', 'useLazyMenu', 'useLazyNode', 'useLazyViewer',
  // Also catch custom query composables (pattern: use + PascalCase)
  /use[A-Z][a-zA-Z]*(?:Posts?|Pages?|Menu|Node|Query|Content)/
]

/**
 * Vue lifecycle hooks where composables should NOT be called
 */
const LIFECYCLE_HOOKS = [
  'onMounted', 'onBeforeMount', 'onUnmounted', 'onBeforeUnmount',
  'onUpdated', 'onBeforeUpdate', 'onActivated', 'onDeactivated',
  'onErrorCaptured', 'onServerPrefetch'
]

/**
 * Scan for usage anti-patterns:
 * 1. Composables called inside lifecycle hooks
 * 2. Composables called inside regular functions (not at top level)
 * 3. Missing .value access on Refs returned by composables
 * 4. Direct array method calls on composable results (v1 → v2 breaking change)
 */
function scanUsagePatterns(content: string, filename: string): MigrationIssue[] {
  const issues: MigrationIssue[] = []
  const lines = content.split('\n')

  // Track variables assigned directly from composables (not destructured)
  // These are the full result objects, not the data refs
  const composableResultVars = new Set<string>()

  // Track variables destructured from composables (these are Refs)
  const refVariables = new Set<string>()

  // Track function boundaries for context
  let insideFunction = false
  let insideLifecycleHook = false
  let braceDepth = 0
  let lifecycleHookName = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const lineNum = i + 1

    // Track brace depth to understand scope
    const openBraces = (line.match(/\{/g) || []).length
    const closeBraces = (line.match(/\}/g) || []).length
    braceDepth += openBraces - closeBraces

    // Detect lifecycle hook start
    for (const hook of LIFECYCLE_HOOKS) {
      if (line.includes(`${hook}(`)) {
        insideLifecycleHook = true
        lifecycleHookName = hook
      }
    }

    // Detect regular async function that might be called in lifecycle hook
    const asyncFuncMatch = line.match(/async\s+function\s+(\w+)/)
    if (asyncFuncMatch) {
      insideFunction = true
    }

    // Also detect arrow functions assigned to variables
    const arrowFuncMatch = line.match(/const\s+(\w+)\s*=\s*async\s*\(/)
    if (arrowFuncMatch) {
      insideFunction = true
    }

    // Check for WPNuxt composable calls
    for (const composable of WPNUXT_COMPOSABLES) {
      const pattern = typeof composable === 'string' ? composable : composable.source
      const regex = typeof composable === 'string'
        ? new RegExp(`\\b${composable}\\s*\\(`)
        : new RegExp(`\\b${composable.source}\\s*\\(`)

      if (regex.test(line)) {
        // Extract the composable name from the match
        const nameMatch = line.match(/\b(use[A-Z][a-zA-Z]*)\s*\(/)
        const composableName = nameMatch ? nameMatch[1] : pattern

        // Check if inside lifecycle hook
        if (insideLifecycleHook) {
          issues.push({
            file: filename,
            line: lineNum,
            pattern: composableName,
            category: 'usage',
            severity: 'error',
            description: `Composable "${composableName}" called inside ${lifecycleHookName}()`,
            replacement: `Move "${composableName}" to top level of <script setup>. Composables that use useAsyncData must be called at the top level to work with SSR.`,
            autoFixable: false
          })
        }

        // Check if inside a regular function (not at top level)
        if (insideFunction && !insideLifecycleHook) {
          issues.push({
            file: filename,
            line: lineNum,
            pattern: composableName,
            category: 'usage',
            severity: 'warning',
            description: `Composable "${composableName}" called inside a function instead of top level`,
            replacement: `Move "${composableName}" to top level of <script setup>. If the function is called in onMounted, data won't be fetched during SSR.`,
            autoFixable: false
          })
        }

        // Track destructured data variables (they are Refs)
        const destructureMatch = line.match(/\{\s*data:\s*(\w+)/)
        if (destructureMatch) {
          refVariables.add(destructureMatch[1])
        }
        // Also track direct data destructure
        const directDataMatch = line.match(/\{\s*data\s*[,}]/)
        if (directDataMatch) {
          refVariables.add('data')
        }

        // Track variables assigned directly from composables (not destructured)
        // Pattern: const menu = useMenu(...) - NOT destructured
        const directAssignMatch = line.match(/const\s+(\w+)\s*=\s*(use(?:WP|Lazy|Async)?[A-Z]\w*)\s*\(/)
        if (directAssignMatch && !line.includes('{')) {
          composableResultVars.add(directAssignMatch[1])
        }
      }
    }

    // Check for array methods called directly on composable result variables
    // This is a common v1 → v2 migration issue
    const arrayMethods = ['map', 'filter', 'find', 'forEach', 'some', 'every', 'reduce', 'flatMap', 'includes', 'indexOf', 'length']
    for (const varName of composableResultVars) {
      for (const method of arrayMethods) {
        const pattern = new RegExp(`\\b${varName}\\.${method}\\b`)
        if (pattern.test(line)) {
          issues.push({
            file: filename,
            line: lineNum,
            pattern: `${varName}.${method}`,
            category: 'usage',
            severity: 'error',
            description: `Array method "${method}" called directly on composable result "${varName}"`,
            replacement: `In WPNuxt v2, composables return { data, pending, ... }. Destructure the data: "const { data: ${varName} } = use...(...)" and use "${varName}.value?.${method}(...)"`,
            autoFixable: false
          })
        }
      }
    }

    // Check for missing .value access on Ref variables
    for (const refVar of refVariables) {
      // Pattern: refVar || [] or refVar ?? [] (missing .value)
      const missingValuePattern = new RegExp(`\\b${refVar}\\s*(\\|\\||\\?\\?)\\s*\\[`)
      if (missingValuePattern.test(line)) {
        issues.push({
          file: filename,
          line: lineNum,
          pattern: `${refVar} || []`,
          category: 'usage',
          severity: 'error',
          description: `Missing .value access on Ref "${refVar}"`,
          replacement: `Use "${refVar}.value" to access the reactive data. The data returned from WPNuxt composables is a Ref.`,
          autoFixable: false
        })
      }

      // Pattern: someVar.value = refVar (assigning Ref instead of value)
      const assignRefPattern = new RegExp(`\\.value\\s*=\\s*${refVar}\\s*(?:[,;\\n]|$)`)
      if (assignRefPattern.test(line) && !line.includes(`${refVar}.value`)) {
        issues.push({
          file: filename,
          line: lineNum,
          pattern: `= ${refVar}`,
          category: 'usage',
          severity: 'warning',
          description: `Possibly assigning Ref "${refVar}" instead of its value`,
          replacement: `If "${refVar}" is a Ref from a composable, use "${refVar}.value" to get the actual data.`,
          autoFixable: false
        })
      }
    }

    // Reset function tracking when we exit the scope
    if (braceDepth === 0 && (insideFunction || insideLifecycleHook)) {
      insideFunction = false
      insideLifecycleHook = false
      lifecycleHookName = ''
    }
  }

  return issues
}

export default defineMcpTool({
  description: `Analyze a project for WPNuxt v1 patterns and usage anti-patterns, then generate a migration report with compatibility helpers.

This tool scans for:

**v1 → v2 Migration Issues:**
- Removed composables (useFeaturedImage, useWPUri, isStaging)
- Renamed composables (useWPPosts → usePosts, useAsyncWPPosts → useLazyPosts)
- Unchanged composables (usePrevNextPost is available in v2 with the same API)
- Renamed directives (v-sanitize → v-sanitize-html)
- Removed components (<WPContent>, <ContentRenderer>, <StagingBanner>)
- Changed configuration options

**New in v2:**
- usePrevNextPost - gets previous/next posts for navigation
- useWPContent / useAsyncWPContent - low-level content fetching
- getRelativeImagePath - image path utility

**Usage Anti-Patterns (SSR issues):**
- Composables called inside lifecycle hooks (onMounted, etc.) - breaks SSR
- Composables called inside regular functions instead of top level
- Missing .value access on Refs returned by composables
- Incorrect data assignment patterns
- **v1→v2 breaking change**: Array methods (.map, .filter, etc.) called directly on composable results instead of on data.value

Returns:
- List of issues found with file locations and line numbers
- Severity levels (error = breaking, warning = needs attention)
- Auto-fix suggestions
- Generated compatibility helper file content

The AI assistant should:
1. Create the compatibility helpers if any removed composables are used
2. Help update renamed composables
3. Update the nuxt.config.ts if needed
4. Fix usage anti-patterns by moving composables to top level`,
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
        // Also scan for usage anti-patterns
        allIssues.push(...scanUsagePatterns(file.content, file.path))
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
      component: allIssues.filter(i => i.category === 'component'),
      usage: allIssues.filter(i => i.category === 'usage')
    }

    // Count by severity
    const errorCount = allIssues.filter(i => i.severity === 'error').length
    const warningCount = allIssues.filter(i => i.severity === 'warning').length

    // Generate helper files if needed
    const helperFiles = generateHelpers ? generateHelperFiles(allIssues) : []

    // Generate find/replace list for auto-fixable issues
    const findReplaceList = generateFindReplaceList(allIssues)

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
    let stepNum = 1

    if (issuesByCategory.usage.length > 0) {
      migrationSteps.push(`${stepNum++}. Fix usage anti-patterns: move composables to top level of <script setup> and use .value for Refs`)
    }

    if (issuesByCategory.config.length > 0) {
      migrationSteps.push(`${stepNum++}. Update nuxt.config.ts with new option names and structure`)
    }

    if (helperFiles.length > 0) {
      migrationSteps.push(`${stepNum++}. Create compatibility helpers: ${helperFiles.map(f => f.path).join(', ')}`)
    }

    if (issuesByCategory.composable.filter(i => i.autoFixable).length > 0) {
      migrationSteps.push(`${stepNum++}. Rename composables: useWP* → use*, useAsync* → useLazy*`)
    }

    if (issuesByCategory.directive.length > 0) {
      migrationSteps.push(`${stepNum++}. Update directives: v-sanitize → v-sanitize-html`)
    }

    if (issuesByCategory.component.length > 0) {
      migrationSteps.push(`${stepNum++}. Replace removed components with v-sanitize-html or @wpnuxt/blocks`)
    }

    migrationSteps.push(`${stepNum++}. Run pnpm dev:prepare to regenerate types`)
    migrationSteps.push(`${stepNum++}. Test all pages`)

    return jsonResult({
      summary: {
        ...summary,
        usageIssues: issuesByCategory.usage.length
      },
      migrationSteps,
      findReplaceList: findReplaceList.length > 0 ? findReplaceList : undefined,
      issues: {
        usage: issuesByCategory.usage.length > 0 ? issuesByCategory.usage : undefined,
        composables: issuesByCategory.composable.length > 0 ? issuesByCategory.composable : undefined,
        directives: issuesByCategory.directive.length > 0 ? issuesByCategory.directive : undefined,
        config: issuesByCategory.config.length > 0 ? issuesByCategory.config : undefined,
        components: issuesByCategory.component.length > 0 ? issuesByCategory.component : undefined
      },
      helperFiles: helperFiles.length > 0 ? helperFiles : undefined,
      migrationGuideUrl: 'https://wpnuxt.com/migration/v1-to-v2'
    })
  }
})
