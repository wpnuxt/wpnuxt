<script setup lang="ts">
import { pascalCase } from 'scule'
import { resolveComponent, getCurrentInstance } from '#imports'
import type { EditorBlock } from '#wpnuxt/blocks'

const props = defineProps<{
  block: EditorBlock
}>()

/**
 * Check if a component is registered in the app before trying to resolve it.
 * This avoids Vue warnings for missing components.
 */
function isComponentRegistered(name: string): boolean {
  const instance = getCurrentInstance()
  if (!instance) return false

  // Check global components
  const appComponents = instance.appContext.components
  if (name in appComponents) return true

  // Check local components (from auto-imports or local registration)
  const localComponents = (instance.type as { components?: Record<string, unknown> }).components
  if (localComponents && name in localComponents) return true

  return false
}

const componentToRender = (() => {
  // only process top level blocks
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
})()
</script>

<template>
  <component
    :is="componentToRender"
    v-if="componentToRender"
    :block="block"
  />
</template>
