<script setup lang="ts">
import { useHead, useAsyncData } from '#imports'
import { useGeneralSettings } from '#wpnuxt'

const { data: settings } = await useAsyncData('settings', () => useGeneralSettings())

useHead({
  title: settings.value?.data?.title
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
