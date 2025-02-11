<script setup lang="ts">
import { useHead, useRoute, useNodeByUri, usePrevNextPost, createError, useAsyncData } from '#imports'

const route = useRoute()
const { data: post } = await useAsyncData('post-' + route.path, () => useNodeByUri({ uri: route.path }))
if (!post.value?.data) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
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
        <UPageBody class="prose dark:prose-invert">
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
    </UContainer>
  </NuxtLayout>
</template>
