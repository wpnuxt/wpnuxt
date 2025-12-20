<template>
  <div class="mcp-status">
    <h1>WPNuxt MCP Server</h1>
    <p>This is a remote MCP server for AI assistants to interact with WordPress.</p>

    <section>
      <h2>Status</h2>
      <p>✅ MCP Server is running</p>
      <p>Endpoint: <code>/mcp</code></p>
    </section>

    <section>
      <h2>Configuration</h2>
      <p>Add this to your Claude settings:</p>
      <pre><code>{
  "mcpServers": {
    "wpnuxt": {
      "url": "{{ serverUrl }}/mcp"
    }
  }
}</code></pre>
    </section>

    <section>
      <h2>Available Tools</h2>
      <ul>
        <li><strong>wp_introspect_schema</strong> - Fetch the GraphQL schema from WordPress</li>
        <li><strong>wp_list_content_types</strong> - List all post types</li>
        <li><strong>wp_fetch_posts</strong> - Fetch posts from WordPress</li>
        <li><strong>wp_fetch_pages</strong> - Fetch pages from WordPress</li>
        <li><strong>wp_query</strong> - Execute arbitrary GraphQL queries</li>
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
const serverUrl = computed(() => {
  if (import.meta.client) {
    return window.location.origin
  }
  return 'https://mcp.wpnuxt.com'
})
</script>

<style>
.mcp-status {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #1a1a1a;
}

h2 {
  color: #333;
  margin-top: 2rem;
}

code {
  background: #f4f4f4;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  font-size: 0.9em;
}

pre {
  background: #f4f4f4;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
}

pre code {
  background: none;
  padding: 0;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
