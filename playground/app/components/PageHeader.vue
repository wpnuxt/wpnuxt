<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

const route = useRoute()
defineProps<{
  post: PostFragment | PageFragment | undefined
}>()

const headerLinks = ref([{
  label: route.path.startsWith('/async') ? 'Back to Async Home' : 'Back to Home',
  to: route.path.startsWith('/async') ? '/async' : '/'
}])
</script>

<template>
  <UPageHeader
    :links="headerLinks"
  >
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
