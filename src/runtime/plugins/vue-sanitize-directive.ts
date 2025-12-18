import { defineNuxtPlugin } from 'nuxt/app'
// @ts-expect-error - vue-sanitize-directive doesn't have type declarations
import VueSanitize from 'vue-sanitize-directive'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueSanitize)
})
