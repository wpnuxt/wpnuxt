# Changelog

## [2.0.0-alpha.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.5...v2.0.0-alpha.6) (2026-01-17)

### Bug Fixes

* **nuxt.config:** disable schema download in CI to avoid network calls ([69a4c5b](https://github.com/wpnuxt/wpnuxt/commit/69a4c5be3fd5aa9ad4c358001eee09efefafe520))

### Refactoring

* **useWPContent:** update timeout handling and remove default caching function ([f152b22](https://github.com/wpnuxt/wpnuxt/commit/f152b2238e01a1d587937b57a0fee35c180f336e))

### Documentation

* **composables:** clarify timeout option in usePosts documentation ([c42353a](https://github.com/wpnuxt/wpnuxt/commit/c42353a0e7810edd61d8fca4a25b8d05661f03ee))

## [2.0.0-alpha.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.4...v2.0.0-alpha.5) (2026-01-17)

### Features

* **auth:** enhance token refresh handling and error reporting ([0ffca6b](https://github.com/wpnuxt/wpnuxt/commit/0ffca6b2c5d9796ae05c6bdd5e3c9bab6772bfb4))
* **auth:** update API routes and enhance error handling ([498e266](https://github.com/wpnuxt/wpnuxt/commit/498e2661f1e71475ff6247b457bf5038fb9ca946))
* **blocks:** enhance component registration and image block handling ([115e626](https://github.com/wpnuxt/wpnuxt/commit/115e62606534ba833cc74b64c4c7bdde25e09822))

### Refactoring

* **auth:** remove unnecessary login endpoint workaround ([#4](https://github.com/wpnuxt/wpnuxt/issues/4)) ([c52f6d3](https://github.com/wpnuxt/wpnuxt/commit/c52f6d3a93b31609c16957b37090be985a0a5083))
* **caching:** enhance useWPContent with retry logic ([0211f6e](https://github.com/wpnuxt/wpnuxt/commit/0211f6e9e773deffa84a2d523ec01280c8ce2f68))

### Documentation

* **composables:** document retry and timeout options for usePosts ([a23dcb6](https://github.com/wpnuxt/wpnuxt/commit/a23dcb6ef76f333063a2cf97ea1b0bef0ac5007d))

### Maintenance

* **dependencies:** update @iconify-json/lucide to version 1.2.86 and adjust pnpm-lock.yaml for improved compatibility ([c55145e](https://github.com/wpnuxt/wpnuxt/commit/c55145eeaf1f07804f8fc2ef3bd625100f60343e))

### Tests

* **errors:** add unit tests for WPNuxt error handling and utility functions ([083fd25](https://github.com/wpnuxt/wpnuxt/commit/083fd25729f0f16b894bcea48396c75eeafd1b45))

## [2.0.0-alpha.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.3...v2.0.0-alpha.4) (2025-12-28)

### Features

* **composables:** enhance useWPContent with advanced caching options ([df11b7d](https://github.com/wpnuxt/wpnuxt/commit/df11b7dc26d6c32a19eb42c65d6d5c63b2b6888a))
* **composables:** enhance WPNuxt composables with lazy loading and new utility functions ([34c3b1a](https://github.com/wpnuxt/wpnuxt/commit/34c3b1a60e2e5ad227285c95fa60d4cfb6216020))
* **query-options:** add interactive demo for WPNuxt query options ([85c4dfa](https://github.com/wpnuxt/wpnuxt/commit/85c4dfab6e0f8cbbe4910548181c70f2c7050800))
* **query-options:** enhance lazy loading behavior description and UI ([3cb4228](https://github.com/wpnuxt/wpnuxt/commit/3cb42288630d51dcfb5e50bf6ea4e1d3f1b2b3a0))
* **routes:** replace lazy loading page with query options demo ([b24b9b5](https://github.com/wpnuxt/wpnuxt/commit/b24b9b5c5f746beee15852d413a53d9bdd413bf3))

### Documentation

* **caching:** enhance caching documentation with detailed explanations and examples ([352254e](https://github.com/wpnuxt/wpnuxt/commit/352254efa50d537d4693c76b8cc8e425def77cbc))

### Maintenance

* **package:** add publishConfig for public access ([d9c3125](https://github.com/wpnuxt/wpnuxt/commit/d9c3125cee13af96a0362adaf21f19e68a4b0b15))
* update Nuxt configuration URLs and browser redirect ([41330bd](https://github.com/wpnuxt/wpnuxt/commit/41330bdd61e5d1aad7fcdaab6a91dc8c18f50900))

## [2.0.0-alpha.3](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.2...v2.0.0-alpha.3) (2025-12-27)

### Features

* **auth:** enhance WPNuxt configuration and improve devtools integration ([e190e84](https://github.com/wpnuxt/wpnuxt/commit/e190e84068fd9dcbacd100c828639e3ae3eefff6))
* **auth:** update login and logout functions to use $fetch directly ([5b52cbd](https://github.com/wpnuxt/wpnuxt/commit/5b52cbd2222a0c55e6be7977e1a5ca318b241f63))
* **component:** enhance BlockComponent to check for registered components before resolving ([3875566](https://github.com/wpnuxt/wpnuxt/commit/3875566f095f239010f5798cf141a85d349dfa3c))
* **docs:** add authentication and troubleshooting sections to configuration documentation ([5492b53](https://github.com/wpnuxt/wpnuxt/commit/5492b53e3492a7026a6ee48f95c6aa9a4429dfec))
* **graphql:** add GraphQL caching options to useWPContent composable ([8ddfe04](https://github.com/wpnuxt/wpnuxt/commit/8ddfe04abd8750979fd7663e859b1b6a0b7879cc))
* **logging:** implement centralized logging utility for WPNuxt Auth ([d3ef665](https://github.com/wpnuxt/wpnuxt/commit/d3ef665a2967a7881e9be3e1a320b16b3bdc2c3d))
* **mcp:** moved the WPNuxt MCP server into the documentation website ([6cbb734](https://github.com/wpnuxt/wpnuxt/commit/6cbb734ecf65ed9444606841d054df1940e1ff2a))
* **migration:** enhance migration tools and documentation for WPNuxt v2 ([2e563b7](https://github.com/wpnuxt/wpnuxt/commit/2e563b7526b17259a934ff90c0916b0b2d116aea))
* **migration:** new migration mcp tool for WPNuxt v2 and enhance migration documentation ([af4f8b7](https://github.com/wpnuxt/wpnuxt/commit/af4f8b75e48ca7e935d44d79edfbc428492703c4))
* **module:** implement WPGraphQL Content Blocks plugin validation and add skipPluginCheck option ([b25e713](https://github.com/wpnuxt/wpnuxt/commit/b25e71330c75b44c22a6ea0873fbee64bf9fd893))
* **playgrounds:** reworked full playground ([4eb9602](https://github.com/wpnuxt/wpnuxt/commit/4eb9602c2b857fff5c65f38b59849887dbf1ea78))

### Refactoring

* **generate:** remove lazy variants from query composables and update related imports ([7ba7d44](https://github.com/wpnuxt/wpnuxt/commit/7ba7d441ee942e7d207772e5d3dcdeb7848ad9e2))
* **graphql:** streamline imports and enhance error handling in GraphQL plugins ([07b9737](https://github.com/wpnuxt/wpnuxt/commit/07b973711e0035e882437a68a4ca50447794eaab))
* **module:** migrate file system operations to async/await pattern ([5344346](https://github.com/wpnuxt/wpnuxt/commit/53443462d1455fc37cd41d6e90e58cca5b176700))

### Documentation

* update CLAUDE.md to include new guidelines for committing and running servers ([ee85aef](https://github.com/wpnuxt/wpnuxt/commit/ee85aef850b65ded4c02576c47cccfdd245db728))
* update fetching data and custom queries sections to clarify lazy loading options ([b1b8d99](https://github.com/wpnuxt/wpnuxt/commit/b1b8d994853610943ce1b3384398d26125eb60e8))

### Maintenance

* add nuxt-remote configuration to .mcp.json ([319d2c9](https://github.com/wpnuxt/wpnuxt/commit/319d2c99874112427b967d73d4bcc8b9e96b4295))
* remove mcp-toolkit module and add build completion hook ([1d10ce1](https://github.com/wpnuxt/wpnuxt/commit/1d10ce1aa8eb53fb6c2b06678e46c7e7e4599f3d))
* trigger redeploy ([5b61e53](https://github.com/wpnuxt/wpnuxt/commit/5b61e536a059d11c5372c31c03baedad87593b3d))
* update dependencies and remove unused TypeScript configuration ([db50b1d](https://github.com/wpnuxt/wpnuxt/commit/db50b1db5e2136ef69f9312aa7a050d60ba8904c))
* update MCP client implementation to lazy-load SDK and improve build process ([d0b9ffb](https://github.com/wpnuxt/wpnuxt/commit/d0b9ffbbf2cda028161b4b8b9efb841a984a3fcc))
* update pnpm-lock.yaml to remove unused dependencies and update package versions ([1e0f83a](https://github.com/wpnuxt/wpnuxt/commit/1e0f83aa2fa32ac2b87bfa5778b1985e3965c68d))

## [2.0.0-alpha.2](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.1...v2.0.0-alpha.2) (2025-12-25)

### Features

* **auth:** add comprehensive authentication documentation ([49ce855](https://github.com/wpnuxt/wpnuxt/commit/49ce855e3960b8ae9eb03badd6014a8a000ecf89))
* **auth:** add user data persistence with cookies ([d2c8288](https://github.com/wpnuxt/wpnuxt/commit/d2c82883a7c3caa6310d6d704843275539b9319e))
* **auth:** enhance authentication module with OAuth and Headless Login support ([f82ce48](https://github.com/wpnuxt/wpnuxt/commit/f82ce48a9302ce5e522ca7be485d9aca41f08d71))
* **auth:** enhance authentication queries and file management ([8aa007d](https://github.com/wpnuxt/wpnuxt/commit/8aa007d8a5c4970e724b51ae0c7257db569ca970))
* **auth:** implement schema validation for authentication capabilities ([24fb6a4](https://github.com/wpnuxt/wpnuxt/commit/24fb6a4fa0e34fb67d74da703a424fd222ecdb9d))
* **auth:** integrate Headless Login and enhance user profile management ([a00da62](https://github.com/wpnuxt/wpnuxt/commit/a00da6259df68d0e1a8ff7c2813ba7e6826d66bd))
* **docs:** add initial documentation structure and configuration for WPNuxt ([d259865](https://github.com/wpnuxt/wpnuxt/commit/d259865f989b2120bafb5cabd6847b512d515238))
* **graphql:** add new schema files for core, blocks, and full playgrounds ([560223e](https://github.com/wpnuxt/wpnuxt/commit/560223e4bd9439bfad44c8ff0e8db1469c54fef4))
* **mcp:** add MCP server configuration for nuxt-ui-remote ([cbba810](https://github.com/wpnuxt/wpnuxt/commit/cbba8101b37121946d9b80f26a5516df03ebae38))

### Refactoring

* rename basic playground to core playground and update related scripts and documentation ([6847f13](https://github.com/wpnuxt/wpnuxt/commit/6847f13b894ce722d625c8e9a69c18fefb13fe80))

### Documentation

* **claude:** add development rules and guidelines for code contributions ([f5d9141](https://github.com/wpnuxt/wpnuxt/commit/f5d9141523d32763d2e7b085c605827c410f8421))

### Maintenance

* **dependencies:** update nuxt-graphql-middleware to version 5.3.1 and lib0 to version 0.2.116 in pnpm-lock.yaml and package.json ([8780dc8](https://github.com/wpnuxt/wpnuxt/commit/8780dc81674f90497a6dda5a1ca65e4b3c0d9f89))
* enhance app configuration with new color scheme ([5cebe69](https://github.com/wpnuxt/wpnuxt/commit/5cebe69a552195c8ff2b35de063b64f78e418b18))
* update compatibility date to December 25, 2025, across multiple configuration files and remove outdated GraphQL schema files ([a70e4f8](https://github.com/wpnuxt/wpnuxt/commit/a70e4f801f5071e87d72f2e4b7cfc731ade3124a))

## 2.0.0-alpha.1 (2025-12-23)

### Features

* **auth:** add WPNuxt authentication module with GraphQL support ([4320837](https://github.com/wpnuxt/wpnuxt/commit/4320837d84d7b904604fdbf9a5e3f6c4c9eb42d3))
* **blocks:** add CoreDetails block component and update sanitization methods ([ecf1525](https://github.com/wpnuxt/wpnuxt/commit/ecf1525a2a1e75106937396e857a24984b7c554e))
* **blocks:** introduce @wpnuxt/blocks package for rendering WordPress Gutenberg blocks in Nuxt ([5b68202](https://github.com/wpnuxt/wpnuxt/commit/5b68202b7e22007e700d19bb2857b2e1e24c9dc7))
* **blocks:** introduce new block components and enhance module configuration ([79dd73e](https://github.com/wpnuxt/wpnuxt/commit/79dd73e16b48bf0323d9b05f37326c20ad7ffebf))
* **core:** add build configuration and default options for GraphQL middleware ([ffaee6c](https://github.com/wpnuxt/wpnuxt/commit/ffaee6cd4ce64519a9f93be4c88b5ae97e12048b))
* **generate:** enhance composable generation for queries and mutations ([2973d66](https://github.com/wpnuxt/wpnuxt/commit/2973d66052f4f29b676ba122a1c9737b5668eed7))
* **graphql:** enhance debugging capabilities with Nuxt DevTools and add GraphQL error handling ([c9ff684](https://github.com/wpnuxt/wpnuxt/commit/c9ff684e9dbf94adaaedce003af852796efe6d13))
* **graphqlMiddleware:** add default client options for GraphQL middleware ([f45a4c7](https://github.com/wpnuxt/wpnuxt/commit/f45a4c7ea3f3619b2eb43b8e9679c50a9412cacd))
* **graphqlMiddleware:** add default server options for GraphQL middleware with cookie and auth header forwarding ([be39f83](https://github.com/wpnuxt/wpnuxt/commit/be39f83e5c2d24dba236c05c7948514de2d95b38))
* **mcp:** enable async context in Nuxt configuration and refine tool descriptions ([7d23713](https://github.com/wpnuxt/wpnuxt/commit/7d237130a1a4fadb70d3a88074fc14e9e74514ef))
* **mcp:** enhance MCP server configuration and documentation ([3b877db](https://github.com/wpnuxt/wpnuxt/commit/3b877dbdd8cc18626f61a5719bb0283e85a279d2))
* **mcp:** enhance MCP server functionality and documentation ([93bd095](https://github.com/wpnuxt/wpnuxt/commit/93bd09555852f52115877b6497e950e2623f7bca))
* **mcp:** enhance MCP server with new tools and improved documentation ([c82e201](https://github.com/wpnuxt/wpnuxt/commit/c82e2013e09fc08e018876f13b73a34be3009ae5))
* **mcp:** implement WPNuxt MCP server for WordPress integration ([c55f912](https://github.com/wpnuxt/wpnuxt/commit/c55f91229f08fc2b9a195093c5ca7b5653f58891))
* **migration:** add comprehensive migration guide from WPNuxt 1.x to 2.x ([1004caa](https://github.com/wpnuxt/wpnuxt/commit/1004caa020bdf01e89d8bd4fb07d80917c80ee77))
* **module:** enhance WPNuxt branding and API route configuration ([0e98ff0](https://github.com/wpnuxt/wpnuxt/commit/0e98ff05fbadbd051032a4ad3181b72e13d9dfb6))
* **playgrounds:** enhance playground configurations ([b952388](https://github.com/wpnuxt/wpnuxt/commit/b9523888f421a5ef850278a1be53ecb291f9e058))

### Bug Fixes

* **graphqlConfig:** improve type definition for onRequest options ([777a89e](https://github.com/wpnuxt/wpnuxt/commit/777a89e617ca2dc126e96de820617b532c57907d))
* **module:** correct error logging syntax in GraphQL server options ([16ffc47](https://github.com/wpnuxt/wpnuxt/commit/16ffc475647a558d1445e6e0bb6424db1259c6d1))
* **module:** improve route rules and error handling in GraphQL plugin ([79bc93d](https://github.com/wpnuxt/wpnuxt/commit/79bc93d135964d536f7c8771e6d87bb657591ef4))
* **module:** update GraphQL middleware route and improve path resolution for composables generation ([7c9d726](https://github.com/wpnuxt/wpnuxt/commit/7c9d72651136e1d0caaf35725adec4bcb4e7c8c2))
* **nuxt.config:** improve reactive data fetching in page components ([60dc4ad](https://github.com/wpnuxt/wpnuxt/commit/60dc4ad64552064c6a0f0e127c4f9c9959d46876))
* update data fetching in page components for improved reactivity ([580ac75](https://github.com/wpnuxt/wpnuxt/commit/580ac75aaa47e31d54de53d0783c30a680950329))

### Refactoring

* **mcp:** improve code formatting and cleanup ([c432eea](https://github.com/wpnuxt/wpnuxt/commit/c432eea921291dfa1190b673659cb24621dac484))
* **mcp:** remove unused introspection tool and streamline query generation ([1371e67](https://github.com/wpnuxt/wpnuxt/commit/1371e67b6c11ebed80a2e5238e03729351db60a5))
* **mergeQueries:** update mergeQueries function to accept resolver parameter for improved path resolution ([54f2542](https://github.com/wpnuxt/wpnuxt/commit/54f2542f98bd7b2266a6e78c524ee3e09c4f5db2))

### Documentation

* **MONOREPO-PLAN:** update blocks package section with migration tasks ([c4ab84c](https://github.com/wpnuxt/wpnuxt/commit/c4ab84c5d228855051f166c1c16a4878f8124250))
* **MONOREPO-PLAN:** update feature porting section and clarify intentionally skipped components ([2cfc935](https://github.com/wpnuxt/wpnuxt/commit/2cfc935e2ed57832743740848231026fa568a8ee))

### Maintenance

* bump version to 2.0.0-alpha.1 for wpnuxt and @wpnuxt/core packages ([78fbad7](https://github.com/wpnuxt/wpnuxt/commit/78fbad7bef324702a5c842321aecafe10ecd220b))
* **ci:** add environment variable for WordPress URL and update type check command ([3b0fcac](https://github.com/wpnuxt/wpnuxt/commit/3b0fcac1ba3cfb5852d6f90bca3b52664f13780f))
* **ci:** streamline CI workflow by removing redundant environment variables ([c26e0d8](https://github.com/wpnuxt/wpnuxt/commit/c26e0d87ffa47c49b787eeb28207e06965efe6c8))
* **dependencies:** update package versions in wpnuxt-init script ([fb3c583](https://github.com/wpnuxt/wpnuxt/commit/fb3c58305e632cdf6be22199d3f9b77d9bd06221))
* **docs:** remove nuxt-graphql-middleware integration improvements document ([e3ea5f5](https://github.com/wpnuxt/wpnuxt/commit/e3ea5f5faadd105a9f3a74a23dcee968ed4daf68))
* **release:** configure conventional changelog plugin to ignore recommended bumps ([97b3a5f](https://github.com/wpnuxt/wpnuxt/commit/97b3a5fa0c97dfd5cf689a9a17978cabaa270492))
* **release:** downgrade package versions to 2.0.0-alpha.0 ([7626a21](https://github.com/wpnuxt/wpnuxt/commit/7626a21433b350bff8517a1d4a1b960196ed5a3e))
* **release:** update release-it configuration and add bumper plugin ([e6d4e1a](https://github.com/wpnuxt/wpnuxt/commit/e6d4e1a97a5021ddc6a1551af5082b7260703439))
* **tsconfig:** exclude MCP package from playground TypeScript configurations ([921154e](https://github.com/wpnuxt/wpnuxt/commit/921154e3b92e0975221661a53f4f4fb5ec89f834))
* update compatibility dates in Nuxt configuration files ([3aef519](https://github.com/wpnuxt/wpnuxt/commit/3aef51916882fa1c8a8451d906277230b68fb1bf))
* update dependencies - ([4998f71](https://github.com/wpnuxt/wpnuxt/commit/4998f71c5f10eea4c359581b778e3d0708d50eae))
* update dependencies - ([a4f2e24](https://github.com/wpnuxt/wpnuxt/commit/a4f2e24e0071d509ad59e0f7bed992d48d3a6be0))
* update dependencies - ([678a12e](https://github.com/wpnuxt/wpnuxt/commit/678a12ee551abeb553352dbde436efb4b9c379a1))
* update dependencies - nuxt 4.0.3, etc ([f800132](https://github.com/wpnuxt/wpnuxt/commit/f800132a5efae842b95b7d5e63af82e6dba80717))
* update package dependencies and versions ([a90e568](https://github.com/wpnuxt/wpnuxt/commit/a90e568ef91b4dac718e02d73258ddcb2331282c))
* update project configuration, simplify setup ([3935af7](https://github.com/wpnuxt/wpnuxt/commit/3935af701b79615362aa950bfcc00e3b24aced40))

### Tests

* **core:** add unit tests for configuration validation and context preparation ([c4c4653](https://github.com/wpnuxt/wpnuxt/commit/c4c4653f085225c6cffdae7003134210d59dd4d8))

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive error handling for GraphQL parser
- URL validation in image path utilities
- JSDoc documentation for composables
- Unit tests for parser, image utils, and utilities (24 tests total)
- `.env.example` file for environment configuration
- Comprehensive README with usage examples
- TypeScript import for `OperationTypeNode`
- PERFORMANCE.md documentation
- Error handling for file stats in query generation
- Husky pre-commit hooks with lint-staged
- GitHub Actions CI/CD pipeline

### Changed
- **Performance: 43% faster module initialization** (5340ms → 3023ms)
- Improved async/await consistency in composables
- Optimized query parsing with parallel file reads
- Simplified `randHashGenerator` function
- Fixed configuration property naming (aligned `extendFolder` and `mergedOutputFolder`)
- Updated README with real features and usage examples
- Cached regex patterns for file filtering
- Optimized type collection using Set directly
- Cached path resolutions in query merging
- Improved config validation using native methods
- Reduced string concatenations in code generation

### Fixed
- Type safety issues (removed `any` types, added proper imports)
- Configuration inconsistencies between types and defaults
- Error handling for invalid GraphQL documents
- Image URL parsing edge cases
- Redundant condition in findData function
- Unnecessary await on object literal

### Removed
- Commented-out dead code in utils
- Unused `getQueryTypeTemplate` helper function

## [1.0.0] - Previous Release

### Added
- Initial release
- WordPress GraphQL integration via WPGraphQL
- Auto-generated composables from GraphQL queries
- Type-safe TypeScript support
- Query merging system
- Default queries for posts, pages, menus
- Image path transformation utilities
- DOMPurify integration
- Client-side caching

[Unreleased]: https://github.com/wpnuxt/wpnuxt/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/wpnuxt/wpnuxt/releases/tag/v1.0.0
