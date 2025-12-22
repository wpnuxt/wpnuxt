<script setup lang="ts">
// Use plain object with watch option - computed refs don't work on Vercel serverless SSR
const { data: node, pending } = await useNodeByUri(
  { uri: useRoute().path },
  {
    watch: [() => useRoute().path],
    getCachedData: () => null
  }
)
</script>

<template>
  <div>
    <p v-if="pending">
      Fetching data for {{ $route.path }}...
    </p>
    <div v-else-if="node">
      <h1>{{ node.title }}</h1>
      <div v-sanitize-html="node.content" />
    </div>
  </div>
</template>
