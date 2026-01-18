<script setup lang="ts">
import type { PostFragment, PageFragment } from '#graphql-operations'

interface AdjacentPost {
  uri?: string | null
  title?: string | null
}

const props = defineProps<{
  post: PostFragment | PageFragment | undefined
  pending: boolean
  refreshContent: () => void
  composableName: string
  composableScript: string
  previousPost?: AdjacentPost | null
  nextPost?: AdjacentPost | null
}>()

const { hasServerApi } = useRenderingMode()

const items = computed(() => [
  {
    label: `Fetched ${props.post?.contentTypeName === 'post' ? 'post' : 'page'} content using ${props.composableName}('${props.post?.uri}')`,
    content: props.composableScript
  }
])
</script>

<template>
  <UPageHeader>
    <template #title>
      <template v-if="post?.title">
        {{ post.title }}
      </template>
      <div
        v-else
        class="grid mt-1"
      >
        <USkeleton class="h-9 w-[250px] opacity-30" />
      </div>
    </template>
    <template #description>
      <div v-if="!pending && post?.date">
        <NuxtTime
          :datetime="post.date"
          month="long"
          day="numeric"
          year="numeric"
          class="text-primary text-sm"
        />
        <UAccordion :items="items" class="mt-2">
          <template #body="{ item }">
            <pre>{{ item.content }}</pre>
          </template>
        </UAccordion>
      </div>
      <LoadingIcon v-else />
    </template>
    <template #links>
      <div class="flex items-center gap-2">
        <!-- Previous/Next Post Navigation -->
        <UButton
          :to="previousPost?.uri ?? undefined"
          :disabled="!previousPost?.uri"
          icon="i-lucide-chevron-left"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Previous
        </UButton>
        <!-- Refresh Button (only available when server API is accessible) -->
        <UTooltip
          v-if="hasServerApi"
          text="Refresh content from WordPress"
        >
          <UButton
            class="cursor-pointer"
            :loading="pending"
            icon="i-lucide-refresh-cw"
            size="sm"
            @click="refreshContent"
          />
        </UTooltip>
        <UButton
          :to="nextPost?.uri ?? undefined"
          :disabled="!nextPost?.uri"
          trailing-icon="i-lucide-chevron-right"
          color="neutral"
          variant="outline"
          size="sm"
        >
          Next
        </UButton>
      </div>
    </template>
  </UPageHeader>
</template>
