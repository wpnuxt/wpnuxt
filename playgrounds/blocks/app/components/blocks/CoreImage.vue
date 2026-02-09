<script setup lang="ts">
import type { CoreImage } from '#wpnuxt/blocks'

defineProps<{
  block: CoreImage
}>()
</script>

<template>
  <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
    this custom CoreImage component adds a scale effect on hover to the image,
    picks up the alt text (that was added in the the wordpress block editor) from the block attributes and displays it in a figcaption.
    <figure class="not-prose my-6 group">
      <div class="overflow-hidden rounded-xl inline-block shadow-md transition-shadow duration-300 hover:shadow-xl">
        <NuxtImg
          :src="block.attributes?.url ?? ''"
          :alt="block.attributes?.alt ?? undefined"
          :width="block.attributes?.width ?? undefined"
          :height="block.attributes?.height ?? undefined"
          :fit="block.attributes?.scale ?? undefined"
          placeholder
          class="max-w-full transition-transform duration-300 scale-90 hover:scale-100"
        />
      </div>
      <figcaption
        v-if="block.attributes?.alt"
        v-sanitize-html="block.attributes?.alt"
        class="mt-2 italic"
      />
    </figure>
  </div>
</template>
