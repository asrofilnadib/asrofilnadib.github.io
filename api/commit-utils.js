/**
 * Shared helpers for /api/commits and /api/activity.
 */

function normalizeToken(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[_\s/-]+/g, "");
}

/**
 * Match module prefixes against commit messages.
 * Treats smart-lab, smart_lab, and smartlab as equivalent.
 */
function matchesPrefixes(message, prefixes) {
  if (!prefixes || !prefixes.length) return true;
  const lower = String(message || "").toLowerCase();
  const compact = normalizeToken(message);

  return prefixes.some((prefix) => {
    const raw = String(prefix || "")
      .toLowerCase()
      .trim();
    if (!raw) return false;
    if (lower.includes(raw)) return true;
    const compactPrefix = normalizeToken(raw);
    return Boolean(compactPrefix && compact.includes(compactPrefix));
  });
}

function isMerge(message) {
  const m = String(message || "").toLowerCase();
  return m.includes("merge branch") || m.includes("merge pull request") || m.startsWith("merge remote");
}

function normalizeAuthors(projectConfig) {
  if (Array.isArray(projectConfig.authors) && projectConfig.authors.length) {
    return projectConfig.authors.map((a) => String(a).trim()).filter(Boolean);
  }
  if (projectConfig.author === null || projectConfig.author === "") return [];
  if (projectConfig.author) return [String(projectConfig.author).trim()];
  return ["asrofilnadib"];
}

module.exports = {
  normalizeToken,
  matchesPrefixes,
  isMerge,
  normalizeAuthors,
};
