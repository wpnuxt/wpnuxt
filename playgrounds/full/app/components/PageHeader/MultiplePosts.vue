<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

defineProps<{
  posts: PostFragment[]
  pending: boolean
  refreshContent: () => void
}>()
</script>

<template>
  <UPageHeader
    title="Posts"
  >
    <template #description>
      <template v-if="!pending && posts?.length">
        Fetched {{ posts?.length }} posts using usePosts()
      </template>
      <LoadingIcon v-else />
    </template>
    <template #links>
      <UButton
        class="cursor-pointer"
        :loading="pending"
        icon="i-lucide-refresh-cw"
        @click="refreshContent"
      />
    </template>
  </UPageHeader>
</template>
