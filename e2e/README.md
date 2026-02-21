# WPNuxt E2E Tests

End-to-end tests for WPNuxt using Playwright. Tests run against real WordPress instances (via Docker) and Nuxt fixtures to verify compatibility across different version combinations.

## Prerequisites

- Docker and Docker Compose
- Node.js 20+
- pnpm

## Quick Start

```bash
# From the repo root
pnpm install
pnpm run dev:prepare

# Run default tests (WP 6.9 + Nuxt 4.3)
cd e2e
node run-tests.mjs
```

## Test Runner

`run-tests.mjs` handles Docker lifecycle, WordPress setup, and Playwright execution.

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--wp=VERSION` | WordPress version | `6.9` |
| `--nuxt=FIXTURE` | Nuxt fixture | `nuxt43` |
| `--wp-only` | Run only WordPress tests (skips Nuxt web server) | `false` |
| `--nuxt-only` | Run only Nuxt tests | `false` |
| `--all` | Run full matrix (all WP × Nuxt combinations) | `false` |
| `--no-docker` | Skip Docker management (assumes containers already running) | `false` |
| `--help` | Show help | |

### WordPress Versions

| Version | Docker Port |
|---------|-------------|
| `6.4` | 8004 |
| `6.5` | 8005 |
| `6.6` | 8006 |
| `6.7` | 8007 |
| `6.8` | 8008 |
| `6.9` | 8009 |
| `beta` | 8010 |

### Nuxt Fixtures

| Fixture | Nuxt Version | Dev Port |
|---------|-------------|----------|
| `nuxt317` | 3.17 | 3017 |
| `nuxt3` | 3.x (latest) | 3003 |
| `nuxt40` | 4.0 | 3040 |
| `nuxt41` | 4.1 | 3041 |
| `nuxt42` | 4.2 | 3042 |
| `nuxt43` | 4.3 | 3043 |
| `nuxt-srcdir` | 4.x (srcDir layout) | 3044 |

### Examples

```bash
# Test a specific WordPress version
node run-tests.mjs --wp=6.7

# WordPress-only tests (faster, no Nuxt build)
node run-tests.mjs --wp-only --wp=6.9

# Nuxt-only tests with a specific fixture
node run-tests.mjs --nuxt-only --nuxt=nuxt3

# Full compatibility matrix (all WP × Nuxt combinations)
node run-tests.mjs --all

# Skip Docker (if WordPress is already running)
node run-tests.mjs --no-docker --wp=6.9
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
WPGRAPHQL_VERSION=2.7.0 node run-tests.mjs --wp=6.9 --wp-only

# Pin all plugins
WPGRAPHQL_VERSION=2.7.0 \
WPGRAPHQL_CONTENT_BLOCKS_VERSION=4.9.0 \
WPGRAPHQL_HEADLESS_LOGIN_VERSION=0.3.1 \
node run-tests.mjs --wp=6.9

# Mix pinned and latest
WPGRAPHQL_VERSION=2.6.0 node run-tests.mjs --wp=6.8
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
│   ├── nuxt317/
│   ├── nuxt3/
│   ├── nuxt40/ ... nuxt43/
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
