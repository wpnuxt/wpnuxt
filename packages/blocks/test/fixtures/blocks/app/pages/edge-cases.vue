<script setup lang="ts">
// Test edge cases: unknown block types, null blocks, empty content
const mockNode = {
  editorBlocks: [
    // Unknown block type should fall back to EditorBlock
    {
      __typename: 'UnknownBlockType',
      name: 'custom/unknown-block',
      clientId: 'unknown1',
      parentClientId: null,
      renderedHtml: '<div class="unknown-block">Fallback rendered HTML</div>'
    },
    // Null block should be skipped
    null,
    // Block with empty content
    {
      __typename: 'CoreParagraph',
      name: 'core/paragraph',
      clientId: 'empty1',
      parentClientId: null,
      attributes: {
        content: ''
      }
    },
    // Block with special characters that need sanitization
    {
      __typename: 'CoreParagraph',
      name: 'core/paragraph',
      clientId: 'special1',
      parentClientId: null,
      attributes: {
        content: 'Text with &amp; ampersand and &lt;escaped&gt; tags'
      }
    },
    // Heading with all levels
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h1-test',
      parentClientId: null,
      attributes: { content: 'H1 Heading', level: 1 }
    },
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h4-test',
      parentClientId: null,
      attributes: { content: 'H4 Heading', level: 4 }
    },
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h5-test',
      parentClientId: null,
      attributes: { content: 'H5 Heading', level: 5 }
    },
    {
      __typename: 'CoreHeading',
      name: 'core/heading',
      clientId: 'h6-test',
      parentClientId: null,
      attributes: { content: 'H6 Heading', level: 6 }
    }
  ]
}
</script>

<template>
  <div id="edge-cases-test">
    <h1>Edge Cases Tests</h1>
    <BlockRenderer :node="mockNode" />
  </div>
</template>
