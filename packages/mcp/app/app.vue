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
      <p>Add the MCP server to Claude Code:</p>
      <pre><code>claude mcp add wpnuxt --transport http {{ serverUrl }}/mcp \
  --header "X-WordPress-URL: https://your-wordpress-site.com"</code></pre>

      <p style="margin-top: 1.5rem;">Or add this to your Claude settings manually (<code>~/.claude/settings.json</code>):</p>
      <pre><code>{
  "mcpServers": {
    "wpnuxt": {
      "url": "{{ serverUrl }}/mcp",
      "headers": {
        "X-WordPress-URL": "https://your-wordpress-site.com"
      }
    }
  }
}</code></pre>

      <h3>Headers</h3>
      <ul class="headers-list">
        <li><code>X-WordPress-URL</code> <span class="required">(required)</span> - Your WordPress site URL with WPGraphQL enabled</li>
        <li><code>X-WordPress-App-User</code> <span class="optional">(optional)</span> - Application username for authenticated requests</li>
        <li><code>X-WordPress-App-Password</code> <span class="optional">(optional)</span> - Application password for authenticated requests</li>
      </ul>

      <p class="note">Each user connects to their own WordPress instance by providing their URL in the headers.</p>
    </section>

    <section>
      <h2>Available Tools</h2>
      <ul>
        <li><strong>wp_introspect_schema</strong> - Fetch the GraphQL schema from WordPress</li>
        <li><strong>wp_list_content_types</strong> - List all post types</li>
        <li><strong>wp_fetch_posts</strong> - Fetch posts from WordPress</li>
        <li><strong>wp_fetch_pages</strong> - Fetch pages from WordPress</li>
        <li><strong>wp_list_menus</strong> - List navigation menus with hierarchy</li>
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

h3 {
  color: #444;
  margin-top: 1.5rem;
  font-size: 1.1em;
}

.headers-list li {
  border-bottom: none;
  padding: 0.3rem 0;
}

.required {
  color: #c53030;
  font-size: 0.85em;
}

.optional {
  color: #718096;
  font-size: 0.85em;
}

.note {
  margin-top: 1rem;
  padding: 0.75rem 1rem;
  background: #ebf8ff;
  border-left: 4px solid #4299e1;
  border-radius: 0 4px 4px 0;
  font-size: 0.9em;
  color: #2b6cb0;
}
</style>
