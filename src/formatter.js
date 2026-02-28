import chalk from 'chalk';

const ACCENT = chalk.hex('#3B82F6');
const DIM = chalk.dim;
const BOLD = chalk.bold;
const YELLOW = chalk.yellow;
const RED = chalk.red;
const GREEN = chalk.green;

function pad(str, len) {
  const s = String(str);
  return s.length >= len ? s : s + ' '.repeat(len - s.length);
}

function truncate(str, len) {
  if (str.length <= len) return str;
  return str.slice(0, len - 1) + '…';
}

export function printHeader() {
  process.stdout.write('\n');
  process.stdout.write(`  ${ACCENT.bold('REPO-MAP')}  ${DIM('v1.0.0')}\n`);
  process.stdout.write('\n');
}

export function printStep(msg) {
  process.stdout.write(`  ${DIM('→')} ${DIM(msg)}\n`);
}

export function printError(msg) {
  process.stdout.write(`  ${RED('✗')} ${msg}\n`);
}

export function printSection(title) {
  const line = '─'.repeat(Math.max(0, 46 - title.length));
  process.stdout.write(`\n  ${ACCENT('──')} ${BOLD(title)} ${DIM(line)}\n`);
}

export function printReport(report, savedTo) {
  const { structure, hotspots, dependencies, complexity } = report;

  process.stdout.write('\n');

  // Quick Stats
  printSection('Quick Stats');
  const langs = structure.languages.slice(0, 4).join(', ') || 'n/a';
  process.stdout.write(
    `  Files: ${BOLD(structure.totalFiles.toLocaleString())}  ${DIM('│')}  ` +
    `LOC: ${BOLD(structure.totalLoc.toLocaleString())}  ${DIM('│')}  ` +
    `Languages: ${BOLD(langs)}\n`
  );
  process.stdout.write(
    `  Contributors: ${BOLD(hotspots.contributorCount)}  ${DIM('│')}  ` +
    `Last commit: ${BOLD(hotspots.lastCommit)}\n`
  );

  if (dependencies.type !== 'unknown') {
    process.stdout.write(
      `  Dependencies: ${BOLD(dependencies.totalDirect)} direct, ` +
      `${BOLD(dependencies.totalDev)} dev  ${DIM('(')}${DIM(dependencies.type)}${DIM(')')}\n`
    );
  }

  // Key Files
  if (complexity.keyFiles.length > 0) {
    printSection('Key Files (read these first)');
    for (let i = 0; i < complexity.keyFiles.length; i++) {
      const f = complexity.keyFiles[i];
      const num = ACCENT(`${i + 1}.`);
      const name = pad(truncate(f.relativePath, 40), 42);
      const role = f.isEntry ? DIM('Entry point') :
                   f.isConfig ? DIM('Config') :
                   f.isTest ? DIM('Test') : '';
      const loc = DIM(`${f.loc} LOC`);
      const imports = f.importCount > 0 ? DIM(` │ ${f.importCount} imports`) : '';
      process.stdout.write(`  ${num} ${name}${loc}${imports}  ${role}\n`);
    }
  }

  // Hotspots
  if (hotspots.hotspots.length > 0) {
    printSection('Hotspots (most volatile)');
    for (const h of hotspots.hotspots.slice(0, 8)) {
      const indicator = h.count > 20 ? RED('⚡') : YELLOW('⚡');
      const name = pad(truncate(h.file, 45), 47);
      const changes = `${h.count} changes`;
      const note = h.count > 20 ? DIM(' — review carefully') : '';
      process.stdout.write(`  ${indicator} ${name}${DIM(changes)}${note}\n`);
    }
  }

  // Complexity Warnings
  if (complexity.warnings.length > 0) {
    printSection('Complexity Warnings');
    for (const w of complexity.warnings.slice(0, 8)) {
      const icon = w.severity === 'high' ? RED('⚠ ') : YELLOW('⚠ ');
      const name = pad(truncate(w.file, 40), 42);
      process.stdout.write(`  ${icon}${name}${DIM(w.message)}\n`);
    }
  }

  // Dependencies highlight
  if (dependencies.type !== 'unknown' && dependencies.direct.length > 0) {
    const flagged = [...dependencies.direct, ...dependencies.dev].filter(d => d.flagged);
    if (flagged.length > 0) {
      printSection('Dependency Flags');
      for (const dep of flagged.slice(0, 5)) {
        process.stdout.write(`  ${YELLOW('↑')} ${pad(dep.name, 30)} ${DIM(dep.version)}  ${DIM('old major version')}\n`);
      }
    }
  }

  // Start Here Path
  if (complexity.startHere.length > 0) {
    printSection('Start Here Path');
    for (let i = 0; i < complexity.startHere.length; i++) {
      process.stdout.write(`  ${ACCENT(`${i + 1}`)} ${DIM('→')} ${complexity.startHere[i]}\n`);
    }
  }

  process.stdout.write('\n');

  if (savedTo) {
    process.stdout.write(`  ${GREEN('✓')} Report saved to ${BOLD(savedTo)}\n`);
  }

  process.stdout.write('\n');
}
