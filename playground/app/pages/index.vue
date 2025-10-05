<script setup lang="ts">
const { data: posts, pending } = await usePosts()
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Posts"
        :description="`Fetched ${posts?.length || 0} posts using usePosts()`"
      />
      <UPageBody>
        <pre>const { data: posts, pending } = await usePosts()</pre>
        <p>pending: {{ pending }}</p>
        <UPageGrid>
          <PostCard
            v-for="post in posts"
            :key="post.id"
            :post="post"
          />
        </UPageGrid>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
