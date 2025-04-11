<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const route = useRoute()
const { data: node } = useAsyncGraphqlQuery('NodeByUri', {
  uri: route.path
})
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeader :post="node?.data.nodeByUri" />
      <UPageBody class="my-10">
        <MDC
          v-if="node?.data?.nodeByUri?.content"
          :value="node.data.nodeByUri.content"
        />
        <Loading v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
