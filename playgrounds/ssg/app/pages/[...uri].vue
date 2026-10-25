<script setup lang="ts">
const route = useRoute()
// Use route.path directly - it's already normalized and consistent between prerender and hydration
const uri = route.path.endsWith('/') ? route.path : `${route.path}/`

const { data: node } = await useNodeByUri({ uri }, { throwOnNotFound: true })

// nodeByUri can also resolve to a Category/Tag archive, which has `name`
// instead of `title` and no `content` field.
const title = computed(() => {
  if (!node.value) return undefined
  return 'title' in node.value ? node.value.title : ('name' in node.value ? node.value.name : undefined)
})
const content = computed(() => (node.value && 'content' in node.value) ? node.value.content : undefined)
</script>

<template>
  <article v-if="node">
    <UButton
      to="/"
      icon="i-lucide-arrow-left"
      variant="subtle"
      size="sm"
      class="mb-4"
    >
      Back
    </UButton>
    <UPageHeader :title="title" />
    <div
      v-if="content"
      v-sanitize-html="content"
      class="prose prose-lg dark:prose-invert max-w-none"
    />
  </article>
</template>
