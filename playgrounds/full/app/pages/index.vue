<script setup lang="ts">
const orderField = ref('DATE')
const order = ref<'ASC' | 'DESC'>('DESC')

const { data: posts, pending, refresh, clear } = await usePosts(() => ({
  orderField: orderField.value,
  order: order.value
}))

// `useSponsors` is auto-generated — no fragment or query file was written
// by hand. Registering the Sponsor CPT on the WordPress backend is enough
// for WPNuxt to emit this composable from the downloaded schema.
const { data: sponsors } = await useSponsors({ first: 8 })
</script>

<template>
  <UContainer>
    <UPage>
      <PageHeaderMultiplePosts
        :posts="posts || []"
        :pending="pending"
        :refresh-content="() => { clear(); refresh(); }"
        composable-name="usePosts"
        composable-script="const { data: posts, pending, refresh, clear } = await usePosts(() => ({ orderField: orderField.value, order: order.value }))"
      />
      <UPageBody>
        <OrderOptions v-model:order-field="orderField" v-model:order="order" />
        <UBlogPosts>
          <UBlogPost
            v-for="post in posts"
            :key="post.id"
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

        <section v-if="sponsors?.length" class="mt-16">
          <div class="mb-6">
            <h2 class="text-xl font-semibold">
              Sponsors
            </h2>
            <p class="text-sm text-muted mt-1">
              Companies and studios backing the WPNuxt project. Auto-generated via the Sponsor CPT — no hand-written queries.
            </p>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="sponsor in sponsors"
              :key="sponsor.id"
              class="rounded-lg border border-default overflow-hidden"
            >
              <NuxtImg
                v-if="sponsor.featuredImage?.node?.relativePath"
                :src="sponsor.featuredImage.node.relativePath"
                :alt="sponsor.title ?? ''"
                class="w-full aspect-video object-cover"
                width="400"
                height="225"
              />
              <div class="p-4">
                <h3 class="font-medium">
                  {{ sponsor.title }}
                </h3>
                <div
                  v-if="sponsor.excerpt"
                  v-sanitize-html="sponsor.excerpt"
                  class="text-sm text-muted mt-2"
                />
              </div>
            </div>
          </div>
        </section>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
