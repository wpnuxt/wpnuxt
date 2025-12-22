/**
 * WPNuxt Composables Helper
 *
 * Provides utilities for working with WPNuxt composables.
 * Composables are dynamically generated from GraphQL queries, but
 * the default queries from @wpnuxt/core are known and can be validated.
 */

interface ComposableParameter {
  name: string
  type: string
  required?: boolean
  default?: unknown
  description?: string
}

interface ComposableDefinition {
  name: string
  parameters: ComposableParameter[]
  returns: string
  description: string
  example: string
}

/**
 * Default composables provided by @wpnuxt/core
 * These are always available when using WPNuxt
 */
export const DEFAULT_COMPOSABLES: ComposableDefinition[] = [
  {
    name: 'Menu',
    parameters: [
      { name: 'name', type: 'ID', default: 'main', description: 'Menu name or ID' },
      { name: 'idType', type: 'MenuNodeIdTypeEnum', default: 'NAME' }
    ],
    returns: 'menu.menuItems.nodes',
    description: 'Fetch a WordPress menu by name',
    example: "useLazyMenu({ name: 'main' })"
  },
  {
    name: 'NodeByUri',
    parameters: [
      { name: 'uri', type: 'String', required: true, description: 'The URI of the content node' }
    ],
    returns: 'nodeByUri',
    description: 'Fetch any content node (page, post, CPT) by its URI',
    example: "useLazyNodeByUri({ uri: '/about/' })"
  },
  {
    name: 'Posts',
    parameters: [
      { name: 'limit', type: 'Int', default: 10, description: 'Number of posts to fetch' }
    ],
    returns: 'posts.nodes',
    description: 'Fetch a list of posts',
    example: 'useLazyPosts({ limit: 10 })'
  },
  {
    name: 'PostByUri',
    parameters: [
      { name: 'uri', type: 'String', required: true }
    ],
    returns: 'nodeByUri',
    description: 'Fetch a single post by its URI',
    example: "useLazyPostByUri({ uri: '/2024/01/hello-world/' })"
  },
  {
    name: 'PostById',
    parameters: [
      { name: 'id', type: 'ID', required: true },
      { name: 'asPreview', type: 'Boolean', default: false }
    ],
    returns: 'post',
    description: 'Fetch a single post by database ID',
    example: 'useLazyPostById({ id: "123" })'
  },
  {
    name: 'PostsByCategoryName',
    parameters: [
      { name: 'categoryName', type: 'String', required: true },
      { name: 'limit', type: 'Int', default: 10 }
    ],
    returns: 'posts.nodes',
    description: 'Fetch posts by category name/slug',
    example: "useLazyPostsByCategoryName({ categoryName: 'news' })"
  },
  {
    name: 'PostsByCategoryId',
    parameters: [
      { name: 'categoryId', type: 'Int', required: true },
      { name: 'limit', type: 'Int', default: 10 }
    ],
    returns: 'posts.nodes',
    description: 'Fetch posts by category ID',
    example: 'useLazyPostsByCategoryId({ categoryId: 5 })'
  },
  {
    name: 'Pages',
    parameters: [
      { name: 'limit', type: 'Int', default: 10 }
    ],
    returns: 'pages.nodes',
    description: 'Fetch a list of pages',
    example: 'useLazyPages({ limit: 10 })'
  },
  {
    name: 'PageByUri',
    parameters: [
      { name: 'uri', type: 'String', required: true }
    ],
    returns: 'nodeByUri',
    description: 'Fetch a single page by its URI',
    example: "useLazyPageByUri({ uri: '/about/' })"
  },
  {
    name: 'PageById',
    parameters: [
      { name: 'id', type: 'ID', required: true }
    ],
    returns: 'page',
    description: 'Fetch a single page by database ID',
    example: 'useLazyPageById({ id: "42" })'
  },
  {
    name: 'GeneralSettings',
    parameters: [],
    returns: 'generalSettings',
    description: 'Fetch WordPress general settings',
    example: 'useLazyGeneralSettings()'
  },
  {
    name: 'Viewer',
    parameters: [],
    returns: 'viewer',
    description: 'Fetch current authenticated user',
    example: 'useLazyViewer()'
  },
  {
    name: 'Revisions',
    parameters: [
      { name: 'id', type: 'ID', required: true }
    ],
    returns: 'revisions.nodes',
    description: 'Fetch revisions for a content node',
    example: 'useLazyRevisions({ id: "123" })'
  }
]

/**
 * Composable prefixes for different variants
 */
