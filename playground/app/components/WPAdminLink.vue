<script setup lang="ts">
const runtimeConfig = useRuntimeConfig()
</script>

<template>
  <UButton
    v-if="runtimeConfig.public.wordpressUrl"
    icon="i-logos-wordpress-icon"
    variant="ghost"
    :to="`${runtimeConfig.public.wordpressUrl}/wp-admin`"
  />
</template>
