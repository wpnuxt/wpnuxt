<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

defineProps<{
  posts: PostFragment[]
  pending: boolean
  refresh: () => void
  clear: () => void
}>()
</script>

<template>
  <UPageHeader
    title="Posts"
    :description="pending ? 'Fetching posts...' : `Fetched ${posts?.length || 0} posts using usePosts()`"
  >
    <template #links>
      <p>pending: {{ pending }}</p>
      <UButton @click="clear">
        Clear
      </UButton>
      <UButton @click="refresh">
        Refresh
      </UButton>
    </template>
  </UPageHeader>
</template>
