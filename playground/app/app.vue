<script setup lang="ts">
import { useAsyncGraphqlQuery } from '#imports'

const { data: items } = await useAsyncGraphqlQuery('Menu', { id: '1' }, {
  transform: function (v) {
    return v.data?.menu?.menuItems?.nodes.map(item => ({
      label: item.label,
      to: item.uri
    }))
  }
})
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
      <UNavigationMenu :items="items" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
