<script setup lang="ts">
/**
 * Interactive demo page for WPNuxt query options.
 * Toggle options to see how they affect data fetching behavior.
 */

// Default options
const defaults = {
  lazy: false,
  server: true,
  immediate: true,
  clientCache: true
}

// Use cookie for options - works on both server and client
const optionsCookie = useCookie('wpnuxt-query-options', {
  default: () => ({ ...defaults }),
  watch: true
})

// Ensure all properties exist (in case cookie has partial data)
const options = computed({
  get: () => ({ ...defaults, ...optionsCookie.value }),
  set: (val) => { optionsCookie.value = val }
})

// Check if options differ from defaults
const isCustomized = computed(() => {
  return options.value.lazy !== defaults.lazy
    || options.value.server !== defaults.server
    || options.value.immediate !== defaults.immediate
    || options.value.clientCache !== defaults.clientCache
})

// Reset to defaults
function resetToDefaults() {
  optionsCookie.value = { ...defaults }
}

// Track fetch counts separately for SSR and client
// useState preserves values across navigations and hydration
const ssrFetchCount = useState('query-options-ssr-count', () => 0)
const clientFetchCount = useState('query-options-client-count', () => 0)
const lastFetchTime = useState<string | null>('query-options-last-fetch', () => null)

// Describe expected lazy behavior based on current options
const lazyBehavior = computed(() => {
  const { lazy, server } = options.value

  if (!lazy) {
    // lazy=false: navigation blocks until data is ready
    return {
      color: 'neutral' as const,
      message: 'Navigation blocks until data ready',
      note: 'Browser shows loading indicator in the tab'
    }
  }

  // lazy=true: page loads immediately
  if (server) {
    return {
      color: 'success' as const,
      message: 'Page shows immediately with SSR data',
      note: 'No loading spinner because data is in HTML'
    }
  }

  return {
    color: 'info' as const,
    message: 'Page shows loading spinner',
    note: 'Data fetched on client after page loads'
  }
})

function resetCounter() {
  ssrFetchCount.value = 0
  clientFetchCount.value = 0
  lastFetchTime.value = null
}

// Generate composable code dynamically based on options
const composableScript = computed(() => {
  const optionEntries: string[] = []

  if (options.value.lazy) optionEntries.push('lazy: true')
  if (!options.value.server) optionEntries.push('server: false')
  if (!options.value.immediate) optionEntries.push('immediate: false')
  if (!options.value.clientCache) optionEntries.push('clientCache: false')

  const optionsStr = optionEntries.length > 0
    ? `{ ${optionEntries.join(', ')} }`
    : ''

  const call = optionsStr
    ? `usePosts({}, ${optionsStr})`
    : 'usePosts()'

  return `const { data: posts, pending, refresh } = ${call}`
})

// The actual data fetching - uses options from cookie
const { data: posts, pending, refresh, clear, status } = usePosts(
  {},
  {
    lazy: options.value.lazy,
    server: options.value.server,
    immediate: options.value.immediate,
    clientCache: options.value.clientCache,
    transform: (data) => {
      if (import.meta.server) {
        ssrFetchCount.value++
      } else {
        clientFetchCount.value++
      }
      lastFetchTime.value = new Date().toLocaleTimeString()
      return data
    }
  }
)

// Manual execute for when immediate is false
async function handleExecute() {
  await refresh()
}

// Clear cache and refresh
async function handleRefresh() {
  clear()
  await refresh()
}

// Update individual options
function setOption<K extends keyof typeof defaults>(key: K, value: typeof defaults[K]) {
  optionsCookie.value = { ...options.value, [key]: value }
}

