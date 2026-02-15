<template>
  <div>
    <h1>Books</h1>
    <div v-if="pending">
      Loading...
    </div>
    <div v-else-if="error">
      Error: {{ error.message }}
    </div>
    <ul v-else id="books-list">
      <li
        v-for="book in books"
        :key="book.id"
      >
        <NuxtLink :to="book.uri" class="book-link">
          {{ book.title }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const { data: books, pending, error } = await useBooks()
</script>
