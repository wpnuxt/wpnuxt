<script setup lang="ts">
const post = await useNodeByUri({ uri: useRoute().path })
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeader :post="post.data" />
      <UPageBody class="my-10">
        <MDC
          v-if="post?.data?.content"
          :value="post.data.content"
        />
        <Loading v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
