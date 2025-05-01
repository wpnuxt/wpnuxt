<script setup lang="ts">
const route = useRoute()
const { data: node } = await useNodeByUri({
  uri: route.path
})
</script>

<template>
  <div v-if="node">
    <h1>{{ node.title }}</h1>
    <div v-sanitize-html="node.content" />
  </div>
</template>
