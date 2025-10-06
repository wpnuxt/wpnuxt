<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

defineProps<{
  post: PostFragment
  lazy?: boolean
}>()
</script>

<template>
  <UPageCard
    :title="post.title"
    :to="lazy ? `/lazy/${post.slug}` : `/${post.slug}`"
    class="shadow-md mb-0"
  >
    <template #description>
      <div v-sanitize-html="post.excerpt" />
    </template>
    <template #footer>
      <UButton>
        Read More
      </UButton>
    </template>
  </UPageCard>
</template>
