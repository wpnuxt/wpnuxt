<script setup lang="ts">
const { data: posts, pending } = await usePosts()
</script>

<template>
  <UContainer class="py-8">
    <h1 class="text-3xl font-bold mb-8">
      WPNuxt Blocks Playground
    </h1>

    <div
      v-if="pending"
      class="text-gray-500"
    >
      Loading posts...
    </div>

    <div
      v-else-if="posts"
      class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
    >
      <UCard
        v-for="post in posts"
        :key="post.id"
      >
        <template #header>
          <NuxtLink
            :to="post.uri"
            class="text-xl font-semibold hover:text-primary-500"
          >
            {{ post.title }}
          </NuxtLink>
        </template>

        <div
          v-if="post.excerpt"
          v-sanitize-html="post.excerpt"
          class="text-gray-600 text-sm"
        />

        <template #footer>
          <UButton
            :to="post.uri"
            variant="soft"
            size="sm"
          >
            Read More
          </UButton>
        </template>
      </UCard>
    </div>

    <div
      v-else
      class="text-red-500"
    >
      No posts found
    </div>
  </UContainer>
</template>
