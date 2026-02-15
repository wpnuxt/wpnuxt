<template>
  <div>
    <h1>WPNuxt E2E Test - Nuxt {{ nuxtVersion }}</h1>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="error">
      Error: {{ error.message }}
    </div>
    <div v-else>
      <p id="site-title">
        {{ settings?.title }}
      </p>

      <h2>Posts</h2>
      <ul id="posts-list">
        <li
          v-for="post in posts"
          :key="post.id"
          class="post-item"
        >
          <NuxtLink :to="post.uri" class="post-link">
            {{ post.title }}
          </NuxtLink>
          <img
            v-if="post.featuredImage?.node?.sourceUrl"
            :src="post.featuredImage.node.sourceUrl"
            :alt="post.featuredImage.node.altText || ''"
            class="featured-image"
          >
          <span v-if="post.categories?.nodes?.length" class="post-categories">
            <NuxtLink
              v-for="cat in post.categories.nodes"
              :key="cat.id"
              :to="`/category/${cat.name}`"
              class="category-link"
            >
              {{ cat.name }}
            </NuxtLink>
          </span>
        </li>
      </ul>

      <h2>Pages</h2>
      <ul id="pages-list">
        <li
          v-for="wp in pages"
          :key="wp.id"
          class="page-item"
        >
          <NuxtLink :to="wp.uri" class="page-link">
            {{ wp.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const nuxtVersion = '3.13'

const { data: posts, pending, error } = await usePosts()
const { data: pages } = await usePages()
const { data: settings } = await useGeneralSettings()
</script>
