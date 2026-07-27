const config = require("./commits-config.json");

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function parseCommitMessage(message) {
  const firstLine = (message || "").split("\n")[0].trim();
  const result = { type: "other", label: "Other", description: firstLine, module: null };

  const conventional =
    /^(Feature|Feat|Fix|Style|Refactor|Update|Chore|Docs|Perf|Test)(?:\(([^)]+)\))?\s*:\s*(.+)$/i;
  const spaced =
    /^(Feature|Feat|Fix|Style|Refactor|Update|Chore|Docs|Perf|Test)\s+([a-zA-Z0-9_\-/]+)?\s*:\s*(.+)$/i;
  const moduleFirst = /^([a-zA-Z0-9_\-/]+)\s*:\s*(.+)$/;

  let m = firstLine.match(conventional) || firstLine.match(spaced);
  if (m) {
    const rawType = m[1].toLowerCase();
    result.type = normalizeType(rawType);
    result.label = labelForType(result.type);
    result.module = m[2] ? m[2].trim() : null;
    result.description = m[3].trim();
    return result;
  }

  m = firstLine.match(moduleFirst);
  if (m && !/^(merge|revert)/i.test(m[1])) {
    result.module = m[1].trim();
    result.description = m[2].trim();
  }

  return result;
}

function normalizeType(t) {
  if (t === "feat" || t === "feature") return "feat";
  if (t === "fix") return "fix";
  if (t === "refactor") return "refactor";
  if (t === "chore" || t === "docs" || t === "style" || t === "update" || t === "perf" || t === "test") {
    return "chore";
  }
  return "other";
}

function labelForType(type) {
  return { feat: "Feature", fix: "Fix", refactor: "Refactor", chore: "Chore", other: "Other" }[type] || "Other";
}

function matchesPrefixes(message, prefixes) {
  if (!prefixes || !prefixes.length) return true;
  const lower = (message || "").toLowerCase();
  return prefixes.some((p) => lower.includes(String(p).toLowerCase()));
}

function isMerge(message) {
  const m = (message || "").toLowerCase();
  return m.includes("merge branch") || m.includes("merge pull request") || m.startsWith("merge remote");
}

function formatDay(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

async function githubGet(url, token) {
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      Authorization: `Bearer ${token}`,
      "User-Agent": "asrofil-portfolio",
    },
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { message: text };
  }
  return { ok: res.ok, status: res.status, data };
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const project = String(req.query.project || "").trim();
  const limit = Math.min(parseInt(req.query.limit || "40", 10) || 40, 100);
  const projectConfig = config[project];

  if (!projectConfig) {
    return res.status(404).json({
      error: "Unknown project",
      available: Object.keys(config),
    });
  }

  const token = String(process.env.GITHUB_TOKEN || "").trim().replace(/^["']|["']$/g, "");
  if (!token) {
    return res.status(500).json({
      error: "GITHUB_TOKEN is not configured on the server",
    });
  }

  const { owner, repo, branch = "dev", author = "asrofilnadib", prefixes = [], title } = projectConfig;
  // Pull extra when filtering by module prefixes; paginate until limit is filled
  const perPage = prefixes.length ? 100 : Math.min(100, limit);
  const maxPages = prefixes.length ? 8 : 1;

  const branchCandidates = [branch, "dev", "main", "master"].filter(
    (b, i, arr) => b && arr.indexOf(b) === i
  );

  let last = { ok: false, status: 502, data: { message: "Failed to fetch commits" } };
  let usedBranch = branch;
  let rawCommits = null;

  for (const candidate of branchCandidates) {
    const pages = [];
    let pageFailed = null;

    for (let page = 1; page <= maxPages; page++) {
      const params = new URLSearchParams({
        sha: candidate,
        per_page: String(perPage),
        page: String(page),
      });
      if (author) params.set("author", author);

      const url = `https://api.github.com/repos/${owner}/${repo}/commits?${params}`;
      last = await githubGet(url, token);
      usedBranch = candidate;

      if (!last.ok) {
        pageFailed = last;
        break;
      }

      const batch = Array.isArray(last.data) ? last.data : [];
      pages.push(...batch);
      if (batch.length < perPage) break;

      // Early stop if we already have enough matches after filtering
      const preview = filterCommits(pages, { prefixes, limit, author });
      if (preview.length >= limit) break;
    }

    if (pageFailed) {
      // Wrong branch / missing ref — try next candidate
      if (pageFailed.status === 404 || pageFailed.status === 422) continue;
      return res.status(pageFailed.status || 502).json({
        error: "GitHub API error",
        status: pageFailed.status,
        message:
          pageFailed.data && pageFailed.data.message
            ? pageFailed.data.message
            : "Failed to fetch commits",
        repo: `${owner}/${repo}`,
        triedBranches: branchCandidates,
      });
    }

    rawCommits = pages;
    break;
  }

  if (!rawCommits) {
    return res.status(last.status || 502).json({
      error: "GitHub API error",
      status: last.status,
      message: last.data && last.data.message ? last.data.message : "Failed to fetch commits",
      repo: `${owner}/${repo}`,
      triedBranches: branchCandidates,
    });
  }

  return respond(res, rawCommits, { owner, repo, title, prefixes, limit, branch: usedBranch, author });
};

function filterCommits(rawCommits, meta) {
  const commits = [];
  for (const item of rawCommits || []) {
    const message = item.commit?.message || "";
    if (isMerge(message)) continue;
    if (!matchesPrefixes(message, meta.prefixes)) continue;

    const parsed = parseCommitMessage(message);
    const date = item.commit?.author?.date || item.commit?.committer?.date;
    const sha = item.sha || "";
    commits.push({
      sha,
      shortSha: sha.slice(0, 7),
      message: parsed.description,
      fullMessage: message.split("\n")[0],
      type: parsed.type,
      label: parsed.label,
      module: parsed.module,
      date,
      day: date ? formatDay(date) : "Unknown",
      author: item.commit?.author?.name || item.author?.login || "unknown",
      avatar: item.author?.avatar_url || `https://github.com/${meta.author || "asrofilnadib"}.png`,
      login: item.author?.login || null,
      url: item.html_url,
    });
    if (commits.length >= meta.limit) break;
  }
  return commits;
}

function respond(res, rawCommits, meta) {
  const commits = filterCommits(rawCommits, meta);

  const groups = [];
  const byDay = {};
  for (const c of commits) {
    if (!byDay[c.day]) {
      byDay[c.day] = [];
      groups.push({ day: c.day, commits: byDay[c.day] });
    }
    byDay[c.day].push(c);
  }

  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
  return res.status(200).json({
    project: meta.title,
    repo: `${meta.owner}/${meta.repo}`,
    branch: meta.branch,
    htmlUrl: `https://github.com/${meta.owner}/${meta.repo}`,
    count: commits.length,
    groups,
  });
}
