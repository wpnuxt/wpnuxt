<script setup lang="ts">
const route = useRoute()

const { data: node, pending } = await useNodeByUri(
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

    <template v-else-if="node">
      <div class="mb-8">
        <NuxtLink
          to="/"
          class="text-primary-500 hover:underline"
        >
          &larr; Back to posts
        </NuxtLink>
      </div>

      <article class="max-w-3xl mx-auto">
        <header class="mb-8">
          <h1 class="text-4xl font-bold mb-4">
            {{ node.title }}
          </h1>
          <div
            v-if="node.date"
            class="text-gray-500 text-sm"
          >
            {{ new Date(node.date).toLocaleDateString() }}
          </div>
        </header>

        <WPContent
          :node="node"
          class="prose prose-lg max-w-none"
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
