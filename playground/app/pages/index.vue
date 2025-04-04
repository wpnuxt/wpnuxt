<script setup lang="ts">
import { useGraphqlQuery } from '#imports'

const { data } = await useGraphqlQuery('Posts')
</script>

<template>
  <div v-if="data?.posts?.nodes">
    <div
      v-for="post in data.posts.nodes"
      :key="post.id"
    >
      <h2>{{ post.title }}</h2>
      <div v-sanitize-html="post.excerpt" />
      <NuxtLink :to="`/${post.slug}`">
        Read More
      </NuxtLink>
    </div>
  </div>
</template>
