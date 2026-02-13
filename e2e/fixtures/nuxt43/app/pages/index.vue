<template>
  <div>
    <h1>WPNuxt E2E Test - Nuxt {{ nuxtVersion }}</h1>
    <div v-if="pending">Loading...</div>
    <div v-else-if="error">Error: {{ error.message }}</div>
    <div v-else>
      <h2>Posts</h2>
      <ul>
        <li v-for="post in posts?.nodes" :key="post.id">
          {{ post.title }}
        </li>
      </ul>
      
      <h2>Pages</h2>
      <ul>
        <li v-for="page in pages?.nodes" :key="page.id">
          {{ page.title }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const nuxtVersion = '4'

const { data: posts, pending, error } = await usePosts()
const { data: pages } = await usePages()
</script>
