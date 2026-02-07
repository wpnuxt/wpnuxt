<script setup lang="ts">
import type { CoreImage } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreImage
}>()
const imgUrl = props.block?.attributes?.url
</script>

<template>
  <div>
    <NuxtImg
      v-if="imgUrl"
      :src="imgUrl"
      :alt="block?.attributes?.alt"
      :width="block?.attributes?.width ?? undefined"
      :height="block?.attributes?.height ?? undefined"
      :fit="block?.attributes?.scale ?? undefined"
    />
    <div
      v-else
      v-sanitize-html="block?.renderedHtml"
    />
  </div>
</template>
