# Changelog

All notable changes to this project will be documented in this file. 🤘

## [2.0.0-rc.2](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/compare/diff?targetBranch=refs%2Ftags%2Fv2.0.0-rc.1&sourceBranch=refs%2Ftags%2Fv2.0.0-rc.2&targetRepoId=234) (2022-09-26)

### 🐛 Bug Fixes

- update jose, fix vulnerability GHSA-jv3g-j58f-9mq9 ([#87](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/87/overview)) - EBSIINT-4750 ([ba3ef83](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/ba3ef83ee76a9e5fd98363a725516a9815c14bc9))

## [2.0.0-rc.1](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/compare/diff?targetBranch=refs%2Ftags%2Fv2.0.0-rc.0&sourceBranch=refs%2Ftags%2Fv2.0.0-rc.1&targetRepoId=234) (2022-09-12)

### 🚀 Features

- add custom scheme parameter to /issuer-mock/initiate and /tnt-mock/authentication-requests ([#70](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/70/overview)) - EBSIINT-4575 ([c68aca5](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/c68aca548da8494a07a950b8521ca159ff0cc54e))
- add integration with loki db and cache for 15 minutes ([#69](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/69/overview)) - EBSIINT-4562 ([50865ee](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/50865eefae0e68074a06b8072642d05a57490bb2))
- add timeout to http requests ([#68](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/68/overview)) - EBSIINT-4529 ([68c5445](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/68c54452943e612ae1ca1e7a7080a9b61355728f))
- analyze logs and provide tests results ([#82](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/82/overview)) - EBSIINT-4655 ([eadc60e](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/eadc60e8e6bb8fdcd0ffb7b08d722154223a3738))
- parse Loki logs ([#73](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/73/overview)) - EBSIINT-4580 ([ff6ed87](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/ff6ed879cf3bf1feab6af826661da395627236ce))

### 🐛 Bug Fixes

- accept "application/json" request content type for Credential Request ([#79](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/79/overview)) - EBSIINT-4627 ([201acd7](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/201acd76026e30fd9264acf84372a2c154672400))
- change Loki endpoint URL on testnet ([#76](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/76/overview)) - EBSIINT-4597 ([60eb7e3](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/60eb7e37aac633efc6283961baa013e51dcdd65e))
- fix logs analysis ([#83](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/83/overview)) - EBSIINT-4655 ([a633ca3](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/a633ca320b337e327892e574dd9669d5481b6afd))
- fix logs parsing ([#77](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/77/overview)) - EBSIINT-4597 ([b97d408](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/b97d408d7d0401fc088d09b9a863a19df3413389))
- fix vulnerability `GHSA-wc69-rhjr-hc9g` ([#66](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/66/overview)) - EBSIINT-4439 ([a88d630](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/a88d630aeda6490bac84b09eba4758a63cf58704))
- update URLs to conformance environment ([#74](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/74/overview)) - EBSIINT-4563 ([3988a0f](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/3988a0fdea1437b2c0492f167a53da916a8aea4a))

## [2.0.0-rc.0](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/compare/diff?targetBranch=refs%2Ftags%2Fv1.0.0-rc.0&sourceBranch=refs%2Ftags%2Fv2.0.0-rc.0&targetRepoId=234) (2022-06-16)

### ⚠ BREAKING CHANGES

- follow new presentation exchange guidelines.

### 🐛 Bug Fixes

- redirect when /issuer-mock/authorize is called with redirect_uri ([#38](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/38/overview)) - EBSIINT-3813 ([32a9766](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/32a97663a7a858b948267e4832b43a5264a3a9a5))
- remove request parameter from /tnt-mock/authentication-requests response ([#47](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/47/overview)) - EBSIINT-4180 ([4fd664e](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/4fd664e7d76ceb8ec5fb05e2cfe560c55ecb2094))
- replace "openid_initiate_issuance" scheme with "openid" ([#45](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/45/overview)) - EBSIINT-4179 ([b8b43c8](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/b8b43c8e63fd7f74f9dcac9760c7760c75e96eda))
- update /issuer-mock/initiate and /tnt-mock/authentication-requests endpoints ([#46](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/46/overview)) - EBSIINT-4180 ([0ab5373](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/0ab53733c3f3df4a97a6dac6385441a2d54a3775))

### 🚀 Features

- add new GET /issuer-mock/initiate endpoint ([#39](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/39/overview)) - EBSIINT-4136 ([eb95fd9](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/eb95fd9ce94b845510723321f923e7981643151c))
- align /issuer-mock/credential endpoint with specs ([#41](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/41/overview)) - EBSIINT-4162 ([e2779ba](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/e2779ba04e86ad6487737ee9d0b6f5aac3132641))
- bump dependencies ([#54](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/54/overview)) - EBSIINT-4238 ([c48b591](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/c48b591dbd88e3a98767af70b962ca94126c892a))
- enable notifications, use latest apis - EBSIINT-4199 ([e039810](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/e0398100438e918657c0c15f2abf0a0f6c674286))
- expose conformance logs ([#42](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/42/overview)) - EBSIINT-4163 ([cfa1660](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/cfa166024b595db417da76f3566a4599c24fde33))
- follow presentation exchange guidelines v2 ([#35](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/35/overview)) - EBSIINT-3912 ([2779f39](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/2779f395aed5ac53e08df8d2e84099304daaef69))
- make authorization_details required ([#43](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/43/overview)) - EBSIINT-4142 ([8c450a4](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/8c450a474e346056187d509bc887ecc4ed190b90))
- support conformance uuid and different credential types in /issuer-mock/initiate endpoint ([#40](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/pull-requests/40/overview)) - EBSIINT-4158 ([b6cacc4](https://ec.europa.eu/digital-building-blocks/code/projects/EBSI/repos/conformance-api/commits/b6cacc467fb2a415332ad16d362f8cd6f2a5be4b))
