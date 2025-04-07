<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const { data } = useAsyncGraphqlQuery('Posts')
const posts = computed(() => data.value?.data?.posts?.nodes)

const headerLinks = ref([{ label: 'Documentation', to: 'https://wpnuxt.com' }])
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="WPNuxt"
        :description="posts?.length ? posts.length + ' posts fetched from WordPress using GraphQL' : 'fetching posts...'"
        :links="headerLinks"
      />
      <UPageBody class="grid grid-cols-3 gap-5 my-10">
        <UPageCard
          v-for="post in posts"
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
        <Loading v-if="!posts" />
      </UPageBody>
    </UPage>
  </UContainer>
</template>
