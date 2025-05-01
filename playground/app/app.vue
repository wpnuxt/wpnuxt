<script setup lang="ts">
const { data } = await useMenu({ id: '1' })

const menu = computed(() => {
  return data?.map(item => ({
    label: item.label,
    to: item.uri
  }))
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
      <UNavigationMenu :items="menu" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
