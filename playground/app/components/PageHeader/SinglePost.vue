<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

defineProps<{
  post: PostFragment | PageFragment | undefined
  pending: boolean
  refresh: () => void
  clear: () => void
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
        <USkeleton class="h-9 w-[250px]" />
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
      <div
        v-else
        class="grid my-2"
      >
        <USkeleton class="h-5 w-[100px]" />
      </div>
    </template>
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
