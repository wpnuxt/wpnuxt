<script setup lang="ts">
import type { PageFragment, PostFragment } from '#graphql-operations'

const route = useRoute()
const post = ref<PostFragment | PageFragment | undefined>(undefined)

onMounted(async () => {
  const { data } = await useAsyncNodeByUri({ uri: route.path })
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
