<script setup lang="ts">
import type { EditorBlock } from '#wpnuxt/blocks'

defineProps<{
  block: EditorBlock
}>()
</script>

<template>
  <div v-sanitize="block.renderedHtml" />
</template>
