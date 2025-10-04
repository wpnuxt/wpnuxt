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
      <div class="text-sm mt-5">
        published:<br>
        {{ post.date?.split('T')[0] }}
      </div>
      <div
        v-if="'categories' in post && post.categories?.nodes"
        class="text-sm mt-5"
      >
        <p>Categories:</p>
        <ul>
          <li
            v-for="category in 'categories' in post ? post.categories?.nodes : []"
            :key="category.name"
          >
            {{ category.name }}
          </li>
        </ul>
      </div>
      <div
        v-if="post?.featuredImage?.node?.sourceUrl"
        class="text-sm mt-5"
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
