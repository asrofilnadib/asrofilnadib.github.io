/**
 * PAS portfolio media gallery extras (flowchart / youtube / ppt)
 * Owl Carousel stays owned by main.js — this only hydrates media then refreshes.
 */
(function ($) {
  "use strict";

  var panZoomInstances = [];
  var mermaidReady = false;
  var renderSeq = 0;

  function ensureMermaid() {
    if (!window.mermaid) return false;
    if (!mermaidReady) {
      try {
        window.mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          flowchart: { htmlLabels: true, curve: "basis" },
        });
        mermaidReady = true;
      } catch (e) {
        console.warn("mermaid init failed", e);
        return false;
      }
    }
    return true;
  }

  function extractMermaidBlocks(markdown) {
    var blocks = [];
    var re = /```mermaid\s*([\s\S]*?)```/gi;
    var m;
    while ((m = re.exec(markdown))) {
      var body = String(m[1] || "").trim();
      if (!body) continue;
      body = body.replace(/^---[\s\S]*?---\s*/m, "").trim();
      if (body) blocks.push(body);
    }
    return blocks;
  }

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
        minZoom: 0.4,
        maxZoom: 8,
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
    ["mousedown", "touchstart", "pointerdown", "wheel"].forEach(function (evt) {
      host.addEventListener(
        evt,
        function (e) {
          e.stopPropagation();
        },
        { passive: false }
      );
    });
  }

  async function renderFlowchartSlide($item) {
    var host = $item.find(".flowchart-host")[0];
    if (!host) return;
    if (host.dataset.rendered === "1") return;

    var src = $item.attr("data-flowchart-src");
    if (!src) {
      host.innerHTML = '<div class="flowchart-error">Missing flowchart source</div>';
      return;
    }

    host.innerHTML = '<div class="flowchart-loading">Loading flowchart…</div>';

    if (!ensureMermaid()) {
      host.innerHTML = '<div class="flowchart-error">Mermaid library not loaded</div>';
      return;
    }

    try {
      var res = await fetch(src, { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      var md = await res.text();
      var blocks = extractMermaidBlocks(md);
      if (!blocks.length) throw new Error("No mermaid block found");

      var code = blocks[0];
      var id = "pf-mermaid-" + ++renderSeq + "-" + Date.now();
      var out = await window.mermaid.render(id, code);
      host.innerHTML = out.svg || out;
      var svg = host.querySelector("svg");
      if (svg) {
        svg.removeAttribute("height");
        svg.style.width = "100%";
        svg.style.height = "100%";
        attachPanZoom(svg);
      }
      blockOwlOnHost(host);
      host.dataset.rendered = "1";
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
    $gallery.find(".gallery_item").each(function () {
      var $item = $(this);
      var type = $item.attr("data-type") || "image";
      if (type === "flowchart") tasks.push(renderFlowchartSlide($item));
      else if (type === "youtube") renderYoutubeSlide($item);
      else if (type === "ppt") renderPptSlide($item);
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
        // Fallback if somehow not inited by main.js
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
          mouseDrag: false,
          touchDrag: true,
          pullDrag: false,
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

    destroyPanZooms();

    var $galleries = $content.find(".portfolio_gallery.owl-carousel");
    if (!$galleries.length) return;

    // Allow re-render when the same modal is opened again after close
    $galleries.find(".flowchart-host").each(function () {
      delete this.dataset.rendered;
    });

    try {
      await hydrateGallery($galleries);
    } catch (e) {
      console.warn("gallery hydrate failed", e);
    }

    refreshOwl($galleries);
    setTimeout(function () {
      refreshOwl($galleries);
    }, 150);
  }

  function boot() {
    if (!window.jQuery) return;

    $(document).on("mfpOpen.portfolioGallery", function () {
      setTimeout(function () {
        onModalOpen();
      }, 80);
    });

    $(document).on("mfpClose.portfolioGallery", function () {
      destroyPanZooms();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.jQuery);
