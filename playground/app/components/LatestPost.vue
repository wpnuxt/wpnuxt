<script setup lang="ts">
import { useAsyncData, computed } from '#imports'
import { usePosts } from '#wpnuxt'

const { data } = await useAsyncData('latestPost', () => usePosts({ limit: 1 }))
const latestPost = computed(() => data?.value?.data?.[0] || null)
</script>

<template>
  <UPageSection
    v-if="latestPost"
    id="latestPost"
    title="Latest Post"
  >
    <UPageCard
      :title="latestPost?.title"
      :description="latestPost?.date?.split('T')[0]"
      :to="latestPost?.uri"
    >
      <img
        v-if="latestPost?.featuredImage?.node?.sourceUrl"
        :src="latestPost?.featuredImage.node.sourceUrl"
        class="w-full rounded-md"
      >
      <span v-sanitize="latestPost?.excerpt" />
    </UPageCard>
  </UPageSection>
</template>
