# WPNuxt Monorepo Setup Plan

## Overview

Reorganize the current `wpnuxt` repository into a monorepo structure, consolidating all WPNuxt packages. The existing `wpnuxt` module becomes `@wpnuxt/core`.

## Target Structure

```
wpnuxt/
├── packages/
│   ├── core/                 # @wpnuxt/core (based on wpnuxt)
│   │   ├── src/
│   │   │   ├── module.ts
│   │   │   ├── generate.ts
│   │   │   ├── runtime/
│   │   │   │   ├── composables/
│   │   │   │   ├── components/
│   │   │   │   ├── queries/
│   │   │   │   ├── plugins/
│   │   │   │   └── util/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── blocks/               # @wpnuxt/blocks
│   │   ├── src/
│   │   │   ├── module.ts
│   │   │   ├── runtime/
│   │   │   │   ├── components/
│   │   │   │   └── queries/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── auth/                 # @wpnuxt/auth
│   │   ├── src/
│   │   │   ├── module.ts
│   │   │   └── runtime/
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── mcp/                  # @wpnuxt/mcp
│       ├── src/
│       ├── package.json
│       └── tsconfig.json
│
├── playgrounds/
│   ├── basic/                # Minimal playground (core only)
│   │   ├── app/
│   │   ├── nuxt.config.ts
│   │   └── package.json
│   │
│   └── full/                 # Full-featured playground (all packages)
│       ├── app/
│       ├── nuxt.config.ts
│       └── package.json
│
├── docs/                     # VitePress or Nuxt Content docs
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── release.yml
│
├── package.json              # Root package.json
├── pnpm-workspace.yaml
├── tsconfig.json             # Base TypeScript config
├── eslint.config.js
└── .prettierrc
```

---

## Phase 1: Monorepo Foundation

### 1.1 Reorganize existing repository

```bash
cd ~/git/wpnuxt/wpnuxt

# Create monorepo structure
mkdir -p packages/core
mkdir -p playgrounds

# Move current module source to packages/core
mv src packages/core/
mv package.json packages/core/
mv tsconfig.json packages/core/

# Move existing playgrounds
mv playground playgrounds/full
mv playground-basic playgrounds/basic
```

### 1.2 Root package.json

Create a new root `package.json`:

```json
{
  "name": "wpnuxt-monorepo",
  "private": true,
  "type": "module",
  "scripts": {
    "build": "pnpm --filter './packages/**' build",
    "dev:prepare": "pnpm --filter './packages/**' dev:prepare",
    "dev:basic": "pnpm --filter @wpnuxt/playground-basic dev",
    "dev:full": "pnpm --filter @wpnuxt/playground-full dev",
    "lint": "pnpm --filter './packages/**' lint",
    "test": "pnpm --filter './packages/**' test",
    "typecheck": "pnpm --filter './packages/**' typecheck",
    "clean": "pnpm --filter '*' clean && rm -rf node_modules",
    "release": "pnpm build && changeset publish"
  },
  "devDependencies": {
    "@changesets/cli": "^2.27.0",
    "typescript": "^5.9.0",
    "eslint": "^9.34.0",
    "prettier": "^3.6.0"
  },
  "packageManager": "pnpm@10.8.0",
  "engines": {
    "node": ">=20"
  }
}
```

### 1.3 pnpm-workspace.yaml

```yaml
packages:
  - "packages/*"
  - "playgrounds/*"
```

