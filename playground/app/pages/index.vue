<script setup lang="ts">
const posts = await usePosts()
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Posts"
        :description="`fetched ${posts.data.length} posts using the WordPress GraphQL API`"
      />
      <UPageGrid>
        <PostCard
          v-for="post in posts.data"
          :key="post.id"
          :post="post"
        />
      </UPageGrid>
    </UPage>
  </UContainer>
</template>
