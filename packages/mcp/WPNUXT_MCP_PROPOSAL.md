# WPNuxt MCP Server Proposal

An MCP (Model Context Protocol) server that connects to a WordPress instance's GraphQL endpoint and provides AI assistants with deep contextual awareness of the WordPress site structure, enabling intelligent code generation and project scaffolding.

---

## Vision

Enable developers using AI assistants (Claude Code, Cursor, etc.) to build WordPress-powered Nuxt applications with unprecedented speed and accuracy by giving the AI real-time access to:

- The WordPress GraphQL schema
- Content structure and relationships
- Gutenberg blocks in use
- Installed plugins and their capabilities
- Actual content samples for context

---

## Core Features

### 1. WordPress Introspection Tools

| Tool | Description |
|------|-------------|
| `wp_introspect_schema` | Fetch and analyze the full GraphQL schema |
| `wp_list_content_types` | List all post types (posts, pages, custom types) |
| `wp_list_taxonomies` | List taxonomies (categories, tags, custom) |
| `wp_list_menus` | Get all registered menus and their items |
| `wp_list_blocks` | Detect Gutenberg blocks in use across the site |
| `wp_list_plugins` | Identify installed plugins that extend GraphQL (ACF, WooCommerce, Yoast, etc.) |
| `wp_get_site_settings` | Fetch general settings, permalink structure, etc. |

### 2. Content Analysis Tools

| Tool | Description |
|------|-------------|
| `wp_analyze_content_structure` | Map out relationships between content types |
| `wp_sample_content` | Fetch sample posts/pages to understand data shapes |
| `wp_analyze_blocks_usage` | Which blocks are used, how frequently, nesting patterns |
| `wp_detect_acf_fields` | Map ACF field groups to content types |
| `wp_analyze_media_usage` | Understand image sizes, formats in use |

### 3. Project Scaffolding Tools

| Tool | Description |
|------|-------------|
| `wpnuxt_init` | Bootstrap a new Nuxt project with wpnuxt configured |
| `wpnuxt_generate_pages` | Auto-generate page routes based on WordPress structure |
| `wpnuxt_generate_queries` | Create GraphQL queries for each content type |
| `wpnuxt_generate_components` | Scaffold Vue components for content types |
| `wpnuxt_generate_block_renderers` | Create block renderer components |
| `wpnuxt_setup_menus` | Generate menu components from WordPress menus |

### 4. Live Development Tools

| Tool | Description |
|------|-------------|
| `wp_query` | Execute arbitrary GraphQL queries for testing |
| `wp_preview_content` | Fetch draft/preview content |
| `wp_validate_query` | Validate a GraphQL query against the schema |
| `wp_suggest_query` | Suggest optimal query based on data needs |

---

## MCP Resources

Contextual data exposed to AI assistants:

```typescript
resources: [
  {
    uri: "wpnuxt://schema",
    name: "GraphQL Schema",
    description: "Full introspected schema from WordPress"
  },
  {
    uri: "wpnuxt://content-types",
    name: "Content Types Map",
    description: "All post types with their fields and relationships"
  },
  {
    uri: "wpnuxt://blocks",
    name: "Block Registry",
    description: "All Gutenberg blocks detected in content"
  },
  {
    uri: "wpnuxt://menus",
    name: "Menu Structure",
    description: "All menus with their hierarchical items"
  },
  {
    uri: "wpnuxt://queries",
    name: "Generated Queries",
    description: "Pre-generated GraphQL queries for common operations"
  }
]
```

---

## MCP Prompts (Pre-built Workflows)

```typescript
prompts: [
  {
    name: "scaffold-project",
    description: "Bootstrap a complete wpnuxt project",
    arguments: [{ name: "wordpressUrl", required: true }]
  },
  {
    name: "add-content-type",
    description: "Add pages/components for a WordPress content type",
    arguments: [{ name: "contentType", required: true }]
  },
  {
    name: "generate-block-renderers",
    description: "Create Vue components for all detected blocks"
  },
  {
    name: "optimize-queries",
    description: "Analyze and optimize existing GraphQL queries"
  },
  {
    name: "add-search",
    description: "Implement WordPress search functionality"
  },
  {
    name: "add-pagination",
    description: "Add cursor-based pagination to a content listing"
  }
]
```

---

## Use Case Examples

### Smart Project Bootstrapping

**User prompt:**
> "Set up a wpnuxt project for my WordPress site at https://myblog.com"

**MCP workflow:**

