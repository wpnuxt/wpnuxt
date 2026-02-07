<script setup lang="ts">
import type { CoreQuote } from '#wpnuxt/blocks'

defineProps<{
  block: CoreQuote
}>()
</script>

<template>
  <blockquote
    v-for="innerBlock, index in block.innerBlocks"
    :key="index"
  >
    <CoreParagraph
      v-if="innerBlock && innerBlock.name === 'core/paragraph'"
      class="text-sm text-primary-500"
      :block="innerBlock"
    />
  </blockquote>
</template>
