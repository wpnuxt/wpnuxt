<script setup lang="ts">
/**
 * CoreGallery - Custom Gutenberg Gallery Block Renderer
 *
 * Renders WordPress gallery blocks using Nuxt UI's UScrollArea
 * with masonry layout and virtualization.
 */

interface CoreImageBlock {
  name?: string
  attributes?: {
    url?: string
    width?: number
    height?: number
  }
}

interface CoreGalleryBlock {
  innerBlocks?: CoreImageBlock[]
}

const props = defineProps<{
  block: CoreGalleryBlock
}>()

// Pseudo-random height for masonry variety when actual height not available
const heights = [280, 320, 400, 480]
function getHeight(index: number) {
  const seed = (index * 11 + 7) % 17
  return heights[seed % heights.length]!
}

const images = computed(() => {
  return props.block?.innerBlocks
    ?.filter(block => block?.name === 'core/image' && block.attributes?.url)
    .map((block, index) => ({
      id: index,
      src: getRelativeImagePath(block.attributes?.url ?? ''),
      width: block.attributes?.width || 640,
      height: block.attributes?.height || getHeight(index)
    })) || []
})

// Fixed lanes for masonry layout (responsive via breakpoints would require @vueuse/core)
const lanes = 3
</script>

<template>
  <UScrollArea
    v-slot="{ item, index }"
    :items="images"
    :virtualize="{
      lanes,
      gap: 16,
      estimateSize: 360
    }"
    class="w-full mb-8"
  >
    <NuxtImg
      :src="item.src"
      :width="item.width"
      :height="item.height"
      :loading="index > 6 ? 'lazy' : 'eager'"
      class="rounded-lg size-full object-cover"
    />
  </UScrollArea>
</template>
