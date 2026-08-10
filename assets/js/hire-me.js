/**
 * Hire Me overlay — Quill (light) + Web3Forms → Gmail (asrofilnadibs28@gmail.com).
 *
 * Access key resolution (first match wins):
 * 1. ACCESS_KEY constant below (non-placeholder)
 * 2. GET /api/hire-config → WEB3FORMS_ACCESS_KEY from .env / Vercel
 *
 * Create key: https://web3forms.com → email asrofilnadibs28@gmail.com
 */
(function () {
  "use strict";

  // Optional hard-coded key (client-side by design). Prefer .env via /api/hire-config.
  var ACCESS_KEY = "";

  var overlay = null;
  var formEl = null;
  var statusEl = null;
  var submitBtn = null;
  var quill = null;
  var sending = false;
  var resolvedKey = "";
  var keyPromise = null;

  function looksLikeKey(value) {
    var k = String(value || "").trim();
    return k.length > 20 && k.indexOf("PLACEHOLDER") === -1;
  }

  function loadAccessKey() {
    if (keyPromise) return keyPromise;
    if (looksLikeKey(ACCESS_KEY)) {
      resolvedKey = ACCESS_KEY.trim();
      keyPromise = Promise.resolve(resolvedKey);
      return keyPromise;
    }
    keyPromise = fetch("/api/hire-config")
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        if (result.ok && result.data && looksLikeKey(result.data.accessKey)) {
          resolvedKey = String(result.data.accessKey).trim();
          return resolvedKey;
        }
        resolvedKey = "";
        return "";
      })
      .catch(function () {
        resolvedKey = "";
        return "";
      });
    return keyPromise;
  }

  function ensureOverlay() {
    if (overlay) return;
    overlay = document.createElement("div");
    overlay.className = "hire-me-overlay";
    overlay.id = "hire-me-overlay";
    overlay.innerHTML =
      '<div class="hire-me-dialog" role="dialog" aria-modal="true" aria-labelledby="hire-me-title">' +
      '<div class="hire-me-header">' +
      '<h3 id="hire-me-title">Hire Me</h3>' +
      '<button type="button" class="hire-me-close" aria-label="Close">&times;</button>' +
      "</div>" +
      '<div class="hire-me-body">' +
      '<form class="hire-me-form" novalidate>' +
      '<div class="hire-me-field">' +
      '<label for="hire-name">Name</label>' +
      '<input id="hire-name" name="name" type="text" autocomplete="name" required placeholder="Your name">' +
      "</div>" +
      '<div class="hire-me-field">' +
      '<label for="hire-email">Email</label>' +
      '<input id="hire-email" name="email" type="email" autocomplete="email" required placeholder="you@example.com">' +
      "</div>" +
      '<div class="hire-me-field">' +
      '<label for="hire-subject">Subject</label>' +
      '<input id="hire-subject" name="subject" type="text" required placeholder="Project / role inquiry">' +
      "</div>" +
      '<div class="hire-me-field">' +
      "<label>Message</label>" +
      '<div class="hire-me-editor-wrap"><div id="hire-message-editor"></div></div>' +
      "</div>" +
      '<input class="hire-me-hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off">' +
      '<div class="hire-me-actions">' +
      '<button type="submit" class="hire-me-submit">Send Message</button>' +
      '<p class="hire-me-status" aria-live="polite"></p>' +
      "</div>" +
      "</form>" +
      "</div>" +
      "</div>";
    document.body.appendChild(overlay);
    formEl = overlay.querySelector(".hire-me-form");
    statusEl = overlay.querySelector(".hire-me-status");
    submitBtn = overlay.querySelector(".hire-me-submit");

    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeOverlay();
    });
    overlay.querySelector(".hire-me-close").addEventListener("click", closeOverlay);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && overlay.classList.contains("is-open")) {
        e.stopPropagation();
        closeOverlay();
      }
    });
    formEl.addEventListener("submit", onSubmit);
  }

  function initQuill() {
    if (quill) return;
    if (typeof Quill === "undefined") {
      setStatus("Editor failed to load. Refresh and try again.", true);
      return;
    }
    quill = new Quill("#hire-message-editor", {
      theme: "snow",
      placeholder: "Tell me about the role, project, or timeline…",
      modules: {
        toolbar: [
          ["bold", "italic", "underline"],
          [{ list: "ordered" }, { list: "bullet" }],
          ["link"],
        ],
      },
    });
  }

  function openOverlay() {
    ensureOverlay();
    initQuill();
    setStatus("", false);
    loadAccessKey();
    overlay.classList.add("is-open");
    var nameInput = overlay.querySelector("#hire-name");
    if (nameInput) nameInput.focus();
  }

  function closeOverlay() {
    if (!overlay) return;
    overlay.classList.remove("is-open");
  }

  function setStatus(msg, isError, isSuccess) {
    if (!statusEl) return;
    statusEl.textContent = msg || "";
    statusEl.classList.toggle("is-error", !!isError);
    statusEl.classList.toggle("is-success", !!isSuccess && !isError);
  }

  function messageHtml() {
    if (!quill) return "";
    var html = String(quill.root.innerHTML || "").trim();
    var text = String(quill.getText() || "")
      .replace(/\u00a0/g, " ")
      .trim();
    if (!text) return "";
    if (html === "<p><br></p>" || html === "<p></p>") return "";
    return html;
  }

  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
  }

  function onSubmit(e) {
    e.preventDefault();
    if (sending) return;

    var name = String(formEl.querySelector("#hire-name").value || "").trim();
    var email = String(formEl.querySelector("#hire-email").value || "").trim();
    var subject = String(formEl.querySelector("#hire-subject").value || "").trim();
    var message = messageHtml();
    var botcheck = formEl.querySelector('[name="botcheck"]');

    if (!name || !email || !subject || !message) {
      setStatus("Lengkapi name, email, subject, dan message.", true);
      return;
    }
    if (!validEmail(email)) {
      setStatus("Format email pengirim tidak valid.", true);
      return;
    }
    if (botcheck && botcheck.checked) {
      setStatus("Blocked.", true);
      return;
    }

    sending = true;
    submitBtn.disabled = true;
    setStatus("Sending…", false);

    loadAccessKey()
      .then(function (key) {
        if (!looksLikeKey(key)) {
          throw new Error(
            "Web3Forms belum dikonfigurasi. Set WEB3FORMS_ACCESS_KEY di .env (lokal) / Vercel, atau ACCESS_KEY di hire-me.js."
          );
        }

        var payload = {
          access_key: key,
          name: name,
          email: email,
          subject: subject,
          message: message,
          from_name: name,
          replyto: email,
        };

        return fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        }).then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        });
      })
      .then(function (result) {
        if (result.ok && result.data && result.data.success) {
          setStatus("Message sent. I’ll get back to you via email.", false, true);
          formEl.reset();
          if (quill) quill.setText("");
          return;
        }
        var err =
          (result.data && (result.data.message || result.data.error)) ||
          "Failed to send. Try again later.";
        setStatus(String(err), true);
      })
      .catch(function (err) {
        setStatus(
          (err && err.message) || "Network error. Check connection and try again.",
          true
        );
      })
      .finally(function () {
        sending = false;
        submitBtn.disabled = false;
      });
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".btn-hire-me");
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    openOverlay();
  });
})();
