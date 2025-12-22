<script setup lang="ts">
const route = useRoute()
const uri = () => route.path.replace('/lazy', '')

const { data: post, pending, refresh, clear } = await useLazyNodeByUri(
  { uri: uri() },
  { watch: [uri] }
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
