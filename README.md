![repo-map — Nicholas Ashkar editorial artwork](assets/nicholas-ashkar/banner.png)

# repo-map

Produce an initial navigation report for a local codebase.

Combines directory structure, manifest dependencies, recent Git change hotspots and text-based complexity hints into terminal, JSON or Markdown output.




<a id="install"></a>

<a id="quick-stats"></a>

<a id="start-here-path"></a>

## Quickstart

Package runtime requirement: Node.js `>=20`. Git is needed to obtain this pinned source checkout.

```bash
git clone https://github.com/NickCirv/repo-map.git
cd repo-map
git checkout 2da896208a236526aeb4508ed5a3d3ae83c9258a
npm install --ignore-scripts
node bin/map.js . --json
```

This source-derived example has not been executed in this review. The report describes this checkout. Git-derived sections depend on the history available locally.







<a id="what-it-analyzes"></a>

<a id="key-files-top-10"></a>

<a id="change-hotspots-top-10"></a>

<a id="dependency-map"></a>

<a id="complexity-warnings"></a>

<a id="works-with-any-language"></a>

## Usage

```bash
node bin/map.js /path/to/project --depth 3
node bin/map.js /path/to/project --output ONBOARDING.md
```

`--depth` limits the displayed tree. `--format md` writes a Markdown report, defaulting to ONBOARDING.md; `--output` chooses a path.

[Command reference](docs/REFERENCE.md) covers arguments, modes and output controls.


<a id="what-it-is-not"></a>

## Behavior and limits

This is an onboarding starting point, not a semantic architecture graph. Import/function counts and circular hints use text analysis. Dependency age flags are heuristics, not live registry checks. Git hotspot summaries are bounded by the selected history window and may be incomplete in shallow clones. Markdown generation writes a file and can replace an existing report.

## Development

Declared package scripts:

| Script | Command |
| --- | --- |
| `start` | `node bin/map.js` |
| `test` | `node --test` |

The smoke test syntax-checks the entrypoint; it does not exercise CLI behavior or integrations.

## Research

[Source review and claim ledger](docs/RESEARCH.md) records revision `2da896208a23`, inspected files and verification gaps.

## License and attribution

Protected license and attribution files remain unchanged: [LICENSE](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/LICENSE).

[Artwork credits](assets/nicholas-ashkar/CREDITS.md) · [Nicholas Ashkar — consulting](https://nicholashkar.com/#oxblood-contact)
