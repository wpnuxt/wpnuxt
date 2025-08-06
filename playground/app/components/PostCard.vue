<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

const route = useRoute()

defineProps<{
  post: PostFragment
}>()
</script>

<template>
  <UPageCard
    :title="post.title"
    :to="route.path === '/async' ? `/async/${post.slug}` : `/${post.slug}`"
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
