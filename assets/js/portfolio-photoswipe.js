/**
 * PhotoSwipe module layer (needs http/https — not file://).
 * Falls back is handled by portfolio-image-zoom.js
 */
import PhotoSwipeLightbox from "./photoswipe/photoswipe-lightbox.esm.min.js";
import PhotoSwipe from "./photoswipe/photoswipe.esm.min.js";

const GALLERY_SELECTOR = ".popup_content_area";
const LINK_CLASS = "portfolio-pswp-link";

function prepareViaShared(container) {
  if (window.PortfolioImageZoom && typeof window.PortfolioImageZoom.prepare === "function") {
    window.PortfolioImageZoom.prepare(container);
    return;
  }
  if (!container) return;
  container
    .querySelectorAll(".popup_modal_img img, .portfolio_gallery .gallery_item img, .gallery_item img")
    .forEach((img) => {
      if (img.closest("a." + LINK_CLASS)) return;
      const src = img.currentSrc || img.src;
      if (!src) return;
      const link = document.createElement("a");
      link.href = src;
      link.className = LINK_CLASS;
      link.dataset.pswpSrc = src;
      link.style.cursor = "zoom-in";
      link.style.display = "block";
      link.style.maxWidth = "100%";
      if (img.alt) link.dataset.pswpCaption = img.alt;
      img.parentNode.insertBefore(link, img);
      link.appendChild(img);
      const apply = () => {
        link.dataset.pswpWidth = String(img.naturalWidth || 1600);
        link.dataset.pswpHeight = String(img.naturalHeight || 1000);
      };
      if (img.complete) apply();
      else img.addEventListener("load", apply, { once: true });
    });
}

window.PortfolioPhotoSwipe = {
  lightboxes: [],
  destroyAll() {
    this.lightboxes.forEach((lb) => {
      try {
        lb.destroy();
      } catch (_) {}
    });
    this.lightboxes = [];
    document.querySelectorAll(".pswp").forEach((el) => el.remove());
  },
  initIn(container) {
    if (!container) return;
    prepareViaShared(container);

    const galleries = [];
    if (container.matches && container.matches(GALLERY_SELECTOR)) galleries.push(container);
    else container.querySelectorAll(GALLERY_SELECTOR).forEach((el) => galleries.push(el));
    if (!galleries.length && container.querySelector("a." + LINK_CLASS)) galleries.push(container);

    galleries.forEach((galleryEl) => {
      if (!galleryEl.querySelector("a." + LINK_CLASS)) return;

      const lb = new PhotoSwipeLightbox({
        gallery: galleryEl,
        children: "a." + LINK_CLASS,
        pswpModule: PhotoSwipe,
        wheelToZoom: true,
        bgOpacity: 0.92,
        padding: { top: 24, bottom: 40, left: 16, right: 16 },
      });

      lb.on("uiRegister", () => {
        lb.pswp.ui.registerElement({
          name: "portfolio-caption",
          order: 9,
          isButton: false,
          appendTo: "root",
          html: '<div class="portfolio-pswp-caption"></div>',
          onInit: (el, pswp) => {
            const update = () => {
              const slideEl = pswp.currSlide && pswp.currSlide.data.element;
              const cap = slideEl ? slideEl.dataset.pswpCaption || "" : "";
              const capEl = el.querySelector(".portfolio-pswp-caption");
              if (capEl) capEl.textContent = cap;
            };
            pswp.on("change", update);
            pswp.on("firstUpdate", update);
          },
        });
      });

      lb.init();
      this.lightboxes.push(lb);
    });
  },
  initAll() {
    this.destroyAll();
    document.querySelectorAll(GALLERY_SELECTOR).forEach((el) => this.initIn(el));
  },
};

function boot() {
  if (typeof window.__enablePortfolioPhotoSwipe === "function") {
    window.__enablePortfolioPhotoSwipe();
  }
  window.PortfolioPhotoSwipe.initAll();

  if (window.jQuery) {
    jQuery(document).on("mfpOpen.portfolioPswp", function () {
      setTimeout(function () {
        const content = document.querySelector(".mfp-content .popup_content_area, .mfp-content");
        if (!content) return;
        window.PortfolioPhotoSwipe.destroyAll();
        window.PortfolioPhotoSwipe.initIn(content);
      }, 60);
    });
    jQuery(document).on("mfpClose.portfolioPswp", function () {
      window.PortfolioPhotoSwipe.destroyAll();
      setTimeout(function () {
        window.PortfolioPhotoSwipe.initAll();
      }, 120);
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
