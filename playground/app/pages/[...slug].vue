<script setup lang="ts">
import { useHead, useRoute, useNodeByUri, usePrevNextPost, useAsyncData } from '#imports'

const route = useRoute()
const { data: post } = useAsyncData('post-' + route.path, () => useNodeByUri({ uri: route.path }))

const { prev, next } = await usePrevNextPost(route.path)

if (post.value?.data?.title) {
  useHead({
    title: post.value.data.title
  })
}
</script>

<template>
  <NuxtLayout>
    <HeaderComponent />
    <UContainer>
      <UPage v-if="post?.data">
        <UPageHeader :title="post.data.title" />
        <UPageBody>
          <MDC :value="post.data.content" />
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
