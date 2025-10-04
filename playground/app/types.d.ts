// Type declarations for auto-generated modules
interface WPNuxtAsyncData<T> {
  data?: T
  error?: unknown
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyData = any

declare module '#wpnuxt' {
  export const useMenu: (params?: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const usePosts: (params?: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const usePostByUri: (params: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const usePostsByCategoryName: (params: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const useGeneralSettings: (params?: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
}

declare module '#wpnuxt/blocks' {
  export const CoreButton: unknown
  export const BlockRenderer: unknown
}

declare module '#build/graphql-operations' {
  export * from '../../src/runtime/types'
}

declare module '#graphql-operations' {
  export * from '#build/graphql-operations'
}

// Extend #imports to include WPNuxt composables
declare module '#imports' {
  export * from '#app'
  export * from 'vue'
  export * from '@unhead/vue'

  // WPNuxt composables
  export const isStaging: () => boolean
  export const useWPContent: <T>(
    operation: unknown,
    queryName: string,
    nodes: string[],
    fixImagePaths: boolean,
    params?: T
  ) => Promise<{ data?: T, error?: unknown }>
  export const parseDoc: (content: string) => unknown
  export const useNodeByUri: (params: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const usePostByUri: (params: Record<string, unknown>) => Promise<WPNuxtAsyncData<AnyData>>
  export const usePrevNextPost: (uri: string) => Promise<{ prev: string | null, next: string | null }>
  export const useWPUri: () => {
    admin: string
    postEdit: (id: string) => string
  }
  export const loginUser: (username: string, password: string) => Promise<unknown>
  export const logoutUser: () => Promise<unknown>
  export const getCurrentUserId: () => Promise<unknown>
  export const getCurrentUserName: () => Promise<unknown>
  export const useTokens: () => unknown
  export const useFeaturedImage: (node: unknown) => unknown
}
