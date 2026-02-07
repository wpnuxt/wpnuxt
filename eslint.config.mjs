// @ts-check
import { createConfigForNuxt } from '@nuxt/eslint-config/flat'

// Run `npx @eslint/config-inspector` to inspect the resolved config interactively
export default createConfigForNuxt({
  features: {
    // Rules for module authors
    tooling: true,
    // Rules for formatting
    stylistic: {
      commaDangle: 'never',
      braceStyle: '1tbs'
    }
  },
  dirs: {
    src: [
      './playground',
      './src'
    ]
  }
},
{
  rules: {
    'vue/multi-word-component-names': 0,
    'vue/max-attributes-per-line': ['error', {
      singleline: { max: 2 },
      multiline: { max: 1 }
    }]
  },
  ignores: [
    'wordpress',
    'dist',
    'node_modules',
    '.output',
    '.nuxt'
  ]
})
  .append(
    // your custom flat config here...
  )
