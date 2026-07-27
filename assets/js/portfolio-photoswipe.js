/**
 * Portfolio PhotoSwipe — click-to-zoom for modal hero + gallery images.
 * Assets copied from newpas-master/public/portal/assets/{css,js}/photoswipe/
 */
import PhotoSwipeLightbox from "./photoswipe/photoswipe-lightbox.esm.min.js";
import PhotoSwipe from "./photoswipe/photoswipe.esm.min.js";

const GALLERY_SELECTOR = ".popup_content_area";
const LINK_CLASS = "portfolio-pswp-link";

function wrapImage(img) {
  if (!img || img.closest("a." + LINK_CLASS)) return null;

  const src = img.currentSrc || img.src;
  if (!src) return null;

  const link = document.createElement("a");
  link.href = src;
  link.className = LINK_CLASS;
  link.setAttribute("data-pswp-src", src);
  link.style.cursor = "zoom-in";
  link.style.display = "inline-block";
  link.style.maxWidth = "100%";

  const caption = img.getAttribute("alt") || "";
  if (caption) link.dataset.pswpCaption = caption;

  img.parentNode.insertBefore(link, img);
  link.appendChild(img);

  const applySize = () => {
    if (img.naturalWidth) {
      link.dataset.pswpWidth = String(img.naturalWidth);
      link.dataset.pswpHeight = String(img.naturalHeight);
    } else {
      link.dataset.pswpWidth = link.dataset.pswpWidth || "1600";
      link.dataset.pswpHeight = link.dataset.pswpHeight || "1000";
    }
  };

  if (img.complete) applySize();
  else img.addEventListener("load", applySize, { once: true });

  return link;
}

function prepareContainer(container) {
  if (!container) return;

  container.querySelectorAll(".popup_modal_img img, .portfolio_gallery .gallery_item img, .gallery_item img").forEach(wrapImage);

  // Also allow plain images inside popup content that aren't wrapped yet
  container.querySelectorAll("img").forEach((img) => {
    if (img.closest("a." + LINK_CLASS)) return;
    if (img.closest(".portfolio_info_items")) return;
    if (img.width < 80 && img.height < 80) return;
    if (img.closest(".popup_modal_img, .portfolio_gallery, .gallery_item")) {
      wrapImage(img);
    }
  });
}

window.PortfolioPhotoSwipe = {
  lightboxes: [],
  destroyAll() {
    this.lightboxes.forEach((lb) => {
      try {
        lb.destroy();
      } catch (_) {
        /* ignore */
      }
    });
    this.lightboxes = [];
    document.querySelectorAll(".pswp").forEach((el) => el.remove());
  },
  initIn(container) {
    if (!container) return;
    prepareContainer(container);

    // One lightbox per popup_content_area so gallery slides work together
    const galleries = [];
    if (container.matches && container.matches(GALLERY_SELECTOR)) {
      galleries.push(container);
    } else {
      container.querySelectorAll(GALLERY_SELECTOR).forEach((el) => galleries.push(el));
    }

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
  window.PortfolioPhotoSwipe.initAll();

  // Re-init when Magnific Popup opens (content moved into mfp container)
  if (window.jQuery) {
    jQuery(document).on("mfpOpen", function () {
      setTimeout(function () {
        const content = document.querySelector(".mfp-content .popup_content_area, .mfp-content");
        if (content && window.PortfolioPhotoSwipe) {
          window.PortfolioPhotoSwipe.destroyAll();
          window.PortfolioPhotoSwipe.initIn(content);
        }
      }, 50);
    });
    jQuery(document).on("mfpClose", function () {
      if (window.PortfolioPhotoSwipe) {
        window.PortfolioPhotoSwipe.destroyAll();
        // Restore for inline hidden templates
        setTimeout(function () {
          window.PortfolioPhotoSwipe.initAll();
        }, 100);
      }
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
