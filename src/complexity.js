import { readFileSync } from 'fs';

const CODE_EXTENSIONS = new Set([
  '.js', '.jsx', '.mjs', '.cjs',
  '.ts', '.tsx',
  '.py',
  '.rs',
  '.go',
  '.rb',
  '.php',
  '.java',
  '.kt',
  '.swift',
  '.c', '.h', '.cpp', '.cc', '.cxx', '.hpp',
  '.cs',
  '.vue',
  '.svelte',
]);

function countFunctions(content, ext) {
  const jsExts = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.svelte']);
  let pattern;
  if (jsExts.has(ext)) {
    pattern = /\b(function\s+\w+|(?:const|let|var)\s+\w+\s*=\s*(?:async\s*)?\(|(?:async\s+)?function|\bfn\s*=)/g;
  } else if (ext === '.py') {
    pattern = /^\s*(?:async\s+)?def\s+\w+/gm;
  } else if (ext === '.rs') {
    pattern = /\bfn\s+\w+/g;
  } else if (ext === '.go') {
    pattern = /\bfunc\s+/g;
  } else if (['.java', '.kt', '.cs'].includes(ext)) {
    pattern = /(?:public|private|protected|static|\s)\s+\w+\s+\w+\s*\(/g;
  } else if (ext === '.rb') {
    pattern = /^\s*def\s+\w+/gm;
  } else if (ext === '.php') {
    pattern = /\bfunction\s+\w+/g;
  } else {
    return 0;
  }
  const matches = content.match(pattern);
  return matches ? matches.length : 0;
}

function countImports(content, ext) {
  const jsExts = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx', '.vue', '.svelte']);
  if (jsExts.has(ext)) {
    const matches = content.match(/^(?:import|require\s*\()/gm);
    return matches ? matches.length : 0;
  }
  if (ext === '.py') {
    const matches = content.match(/^(?:import|from\s+\S+\s+import)/gm);
    return matches ? matches.length : 0;
  }
  if (ext === '.go') {
    const matches = content.match(/^import\s+/gm);
    return matches ? matches.length : 0;
  }
  if (ext === '.rs') {
    const matches = content.match(/^use\s+/gm);
    return matches ? matches.length : 0;
  }
  return 0;
}

function getMaxNestingDepth(content) {
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of content) {
    if (char === '{' || char === '(') {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (char === '}' || char === ')') {
      currentDepth = Math.max(0, currentDepth - 1);
    }
  }
  return maxDepth;
}

function detectCircularHints(files) {
  const importMap = {};
  const jsExts = new Set(['.js', '.jsx', '.mjs', '.cjs', '.ts', '.tsx']);

  for (const file of files) {
    if (!jsExts.has(file.ext)) continue;
    let content;
    try {
      content = readFileSync(file.path, 'utf8');
    } catch {
      continue;
    }

    const imports = [];
    const importRegex = /^(?:import\s.*from\s+['"]([^'"]+)['"]|const\s+\S+\s*=\s*require\s*\(\s*['"]([^'"]+)['"]\s*\))/gm;
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const imported = match[1] || match[2];
      if (imported && (imported.startsWith('./') || imported.startsWith('../'))) {
        imports.push(imported);
      }
    }
    importMap[file.relativePath] = imports;
  }

  const circular = [];
  const entries = Object.entries(importMap);

  for (const [fileA, importsA] of entries) {
    for (const importedPath of importsA) {
      for (const [fileB, importsB] of entries) {
        if (fileB === fileA) continue;
        const bBaseName = fileB.replace(/\.[^.]+$/, '');
        const bShort = bBaseName.split('/').pop() || '';
        if (bShort && importedPath.includes(bShort)) {
          const aBaseName = fileA.replace(/\.[^.]+$/, '').split('/').pop() || '';
          if (aBaseName && importsB.some(imp => imp.includes(aBaseName))) {
            const pair = [fileA, fileB].sort().join(' <-> ');
            if (!circular.includes(pair)) {
              circular.push(pair);
            }
          }
        }
      }
    }
  }

  return circular.slice(0, 5);
}

export async function analyzeComplexity(repoPath, files) {
  const codeFiles = files.filter(f => CODE_EXTENSIONS.has(f.ext));
  const scored = [];
  const warnings = [];

  for (const file of codeFiles) {
    let content;
    try {
      content = readFileSync(file.path, 'utf8');
    } catch {
      continue;
    }

    const functionCount = countFunctions(content, file.ext);
    const importCount = countImports(content, file.ext);
    const nestingDepth = getMaxNestingDepth(content);

    const score = (file.loc * 0.4) + (importCount * 15) + (functionCount * 10) + (nestingDepth * 5);

    scored.push({
      ...file,
      functionCount,
      importCount,
      nestingDepth,
      score,
    });

    if (file.loc > 500) {
      warnings.push({
        file: file.relativePath,
        type: 'large-file',
        message: `${file.loc} lines (consider splitting)`,
        severity: file.loc > 1000 ? 'high' : 'medium',
      });
    }
  }

  for (const file of files) {
    const depth = file.relativePath.split('/').length - 1;
    if (depth > 5) {
      warnings.push({
        file: file.relativePath,
        type: 'deep-nesting',
        message: `${depth} directory levels deep`,
        severity: 'low',
      });
    }
  }

  const circular = detectCircularHints(codeFiles);
  for (const pair of circular) {
    warnings.push({
      file: pair,
      type: 'circular-hint',
      message: 'possible circular import detected',
      severity: 'high',
    });
  }

  const keyFiles = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const startHere = [];
  const readmeFile = files.find(f => f.name.toLowerCase() === 'readme.md');
  if (readmeFile) startHere.push(readmeFile.relativePath);

  const entryFiles = scored.filter(f => f.isEntry).slice(0, 2);
  for (const f of entryFiles) {
    if (!startHere.includes(f.relativePath)) startHere.push(f.relativePath);
  }

  const topScoredNotEntry = keyFiles
    .filter(f => !f.isEntry && !startHere.includes(f.relativePath))
    .slice(0, 3);
  for (const f of topScoredNotEntry) {
    startHere.push(f.relativePath);
  }

  return {
    keyFiles,
    warnings: warnings.slice(0, 15),
    startHere: startHere.slice(0, 7),
    totalCodeFiles: codeFiles.length,
  };
}
