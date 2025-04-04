<script setup lang="ts">
import { useGraphqlQuery } from '#imports'

const { data } = await useGraphqlQuery('PostByUri', {
  uri: useRoute().params.slug[0]
})
</script>

<template>
  <div v-if="data?.nodeByUri">
    <h1>{{ data.nodeByUri.title }}</h1>
    <div v-sanitize-html="data.nodeByUri.content" />
    <br>
    <NuxtLink to="/">
      Back to home
    </NuxtLink>
  </div>
</template>
