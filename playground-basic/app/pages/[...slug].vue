<script setup lang="ts">
import { useGraphqlQuery } from '#imports'

const route = useRoute()
const { data: node } = await useGraphqlQuery('NodeByUri', {
  uri: route.path
})
</script>

<template>
  <div v-if="node?.nodeByUri">
    <h1>{{ node.nodeByUri.title }}</h1>
    <div v-sanitize-html="node.nodeByUri.content" />
  </div>
</template>
