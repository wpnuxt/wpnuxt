<template>
  <div>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="!node" id="not-found">
      Not found
    </div>
    <div v-else id="node-content">
      <h1 class="node-title">
        {{ node.title }}
      </h1>
      <img
        v-if="node.featuredImage?.node?.sourceUrl"
        :src="node.featuredImage.node.sourceUrl"
        :alt="node.featuredImage.node.altText || ''"
        class="featured-image"
      >
      <div v-if="'categories' in node && node.categories?.nodes?.length" class="node-categories">
        <NuxtLink
          v-for="cat in node.categories.nodes"
          :key="cat.id"
          :to="`/category/${cat.name}`"
          class="category-link"
        >
          {{ cat.name }}
        </NuxtLink>
      </div>
      <!-- eslint-disable-next-line vue/no-v-sanitize-html -->
      <div
        v-if="node.content"
        v-sanitize-html="node.content"
        class="node-body"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const uri = `/${(route.params.slug as string[]).join('/')}/`

const { data: node, pending } = await useNodeByUri({ uri })
</script>
