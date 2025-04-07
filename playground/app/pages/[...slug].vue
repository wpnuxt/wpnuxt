<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const route = useRoute()
const { data: post } = useAsyncGraphqlQuery('PostByUri', {
  uri: route.path
})
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeader :post="post?.data.nodeByUri" />
      <UPageBody class="my-10">
        <MDC
          v-if="post?.data?.nodeByUri?.content"
          :value="post.data.nodeByUri.content"
        />
        <Loading v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
