<script setup lang="ts">
const { data: posts, pending, refresh, clear } = await usePosts()
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
        composable-name="usePosts"
        composable-script="const { data: posts, pending, refresh, clear } = await usePosts()"
      />
      <UPageBody>
        <UBlogPosts>
          <UBlogPost
            v-for="post in posts"
            :key="post.id"
            :title="post.title ?? undefined"
            :to="post.uri"
            :date="post.date ?? undefined"
            :image="getRelativeImagePath(post.featuredImage?.node?.sourceUrl ?? '')"
            variant="outline"
          >
            <template #description>
              <div v-sanitize-html="post.excerpt" />
            </template>
          </UBlogPost>
        </UBlogPosts>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
