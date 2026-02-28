import { readdirSync, statSync, readFileSync } from 'fs';
import { join, extname, relative, basename } from 'path';

const IGNORED_DIRS = new Set([
  'node_modules', '.git', '.svn', 'dist', 'build', 'out', '.next', '.nuxt',
  'coverage', '.nyc_output', '.cache', '__pycache__', '.pytest_cache',
  'vendor', 'target', '.gradle', '.idea', '.vscode', 'tmp', '.tmp',
  'logs', '.DS_Store', 'venv', '.venv', 'env', '.env',
]);

const IGNORED_FILES = new Set([
  '.DS_Store', 'Thumbs.db', '.gitkeep', 'package-lock.json', 'yarn.lock',
  'pnpm-lock.yaml', 'composer.lock', 'Cargo.lock', 'Gemfile.lock',
]);

const LANGUAGE_MAP = {
  '.js': 'JavaScript', '.jsx': 'JavaScript', '.mjs': 'JavaScript', '.cjs': 'JavaScript',
  '.ts': 'TypeScript', '.tsx': 'TypeScript',
  '.py': 'Python',
  '.rs': 'Rust',
  '.go': 'Go',
  '.rb': 'Ruby',
  '.php': 'PHP',
  '.java': 'Java',
  '.kt': 'Kotlin',
  '.swift': 'Swift',
  '.c': 'C', '.h': 'C',
  '.cpp': 'C++', '.cc': 'C++', '.cxx': 'C++', '.hpp': 'C++',
  '.cs': 'C#',
  '.vue': 'Vue',
  '.svelte': 'Svelte',
  '.html': 'HTML', '.htm': 'HTML',
  '.css': 'CSS', '.scss': 'SCSS', '.sass': 'Sass', '.less': 'Less',
  '.json': 'JSON',
  '.yaml': 'YAML', '.yml': 'YAML',
  '.toml': 'TOML',
  '.md': 'Markdown',
  '.sh': 'Shell', '.bash': 'Shell', '.zsh': 'Shell',
  '.sql': 'SQL',
  '.graphql': 'GraphQL', '.gql': 'GraphQL',
  '.tf': 'Terraform',
  '.dart': 'Dart',
  '.elm': 'Elm',
  '.ex': 'Elixir', '.exs': 'Elixir',
  '.hs': 'Haskell',
  '.lua': 'Lua',
  '.r': 'R', '.R': 'R',
};

const ENTRY_PATTERNS = [
  'index.js', 'index.ts', 'index.jsx', 'index.tsx',
  'main.js', 'main.ts', 'main.py', 'main.rs', 'main.go',
  'app.js', 'app.ts', 'app.py',
  'server.js', 'server.ts',
  'cli.js', 'cli.ts',
  'manage.py', 'wsgi.py', 'asgi.py',
  'Makefile', 'Rakefile', 'Gruntfile.js', 'Gulpfile.js',
];

const CONFIG_PATTERNS = [
  'package.json', 'tsconfig.json', 'webpack.config.js', 'vite.config.js',
  'rollup.config.js', 'babel.config.js', '.babelrc', 'jest.config.js',
  'vitest.config.js', 'eslint.config.js', '.eslintrc', '.eslintrc.js',
  '.prettierrc', 'prettier.config.js', 'tailwind.config.js',
  'next.config.js', 'nuxt.config.js', 'svelte.config.js',
  'Cargo.toml', 'pyproject.toml', 'setup.py', 'setup.cfg',
  'go.mod', 'Gemfile', 'composer.json',
  'Dockerfile', 'docker-compose.yml', 'docker-compose.yaml',
  '.github', '.gitlab-ci.yml', '.travis.yml', 'Jenkinsfile',
  'render.yaml', 'vercel.json', 'netlify.toml', 'fly.toml',
];

function countLines(filePath) {
  try {
    const content = readFileSync(filePath, 'utf8');
    return content.split('\n').length;
  } catch {
    return 0;
  }
}

