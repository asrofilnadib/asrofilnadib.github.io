/**
 * Watch Demo overlay — YouTube embed above portfolio Magnific modal.
 * Enable a button by setting data-demo-youtube (and href) to a YouTube URL
 * and removing class is-disabled / aria-disabled / .btn-watch-demo-soon.
 */
(function () {
  "use strict";

  var overlay = null;
  var frameHost = null;
  var titleEl = null;

  function youtubeId(url) {
    if (!url) return "";
    var m =
      String(url).match(/[?&]v=([^&]+)/) ||
      String(url).match(/youtu\.be\/([^?&]+)/) ||
      String(url).match(/youtube\.com\/embed\/([^?&]+)/);
    return m ? m[1] : "";
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "watch-demo-overlay";
    overlay.id = "watch-demo-overlay";
    overlay.innerHTML =
      '<div class="watch-demo-dialog" role="dialog" aria-modal="true" aria-labelledby="watch-demo-title">' +
      '<div class="watch-demo-header">' +
      '<h3 id="watch-demo-title">Watch Demo</h3>' +
      '<button type="button" class="watch-demo-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="watch-demo-frame-host"></div>' +
      "</div>";
    document.body.appendChild(overlay);
    frameHost = overlay.querySelector(".watch-demo-frame-host");
    titleEl = overlay.querySelector("#watch-demo-title");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });
    overlay.querySelector(".watch-demo-close").addEventListener("click", closeOverlay);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        e.stopPropagation();
        closeOverlay();
      }
    });
  }

  function openOverlay(id, title) {
    ensureOverlay();
    titleEl.textContent = title || "Watch Demo";
    frameHost.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' +
      encodeURIComponent(id) +
      '?autoplay=1&rel=0" title="YouTube demo" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>';
    overlay.classList.add("is-open");
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    if (frameHost) frameHost.innerHTML = "";
  }

  function isDisabled(btn) {
    return (
      btn.classList.contains("is-disabled") ||
      btn.getAttribute("aria-disabled") === "true" ||
      !String(btn.getAttribute("data-demo-youtube") || "").trim()
    );
  }

  function modalTitleNear(btn) {
    var root = btn.closest(".popup_modal_content") || btn.closest(".popup_content_area");
    if (!root) return "Watch Demo";
    var h = root.querySelector(".portfolio_info_text .title");
    return (h && h.textContent.trim()) || "Watch Demo";
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-watch-demo");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    if (isDisabled(btn)) return;

    var url = btn.getAttribute("data-demo-youtube") || btn.getAttribute("href") || "";
    var id = youtubeId(url);
    if (!id) return;
    openOverlay(id, modalTitleNear(btn));
  });
})();
