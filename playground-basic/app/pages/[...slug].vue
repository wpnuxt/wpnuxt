<script setup lang="ts">
import { useGraphqlQuery } from '#imports'

const route = useRoute()
const { data: post } = await useGraphqlQuery('PostByUri', {
  uri: route.path
})
</script>

<template>
  <div>
    <NuxtLink to="/">
      Back home
    </NuxtLink>
    <div v-if="post?.nodeByUri">
      <h1>{{ post.nodeByUri.title }}</h1>
      <div v-sanitize-html="post.nodeByUri.content" />
    </div>
  </div>
</template>
