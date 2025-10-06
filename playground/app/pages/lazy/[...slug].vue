<script setup lang="ts">
const { data: post, pending, refresh, clear } = await useLazyNodeByUri({ uri: useRoute().path.replace('/lazy', '') })
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderSinglePost
        :post="post"
        :pending="pending"
        :refresh="refresh"
        :clear="clear"
      />
      <UPageBody>
        <pre>const { data: post, pending, refresh, clear } = useLazyNodeByUri({ uri: useRoute().path })</pre>
        <MDC
          v-if="post?.content"
          :value="post.content"
        />
        <LoadingIcon v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
