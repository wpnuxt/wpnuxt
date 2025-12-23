# WPNuxt Documentation

Documentation for the WPNuxt module - a modern WordPress integration for Nuxt 4.

## Documentation Structure

### Getting Started

- **[Introduction](0.index.md)** - What is WPNuxt?
- **[Getting Started](1.getting-started/1.index.md)** - Installation and setup
- **[Configuration](1.getting-started/2.configuration.md)** - Complete configuration reference
- **[Composables](1.getting-started/3.composables.md)** - Using auto-generated composables

### Advanced

- **[Performance](2.advanced/1.performance.md)** - Server-side caching and optimization
- **[Composables API](2.advanced/2.composables-api.md)** - Detailed API reference

### Reference

- **[Cheat Sheet](3.cheat-sheet.md)** - Quick reference guide

## Quick Links

- [GitHub Repository](https://github.com/wpnuxt/wpnuxt)
- [Migration Guide](/MIGRATION.md) - Upgrading from WPNuxt 1.x
- [WPGraphQL Plugin](https://wordpress.org/plugins/wp-graphql/)
- [nuxt-graphql-middleware](https://nuxt-graphql-middleware.dulnan.net/)

## Packages

| Package | Description |
|---------|-------------|
| [@wpnuxt/core](https://npmjs.com/package/@wpnuxt/core) | Core WordPress integration |
| [@wpnuxt/blocks](https://npmjs.com/package/@wpnuxt/blocks) | Gutenberg block components |
| @wpnuxt/auth | WordPress authentication (coming soon) |

## Documentation Conventions

Throughout the documentation:

- `wpNuxt` refers to the module configuration key in `nuxt.config.ts`
- `wpNuxtBlocks` refers to the blocks module configuration key
- Code examples use TypeScript
- File paths use forward slashes (Unix-style)
- Examples show pnpm, npm, and yarn where applicable

## Contributing

Documentation improvements are welcome! If you find errors or want to add examples:

1. Fork the repository
2. Edit files in the `docs/` folder
3. Submit a pull request

## Support

- **Issues**: Report bugs or request features on [GitHub](https://github.com/wpnuxt/wpnuxt/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/wpnuxt/wpnuxt/discussions)
- **WordPress Plugin Support**: See [WPGraphQL documentation](https://www.wpgraphql.com/docs/introduction)
