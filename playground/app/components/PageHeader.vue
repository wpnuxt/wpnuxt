<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

defineProps<{
  post: PostFragment | PageFragment
}>()

const headerLinks = ref([{ label: 'Back to home', to: '/' }])
</script>

<template>
  <UPageHeader
    :links="headerLinks"
    :description="post?.date"
  >
    <template #title>
      <h1 v-if="post?.title">
        {{ post.title }}
      </h1>
      <div v-else>
        <USkeleton class="h-8 w-[250px] mt-1" />
        <USkeleton class="h-4 w-[400px] mt-6" />
      </div>
    </template>
  </UPageHeader>
</template>
