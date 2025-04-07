<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const { data: posts } = useAsyncGraphqlQuery('Posts')

const headerLinks = ref([
  {
    label: 'Documentation',
    to: 'https://wpnuxt.com'
  }
])
</script>

<template>
  <UContainer v-if="posts?.data?.posts?.nodes">
    <UPage>
      <UPageHeader
        title="WPNuxt"
        :description="posts.data.posts.nodes.length + ' posts fetched from WordPress using GraphQL'"
        :links="headerLinks"
      />
      <UPageBody class="grid grid-cols-3 gap-5 my-10">
        <UPageCard
          v-for="post in posts.data.posts.nodes"
          :key="post.id"
          :title="post.title"
          :to="`/${post.slug}`"
          class="shadow-md"
        >
          <template #description>
            <div v-sanitize-html="post.excerpt" />
          </template>
          <template #footer>
            <UButton
              :to="`/${post.slug}`"
              color="neutral"
              variant="outline"
            >
              Read More
            </UButton>
          </template>
        </UPageCard>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
