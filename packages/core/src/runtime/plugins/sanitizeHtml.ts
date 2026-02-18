import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    // Server: pass through HTML as-is (content from trusted WordPress backend)
    nuxtApp.vueApp.directive('sanitize-html', {
      getSSRProps(binding: { value: string }) {
        return { innerHTML: binding.value }
      }
    })
    return
  }

  // Client: load DOMPurify and sanitize HTML before setting innerHTML.
  // Until DOMPurify is ready, the SSR-rendered HTML stays in the DOM
  // untouched — we do NOT replace it with unsanitized content.
  let purify: { sanitize: (html: string) => string } | null = null

  const purifyReady = import('dompurify').then((DOMPurify) => {
    purify = DOMPurify.default(window)
  })

  function setSanitizedHtml(el: Element, html: string) {
    if (purify) {
      el.innerHTML = purify.sanitize(html)
    } else {
      // DOMPurify not loaded yet — keep SSR HTML intact, sanitize once ready
      purifyReady.then(() => {
        el.innerHTML = purify!.sanitize(html)
      })
    }
  }

  nuxtApp.vueApp.directive('sanitize-html', {
    created(el: Element, binding: { value: string }) {
      setSanitizedHtml(el, binding.value)
    },
    updated(el: Element, binding: { value: string }) {
      setSanitizedHtml(el, binding.value)
    },
    getSSRProps(binding: { value: string }) {
      return { innerHTML: binding.value }
    }
  })
})