1. Connect to `https://myblog.com/graphql`
2. Introspect the schema
3. Detect:
   - Custom post types (e.g., "portfolio", "testimonials")
   - ACF field groups
   - Installed plugins (WooCommerce? Yoast SEO?)
   - Menu locations
   - Block patterns in use
4. Generate:
   - `nuxt.config.ts` with wpNuxt configured
   - `pages/index.vue` (homepage)
   - `pages/[...slug].vue` (catch-all for pages)
   - `pages/blog/index.vue` (posts archive)
   - `pages/blog/[slug].vue` (single post)
   - `pages/portfolio/[slug].vue` (if CPT detected)
   - `components/blocks/*` (for detected blocks)
   - GraphQL queries for each content type

### Intelligent Query Generation

**User prompt:**
> "I need to fetch the 10 latest posts with featured images and categories"

**MCP workflow:**

1. Check schema for available fields
2. Verify `featuredImage` is available
3. Check category structure
4. Generate optimized query with proper fragments
5. Create a typed composable

### Block-Aware Component Generation

**User prompt:**
> "Generate components for all the Gutenberg blocks used on this site"

**MCP workflow:**

1. Scan content for block types in use
2. Identify core blocks vs. custom blocks
3. Generate Vue components for each:
   - `core/paragraph` → `BlockParagraph.vue`
   - `core/image` → `BlockImage.vue`
   - `core/gallery` → `BlockGallery.vue`
   - `acf/testimonial` → `BlockTestimonial.vue` (with ACF fields)
4. Generate `BlockRenderer.vue` with dynamic imports

---

## Plugin-Specific Intelligence

### WooCommerce Detected

- Generate product listing pages
- Create cart/checkout components
- Set up product queries with pricing, variants
- Configure `@wpnuxt/woo` module if available

### Yoast SEO Detected

- Generate SEO meta component using Yoast fields
- Set up `useSeoMeta()` with WordPress data
- Create sitemap integration

### ACF Detected

- Map flexible content layouts to components
- Generate typed interfaces for field groups
- Create field-specific components (repeaters, galleries)

### WPML/Polylang Detected

- Set up i18n routing
- Generate language switcher component
- Configure locale-aware queries

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code / AI                      │
└─────────────────────┬───────────────────────────────────┘
                      │ MCP Protocol
                      ▼
┌─────────────────────────────────────────────────────────┐
│                    wpnuxt-mcp                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Introspect  │  │  Generate   │  │    Execute      │  │
│  │   Tools     │  │   Tools     │  │    Tools        │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
│         │                │                   │          │
│  ┌──────▼────────────────▼───────────────────▼───────┐  │
│  │              Schema Cache & Analysis               │  │
│  │  - Parsed GraphQL schema                          │  │
│  │  - Content type mappings                          │  │
│  │  - Block registry                                 │  │
│  │  - Plugin detection results                       │  │
│  └──────────────────────┬────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────┘
                          │ GraphQL
                          ▼
┌─────────────────────────────────────────────────────────┐
│              WordPress + WPGraphQL                       │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌───────────────┐  │
│  │ Posts   │ │ Pages   │ │  CPTs   │ │ ACF/Plugins   │  │
│  └─────────┘ └─────────┘ └─────────┘ └───────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## Package Structure

```
packages/
├── wpnuxt-core/          # Existing Nuxt module
├── wpnuxt-mcp/           # New MCP server
│   ├── src/
│   │   ├── index.ts      # MCP server entry
│   │   ├── tools/
│   │   │   ├── introspect.ts
│   │   │   ├── generate.ts
│   │   │   ├── query.ts
│   │   │   └── scaffold.ts
│   │   ├── resources/
│   │   │   ├── schema.ts
│   │   │   └── content-types.ts
│   │   ├── prompts/
│   │   │   └── workflows.ts
│   │   ├── generators/
│   │   │   ├── pages.ts
│   │   │   ├── components.ts
│   │   │   ├── queries.ts
│   │   │   └── blocks.ts
│   │   └── analyzers/
│   │       ├── schema.ts
│   │       ├── blocks.ts
│   │       └── plugins.ts
│   └── package.json
└── wpnuxt-blocks/        # Existing blocks module
```

---

## Configuration

### Authentication Options

```typescript
interface WPNuxtMCPConfig {
  wordpressUrl: string

  // Public access (read-only, no auth)
  publicAccess?: boolean

  // WordPress Application Password
  appPassword?: {
    username: string
    password: string
  }

  // JWT authentication
  jwtToken?: string

  // Preview secret for draft content
  previewSecret?: string
}
```

