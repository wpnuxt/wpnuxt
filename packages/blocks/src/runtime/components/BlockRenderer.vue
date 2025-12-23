<script setup lang="ts">
import BlockComponent from './BlockComponent.vue'
import type { NodeWithEditorBlocksFragment } from '#build/graphql-operations'

defineProps<{
  node: NodeWithEditorBlocksFragment
}>()
</script>

<template>
  <div>
    <template
      v-for="block, index in node.editorBlocks"
      :key="index"
    >
      <BlockComponent
        v-if="block"
        :block="block"
      />
    </template>
  </div>
</template>
