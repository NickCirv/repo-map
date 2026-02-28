import { execFileSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

function runGit(args, cwd) {
  try {
    return execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  } catch {
    return '';
  }
}

function isGitRepo(repoPath) {
  return existsSync(join(repoPath, '.git'));
}

function parseRelativeTime(dateStr) {
  if (!dateStr) return 'unknown';
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  } catch {
    return dateStr;
  }
}

export async function analyzeHotspots(repoPath) {
  if (!isGitRepo(repoPath)) {
    return {
      hotspots: [],
      recentActivity: [],
      lastCommit: 'not a git repo',
      contributorCount: 0,
      isGitRepo: false,
    };
  }

  // Most changed files in last 100 commits
  const logOutput = runGit(
    ['log', '--name-only', '--pretty=format:', '-n', '100'],
    repoPath
  );

  const changeCounts = {};
  if (logOutput) {
    const lines = logOutput.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const f = line.trim();
      if (f && !f.startsWith('.git')) {
        changeCounts[f] = (changeCounts[f] || 0) + 1;
      }
    }
  }

  const hotspots = Object.entries(changeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, count]) => ({ file, count }));

  // Recent activity (files changed in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const sinceDate = thirtyDaysAgo.toISOString().split('T')[0];

  const recentLog = runGit(
    ['log', '--name-only', '--pretty=format:', `--since=${sinceDate}`],
    repoPath
  );

  const recentCounts = {};
  if (recentLog) {
    const lines = recentLog.split('\n').filter(l => l.trim());
    for (const line of lines) {
      const f = line.trim();
      if (f && !f.startsWith('.git')) {
        recentCounts[f] = (recentCounts[f] || 0) + 1;
      }
    }
  }

  const recentActivity = Object.entries(recentCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([file, count]) => ({ file, count, period: '30 days' }));

  // Last commit date
  const lastCommitDate = runGit(['log', '-1', '--format=%ci'], repoPath);
  const lastCommit = parseRelativeTime(lastCommitDate);

  // Contributor count
  const contributorsOutput = runGit(['shortlog', '-sn', '--no-merges'], repoPath);
  const contributorCount = contributorsOutput
    ? contributorsOutput.split('\n').filter(l => l.trim()).length
    : 0;

  // Top contributors
  const contributors = contributorsOutput
    ? contributorsOutput.split('\n')
        .filter(l => l.trim())
        .slice(0, 5)
        .map(line => {
          const match = line.trim().match(/^(\d+)\s+(.+)$/);
          return match ? { commits: parseInt(match[1], 10), name: match[2] } : null;
        })
        .filter(Boolean)
    : [];

  return {
    hotspots,
    recentActivity,
    lastCommit,
    contributorCount,
    contributors,
    isGitRepo: true,
  };
}
