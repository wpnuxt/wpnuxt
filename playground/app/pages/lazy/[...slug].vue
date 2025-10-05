<script setup lang="ts">
const route = useRoute()
const { data: post, pending } = await useLazyNodeByUri({ uri: route.path.replace('/lazy', '') })
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeader :post="post" />
      <UPageBody class="my-10">
        <pre>const { data: post, pending } = useNodeByUri({ uri: useRoute().path })</pre>
        <p>pending: {{ pending }}</p>
        <MDC
          v-if="post?.content"
          :value="post.content"
        />
        <Loading v-else />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
