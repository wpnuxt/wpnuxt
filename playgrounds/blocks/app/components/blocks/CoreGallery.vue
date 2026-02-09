<script setup lang="ts">
import type { CoreGallery, CoreImage } from '#wpnuxt/blocks'

const props = defineProps<{
  block: CoreGallery
}>()

const images = computed(() =>
  props.block.innerBlocks
    ?.filter((inner): inner is CoreImage => inner?.name === 'core/image' && !!inner.attributes?.url)
    .map(inner => ({
      src: inner.attributes!.url!,
      alt: inner.attributes?.alt ?? ''
    })) ?? []
)

const lightboxVisible = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxVisible.value = true
}
</script>

<template>
  <div class="not-prose my-6">
    <div class="columns-3 md:columns-4 gap-2">
      <NuxtImg
        v-for="(img, i) in images"
        :key="i"
        :src="img.src"
        :alt="img.alt"
        loading="lazy"
        class="block mb-2 w-full break-inside-avoid rounded-lg cursor-pointer transition-transform duration-300 hover:scale-105"
        @click="openLightbox(i)"
      />
    </div>

    <ClientOnly>
      <VueEasyLightbox
        :visible="lightboxVisible"
        :imgs="images.map(img => ({ src: img.src, title: img.alt }))"
        :index="lightboxIndex"
        @hide="lightboxVisible = false"
      />
    </ClientOnly>
  </div>
</template>
