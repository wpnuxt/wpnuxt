<script setup lang="ts">
import type { NodeWithContentEditorFragment, NodeWithEditorBlocksFragment } from '#build/graphql-operations'
import { resolveComponent } from '#imports'

defineProps<{
  node: NodeWithContentEditorFragment | NodeWithEditorBlocksFragment
}>()

const manifest = await import('#wpnuxt/blocks').catch(() => ({})) as Record<string, unknown>
const findComponentToRender = async () => {
  const componentImporter = manifest['BlockRenderer']
  if (typeof componentImporter === 'function') {
    return await componentImporter()
  }
  return await resolveComponent('ContentRenderer')
}
const componentToRender = await findComponentToRender()
</script>

<template>
  <component
    :is="componentToRender"
    v-if="componentToRender && node"
    :node="node"
  />
</template>
