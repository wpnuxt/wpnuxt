<script setup lang="ts">
const route = useRoute()
const { data: pages } = await usePages()
</script>

<template>
  <nav>
    <ul>
      <li>
        <NuxtLink
          to="/"
          :class="route.path === '/' ? 'active' : ''"
        >
          Posts
        </NuxtLink>
      </li>
      <li>|</li>
      <li>pages:</li>
      <li
        v-for="page in pages"
        :key="page.id"
      >
        <NuxtLink
          :class="route.path === `/${page.slug}` ? 'active' : ''"
          :to="`/${page.slug}`"
        >
          {{ page.title }}
        </NuxtLink>
      </li>
    </ul>
  </nav>
</template>
