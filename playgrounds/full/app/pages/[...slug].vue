<script setup lang="ts">
const route = useRoute()

const { data: post, pending, refresh, clear } = await useNodeByUri(
  { uri: route.path },
  { watch: [() => route.path] }
)

// Fetch all posts once for prev/next navigation (cached)
const { data: allPosts } = await usePosts({ limit: 100 })

// Compute prev/next reactively based on current post
const previousPost = computed(() => {
  if (post.value?.contentTypeName !== 'post' || !post.value?.slug || !allPosts.value?.length) {
    return null
  }
  const currentIndex = allPosts.value.findIndex(p => p.slug === post.value?.slug)
  // Posts sorted by date DESC: prev (older) = higher index
  return currentIndex >= 0 && currentIndex < allPosts.value.length - 1
    ? allPosts.value[currentIndex + 1]
    : null
})

const nextPost = computed(() => {
  if (post.value?.contentTypeName !== 'post' || !post.value?.slug || !allPosts.value?.length) {
    return null
  }
  const currentIndex = allPosts.value.findIndex(p => p.slug === post.value?.slug)
  // Posts sorted by date DESC: next (newer) = lower index
  return currentIndex > 0
    ? allPosts.value[currentIndex - 1]
    : null
})
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderSinglePost
        :post="post"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
        :previous-post="previousPost"
        :next-post="nextPost"
        composable-name="useNodeByUri"
        composable-script="const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: route.path })"
      />
      <UPageBody>
        <UPageCard description="Rendered Content from WordPress">
          <template v-if="!pending && post">
            <WPContent
              :node="post"
              class="prose prose-lg dark:prose-invert max-w-none"
            />
          </template>
          <LoadingPage v-else />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
