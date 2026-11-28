# WPNuxt E2E Tests

End-to-end tests for WPNuxt using Playwright. Tests run against real WordPress instances (via Docker) and Nuxt fixtures to verify compatibility across different version combinations.

## Prerequisites

- Docker and Docker Compose
- Node.js 22+
- pnpm

## Quick Start

```bash
# From the repo root
pnpm install
pnpm run dev:prepare

# Run default tests (WP 7.1 + Nuxt 4.7)
cd e2e
node run-tests.mjs
```

## Test Runner

`run-tests.mjs` handles Docker lifecycle, WordPress setup, and Playwright execution.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--wp=VERSION` | WordPress version | `7.1` |
| `--nuxt=FIXTURE` | Nuxt fixture | `nuxt47` |
| `--wp-only` | Run only WordPress tests (skips Nuxt web server) | `false` |
| `--nuxt-only` | Run only Nuxt tests | `false` |
| `--all` | Run full matrix (all WP × Nuxt combinations) | `false` |
| `--no-docker` | Skip Docker management (assumes containers already running) | `false` |
| `--help` | Show help | |

### WordPress Versions

| Version | Docker Port |
|---------|-------------|
| `6.9` | 8009 |
| `7.0` | 8011 |
| `7.1` | 8012 |
| `beta` | 8010 |

Compose files for older versions (6.4-6.8) are still in `docker/`, but only the
versions above are accepted by the runner and covered by the CI matrix.

### Nuxt Fixtures

| Fixture | Nuxt Version | Dev Port |
|---------|-------------|----------|
| `nuxt44` | 4.4 | 3045 |
| `nuxt47` | 4.7 | 3047 |
| `nuxt-srcdir` | 4.x (srcDir layout) | 3044 |

### Examples

```bash
# Test a specific WordPress version
node run-tests.mjs --wp=7.0

# WordPress-only tests (faster, no Nuxt build)
node run-tests.mjs --wp-only --wp=7.1

# Nuxt-only tests with a specific fixture
node run-tests.mjs --nuxt-only --nuxt=nuxt44

# Full compatibility matrix (all WP × Nuxt combinations)
node run-tests.mjs --all

# Skip Docker (if WordPress is already running)
node run-tests.mjs --no-docker --wp=7.1
```

## Plugin Version Pinning

By default, the WordPress setup installs the latest versions of WPGraphQL, WPGraphQL Content Blocks, and WPGraphQL Headless Login. You can pin specific versions via environment variables:

| Variable | Plugin | Default |
|----------|--------|---------|
| `WPGRAPHQL_VERSION` | WPGraphQL | `latest` |
| `WPGRAPHQL_CONTENT_BLOCKS_VERSION` | WPGraphQL Content Blocks | `latest` |
| `WPGRAPHQL_HEADLESS_LOGIN_VERSION` | WPGraphQL Headless Login | `latest` |

```bash
# Pin WPGraphQL to a specific version
WPGRAPHQL_VERSION=2.7.0 node run-tests.mjs --wp=7.1 --wp-only

# Pin all plugins
WPGRAPHQL_VERSION=2.7.0 \
WPGRAPHQL_CONTENT_BLOCKS_VERSION=4.9.0 \
WPGRAPHQL_HEADLESS_LOGIN_VERSION=0.3.1 \
node run-tests.mjs --wp=7.1

# Mix pinned and latest
WPGRAPHQL_VERSION=2.6.0 node run-tests.mjs --wp=7.0
```

Installed plugin versions are always logged at the end of WordPress setup, regardless of pinning.

## Test Structure

```
e2e/
├── run-tests.mjs          # Test runner (Docker + Playwright orchestration)
├── playwright.config.ts   # Playwright config (projects, ports, web server)
├── tests/
│   ├── wordpress.spec.ts  # Tests against WordPress directly (GraphQL API)
│   └── nuxt.spec.ts       # Tests against Nuxt app (SSR, pages, composables)
├── fixtures/              # Nuxt app fixtures (one per version)
│   ├── nuxt44/, nuxt47/
│   └── nuxt-srcdir/
└── docker/
    ├── setup.sh           # WordPress setup script (plugins, test content)
    └── docker-compose.wp-*.yml  # One compose file per WP version
```

## CI

The `compatibility.yml` workflow runs tests via GitHub Actions. It supports:

- **Full matrix**: all WP × Nuxt combinations (`run_all: true`)
- **Single combination**: pick specific WP + Nuxt versions
- **Plugin pinning**: optional inputs for all three plugin versions

Trigger manually from the Actions tab with the desired parameters.
