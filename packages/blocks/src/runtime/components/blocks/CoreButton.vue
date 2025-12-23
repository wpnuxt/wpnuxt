<script setup lang="ts">
import { convertFontSize, getCssClasses } from '../../util'
import type { CoreButton } from '#wpnuxt/blocks'
import { ref, useNuxtApp } from '#imports'

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
</script>

<template>
  <!-- Use Nuxt UI UButton when available -->
  <UButton
    v-if="hasNuxtUI"
    :to="block.attributes.url ?? undefined"
    :target="block.attributes.linkTarget"
    :rel="block.attributes.rel"
    :style="block.attributes.style"
    :variant
    :class="getCssClasses(block)"
    :size="convertFontSize(block.attributes?.fontSize ?? undefined, '', 'md') as ButtonSize"
  >
    <span v-sanitize="block.attributes.text" />
  </UButton>

  <!-- Fallback to native link/button when Nuxt UI is not available -->
  <a
    v-else-if="block.attributes.url"
    :href="block.attributes.url"
    :target="block.attributes.linkTarget ?? undefined"
    :rel="block.attributes.rel ?? undefined"
    :style="block.attributes.style"
    :class="['wp-block-button__link', getCssClasses(block)]"
  >
    <span v-sanitize="block.attributes.text" />
  </a>
  <button
    v-else
    type="button"
    :style="block.attributes.style"
    :class="['wp-block-button__link', getCssClasses(block)]"
  >
    <span v-sanitize="block.attributes.text" />
  </button>
</template>
