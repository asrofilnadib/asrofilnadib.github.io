/**
 * PAS portfolio media gallery extras (flowchart / youtube / ppt)
 * Flowcharts: static local SVG + svg-pan-zoom (no Mermaid runtime).
 * Owl Carousel stays owned by main.js — this only hydrates media then refreshes.
 */
(function ($) {
  "use strict";

  var panZoomByHost = new WeakMap();
  var panZoomList = [];
  var hydrating = false;
  var hydratedModal = false;

  function youtubeId(url) {
    if (!url) return "";
    var m =
      String(url).match(/[?&]v=([^&]+)/) ||
      String(url).match(/youtu\.be\/([^?&]+)/) ||
      String(url).match(/youtube\.com\/embed\/([^?&]+)/);
    return m ? m[1] : "";
  }

  function destroyPanZooms() {
    panZoomList.forEach(function (pz) {
      try {
        pz.destroy();
      } catch (_) {}
    });
    panZoomList = [];
    panZoomByHost = new WeakMap();
    hydratedModal = false;
  }

  function attachPanZoom(host, svg) {
    if (!window.svgPanZoom || !svg || !host) return null;
    // Don't double-init the same host
    if (panZoomByHost.get(host)) return panZoomByHost.get(host);

    try {
      var pz = window.svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.2,
        maxZoom: 12,
        zoomScaleSensitivity: 0.3,
        // Keep mouse wheel zooming the chart, not the page
        mouseWheelZoomEnabled: true,
        // Prevent dbl-click zoom fighting Owl
        dblClickZoomEnabled: true,
      });
      panZoomByHost.set(host, pz);
      panZoomList.push(pz);
      return pz;
    } catch (err) {
      console.warn("svgPanZoom init failed", err);
      return null;
    }
  }

  function blockOwlOnHost(host) {
    if (!host || host.dataset.owlBlocked) return;
    host.dataset.owlBlocked = "1";
    ["mousedown", "touchstart", "pointerdown", "click", "wheel"].forEach(function (evt) {
      host.addEventListener(
        evt,
        function (e) {
          e.stopPropagation();
        },
        { passive: false }
      );
    });
  }

  function extractSvgMarkup(text) {
    var raw = String(text || "").trim();
    if (!raw) return "";
    var start = raw.indexOf("<svg");
    var end = raw.lastIndexOf("</svg>");
    if (start === -1 || end === -1) return "";
    return raw.slice(start, end + 6);
  }

  function applySvgToHost(host, svgHtml) {
    if (!host) return;
    // Already live — never wipe (that destroys zoom state)
    if (host.dataset.rendered === "1" && host.querySelector("svg") && panZoomByHost.get(host)) {
      return;
    }

    host.innerHTML = svgHtml;
    var svg = host.querySelector("svg");
    if (!svg) {
      host.innerHTML = '<div class="flowchart-error">Invalid SVG flowchart</div>';
      return;
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.maxWidth = "100%";
    svg.style.maxHeight = "100%";
    attachPanZoom(host, svg);
    blockOwlOnHost(host);
    host.dataset.rendered = "1";
  }

  async function renderFlowchartSlide($item) {
    var $gallery = $item.closest(".portfolio_gallery");
    var src = $item.attr("data-flowchart-src");
    var host = $item.find(".flowchart-host")[0];
    if (!host || !src) return;
    if (host.dataset.rendered === "1" && host.querySelector("svg") && panZoomByHost.get(host)) {
      return;
    }

    host.innerHTML = '<div class="flowchart-loading">Loading flowchart…</div>';

    if (!/\.svg(\?|#|$)/i.test(src)) {
      host.innerHTML =
        '<div class="flowchart-error">Flowchart must be a local .svg file<br><small>' +
        src +
        "</small></div>";
      return;
    }

    if (!window.svgPanZoom) {
      host.innerHTML =
        '<div class="flowchart-error">svg-pan-zoom failed to load</div>';
      return;
    }

    try {
      var res = await fetch(src, { cache: "force-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + src);
      var text = await res.text();
      var svgHtml = extractSvgMarkup(text);
      if (!svgHtml) throw new Error("No <svg> found in " + src);

      var selector =
        '.gallery_item[data-type="flowchart"][data-flowchart-src="' +
        src.replace(/"/g, '\\"') +
        '"] .flowchart-host';
      var targets = $gallery.length ? $gallery.find(selector) : $(host);
      targets.each(function () {
        applySvgToHost(this, svgHtml);
      });
    } catch (err) {
      console.warn("flowchart render failed", src, err);
      host.innerHTML =
        '<div class="flowchart-error">Failed to load flowchart<br><small>' +
        String(err.message || err) +
        "</small></div>";
    }
  }

  function renderYoutubeSlide($item) {
    var host = $item.find(".youtube-host")[0];
    if (!host) {
      host = document.createElement("div");
      host.className = "youtube-host";
      $item.prepend(host);
    }
    if (host.dataset.rendered === "1") return;
    var url = $item.attr("data-youtube") || "";
    var id = youtubeId(url);
    if (!id) {
      host.innerHTML = '<div class="flowchart-error">Invalid YouTube URL</div>';
      return;
    }
    host.innerHTML =
      '<iframe src="https://www.youtube.com/embed/' +
      id +
      '" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>';
    host.dataset.rendered = "1";
  }

  function renderPptSlide($item) {
    var host = $item.find(".ppt-host")[0];
    if (!host) {
      host = document.createElement("div");
      host.className = "ppt-host";
      $item.prepend(host);
    }
    if (host.dataset.rendered === "1") return;
    var url = $item.attr("data-ppt") || "#";
    host.innerHTML =
      '<a href="' +
      url +
      '" target="_blank" rel="noopener noreferrer">Open presentation <i class="fal fa-arrow-right"></i></a>';
    host.dataset.rendered = "1";
  }

  async function hydrateGallery($gallery) {
    var tasks = [];
    var seenSrc = {};

    $gallery.find('.gallery_item[data-type="flowchart"]').each(function () {
      var $item = $(this);
      var src = $item.attr("data-flowchart-src") || "";
      if (src && seenSrc[src]) return;
      if (src) seenSrc[src] = true;
      tasks.push(renderFlowchartSlide($item));
    });

    $gallery.find('.gallery_item[data-type="youtube"]').each(function () {
      renderYoutubeSlide($(this));
    });
    $gallery.find('.gallery_item[data-type="ppt"]').each(function () {
      renderPptSlide($(this));
    });

    await Promise.all(tasks);
  }

  function refreshOwlLayout($gallery) {
    if (!$gallery || !$gallery.length) return;
    $gallery.each(function () {
      var $g = $(this);
      if ($g.hasClass("owl-loaded")) {
        $g.trigger("refresh.owl.carousel");
      } else if ($.fn.owlCarousel) {
        $g.owlCarousel({
          items: 2,
          loop: true,
          lazyLoad: true,
          center: true,
          autoplay: false,
          smartSpeed: 800,
          margin: 30,
          nav: false,
          dots: true,
          mouseDrag: true,
          touchDrag: true,
          pullDrag: true,
          responsive: {
            0: { items: 1, margin: 0 },
            768: { items: 2, margin: 20 },
            992: { items: 2, margin: 30 },
          },
        });
      }
    });
  }

  /** Only resize pan-zoom to new box size — never fit/center (that resets user zoom). */
  function softResizePanZooms() {
    panZoomList.forEach(function (pz) {
      try {
        pz.resize();
      } catch (_) {}
    });
  }

  function hostsNeedHydrate($galleries) {
    var need = false;
    $galleries.find(".flowchart-host").each(function () {
      if (this.dataset.rendered !== "1" || !this.querySelector("svg") || !panZoomByHost.get(this)) {
        need = true;
      }
    });
    return need;
  }

  async function onModalOpen() {
    if (hydrating) return;

    var $content = $(".mfp-content");
    if (!$content.length) return;

    var $galleries = $content.find(".portfolio_gallery.owl-carousel");
    if (!$galleries.length) return;

    // Already good — do nothing (CRITICAL: don't refreshOwl/fit, that resets zoom)
    if (hydratedModal && !hostsNeedHydrate($galleries)) {
      return;
    }

    hydrating = true;
    try {
      if (hostsNeedHydrate($galleries)) {
        $galleries.find(".flowchart-host").each(function () {
          if (this.dataset.rendered === "1" && this.querySelector("svg") && panZoomByHost.get(this)) {
            return;
          }
          delete this.dataset.rendered;
          this.innerHTML = '<div class="flowchart-loading">Loading flowchart…</div>';
        });

        await hydrateGallery($galleries);
        refreshOwlLayout($galleries);

        // One soft resize after Owl settles — no fit/center
        setTimeout(function () {
          softResizePanZooms();
          // Owl may clone nodes after refresh; re-apply SVG to empty clones only
          hydrateGallery($galleries).then(function () {
            softResizePanZooms();
          });
        }, 220);
      }

      hydratedModal = true;
    } catch (e) {
      console.warn("gallery hydrate failed", e);
    } finally {
      hydrating = false;
    }
  }

  function boot() {
    if (!window.jQuery) return;

    var hydrateTimer = null;
    function scheduleHydrate() {
      clearTimeout(hydrateTimer);
      hydrateTimer = setTimeout(function () {
        onModalOpen();
      }, 150);
    }

    $(document).on("mfpOpen.portfolioGallery", function () {
      hydratedModal = false;
      scheduleHydrate();
      // One delayed retry for late Owl init — still no fit/center loop
      setTimeout(scheduleHydrate, 500);
    });

    $(document).on("click.portfolioGallery", ".modal-popup", function () {
      hydratedModal = false;
      scheduleHydrate();
      setTimeout(scheduleHydrate, 500);
    });

    $(document).on("mfpClose.portfolioGallery", function () {
      destroyPanZooms();
    });

    // Re-hydrate empty Owl clones after slide change — never fit/center
    $(document).on("translated.owl.carousel.portfolioGallery", ".portfolio_gallery", function () {
      var $g = $(this);
      if (!$g.closest(".mfp-content").length) return;
      hydrateGallery($g).then(softResizePanZooms);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.jQuery);
