/**
 * Portfolio image zoom fallback (works on file:// and nested inside Magnific Popup).
 * PhotoSwipe takes over when its ESM module loads (http/https / Vercel).
 */
(function () {
  "use strict";

  var LINK_CLASS = "portfolio-pswp-link";
  var preferPhotoSwipe = false;
  var overlay = null;
  var imgEl = null;
  var counterEl = null;
  var items = [];
  var index = 0;

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "portfolio-simple-zoom";
    overlay.innerHTML =
      '<button type="button" class="psz-close" aria-label="Close">&times;</button>' +
      '<button type="button" class="psz-prev" aria-label="Previous">&#10094;</button>' +
      '<button type="button" class="psz-next" aria-label="Next">&#10095;</button>' +
      '<div class="psz-stage"><img alt=""></div>' +
      '<div class="psz-counter"></div>';
    document.body.appendChild(overlay);
    imgEl = overlay.querySelector("img");
    counterEl = overlay.querySelector(".psz-counter");

    overlay.querySelector(".psz-close").addEventListener("click", closeZoom);
    overlay.querySelector(".psz-prev").addEventListener("click", function (e) {
      e.stopPropagation();
      show(index - 1);
    });
    overlay.querySelector(".psz-next").addEventListener("click", function (e) {
      e.stopPropagation();
      show(index + 1);
    });
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay || e.target.classList.contains("psz-stage")) closeZoom();
    });
    document.addEventListener("keydown", function (e) {
      if (!overlay.classList.contains("is-open")) return;
      if (e.key === "Escape") closeZoom();
      if (e.key === "ArrowLeft") show(index - 1);
      if (e.key === "ArrowRight") show(index + 1);
    });
  }

  function show(i) {
    if (!items.length) return;
    index = (i + items.length) % items.length;
    imgEl.src = items[index].src;
    imgEl.alt = items[index].title || "";
    counterEl.textContent = index + 1 + " / " + items.length;
    var multi = items.length > 1;
    overlay.querySelector(".psz-prev").style.display = multi ? "flex" : "none";
    overlay.querySelector(".psz-next").style.display = multi ? "flex" : "none";
  }

  function openZoom(list, startIndex) {
    ensureOverlay();
    items = list;
    overlay.classList.add("is-open");
    document.body.style.overflow = "hidden";
    show(startIndex || 0);
  }

  function closeZoom() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
    document.body.style.overflow = "";
    imgEl.removeAttribute("src");
  }

  function wrapImage(img) {
    if (!img || img.closest("a." + LINK_CLASS)) return img.closest("a." + LINK_CLASS);
    var src = img.currentSrc || img.src;
    if (!src) return null;

    var link = document.createElement("a");
    link.href = src;
    link.className = LINK_CLASS;
    link.setAttribute("data-pswp-src", src);
    link.style.cursor = "zoom-in";
    link.style.display = "block";
    link.style.maxWidth = "100%";
    if (img.alt) link.dataset.pswpCaption = img.alt;

    img.parentNode.insertBefore(link, img);
    link.appendChild(img);

    function applySize() {
      link.dataset.pswpWidth = String(img.naturalWidth || 1600);
      link.dataset.pswpHeight = String(img.naturalHeight || 1000);
    }
    if (img.complete) applySize();
    else img.addEventListener("load", applySize, { once: true });
    return link;
  }

  function prepareContainer(container) {
    if (!container) return;
    container
      .querySelectorAll(".popup_modal_img img, .portfolio_gallery .gallery_item img, .gallery_item img")
      .forEach(wrapImage);
  }

  function onClick(e) {
    var link = e.target.closest("a." + LINK_CLASS);
    if (!link) return;

    // Let PhotoSwipe handle when its lightboxes are active
    if (preferPhotoSwipe && window.PortfolioPhotoSwipe && window.PortfolioPhotoSwipe.lightboxes.length) {
      return;
    }

    // Block Owl Carousel / Magnific from treating this as swipe/nav
    e.preventDefault();
    e.stopPropagation();
    if (typeof e.stopImmediatePropagation === "function") e.stopImmediatePropagation();

    var container =
      link.closest(".mfp-content .popup_content_area") ||
      link.closest(".popup_content_area") ||
      link.closest(".mfp-content");
    if (!container) return;

    prepareContainer(container);
    var links = Array.prototype.slice.call(container.querySelectorAll("a." + LINK_CLASS));
    var list = links.map(function (a) {
      return { src: a.getAttribute("href"), title: a.dataset.pswpCaption || "" };
    });
    openZoom(list, Math.max(0, links.indexOf(link)));
  }

  window.PortfolioImageZoom = {
    prepare: prepareContainer,
    initIn: prepareContainer,
  };

  window.__enablePortfolioPhotoSwipe = function () {
    preferPhotoSwipe = true;
  };

  function boot() {
    document.addEventListener("click", onClick, true);
    document.querySelectorAll(".popup_content_area").forEach(prepareContainer);

    if (window.jQuery) {
      jQuery(document).on("mfpOpen.portfolioZoom", function () {
        setTimeout(function () {
          var content = document.querySelector(".mfp-content .popup_content_area, .mfp-content");
          if (content) prepareContainer(content);
        }, 30);
      });
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
