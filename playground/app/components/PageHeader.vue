<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

defineProps<{
  post: PostFragment | PageFragment | undefined
}>()
</script>

<template>
  <UPageHeader>
    <template #title>
      <h1 v-if="post?.title">
        {{ post.title }}
      </h1>
      <div v-else>
        <USkeleton class="h-9 w-[250px] mt-1" />
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
    </template>
  </UPageHeader>
</template>
