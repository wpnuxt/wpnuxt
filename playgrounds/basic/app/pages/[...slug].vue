<script setup lang="ts">
const route = useRoute()

const { data: node, pending, status, execute } = await useNodeByUri({
  uri: route.path
})

// On client-side navigation, explicitly trigger the fetch if no data
onMounted(async () => {
  if (!import.meta.server && !node.value && status.value !== 'success') {
    await execute()
  }
})
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
