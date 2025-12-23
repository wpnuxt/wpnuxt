<script setup lang="ts">
import type { CoreGallery, CoreImage } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreGallery
}>()
const imageBlocks: CoreImage[] = []
props.block?.innerBlocks?.forEach((innerBlock) => {
  if (innerBlock && innerBlock.name === 'core/image') {
    const imgBlock = innerBlock as CoreImage
    imageBlocks.push(imgBlock)
  }
})
</script>

<template>
  <div class="columns-2 md:columns-3 lg:columns-4 mx-[-8px] mb-20">
    <div
      v-for="(imgBlock, index) in imageBlocks"
      :key="index"
      class="px-0 md:px-1"
    >
      <div
        v-if="imgBlock"
        class="galleryImgWrapper rounded-lg overflow-hidden relative mb-4 md:mb-6 shadow-md hover:shadow-xl"
      >
        <CoreImage
          :block="imgBlock"
          class="rounded-lg cursor-pointer w-full"
          width="300"
        />
      </div>
    </div>
  </div>
</template>

<style>
.galleryImgWrapper {
  position: relative;
  overflow: hidden;
}
.galleryImgWrapper img {
  margin: 0;
  max-width: 100%;
  height: auto;
  -moz-transition: all 0.5s;
  -webkit-transition: all 0.5s;
  transition: all 0.5s;
}

.galleryImgWrapper:hover img {
  -moz-transform: scale(1.02);
  -webkit-transform: scale(1.02);
  transform: scale(1.02);
}
</style>
