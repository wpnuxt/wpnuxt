# Contributing to WPNuxt

Thanks for your interest in contributing to WPNuxt!

## Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for local WordPress)

### Clone and Install

```bash
git clone https://github.com/wpnuxt/wpnuxt.git
cd wpnuxt
pnpm install
```

### Start Local WordPress

The repo includes a pre-configured WordPress environment using [wp-env](https://developer.wordpress.org/block-editor/reference-guides/packages/packages-env/).

```bash
# Install wp-env globally (one-time)
npm install -g @wordpress/env

# Start WordPress
wp-env start
```

WordPress is now running at:
- **Site:** http://localhost:4000
- **GraphQL:** http://localhost:4000/graphql
- **Admin:** http://localhost:4000/wp-admin
- **Credentials:** `admin` / `password`

#### Included Plugins

The `.wp-env.json` configuration automatically installs:

| Plugin | Purpose |
|--------|---------|
| [WPGraphQL](https://www.wpgraphql.com/) | GraphQL API for WordPress |
| [WPGraphQL Content Blocks](https://github.com/wpengine/wp-graphql-content-blocks) | Gutenberg blocks as GraphQL data |
| [Headless Login for WPGraphQL](https://github.com/AxeWP/wp-graphql-headless-login) | Authentication via GraphQL |

#### Setup Script

On first start, `wordpress/setup.sh` automatically configures:
- Site name and permalinks
- Classic theme activation (Twenty Twenty-One, for menu support)
- GraphQL settings (introspection enabled)
- Demo content from `wordpress/demo-content/` (posts and pages with Gutenberg blocks)
- Classic navigation menu

#### wp-env Commands

```bash
wp-env start      # Start WordPress
wp-env stop       # Stop WordPress
wp-env destroy    # Remove environment and start fresh
wp-env logs       # View logs
```

Run WP-CLI commands:

```bash
wp-env run cli wp post list
wp-env run cli wp plugin list
```

### Run the Playground

```bash
# Prepare the module (generates types)
pnpm dev:prepare

# Run the full playground (with @nuxt/ui)
pnpm dev

# Or run the core playground (minimal)
pnpm dev:core
```

### Project Structure

```
wpnuxt/
├── packages/
│   ├── core/          # @wpnuxt/core - main module
│   ├── blocks/        # @wpnuxt/blocks - Gutenberg block rendering
│   └── auth/          # @wpnuxt/auth - authentication
├── playgrounds/
│   ├── full/          # Full-featured demo with @nuxt/ui
│   ├── blocks/        # Blocks rendering demo
│   ├── core/          # Minimal core-only demo
│   └── ssg/           # Static site generation demo
├── docs/              # Documentation (Nuxt Content)
└── wordpress/         # wp-env demo content and setup
```

## Development Workflow

### Making Changes

1. Create a branch for your changes
2. Make your changes in the relevant package
3. Run linting and type checks:
   ```bash
   pnpm lint
   pnpm typecheck
   ```
4. Run tests:
   ```bash
   pnpm test
   ```
5. Test in a playground to verify your changes work

### Code Style

- We use ESLint with `@nuxt/eslint-config`
- Run `pnpm lint` to check and auto-fix issues
- TypeScript is required for all source code

### Commits

- Write clear, concise commit messages
- Reference issues when applicable (e.g., "Fix #123")

### Pull Requests

- Keep PRs focused on a single change
- Include a clear description of what and why
- Ensure all checks pass before requesting review

## Troubleshooting

### Docker Not Running

```
Error: Cannot connect to the Docker daemon
```

Start Docker Desktop and try again.

### Port Already in Use

```
Error: Port 4000 is already in use
```

Either stop the other service or edit `.wp-env.json` to change the port.

### Permission Denied on setup.sh

```bash
chmod +x wordpress/setup.sh
```

### Fresh WordPress Start

If something goes wrong with WordPress:

```bash
wp-env destroy
wp-env start
```

## Questions?

- Open an issue on [GitHub](https://github.com/wpnuxt/wpnuxt/issues)
- Check the [documentation](https://wpnuxt.com)
