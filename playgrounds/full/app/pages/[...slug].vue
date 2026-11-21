<script setup lang="ts">
const route = useRoute()
const { isAuthenticated } = useWPAuth()

// Fetches by route path, or by database ID for a WordPress preview link
// (a draft has no URI yet, so it can't be found by path)
const { data: node, pending, refresh, clear, isPreview } = await useNodeByRoute({ throwOnNotFound: true })

const loginLink = computed(() => ({ path: '/login', query: { redirect: route.fullPath } }))

// nodeByUri can also resolve to a Category/Tag archive, which this page
// doesn't render — narrow to content types (Page/Post/CPTs) only.
const post = computed(() => (node.value && 'contentTypeName' in node.value) ? node.value : undefined)

const previewDescription = computed(() => {
  if (!isAuthenticated.value) return 'You are not logged in, so this may be the published version.'
  return post.value && 'status' in post.value && post.value.status === 'publish'
    ? 'You are seeing the unsaved changes of published content.'
    : 'This content is not published yet.'
})

// Fetch all posts once for prev/next navigation (cached)
const { data: allPosts } = await usePosts({ limit: 100 })

// Compute prev/next reactively based on current post
const previousPost = computed(() => {
  if (!isPost(post.value) || !post.value?.slug || !allPosts.value?.length) {
    return null
  }
  const currentIndex = allPosts.value.findIndex(p => p.slug === post.value?.slug)
  // Posts sorted by date DESC: prev (older) = higher index
  return currentIndex >= 0 && currentIndex < allPosts.value.length - 1
    ? allPosts.value[currentIndex + 1]
    : null
})

const nextPost = computed(() => {
  if (!isPost(post.value) || !post.value?.slug || !allPosts.value?.length) {
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
        composable-name="useNodeByRoute"
        composable-script="const { data: post, pending, refresh, clear, isPreview } = await useNodeByRoute({ throwOnNotFound: true })"
      />
      <UPageBody>
        <template v-if="isPreview && !pending">
          <UAlert
            v-if="!post"
            color="warning"
            variant="subtle"
            icon="i-lucide-lock"
            title="Log in to see the preview"
            description="WordPress only returns a preview to a logged-in editor."
            :actions="isAuthenticated ? [] : [{ label: 'Log in', to: loginLink }]"
          />
          <UAlert
            v-else
            color="info"
            variant="subtle"
            icon="i-lucide-eye"
            title="Preview mode"
            :description="previewDescription"
            :actions="isAuthenticated ? [] : [{ label: 'Log in', to: loginLink }]"
          />
        </template>
        <UPageCard
          v-if="post || pending || !isPreview"
          description="Rendered Content from WordPress"
        >
          <template v-if="!pending && post">
            <WPContent
              :node="post as { content?: string | null }"
              class="prose prose-lg dark:prose-invert max-w-none"
            />
          </template>
          <LoadingPage v-else />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
