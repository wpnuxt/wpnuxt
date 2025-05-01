<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data } = await useAsyncMenu({ id: '1' })
const menu = data.map((item: MenuItemFragment) => ({
  label: item.label,
  to: item.uri
}))
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <WPNuxtLogo />
      </template>
      <template #right>
        <UColorModeSwitch />
      </template>
      <UNavigationMenu :items="menu" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
