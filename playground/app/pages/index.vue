<script setup lang="ts">
import type { GeneralSettingsFragment, PostFragment } from '#build/graphql-operations'
import { useHead, ref, computed } from '#imports'
import { useGeneralSettings, usePosts, usePostsByCategoryName } from '#wpnuxt'

/* const { data: posts } = await useAsyncData('posts', () => usePosts())
const { data: settings } = await useAsyncData('settings', () => useGeneralSettings())
const { data: latestPost } = await useAsyncData('latestPost', () => usePosts({ limit: 1 }))
const { data: postsByCategory } = await useAsyncData('postsByCategory', () => usePostsByCategory({ categoryName: 'Lorem Ipsum' }))
*/

const isLoading = ref(true)
const posts = ref<PostFragment[]>([])
const settings = ref<GeneralSettingsFragment | null>(null)
const latestPost = ref<PostFragment | null>(null)
const postsByCategory = ref<PostFragment[]>([])

async function fetch() {
  isLoading.value = true
  const { data: postsData } = await usePosts()
  const { data: settingsData } = await useGeneralSettings()
  const { data: latestPostData } = await usePosts({ limit: 1 })
  const { data: postsByCategoryData } = await usePostsByCategoryName({ categoryName: 'Lorem Ipsum' })

  posts.value = computed(() => postsData).value
  settings.value = computed(() => settingsData).value
  latestPost.value = computed(() => latestPostData?.[0] || null).value
  postsByCategory.value = computed(() => postsByCategoryData).value
  isLoading.value = false
}
fetch()

useHead({
  title: settings.value?.title
})
</script>

<template>
  <NuxtLayout>
    <ULandingSection
      id="posts"
      :title="settings?.title || 'WPNuxt Demo'"
      description="WordPress posts are shown below as cards. WordPress pages are listed above in the header."
    >
      <UPageGrid
        v-if="!isLoading"
      >
        <ULandingCard
          v-for="post, index in posts"
          :key="index"
          :title="post.title"
          :description="post.date?.split('T')[0]"
          :to="post.uri"
        >
          <img
            v-if="post?.featuredImage?.node?.sourceUrl"
            :src="post.featuredImage.node.sourceUrl"
            class="w-full rounded-md"
          >
          <span v-sanitize="post.excerpt" />
        </ULandingCard>
      </UPageGrid>
      <UPageGrid v-else>
        <ULandingCard
          v-for="skel, index in [1, 2, 3]"
          :key="index"
        >
          <div class="-mt-2 space-y-3">
            <USkeleton class="h-4 w-[250px]" />
            <USkeleton class="h-3 w-[100px]" />
          </div>
          <USkeleton
            class="h-44 w-full"
            :ui="{ rounded: 'rounded-md' }"
          />
          <div class="mt-2 space-y-3">
            <USkeleton class="h-3 w-full" />
            <USkeleton class="h-3 w-[250px]" />
          </div>
        </ULandingCard>
      </UPageGrid>
    </ULandingSection>
    <ULandingSection
      v-if="!isLoading && postsByCategory.length > 0"
      id="postsByCategory"
      title="Posts by Category 'Lorem Ipsum'"
    >
      <ULandingCard
        v-for="post, index in postsByCategory"
        :key="index"
        :title="post.title"
        :description="post.date?.split('T')[0]"
        :to="post.uri"
      >
        <img
          v-if="post?.featuredImage?.node?.sourceUrl"
          :src="post.featuredImage.node.sourceUrl"
          class="w-full rounded-md"
        >
        <span v-sanitize="post.excerpt" />
      </ULandingCard>
    </ULandingSection>
    <ULandingSection
      v-if="!isLoading"
      id="latestPost"
      title="Latest Post"
    >
      <ULandingCard
        :title="latestPost?.title"
        :description="latestPost?.date?.split('T')[0]"
        :to="latestPost?.uri"
      >
        <img
          v-if="latestPost?.featuredImage?.node?.sourceUrl"
          :src="latestPost?.featuredImage.node.sourceUrl"
          class="w-full rounded-md"
        >
        <span v-sanitize="latestPost?.excerpt" />
      </ULandingCard>
    </ULandingSection>
  </NuxtLayout>
</template>
