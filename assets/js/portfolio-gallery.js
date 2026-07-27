/**
 * PAS portfolio media gallery extras (flowchart / youtube / ppt)
 * Flowcharts: static local SVG + svg-pan-zoom (no Mermaid runtime).
 * Owl Carousel stays owned by main.js — this only hydrates media then refreshes.
 */
(function ($) {
  "use strict";

  var panZoomInstances = [];

  function youtubeId(url) {
    if (!url) return "";
    var m =
      String(url).match(/[?&]v=([^&]+)/) ||
      String(url).match(/youtu\.be\/([^?&]+)/) ||
      String(url).match(/youtube\.com\/embed\/([^?&]+)/);
    return m ? m[1] : "";
  }

  function destroyPanZooms() {
    panZoomInstances.forEach(function (pz) {
      try {
        pz.destroy();
      } catch (_) {}
    });
    panZoomInstances = [];
  }

  function attachPanZoom(svg) {
    if (!window.svgPanZoom || !svg) return null;
    try {
      var pz = window.svgPanZoom(svg, {
        zoomEnabled: true,
        controlIconsEnabled: true,
        fit: true,
        center: true,
        minZoom: 0.35,
        maxZoom: 10,
      });
      panZoomInstances.push(pz);
      return pz;
    } catch (_) {
      return null;
    }
  }

  function blockOwlOnHost(host) {
    if (!host || host.dataset.owlBlocked) return;
    host.dataset.owlBlocked = "1";
    ["mousedown", "touchstart", "pointerdown"].forEach(function (evt) {
      host.addEventListener(
        evt,
        function (e) {
          e.stopPropagation();
        },
        { passive: true }
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
    attachPanZoom(svg);
    blockOwlOnHost(host);
    host.dataset.rendered = "1";
  }

  async function renderFlowchartSlide($item) {
    var $gallery = $item.closest(".portfolio_gallery");
    var src = $item.attr("data-flowchart-src");
    var host = $item.find(".flowchart-host")[0];
    if (!host || !src) return;
    if (host.dataset.rendered === "1" && host.querySelector("svg")) return;

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
      var res = await fetch(src, { cache: "no-cache" });
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

  function refreshOwl($gallery) {
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
    panZoomInstances.forEach(function (pz) {
      try {
        pz.resize();
        pz.fit();
        pz.center();
      } catch (_) {}
    });
  }

  async function onModalOpen() {
    var $content = $(".mfp-content");
    if (!$content.length) return;

    var $galleries = $content.find(".portfolio_gallery.owl-carousel");
    if (!$galleries.length) return;

    // Skip full wipe if already hydrated (retry pass)
    var needsHydrate = false;
    $galleries.find(".flowchart-host").each(function () {
      if (this.dataset.rendered !== "1" || !this.querySelector("svg")) {
        needsHydrate = true;
        delete this.dataset.rendered;
        if (!this.querySelector(".flowchart-loading")) {
          this.innerHTML = '<div class="flowchart-loading">Loading flowchart…</div>';
        }
      }
    });
    if (!needsHydrate) {
      refreshOwl($galleries);
      return;
    }

    destroyPanZooms();

    try {
      await hydrateGallery($galleries);
    } catch (e) {
      console.warn("gallery hydrate failed", e);
    }

    refreshOwl($galleries);
    setTimeout(function () {
      refreshOwl($galleries);
    }, 200);
  }

  function boot() {
    if (!window.jQuery) return;

    var hydrateTimer = null;
    function scheduleHydrate() {
      clearTimeout(hydrateTimer);
      hydrateTimer = setTimeout(function () {
        onModalOpen();
        setTimeout(onModalOpen, 350);
        setTimeout(onModalOpen, 800);
      }, 80);
    }

    $(document).on("mfpOpen.portfolioGallery", scheduleHydrate);
    // Backup: some Magnific opens don't bubble mfpOpen reliably with inline clones
    $(document).on("click.portfolioGallery", ".modal-popup", function () {
      scheduleHydrate();
    });

    $(document).on("mfpClose.portfolioGallery", function () {
      destroyPanZooms();
    });

    if (typeof MutationObserver !== "undefined") {
      var moTimer = null;
      var mo = new MutationObserver(function () {
        if (!document.querySelector(".mfp-ready .portfolio_gallery .flowchart-host")) return;
        clearTimeout(moTimer);
        moTimer = setTimeout(scheduleHydrate, 100);
      });
      mo.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.jQuery);
