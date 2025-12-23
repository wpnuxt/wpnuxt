<script setup lang="ts">
import { getCssClasses } from '../../util'
import type { CoreHeading } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreHeading
}>()
const cssClass = getCssClasses(props.block)
</script>

<template>
  <template v-if="block.attributes.level === 1">
    <h1
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
  <template v-else-if="block.attributes.level === 2">
    <h2
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
  <template v-else-if="block.attributes.level === 3">
    <h3
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
  <template v-else-if="block.attributes.level === 4">
    <h4
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
  <template v-else-if="block.attributes.level === 5">
    <h5
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
  <template v-else-if="block.attributes.level === 6">
    <h6
      :id="block?.attributes?.anchor ?? undefined"
      v-sanitize="block.attributes.content"
      :class="cssClass"
    />
  </template>
</template>
