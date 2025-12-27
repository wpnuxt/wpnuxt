<script setup lang="ts">
import type { CoreQuote } from '#wpnuxt/blocks'

defineProps<{
  block: CoreQuote
}>()
</script>

<template>
  <UPageCard variant="soft" class="my-5 bg-neutral-100 dark:bg-neutral-800 rounded-xl shadow-md dark:shadow-neutral-600">
    <template #header>
      <p v-sanitize-html="block?.innerBlocks?.[0]?.attributes?.content" class="text-lg font-bold" />
    </template>
    <blockquote>
      <p v-sanitize-html="block?.attributes?.citation" />
    </blockquote>
  </UPageCard>
</template>

<style scoped>
blockquote {
  font-style: italic;
}
blockquote > p {
  display:inline;
  padding: 0 0.2rem;
  font-size: 1.2rem;
}
blockquote:before {
  content: '“';
  font-size: 1.2rem;
}
blockquote:after {
  content: '”';
  font-size: 1.2rem;
}
</style>
