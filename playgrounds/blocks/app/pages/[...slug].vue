<script setup lang="ts">
const route = useRoute()

const { data: page, pending } = await usePageByUri(
  { uri: route.path },
  { watch: [() => route.path] }
)
</script>

<template>
  <UContainer class="py-8">
    <div
      v-if="pending"
      class="text-gray-500"
    >
      Loading...
    </div>

    <template v-else-if="page">
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="text-primary-500 hover:underline"
        >
          &larr; Back to home
        </NuxtLink>
      </div>

      <article class="max-w-3xl mx-auto">
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-4">
            {{ page.title }}
          </h1>
        </header>

        <WPContent
          :node="page"
          class="prose prose-lg dark:prose-invert max-w-none"
        />
      </article>
    </template>

    <div
      v-else
      class="text-red-500"
    >
      Page not found
    </div>
  </UContainer>
</template>
