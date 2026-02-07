<script setup lang="ts">
import type { EditorBlock } from '#wpnuxt/blocks'

interface CoreDetails extends EditorBlock {
  __typename?: 'CoreDetails'
  attributes?: {
    summary?: string | null
    showContent?: boolean | null
    className?: string | null
  } | null
}

defineProps<{
  block: CoreDetails
}>()
</script>

<template>
  <details
    :open="block.attributes?.showContent ?? false"
    :class="block.attributes?.className ?? undefined"
  >
    <summary v-sanitize-html="block.attributes?.summary" />
    <div v-if="block.innerBlocks?.length">
      <template
        v-for="(innerBlock, index) in block.innerBlocks"
        :key="innerBlock?.clientId ?? index"
      >
        <BlockComponent
          v-if="innerBlock"
          :block="innerBlock"
        />
      </template>
    </div>
  </details>
</template>
