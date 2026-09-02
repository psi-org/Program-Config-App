## [3.1.1](https://github.com/psi-org/Program-Config-App/compare/v3.1.0...v3.1.1) (2026-08-12)

### Bug Fixes

- fix duplicated DE Prefix validation when creating new programs ([3bf0c47](https://github.com/psi-org/Program-Config-App/commit/3bf0c478387dcdbf4fabcd10f823d141f4411bba))

## [3.1.0](https://github.com/psi-org/Program-Config-App/compare/v3.0.0...v3.1.0) (2026-08-05)

### Features

- implement auto add OUs to H1 transfer target program [PCA-26] ([df6d826](https://github.com/psi-org/Program-Config-App/commit/df6d82674982d7745a295a093c39fd10cf3df163))
- improve H1 Transfer UX/UI to display errors w/o crashing [PCA-25] ([561325c](https://github.com/psi-org/Program-Config-App/commit/561325c334990a7dff0749e36cdb7ed3a1a84106))

### Bug Fixes

- address old tracker format for H1 data transfer [PCA-24] ([c13ee20](https://github.com/psi-org/Program-Config-App/commit/c13ee2047359210ad04eb2c97332bc3cdbfd2c70))
- address Program Stage not refreshing after changes [PCA-29] ([8a6f2cc](https://github.com/psi-org/Program-Config-App/commit/8a6f2ccadddec038b8452af96e8896dff456f6b9))
- notify when missing access to H1 transfer events [PCA-28] ([659cefd](https://github.com/psi-org/Program-Config-App/commit/659cefda789fe356b700a028e82940c6b133b2ef))
- remove validation errors when importing new templates [PCA-27] ([99aaaac](https://github.com/psi-org/Program-Config-App/commit/99aaaac9424ac0d31ab32611e9e506d2560ce727))

## [3.0.0](https://github.com/psi-org/Program-Config-App/compare/v2.0.7...v3.0.0) (2026-06-29)

### ⚠ BREAKING CHANGES

- Removed support for the HNQIS MWI implementation, based on v2.0.7

### Features

- add support for new HNQIS 3.0 version [PCA-11] ([a3283f2](https://github.com/psi-org/Program-Config-App/commit/a3283f25b62d52e98f3c4a0ef5efce73e763255c))
- implement new feedback rules generation [PCA-4] ([388f3ee](https://github.com/psi-org/Program-Config-App/commit/388f3ee67bd5254b5fe7468f9ffd163fc4db6790))
- support H1 to H3 checklist conversion [PCA-11] ([c7df72a](https://github.com/psi-org/Program-Config-App/commit/c7df72acc5a23b9b77e6cf341d5879a6b0d4eb74))
- support semantic release notes ([42870ce](https://github.com/psi-org/Program-Config-App/commit/42870ce6c1bff22aedcf8fb067c831fe82ca1ad9))

### Bug Fixes

- address duplicate Competency Class after settings change [PCA-14] ([9f49711](https://github.com/psi-org/Program-Config-App/commit/9f497116638201fe2c8e06e2f0cc2105c482e2b5))
- address PCA stuck when deleting missing D2 metadata [PCA-13] ([1614e94](https://github.com/psi-org/Program-Config-App/commit/1614e9457f15ebaede9f049d24c57714956a8597))
- fix missing Option and Legend Sets in download new template [PCA-6] ([f02cbd8](https://github.com/psi-org/Program-Config-App/commit/f02cbd8ffa2d6fce9c465292fcbaf551d3cba99f))
- fix New/Edit Program compatibility for prefix validation ([b480331](https://github.com/psi-org/Program-Config-App/commit/b4803316eb11a836fd22978138d7819a111d5372))
