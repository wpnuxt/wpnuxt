<script setup lang="ts">
const route = useRoute()
const wpUri = computed(() => route.path.replace(/^\/blog/, ''))

const { data: post, pending } = await usePostByUri(
  { uri: wpUri.value },
  { watch: [wpUri] }
)

const tabs = [
  { label: 'Blocks', icon: 'i-lucide-blocks', slot: 'blocks' as const },
  { label: 'HTML', icon: 'i-lucide-code', slot: 'html' as const }
]

const inspectorOpen = ref(false)

const blockSummary = computed(() => {
  const blocks = post.value?.editorBlocks
  if (!blocks?.length) return ''
  const counts: Record<string, number> = {}
  for (const block of blocks) {
    const name = block?.name ?? 'unknown'
    counts[name] = (counts[name] ?? 0) + 1
  }
  const parts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => `${count}x ${name}`)
  return `${blocks.length} blocks: ${parts.join(', ')}`
})
</script>

<template>
  <UContainer class="py-8">
    <div
      v-if="pending"
      class="text-gray-500"
    >
      Loading...
    </div>

    <template v-else-if="post">
      <div class="mb-8">
        <NuxtLink
          to="/blog"
          class="text-primary-500 hover:underline"
        >
          &larr; Back to blog
        </NuxtLink>
      </div>

      <article class="max-w-3xl mx-auto">
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-4">
            {{ post.title }}
          </h1>
          <div
            v-if="post.date"
            class="text-gray-500 text-sm"
          >
            {{ new Date(post.date).toLocaleDateString() }}
          </div>
        </header>

        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Compare <strong>Blocks</strong> rendering (individual Vue components per block) with raw <strong>HTML</strong> output.
        </p>

        <UTabs
          :items="tabs"
          class="mb-8"
        >
          <template #blocks>
            <div class="pt-4">
              <WPContent
                :node="post"
                class="prose prose-lg dark:prose-invert max-w-none"
              />
            </div>
          </template>
          <template #html>
            <div class="pt-4">
              <div
                v-if="post.content"
                v-sanitize-html="post.content"
                class="prose prose-lg dark:prose-invert max-w-none"
              />
              <p
                v-else
                class="text-gray-400 italic"
              >
                No HTML content available.
              </p>
            </div>
          </template>
        </UTabs>

        <div
          v-if="post.editorBlocks?.length"
          class="border border-gray-200 dark:border-gray-700 rounded-lg"
        >
          <button
            class="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            @click="inspectorOpen = !inspectorOpen"
          >
            <span>
              <UIcon
                name="i-lucide-scan-search"
                class="mr-2 align-middle"
              />
              Blocks Inspector
            </span>
            <span class="text-xs text-gray-400">
              {{ blockSummary }}
            </span>
          </button>
          <div
            v-if="inspectorOpen"
            class="px-4 pb-4"
          >
            <pre class="text-xs bg-gray-50 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto max-h-[600px] overflow-y-auto">{{ JSON.stringify(post.editorBlocks, null, 2) }}</pre>
          </div>
        </div>
      </article>
    </template>

    <div
      v-else
      class="text-red-500"
    >
      Post not found
    </div>
  </UContainer>
</template>
