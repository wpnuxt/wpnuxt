<script setup lang="ts">
const route = useRoute()
const slug = computed(() => route.params.slug as string)

const { data: event, pending } = await useEventBySlug({ slug: slug.value })

// Demo: isContentType type guard
const isEvent = computed(() => isContentType(event.value, 'event'))

// Demo: unwrapScalar for ACF select field
const status = computed(() => unwrapScalar(event.value?.eventDetails?.eventStatus) ?? 'upcoming')
</script>

<template>
  <UContainer>
    <UPage>
      <div
        v-if="pending"
        class="py-8 text-center text-muted"
      >
        Loading event...
      </div>

      <template v-else-if="event && isEvent">
        <UPageHeader
          :title="event.title ?? 'Event'"
          :description="event.excerpt?.replace(/<[^>]*>/g, '') ?? undefined"
        >
          <template #right>
            <UBadge
              :color="status === 'cancelled' ? 'error' : status === 'soldout' ? 'warning' : 'success'"
              :label="status"
            />
          </template>
        </UPageHeader>

        <UPageBody>
          <div class="grid gap-8 lg:grid-cols-3">
            <!-- Content -->
            <div class="lg:col-span-2">
              <WPContent
                :node="event"
                class="prose prose-lg dark:prose-invert max-w-none"
              />
            </div>

            <!-- Sidebar with event details -->
            <div class="space-y-4">
              <div
                v-if="event.eventDetails"
                class="p-4 border rounded-lg space-y-3"
              >
                <h3 class="font-semibold">
                  Event Details
                </h3>

                <div
                  v-if="event.eventDetails.eventStartDatetime"
                  class="text-sm"
                >
                  <div class="text-muted">
                    Date & Time
                  </div>
                  <div>{{ event.eventDetails.eventStartDatetime }}</div>
                  <div v-if="event.eventDetails.eventEndDatetime">
                    until {{ event.eventDetails.eventEndDatetime }}
                  </div>
                </div>

                <div
                  v-if="event.eventDetails.eventLocation"
                  class="text-sm"
                >
                  <div class="text-muted">
                    Location
                  </div>
                  <div>{{ event.eventDetails.eventLocation }}</div>
                </div>

                <div class="text-sm">
                  <div class="text-muted">
                    Price
                  </div>
                  <div>{{ event.eventDetails.eventIsFree ? 'Free' : (event.eventDetails.eventTicketPrice || 'TBA') }}</div>
                </div>
              </div>

              <div
                v-if="event.eventCategories?.nodes?.length"
                class="p-4 border rounded-lg space-y-2"
              >
                <h3 class="font-semibold">
                  Categories
                </h3>
                <div class="flex flex-wrap gap-1">
                  <UBadge
                    v-for="cat in event.eventCategories.nodes"
                    :key="cat.slug"
                    :label="cat.name"
                    variant="subtle"
                    size="xs"
                  />
                </div>
              </div>

              <UButton
                label="← Back to Events"
                to="/events"
                variant="outline"
                block
              />
            </div>
          </div>
        </UPageBody>
      </template>

      <div
        v-else
        class="py-8 text-center text-muted"
      >
        Event not found.
      </div>
    </UPage>
  </UContainer>
</template>