function walkDir(dirPath, depth, maxDepth, prefix = '', result = []) {
  if (depth > maxDepth) return result;

  let entries;
  try {
    entries = readdirSync(dirPath).sort();
  } catch {
    return result;
  }

  const filtered = entries.filter(e => !IGNORED_DIRS.has(e) && !IGNORED_FILES.has(e) && !e.startsWith('.'));
  const visibleEntries = entries.filter(e => !IGNORED_DIRS.has(e) && !e.startsWith('.'));

  for (let i = 0; i < visibleEntries.length; i++) {
    const entry = visibleEntries[i];
    const fullPath = join(dirPath, entry);
    const isLast = i === visibleEntries.length - 1;
    const connector = isLast ? '└── ' : '├── ';
    const childPrefix = isLast ? '    ' : '│   ';

    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(entry)) continue;
      result.push(`${prefix}${connector}${entry}/`);
      walkDir(fullPath, depth + 1, maxDepth, prefix + childPrefix, result);
    } else {
      if (IGNORED_FILES.has(entry)) continue;
      result.push(`${prefix}${connector}${entry}`);
    }
  }

  return result;
}

function collectFiles(dirPath, rootPath, collected = []) {
  let entries;
  try {
    entries = readdirSync(dirPath);
  } catch {
    return collected;
  }

  for (const entry of entries) {
    if (IGNORED_DIRS.has(entry) || IGNORED_FILES.has(entry) || entry.startsWith('.')) continue;

    const fullPath = join(dirPath, entry);
    let stat;
    try {
      stat = statSync(fullPath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      collectFiles(fullPath, rootPath, collected);
    } else {
      const ext = extname(entry);
      const lang = LANGUAGE_MAP[ext] || null;
      const relPath = relative(rootPath, fullPath);
      const loc = lang ? countLines(fullPath) : 0;

      collected.push({
        path: fullPath,
        relativePath: relPath,
        name: entry,
        ext,
        language: lang,
        loc,
        size: stat.size,
        mtime: stat.mtime,
        isEntry: ENTRY_PATTERNS.includes(entry),
        isConfig: CONFIG_PATTERNS.some(p => entry === p || relPath === p),
        isTest: /\.(test|spec)\.[jt]sx?$/.test(entry) ||
                /__(tests?|mocks?)__/.test(relPath) ||
                relPath.includes('/test/') || relPath.includes('/tests/') ||
                relPath.includes('/spec/'),
      });
    }
  }

  return collected;
}

export async function analyzeStructure(repoPath, maxDepth = 4) {
  const files = collectFiles(repoPath, repoPath);

  const langCounts = {};
  let totalLoc = 0;

  for (const f of files) {
    if (f.language) {
      langCounts[f.language] = (langCounts[f.language] || 0) + 1;
      totalLoc += f.loc;
    }
  }

  const languages = Object.entries(langCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([lang]) => lang);

  const treeLines = walkDir(repoPath, 1, maxDepth);
  const tree = treeLines.join('\n');

  const entryPoints = files.filter(f => f.isEntry).map(f => f.relativePath);
  const configFiles = files.filter(f => f.isConfig).map(f => f.relativePath);
  const testFiles = files.filter(f => f.isTest);

  const testDirs = [...new Set(
    testFiles.map(f => {
      const parts = f.relativePath.split('/');
      return parts.length > 1 ? parts[0] : null;
    }).filter(Boolean)
  )];

  const ciFiles = files.filter(f =>
    f.relativePath.includes('.github/') ||
    ['Dockerfile', 'docker-compose.yml', '.travis.yml', 'Jenkinsfile', '.gitlab-ci.yml'].includes(f.name)
  ).map(f => f.relativePath);

  return {
    files,
    tree,
    languages,
    totalFiles: files.length,
    totalLoc,
    entryPoints,
    configFiles,
    testDirs,
    ciFiles,
  };
}