### 1.4 Base tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "declaration": true,
    "declarationMap": true
  }
}
```

---

## Phase 2: Configure @wpnuxt/core

### 2.1 Update packages/core/package.json

The source is already in place from Phase 1. Update the package.json:

```json
{
  "name": "@wpnuxt/core",
  "version": "1.0.0",
  "description": "Nuxt module for WordPress integration via GraphQL",
  "exports": {
    ".": {
      "types": "./dist/types.d.mts",
      "import": "./dist/module.mjs"
    }
  },
  "main": "./dist/module.mjs",
  "types": "./dist/types.d.mts",
  "files": ["dist"],
  "publishConfig": {
    "access": "public"
  },
  "scripts": {
    "build": "nuxt-module-build build",
    "dev:prepare": "nuxt-module-build build --stub && nuxt-module-build prepare",
    "lint": "eslint src",
    "test": "vitest run",
    "typecheck": "vue-tsc --noEmit",
    "clean": "rm -rf dist .nuxt"
  },
  "dependencies": {
    "@nuxt/kit": "^4.2.0",
    "@radya/nuxt-dompurify": "^1.0.5",
    "defu": "^6.1.4",
    "graphql": "^16.11.0",
    "nuxt-graphql-middleware": "^5.2.2",
    "scule": "^1.3.0"
  },
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

### 2.2 Port features from wpnuxt-core

Copy these from wpnuxt-core to the new @wpnuxt/core:

#### Components to add

| File                                     | Purpose                       |
| ---------------------------------------- | ----------------------------- |
| `runtime/components/WPContent.vue`       | Smart content renderer        |
| `runtime/components/ContentRenderer.vue` | HTML content renderer         |
| `runtime/components/StagingBanner.vue`   | Staging environment indicator |

#### Composables to add

| File                                      | Purpose                     |
| ----------------------------------------- | --------------------------- |
| `runtime/composables/useWPUri.ts`         | WordPress admin URL helpers |
| `runtime/composables/useFeaturedImage.ts` | Featured image extraction   |
| `runtime/composables/usePrevNextPost.ts`  | Post navigation             |
| `runtime/composables/isStaging.ts`        | Staging detection           |

#### Utilities to port

| Feature                    | From              | Notes                                           |
| -------------------------- | ----------------- | ----------------------------------------------- |
| `fixMalformedUrls`         | `useWPContent.ts` | Add as transform option                         |
| Companion module detection | `module.ts`       | `hasBlocksModule`, `hasAuthModule`              |
| Query merging from modules | `utils.ts`        | Merge queries from @wpnuxt/blocks, @wpnuxt/auth |

#### Configuration options to add

```typescript
interface WPNuxtConfig {
  // From wpnuxt (keep)
  wordpressUrl: string;
  graphqlEndpoint?: string;
  downloadSchema?: boolean;
  debug?: boolean;
  cache?: {
    enabled?: boolean;
    maxAge?: number;
    swr?: boolean;
  };

  // From wpnuxt-core (add)
  frontendUrl?: string;
  defaultMenuName?: string;
  staging?: boolean;
  composablesPrefix?: string;

  // Auto-detected
  hasBlocksModule?: boolean;
  hasAuthModule?: boolean;
}
```

---

## Phase 3: Migrate @wpnuxt/blocks

### 3.1 Copy package from external repo

```bash
# Copy from the separate wpnuxt-blocks repository
cp -r ~/git/wpnuxt/wpnuxt-blocks/src packages/blocks/src
cp ~/git/wpnuxt/wpnuxt-blocks/package.json packages/blocks/package.json
```

### 3.2 Update package.json

```json
{
  "name": "@wpnuxt/blocks",
  "version": "1.0.0",
  "dependencies": {
    "@nuxt/kit": "^4.2.0",
    "@nuxt/image": "^2.0.0",
    "@nuxt/ui": "^4.3.0",
    "@wpnuxt/core": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

### 3.3 Update imports

Replace all `@wpnuxt/core` version-specific imports with workspace imports.

---

## Phase 4: Migrate @wpnuxt/auth

### 4.1 Copy package from external repo

```bash
# Copy from the separate wpnuxt-auth repository
cp -r ~/git/wpnuxt/wpnuxt-auth/src packages/auth/src
cp ~/git/wpnuxt/wpnuxt-auth/package.json packages/auth/package.json
```

### 4.2 Major updates needed

The auth package is on Nuxt 3.13 and needs significant updates:

| Task               | Notes                                |
| ------------------ | ------------------------------------ |
| Update to Nuxt 4   | Change module format, update imports |
| Update @nuxt/kit   | 3.13.0 → 4.2.0                       |
| Update to ESM      | Ensure full ESM compatibility        |
| Update composables | Match new @wpnuxt/core patterns      |
| Test with new core | Ensure compatibility                 |

### 4.3 Updated package.json

```json
{
  "name": "@wpnuxt/auth",
  "version": "1.0.0",
  "type": "module",
  "exports": {
    ".": {
      "types": "./dist/types.d.mts",
      "import": "./dist/module.mjs"
    }
  },
  "dependencies": {
    "@nuxt/kit": "^4.2.0",
    "@wpnuxt/core": "workspace:*"
  },
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

---

## Phase 5: Migrate @wpnuxt/mcp

### 5.1 Evaluate structure

wpnuxt-mcp is currently a Nuxt app, not a module. Decide:

**Option A:** Keep as Nuxt app in `playgrounds/mcp/`
**Option B:** Convert to publishable module `@wpnuxt/mcp`

### 5.2 If converting to module

```json
{
  "name": "@wpnuxt/mcp",
  "version": "1.0.0",
  "dependencies": {
    "@nuxt/kit": "^4.2.0",
    "@nuxtjs/mcp-toolkit": "^0.5.2",
    "@wpnuxt/core": "workspace:*"
  }
}
```

---

## Phase 6: Update Playgrounds

The existing playgrounds are moved in Phase 1. Update their configurations.

### 6.1 Basic playground (playgrounds/basic)

Minimal setup with just @wpnuxt/core:

```typescript
// playgrounds/basic/nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@wpnuxt/core"],
  wpNuxt: {
    wordpressUrl:
      process.env.WORDPRESS_URL || "https://developer.flavioespinoza.dev",
  },
});
```

### 6.2 Full playground (playgrounds/full)

All packages together:

```typescript
// playgrounds/full/nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@wpnuxt/core", "@wpnuxt/blocks", "@wpnuxt/auth"],
  wpNuxt: {
    wordpressUrl: process.env.WORDPRESS_URL,
    staging: true,
  },
});
```

---

## Phase 7: CI/CD Setup

### 7.1 GitHub Actions - CI

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "pnpm"
      - run: pnpm install
      - run: pnpm build
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
```

### 7.2 Changesets for versioning

```bash
pnpm changeset init
```

Configure `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [["@wpnuxt/core", "@wpnuxt/blocks", "@wpnuxt/auth", "@wpnuxt/mcp"]],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch"
}
```

---

## Phase 8: Documentation

### 8.1 Docs structure

```
docs/
├── .vitepress/
│   └── config.ts
├── guide/
│   ├── getting-started.md
│   ├── configuration.md
│   └── composables.md
├── packages/
│   ├── core.md
│   ├── blocks.md
│   ├── auth.md
│   └── mcp.md
└── index.md
```

### 8.2 README updates

Each package needs its own README with:

- Installation instructions
- Basic usage
- Link to full docs

---

## Migration Checklist

### Preparation

- [ ] Create monorepo directory structure (packages/, playgrounds/)
- [ ] Move existing source to packages/core/
- [ ] Move existing playgrounds to playgrounds/
- [ ] Create root package.json and pnpm-workspace.yaml
- [ ] Configure ESLint, Prettier, TypeScript at root

### Core package

- [ ] Update package.json (rename to @wpnuxt/core)
- [ ] Port components from wpnuxt-core
- [ ] Port additional composables from wpnuxt-core
- [ ] Port utility functions (fixMalformedUrls)
- [ ] Add companion module detection
- [ ] Update configuration types
- [ ] Write tests
- [ ] Update documentation

### Blocks package

- [ ] Copy wpnuxt-blocks source from external repo
- [ ] Update dependency to workspace:\*
- [ ] Test with new core
- [ ] Fix any breaking changes

### Auth package

- [ ] Copy wpnuxt-auth source from external repo
- [ ] Update to Nuxt 4
- [ ] Update all dependencies
- [ ] Update to new composable patterns
- [ ] Test with new core
- [ ] Fix breaking changes

### MCP package

- [ ] Decide: app or module
- [ ] Migrate accordingly
- [ ] Test integration

### Playgrounds

- [ ] Update basic playground config for monorepo
- [ ] Update full playground config for monorepo
- [ ] Test all features

### CI/CD

- [ ] Set up GitHub Actions
- [ ] Configure changesets
- [ ] Set up npm publishing

### Finalization

- [ ] Update all READMEs
- [ ] Write migration guide
- [ ] Archive external repos (wpnuxt-blocks, wpnuxt-auth, wpnuxt-core)
- [ ] Publish initial versions

---

## Suggested Approach

This is a significant refactoring effort. Suggested order:

1. **Reorganize structure** - Move existing source to packages/core, set up workspace
2. **Verify core works** - Ensure @wpnuxt/core builds and playgrounds run
3. **Add blocks** - Copy @wpnuxt/blocks from external repo, fix any issues
4. **Update auth** - Major updates needed (Nuxt 3 → 4), may take longer
5. **Add MCP** - Evaluate and integrate last
6. **Polish** - Documentation, CI/CD, testing

---

## Breaking Changes to Document

### For @wpnuxt/core users

- Package name change: `@wpnuxt/core` stays the same (if migrating from wpnuxt-core)
- Composable return types now include full AsyncData (pending, refresh, etc.)
- Configuration option changes (document mapping)

### For @wpnuxt/blocks users

- Minimum @wpnuxt/core version requirement
- Any component API changes

### For @wpnuxt/auth users

- Major version bump required (Nuxt 3 → Nuxt 4)
- Composable pattern changes
- Configuration changes
