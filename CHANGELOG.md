# Changelog

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
