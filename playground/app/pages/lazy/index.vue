<script setup lang="ts">
// Using useLazyPosts() - same as usePosts with lazy: true option
// Doesn't block navigation, perfect for showing loading states
const { data: posts, pending, refresh, clear } = useLazyPosts()
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
      />
      <UPageBody>
        <pre>const { data: posts, pending, refresh, clear } = useLazyPosts()</pre>
        <PostGrid
          :posts="posts || []"
          :pending="pending"
          :lazy="true"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
