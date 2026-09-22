# Source review — repo-map

## Revision and method

Inspected public commit: [`2da896208a236526aeb4508ed5a3d3ae83c9258a`](https://github.com/NickCirv/repo-map/commit/2da896208a236526aeb4508ed5a3d3ae83c9258a). Source tree: `a06feef8070af3ceb83e5f4eeb5d7f344f861a3a`. Capture scope: all eligible text files; 14 of 14 eligible files.

This review read captured implementation and documentation. It did not install dependencies, execute project commands, call project APIs, check package publication or establish live CI status. Examples are source-derived, not captured execution transcripts.

## Claim ledger

| Claim | Evidence | Status |
| --- | --- | --- |
| CLI arguments and formats | [bin/map.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/bin/map.js) | Verified in inspected source; execution unverified |
| Output writes | [src/analyzer.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/analyzer.js) | Verified in inspected source; execution unverified |
| Manifest parsers and age heuristics | [src/dependencies.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/dependencies.js) | Verified in inspected source; execution unverified |
| Bounded Git hotspot collection | [src/hotspots.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/hotspots.js) | Verified in inspected source; execution unverified |

## Findings and verification gaps

This is an onboarding starting point, not a semantic architecture graph. Import/function counts and circular hints use text analysis. Dependency age flags are heuristics, not live registry checks. Git hotspot summaries are bounded by the selected history window and may be incomplete in shallow clones. Markdown generation writes a file and can replace an existing report.

The captured smoke test only asks Node to syntax-check the entrypoint. It does not exercise behavior, integrations or failure paths. Neither that test nor installation was run in this review.

| Dimension | Result |
| --- | --- |
| Purpose and documented commands | Partially verified: static source inspection |
| Clean installation and examples | Unverified |
| Test suite and live CI | Unverified |
| Performance and security guarantees | Unverified |
| Publication | Local documentation only |

## Documentation inventory

- [README.md](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/README.md) — Rewritten; historic section anchors retained where practical.
- [LICENSE](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/LICENSE) — protected document preserved unchanged.

## Captured source inventory

- [LICENSE](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/LICENSE) — Git blob `05b804beeec7d1a6c933d087387ba4adf6463d93`.
- [README.md](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/README.md) — Git blob `4290cade29a232dd8c764d72b60b0c0e0e5245fb`.
- [package.json](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/package.json) — Git blob `280090c1993b390852248fdf23f6e231136d1701`.
- [.github/workflows/ci.yml](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/.github/workflows/ci.yml) — Git blob `44515034a394670de44454a7a1bd2c7ef0c9836e`.
- [bin/map.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/bin/map.js) — Git blob `c0f234f1efbe7f85b961476fe0a0dda899955421`.
- [src/analyzer.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/analyzer.js) — Git blob `8aaf47aa784e28e0158843d860dfc4b1fb3a0ba2`.
- [src/complexity.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/complexity.js) — Git blob `20179bf4afbd82cb6b3ab3761fa13f7dca812708`.
- [src/dependencies.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/dependencies.js) — Git blob `6b98687110da8d2dd0d21a914307face14a55d5d`.
- [src/formatter.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/formatter.js) — Git blob `fcb12290f19a3c3f75a48ae940ebed1d421c9de2`.
- [src/generator.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/generator.js) — Git blob `12f7a6de701fc986606d8ef5466a04a664d23253`.
- [src/hotspots.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/hotspots.js) — Git blob `b24a02fe1637b6cd4e45278b9961b1e6fb9041c8`.
- [src/index.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/index.js) — Git blob `46212cdae1a45349e0f74e7c67acda2d19d9f7bd`.
- [src/structure.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/structure.js) — Git blob `893e10c921c8940b0eff1dd881e4230c145c21a3`.
- [test/smoke.test.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/test/smoke.test.js) — Git blob `8fa0a03db8414475b89dcdaf7f98cf763758e59b`.

## Scope boundary

Capture excludes lockfiles, binary artwork, generated output, vendored dependencies and files above the acquisition size limit. The tree records their existence; no verification claim is made for omitted content. Protected documents and historical records are not replaced.

## Reference coverage

Added [command reference](REFERENCE.md) from the argument parser, command handlers and source-defined help at the pinned revision. README examples remain unexecuted.
