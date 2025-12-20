<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

defineProps<{
  post: PostFragment | PageFragment | undefined
  pending: boolean
  refreshContent: () => void
}>()
</script>

<template>
  <UPageHeader>
    <template #title>
      <template v-if="post?.title">
        {{ post.title }}
      </template>
      <div
        v-else
        class="grid mt-1"
      >
        <USkeleton class="h-9 w-[250px] opacity-30" />
      </div>
    </template>
    <template #description>
      <NuxtTime
        v-if="post?.date"
        :datetime="post.date"
        month="long"
        day="numeric"
        year="numeric"
      />
      <LoadingIcon v-else />
    </template>
    <template #links>
      <UBadge
        v-if="pending"
        color="primary"
        variant="subtle"
      >
        Loading...
      </UBadge>
      <UButton
        class="cursor-pointer"
        @click="refreshContent"
      >
        Refresh
      </UButton>
    </template>
  </UPageHeader>
</template>
