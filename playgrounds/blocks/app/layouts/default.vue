<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data: menu } = useMenu({ name: 'main' })

const route = useRoute()
const menuItems = computed(() => [
  ...(menu.value?.map((item: MenuItemFragment) => ({ label: item.label, to: item.uri })) ?? []),
  { label: 'Blog', to: '/blog', active: route.path.startsWith('/blog') ?? false }
])
</script>

<template>
  <div>
    <UHeader>
      <template #title>
        <WPNuxtLogo />
        <h1 class="text-3xl font-bold -mb-[3px]">
          Blocks
        </h1>
      </template>
      <template #default>
        <UNavigationMenu :items="menuItems" />
      </template>
      <template #body>
        <UNavigationMenu :items="menuItems" orientation="vertical" />
      </template>
      <template #right>
        <UColorModeButton />
      </template>
    </UHeader>
    <slot />
  </div>
</template>
