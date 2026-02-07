<script setup lang="ts">
/**
 * CoreButton - Custom Gutenberg Button Block Renderer
 *
 * Demonstrates how to override default block rendering
 * with custom components using Nuxt UI.
 */

defineProps<{
  block: {
    attributes?: {
      url?: string | null
      text?: string | null
    } | null
  }
}>()
</script>

<template>
  <UButton
    :to="block.attributes?.url ?? undefined"
    color="primary"
    variant="subtle"
    size="xl"
    class="mb-4 shadow-md"
  >
    <span v-sanitize-html="block.attributes?.text" />
  </UButton>
</template>
