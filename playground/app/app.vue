<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data } = await useMenu({ name: 'main' })
const runtimeConfig = useRuntimeConfig()

const menu = computed(() => {
  const wordPressPages = data.value?.map((item: MenuItemFragment) => ({
    label: item.label,
    to: item.uri
  })) ?? []
  return [
    {
      label: 'Home',
      to: '/'
    },
    {
      label: 'Lazy data fetching',
      to: '/lazy'
    },
    {
      label: 'Comparison',
      to: '/comparison'
    },
    ...wordPressPages
  ]
})
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <WPNuxtLogo />
      </template>
      <template #right>
        <UButton
          v-if="runtimeConfig.public.wordpressUrl"
          icon="i-logos-wordpress-icon"
          variant="ghost"
          :to="`${runtimeConfig.public.wordpressUrl}/wp-admin`"
        />
        <UColorModeSwitch />
      </template>
      <UNavigationMenu :items="menu" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
