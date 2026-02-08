<script setup lang="ts">
const route = useRoute()

const { data: node, pending } = await useNodeByUri(
  { uri: route.path },
  { watch: [() => route.path] }
)
</script>

<template>
  <div>
    <p v-if="pending">
      Fetching data for {{ $route.path }}...
    </p>
    <div v-else-if="node">
      <h1>{{ node.title }}</h1>
      <WPContent :node="node" />
    </div>
  </div>
</template>