// Check if we're in static mode
const { isStaticMode, modeDescription } = useRenderingMode()
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="Query Options Demo">
        <template #description>
          <p class="text-sm text-neutral-500 dark:text-neutral-400">
            Configure how data is fetched. Change options and either refresh the page or navigate away and back to see the effect.
          </p>
        </template>
        <template #links>
          <UBadge
            :color="isStaticMode ? 'warning' : 'success'"
            variant="subtle"
          >
            {{ modeDescription }}
          </UBadge>
        </template>
      </UPageHeader>

      <!-- Static mode warning -->
      <UAlert
        v-if="isStaticMode"
        class="mb-6"
        title="Limited functionality in static mode"
        icon="i-lucide-alert-triangle"
      >
        <template #description>
          <p>
            This page demonstrates interactive query options that require a server.
            In static (SSG) mode, options cannot be changed dynamically and refresh won't fetch new data.
          </p>
          <p class="mt-2">
            <NuxtLink
              to="https://demo.wpnuxt.com/query-options/"
              external
              class="text-primary hover:underline font-medium"
            >
              View the full demo with server support →
            </NuxtLink>
          </p>
        </template>
      </UAlert>

      <UPageBody>
        <!-- Options Form -->
        <UCard class="mb-8">
          <template #header>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold">
                Options
              </h3>
              <div class="flex items-center gap-2">
                <UButton
                  v-if="isCustomized"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  @click="resetToDefaults"
                >
                  Reset to defaults
                </UButton>
                <UBadge
                  :color="status === 'pending' ? 'warning' : status === 'success' ? 'success' : status === 'error' ? 'error' : 'neutral'"
                  variant="subtle"
                >
                  {{ status === 'pending' ? 'Loading...' : status === 'success' ? 'Data loaded' : status === 'error' ? 'Error' : 'Not fetched' }}
                </UBadge>
              </div>
            </div>
          </template>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Lazy Option -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <div class="font-medium flex items-center gap-1">
                  lazy
                  <UPopover
                    mode="hover"
                    :content="{ side: 'top' }"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-help"
                    />
                    <template #content>
                      <div class="p-3 max-w-xs text-sm">
                        <p class="mb-2">
                          <strong>false (default):</strong> Navigation waits for data to load before completing (uses Suspense).
                        </p>
                        <p>
                          <strong>true:</strong> Navigation happens immediately and the page shows a loading state while data fetches in the background.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400">
                  Don't block navigation while loading
                </div>
              </div>
              <USwitch
                :model-value="options.lazy"
                @update:model-value="setOption('lazy', $event)"
              />
            </div>

            <!-- Server Option -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <div class="font-medium flex items-center gap-1">
                  server
                  <UPopover
                    mode="hover"
                    :content="{ side: 'top' }"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-help"
                    />
                    <template #content>
                      <div class="p-3 max-w-xs text-sm">
                        <p class="mb-2">
                          <strong>true (default):</strong> Data is fetched on the server during SSR and included in the HTML payload.
                        </p>
                        <p>
                          <strong>false:</strong> Data is only fetched on the client after hydration.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400">
                  Fetch data during SSR
                </div>
              </div>
              <USwitch
                :model-value="options.server"
                @update:model-value="setOption('server', $event)"
              />
            </div>

            <!-- Immediate Option -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <div class="font-medium flex items-center gap-1">
                  immediate
                  <UPopover
                    mode="hover"
                    :content="{ side: 'top' }"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-help"
                    />
                    <template #content>
                      <div class="p-3 max-w-xs text-sm">
                        <p class="mb-2">
                          <strong>true (default):</strong> The query executes automatically when the composable is called.
                        </p>
                        <p>
                          <strong>false:</strong> You must manually call <code class="bg-neutral-200 dark:bg-neutral-700 px-1 rounded">refresh()</code> to fetch data.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400">
                  Fetch data immediately on mount
                </div>
              </div>
              <USwitch
                :model-value="options.immediate"
                @update:model-value="setOption('immediate', $event)"
              />
            </div>

            <!-- Client Cache Option -->
            <div class="flex items-center justify-between p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800">
              <div>
                <div class="font-medium flex items-center gap-1">
                  clientCache
                  <UPopover
                    mode="hover"
                    :content="{ side: 'top' }"
                  >
                    <UIcon
                      name="i-lucide-info"
                      class="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 cursor-help"
                    />
                    <template #content>
                      <div class="p-3 max-w-xs text-sm">
                        <p class="mb-2">
                          <strong>true (default):</strong> Identical queries are cached in the browser. Navigating back returns cached data instantly.
                        </p>
                        <p>
                          <strong>false:</strong> Always fetch fresh data.
                        </p>
                      </div>
                    </template>
                  </UPopover>
                </div>
                <div class="text-sm text-neutral-500 dark:text-neutral-400">
                  Cache responses for client-side navigation
                </div>
              </div>
              <USwitch
                :model-value="options.clientCache"
                @update:model-value="setOption('clientCache', $event)"
              />
            </div>
          </div>

          <template #footer>
            <div class="flex flex-wrap gap-4 items-center justify-between">
              <!-- Generated Code -->
              <div class="flex-1 min-w-0">
                <pre
                  class="text-sm bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded block overflow-x-scroll"
                  v-text="composableScript"
                />
              </div>

              <!-- Action Buttons -->
              <div class="flex gap-2">
                <UButton
                  v-if="!options.immediate"
                  color="primary"
                  :loading="pending"
                  icon="i-lucide-play"
                  size="sm"
                  @click="handleExecute"
                >
                  Execute Query
                </UButton>
                <UButton
                  color="neutral"
                  variant="outline"
                  :loading="pending"
                  icon="i-lucide-refresh-cw"
                  size="sm"
                  @click="handleRefresh"
                >
                  Refresh
                </UButton>
              </div>
            </div>
            <!-- Fetch Stats -->
            <div class="flex flex-wrap items-center gap-4 text-md p-2">
              <span class="text-neutral-500 dark:text-neutral-400">Fetches:</span>
              <span>
                <span class="font-semibold text-blue-500">{{ ssrFetchCount }}</span>
                <span class="text-neutral-500 dark:text-neutral-400"> SSR</span>
              </span>
              <span class="text-neutral-300 dark:text-neutral-600">|</span>
              <span>
                <span class="font-semibold text-green-500">{{ clientFetchCount }}</span>
                <span class="text-neutral-500 dark:text-neutral-400"> client</span>
              </span>
              <UButton
                color="neutral"
                variant="outline"
                icon="i-lucide-rotate-ccw"
                size="xs"
                @click="resetCounter"
              >
                Reset
              </UButton>
              <span class="ml-auto text-neutral-400 dark:text-neutral-500 text-sm">
                Navigate away and back to test caching
              </span>
            </div>
            <!-- Lazy option behavior -->
            <div class="flex flex-wrap items-center gap-4 text-sm p-2 border-t border-neutral-200 dark:border-neutral-700">
              <span class="text-neutral-500 dark:text-neutral-400">Lazy behavior:</span>
              <UBadge
                :color="lazyBehavior.color"
                variant="subtle"
                size="sm"
              >
                {{ lazyBehavior.message }}
              </UBadge>
              <span class="text-neutral-400 dark:text-neutral-500 text-xs">
                {{ lazyBehavior.note }}
              </span>
            </div>
          </template>
        </UCard>

        <!-- Posts Grid -->
        <div
          v-if="pending && !posts?.length"
          class="flex justify-center py-12"
        >
          <LoadingIcon />
        </div>

        <UBlogPosts v-else-if="posts?.length">
          <UBlogPost
            v-for="post in posts"
            :key="post.id"
            :title="post.title ?? undefined"
            :to="post.uri"
            :date="post.date ?? undefined"
            :image="getRelativeImagePath(post.featuredImage?.node?.sourceUrl ?? '')"
            variant="outline"
          >
            <template #description>
              <div v-sanitize-html="post.excerpt" />
            </template>
          </UBlogPost>
        </UBlogPosts>

        <UAlert
          v-else-if="!options.immediate"
          title="Manual Execution Required"
          description="Click 'Execute Query' above to fetch data (immediate: false is set)."
          color="info"
          icon="i-lucide-info"
        />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
