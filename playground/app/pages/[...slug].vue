<script setup lang="ts">
import { useHead, useRoute, useNodeByUri, usePrevNextPost, useAsyncData, computed } from '#imports'

const route = useRoute()
const { data: post } = useAsyncData('post-' + route.path, () => useNodeByUri({ uri: route.path }))

const { prev, next } = await usePrevNextPost(route.path)

if (post.value?.data?.title) {
  useHead({
    title: post.value.data.title
  })
}

// Clean content to fix malformed URLs (e.g., http://localhost:3000:4000 -> http://localhost:4000)
const cleanContent = computed(() => {
  if (!post.value?.data?.content) return ''
  return post.value.data.content.replace(/http:\/\/localhost:3000:(\d+)/g, 'http://localhost:$1')
})
</script>

<template>
  <NuxtLayout>
    <HeaderComponent />
    <UContainer>
      <UPage v-if="post?.data">
        <UPageHeader :title="post.data.title" />
        <UPageBody>
          <MDC :value="cleanContent" />
        </UPageBody>
        <template #left>
          <PostAside
            :post="post.data"
            :prev="prev"
            :next="next"
          />
        </template>
      </UPage>
      <PagePlaceholder v-else />
    </UContainer>
  </NuxtLayout>
</template>
