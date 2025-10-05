<script setup lang="ts">
// Side-by-side comparison of lazy vs non-lazy

// Regular (uses Suspense - blocks navigation)
const { data: regularPosts, pending: regularPending } = await usePosts()

// Lazy (no Suspense - instant navigation)
const { data: lazyPosts, pending: lazyPending } = useLazyPosts()
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Lazy vs Regular Comparison"
        description="Understanding the difference between lazy: true and lazy: false"
      />
      <UPageBody>
        <div class="grid grid-cols-2 gap-8">
          <!-- Regular (default) -->
          <div class="border border-gray-300 dark:border-gray-700 rounded-lg p-4">
            <h3 class="text-lg font-bold mb-2">
              Regular: usePosts()
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              lazy: false (default) - Uses Vue Suspense
            </p>
            <pre class="text-xs mb-2">pending: {{ regularPending }}</pre>
            <div class="text-sm space-y-2">
              <p>✅ Delays navigation until data ready</p>
              <p>✅ Data available immediately when page shows</p>
              <p>❌ Feels slower (waits for data)</p>
              <p>💡 Best for: Critical above-fold content</p>
            </div>
            <div class="mt-4 text-xs">
              <p class="font-semibold mb-1">
                Posts: {{ regularPosts?.length || 0 }}
              </p>
            </div>
          </div>

          <!-- Lazy -->
          <div class="border border-green-500 dark:border-green-700 rounded-lg p-4">
            <h3 class="text-lg font-bold mb-2">
              Lazy: useLazyPosts()
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-4">
              lazy: true - No Suspense blocking
            </p>
            <pre class="text-xs mb-2">pending: {{ lazyPending }}</pre>
            <div class="text-sm space-y-2">
              <p>✅ Navigation happens instantly</p>
              <p>✅ Page shows immediately</p>
              <p>✅ Better perceived performance</p>
              <p>💡 Best for: Below-fold or non-critical content</p>
            </div>
            <div class="mt-4 text-xs">
              <p class="font-semibold mb-1">
                Posts: {{ lazyPosts?.length || 0 }}
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <h4 class="font-bold mb-2">
            Try it yourself:
          </h4>
          <p class="text-sm mb-2">
            Navigate between pages and watch how the URL changes and content loads:
          </p>
          <div class="flex gap-2">
            <NuxtLink
              to="/"
              class="text-blue-600 hover:underline"
            >Home (Regular)</NuxtLink>
            <NuxtLink
              to="/lazy"
              class="text-green-600 hover:underline"
            >Lazy Page</NuxtLink>
          </div>
          <p class="text-xs mt-2 text-gray-600 dark:text-gray-400">
            With lazy: false, navigation feels delayed (Suspense waits)<br>
            With lazy: true, navigation is instant (you see loading UI)
          </p>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
