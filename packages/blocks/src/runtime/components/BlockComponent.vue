<script setup lang="ts">
import { pascalCase } from 'scule'
import { computed, resolveComponent, getCurrentInstance } from 'vue'
import type { EditorBlock } from '#wpnuxt/blocks'

const props = defineProps<{
  block: EditorBlock
}>()

/**
 * Cache for component registration checks.
 * Avoids traversing appContext.components on every render.
 * Cache is module-scoped and persists across component instances.
 */
const registrationCache = new Map<string, boolean>()

/**
 * Check if a component is registered in the app before trying to resolve it.
 * Results are cached to avoid repeated lookups on pages with many blocks.
 */
function isComponentRegistered(name: string): boolean {
  // Check cache first
  if (registrationCache.has(name)) {
    return registrationCache.get(name)!
  }

  const instance = getCurrentInstance()
  if (!instance) {
    registrationCache.set(name, false)
    return false
  }

  // Check global components
  const appComponents = instance.appContext.components
  const isGlobal = name in appComponents

  // Check local components (from auto-imports or local registration)
  const localComponents = (instance.type as { components?: Record<string, unknown> }).components
  const isLocal = !!(localComponents && name in localComponents)

  const result = isGlobal || isLocal
  registrationCache.set(name, result)

  return result
}

// Clear cache on hot module replacement (development only)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const hot = (import.meta as any).hot
if (hot) {
  hot.on('vite:beforeUpdate', () => {
    registrationCache.clear()
  })
}

/**
 * Computed component to render based on block type.
 * Uses computed for proper reactivity when block changes.
 */
const componentToRender = computed(() => {
  // Only process top level blocks
  if (props.block.parentClientId === null || props.block.parentClientId === undefined) {
    if (props.block.name) {
      const componentName = pascalCase(props.block.name)
      // Check if component exists before resolving to avoid Vue warnings
      if (isComponentRegistered(componentName)) {
        return resolveComponent(componentName)
      }
    }
    // Fallback to EditorBlock for unknown block types (renders raw HTML)
    return resolveComponent('EditorBlock')
  }
  return undefined
})
</script>

<template>
  <component
    :is="componentToRender"
    v-if="componentToRender"
    :block="block"
  />
</template>
