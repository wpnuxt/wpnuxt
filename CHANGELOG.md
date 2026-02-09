# Changelog

## [2.0.0-alpha.12](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.11...v2.0.0-alpha.12) (2026-02-09)

### Features

* add remote image patterns to Vercel configuration ([66368de](https://github.com/wpnuxt/wpnuxt/commit/66368decb8b63b988a1ccf1bfe064fdb4d4004e7))
* update Vercel image configuration ([4ac857e](https://github.com/wpnuxt/wpnuxt/commit/4ac857e34554750223719613ac7667ac0c7c5f68))

### Maintenance

* remove development paths from package.json for server and client options ([d457ff0](https://github.com/wpnuxt/wpnuxt/commit/d457ff06b45c62b9a421613b57375d56f8172c74))
* remove unused image provider configuration ([d06cd7c](https://github.com/wpnuxt/wpnuxt/commit/d06cd7cce7b25ea8b56badcdface6fee6697ffa6))
* update @wpnuxt/core version in .nuxtrc files ([368258a](https://github.com/wpnuxt/wpnuxt/commit/368258a024fc47f46358c1ea31d46d6048d00888))

## [2.0.0-alpha.11](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2026-02-09)

### Features

* add development entry points for server and client options ([bb9afad](https://github.com/wpnuxt/wpnuxt/commit/bb9afad5f39cfba17bd3607aed3eaef6518099ca))
* add imageRelativePaths config option ([8d0fddc](https://github.com/wpnuxt/wpnuxt/commit/8d0fddc312ee33c615cc152f21d334e1d333bfd3))
* add schemaAuthToken for authenticated schema introspection ([#208](https://github.com/wpnuxt/wpnuxt/issues/208)) ([a0da704](https://github.com/wpnuxt/wpnuxt/commit/a0da704e3fe2354a1a95b130d0354a4677148b43)), closes [#37](https://github.com/wpnuxt/wpnuxt/issues/37)
* add Tailwind CSS typography plugin and update dependencies ([bc61b86](https://github.com/wpnuxt/wpnuxt/commit/bc61b86d48c1548cbaba2ffb5ec388dbcf3d82fa))
* add WPContent component for client-side navigation of internal links ([9f3f1d7](https://github.com/wpnuxt/wpnuxt/commit/9f3f1d73bb66e26daf0c6aee2dc6f04fe24af75f)), closes [#116](https://github.com/wpnuxt/wpnuxt/issues/116)
* enhance block components in playgrounds ([b46f6c3](https://github.com/wpnuxt/wpnuxt/commit/b46f6c33165a318b92a596ceb0feae569f38b7d1))
* integrate Nuxt Image module and enhance menu handling ([d2793f9](https://github.com/wpnuxt/wpnuxt/commit/d2793f93ddf085db0dac8cc0df5f3c226a50411d))

### Bug Fixes

* **core:** use type-specific GraphQL fields in PageByUri/PostByUri queries ([1fa08d5](https://github.com/wpnuxt/wpnuxt/commit/1fa08d5eb8bbba28e612a90279d042358b4dc2b0))

### Documentation

* add comprehensive guide on how WPNuxt works ([265b0ed](https://github.com/wpnuxt/wpnuxt/commit/265b0ed76ebe85ecee7c8c07ff93d85106bf2879))
* add deprecation notice pointing to wpnuxt/wpnuxt monorepo ([80172fc](https://github.com/wpnuxt/wpnuxt/commit/80172fcb0259db2235ed63e68409c93440a563e2))
* enhance WordPress setup and troubleshooting sections ([fe8cb21](https://github.com/wpnuxt/wpnuxt/commit/fe8cb21e57c87de4b7fe2bb8593e79755f20c7e4))
* enhance WPNuxt documentation with new guides and updates ([841b3bf](https://github.com/wpnuxt/wpnuxt/commit/841b3bf8ef52315bfdcd44302dab79f5009dc614))
* update README and setup documentation for WPNuxt v2 alpha ([ae5295a](https://github.com/wpnuxt/wpnuxt/commit/ae5295a2c6288f4fe796d3392055780a1cd822b9))
* update WPContent documentation and configuration details ([0f6f21d](https://github.com/wpnuxt/wpnuxt/commit/0f6f21dc6e548539acabbdc9c3859702550a7709))

### Maintenance

* **docs:** move docs to content subfolder, so edit links and references from the docus docs app will be correct ([bb59427](https://github.com/wpnuxt/wpnuxt/commit/bb594272c3ba850688fae68249940136e786511c))
* trigger deployment after repo rename ([c711cdd](https://github.com/wpnuxt/wpnuxt/commit/c711cdd779a7a745736400e43fd58f8c9a2f127e))
* update dependencies across multiple packages ([0629745](https://github.com/wpnuxt/wpnuxt/commit/0629745a8c6a924de13c666e8bf5c3e24426d2de))
## [1.0.0-edge.31](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2025-12-18)

### Maintenance

* **release:** release v1.0.0-edge.31 ([037dfc6](https://github.com/wpnuxt/wpnuxt/commit/037dfc6bcccf898dbf06e194e7d2d12b5e3950ef))
* update dependencies and upgrade Nuxt to 4.2.2 and @nuxt/ui to 4.3.0 ([f4d7fa7](https://github.com/wpnuxt/wpnuxt/commit/f4d7fa71671dfa291d677964557281b9e4fdd6e2))
## [1.0.0-edge.30](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2025-05-04)

### Bug Fixes

* **useWPContent:** prevent undefined access in findData function ([#205](https://github.com/wpnuxt/wpnuxt/issues/205)) ([3dd47dd](https://github.com/wpnuxt/wpnuxt/commit/3dd47dd38c577bae66e2ecc7c8721bf502546a63))

### Maintenance

* update dependencies - nuxt-graphql-middleware v5, nuxt 3.17.1, etc ([3877104](https://github.com/wpnuxt/wpnuxt/commit/38771042e813be0140501e07c5a718637fc29ced))
## [1.0.0-edge.27](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2025-03-13)

### Maintenance

* update dependencies - ([2953a2c](https://github.com/wpnuxt/wpnuxt/commit/2953a2ca93c399a42e3796178e9ff25530f3cda5))
* update dependencies - nuxt 3.16.0, etc ([42095d9](https://github.com/wpnuxt/wpnuxt/commit/42095d9844e6fea6a81da21fe1abdaad9a0e9747))
## [1.0.0-edge.26](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2025-01-09)

### Maintenance

* update dependencies - ([0d18fc0](https://github.com/wpnuxt/wpnuxt/commit/0d18fc0381c11fb8b3a582001fd5bd5e04d5a355))
* update dependencies - ([fc0bea6](https://github.com/wpnuxt/wpnuxt/commit/fc0bea619802a081546de035b1573a994b1130bd))
## [1.0.0-edge.25](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-12-23)

### Maintenance

* update dependencies - ([efba306](https://github.com/wpnuxt/wpnuxt/commit/efba30673dd8fb171af4abc8b2840a3461d8d69a))
## [1.0.0-edge.24](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-10-20)

### Maintenance

* update dependencies - nuxt-graphql-middleware ([c4a9829](https://github.com/wpnuxt/wpnuxt/commit/c4a982924ae867f8d496a771a3a30de02890e6fb))
## [1.0.0-edge.23](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-09-21)

### Maintenance

* update dependencies - nuxt 3.13.2 & other dependency updates ([2e541f4](https://github.com/wpnuxt/wpnuxt/commit/2e541f41d45cf2c89bdd642d69d7e947bdef6a87))
## [1.0.0-edge.22](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-09-04)

### Maintenance

* update dependencies - nuxt 3.13.1 ([92fa631](https://github.com/wpnuxt/wpnuxt/commit/92fa63151b1ee19f526dfa1c37806528d9b54c88))
## [1.0.0-edge.21](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-30)
## [1.0.0-edge.20](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-30)
## [1.0.0-edge.19](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-30)
## [1.0.0-edge.18](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-29)
## [1.0.0-edge.17](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-29)
## [1.0.0-edge.14](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-25)
## [1.0.0-edge.13](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-24)
## [1.0.0-edge.12](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-23)

### Maintenance

* **release:** release v1.0.0-edge.12 ([f2bed30](https://github.com/wpnuxt/wpnuxt/commit/f2bed30444493fac2ee8ce4e8ebded0cdc4bd4c1))
* update dependencies - upgrade to nuxt 3.13.0 ([5d9e0cc](https://github.com/wpnuxt/wpnuxt/commit/5d9e0ccfa8577d77e8bd0840a9cf9d8ed7e6587a))
## [1.0.0-edge.11](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-19)
## [1.0.0-edge.10](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-19)
## [1.0.0-edge.9](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-19)
## [1.0.0-edge.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-18)

### Maintenance

* update dependencies - ([701d8ce](https://github.com/wpnuxt/wpnuxt/commit/701d8ce9fddb63c430e7ec7c6db3dd21111c8fdf))
* update dependencies - ([145d8a4](https://github.com/wpnuxt/wpnuxt/commit/145d8a40d935eb6e8040d7d313c946051bf27200))
## [1.0.0-edge.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-16)

### Documentation

* installation ([99dcfb7](https://github.com/wpnuxt/wpnuxt/commit/99dcfb750f0cefc7d7c1904761e561780aa715a6))

### Maintenance

* update dependencies - ([5407f9b](https://github.com/wpnuxt/wpnuxt/commit/5407f9b6bfe7fbc2755e0bda7e4868157759b030))
## [1.0.0-edge.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-12)
## [1.0.0-edge.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-11)

### Maintenance

* update dependencies - ([ab131f1](https://github.com/wpnuxt/wpnuxt/commit/ab131f119ed535ce19c91d93905ea7909df336de))
## [1.0.0-edge.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-10)

### Maintenance

* **deps:** update all non-major dependencies ([#171](https://github.com/wpnuxt/wpnuxt/issues/171)) ([ce3cded](https://github.com/wpnuxt/wpnuxt/commit/ce3cded7cd1b3c8071e8bfe3d5904d8cf9e6a496))
* **deps:** update dependency @vueuse/nuxt to ^10.11.1 ([#174](https://github.com/wpnuxt/wpnuxt/issues/174)) ([a6c1adc](https://github.com/wpnuxt/wpnuxt/commit/a6c1adcd0c89387d053afb9566228d3f02fba165))
## [0.5.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-04)

### Maintenance

* **release:** release v0.5.8 ([0609ab4](https://github.com/wpnuxt/wpnuxt/commit/0609ab4b9b5b7c51afe8b4187c130edf7bd7cc98))
## [0.5.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-04)

### Maintenance

* **deps:** update all non-major dependencies ([#168](https://github.com/wpnuxt/wpnuxt/issues/168)) ([0218605](https://github.com/wpnuxt/wpnuxt/commit/02186054c36722d048089719a447d86b6d68b992))
* **release:** release v0.5.7 ([2e97947](https://github.com/wpnuxt/wpnuxt/commit/2e979476d56a912462226eeab9be8a7f337c885a))
## [0.5.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-08-01)

### Maintenance

* **deps:** update all non-major dependencies to ^4.19.2 ([#159](https://github.com/wpnuxt/wpnuxt/issues/159)) ([affc876](https://github.com/wpnuxt/wpnuxt/commit/affc87656e1ed2cee616cecc3e6adfec5a8cd7e2))
* **deps:** update devdependency @nuxt/test-utils to ^3.14.0 ([#163](https://github.com/wpnuxt/wpnuxt/issues/163)) ([cfd417d](https://github.com/wpnuxt/wpnuxt/commit/cfd417d079fdcf461efab3e9d5b84fc276efbe6d))
* **release:** release v0.5.6 ([7723c31](https://github.com/wpnuxt/wpnuxt/commit/7723c3154560d10d6bb4fc830590c10c47e6a0df))
* update dependencies - ([ce3c1ee](https://github.com/wpnuxt/wpnuxt/commit/ce3c1ee93d639a014d819a268d439be218b04a1b))
* update dependencies - ([d717e0e](https://github.com/wpnuxt/wpnuxt/commit/d717e0e293e445edb1a20d5862d703055179589e))
* update dependencies - ([29d66d0](https://github.com/wpnuxt/wpnuxt/commit/29d66d0afc409336339db21c772fc1441c5e5693))
* update dependencies - ([705650a](https://github.com/wpnuxt/wpnuxt/commit/705650a0cbb9f0b5a882d1e8d5599c1b2f05fb8a))
* update dependencies - nuxt-graphql-middleware 4.1.1 ([fd47665](https://github.com/wpnuxt/wpnuxt/commit/fd47665adf8138d046f8db633c083f2d63d54247))
## [0.5.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-07-26)

### Maintenance

* **release:** release v0.5.5 ([cae5531](https://github.com/wpnuxt/wpnuxt/commit/cae5531115d9b488650a18f0be71e6d60796b238))
## [0.5.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-07-15)

### Maintenance

* **deps:** @wordpress/env:10.3.0 ([4c2de80](https://github.com/wpnuxt/wpnuxt/commit/4c2de808477ab18d02236b75984bf9b1e30a376c))
* **release:** release v0.5.4 ([7e89fa9](https://github.com/wpnuxt/wpnuxt/commit/7e89fa907487926ca04b207d20b3c3aea371e2d3))
## [0.5.3](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-07-09)

### Maintenance

* **deps:** update all non-major dependencies ([#150](https://github.com/wpnuxt/wpnuxt/issues/150)) ([3a5429d](https://github.com/wpnuxt/wpnuxt/commit/3a5429d9e0cfdd2cce047ca1e36a277bb8da93f9)), closes [#152](https://github.com/wpnuxt/wpnuxt/issues/152)
* **deps:** update vitest monorepo to v2 (major) ([857cd57](https://github.com/wpnuxt/wpnuxt/commit/857cd572a952f991de88b95c23ef165f5741e290))
* **release:** release v0.5.3 ([5ac4bbd](https://github.com/wpnuxt/wpnuxt/commit/5ac4bbdc9bfd3d9393d8c9ac19b5fd89ad834734))
## [0.5.2](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-07-05)

### Maintenance

* **deps:** update all non-major dependencies ([#136](https://github.com/wpnuxt/wpnuxt/issues/136)) ([80aaacd](https://github.com/wpnuxt/wpnuxt/commit/80aaacd478f6077f872c406a1777dfa0fcb20884))
* **deps:** update all non-major dependencies ([#142](https://github.com/wpnuxt/wpnuxt/issues/142)) ([4b1eedc](https://github.com/wpnuxt/wpnuxt/commit/4b1eedc07c233442c28dd09420c5a9690c2bfae5))
* **release:** release v0.5.2 ([7552dac](https://github.com/wpnuxt/wpnuxt/commit/7552dac69f75a1cd30908090d202544a8665cad4))
## [0.5.1](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-06-22)

### Maintenance

* **release:** release v0.5.1 ([626f128](https://github.com/wpnuxt/wpnuxt/commit/626f128c93484be156d6234f06a9ca762c8a269e))
## [0.5.0](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-06-22)

### Maintenance

* **deps:** update all non-major dependencies ([#129](https://github.com/wpnuxt/wpnuxt/issues/129)) ([220eab4](https://github.com/wpnuxt/wpnuxt/commit/220eab4fe29c4e5ac8e2695df6e3cbc10a38e26f))
* **release:** release v0.5.0 ([09c2f6e](https://github.com/wpnuxt/wpnuxt/commit/09c2f6e037aece160eaf28b5c8285bd0128f9abd))
## [0.4.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-06-17)

### Maintenance

* **deps:** Nuxt 3.12.1 ([8b61270](https://github.com/wpnuxt/wpnuxt/commit/8b61270bd801534d3eec48faf998ab87a00d551c))
* **deps:** update all non-major dependencies ([#126](https://github.com/wpnuxt/wpnuxt/issues/126)) ([dfec370](https://github.com/wpnuxt/wpnuxt/commit/dfec37045ef3dac4442b2d87149daaf057624029))
* **deps:** update devdependency @nuxthq/studio to v2 ([#128](https://github.com/wpnuxt/wpnuxt/issues/128)) ([e6b1cdc](https://github.com/wpnuxt/wpnuxt/commit/e6b1cdcf70453dac22e08e7d4f7b3c951ee1a4f3))
* **deps:** update nuxt framework to ^3.12.2 ([#127](https://github.com/wpnuxt/wpnuxt/issues/127)) ([16b0633](https://github.com/wpnuxt/wpnuxt/commit/16b063301be2740b3662507a082f55af8e8a3889))
* **release:** release v0.4.4 ([e5b396c](https://github.com/wpnuxt/wpnuxt/commit/e5b396c60a43410cde85a5e046626861d6f772e3))
* **release:** release v0.4.4-edge.5 ([33d7a58](https://github.com/wpnuxt/wpnuxt/commit/33d7a5804850778019911923642422f3fe86448d))
* **release:** release v0.4.4-edge.7 ([fab5f9e](https://github.com/wpnuxt/wpnuxt/commit/fab5f9ede699ca0d33531fe8e3cc7e9067fd9108))
## [0.4.4-edge.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-30)

### Maintenance

* **deps:** update all non-major dependencies ([#119](https://github.com/wpnuxt/wpnuxt/issues/119)) ([e3f76e0](https://github.com/wpnuxt/wpnuxt/commit/e3f76e04810fa7e19e182be54fde9f6563d9791a))
* **deps:** update devdependency @types/node to v20.12.13 ([#123](https://github.com/wpnuxt/wpnuxt/issues/123)) ([8c57c72](https://github.com/wpnuxt/wpnuxt/commit/8c57c72ab49b11d28550d3e71e15528b9929ab21))
* **release:** release v0.4.4-edge.2 ([373ca20](https://github.com/wpnuxt/wpnuxt/commit/373ca2041897d38d5052753cc2c6e91b1a6f90a6))
* **release:** release v0.4.4-edge.4 ([0af7edd](https://github.com/wpnuxt/wpnuxt/commit/0af7edd1c74574970ad120c95e51c7e24defe934))
## [0.4.3](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-26)

### Maintenance

* **release:** release v0.4.3 ([3d0b72f](https://github.com/wpnuxt/wpnuxt/commit/3d0b72f925ff9da52503607f97bfe92954f6c34e))
## [0.4.2](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-26)

### Maintenance

* **deps:** update all non-major dependencies ([#111](https://github.com/wpnuxt/wpnuxt/issues/111)) ([fee7b55](https://github.com/wpnuxt/wpnuxt/commit/fee7b55423e3c93db8cd657469170a5500cbec62))
* **deps:** update all non-major dependencies to ^4.18.0 ([#113](https://github.com/wpnuxt/wpnuxt/issues/113)) ([bd22628](https://github.com/wpnuxt/wpnuxt/commit/bd226289bc632635859e7539f2668ea1547daaad))
* **deps:** update devdependency @nuxt/module-builder to ^0.7.0 ([#114](https://github.com/wpnuxt/wpnuxt/issues/114)) ([93dd750](https://github.com/wpnuxt/wpnuxt/commit/93dd7509f4afb9194c47d6ab191aaa266425a958))
* **deps:** update devdependency @nuxt/test-utils to ^3.13.1 ([#112](https://github.com/wpnuxt/wpnuxt/issues/112)) ([bb89cdb](https://github.com/wpnuxt/wpnuxt/commit/bb89cdbab3d2aca2fedebd468f7412b7c50752e9))
* **release:** release v0.4.2 ([c4a90be](https://github.com/wpnuxt/wpnuxt/commit/c4a90be309396cdd646d0325734505a5738641c4))
## [0.4.1](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-18)

### Maintenance

* **release:** release v0.4.1 ([4eea4b7](https://github.com/wpnuxt/wpnuxt/commit/4eea4b71c58fb0fa574931584d58b227a4147e0c))
## [0.4.0](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-18)

### Maintenance

* **deps:** update all non-major dependencies ([#104](https://github.com/wpnuxt/wpnuxt/issues/104)) ([458079e](https://github.com/wpnuxt/wpnuxt/commit/458079ec595f3139394617d0bdac1687902ee058))
* **deps:** update devdependency @nuxt/test-utils to ^3.13.0 ([#103](https://github.com/wpnuxt/wpnuxt/issues/103)) ([6957dac](https://github.com/wpnuxt/wpnuxt/commit/6957dacdf4965075997b1d325ef37b43fd54adaf))
* **deps:** update devdependency vue-tsc to ^2.0.18 ([#102](https://github.com/wpnuxt/wpnuxt/issues/102)) ([42cc510](https://github.com/wpnuxt/wpnuxt/commit/42cc510b73ce0092ba8b84624c74d0faf8167b2b))
* **release:** release v0.4.0 ([d2a3c77](https://github.com/wpnuxt/wpnuxt/commit/d2a3c7750910e39dd9bec2d9839a18563c8bb517))
## [0.3.11](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-14)

### Maintenance

* **deps:** update all non-major dependencies to ^0.3.12 ([#83](https://github.com/wpnuxt/wpnuxt/issues/83)) ([d34420c](https://github.com/wpnuxt/wpnuxt/commit/d34420c356b8f0d28985e68c1140d56b4f5ca6fd))
* **deps:** update devdependency @nuxt/devtools to ^1.3.1 ([#89](https://github.com/wpnuxt/wpnuxt/issues/89)) ([ef2da29](https://github.com/wpnuxt/wpnuxt/commit/ef2da29ea9c570726329dd78e378854eff9f44be))
* **deps:** update devdependency @types/node to v20.12.12 ([#97](https://github.com/wpnuxt/wpnuxt/issues/97)) ([552346c](https://github.com/wpnuxt/wpnuxt/commit/552346c1abceb06da24107678988f0bc360333d9))
* **deps:** update devdependency vue-tsc to ^2.0.17 ([#86](https://github.com/wpnuxt/wpnuxt/issues/86)) ([cd5ca35](https://github.com/wpnuxt/wpnuxt/commit/cd5ca35687f471815876700547b80010ccfaebd6))
* **release:** release v0.3.11 ([cdeb9ab](https://github.com/wpnuxt/wpnuxt/commit/cdeb9ab9e0936720e49bb91fb4c783d78e95316c))
## [0.3.10](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-09)

### Maintenance

* **release:** release v0.3.10 ([d77181d](https://github.com/wpnuxt/wpnuxt/commit/d77181d64cf583b6f01d3337c598cfe8d56f2743))
## [0.3.9](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-05-08)

### Maintenance

* **deps:** update all non-major dependencies ([#70](https://github.com/wpnuxt/wpnuxt/issues/70)) ([1039124](https://github.com/wpnuxt/wpnuxt/commit/10391247eda1e1cb7fc03cc1a9127baf33a25432))
* **deps:** update all non-major dependencies ([#72](https://github.com/wpnuxt/wpnuxt/issues/72)) ([9c3270e](https://github.com/wpnuxt/wpnuxt/commit/9c3270e4ec4bdfaed96d185fd9325669d6f21fb7))
* **deps:** update devdependency @types/node to v20.12.11 ([#77](https://github.com/wpnuxt/wpnuxt/issues/77)) ([6a4a24f](https://github.com/wpnuxt/wpnuxt/commit/6a4a24f63417bbfa3a6cdfbc666034943cccd53c))
* **deps:** update node.js to v22 ([#71](https://github.com/wpnuxt/wpnuxt/issues/71)) ([6d4c8d1](https://github.com/wpnuxt/wpnuxt/commit/6d4c8d1b0960a6adfbce81c29fe87f7f09e35531))
* **release:** release v0.3.9 ([ff11230](https://github.com/wpnuxt/wpnuxt/commit/ff1123032292b86df25206257078c4ecbd96f364))
* **release:** v0.3.8 ([d508794](https://github.com/wpnuxt/wpnuxt/commit/d508794183e5e9a0ebc15de8926f2b5895d79eab))
## [0.3.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-25)

### Maintenance

* **release:** v0.3.7 ([695df6a](https://github.com/wpnuxt/wpnuxt/commit/695df6a4c7dc8c6065ac0f1e4622c3cb5ef5fc22))
## [0.3.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-24)

### Maintenance

* **release:** v0.3.6 ([bada49d](https://github.com/wpnuxt/wpnuxt/commit/bada49d981a826d7756938bcb49cb1537f60f693))
## [0.3.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-24)

### Maintenance

* **deps:** update all non-major dependencies ([#66](https://github.com/wpnuxt/wpnuxt/issues/66)) ([f1a1a39](https://github.com/wpnuxt/wpnuxt/commit/f1a1a39995ec192e4829babcb835158085703e60))
* **release:** v0.3.5 ([8ff0720](https://github.com/wpnuxt/wpnuxt/commit/8ff07203124bd0ffdd4972ca538b416c77a7d1d6))
## [0.3.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-24)

### Maintenance

* **release:** v0.3.4 ([d9768ba](https://github.com/wpnuxt/wpnuxt/commit/d9768baee5ee692b7b3bd5d1aaab9d119ee82821))
## [0.3.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-18)
## [0.3.2](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-16)

### Maintenance

* **deps:** update devdependency @nuxt/test-utils to ^3.12.1 ([#60](https://github.com/wpnuxt/wpnuxt/issues/60)) ([4d0f25e](https://github.com/wpnuxt/wpnuxt/commit/4d0f25ea0794f12dd80c752b82e64b1ce95f4745))
* **release:** v0.3.1 ([b3da3e0](https://github.com/wpnuxt/wpnuxt/commit/b3da3e037265aaca85f022226c264c37f8a4acea))
* **release:** v0.3.2 ([2eb8be8](https://github.com/wpnuxt/wpnuxt/commit/2eb8be8740c20979d228851d4cec25df011b1c94))
## [0.3.1](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-16)

### Maintenance

* **release:** v0.2.21 ([6d1460c](https://github.com/wpnuxt/wpnuxt/commit/6d1460c7e7de0f054705d014840afd51154bf6bc))
## [0.2.21](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-15)

### Maintenance

* **release:** v0.2.20 ([7cad8c2](https://github.com/wpnuxt/wpnuxt/commit/7cad8c2b10ca6f31c29e02e681fc300e07b86994))
## [0.2.20](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-10)

### Maintenance

* **release:** v0.2.19 ([b2a297e](https://github.com/wpnuxt/wpnuxt/commit/b2a297eba27727ea2af186cf8f6b72526322a102))
## [0.2.19](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-10)

### Maintenance

* **release:** v0.2.18 ([23e3159](https://github.com/wpnuxt/wpnuxt/commit/23e3159d774885c4b5e8c49895268f452a126584))
## [0.2.18](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-10)

### Maintenance

* **release:** v0.2.17 ([3fec241](https://github.com/wpnuxt/wpnuxt/commit/3fec241c1a0f319187816d7a66cedbd9114ab00c))
## [0.2.17](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-10)

### Maintenance

* **deps:** update all non-major dependencies ([#46](https://github.com/wpnuxt/wpnuxt/issues/46)) ([69c45de](https://github.com/wpnuxt/wpnuxt/commit/69c45de0821b14a9f8afd10883ed3635f335c10d))
* **deps:** update all non-major dependencies ([#54](https://github.com/wpnuxt/wpnuxt/issues/54)) ([73ba61c](https://github.com/wpnuxt/wpnuxt/commit/73ba61c03efe9424970f7e8c21ae1a8757160843))
* **deps:** update dependency nuxt-og-image to v3 ([1942104](https://github.com/wpnuxt/wpnuxt/commit/19421049bf18a04f6eaa178f3b0bf0507c38fa06))
* **deps:** update nuxt framework to ^3.11.2 ([#52](https://github.com/wpnuxt/wpnuxt/issues/52)) ([bd6a160](https://github.com/wpnuxt/wpnuxt/commit/bd6a16009f831c9ca18e0030e276fb56db825ee7))
* **release:** v0.2.16 ([d1c0b04](https://github.com/wpnuxt/wpnuxt/commit/d1c0b04269482be52aaeefa8d5edb70dc53368f4))
## [0.2.16](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-03)

### Maintenance

* **release:** v0.2.15 ([d929485](https://github.com/wpnuxt/wpnuxt/commit/d92948530ec5d0122860ea1f60b24cedd505dcb0))
## [0.2.15](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-04-02)

### Maintenance

* **deps:** update all non-major dependencies ([#44](https://github.com/wpnuxt/wpnuxt/issues/44)) ([a0ad5c8](https://github.com/wpnuxt/wpnuxt/commit/a0ad5c828e814c4cd9a996dee20ddb14b5db7b6c))
* **release:** v0.2.14 ([b65afb5](https://github.com/wpnuxt/wpnuxt/commit/b65afb546b6db791d4924599b3e3cb188c6b46c4))
## [0.2.14](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-27)

### Maintenance

* **deps:** update node.js to v21.7 ([#36](https://github.com/wpnuxt/wpnuxt/issues/36)) ([9b6750a](https://github.com/wpnuxt/wpnuxt/commit/9b6750abc87b2ef416225cc2dc2b0265ac87981d))
* **release:** v0.2.12 ([d9cd094](https://github.com/wpnuxt/wpnuxt/commit/d9cd094e7b57be6785bd552ae626a50b4838a664))
* **release:** v0.2.13 ([765ab34](https://github.com/wpnuxt/wpnuxt/commit/765ab34416d40555190219d17238be066f6313b4))
## [0.2.12](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-19)

### Maintenance

* **release:** v0.2.11 ([791ba62](https://github.com/wpnuxt/wpnuxt/commit/791ba62308960ae936436748dd25f8fd38120e98))
## [0.2.11](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-19)

### Maintenance

* package updates nuxt 3.11.1 ([52588c2](https://github.com/wpnuxt/wpnuxt/commit/52588c2962d743eb88ebe4933cd606e8dcec15b7))
* package updates regenerated lock file ([9434549](https://github.com/wpnuxt/wpnuxt/commit/943454969db850f5e61c3710543c90deac40a37a))
* **release:** v0.2.10 ([042be40](https://github.com/wpnuxt/wpnuxt/commit/042be4028cbf66a5cfbc1cdce565a5b7c5d8758b))
## [0.2.10](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-18)

### Maintenance

* package updates ([003a7b4](https://github.com/wpnuxt/wpnuxt/commit/003a7b4fbd2c673ca33d977d6cb73e3235f1d29b))
* package updates nuxt 3.11.0 ([4c88971](https://github.com/wpnuxt/wpnuxt/commit/4c88971fb5074927dd688a4177bf0ed5511b9603))
* **release:** v0.2.9 ([21a80bb](https://github.com/wpnuxt/wpnuxt/commit/21a80bbc0ad971b97cf6367fc2e87595dc17354c))
## [0.2.9](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-12)

### Maintenance

* package updates ([bc729dd](https://github.com/wpnuxt/wpnuxt/commit/bc729ddb2eb180f950392b227733b2c5804e7d49))
* **release:** v0.2.8 ([8b17da0](https://github.com/wpnuxt/wpnuxt/commit/8b17da02e696fb966357244e627ffdf6e934eb11))
## [0.2.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-04)

### Maintenance

* **release:** v0.2.6 ([2e3314d](https://github.com/wpnuxt/wpnuxt/commit/2e3314d13c914938adc3ed32a5e84ef9437f2079))
* **release:** v0.2.7 ([f6e4f5c](https://github.com/wpnuxt/wpnuxt/commit/f6e4f5cf7c46057192d409b378f63ce10ffa2011))
## [0.2.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-04)
## [0.2.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-03)

### Maintenance

* **deps:** update devdependency vue-tsc to ^2.0.3 ([#25](https://github.com/wpnuxt/wpnuxt/issues/25)) ([53ce5e3](https://github.com/wpnuxt/wpnuxt/commit/53ce5e34c9c85b7c3387dbd65d32a53db8e0c222))
* **release:** v0.2.1 ([ac88b6c](https://github.com/wpnuxt/wpnuxt/commit/ac88b6cc8a18165b206cc06547680e366a726154))
## [0.2.1](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-02)

### Maintenance

* **release:** v0.2.0 ([4d13885](https://github.com/wpnuxt/wpnuxt/commit/4d1388595dfb8510f56563c6c5fd17546e64e8ff))
## [0.1.32](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-02)

### Maintenance

* **release:** v0.1.32 ([7db5899](https://github.com/wpnuxt/wpnuxt/commit/7db5899ddbd5aabad8bd6433a2c271f1f118c7a4))
## [0.1.31](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-02)

### Maintenance

* **deps:** update devdependency playwright-core to ^1.42.1 ([677bc4f](https://github.com/wpnuxt/wpnuxt/commit/677bc4fa8324a4796d53c1c6a43c85325cd4aef5))
* **deps:** update devdependency vue-tsc to v2 ([967bd91](https://github.com/wpnuxt/wpnuxt/commit/967bd91bf1d53b899dbdbb8446c291546a3ba0b5))
* **deps:** update slack orb to v4.13.1 ([214ba46](https://github.com/wpnuxt/wpnuxt/commit/214ba46ec4ba8aa12295730da7ca682f1ac38c67))
* **release:** v0.1.29 ([3e596d1](https://github.com/wpnuxt/wpnuxt/commit/3e596d13dde95bd70440a3a11174e734a9313c39))
* **release:** v0.1.30 ([3ed91e7](https://github.com/wpnuxt/wpnuxt/commit/3ed91e7f8208530e50a25af8b77c9f40016bd45d))
* **release:** v0.1.31 ([6057202](https://github.com/wpnuxt/wpnuxt/commit/60572026dd8562ebca2fb35614cbdefe90dcf6e8))
## [0.1.29](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-03-01)

### Maintenance

* package updates ([a5cfe41](https://github.com/wpnuxt/wpnuxt/commit/a5cfe41b95830a9d9a04a9a9140f5079f194533d))
* package updates ([89068ac](https://github.com/wpnuxt/wpnuxt/commit/89068ac1926dd569d69556e05b3eea6100a2d68c))
* package updates ([5460777](https://github.com/wpnuxt/wpnuxt/commit/5460777e4ab4a3120d00db7a7bd1d7e906ef6c40))
* package updates ([4ceb2d7](https://github.com/wpnuxt/wpnuxt/commit/4ceb2d7c5f76d6e939ef5f94aa5a8c40b210ed61))
* **release:** v0.1.28 ([e7352c7](https://github.com/wpnuxt/wpnuxt/commit/e7352c79d9efb05be84631fac3257299d7d2521f))
## [0.1.28](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-02-02)

### Maintenance

* package updates ([a9d94c8](https://github.com/wpnuxt/wpnuxt/commit/a9d94c8e7b42253fa1c90bbdf9933a5ec9492418))
* package updates ([f74626f](https://github.com/wpnuxt/wpnuxt/commit/f74626fd43e489147fcfd85f20f8b9074ef3c824))
* **release:** v0.1.27 ([bae9e12](https://github.com/wpnuxt/wpnuxt/commit/bae9e12c79b73c6232cdaeb54f2926e5cbd0dedf))
## [0.1.27](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-20)

### Maintenance

* **release:** v0.1.26 ([f955f6e](https://github.com/wpnuxt/wpnuxt/commit/f955f6ec9952ab87cc1c69ea0fdd0cbf04df0bd9))
## [0.1.26](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-19)

### Maintenance

* **release:** v0.1.25 ([e3adec8](https://github.com/wpnuxt/wpnuxt/commit/e3adec80db772c17db74465f4ce33ad5402e2390))
## [0.1.25](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-19)

### Maintenance

* package updates ([b24b555](https://github.com/wpnuxt/wpnuxt/commit/b24b55542bc98a632ba4ae7b64c927eab839596c))
* package updates ([c6bdcd9](https://github.com/wpnuxt/wpnuxt/commit/c6bdcd947f1cd471e5b4345b25a266e66998d812))
* **release:** v0.1.24 ([41922d6](https://github.com/wpnuxt/wpnuxt/commit/41922d6d459ab15a8c602d8a075fc35f719e1551))
## [0.1.24](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-18)

### Maintenance

* package updates ([745ecac](https://github.com/wpnuxt/wpnuxt/commit/745ecac86f7de3cd6b23bbc0db132a8d20764bb2))
* **release:** v0.1.23 ([0b23343](https://github.com/wpnuxt/wpnuxt/commit/0b2334313ddee77bc4608e2ddb20d6ab2d6d15f6))
## [0.1.23](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-18)

### Maintenance

* **deps:** update node.js to v21.6 ([d36c29d](https://github.com/wpnuxt/wpnuxt/commit/d36c29dd12576315f62e4027bde199d3869ac668))
* **release:** v0.1.22 ([1bf368a](https://github.com/wpnuxt/wpnuxt/commit/1bf368a51d14b99c4baa43d2943e64e5783c9031))
## [0.1.22](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-16)

### Maintenance

* **release:** v0.1.21 ([5443ff1](https://github.com/wpnuxt/wpnuxt/commit/5443ff11fb2867cb249c91dce5ce823840509a27))
## [0.1.21](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-16)

### Maintenance

* **release:** v0.1.20 ([dba766e](https://github.com/wpnuxt/wpnuxt/commit/dba766e142c65e5eddb6d1ad22d7a501e5beffdc))
## [0.1.20](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-15)

### Maintenance

* **release:** v0.1.19 ([d72e353](https://github.com/wpnuxt/wpnuxt/commit/d72e35366987c22df6fe4e69049cde96e217db16))
## [0.1.19](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-15)

### Maintenance

* **release:** v0.1.18 ([1ca70c8](https://github.com/wpnuxt/wpnuxt/commit/1ca70c8261c3d31995f494603818e1c6e6ea0d4d))
## [0.1.18](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-14)

### Maintenance

* **release:** v0.1.17 ([6f78c7b](https://github.com/wpnuxt/wpnuxt/commit/6f78c7ba1a936ef7df1515da737293c444a9fa5f))
## [0.1.17](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-13)

### Maintenance

* **release:** v0.1.16 ([cba987a](https://github.com/wpnuxt/wpnuxt/commit/cba987afb45a17a25b98159d151fe6beeb20017b))
## [0.1.16](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-13)

### Maintenance

* **release:** v0.1.15 ([141dbef](https://github.com/wpnuxt/wpnuxt/commit/141dbef4d1308b5f46d9ec9e77ac7be02d926a95))
## [0.1.15](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-13)

### Maintenance

* package updates ([e5b07dc](https://github.com/wpnuxt/wpnuxt/commit/e5b07dc3f9d6b4970d38ae37354b256f37e2a48a))
* **release:** v0.1.14 ([0982e5b](https://github.com/wpnuxt/wpnuxt/commit/0982e5b23437bfc8b4a180a7d1cc0bc58ecd3e2f))
## [0.1.14](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-13)

### Maintenance

* package updates ([3791437](https://github.com/wpnuxt/wpnuxt/commit/3791437dabe6ecf466a546026ee3d6493553fe86))
* **release:** v0.1.13 ([7c53dea](https://github.com/wpnuxt/wpnuxt/commit/7c53dea5b6f186debc9070ae1276095570d6e172))
## [0.1.13](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-12)

### Maintenance

* package updates ([5ce5e11](https://github.com/wpnuxt/wpnuxt/commit/5ce5e116d0dfdd3348d33677bea1f07d5dfe5ccf))
## [0.1.12](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-12)

### Maintenance

* **release:** v0.1.11 ([be0b623](https://github.com/wpnuxt/wpnuxt/commit/be0b623caa5985782f79925b798b062a0e1c4a08))
* **release:** v0.1.12 ([c458527](https://github.com/wpnuxt/wpnuxt/commit/c45852760be546cd971cdecb8e642466b6b2eb30))
## [0.1.11](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-11)

### Maintenance

* **release:** v0.1.10 ([8f72b80](https://github.com/wpnuxt/wpnuxt/commit/8f72b803f26e3e309dd419e6ecd02f5637a2c759))
## [0.1.10](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-11)

### Maintenance

* **release:** v0.1.9 ([4a49d83](https://github.com/wpnuxt/wpnuxt/commit/4a49d83b9fb43d437fc482e8af70e85eaf88ccd6))
## [0.1.9](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-08)

### Maintenance

* package updates ([97e7546](https://github.com/wpnuxt/wpnuxt/commit/97e7546a3a4800819c1dd22d9aab75c6c068c4cc))
* **release:** v0.1.8 ([8730f92](https://github.com/wpnuxt/wpnuxt/commit/8730f928a43972ef6470514283c51170d0840eaa))
## [0.1.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2024-01-06)

### Maintenance

* **deps:** update dependency nuxt-og-image to v3.0.0-rc.21 ([25673dd](https://github.com/wpnuxt/wpnuxt/commit/25673dd1f7466f9f43316ae15ddd667cbcf79368))
* **deps:** update node.js to v21.5 ([c51201a](https://github.com/wpnuxt/wpnuxt/commit/c51201a5da210b98b474376fef40066fb42d5f0a))
* package updates ([f526162](https://github.com/wpnuxt/wpnuxt/commit/f526162bcb877e9466686da62b17412d786ffcc7))
* package updates ([99f2d86](https://github.com/wpnuxt/wpnuxt/commit/99f2d86076bd25b1485b95649c4c7df57b9c7c4a))
* package updates ([4ba2eba](https://github.com/wpnuxt/wpnuxt/commit/4ba2eba68844a431cea868b73078bd8823d09428))
* package updates ([5559098](https://github.com/wpnuxt/wpnuxt/commit/55590982f851de01ae874d5abeb0c9ee0919b800))
* package updates ([d11a96a](https://github.com/wpnuxt/wpnuxt/commit/d11a96afaa651b782c4c9b25254194edd6c034c1))
* **release:** v0.1.7 ([69ca6ba](https://github.com/wpnuxt/wpnuxt/commit/69ca6ba44d76af56240a36737cd7ae90b48ffb28))
## [0.1.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-12-19)

### Maintenance

* package updates ([2be87fa](https://github.com/wpnuxt/wpnuxt/commit/2be87fa0b56a858fe5462889a60fe82d01be590a))
* package updates ([029df6d](https://github.com/wpnuxt/wpnuxt/commit/029df6dece52ba699dfae31b61c61e01421a46b7))
* package updates ([7ea8957](https://github.com/wpnuxt/wpnuxt/commit/7ea8957697257c4c4fcb54b65ec9d21d6111e773))
* package updates ([4aa08f8](https://github.com/wpnuxt/wpnuxt/commit/4aa08f8b914f2ab31859fd0545e45ded464df185))
* packages updates ([ef2e056](https://github.com/wpnuxt/wpnuxt/commit/ef2e056f0efefb77d0207866e8c4bb8dfe67e61d))
* **release:** v0.1.6 ([ddceff1](https://github.com/wpnuxt/wpnuxt/commit/ddceff14f634d7350e7bae40bdd206405dcaa4df))
## [0.1.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-26)

### Maintenance

* package updates ([c7bb5f4](https://github.com/wpnuxt/wpnuxt/commit/c7bb5f4c7f21f05f15bb99a8105666ce0969fbf8))
* **release:** v0.1.5 ([12028e5](https://github.com/wpnuxt/wpnuxt/commit/12028e54e5849b4027a0848e4a1e8868ac902913))
## [0.1.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-09)

### Maintenance

* **release:** v0.1.4 ([225ee38](https://github.com/wpnuxt/wpnuxt/commit/225ee38dcaef3e5ae1bd2cb947b9d33834842ead))
## [0.1.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-09)

### Maintenance

* **release:** v0.1.3 ([f37fc9c](https://github.com/wpnuxt/wpnuxt/commit/f37fc9c7fa36c8e37cac07d5ec8df3399d25912d))
## [0.1.3](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-09)

### Maintenance

* **release:** v0.1.2 ([f186b4f](https://github.com/wpnuxt/wpnuxt/commit/f186b4fd5c8456620c7019d5d64d97483b0db2cd))
## [0.1.2](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-09)

### Maintenance

* **release:** v0.0.8 ([f878c3b](https://github.com/wpnuxt/wpnuxt/commit/f878c3b3648134a7efa69710556baa88bbe6926b))
* **release:** v0.0.9 ([ac53a81](https://github.com/wpnuxt/wpnuxt/commit/ac53a81d4cda43f1470d58ed6c3871f650f6432b))
* **release:** v0.0.9 ([7c908d7](https://github.com/wpnuxt/wpnuxt/commit/7c908d73e1554cd3185c842e429ed1c0c5d4c026))
* **release:** v0.1.1 ([165815a](https://github.com/wpnuxt/wpnuxt/commit/165815af88efd918e7c7c140477df7fffcef995a))
## [0.0.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-04)

### Maintenance

* **release:** v0.0.7 ([6503da0](https://github.com/wpnuxt/wpnuxt/commit/6503da01a9fc1eb0a70b7c95f7491061e4d7b782))
## [0.0.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-02)

### Maintenance

* **release:** v0.0.6 ([19285a5](https://github.com/wpnuxt/wpnuxt/commit/19285a5ac75d0980ab9dae6f83e7e31dbbe4f7c2))
## [0.0.6](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-02)

### Maintenance

* **release:** v0.0.5 ([233d202](https://github.com/wpnuxt/wpnuxt/commit/233d202f0adcb16eb1c68e3c0ec8e7de96141a63))
## [0.0.5](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-02)

### Maintenance

* package updates ([0d64539](https://github.com/wpnuxt/wpnuxt/commit/0d64539f7cc0f5731bfeeb2314f5abd086f44d09))
* **release:** v0.0.4 ([e88b4af](https://github.com/wpnuxt/wpnuxt/commit/e88b4af472e167242b6ca261b1a119252eac95fb))
## [0.0.4](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.10...v2.0.0-alpha.11) (2023-11-02)

### Maintenance

* package updates ([4fb51fe](https://github.com/wpnuxt/wpnuxt/commit/4fb51fe9ddd07792b1687c5f8cfd8ba6d094c4c6))
* package updates ([96c2035](https://github.com/wpnuxt/wpnuxt/commit/96c2035c78fc561ddf322b06d7548bb95ba42563))
* package updates ([bf23f9f](https://github.com/wpnuxt/wpnuxt/commit/bf23f9fb2b2e29091d2ddede7e9d2df225891697))
* package updates ([46c8ff4](https://github.com/wpnuxt/wpnuxt/commit/46c8ff424b2a30dcd66edaed952f91c2577e67ea))
* **release:** v0.0.2 ([da52837](https://github.com/wpnuxt/wpnuxt/commit/da528375e3ee859a729fec598282740d409564a3))
* **release:** v0.0.3 ([0e3af66](https://github.com/wpnuxt/wpnuxt/commit/0e3af6676b0f094e8f3945fd7a7bd166b91a13a0))

## [2.0.0-alpha.10](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.9...v2.0.0-alpha.10) (2026-02-05)

### Features

* **auth:** improve validation for headless login and password features ([92613ff](https://github.com/wpnuxt/wpnuxt/commit/92613ff06279c5dba9b7d49f48f929fada2f2259))
* **content:** implement stable caching functions for SSG support in useWPContent ([8c87296](https://github.com/wpnuxt/wpnuxt/commit/8c8729674ae23c8f63c6c6f4d9a2a9d9b8306116))
* **docs:** add comprehensive documentation for WPNuxt setup and features ([f644cff](https://github.com/wpnuxt/wpnuxt/commit/f644cff28416c1af5cfdb77d7eaf5b05b7c0744a))
* **setup:** add WPNuxt local development configuration and demo content ([52bc196](https://github.com/wpnuxt/wpnuxt/commit/52bc1967adf3853c030573b015d970c0ddb3ed51))

### Maintenance

* **release-it:** update release hooks to streamline build process ([047cf61](https://github.com/wpnuxt/wpnuxt/commit/047cf61bdafa28143835a999c2327607ac31b867))
* update @wpnuxt/core version to 2.0.0-alpha.9 in multiple .nuxtrc files ([4e88b3c](https://github.com/wpnuxt/wpnuxt/commit/4e88b3cf161ae2df5e43fe614460c7245a40ee31))

## [2.0.0-alpha.9](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.8...v2.0.0-alpha.9) (2026-02-05)

### Features

* **blocks:** add environment configuration files and custom GraphQL queries documentation ([a303a20](https://github.com/wpnuxt/wpnuxt/commit/a303a209572d2bd4fc2cbcb896ecce6345b90260))
* **module:** enhance setup process with logging and validation utilities ([228b5d4](https://github.com/wpnuxt/wpnuxt/commit/228b5d455aff53f1bcfd2a56bab2d5db4942d1ef))
* **module:** enhance WordPress URL configuration checks in setupEnvFiles ([ab3dec4](https://github.com/wpnuxt/wpnuxt/commit/ab3dec482f9926a426d46c04b72687be8f0ca8c9))
* **module:** onInstall hook to enhance setup process with MCP configuration and environment file prompts ([df11a65](https://github.com/wpnuxt/wpnuxt/commit/df11a65d27b972f126390d1772f3d225a63bac3b))

### Refactoring

* **module:** move setup tasks to separate install.ts file ([1774a13](https://github.com/wpnuxt/wpnuxt/commit/1774a13a94a8c5b0166c28d2484523a0683aff6d))

### Maintenance

* **dependencies:** update @types/node to version 25.2.1 across multiple packages and bump @iconify-json/lucide to version 1.2.88 in playgrounds ([0b27ba4](https://github.com/wpnuxt/wpnuxt/commit/0b27ba420175b0051aa3692ae9a68de051f4ca47))

## [2.0.0-alpha.8](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.7...v2.0.0-alpha.8) (2026-01-29)

### Features

* **auth, blocks, core:** improve type definitions ([7fc2f15](https://github.com/wpnuxt/wpnuxt/commit/7fc2f15c993f0f33cc45e604b98eca19cb83ac40))
* **auth:** add E2E tests and update dependencies ([50d8e78](https://github.com/wpnuxt/wpnuxt/commit/50d8e78fb9c2201c1a3653f1ae933fb0b9772e06))
* enhance SSG support and URI normalization ([813b690](https://github.com/wpnuxt/wpnuxt/commit/813b690cf624483362f11fd2bae5818013a93456))
* **migration:** update @wpnuxt/auth module and composables ([c263dbe](https://github.com/wpnuxt/wpnuxt/commit/c263dbe4b79ce2be31567b18cf6f70f7ab35c0d3))
* **nuxt.config:** add Vercel SSG preset for static site generation ([6a5aa6b](https://github.com/wpnuxt/wpnuxt/commit/6a5aa6be668b70a9a3d4353d6f949bc8604cd3ad))
* **playgrounds:** add Vercel build configuration ([f5362da](https://github.com/wpnuxt/wpnuxt/commit/f5362da4e9de2eb4a5c2de8cf592c11d440d8ca2))
* **vercel-build:** add module build commands for WPNuxt ([f2a4e3b](https://github.com/wpnuxt/wpnuxt/commit/f2a4e3bab4869797d6f3418747b5cfe1febab9de))

### Bug Fixes

* **graphql:** new downloaded graphql schema ([6f2d084](https://github.com/wpnuxt/wpnuxt/commit/6f2d084dc09ec9505c9d5af12cdec75d9f00734a))

### Refactoring

* **content:** reorganize data transformation utilities ([1bf3571](https://github.com/wpnuxt/wpnuxt/commit/1bf3571d78d64c6a55a4e9f689ec8cd6bb7acfe0))
* **docs:** move docus app to a separate repo, keep content in docs folder ([#7](https://github.com/wpnuxt/wpnuxt/issues/7)) ([2ab4bef](https://github.com/wpnuxt/wpnuxt/commit/2ab4bef5b91c264030529585948109906916a1c6))
* **generate:** enhance type handling for queries and fragments ([d9028d6](https://github.com/wpnuxt/wpnuxt/commit/d9028d6e53b3e00725e634e96d0c2b689934b8cd))
* **playgrounds:** remove @nuxtjs/mdc and update content rendering ([7e02841](https://github.com/wpnuxt/wpnuxt/commit/7e02841dd2ad7386f16e6570fda23bfa15b08e12))

### Maintenance

* **docs:** moved landing page to wpnuxt-docs repo ([781e431](https://github.com/wpnuxt/wpnuxt/commit/781e43168373a1f244d941cf1aec724942b6afaa))
* fix vercel deployments: add @shikijs/engine-javascript dependency to multiple package.json files ([761b697](https://github.com/wpnuxt/wpnuxt/commit/761b697c2158e73000864da22953090739bb8f5b))
* fix vercel shiki hoisting for docs deployment ([a1913ff](https://github.com/wpnuxt/wpnuxt/commit/a1913ff838eff134fe9edd7fec0de8b8ef7239fc))
* update dependencies and package versions ([5fba859](https://github.com/wpnuxt/wpnuxt/commit/5fba8596c8677ace15e836ecc09d6c15d6329470))
* update package dependencies across playgrounds ([fb4531f](https://github.com/wpnuxt/wpnuxt/commit/fb4531f59ab287e28e6a3468551e5d733318df75))

### Tests

* **useWPContent:** add comprehensive tests for useWPContent composable ([d42f142](https://github.com/wpnuxt/wpnuxt/commit/d42f14284a8a1f011c5de949d1ad067753369520))

## [2.0.0-alpha.7](https://github.com/wpnuxt/wpnuxt/compare/v2.0.0-alpha.6...v2.0.0-alpha.7) (2026-01-17)

### Bug Fixes

* **auth:** fixed typecheck errors ([cb843ba](https://github.com/wpnuxt/wpnuxt/commit/cb843bae6198b371ed4cb4b9faa26fdaac1cd754))
* **useWPContent:** safeguard against undefined static data access ([57aef3c](https://github.com/wpnuxt/wpnuxt/commit/57aef3c7b5c1d761cb32896475adbbfad03f2fcb))

### Refactoring

* **useWPContent:** streamline caching logic and enhance SSG support ([7d0a958](https://github.com/wpnuxt/wpnuxt/commit/7d0a9586b3d68bbce93dd2a152578555fa810628))

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
