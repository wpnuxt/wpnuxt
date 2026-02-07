<script setup lang="ts">
import type { EditorBlock } from '#wpnuxt/blocks'

const props = defineProps<{
  block: EditorBlock
}>()

const videoUrl = computed(() => {
  return getRelativeImagePath(props.block?.attributes?.url as string)
})
</script>

<template>
  <div>
    <video :src="videoUrl" />
  </div>
</template>
