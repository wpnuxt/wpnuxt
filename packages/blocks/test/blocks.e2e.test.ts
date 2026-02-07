import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('blocks e2e', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/blocks', import.meta.url))
  })

  describe('BlockRenderer', () => {
    it('renders the blocks test page', async () => {
      const html = await $fetch('/')
      expect(html).toContain('Block Rendering Tests')
      expect(html).toContain('id="blocks-test"')
    })

    it('renders CoreParagraph blocks', async () => {
      const html = await $fetch('/')
      // Check paragraph content is rendered
      expect(html).toContain('This is a test paragraph')
      expect(html).toContain('<strong>bold</strong>')
      // Check paragraph has anchor id
      expect(html).toContain('id="test-anchor"')
      // Check CSS class is applied
      expect(html).toContain('test-paragraph')
    })

    it('renders CoreHeading blocks with correct levels', async () => {
      const html = await $fetch('/')
      // Check h2 heading
      expect(html).toContain('<h2')
      expect(html).toContain('Test Heading Level 2')
      expect(html).toContain('test-heading')
      // Check h3 heading
      expect(html).toContain('<h3')
      expect(html).toContain('Test Heading Level 3')
    })

    it('renders CoreImage blocks', async () => {
      const html = await $fetch('/')
      // Check image is rendered (either as img or nuxt-img)
      expect(html).toContain('test.jpg')
      expect(html).toContain('Test image alt text')
    })

    it('renders CoreButton blocks', async () => {
      const html = await $fetch('/')
      expect(html).toContain('Click Me')
      expect(html).toContain('https://example.com')
      expect(html).toContain('_blank')
    })

    it('renders CoreSpacer blocks', async () => {
      const html = await $fetch('/')
      expect(html).toContain('50px')
    })

    it('renders CoreQuote blocks', async () => {
      const html = await $fetch('/')
      expect(html).toContain('<blockquote')
      expect(html).toContain('This is a quoted text.')
    })

    it('renders CoreDetails blocks', async () => {
      const html = await $fetch('/')
      expect(html).toContain('<details')
      expect(html).toContain('<summary')
      expect(html).toContain('Click to expand')
      expect(html).toContain('Hidden content revealed!')
    })
  })

  describe('edge cases', () => {
    it('renders the edge cases page', async () => {
      const html = await $fetch('/edge-cases')
      expect(html).toContain('Edge Cases Tests')
      expect(html).toContain('id="edge-cases-test"')
    })

    it('handles unknown block types with fallback', async () => {
      const html = await $fetch('/edge-cases')
      // Unknown blocks should render their fallback HTML
      expect(html).toContain('Fallback rendered HTML')
      expect(html).toContain('unknown-block')
    })

    it('handles empty paragraph content', async () => {
      const html = await $fetch('/edge-cases')
      // Empty paragraphs should still render as <p> tags
      expect(html).toContain('<p')
    })

    it('handles special characters in content', async () => {
      const html = await $fetch('/edge-cases')
      // Special characters should be properly handled
      expect(html).toContain('ampersand')
      expect(html).toContain('escaped')
    })

    it('renders all heading levels (h1-h6)', async () => {
      const html = await $fetch('/edge-cases')
      expect(html).toContain('<h1')
      expect(html).toContain('H1 Heading')
      expect(html).toContain('<h4')
      expect(html).toContain('H4 Heading')
      expect(html).toContain('<h5')
      expect(html).toContain('H5 Heading')
      expect(html).toContain('<h6')
      expect(html).toContain('H6 Heading')
    })
  })
})
