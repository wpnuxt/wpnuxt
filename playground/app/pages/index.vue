<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

const posts = ref<PostFragment[]>([])
const { data, refresh } = await useAsyncPosts()

onMounted(async () => {
  await refresh()
  posts.value = data
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Posts"
        :description="posts?.length ? `fetched ${posts.length} posts using the WordPress GraphQL API` : '...fetching posts'"
      />
      <UPageBody class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 my-10">
        <UPageCard
          v-for="post in posts"
          :key="post.id"
          :title="post.title"
          :to="`/${post.slug}`"
          class="shadow-md mb-0"
        >
          <template #description>
            <div v-sanitize-html="post.excerpt" />
          </template>
          <template #footer>
            <UButton
              :to="`/${post.slug}`"
              color="neutral"
              variant="outline"
            >
              Read More
            </UButton>
          </template>
        </UPageCard>
        <Loading v-if="!posts" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
