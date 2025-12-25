<script setup lang="ts">
import type { MenuItemFragment } from '#graphql-operations'

const { data } = await useMenu({ name: 'main' })
const runtimeConfig = useRuntimeConfig()
const { isAuthenticated, user, logout } = useWPAuth()

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

        <template v-if="isAuthenticated">
          <UUser
            to="/profile"
            :name="user?.name || user?.username"
            :avatar="{ src: user?.avatar?.url, icon: 'i-lucide-user' }"
            size="sm"
          />
          <UButton
            variant="ghost"
            color="error"
            icon="i-lucide-log-out"
            @click="logout"
          />
        </template>
        <UButton
          v-else
          to="/login"
          variant="soft"
        >
          Sign in
        </UButton>
      </template>
      <UNavigationMenu :items="menu" />
    </UHeader>
    <UMain>
      <NuxtPage />
    </UMain>
  </UApp>
</template>
