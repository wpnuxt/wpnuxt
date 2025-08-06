<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

const loading = ref(true)
const posts = ref<PostFragment[]>([])
const { data, refresh } = await useAsyncPosts()

onMounted(async () => {
  await refresh()
  posts.value = data
  loading.value = false
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Async Posts"
        :description="posts?.length ? `Asynchronously fetched ${posts.length} posts using the WordPress GraphQL API` : '...fetching posts'"
      />
      <UPageGrid>
        <PostCard
          v-for="post in posts"
          :key="post.id"
          :post="post"
        />
        <Loading v-if="loading" />
      </UPageGrid>
    </UPage>
  </UContainer>
</template>
