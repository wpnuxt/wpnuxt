<script setup lang="ts">
import type { PageFragment, PostFragment } from '#graphql-operations'

const route = useRoute()
const post = ref<PageFragment | PostFragment | null>(null)
const { data, refresh } = await useAsyncNodeByUri({ uri: route.path })

onMounted(async () => {
  await refresh()
  post.value = data
})
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
