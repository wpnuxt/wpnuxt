<script setup lang="ts">
// Using useLazyPosts() - same as usePosts with lazy: true option
// Doesn't block navigation, perfect for showing loading states
const { data: posts, pending } = useLazyPosts()
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Posts (Lazy Loading)"
        :description="posts?.length ? `Fetched ${posts.length} posts` : 'Loading posts...'"
      />
      <UPageBody>
        <pre>const { data: posts, pending } = useLazyPosts()</pre>
        <p>pending: {{ pending }}</p>
        <UPageGrid>
          <template v-if="posts">
            <PostCard
              v-for="post in posts"
              :key="post.id"
              :post="post"
              lazy
            />
          </template>
          <Loading v-else-if="pending" />
        </UPageGrid>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
