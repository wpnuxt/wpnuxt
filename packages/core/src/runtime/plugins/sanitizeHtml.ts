import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  let sanitize: (html: string) => string

  if (import.meta.server) {
    // Server: pass through HTML as-is (content from trusted WordPress backend)
    sanitize = (html: string) => html
  } else {
    // Client: lazy-init DOMPurify with native browser window
    let purify: { sanitize: (html: string) => string } | null = null
    sanitize = (html: string) => {
      if (purify) {
        return purify.sanitize(html)
      }
      return html
    }
    // Initialize DOMPurify asynchronously, make available for synchronous use
    import('dompurify').then((DOMPurify) => {
      purify = DOMPurify.default(window)
    })
  }

  nuxtApp.vueApp.directive('sanitize-html', {
    created(el: Element, binding: { value: string }) {
      el.innerHTML = sanitize(binding.value)
    },
    updated(el: Element, binding: { value: string }) {
      el.innerHTML = sanitize(binding.value)
    },
    getSSRProps(binding: { value: string }) {
      return { innerHTML: sanitize(binding.value) }
    }
  })
})
