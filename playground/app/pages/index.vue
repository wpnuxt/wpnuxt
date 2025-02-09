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
    <HeaderComponent />
    <UsePosts />
    <UsePostsByCategory category-name="Lorem Ipsum" />
    <LatestPost />
  </NuxtLayout>
</template>
