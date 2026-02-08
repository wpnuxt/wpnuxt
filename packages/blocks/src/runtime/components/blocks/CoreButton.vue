<script setup lang="ts">
import { convertFontSize, getCssClasses } from '../../util'
import type { CoreButton } from '#wpnuxt/blocks'
import { computed, ref, useNuxtApp, useRuntimeConfig, isInternalLink, toRelativePath } from '#imports'

type ButtonVariant = 'solid' | 'outline' | 'soft' | 'subtle' | 'ghost' | 'link'
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const props = defineProps<{
  block: CoreButton
}>()

const variant = ref<ButtonVariant>('solid')
if (props.block.attributes?.metadata) {
  const metadataVariant = props.block.attributes?.metadata?.replaceAll('"', '')
  if (['solid', 'outline', 'soft', 'subtle', 'ghost', 'link'].includes(metadataVariant)) {
    variant.value = metadataVariant as ButtonVariant
  }
}

// Check if Nuxt UI is available
const nuxtApp = useNuxtApp()
const hasNuxtUI = !!(nuxtApp.vueApp.component('UButton'))

const config = useRuntimeConfig()
const wordpressUrl = (config.public.wpNuxt as Record<string, unknown>)?.wordpressUrl as string

const isInternal = computed(() => {
  const url = props.block.attributes?.url
  return !!url && isInternalLink(url, wordpressUrl)
})

const buttonUrl = computed(() => {
  const url = props.block.attributes?.url
  if (!url) return undefined
  return isInternal.value ? toRelativePath(url) : url
})
</script>

<template>
  <!-- Use Nuxt UI UButton when available -->
  <UButton
    v-if="hasNuxtUI"
    :to="buttonUrl"
    :target="block.attributes.linkTarget"
    :rel="block.attributes.rel"
    :style="block.attributes.style"
    :variant
    :class="getCssClasses(block)"
    :size="convertFontSize(block.attributes?.fontSize ?? undefined, '', 'md') as ButtonSize"
  >
    <span v-sanitize-html="block.attributes.text" />
  </UButton>

  <!-- Fallback: use NuxtLink for internal, <a> for external -->
  <NuxtLink
    v-else-if="block.attributes.url && isInternal"
    :to="buttonUrl"
    :target="block.attributes.linkTarget ?? undefined"
    :rel="block.attributes.rel ?? undefined"
    :style="block.attributes.style"
    :class="['wp-block-button__link', getCssClasses(block)]"
  >
    <span v-sanitize-html="block.attributes.text" />
  </NuxtLink>
  <a
    v-else-if="block.attributes.url"
    :href="block.attributes.url"
    :target="block.attributes.linkTarget ?? undefined"
    :rel="block.attributes.rel ?? undefined"
    :style="block.attributes.style"
    :class="['wp-block-button__link', getCssClasses(block)]"
  >
    <span v-sanitize-html="block.attributes.text" />
  </a>
  <button
    v-else
    type="button"
    :style="block.attributes.style"
    :class="['wp-block-button__link', getCssClasses(block)]"
  >
    <span v-sanitize-html="block.attributes.text" />
  </button>
</template>
