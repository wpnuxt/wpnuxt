export default defineAppConfig({
  ui: {
    colors: {
      primary: 'reefgold',
      gray: 'neutral',
      neutral: 'neutral'
    },
    button: {
      slots: {
        base: 'cursor-pointer disabled:opacity-30 disabled:cursor-default'
      }
    },
    accordion: {
      slots: {
        item: 'px-3 bg-neutral-100 dark:bg-neutral-800 rounded-md cursor-pointer text-sm',
        body: 'pb-0 text-sm'
      }
    },
    pageHeader: {
      slots: {
        root: 'border-none pt-8 pb-4'
      }
    },
    pageCard: {
      slots: {
        root: 'relative',
        description: 'absolute -top-3 right-3 text-xs bg-white dark:bg-neutral-900 text-gray-400! dark:text-gray-500! px-2 py-0.5 rounded-md border border-gray-200 dark:border-gray-800'
      }
    }
  }
})
