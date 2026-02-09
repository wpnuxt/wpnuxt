<script setup lang="ts">
const { data: posts } = await usePosts()
</script>

<template>
  <UContainer>
    <UPageBody>
      <!-- Recent posts -->
      <div v-if="posts?.length">
        <h2 class="text-2xl font-bold mb-4">
          Recent Posts
        </h2>
        <UBlogPosts>
          <UBlogPost
            v-for="(post, index) in posts"
            :key="index"
            :to="`/blog${post.uri}`"
            :title="post.title"
            :description="post.excerpt ?? undefined"
            :image="post.featuredImage?.node?.relativePath ?? ''"
            :date="post.date ?? undefined"
            variant="subtle"
          >
            <template #description>
              <div v-sanitize-html="post.excerpt" />
            </template>
          </UBlogPost>
        </UBlogPosts>
      </div>
    </UPageBody>
  </UContainer>
</template>
