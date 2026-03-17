<script setup lang="ts">
// Pagination mode toggle
const paginationMode = ref<'loadmore' | 'pages'>('loadmore')

// Reactive filter state
const categoryFilter = ref<string>()

// Fetch event categories for filter dropdown
const { data: categories } = await useEventCategories() as { data: Ref<Array<{ databaseId: string | number, name?: string, slug?: string, count?: number }> | undefined> }

// Page-based cursor state
const after = ref<string>()
const before = ref<string>()

// Reactive params — auto-refetches when filter or cursor changes
const params = computed(() => {
  const where = categoryFilter.value
    ? { eventCategorySlug: categoryFilter.value }
    : undefined

  if (paginationMode.value === 'pages' && before.value) {
    return { last: 3, before: before.value, where }
  }
  return {
    first: 3,
    after: paginationMode.value === 'pages' ? after.value : undefined,
    where
  }
})

const {
  data: events,
  pageInfo,
  loadMore,
  pending,
  refresh
} = await useEvents(params, { clientCache: false })

// Reset pagination when filter or mode changes
watch(categoryFilter, () => {
  after.value = undefined
  before.value = undefined
})

watch(paginationMode, () => {
  after.value = undefined
  before.value = undefined
  refresh()
})

// Page-based navigation
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

// Demo: unwrapScalar for ACF select field (WPGraphQL types selects as nullable arrays)
function getStatus(event: { eventDetails?: { eventStatus?: (string | null)[] } }) {
  return unwrapScalar(event.eventDetails?.eventStatus) ?? 'upcoming'
}
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader
        title="Events"
        description="Custom post type with reactive filtering, pagination, and ACF fields"
      />
      <UPageBody>
        <div class="space-y-6">
          <!-- Controls -->
          <div class="flex flex-wrap items-center gap-4">
            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">Category:</span>
              <UButton
                label="All"
                :variant="!categoryFilter ? 'solid' : 'outline'"
                size="xs"
                @click="categoryFilter = undefined"
              />
              <UButton
                v-for="cat in categories"
                :key="cat.slug"
                :label="`${cat.name} (${cat.count})`"
                :variant="categoryFilter === cat.slug ? 'solid' : 'outline'"
                size="xs"
                @click="categoryFilter = cat.slug"
              />
            </div>

            <div class="flex items-center gap-2">
              <span class="text-sm text-muted">Pagination:</span>
              <UButton
                label="Load more"
                :variant="paginationMode === 'loadmore' ? 'solid' : 'outline'"
                size="xs"
                @click="paginationMode = 'loadmore'"
              />
              <UButton
                label="Pages"
                :variant="paginationMode === 'pages' ? 'solid' : 'outline'"
                size="xs"
                @click="paginationMode = 'pages'"
              />
            </div>
          </div>

          <!-- Status info -->
          <div class="text-sm text-muted">
            {{ events?.length ?? 0 }} events
            <template v-if="pageInfo">
              · hasPrev: {{ pageInfo.hasPreviousPage }} · hasNext: {{ pageInfo.hasNextPage }}
            </template>
            <template v-if="pending">
              · loading...
            </template>
          </div>

          <!-- Events list -->
          <div
            v-if="!pending && events?.length"
            class="grid gap-4 md:grid-cols-2"
          >
            <div
              v-for="event in events"
              :key="event.databaseId"
              class="p-4 border rounded-lg space-y-2"
            >
              <div class="flex items-start justify-between gap-2">
                <NuxtLink
                  :to="`/events/${event.slug}`"
                  class="font-semibold hover:underline"
                >
                  {{ event.title }}
                </NuxtLink>
                <UBadge
                  :color="getStatus(event) === 'cancelled' ? 'error' : getStatus(event) === 'soldout' ? 'warning' : 'success'"
                  :label="getStatus(event)"
                  size="xs"
                />
              </div>

              <div class="text-sm text-muted space-y-1">
                <div v-if="event.eventDetails?.eventStartDatetime">
                  {{ event.eventDetails.eventStartDatetime }}
                </div>
                <div v-if="event.eventDetails?.eventLocation">
                  {{ event.eventDetails.eventLocation }}
                </div>
                <div v-if="event.eventDetails?.eventTicketPrice">
                  {{ event.eventDetails.eventIsFree ? 'Free' : event.eventDetails.eventTicketPrice }}
                </div>
              </div>

              <div
                v-if="event.eventCategories?.nodes?.length"
                class="flex gap-1"
              >
                <UBadge
                  v-for="cat in event.eventCategories.nodes"
                  :key="cat.slug"
                  :label="cat.name"
                  variant="subtle"
                  size="xs"
                />
              </div>
            </div>
          </div>

          <div
            v-else-if="pending"
            class="py-8 text-center text-muted"
          >
            Loading events...
          </div>

          <div
            v-else
            class="py-8 text-center text-muted"
          >
            No events found.
          </div>

          <!-- Pagination controls -->
          <div class="flex gap-2">
            <template v-if="paginationMode === 'loadmore'">
              <UButton
                v-if="pageInfo?.hasNextPage"
                label="Load more events"
                :loading="pending"
                @click="loadMore"
              />
            </template>
            <template v-else>
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
            </template>
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
