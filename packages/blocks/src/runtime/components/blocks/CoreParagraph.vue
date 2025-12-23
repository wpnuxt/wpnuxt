<script setup lang="ts">
import { getCssClasses } from '../../util'
import type { CoreParagraph } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreParagraph
}>()
</script>

<template>
  <p
    :id="block?.attributes?.anchor ?? undefined"
    v-sanitize="block?.attributes?.content"
    :class="getCssClasses(props.block)"
    :style="block?.attributes?.style ?? undefined"
  />
</template>
