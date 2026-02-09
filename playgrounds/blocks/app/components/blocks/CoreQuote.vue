<script setup lang="ts">
import type { CoreQuote } from '#wpnuxt/blocks'

defineProps<{
  block: CoreQuote
}>()
</script>

<template>
  <div class="not-prose my-6 text-sm text-gray-500 dark:text-gray-400">
    this custom CoreQuote component renders it as a Nuxt UI UAlert component,
    and uses the citation attribute (if present) as the title of the alert.<br><br>
    <UAlert
      icon="i-lucide-quote"
      color="primary"
      variant="subtle"
      :title="block.attributes?.citation ? `— ${block.attributes.citation}` : undefined"
    >
      <template #description>
        <p
          v-for="(inner, i) in block.innerBlocks"
          :key="i"
          v-sanitize-html="inner?.attributes?.content"
          class="text-base italic"
        />
      </template>
    </UAlert>
  </div>
</template>
