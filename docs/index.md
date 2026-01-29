---
navigation: false
seo:
  title: WPNuxt
  description: WordPress + Nuxt 4 via GraphQL - Type-safe composables for headless WordPress
---

::u-page-hero
---
orientation: vertical
---

#headline
  :::u-badge
  ---
  variant: soft
  color: warning
  icon: i-ph-flask
  size: md
  style: 'margin-bottom: 20px'
  ---
  2.0 Alpha - Nuxt 4
  :::

#title
<span class="font-serif">WP</span><span class="text-[var(--ui-primary)]">Nuxt</span><br><br>
Nuxt 4 <span class="text-[var(--ui-primary)]">+</span> <span class="font-serif">WordPress</span>

#description
Type-safe composables for fetching WordPress content via GraphQL.<br>Render Gutenberg blocks as Vue components.

#links
  :::u-button
  ---
  size: xl
  to: /getting-started
  trailing-icon: i-ph-rocket-launch-duotone
  ---
  Get started
  :::

  :::u-button
  ---
  color: neutral
  icon: i-ph-github-logo
  size: xl
  target: _blank
  to: https://github.com/wpnuxt/wpnuxt
  variant: outline
  ---
  View on GitHub
  :::
::


::u-page-section
---
class: text-center w-auto mx-auto max-w-2xl
---
  ::u-alert
  ---
  color: warning
  variant: subtle
  icon: i-ph-warning
  title: WPNuxt 2.0 is in alpha. The API may change before stable release.
  ---
  ::
::

::u-page-section
#title
WordPress as a headless CMS<br><span class="text-[var(--ui-primary)]">with a modern Nuxt frontend</span>

#features
  :::u-page-feature
  ---
  icon: i-ph-code
  ---
  #title
  Type-Safe GraphQL

  #description
  Auto-generated TypeScript types from your WordPress schema. Full IDE support.
  :::

  :::u-page-feature
  ---
  icon: i-ph-puzzle-piece
  ---
  #title
  Gutenberg Blocks

  #description
  Render WordPress blocks as Vue components. Customize each block type.
  :::

  :::u-page-feature
  ---
  icon: i-ph-lightning
  ---
  #title
  Server-Side Caching

  #description
  GraphQL responses cached on the server with stale-while-revalidate support.
  :::
::

::u-page-section
---
orientation: horizontal
---

```vue [pages/index.vue]
<script setup lang="ts">
const { data: posts } = await usePosts()
</script>

<template>
  <article v-for="post in posts" :key="post.id">
    <NuxtLink :to="post.uri">
      {{ post.title }}
    </NuxtLink>
    <div v-sanitize-html="post.excerpt" />
  </article>
</template>
```

#title
Simple Composables

#description
Fetch posts, pages, menus, and more with auto-generated composables:

#features
  :::u-page-feature
  ---
  icon: i-ph-arrow-right
  ---
  #title
  usePosts()
  :::

  :::u-page-feature
  ---
  icon: i-ph-arrow-right
  ---
  #title
  usePages()
  :::

  :::u-page-feature
  ---
  icon: i-ph-arrow-right
  ---
  #title
  useMenu({ name: "main" })
  :::

  :::u-page-feature
  ---
  icon: i-ph-arrow-right
  ---
  #title
  useGeneralSettings()
  :::

#links
  :::u-button
  ---
  color: neutral
  icon: i-ph-book-open
  size: xl
  to: /guide/fetching-data
  variant: outline
  ---
  View all composables
  :::
::

::u-page-section
#title
Packages

#features
  :::u-page-feature
  ---
  icon: i-ph-package
  ---
  #title
  @wpnuxt/core

  #description
  GraphQL integration, auto-generated composables, server-side caching.
  :::

  :::u-page-feature
  ---
  icon: i-ph-squares-four
  ---
  #title
  @wpnuxt/blocks

  #description
  Render Gutenberg blocks as Vue components with NuxtImg optimization.
  :::

  :::u-page-feature
  ---
  icon: i-ph-user-circle
  ---
  #title
  @wpnuxt/auth

  #description
  WordPress authentication with GraphQL support.
  :::

#links
  :::u-button
  ---
  color: neutral
  icon: i-ph-arrow-circle-up
  size: xl
  to: /migration/v1-to-v2
  variant: outline
  ---
  Migrate from v1
  :::
::
