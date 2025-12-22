<script setup lang="ts">
// Use plain object with watch option - computed refs don't work on Vercel serverless SSR
const uri = () => useRoute().path.replace('/lazy', '')
const { data: post, pending, refresh, clear } = await useLazyNodeByUri(
  { uri: uri() },
  {
    watch: [uri],
    getCachedData: () => null
  }
)
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
        <pre>const { data: post, pending, refresh, clear } = useLazyNodeByUri({ uri: useRoute().path })</pre>
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
