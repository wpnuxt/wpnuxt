<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const route = useRoute()
const { data: post } = useAsyncGraphqlQuery('PostByUri', {
  uri: route.path
})

const headerLinks = ref([{ label: 'Back to home', to: '/' }])
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        :title="post?.data?.nodeByUri?.title ? post.data.nodeByUri.title : ' '"
        :links="headerLinks"
      />
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
