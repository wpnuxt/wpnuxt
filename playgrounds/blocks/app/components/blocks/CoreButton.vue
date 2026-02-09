<script setup lang="ts">
import type { CoreButton } from '#wpnuxt/blocks'

defineProps<{
  block: CoreButton
}>()
</script>

<template>
  <div class="mt-2 text-sm text-gray-500 dark:text-gray-400">
    this custom CoreButton component renders it as a Nuxt UI UButton component,
    adds a subtle variant to the button, and a size of xl.<br>
    <UButton
      :to="block.attributes?.url ?? undefined"
      :target="block.attributes?.linkTarget ?? undefined"
      :rel="block.attributes?.rel ?? undefined"
      color="primary"
      variant="subtle"
      size="xl"
      class="my-2"
    >
      <span v-sanitize-html="block.attributes?.text" />
    </UButton>
  </div>
</template>
