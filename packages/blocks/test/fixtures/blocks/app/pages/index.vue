<script setup lang="ts">
// Mock block data for testing various block types
const mockNode = {
  editorBlocks: [
    {
      __typename: 'CoreParagraph',
      name: 'core/paragraph',
      clientId: 'p1',
      parentClientId: null,
      attributes: {
        content: 'This is a test paragraph with <strong>bold</strong> text.',
        className: 'test-paragraph',
        anchor: 'test-anchor'
      }
    },
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h1',
      parentClientId: null,
      attributes: {
        content: 'Test Heading Level 2',
        level: 2,
        className: 'test-heading'
      }
    },
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h2',
      parentClientId: null,
      attributes: {
        content: 'Test Heading Level 3',
        level: 3
      }
    },
    {
      __typename: 'CoreImage',
      name: 'core/image',
      clientId: 'img1',
      parentClientId: null,
      attributes: {
        url: 'https://wordpress.wpnuxt.com/wp-content/uploads/test.jpg',
        alt: 'Test image alt text',
        width: 800,
        height: 600,
        className: 'test-image'
      }
    },
    {
      __typename: 'CoreButton',
      name: 'core/button',
      clientId: 'btn1',
      parentClientId: null,
      attributes: {
        text: 'Click Me',
        url: 'https://example.com',
        linkTarget: '_blank',
        rel: 'noopener'
      }
    },
    {
      __typename: 'CoreSpacer',
      name: 'core/spacer',
      clientId: 'spacer1',
      parentClientId: null,
      attributes: {
        spacerHeight: '50px'
      }
    },
    {
      __typename: 'CoreQuote',
      name: 'core/quote',
      clientId: 'quote1',
      parentClientId: null,
      attributes: {},
      innerBlocks: [
        {
          __typename: 'CoreParagraph',
          name: 'core/paragraph',
          clientId: 'quote-p1',
          parentClientId: null,
          attributes: {
            content: 'This is a quoted text.'
          }
        }
      ]
    },
    {
      __typename: 'CoreDetails',
      name: 'core/details',
      clientId: 'details1',
      parentClientId: null,
      attributes: {
        summary: 'Click to expand',
        showContent: false
      },
      innerBlocks: [
        {
          __typename: 'CoreParagraph',
          name: 'core/paragraph',
          clientId: 'details-p1',
          parentClientId: null,
          attributes: {
            content: 'Hidden content revealed!'
          }
        }
      ]
    }
  ]
}
</script>

<template>
  <div id="blocks-test">
    <h1>Block Rendering Tests</h1>
    <BlockRenderer :node="mockNode" />
  </div>
</template>
