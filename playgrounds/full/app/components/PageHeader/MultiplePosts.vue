<script setup lang="ts">
import type { PostFragment } from '#graphql-operations'

const props = defineProps<{
  posts: PostFragment[]
  pending: boolean
  refreshContent: () => void
  composableName: string
  composableScript: string
}>()

const items = computed(() => [
  {
    label: `Fetched ${props.posts?.length} posts using ${props.composableName}()`,
    content: props.composableScript
  }
])
</script>

<template>
  <UPageHeader title="Posts">
    <template #description>
      <template v-if="!pending && posts?.length">
        <UAccordion :items="items">
          <template #body="{ item }">
            <pre>{{ item.content }}</pre>
          </template>
        </UAccordion>
      </template>
      <LoadingIcon v-else />
    </template>
    <template #links>
      <UButton
        class="cursor-pointer"
        :loading="pending"
        icon="i-lucide-refresh-cw"
        size="sm"
        @click="refreshContent"
      />
    </template>
  </UPageHeader>
</template>
