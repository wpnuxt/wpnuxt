<script setup lang="ts">
import type { MenuItemFragment } from '#build/graphql-operations'
import { useMenu, usePosts } from '#wpnuxt'
import { computed, useAsyncData, useRoute } from '#imports'

const route = useRoute()
const { data: menu } = await useAsyncData('nav-menu', () => useMenu({ name: 'main' }))
const { data: posts } = await useAsyncData('nav-posts', () => usePosts())
const postSlugs = computed(() => posts.value?.data?.map(post => post.slug))

const wpLinks: MenuItemFragment[] = menu.value?.data?.map(link => ({
  label: link.label,
  to: link.uri
}))
const links = [
  {
    label: 'Blog',
    to: '/',
    active: postSlugs.value?.includes(route.path.replaceAll('/', '')),
    children: posts.value?.data?.map(post => ({
      label: post.title,
      to: post.uri
    }))
  },
  ...wpLinks,
  {
    label: 'Tests',
    active: route.path.startsWith('/test'),
    children: [
      {
        label: 'Composables',
        to: '/test/composables'
      },
      {
        label: 'Config',
        to: '/test/config'
      },
      {
        label: 'Test Error Page',
        to: '/test/error-page'
      }
    ]
  }
]
</script>

<template>
  <UHeader>
    <UNavigationMenu
      :items="links"
      content-orientation="vertical"
    />
    <template #title>
      <WPNuxtLogo /> <span class="text-lg">playground</span>
    </template>
    <template #right>
      <UColorModeButton />
    </template>
    <template #content>
      <UNavigationMenu
        :items="links"
        arrow
        orientation="vertical"
      />
    </template>
  </UHeader>
</template>
