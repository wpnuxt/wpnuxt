import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    'vue',
    '#imports',
    '#wpnuxt/blocks'
  ],
  rollup: {
    emitCJS: false
  },
  declaration: true
})
