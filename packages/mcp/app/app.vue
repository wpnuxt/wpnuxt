<template>
  <div class="mcp-status">
    <h1>WPNuxt MCP Server</h1>
    <p>A remote MCP server for AI assistants to interact with WordPress and generate WPNuxt projects.</p>

    <section>
      <h2>Status</h2>
      <p>✅ MCP Server is running</p>
      <p>Endpoint: <code>/mcp</code></p>
    </section>

    <section>
      <h2>Configuration</h2>
      <p>Add the MCP server to Claude Code:</p>
      <pre><code>claude mcp add wpnuxt --transport http {{ serverUrl }}/mcp</code></pre>

      <p style="margin-top: 1.5rem;">
        Or add this to your Claude settings manually (<code>~/.claude/settings.json</code>):
      </p>
      <pre><code>{
  "mcpServers": {
    "wpnuxt": {
      "url": "{{ serverUrl }}/mcp"
    }
  }
}</code></pre>

      <h3>Connecting to WordPress</h3>
      <p>There are three ways to connect to your WordPress site:</p>
      <ol class="connection-methods">
        <li>
          <strong>Use a prompt</strong> (recommended) - Ask Claude to use the <code>connect-wordpress</code> prompt
        </li>
        <li>
          <strong>Use the wp_connect tool</strong> - Claude can call <code>wp_connect</code> with your WordPress URL
        </li>
        <li>
          <strong>Set headers</strong> - Configure the WordPress URL in the MCP server headers:
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
        </li>
      </ol>

      <h3>Optional Headers</h3>
      <ul class="headers-list">
        <li><code>X-WordPress-URL</code> <span class="optional">(optional)</span> - Your WordPress site URL (can also be set via wp_connect)</li>
        <li><code>X-WordPress-App-User</code> <span class="optional">(optional)</span> - Application username for authenticated requests</li>
        <li><code>X-WordPress-App-Password</code> <span class="optional">(optional)</span> - Application password for authenticated requests</li>
      </ul>

      <p class="note">
        Your WordPress site must have <a
          href="https://www.wpgraphql.com/"
          target="_blank"
        >WPGraphQL</a> installed and activated.
      </p>
    </section>

    <section>
      <h2>Available Prompts</h2>
      <ul class="tools-list">
        <li>
          <strong>connect-wordpress</strong>
          <span class="tool-desc">Connect to a WordPress site and discover available content types, menus, and plugins</span>
        </li>
        <li>
          <strong>switch-wordpress</strong>
          <span class="tool-desc">Switch to a different WordPress site or check the current connection status</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>Available Tools</h2>

      <h3>Connection</h3>
      <ul class="tools-list">
        <li>
          <strong>wp_connect</strong>
          <span class="tool-desc">Connect to a WordPress site and store the URL in the session</span>
        </li>
      </ul>

      <h3>WordPress Discovery</h3>
      <ul class="tools-list">
        <li>
          <strong>wp_introspect_schema</strong>
          <span class="tool-desc">Fetch the GraphQL schema from WordPress</span>
        </li>
        <li>
          <strong>wp_get_site_settings</strong>
          <span class="tool-desc">Fetch site title, description, URL, language, timezone, and reading settings</span>
        </li>
        <li>
          <strong>wp_list_content_types</strong>
          <span class="tool-desc">List all post types available via GraphQL</span>
        </li>
        <li>
          <strong>wp_list_taxonomies</strong>
          <span class="tool-desc">List all taxonomies (categories, tags, custom taxonomies)</span>
        </li>
        <li>
          <strong>wp_list_menus</strong>
          <span class="tool-desc">List navigation menus with full hierarchy</span>
        </li>
        <li>
          <strong>wp_list_blocks</strong>
          <span class="tool-desc">Detect and analyze Gutenberg blocks in use across the site</span>
        </li>
        <li>
          <strong>wp_detect_plugins</strong>
          <span class="tool-desc">Detect WordPress plugins (ACF, WooCommerce, Yoast SEO, etc.) by analyzing the schema</span>
        </li>
      </ul>

      <h3>Content Fetching</h3>
      <ul class="tools-list">
        <li>
          <strong>wp_fetch_posts</strong>
          <span class="tool-desc">Fetch posts from WordPress with pagination</span>
        </li>
        <li>
          <strong>wp_fetch_pages</strong>
          <span class="tool-desc">Fetch pages from WordPress with pagination</span>
        </li>
        <li>
          <strong>wp_sample_content</strong>
          <span class="tool-desc">Fetch sample content to understand data shapes and detect blocks in use</span>
        </li>
        <li>
          <strong>wp_query</strong>
          <span class="tool-desc">Execute arbitrary GraphQL queries</span>
        </li>
      </ul>

      <h3>WPNuxt Project Generation</h3>
      <ul class="tools-list">
        <li>
          <strong>wpnuxt_init</strong>
          <span class="tool-desc">Generate WPNuxt project files with Nuxt UI v4 (default) for the AI to create locally</span>
        </li>
        <li>
          <strong>wpnuxt_list_composables</strong>
          <span class="tool-desc">List available WPNuxt composables based on GraphQL schema introspection</span>
        </li>
        <li>
          <strong>wpnuxt_generate_queries</strong>
          <span class="tool-desc">Generate GraphQL queries for content types and taxonomies</span>
        </li>
        <li>
          <strong>wpnuxt_generate_pages</strong>
          <span class="tool-desc">Generate Nuxt page components (archive and single pages)</span>
        </li>
        <li>
          <strong>wpnuxt_generate_components</strong>
          <span class="tool-desc">Generate Vue components for cards, lists, and taxonomies</span>
        </li>
        <li>
          <strong>wpnuxt_generate_block_renderers</strong>
          <span class="tool-desc">Generate Vue components for rendering Gutenberg blocks</span>
        </li>
        <li>
          <strong>wpnuxt_setup_menus</strong>
          <span class="tool-desc">Generate menu components (header, footer, mobile navigation)</span>
        </li>
      </ul>
    </section>

    <section>
      <h2>Workflow</h2>
      <ol class="workflow-list">
        <li><strong>Connect</strong> - Use the <code>connect-wordpress</code> prompt or <code>wp_connect</code> tool</li>
        <li><strong>Discover</strong> - Use wp_* tools to analyze your WordPress site structure</li>
        <li><strong>Generate</strong> - Use <code>wpnuxt_init</code> to scaffold your Nuxt project with Nuxt UI</li>
        <li><strong>Enhance</strong> - Use wpnuxt_* tools to add pages, components, and queries</li>
        <li><strong>Customize</strong> - Modify generated components to match your design</li>
      </ol>
    </section>

    <section>
      <h2>Generated Project Stack</h2>
      <ul class="stack-list">
        <li><strong>Nuxt 4</strong> - Latest Nuxt with app/ directory structure</li>
        <li><strong>Nuxt UI v4</strong> - 110+ ready-to-use components (enabled by default)</li>
        <li><strong>Tailwind CSS v4</strong> - Utility-first CSS framework</li>
        <li><strong>@wpnuxt/core</strong> - WordPress integration with typed composables</li>
        <li><strong>TypeScript</strong> - Full type safety</li>
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
  max-width: 900px;
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-family: system-ui, -apple-system, sans-serif;
}

h1 {
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

h2 {
  color: #333;
  margin-top: 2.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #eee;
}

h3 {
  color: #444;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
  font-size: 1.1em;
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

ul, ol {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}

.headers-list li {
  border-bottom: none;
  padding: 0.3rem 0;
}

.tools-list li {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 0;
}

.tools-list li strong {
  color: #2563eb;
  font-family: 'Monaco', 'Consolas', monospace;
  font-size: 0.95em;
}

.tool-desc {
  color: #666;
  font-size: 0.9em;
}

.workflow-list {
  list-style: decimal;
  padding-left: 1.5rem;
}

.workflow-list li {
  border-bottom: none;
  padding: 0.5rem 0;
}

.connection-methods {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-top: 1rem;
}

.connection-methods li {
  border-bottom: none;
  padding: 0.75rem 0;
}

.connection-methods pre {
  margin-top: 0.5rem;
}

.stack-list li {
  border-bottom: none;
  padding: 0.4rem 0;
}

.stack-list li strong {
  color: #2563eb;
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

.note a {
  color: #2b6cb0;
  text-decoration: underline;
}
</style>
