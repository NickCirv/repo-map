import { resolve } from 'path';
import { existsSync } from 'fs';
import { analyzeStructure } from './structure.js';
import { analyzeHotspots } from './hotspots.js';
import { analyzeDependencies } from './dependencies.js';
import { analyzeComplexity } from './complexity.js';
import { generateMarkdown } from './generator.js';
import { printReport, printHeader, printError, printStep } from './formatter.js';
import { writeFileSync } from 'fs';

export async function runAnalysis(repoPath, options = {}) {
  const { depth = 4, format = 'terminal', output, json = false } = options;
  const absolutePath = resolve(repoPath);

  if (!existsSync(absolutePath)) {
    printError(`Path does not exist: ${absolutePath}`);
    process.exit(1);
  }

  printHeader();
  printStep('Mapping project...');

  let structure, hotspots, dependencies, complexity;

  try {
    printStep('Analyzing directory structure...');
    structure = await analyzeStructure(absolutePath, depth);
  } catch (err) {
    printError(`Structure analysis failed: ${err.message}`);
    structure = { files: [], tree: '', languages: [], totalFiles: 0, totalLoc: 0 };
  }

  try {
    printStep('Reading git history...');
    hotspots = await analyzeHotspots(absolutePath);
  } catch (err) {
    hotspots = { hotspots: [], recentActivity: [], lastCommit: 'unknown', contributorCount: 0 };
  }

  try {
    printStep('Mapping dependencies...');
    dependencies = await analyzeDependencies(absolutePath);
  } catch (err) {
    dependencies = { direct: [], dev: [], type: 'unknown' };
  }

  try {
    printStep('Scoring complexity...');
    complexity = await analyzeComplexity(absolutePath, structure.files || []);
  } catch (err) {
    complexity = { warnings: [], keyFiles: [], startHere: [] };
  }

  const report = {
    repoPath: absolutePath,
    structure,
    hotspots,
    dependencies,
    complexity,
    generatedAt: new Date().toISOString(),
  };

  if (json) {
    process.stdout.write(JSON.stringify(report, null, 2) + '\n');
    return;
  }

  if (format === 'md' || output) {
    const markdown = generateMarkdown(report);
    const outFile = output || 'ONBOARDING.md';
    writeFileSync(outFile, markdown, 'utf8');
    printReport(report, outFile);
    return;
  }

  printReport(report, null);
}
