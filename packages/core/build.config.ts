import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    // Main module entry
    { input: 'src/module' },
    // Additional exports for server/client options
    { input: 'src/server-options', name: 'server-options' },
    { input: 'src/client-options', name: 'client-options' }
  ],
  externals: [
    'vue',
    '#imports',
    'nuxt-graphql-middleware/server-options',
    'nuxt-graphql-middleware/client-options'
  ],
  rollup: {
    emitCJS: false
  },
  declaration: true
})
