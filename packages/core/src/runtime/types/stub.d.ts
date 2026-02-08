/**
 * Type stubs for Nuxt-generated imports.
 * These are used during module development when .nuxt folder doesn't exist.
 * Actual types are generated at runtime in consuming applications.
 */

import type { Ref, ComputedRef, Component, WatchSource, WatchCallback, WatchOptions } from 'vue'
import type { NuxtApp } from 'nuxt/app'

// Stub for #imports - Vue reactivity & lifecycle
export function computed<T>(getter: () => T): ComputedRef<T>
export function ref<T>(value: T): Ref<T>
export function resolveComponent(name: string): Component | string
export function onMounted(callback: () => void): void
export function onBeforeUnmount(callback: () => void): void
export function watch<T>(
  source: WatchSource<T> | WatchSource<T>[],
  callback: WatchCallback<T>,
  options?: WatchOptions
): () => void

// Stub for #imports - Nuxt
export function defineNuxtPlugin(plugin: (nuxtApp: NuxtApp) => void | Promise<void>): unknown
export function useNuxtApp(): NuxtApp
export function useRuntimeConfig(): Record<string, unknown>
export function useRoute(): { path: string, params: Record<string, string>, query: Record<string, string> }
export function navigateTo(to: string): Promise<void>

// Stub for #imports - nuxt-graphql-middleware
export function useAsyncGraphqlQuery<T = unknown>(
  name: string,
  params?: Record<string, unknown>,
  options?: Record<string, unknown>
): {
  data: Ref<T | null>
  pending: Ref<boolean>
  refresh: () => Promise<void>
  execute: () => Promise<void>
  clear: () => void
  error: Ref<Error | null>
  status: Ref<string>
}
export function useGraphqlState(): Record<string, unknown>

// Stub for #nuxt-graphql-middleware/operation-types
export type Query = Record<string, unknown>

// Stub for #build/graphql-operations - these are generated types
export type PostFragment = Record<string, unknown>
export type PageFragment = Record<string, unknown>
export type MenuItemFragment = Record<string, unknown>
