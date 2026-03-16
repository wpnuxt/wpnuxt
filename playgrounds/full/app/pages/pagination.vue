<script setup lang="ts">
const pageSize = ref(3)
const after = ref<string>()
const before = ref<string>()

const params = computed(() => {
  if (before.value) {
    return { last: pageSize.value, before: before.value }
  }
  return { first: pageSize.value, after: after.value }
})

const { data: posts, pageInfo, pending, refresh } = await usePaginatedPosts(params, { clientCache: false })

function nextPage() {
  if (pageInfo.value?.hasNextPage && pageInfo.value.endCursor) {
    before.value = undefined
    after.value = pageInfo.value.endCursor
  }
}

function previousPage() {
  if (pageInfo.value?.hasPreviousPage && pageInfo.value.startCursor) {
    after.value = undefined
    before.value = pageInfo.value.startCursor
  }
}

function reset() {
  after.value = undefined
  before.value = undefined
}

function changePageSize(size: number) {
  pageSize.value = size
  reset()
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Pagination Demo"
        description="Cursor-based pagination using reactive params and pageInfo"
      />
      <UPageBody>
        <div class="space-y-6">
          <div class="flex items-center gap-2 text-sm">
            <span class="text-muted">Page size:</span>
            <UButton
              v-for="size in [2, 3, 4]"
              :key="size"
              :label="String(size)"
              :variant="pageSize === size ? 'solid' : 'outline'"
              size="xs"
              @click="changePageSize(size)"
            />
          </div>

          <div class="text-sm text-muted">
            {{ posts?.length ?? 0 }} posts
            <template v-if="pageInfo">
              · hasPrev: {{ pageInfo.hasPreviousPage }} · hasNext: {{ pageInfo.hasNextPage }}
            </template>
            <template v-if="pending">
              · loading...
            </template>
          </div>

          <div v-if="pending" class="py-8 text-center text-muted">
            Loading...
          </div>

          <UBlogPosts v-else-if="posts?.length">
            <UBlogPost
              v-for="post in posts"
              :key="post.databaseId"
              :title="post.title ?? undefined"
              :to="post.uri"
              :date="post.date ?? undefined"
              :image="post.featuredImage?.node?.relativePath ?? ''"
              variant="outline"
            >
              <template #description>
                <div v-sanitize-html="post.excerpt" />
              </template>
            </UBlogPost>
          </UBlogPosts>

          <div class="flex gap-2">
            <UButton
              v-if="pageInfo?.hasPreviousPage"
              label="← Previous"
              variant="outline"
              :disabled="pending"
              @click="previousPage"
            />
            <UButton
              v-if="pageInfo?.hasNextPage"
              label="Next →"
              :disabled="pending"
              @click="nextPage"
            />
            <UButton
              v-if="after || before"
              label="Reset"
              variant="ghost"
              @click="reset"
            />
            <UButton
              label="Refresh"
              variant="ghost"
              icon="i-lucide-refresh-cw"
              @click="refresh()"
            />
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
