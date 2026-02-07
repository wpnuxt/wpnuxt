<script setup lang="ts">
import VueJsonPretty from 'vue-json-pretty'

useHead({
  title: 'Composables Showcase'
})

const isLoading = ref(false)
const loadedData = ref<string>('posts')
const data = ref({})

async function fetchPosts() {
  start('posts')
  const { data: postsData } = await usePosts()
  data.value = computed(() => postsData).value
  isReady()
}

async function fetchPost() {
  start('post')
  const { data: postData } = await usePostByUri({ uri: 'hello-world' })
  data.value = computed(() => postData).value
  isReady()
}

async function fetchPages() {
  start('pages')
  const { data: pagesData } = await usePages()
  data.value = computed(() => pagesData).value
  isReady()
}

async function fetchSettings() {
  start('settings')
  const { data: settings } = await useGeneralSettings()
  data.value = computed(() => settings).value
  isReady()
}

async function fetchWordpressUrl() {
  start('wordpressUrl')
  const config = useRuntimeConfig()
  data.value = { url: config.public.wpNuxt?.wordpressUrl }
  isReady()
}

async function fetchMenu() {
  start('menu')
  const { data: menuData } = await useMenu({ slug: 'main-menu' })
  data.value = computed(() => menuData).value
  isReady()
}

function start(key: string) {
  isLoading.value = true
  loadedData.value = key
}

function isReady() {
  setTimeout(() => {
    isLoading.value = false
  }, 200)
}

onMounted(() => {
  fetchPosts()
})
</script>

<template>
  <UContainer>
    <UPage>
      <UPageHeader title="Composables Showcase" />
      <UPageBody class="prose dark:prose-invert mt-10">
        <p>
          This page demonstrates the auto-generated composables from WPNuxt.
          Check the
          <a
            href="https://wpnuxt.com/docs/composables"
            target="_blank"
          >
            WPNuxt documentation
          </a>
          for a full list of available composables.
        </p>

        <h3>Click to run each composable:</h3>

        <ComposableExample
          code="const { data: posts } = await usePosts()"
          :trigger="fetchPosts"
        />
        <ComposableExample
          code="const { data: post } = await usePostByUri({ uri: 'hello-world' })"
          :trigger="fetchPost"
        />
        <ComposableExample
          code="const { data: pages } = await usePages()"
          :trigger="fetchPages"
        />
        <ComposableExample
          code="const { data: settings } = await useGeneralSettings()"
          :trigger="fetchSettings"
        />
        <ComposableExample
          code="const { data: menu } = await useMenu({ slug: 'main-menu' })"
          :trigger="fetchMenu"
        />
        <ComposableExample
          code="const config = useRuntimeConfig()"
          :trigger="fetchWordpressUrl"
        />

        <h2 class="mt-10">
          {{ loadedData }}:
        </h2>
        <pre class="mt-0 py-0 min-h-[500px]">
          <code class="flex justify-start py-0">
            <UIcon
              v-if="isLoading"
              name="i-svg-spinners-bars-fade"
              class="mt-[18px] opacity-30"
            />
            <vue-json-pretty
              v-else
              path="res"
              :data
            />
          </code>
        </pre>
      </UPageBody>
    </UPage>
  </UContainer>
</template>
