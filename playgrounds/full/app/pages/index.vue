<script setup lang="ts">
const orderField = ref('DATE')
const order = ref('DESC')

const orderFieldOptions = ['DATE', 'TITLE', 'MODIFIED', 'AUTHOR', 'COMMENT_COUNT']
const orderOptions = ['DESC', 'ASC']

const { data: posts, pending, refresh, clear } = await usePosts(() => ({
  orderField: orderField.value,
  order: order.value
}))
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
        composable-name="usePosts"
        composable-script="const { data: posts, pending, refresh, clear } = await usePosts(() => ({ orderField: orderField.value, order: order.value }))"
      />
      <UPageBody>
        <div class="flex justify-end gap-4 mb-6">
          <UFormField label="Order by">
            <USelect v-model="orderField" :items="orderFieldOptions" />
          </UFormField>
          <UFormField label="Direction">
            <USelect v-model="order" :items="orderOptions" />
          </UFormField>
        </div>
        <UBlogPosts>
          <UBlogPost
            v-for="post in posts"
            :key="post.id"
            :title="post.title ?? undefined"
            :to="post.uri"
            :date="post.date ?? undefined"
            :image="post.featuredImage?.node?.relativePath ?? ''"
            variant="outline"
          >
            <template #description>
              <div v-sanitize-html="post.excerpt" />
            </template>
          </UBlogPost>
        </UBlogPosts>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
