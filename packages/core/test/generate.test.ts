import { describe, it, expect, beforeEach } from 'vitest'
import { fileURLToPath } from 'node:url'
import { OperationTypeNode } from 'graphql'
import type { WPNuxtContext } from '../src/types/queries'
import { prepareContext } from '../src/generate'
import { initLogger } from '../src/utils/index'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

describe('generate', () => {
  beforeEach(() => {
    // Initialize logger for tests
    initLogger(false)
  })

  describe('prepareContext', () => {
    it('should generate imports for queries', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Posts',
            operation: OperationTypeNode.QUERY,
            nodes: ['posts', 'nodes'],
            fragments: ['Post'], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      expect(ctx.generateImports).toBeDefined()
      const imports = ctx.generateImports!()

      expect(imports).toContain('usePosts')
      expect(imports).toContain('useLazyPosts')
      expect(imports).toContain('useWPContent(\'Posts\'')
    })

    it('should generate imports for mutations', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Login',
            operation: OperationTypeNode.MUTATION,
            nodes: [],
            fragments: [], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      const imports = ctx.generateImports!()

      expect(imports).toContain('useMutationLogin')
      expect(imports).toContain('useGraphqlMutation(\'Login\'')
    })

    it('should generate type declarations', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Posts',
            operation: OperationTypeNode.QUERY,
            nodes: ['posts', 'nodes'],
            fragments: ['Post'], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      expect(ctx.generateDeclarations).toBeDefined()
      const declarations = ctx.generateDeclarations!()

      expect(declarations).toContain('PostsQueryVariables')
      expect(declarations).toContain('PostFragment')
      expect(declarations).toContain('WPContentOptions')
      expect(declarations).toContain('WPContentResult')
    })

    it('should register auto-imports for queries', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Posts',
            operation: OperationTypeNode.QUERY,
            nodes: ['posts', 'nodes'],
            fragments: ['Post'], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      expect(ctx.fnImports).toHaveLength(2) // usePosts and useLazyPosts
      expect(ctx.fnImports).toContainEqual({ from: '#wpnuxt', name: 'usePosts' })
      expect(ctx.fnImports).toContainEqual({ from: '#wpnuxt', name: 'useLazyPosts' })
    })

    it('should handle multiple queries and mutations', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Posts',
            operation: OperationTypeNode.QUERY,
            nodes: ['posts', 'nodes'],
            fragments: ['Post'], params: {}
          },
          {
            name: 'Pages',
            operation: OperationTypeNode.QUERY,
            nodes: ['pages', 'nodes'],
            fragments: ['Page'], params: {}
          },
          {
            name: 'CreatePost',
            operation: OperationTypeNode.MUTATION,
            nodes: [],
            fragments: [], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      const imports = ctx.generateImports!()

      // Should have query composables
      expect(imports).toContain('usePosts')
      expect(imports).toContain('useLazyPosts')
      expect(imports).toContain('usePages')
      expect(imports).toContain('useLazyPages')

      // Should have mutation composable
      expect(imports).toContain('useMutationCreatePost')

      // Should register all imports
      expect(ctx.fnImports).toHaveLength(5) // 2 queries * 2 variants + 1 mutation
    })

    it('should handle empty context', async () => {
      const ctx: WPNuxtContext = {
        fns: [],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      expect(ctx.generateImports!()).toBe('')
      expect(ctx.fnImports).toHaveLength(0)
    })

    it('should handle fragments with array suffix for nodes', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'Posts',
            operation: OperationTypeNode.QUERY,
            nodes: ['posts', 'nodes'],
            fragments: ['Post'], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      const declarations = ctx.generateDeclarations!()

      // Should have array suffix for nodes
      expect(declarations).toContain('PostFragment[]')
    })

    it('should handle query without fragments', async () => {
      const ctx: WPNuxtContext = {
        fns: [
          {
            name: 'GeneralSettings',
            operation: OperationTypeNode.QUERY,
            nodes: ['generalSettings'],
            fragments: [], params: {}
          }
        ],
        fnImports: [],
        composablesPrefix: 'use'
      }

      await prepareContext(ctx)

      const declarations = ctx.generateDeclarations!()

      // Should fallback to 'any' type when no fragments
      expect(declarations).toContain('any')
    })
  })
})
