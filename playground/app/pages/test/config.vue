<script setup lang="ts">
import { isStaging, useRuntimeConfig, useWPUri } from '#imports'

const wpUri = useWPUri()
const staging = await isStaging()

const config = useRuntimeConfig()
const wpNuxtConfig = config.public.wpNuxt
</script>

<template>
  <NuxtLayout>
    <HeaderComponent />
    <UContainer class="prose dark:prose-invert pt-5">
      <h2>Examples of predefined composables</h2>
      <h3>wpUri:</h3>
      <pre>{{ wpUri }}</pre>
      <h3>wpNuxtConfig:</h3>
      <pre>{{ wpNuxtConfig }}</pre>
      <h3>isStaging()</h3>
      <pre>{{ staging }}</pre>
    </UContainer>
  </NuxtLayout>
</template>
