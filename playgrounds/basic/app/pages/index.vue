<script setup lang="ts">
const { data: posts, pending } = await usePosts()
</script>

<template>
  <div>
    <p v-if="pending">
      Fetching posts...
    </p>
    <div
      v-for="post in posts"
      v-else
      :key="post.id"
      :title="post.title"
      :to="`/${post.slug}`"
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
  </div>
</template>
