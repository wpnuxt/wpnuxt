import type { Import } from 'unimport'

export interface WPNuxtConfigQueries {

  /**
   * Folder for user defined queries
   *
   * relative to the src dir of your nuxt app
   *
   * @default extend/queries
   */
  extendDir?: string

  /**
   * The predefined queries & the user defined queries will be merged and placed in the queries output folder
   *
   * relative to the src dir of your nuxt app
   *
   * @default queries
   */
  outputDir?: string
}

export type WPNuxtQuery = {
  name: string
  nodes?: string[]
  fragments: string[]
  params: Record<string, string>
  operation: OperationTypeNode
}

export interface WPNuxtContext {
  composablesPrefix: string
  template?: string
  fns: WPNuxtQuery[]
  fnImports?: Import[]
  generateImports?: () => string
  generateDeclarations?: () => string
  docs?: string[]
}
