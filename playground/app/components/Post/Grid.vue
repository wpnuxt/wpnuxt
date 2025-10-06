<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

defineProps<{
  posts: PostFragment[]
  lazy?: boolean
}>()
</script>

<template>
  <UPageGrid>
    <template v-if="posts?.length">
      <PostCard
        v-for="post in posts"
        :key="post.id"
        :post="post"
        :lazy="lazy"
      />
    </template>
    <template v-else>
      <LoadingPostCard
        v-for="i in 2"
        :key="i"
      />
    </template>
  </UPageGrid>
</template>
