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
      <ProseH2>Examples of predefined composables</ProseH2>
      <ProseH3>wpUri:</ProseH3>
      <ProsePre>{{ wpUri }}</ProsePre>
      <ProseH3>wpNuxtConfig:</ProseH3>
      <ProsePre>{{ wpNuxtConfig }}</ProsePre>
      <ProseH3>isStaging()</ProseH3>
      <ProsePre>{{ staging }}</ProsePre>
    </UContainer>
  </NuxtLayout>
</template>
