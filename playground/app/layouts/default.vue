<script setup lang="ts">
import { isStaging } from '#imports'

const staging = await isStaging()
</script>

<template>
  <UMain>
    <slot />
    <StagingBanner
      v-if="staging"
    />
  </UMain>
</template>
