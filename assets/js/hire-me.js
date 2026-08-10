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

  // Web3Forms access key (client-side by design). Recipient: asrofilnadibs28@gmail.com
  var ACCESS_KEY = "4929b1b2-7ec5-42f9-9af3-9b550331d9b0";

  var overlay = null;
  var formEl = null;
  var statusEl = null;
  var submitBtn = null;
  var quill = null;
  var sending = false;
  var resolvedKey = "";
  var keyPromise = null;
  var lastSentAt = 0;
  var MIN_SEND_GAP_MS = 45000; // basic client rate-limit

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
      '<div class="hire-me-field hire-me-captcha-field">' +
      '<div class="h-captcha" data-captcha="true" data-theme="dark"></div>' +
      "</div>" +
      '<input class="hire-me-hp" type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" aria-hidden="true">' +
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

    if (!document.querySelector('script[data-hire-hcaptcha]')) {
      var s = document.createElement("script");
      s.src = "https://web3forms.com/client/script.js";
      s.async = true;
      s.defer = true;
      s.setAttribute("data-hire-hcaptcha", "1");
      document.body.appendChild(s);
    }

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

  function messagePlain() {
    if (!quill) return "";
    return String(quill.getText() || "")
      .replace(/\u00a0/g, " ")
      .trim();
  }

  // Web3Forms free escapes HTML — use Unicode letterforms so Gmail still shows bold/italic.
  function styleChar(ch, bold, italic) {
    var code = ch.codePointAt(0);
    if (code == null) return ch;

    // A-Z
    if (code >= 65 && code <= 90) {
      var i = code - 65;
      if (bold && italic) return String.fromCodePoint(0x1d468 + i);
      if (bold) return String.fromCodePoint(0x1d400 + i);
      if (italic) return String.fromCodePoint(0x1d434 + i);
    }
    // a-z (italic h is special-cased)
    if (code >= 97 && code <= 122) {
      var j = code - 97;
      if (bold && italic) return String.fromCodePoint(0x1d482 + j);
      if (bold) return String.fromCodePoint(0x1d41a + j);
      if (italic) {
        if (ch === "h") return "\u210e"; // ℎ
        return String.fromCodePoint(0x1d44e + j);
      }
    }
    // 0-9 bold only
    if (bold && code >= 48 && code <= 57) {
      return String.fromCodePoint(0x1d7ce + (code - 48));
    }
    return ch;
  }

  function styleText(text, attrs) {
    attrs = attrs || {};
    var bold = !!attrs.bold;
    var italic = !!attrs.italic;
    var underline = !!attrs.underline;
    // Combining underline (U+0332) breaks on Mathematical Italic/Bold glyphs in Gmail → tofu boxes.
    // Only apply combining underline on plain ASCII; otherwise wrap with underscores.
    var useCombiningUnderline = underline && !bold && !italic;
    var useWrapUnderline = underline && (bold || italic);
    var out = "";
    for (var i = 0; i < text.length; ) {
      var cp = text.codePointAt(i);
      var ch = String.fromCodePoint(cp);
      i += cp > 0xffff ? 2 : 1;
      if (ch === "\n") {
        out += ch;
        continue;
      }
      var styled = styleChar(ch, bold, italic);
      if (useCombiningUnderline && styled !== " " && styled !== "\t") {
        styled += "\u0332";
      }
      out += styled;
    }
    if (useWrapUnderline && out) {
      out = "_" + out + "_";
    }
    return out;
  }

  /**
   * Quill delta → email-safe text with visible bold/italic/underline + lists/links.
   * Web3Forms escapes HTML tags, so Unicode styling is the free-plan workaround.
   */
  function messageForEmail() {
    if (!quill || typeof quill.getContents !== "function") return messagePlain();

    var ops = (quill.getContents() && quill.getContents().ops) || [];
    var lines = [];
    var line = "";
    var olCount = 0;
    var pendingList = null;

    function flushLine(lineAttrs) {
      lineAttrs = lineAttrs || {};
      var list = lineAttrs.list;
      var content = line;
      if (list === "ordered") {
        if (pendingList !== "ordered") olCount = 0;
        olCount += 1;
        pendingList = "ordered";
        content = olCount + ". " + content;
      } else if (list === "bullet") {
        pendingList = "bullet";
        content = "• " + content;
      } else {
        pendingList = null;
        olCount = 0;
      }
      lines.push(content);
      line = "";
    }

    ops.forEach(function (op) {
      var insert = op.insert;
      var attrs = op.attributes || {};
      if (typeof insert !== "string") {
        if (insert && insert.image) line += "[image]";
        return;
      }

      var parts = insert.split("\n");
      for (var p = 0; p < parts.length; p++) {
        if (p > 0) {
          // newline attributes apply to the line that just ended
          flushLine(attrs);
        }
        if (parts[p]) {
          var chunk = parts[p];
          if (attrs.link) {
            var labeled = styleText(chunk, attrs);
            line += labeled + " (" + attrs.link + ")";
          } else {
            line += styleText(chunk, attrs);
          }
        }
      }
    });

    if (line) flushLine({});

    return lines
      .join("\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
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
    var message = messageForEmail();
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

    var now = Date.now();
    if (now - lastSentAt < MIN_SEND_GAP_MS) {
      setStatus("Tunggu sebentar sebelum kirim lagi (anti-spam).", true);
      return;
    }

    var captchaEl = formEl.querySelector('[name="h-captcha-response"]');
    var captchaToken = captchaEl ? String(captchaEl.value || "").trim() : "";
    if (!captchaToken) {
      setStatus("Centang hCaptcha dulu sebelum kirim.", true);
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
          subject: "Hire Me — " + subject,
          message: message,
          from_name: "Portfolio Hire Me",
          replyto: email,
          "h-captcha-response": captchaToken,
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
          lastSentAt = Date.now();
          setStatus("Message sent. I’ll get back to you via email.", false, true);
          formEl.reset();
          if (quill) quill.setText("");
          if (window.hcaptcha && typeof window.hcaptcha.reset === "function") {
            try {
              window.hcaptcha.reset();
            } catch (_) {}
          }
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
