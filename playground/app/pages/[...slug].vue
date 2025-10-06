<script setup lang="ts">
const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: useRoute().path })
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
        <pre>const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: route.path })</pre>
        <MDC
          v-if="post?.content"
          :value="post.content"
        />
        <LoadingIcon v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
