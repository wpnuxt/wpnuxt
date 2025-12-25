/**
 * Type stubs for Nuxt-generated imports.
 * These are used during module development when .nuxt folder doesn't exist.
 * Actual types are generated at runtime in consuming applications.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// Stub for #imports - using generic functions to allow type arguments
export function computed<T>(getter: () => T): { value: T }
export function defineNuxtPlugin(plugin: any): any
export function navigateTo(to: any, options?: any): any
export function useCookie<T = any>(name: string, options?: any): { value: T | null }
export function useGraphqlMutation<_T = any>(name: string, options?: any): any
export function useGraphqlQuery<_T = any>(name: string, options?: any): any
export function useRuntimeConfig(): any
export function useState<T = any>(key: string, init?: () => T): { value: T }
