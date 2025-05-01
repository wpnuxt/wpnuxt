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

<style scoped>
nav {
    margin-top: 20px;
    margin-left: 0px;
    padding-bottom: 20px;
    border-bottom: 1px solid #ccc;
}
ul {
    display: inline;
    padding-inline-start: 0px;
}
ul li {
    display: inline;
    margin-right: 10px;
    color: #ccc;
}
ul li a.active {
  color: rgb(186 175 78 / 1);
  text-decoration: none;
  border-bottom: transparent;
}
</style>