### Claude Code Configuration

```json
// .claude/settings.json
{
  "mcpServers": {
    "wpnuxt": {
      "command": "npx",
      "args": ["wpnuxt-mcp"],
      "env": {
        "WORDPRESS_URL": "https://mysite.com",
        "WORDPRESS_APP_USER": "admin",
        "WORDPRESS_APP_PASSWORD": "xxxx xxxx xxxx xxxx"
      }
    }
  }
}
```

---

## Caching Strategy

| Data Type | Cache Duration | Invalidation |
|-----------|----------------|--------------|
| GraphQL Schema | 1 hour | On-demand refresh |
| Content Type Definitions | 1 hour | On-demand refresh |
| Block Registry | 30 minutes | On-demand refresh |
| Content Samples | 5 minutes | On each query |
| Live Queries | No cache | Always fresh |

---

## Security Considerations

1. **Credential Protection**
   - Never expose credentials in generated code
   - Use environment variables for sensitive config
   - Store tokens securely

2. **Validation**
   - Validate WordPress URL before connecting
   - Verify GraphQL endpoint is accessible
   - Check for WPGraphQL plugin presence

3. **Rate Limiting**
   - Throttle queries to WordPress
   - Cache aggressively where appropriate
   - Batch introspection queries

4. **Scope Limitation**
   - Read-only by default
   - Mutations require explicit authentication
   - Preview access requires separate token

---

## Killer Features

### 1. Zero-to-Hero Experience
From WordPress URL to working Nuxt site in one conversation.

### 2. WordPress-Native Intelligence
Understands WordPress concepts: CPTs, taxonomies, blocks, ACF, hooks.

### 3. Living Documentation
Schema and content types always reflect actual WordPress state.

### 4. Best Practices Built-In
Generated code follows wpnuxt patterns automatically.

### 5. Plugin Ecosystem Awareness
Knows how to handle WooCommerce, ACF, Yoast, WPML, and more.

### 6. Live Schema Validation
Validate queries against the actual schema and suggest fixes.

### 7. Content-Driven Generation
Analyze actual content to generate components that match real data shapes.

### 8. Incremental Enhancement
```
"Add WooCommerce support to my existing wpnuxt project"
"Add multi-language support (WPML detected)"
"Add authentication with wp-graphql-jwt-auth"
```

### 9. Query Optimization
```
"Your Posts query fetches 20 fields but you only use 5.
Here's an optimized query..."
```

### 10. Type Generation
Auto-generate TypeScript interfaces from GraphQL schema that stay in sync.

---

## Implementation Phases

### Phase 1: Foundation
- [ ] Basic MCP server setup
- [ ] WordPress GraphQL connection
- [ ] Schema introspection tool
- [ ] Content type listing tool

### Phase 2: Analysis
- [ ] Block detection and analysis
- [ ] Plugin detection (ACF, WooCommerce, Yoast)
- [ ] Content sampling
- [ ] Menu structure analysis

### Phase 3: Generation
- [ ] Project scaffolding (`wpnuxt_init`)
- [ ] Page generation
- [ ] Query generation
- [ ] Component generation

### Phase 4: Advanced Features
- [ ] Block renderer generation
- [ ] Plugin-specific code generation
- [ ] Query optimization suggestions
- [ ] Preview integration

### Phase 5: Polish
- [ ] Comprehensive prompts library
- [ ] Documentation
- [ ] Example projects
- [ ] Integration tests

---

## Success Metrics

- **Time to First Page**: How quickly can a developer go from WordPress URL to rendered Nuxt page?
- **Query Accuracy**: Do generated queries work on first try?
- **Code Quality**: Does generated code follow best practices?
- **Plugin Coverage**: How many popular plugins are supported?
- **Developer Satisfaction**: Is the DX smooth and intuitive?

---

## Open Questions

1. Should the MCP server be standalone or integrated into wpnuxt-core?
2. How to handle WordPress multisite installations?
3. Should we support non-WPGraphQL setups (REST API fallback)?
4. How to handle schema changes during development?
5. Should generated code be opinionated or configurable?

---

## Related Projects

- [WPGraphQL](https://www.wpgraphql.com/) - GraphQL API for WordPress
- [Model Context Protocol](https://modelcontextprotocol.io/) - MCP specification
- [@wpnuxt/core](https://github.com/wpnuxt/wpnuxt-core) - Base Nuxt module
- [@wpnuxt/blocks](https://github.com/wpnuxt/wpnuxt-blocks) - Gutenberg blocks support
