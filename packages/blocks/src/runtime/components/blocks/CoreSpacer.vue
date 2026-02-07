<script setup lang="ts">
import { getCssClasses } from '../../util'
import type { CoreSpacer } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreSpacer
}>()
const cssClass = getCssClasses(props.block)
</script>

<template>
  <div
    :class="cssClass"
    :style="{
      height: block.attributes?.spacerHeight ?? undefined,
      width: block.attributes?.spacerWidth ?? undefined
    }"
  />
</template>
