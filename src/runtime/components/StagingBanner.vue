<script setup lang="ts">
import { OperationTypeNode } from 'graphql'
import WPNuxtLogo from './WPNuxtLogo.vue'
import WordPressLogo from './WordPressLogo.vue'
import { useRuntimeConfig, useHead, useRoute, useWPContent, useWPUri } from '#imports'

const config = useRuntimeConfig()
const frontendUrl = config.public.wpNuxt.frontendUrl
const wordpressUrl = config.public.wpNuxt.wordpressUrl
const wpUri = useWPUri()
useHead({
  title: 'Staging',
  link: [
    {
      type: 'stylesheet',
      href: wordpressUrl + '/wp-admin/load-styles.php?c=0&dir=ltr&load%5Bchunk_0%5D=dashicons,admin-bar,site-health,common,forms,admin-menu,dashboard,list-tables,edit,revisions,media,themes,about,nav-menus,wp-poi&load%5Bchunk_1%5D=nter,widgets,site-icon,l10n,buttons,wp-auth-check&ver=6.4.3'
    }
  ]
})

const route = useRoute()
let uri = route.path === '/' ? 'home' : route.path
if (uri.startsWith('/')) {
  uri = uri.substring(1)
}
if (uri.endsWith('/')) {
  uri = uri.substring(0, uri.length - 1)
}
interface NodeData {
  databaseId?: number
  contentTypeName?: string
}

const { data: post } = await useWPContent(OperationTypeNode.QUERY, 'NodeByUri', ['nodeByUri'], false, { uri: uri }) as { data: NodeData }

if (import.meta.client) {
  document.body.style.marginBottom = '40px'
}
</script>

<template>
  <div id="wpNuxtStagingBar">
    <div class="bar-container">
      <div class="bar-left">
        <WPNuxtLogo wp-color="white" />
        <div class="bar-button-wrapper">
          <a
            :href="wpUri.admin"
            class="bar-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WordPressLogo /> Admin
          </a>
        </div>
        <div
          v-if="post"
          class="bar-button-wrapper"
        >
          <a
            :href="wpUri.postEdit('' + post.databaseId)"
            class="bar-button primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="m16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8l.8-2.685a4.5 4.5 0 0 1 1.13-1.897zm0 0L19.5 7.125"
              />
            </svg>
            Edit <span class="hidden sm:inline-flex">{{ post.contentTypeName }}</span>
          </a>
        </div>
      </div>
      <div class="bar-right">
        <div class="bar-button-wrapper">
          <a
            v-if="frontendUrl"
            :href="frontendUrl"
            class="bar-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            Live site
            <svg
              class="icon"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                fill="black"
                d="M18 10.82a1 1 0 0 0-1 1V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h7.18a1 1 0 0 0 0-2H5a3 3 0 0 0-3 3v11a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-7.18a1 1 0 0 0-1-1m3.92-8.2a1 1 0 0 0-.54-.54A1 1 0 0 0 21 2h-6a1 1 0 0 0 0 2h3.59L8.29 14.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0L20 5.41V9a1 1 0 0 0 2 0V3a1 1 0 0 0-.08-.38"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#wpNuxtStagingBar {
  background-color: rgba(23, 23, 23, 1);
  width: 100%;
  height: 40px;
  --tw-shadow: 0 -1px 10px -3px rgb(0,0,0,0.3);
  --tw-shadow-colored: 0 -1px 10px -3px var(--tw-shadow-color);
  box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
  position: fixed;
  left: 0px;
  right: 0px;
  bottom: 0px;
  z-index: 9999;
}
#wpNuxtStagingBar .bar-container {
  padding: 7px;
  margin-left: auto;
  margin-right: auto;
  max-width: 80rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
#wpNuxtStagingBar .bar-left {
  vertical-align: top;
  text-align: left;
  overflow: hidden;
  display: flex;
  flex-grow: 1;
}
#wpNuxtStagingBar .bar-right {
  vertical-align: top;
  text-align: right;
  overflow: hidden;
  display: flex;
  flex-grow: 1;
  flex: none;
  justify-content: flex-end;
}
.wpnuxt-logo {
  margin-right: 1.5rem;
}
.wordpress-logo {
  width: 1rem;
  height: 1rem;
}
.bar-button {
  --tw-ring-color: #ccc;
  --tw-ring-inset: inset;
  --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color);
  --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
  box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
  --tw-text-opacity: 1;
  color: black;
  background-color: #eee;
  font-weight: 500;
  font-size: 0.75rem;
  line-height: 1rem;
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  border-radius: 0.375rem;
  column-gap: 0.25rem;
  align-items: center;
  flex-shrink: 0;
  display: inline-flex;
  margin-right: 0.5rem;
  stroke: black;
  text-decoration: none;
}
.bar-button:hover {
  --tw-ring-color: #999;
  background-color: #aaa;
  text-decoration: none;
}
.bar-button.primary {
  --tw-ring-color: #999;
  background-color: rgb(186 175 78 / var(--tw-text-opacity));
}
.bar-button.primary:hover {
  color: white;
  stroke: white;
  --tw-ring-color: #666;
  background-color: rgb(156 142 27 / var(--tw-text-opacity));
  text-decoration: none;
}
.bar-button-wrapper {
  margin-top: 0.25rem;
  vertical-align: top;
  display: inline-block;
}
.icon {
  display: inline-block;
  width: 1em;
  height: 1em;
  background-color: transparent;
}
</style>
