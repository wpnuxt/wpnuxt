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
      <ProseH2>Examples how to use the generated composables</ProseH2>
      <ProseP>
        prefix for composables: {{ prefix }}
      </ProseP>
      <ProseH3>{{ prefix }}Posts()</ProseH3>
      <ProseUl>
        <ProseLi
          v-for="post in posts"
          :key="post.id"
        >
          {{ post.title }}
        </ProseLi>
      </ProseUl>
      <ProseH3>{{ prefix }}Posts({ limit: 1 })</ProseH3>
      <ProseUl>
        <ProseLi
          v-for="post in postsLimited"
          :key="post.id"
        >
          {{ post.title }}
        </ProseLi>
      </ProseUl>
      <ProseH3>{{ prefix }}PostByUri({ uri: 'hello-world' })</ProseH3>
      <ProseP>
        {{ postByUri?.title }}
      </ProseP>
      <ProseH3>{{ prefix }}GeneralSettings</ProseH3>
      <ProseUl>
        <ProseLi
          v-for="(value, key) in settings"
          :key="key"
        >
          <strong>{{ key }}:</strong> {{ value }}
        </ProseLi>
      </ProseUl>
      The email field in GeneralSettings can't be fetched without authentication.<br>
      The other data (see above) is returned anyway, and an error is thrown about the mail field:<br>
      <ProsePre>{{ error }}</ProsePre>
    </UContainer>
  </NuxtLayout>
</template>
