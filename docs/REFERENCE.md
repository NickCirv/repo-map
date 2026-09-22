# Command reference

Use `node bin/map.js` from the pinned source checkout described in the [README](../README.md). The entries below describe the inspected implementation.

| Command or argument | Behavior |
| --- | --- |
| `[PATH]` | Inspect a repository; defaults to the current directory. |
| `-d, --depth N` | Limit directory tree depth; defaults to 4. |
| `-f, --format TYPE` | Select terminal or md presentation. |
| `-o, --output FILE` | Write a Markdown report to a file. |
| `--json` | Select structured JSON output. |

For prerequisites, file writes, external services and known limitations, see [Behavior and limits](../README.md#behavior-and-limits).

Implementation: [bin/map.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/bin/map.js), [src/analyzer.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/analyzer.js), [src/dependencies.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/dependencies.js), [src/hotspots.js](https://github.com/NickCirv/repo-map/blob/2da896208a236526aeb4508ed5a3d3ae83c9258a/src/hotspots.js); [review evidence](RESEARCH.md).
