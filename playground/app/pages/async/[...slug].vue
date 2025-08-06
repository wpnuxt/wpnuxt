<script setup lang="ts">
import type { PageFragment, PostFragment } from '#graphql-operations'

const loading = ref(true)
const route = useRoute()
const post = ref<PageFragment | PostFragment | null>(null)
const { data, refresh } = await useAsyncNodeByUri({ uri: route.params.slug[0] })

onMounted(async () => {
  await refresh()
  post.value = data
  loading.value = false
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
        <Loading v-if="loading" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
