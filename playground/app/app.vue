<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data } = await useMenu({ id: '1' })

const menu = computed(() => {
  const wordPressPages = data?.map((item: MenuItemFragment) => ({
    label: item.label,
    to: item.uri
  }))
  return [
    {
      label: 'Home',
      to: '/'
    },
    {
      label: 'Async',
      to: '/async'
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
        <WPAdminLink />
        <UColorModeSwitch />
      </template>
      <UNavigationMenu :items="menu" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
