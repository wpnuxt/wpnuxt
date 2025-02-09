<script setup lang="ts">
import { useAsyncData } from '#imports'
import { usePosts } from '#wpnuxt'

const { data: posts } = await useAsyncData('posts', () => usePosts())
</script>

<template>
  <UPageSection
    id="posts"
    title="Blog posts"
  >
    <UPageGrid>
      <UPageCard
        v-for="post, index in posts?.data"
        :key="index"
        :title="post.title"
        :description="post.date?.split('T')[0]"
        :to="post.uri"
      >
        <img
          v-if="post?.featuredImage?.node?.sourceUrl"
          :src="post.featuredImage.node.sourceUrl"
          class="w-full rounded-md"
        >
        <span v-sanitize="post.excerpt" />
      </UPageCard>
    </UPageGrid>
  </UPageSection>
</template>
