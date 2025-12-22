<script setup lang="ts">
// Debug: Use useState to preserve SSR debug info across hydration
const route = useRoute()

// useState persists between SSR and client - won't be overwritten on hydration
const ssrDebug = useState('ssr-debug', () => ({
  ranOnServer: import.meta.server,
  serverRoutePath: import.meta.server ? route.path : null,
  serverTime: import.meta.server ? new Date().toISOString() : null
}))

// This will be different on client
const clientDebug = ref({
  isServer: import.meta.server,
  routePath: route.path,
  time: new Date().toISOString()
})

console.log('[DEBUG] route.path:', route.path, 'isServer:', import.meta.server)

// Use plain object - the key is generated based on query name + hash(variables)
const { data: post, pending, refresh, clear, error, status, execute } = await useNodeByUri(
  { uri: route.path }
)

console.log('[DEBUG] initial state - pending:', pending.value, 'status:', status.value, 'hasData:', !!post.value)

// On client-side navigation, explicitly trigger the fetch
onMounted(async () => {
  console.log('[DEBUG] onMounted - isServer:', import.meta.server, 'hasData:', !!post.value, 'status:', status.value)
  // If no data and we're on client, force execute
  if (!import.meta.server && !post.value && status.value !== 'success') {
    console.log('[DEBUG] forcing execute() on client mount')
    await execute()
    console.log('[DEBUG] after execute - hasData:', !!post.value, 'status:', status.value)
  }
})

const fetchDebug = computed(() => ({
  pending: pending.value,
  status: status.value,
  hasError: !!error.value,
  errorMsg: error.value?.message || null,
  hasData: !!post.value
}))
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderSinglePost
        :post="post"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
      />
      <UPageBody>
        <pre>const { data: post, pending, refresh, clear } = await useNodeByUri({ uri: route.path })</pre>
        <pre style="background: #ccffcc; padding: 8px; white-space: pre-wrap;">SSR STATE (useState - preserved): {{ JSON.stringify(ssrDebug, null, 2) }}</pre>
        <pre style="background: #ffcccc; padding: 8px; white-space: pre-wrap;">CLIENT STATE (ref - current): {{ JSON.stringify(clientDebug, null, 2) }}</pre>
        <pre style="background: #ccccff; padding: 8px; white-space: pre-wrap;">FETCH STATE: {{ JSON.stringify(fetchDebug, null, 2) }}</pre>
        <UPageCard>
          <MDC
            v-if="post?.content"
            :value="post.content"
          />
          <LoadingPage v-else />
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
