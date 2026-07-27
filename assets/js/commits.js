(function () {
  "use strict";

  var overlay = null;
  var titleEl = null;
  var subtitleEl = null;
  var bodyEl = null;

  function ensureModal() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "gh-commits-overlay";
    overlay.id = "gh-commits-overlay";
    overlay.innerHTML =
      '<div class="gh-commits-modal" role="dialog" aria-modal="true" aria-labelledby="gh-commits-title">' +
      '<div class="gh-commits-header">' +
      "<div>" +
      '<h3 id="gh-commits-title">Commits</h3>' +
      '<p class="gh-commits-subtitle"></p>' +
      "</div>" +
      '<button type="button" class="gh-commits-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="gh-commits-body"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    titleEl = overlay.querySelector("#gh-commits-title");
    subtitleEl = overlay.querySelector(".gh-commits-subtitle");
    bodyEl = overlay.querySelector(".gh-commits-body");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector(".gh-commits-close").addEventListener("click", closeModal);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) closeModal();
    });
  }

  function openModal() {
    ensureModal();
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderGroups(data) {
    if (!data.groups || !data.groups.length) {
      bodyEl.innerHTML = '<div class="gh-commits-empty">No commits found for this project filter.</div>';
      return;
    }

    var html = "";
    data.groups.forEach(function (group) {
      html += '<div class="gh-day-group">';
      html += '<h4 class="gh-day-title">Commits on ' + escapeHtml(group.day) + "</h4>";
      html += '<ul class="gh-commit-list">';
      group.commits.forEach(function (c) {
        html += '<li class="gh-commit-item"><div class="gh-commit-row">';
        html += '<div class="gh-commit-main">';
        html += '<p class="gh-commit-msg">';
        html += '<span class="gh-badge gh-badge-' + escapeHtml(c.type) + '">' + escapeHtml(c.label) + "</span>";
        html +=
          '<a href="' +
          escapeHtml(c.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(c.message) +
          "</a></p>";
        html += '<div class="gh-commit-meta">';
        html += '<img src="' + escapeHtml(c.avatar) + '" alt="">';
        html += "<span>" + escapeHtml(c.login || c.author) + "</span>";
        html += "<span>committed on " + escapeHtml(c.day) + "</span>";
        html += "</div></div>";
        html += '<div class="gh-commit-side">';
        html +=
          '<a class="gh-sha" href="' +
          escapeHtml(c.url) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(c.shortSha) +
          "</a>";
        html += "</div></div></li>";
      });
      html += "</ul></div>";
    });
    bodyEl.innerHTML = html;
  }

  async function loadCommits(projectKey, projectLabel) {
    ensureModal();
    openModal();
    titleEl.textContent = (projectLabel || projectKey) + " — Commits";
    subtitleEl.textContent = "Loading…";
    bodyEl.innerHTML = '<div class="gh-commits-loading">Fetching commits from GitHub…</div>';

    try {
      var res = await fetch("/api/commits?project=" + encodeURIComponent(projectKey) + "&limit=40");
      var data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to load commits");
      }
      subtitleEl.innerHTML =
        '<a href="' +
        escapeHtml(data.htmlUrl) +
        '" target="_blank" rel="noopener noreferrer">' +
        escapeHtml(data.repo) +
        "</a> · " +
        data.count +
        " commits";
      renderGroups(data);
    } catch (err) {
      subtitleEl.textContent = "Could not load commits";
      var msg = String(err.message || err || "");
      var hint;
      if (location.protocol === "file:") {
        hint =
          "Jangan buka via file://. Jalankan <code>npm run dev</code> lalu buka http://localhost:3000 (token dari .env).";
      } else if (/not found/i.test(msg)) {
        hint =
          "Repo/branch tidak ketemu atau token belum punya akses ke private repo. Cek mapping di <code>api/commits-config.json</code> (branch biasanya <code>dev</code>) dan scope PAT <code>repo</code>.";
      } else if (/bad credentials/i.test(msg)) {
        hint =
          "GITHUB_TOKEN invalid/expired. Update .env lokal atau Environment Variable di Vercel, lalu redeploy.";
      } else {
        hint =
          "Lokal: pastikan <code>npm run dev</code> jalan + GITHUB_TOKEN di .env. Vercel: set Environment Variable GITHUB_TOKEN lalu redeploy.";
      }
      bodyEl.innerHTML =
        '<div class="gh-commits-error">' +
        escapeHtml(msg) +
        "<br><small>" +
        hint +
        "</small></div>";
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-commits-project]");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    var key = btn.getAttribute("data-commits-project");
    var label = btn.getAttribute("data-commits-title") || key;
    loadCommits(key, label);
  });
})();
