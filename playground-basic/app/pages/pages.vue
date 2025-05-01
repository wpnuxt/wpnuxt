<script setup lang="ts">
const { data: pages } = await usePages()
</script>

<template>
  <div
    v-for="page in pages"
    :key="page.id"
    :title="page.title"
    :to="`/${page.slug}`"
    class="shadow-md mb-0"
  >
    <h2>{{ page.title }}</h2>
    <div v-sanitize-html="page.excerpt" />
    <NuxtLink
      :to="`/${page.slug}`"
      color="neutral"
      variant="outline"
    >
      Read More
    </NuxtLink>
  </div>
</template>
