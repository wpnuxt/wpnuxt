<script setup lang="ts">
// --- Page-based pagination ---
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

function resetPages() {
  after.value = undefined
  before.value = undefined
}

function changePageSize(size: number) {
  pageSize.value = size
  resetPages()
}

// --- Infinite scroll (loadMore) ---
const {
  data: allPosts,
  pageInfo: loadMorePageInfo,
  loadMore,
  pending: loadMorePending,
  refresh: loadMoreRefresh
} = await usePaginatedPosts({ first: 3 }, { clientCache: false })
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Pagination Demo"
        description="Two pagination modes: page-based navigation and infinite scroll with loadMore"
      />
      <UPageBody>
        <div class="grid gap-12 lg:grid-cols-2">
          <!-- Page-based -->
          <div class="space-y-6">
            <h2 class="text-lg font-semibold">
              Page-based
            </h2>

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
            </div>

            <div v-if="pending" class="py-8 text-center text-muted">
              Loading...
            </div>

            <ul v-else-if="posts?.length" class="space-y-2">
              <li
                v-for="post in posts"
                :key="post.databaseId"
                class="p-3 border rounded"
              >
                <strong>{{ post.title }}</strong>
                <span class="text-sm text-muted ml-2">{{ post.date }}</span>
              </li>
            </ul>

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
                @click="resetPages"
              />
              <UButton
                label="Refresh"
                variant="ghost"
                icon="i-lucide-refresh-cw"
                @click="refresh()"
              />
            </div>
          </div>

          <!-- Infinite scroll -->
          <div class="space-y-6">
            <h2 class="text-lg font-semibold">
              Infinite scroll (loadMore)
            </h2>

            <div class="text-sm text-muted">
              {{ allPosts?.length ?? 0 }} posts loaded
              <template v-if="loadMorePageInfo">
                · hasNext: {{ loadMorePageInfo.hasNextPage }}
              </template>
            </div>

            <ul v-if="allPosts?.length" class="space-y-2">
              <li
                v-for="post in allPosts"
                :key="post.databaseId"
                class="p-3 border rounded"
              >
                <strong>{{ post.title }}</strong>
                <span class="text-sm text-muted ml-2">{{ post.date }}</span>
              </li>
            </ul>

            <div class="flex gap-2">
              <UButton
                v-if="loadMorePageInfo?.hasNextPage"
                label="Load more"
                :loading="loadMorePending"
                @click="loadMore"
              />
              <UButton
                label="Reset"
                variant="ghost"
                icon="i-lucide-refresh-cw"
                @click="loadMoreRefresh()"
              />
            </div>
          </div>
        </div>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
