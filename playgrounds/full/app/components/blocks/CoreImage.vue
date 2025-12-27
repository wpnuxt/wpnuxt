<script setup lang="ts">
import type { CoreImage } from '#wpnuxt/blocks'

defineProps<{
  block: CoreImage
}>()
</script>

<template>
  <NuxtImg
    :src="getRelativeImagePath(block.attributes?.url ?? '')"
    :alt="block.attributes?.alt ?? undefined"
    :width="block.attributes?.width ?? undefined"
    :height="block.attributes?.height ?? undefined"
    :fit="block.attributes?.scale ?? undefined"
    class="bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-md dark:shadow-neutral-600 p-5 my-5"
  />
</template>
