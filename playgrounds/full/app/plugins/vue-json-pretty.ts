import VueJsonPretty from 'vue-json-pretty'

export default defineNuxtPlugin({
  name: 'vue-json-pretty',
  setup(nuxtApp) {
    nuxtApp.vueApp.component('vue-json-pretty', VueJsonPretty)
  }
})