export const COMPOSABLE_PREFIXES = {
  sync: 'use',
  async: 'useAsync',
  lazy: 'useLazy'
} as const

export type ComposableVariant = keyof typeof COMPOSABLE_PREFIXES

/**
 * Get the full composable name with prefix
 */
export function getComposableName(queryName: string, variant: ComposableVariant = 'lazy'): string {
  return `${COMPOSABLE_PREFIXES[variant]}${queryName}`
}

/**
 * Check if a composable name is valid (exists in default composables)
 */
export function isValidComposable(name: string): boolean {
  // Extract base name by removing prefix
  let baseName = name
  for (const prefix of Object.values(COMPOSABLE_PREFIXES)) {
    if (name.startsWith(prefix)) {
      baseName = name.slice(prefix.length)
      break
    }
  }

  return DEFAULT_COMPOSABLES.some(c => c.name === baseName)
}

/**
 * Get composable definition by name
 */
export function getComposableDefinition(name: string): ComposableDefinition | null {
  // Extract base name by removing prefix
  let baseName = name
  for (const prefix of Object.values(COMPOSABLE_PREFIXES)) {
    if (name.startsWith(prefix)) {
      baseName = name.slice(prefix.length)
      break
    }
  }

  return DEFAULT_COMPOSABLES.find(c => c.name === baseName) || null
}

/**
 * Validate a composable call and return any issues
 */
export function validateComposableCall(
  name: string,
  params: Record<string, unknown> = {}
): { valid: boolean; issues: string[] } {
  const issues: string[] = []

  const definition = getComposableDefinition(name)
  if (!definition) {
    issues.push(`Unknown composable: ${name}. Did you mean one of: ${DEFAULT_COMPOSABLES.map(c => getComposableName(c.name)).join(', ')}?`)
    return { valid: false, issues }
  }

  // Check required parameters
  for (const param of definition.parameters) {
    if (param.required && !(param.name in params)) {
      issues.push(`Missing required parameter: ${param.name}`)
    }
  }

  // Check for unknown parameters
  const validParamNames = definition.parameters.map(p => p.name)
  for (const paramName of Object.keys(params)) {
    if (!validParamNames.includes(paramName)) {
      issues.push(`Unknown parameter: ${paramName}. Valid parameters are: ${validParamNames.join(', ')}`)
    }
  }

  return { valid: issues.length === 0, issues }
}

/**
 * Generate a composable call string
 */
export function generateComposableCall(
  queryName: string,
  params: Record<string, unknown> = {},
  variant: ComposableVariant = 'lazy'
): string {
  const composableName = getComposableName(queryName, variant)

  if (Object.keys(params).length === 0) {
    return `${composableName}()`
  }

  const paramParts = Object.entries(params).map(([key, value]) => {
    if (typeof value === 'string') {
      // Check if it looks like a variable reference
      if (value.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        return `${key}: ${value}`
      }
      return `${key}: '${value}'`
    }
    return `${key}: ${JSON.stringify(value)}`
  })

  return `${composableName}({ ${paramParts.join(', ')} })`
}

/**
 * Get example usage for a composable
 */
export function getComposableExample(queryName: string): string | null {
  const definition = DEFAULT_COMPOSABLES.find(c => c.name === queryName)
  return definition?.example || null
}

/**
 * List all available composable names (all variants)
 */
export function listAllComposableNames(): string[] {
  const names: string[] = []

  for (const composable of DEFAULT_COMPOSABLES) {
    for (const prefix of Object.values(COMPOSABLE_PREFIXES)) {
      names.push(`${prefix}${composable.name}`)
    }
  }

  return names.sort()
}

/**
 * Get a quick reference of all composables
 */
export function getComposablesQuickReference(): string {
  const lines = [
    '# WPNuxt Composables Quick Reference',
    '',
    '## Usage Pattern',
    "const { data, pending, error } = await useLazy{QueryName}({ ...params })",
    '',
    '## Available Composables',
    ''
  ]

  for (const c of DEFAULT_COMPOSABLES) {
    const params = c.parameters
      .map(p => `${p.name}${p.required ? '' : '?'}: ${p.type}${p.default !== undefined ? ` = ${JSON.stringify(p.default)}` : ''}`)
      .join(', ')

    lines.push(`### ${c.name}`)
    lines.push(`- ${c.description}`)
    lines.push(`- Parameters: ${params || 'none'}`)
    lines.push(`- Example: \`${c.example}\``)
    lines.push('')
  }

  return lines.join('\n')
}
