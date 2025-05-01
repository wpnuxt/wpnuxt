<script setup lang="ts">
const route = useRoute()
const { data: post } = await useNodeByUri({ uri: route.path })
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeader :post="post" />
      <UPageBody class="my-10">
        <MDC
          v-if="post?.content"
          :value="post.content"
        />
        <Loading v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
