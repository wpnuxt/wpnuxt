<script setup lang="ts">
const route = useRoute()
// Use route.path directly - it's already normalized and consistent between prerender and hydration
const uri = route.path.endsWith('/') ? route.path : `${route.path}/`

const { data: node } = await useNodeByUri({ uri })
</script>

<template>
  <article v-if="node">
    <UButton
      to="/"
      icon="i-lucide-arrow-left"
      variant="subtle"
      size="sm"
      class="mb-4"
    >
      Back
    </UButton>
    <UPageHeader :title="node.title" />
    <div
      v-if="node.content"
      v-sanitize-html="node.content"
      class="prose prose-lg dark:prose-invert max-w-none"
    />
  </article>
</template>
