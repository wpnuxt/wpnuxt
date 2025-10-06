<script setup lang="ts">
const { data: posts, pending, refresh, clear } = await usePosts()
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh="refresh"
        :clear="clear"
      />
      <UPageBody>
        <pre>const { data: posts, pending, refresh, clear } = await usePosts()</pre>
        <PostGrid
          :posts="posts || []"
          :pending="pending"
          :lazy="false"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
