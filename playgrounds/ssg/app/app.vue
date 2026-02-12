<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data: menu } = await useMenu({ name: 'main' })
const menuItems = computed(() =>
  menu.value?.map((item: MenuItemFragment) => ({ label: item.label, to: item.uri })) ?? []
)
</script>

<template>
  <UApp>
    <UHeader>
      <template #title>
        <WPNuxtLogo />
        <h1 class="text-3xl font-bold -mb-[3px]">
          SSG
        </h1>
      </template>
      <template #default>
        <UNavigationMenu :items="menuItems" />
      </template>
      <template #body>
        <UNavigationMenu :items="menuItems" orientation="vertical" />
      </template>
    </UHeader>
    <UContainer class="py-8">
      <NuxtPage />
    </UContainer>
  </UApp>
</template>
