<script setup lang="ts">
const route = useRoute()

const { data: post, pending, refresh, clear, error, status, execute } = await useNodeByUri(
  { uri: route.path }
)

// On client-side navigation, explicitly trigger the fetch if no data
onMounted(async () => {
  if (!import.meta.server && !post.value && status.value !== 'success') {
    await execute()
  }
})
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
