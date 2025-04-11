<script setup lang="ts">
import { useGraphqlQuery } from '#imports'

const { data } = await useGraphqlQuery('Posts')
const posts = computed(() => data.posts?.nodes)
</script>

<template>
  <div
    v-for="post in posts"
    :key="post.id"
    :title="post.title"
    :to="`/${post.slug}`"
    class="shadow-md mb-0"
  >
    <h2>{{ post.title }}</h2>
    <div v-sanitize-html="post.excerpt" />
    <NuxtLink
      :to="`/${post.slug}`"
      color="neutral"
      variant="outline"
    >
      Read More
    </NuxtLink>
  </div>
</template>
