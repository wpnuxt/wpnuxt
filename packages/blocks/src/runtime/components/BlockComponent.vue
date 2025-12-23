<script setup lang="ts">
import { pascalCase } from 'scule'
import { resolveComponent } from '#imports'
import type { EditorBlock } from '#wpnuxt/blocks'

const props = defineProps<{
  block: EditorBlock
}>()

const componentToRender = (() => {
  // only process top level blocks
  if (props.block.parentClientId === null || props.block.parentClientId === undefined) {
    if (props.block.name) {
      const componentName = pascalCase(props.block.name)
      // Try to resolve the component by name (e.g., CoreParagraph, CoreHeading)
      const resolved = resolveComponent(componentName)
      if (typeof resolved !== 'string') {
        return resolved
      }
    }
    // Fallback to EditorBlock for unknown block types
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
