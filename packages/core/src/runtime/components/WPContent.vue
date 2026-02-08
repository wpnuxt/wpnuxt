<script setup lang="ts">
import { isInternalLink, toRelativePath } from '../util/links'
import { ref, resolveComponent, onMounted, onBeforeUnmount, useRuntimeConfig, navigateTo } from '#imports'

const props = withDefaults(defineProps<{
  /** The content node to render (with optional editorBlocks and content) */
  node?: { editorBlocks?: unknown[], content?: string | null, [key: string]: unknown }
  /** Set to `false` to disable internal link interception for this instance */
  replaceLinks?: boolean
}>(), {
  node: undefined,
  replaceLinks: undefined
})

const containerRef = ref<HTMLElement | null>(null)

// Detect BlockRenderer at runtime (available when @wpnuxt/blocks is installed)
const blockRenderer = resolveComponent('BlockRenderer')
const hasBlockRenderer = typeof blockRenderer !== 'string'

function shouldReplaceLinks(): boolean {
  if (props.replaceLinks !== undefined) {
    return props.replaceLinks
  }
  const config = useRuntimeConfig()
  return (config.public.wpNuxt as Record<string, unknown>)?.replaceLinks !== false
}

function onClick(event: MouseEvent) {
  if (!shouldReplaceLinks()) return

  // Skip if modifier keys are held (user wants new tab / special behavior)
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

  // Find the closest <a> element from the click target
  const anchor = (event.target as HTMLElement)?.closest?.('a')
  if (!anchor) return

  const href = anchor.getAttribute('href')
  if (!href) return

  // Skip links that explicitly opt out of client-side navigation
  if (anchor.getAttribute('target') === '_blank') return
  if (anchor.hasAttribute('download')) return
  if (anchor.getAttribute('rel')?.includes('external')) return

  // Skip non-http protocols
  const trimmed = href.trim()
  if (/^(?:mailto|tel|javascript|ftp):/i.test(trimmed)) return

  const config = useRuntimeConfig()
  const wordpressUrl = (config.public.wpNuxt as Record<string, unknown>)?.wordpressUrl as string

  if (isInternalLink(href, wordpressUrl)) {
    event.preventDefault()
    navigateTo(toRelativePath(href))
  }
}

onMounted(() => {
  containerRef.value?.addEventListener('click', onClick)
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener('click', onClick)
})
</script>

<template>
  <div ref="containerRef">
    <template v-if="node">
      <component
        :is="blockRenderer"
        v-if="hasBlockRenderer && node.editorBlocks?.length"
        :node="node"
      />
      <div
        v-else-if="node.content"
        v-sanitize-html="node.content"
      />
    </template>
    <slot v-else />
  </div>
</template>
