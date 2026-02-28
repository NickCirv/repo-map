#!/usr/bin/env node

import { program } from 'commander';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const require = createRequire(import.meta.url);
const pkg = require(join(__dirname, '..', 'package.json'));

program
  .name('repo-map')
  .description('Understand any codebase in 5 minutes')
  .version(pkg.version)
  .argument('[path]', 'path to repository', '.')
  .option('-d, --depth <number>', 'directory tree depth limit', '4')
  .option('-f, --format <type>', 'output format: terminal or md', 'terminal')
  .option('-o, --output <file>', 'save report to file (implies --format md)')
  .option('--json', 'output as JSON')
  .action(async (repoPath, options) => {
    const { runAnalysis } = await import('../src/index.js');
    await runAnalysis(repoPath, {
      depth: parseInt(options.depth, 10),
      format: options.json ? 'json' : (options.output ? 'md' : options.format),
      output: options.output,
      json: options.json,
    });
  });

program.parse();
