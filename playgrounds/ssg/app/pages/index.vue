<script setup lang="ts">
const { data: posts } = await usePosts()
</script>

<template>
  <UBlogPosts>
    <UBlogPost
      v-for="post in posts"
      :key="post.id"
      :to="post.uri"
      :title="post.title"
      :image="post.featuredImage?.node?.sourceUrl ?? ''"
      :date="post.date"
      variant="subtle"
    >
      <template #description>
        <div v-sanitize-html="post.excerpt" />
      </template>
    </UBlogPost>
  </UBlogPosts>
</template>
