<script setup lang="ts">
// Debug: Check if SSR runs on homepage
const ssrDebugHome = useState('ssr-debug-home', () => ({
  ranOnServer: import.meta.server,
  serverTime: import.meta.server ? new Date().toISOString() : null
}))

console.log('[HOME DEBUG] isServer:', import.meta.server)

const { data: posts, pending, refresh, clear } = await usePosts()

console.log('[HOME DEBUG] after fetch - pending:', pending.value, 'hasData:', !!posts.value)
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
      />
      <UPageBody>
        <pre>const { data: posts, pending, refresh, clear } = await usePosts()</pre>
        <pre style="background: #ccffcc; padding: 8px;">HOME SSR DEBUG: {{ JSON.stringify(ssrDebugHome, null, 2) }}</pre>
        <PostGrid
          :posts="posts || []"
          :pending="pending"
          :lazy="false"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
