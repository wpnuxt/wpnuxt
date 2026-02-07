/**
 * Type augmentations for nuxt-graphql-middleware composables
 * These are provided at runtime when @wpnuxt/core is installed
 */

// Make this a module to enable proper augmentation
export {}

declare module '#imports' {
  export function useGraphqlQuery<T = unknown>(
    operationName: string,
    variables?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<{ data: T | null, errors?: Array<{ message: string }> }>

  export function useGraphqlMutation<T = unknown>(
    operationName: string,
    variables?: Record<string, unknown>,
    options?: Record<string, unknown>
  ): Promise<{ data: T | null, errors?: Array<{ message: string }> }>
}
