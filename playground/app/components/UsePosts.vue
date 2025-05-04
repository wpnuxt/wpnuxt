<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { PostFragment } from '#graphql-operations'
import { usePosts } from '#wpnuxt'

const posts = ref<PostFragment[]>([])
onMounted(async () => {
  const { data } = await usePosts()
  posts.value = data || []
})
</script>

<template>
  <UPageSection
    id="posts"
    title="Blog posts"
  >
    <UPageGrid v-if="posts && posts.length > 0">
      <UPageCard
        v-for="post, index in posts"
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
    <UPageGrid v-else>
      <PostPlaceholder
        v-for="i in 3"
        :key="i"
      />
    </UPageGrid>
  </UPageSection>
</template>
