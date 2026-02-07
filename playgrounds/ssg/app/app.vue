<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data } = await useMenu({ name: 'main' })
const menu = computed(() => {
  return data.value?.map((item: MenuItemFragment) => ({
    label: item.label,
    to: item.uri
  })) ?? []
})
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
        <UNavigationMenu :items="menu" />
      </template>
      <template #body>
        <UNavigationMenu :items="menu" orientation="vertical" />
      </template>
    </UHeader>
    <UContainer class="py-8">
      <NuxtPage />
    </UContainer>
  </UApp>
</template>
