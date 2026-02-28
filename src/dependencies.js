import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

function parsePackageJson(repoPath) {
  const pkgPath = join(repoPath, 'package.json');
  if (!existsSync(pkgPath)) return null;

  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
    const direct = Object.entries(pkg.dependencies || {}).map(([name, version]) => ({
      name,
      version,
      type: 'direct',
    }));
    const dev = Object.entries(pkg.devDependencies || {}).map(([name, version]) => ({
      name,
      version,
      type: 'dev',
    }));
    const peer = Object.entries(pkg.peerDependencies || {}).map(([name, version]) => ({
      name,
      version,
      type: 'peer',
    }));
    return { type: 'npm', name: pkg.name, version: pkg.version, direct, dev, peer };
  } catch {
    return null;
  }
}

function parseRequirementsTxt(repoPath) {
  const candidates = ['requirements.txt', 'requirements/base.txt', 'requirements/prod.txt'];
  for (const candidate of candidates) {
    const reqPath = join(repoPath, candidate);
    if (!existsSync(reqPath)) continue;
    try {
      const lines = readFileSync(reqPath, 'utf8').split('\n');
      const direct = lines
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && !l.startsWith('-'))
        .map(l => {
          const match = l.match(/^([A-Za-z0-9_.-]+)([>=<!~^]+.+)?$/);
          return match ? { name: match[1], version: match[2] || '*', type: 'direct' } : null;
        })
        .filter(Boolean);
      return { type: 'pip', direct, dev: [], peer: [] };
    } catch {
      continue;
    }
  }
  return null;
}

function parsePyprojectToml(repoPath) {
  const tomlPath = join(repoPath, 'pyproject.toml');
  if (!existsSync(tomlPath)) return null;

  try {
    const content = readFileSync(tomlPath, 'utf8');
    // Basic TOML parsing for dependencies array
    const depsMatch = content.match(/\[tool\.poetry\.dependencies\]([\s\S]*?)(\[|$)/);
    const devDepsMatch = content.match(/\[tool\.poetry\.dev-dependencies\]([\s\S]*?)(\[|$)/);

    const parseDeps = (section) => {
      if (!section) return [];
      return section.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.includes('=') && !l.startsWith('['))
        .map(l => {
          const [name, version] = l.split('=').map(s => s.trim().replace(/['"]/g, ''));
          return name !== 'python' ? { name, version: version || '*', type: 'direct' } : null;
        })
        .filter(Boolean);
    };

    const direct = parseDeps(depsMatch ? depsMatch[1] : null);
    const dev = parseDeps(devDepsMatch ? devDepsMatch[1] : null);
    return { type: 'poetry', direct, dev, peer: [] };
  } catch {
    return null;
  }
}

function parseCargoToml(repoPath) {
  const cargoPath = join(repoPath, 'Cargo.toml');
  if (!existsSync(cargoPath)) return null;

  try {
    const content = readFileSync(cargoPath, 'utf8');
    const depsMatch = content.match(/\[dependencies\]([\s\S]*?)(\[|$)/);
    const devDepsMatch = content.match(/\[dev-dependencies\]([\s\S]*?)(\[|$)/);

    const parseDeps = (section) => {
      if (!section) return [];
      return section.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.includes('=') && !l.startsWith('['))
        .map(l => {
          const [name, version] = l.split('=').map(s => s.trim().replace(/['"{}]/g, ''));
          return { name: name.trim(), version: version?.trim() || '*', type: 'direct' };
        })
        .filter(d => d.name);
    };

    const direct = parseDeps(depsMatch ? depsMatch[1] : null);
    const dev = parseDeps(devDepsMatch ? devDepsMatch[1] : null);
    return { type: 'cargo', direct, dev, peer: [] };
  } catch {
    return null;
  }
}

function parseGoMod(repoPath) {
  const goModPath = join(repoPath, 'go.mod');
  if (!existsSync(goModPath)) return null;

  try {
    const content = readFileSync(goModPath, 'utf8');
    const requireBlock = content.match(/require\s*\(([\s\S]*?)\)/);
    const inlineRequire = content.match(/^require\s+(\S+)\s+(\S+)/gm);

    const direct = [];

    if (requireBlock) {
      const lines = requireBlock[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
      for (const line of lines) {
        const parts = line.split(/\s+/);
        if (parts.length >= 2) {
          direct.push({ name: parts[0], version: parts[1], type: parts[2] === '// indirect' ? 'dev' : 'direct' });
        }
      }
    }

    if (inlineRequire) {
      for (const line of inlineRequire) {
        const parts = line.replace('require', '').trim().split(/\s+/);
        if (parts.length >= 2) {
          direct.push({ name: parts[0], version: parts[1], type: 'direct' });
        }
      }
    }

    return { type: 'go', direct: direct.filter(d => d.type === 'direct'), dev: direct.filter(d => d.type === 'dev'), peer: [] };
  } catch {
    return null;
  }
}

function parseGemfile(repoPath) {
  const gemfilePath = join(repoPath, 'Gemfile');
  if (!existsSync(gemfilePath)) return null;

  try {
    const content = readFileSync(gemfilePath, 'utf8');
    const lines = content.split('\n').map(l => l.trim()).filter(l => l.startsWith('gem '));
    const direct = lines.map(l => {
      const match = l.match(/gem\s+['"]([^'"]+)['"]\s*(?:,\s*['"]([^'"]+)['"])?/);
      return match ? { name: match[1], version: match[2] || '*', type: 'direct' } : null;
    }).filter(Boolean);
    return { type: 'gem', direct, dev: [], peer: [] };
  } catch {
    return null;
  }
}

function flagOutdated(deps) {
  // Flag packages with very old major version patterns (heuristic)
  return deps.map(d => ({
    ...d,
    flagged: d.version && /^[=^~]?[0-3]\./.test(d.version),
  }));
}

export async function analyzeDependencies(repoPath) {
  const parsers = [
    parsePackageJson,
    parseRequirementsTxt,
    parsePyprojectToml,
    parseCargoToml,
    parseGoMod,
    parseGemfile,
  ];

  for (const parser of parsers) {
    const result = parser(repoPath);
    if (result) {
      return {
        ...result,
        direct: flagOutdated(result.direct),
        dev: flagOutdated(result.dev),
        peer: flagOutdated(result.peer || []),
        totalDirect: result.direct.length,
        totalDev: result.dev.length,
      };
    }
  }

  return {
    type: 'unknown',
    direct: [],
    dev: [],
    peer: [],
    totalDirect: 0,
    totalDev: 0,
  };
}
