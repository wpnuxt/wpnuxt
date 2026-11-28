<template>
  <div>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else>
      <h1 class="category-title">
        Category: {{ name }}
      </h1>
      <ul id="category-posts">
        <li
          v-for="post in posts"
          :key="post.id"
          class="post-item"
        >
          <NuxtLink :to="post.uri" class="post-link">
            {{ post.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const name = route.params.name as string

const { data: posts, pending } = await usePostsByCategoryName({ categoryName: name })
</script>
