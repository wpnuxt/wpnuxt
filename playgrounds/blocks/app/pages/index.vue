<script setup lang="ts">
const { data: featuredPost } = await usePostByUri({ uri: '/render-gutenberg-blocks/' })

const features = [
  { icon: 'i-lucide-blocks', title: 'Per-block components', description: 'Each Gutenberg block renders as its own Vue component' },
  { icon: 'i-lucide-image', title: 'NuxtImg optimization', description: 'Images automatically use NuxtImg for lazy loading and optimization' },
  { icon: 'i-lucide-palette', title: 'Nuxt UI integration', description: 'Components like CoreButton use UButton when @nuxt/ui is available' },
  { icon: 'i-lucide-code', title: 'Easy overrides', description: 'Override any block component in your project\'s components/blocks/ folder' }
]
</script>

<template>
  <UContainer>
    <UPageBody>
      <!-- Hero -->
      <div class="text-center py-12">
        <h1 class="text-4xl font-bold mb-4">
          WPNuxt Blocks
        </h1>
        <p class="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          Render WordPress Gutenberg blocks as individual Vue components instead of raw HTML.
          Full control over each block type with automatic optimizations.
        </p>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="p-4 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            <UIcon
              :name="feature.icon"
              class="text-primary-500 text-xl mb-2"
            />
            <h3 class="font-semibold text-sm mb-1">
              {{ feature.title }}
            </h3>
            <p class="text-xs text-gray-500 dark:text-gray-400">
              {{ feature.description }}
            </p>
          </div>
        </div>
      </div>

      <!-- Featured post -->
      <div
        v-if="featuredPost"
        class="mb-12"
      >
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold">
            Featured Post
          </h2>
          <UBadge
            variant="subtle"
            size="sm"
          >
            Rendered with WPContent
          </UBadge>
        </div>
        <UCard>
          <div class="mb-4">
            <NuxtLink
              :to="`/blog${featuredPost.uri}`"
              class="text-xl font-semibold hover:text-primary-500 transition-colors"
            >
              {{ featuredPost.title }}
            </NuxtLink>
            <div
              v-if="featuredPost.date"
              class="text-sm text-gray-500 mt-1"
            >
              {{ new Date(featuredPost.date).toLocaleDateString() }}
            </div>
          </div>
          <WPContent
            :node="featuredPost"
            class="prose dark:prose-invert max-w-none"
          />
          <template #footer>
            <NuxtLink
              :to="`/blog${featuredPost.uri}`"
              class="text-primary-500 hover:underline text-sm"
            >
              View full post with comparison view &rarr;
            </NuxtLink>
          </template>
        </UCard>
      </div>
    </UPageBody>
  </UContainer>
</template>
