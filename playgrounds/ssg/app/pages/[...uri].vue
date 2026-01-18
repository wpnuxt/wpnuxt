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
    <MDC
      v-if="node.content"
      :value="node.content"
    />
  </article>
</template>
