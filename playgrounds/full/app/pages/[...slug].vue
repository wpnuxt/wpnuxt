<script setup lang="ts">
// Debug: log the route path to see what's happening on Vercel
const route = useRoute()
console.log('[DEBUG SSR] route.path:', route.path)
console.log('[DEBUG SSR] import.meta.server:', import.meta.server)

const { data: post, pending, refresh, clear, error } = await useNodeByUri(
  { uri: route.path },
  {
    watch: [() => route.path],
    getCachedData: () => null
  }
)

console.log('[DEBUG SSR] after useNodeByUri - pending:', pending.value, 'error:', error.value, 'data:', !!post.value)
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderSinglePost
        :post="post"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
      />
      <UPageBody>
        <pre>const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: route.path })</pre>
        <pre style="background: #ffcccc; padding: 8px;">DEBUG: route.path={{ route.path }}, pending={{ pending }}, error={{ error }}, hasData={{ !!post }}</pre>
        <UPageCard>
          <MDC
            v-if="post?.content"
            :value="post.content"
          />
          <LoadingPage v-else />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
