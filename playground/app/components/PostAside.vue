<script setup lang="ts">
import type { PostFragment, PageFragment } from '#build/graphql-operations'

defineProps<{
  post?: PostFragment | PageFragment
  prev?: string
  next?: string
}>()
</script>

<template>
  <UPageAside>
    <PrevNext
      :prev="post?.contentTypeName === 'post' ? prev : undefined"
      :next="post?.contentTypeName === 'post' ? next : undefined"
      prev-button="Vorige"
      next-button="Volgende"
    />
    <template v-if="post">
      <div class="test-sm mt-5">
        published:<br>
        {{ post.date?.split('T')[0] }}
      </div>
      <div
        v-if="post.categories?.nodes"
        class="test-sm mt-5"
      >
        <p>Categories:</p>
        <ul>
          <li
            v-for="category in post.categories?.nodes"
            :key="category.id"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>
      <div
        v-if="post?.featuredImage?.node?.sourceUrl"
        class="test-sm mt-5"
      >
        featured image:
        <img
          :src="post?.featuredImage?.node?.sourceUrl"
          class="rounded-lg shadow-md mt-2"
        >
      </div>
    </template>
  </UPageAside>
</template>
