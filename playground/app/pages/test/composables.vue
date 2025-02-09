<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app'
import { usePosts, usePostByUri, useGeneralSettings } from '#wpnuxt'

const prefix = useRuntimeConfig().public.wpNuxt.generateComposables?.prefix

const { data: posts } = await usePosts()
const { data: postsLimited } = await usePosts({ limit: 1 })
const { data: postByUri } = await usePostByUri({ uri: 'hello-world' })
const { data: settings, error } = await useGeneralSettings()
</script>

<template>
  <NuxtLayout>
    <HeaderComponent />
    <UContainer class="prose dark:prose-invert pt-5">
      <h2>Examples how to use the generated composables</h2>
      <p>
        prefix for composables: {{ prefix }}
      </p>
      <h3>{{ prefix }}Posts()</h3>
      <ul>
        <li
          v-for="post in posts"
          :key="post.id"
        >
          {{ post.title }}
        </li>
      </ul>
      <h3>{{ prefix }}Posts({ limit: 1 })</h3>
      <ul>
        <li
          v-for="post in postsLimited"
          :key="post.id"
        >
          {{ post.title }}
        </li>
      </ul>
      <h3>{{ prefix }}PostByUri({ uri: 'hello-world' })</h3>
      <p>
        {{ postByUri?.title }}
      </p>
      <h3>{{ prefix }}GeneralSettings</h3>
      <ul>
        <li
          v-for="(value, key) in settings"
          :key="key"
        >
          <strong>{{ key }}:</strong> {{ value }}
        </li>
      </ul>
      The email field in GeneralSettings can't be fetched without authentication.<br>
      The other data (see above) is returned anyway, and an error is thrown about the mail field:<br>
      <pre>{{ error }}</pre>
    </UContainer>
  </NuxtLayout>
</template>
