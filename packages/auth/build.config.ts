import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  externals: [
    'vue',
    '#imports'
  ],
  rollup: {
    emitCJS: false
  },
  declaration: true
})
