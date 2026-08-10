/**
 * Local static + /api server.
 * Loads GITHUB_TOKEN from .env (same key as Vercel).
 *
 * Usage: npm install && npm run dev
 * Open:  http://localhost:3000
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
dotenv.config({ path: path.join(__dirname, ".env") });

const commitsHandler = require("./api/commits.js");
const activityHandler = require("./api/activity.js");
const hireConfigHandler = require("./api/hire-config.js");

const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".pdf": "application/pdf",
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, headers);
  res.end(body);
}

function safeJoin(root, reqPath) {
  const decoded = decodeURIComponent(reqPath.split("?")[0]);
  const cleaned = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const full = path.join(root, cleaned);
  if (!full.startsWith(root)) return null;
  return full;
}

function handleApi(handler, req, res, url) {
  const fakeReq = {
    method: req.method,
    query: Object.fromEntries(url.searchParams.entries()),
  };

  const fakeRes = {
    statusCode: 200,
    headers: {},
    setHeader(k, v) {
      this.headers[k] = v;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      send(this._nodeRes, this.statusCode, JSON.stringify(payload), {
        "Content-Type": "application/json; charset=utf-8",
        ...this.headers,
      });
      return this;
    },
    end(body) {
      send(this._nodeRes, this.statusCode, body || "", this.headers);
      return this;
    },
    _nodeRes: res,
  };

  return handler(fakeReq, fakeRes);
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);

    if (url.pathname === "/api/commits" || url.pathname === "/api/commits.js") {
      return handleApi(commitsHandler, req, res, url);
    }

    if (url.pathname === "/api/activity" || url.pathname === "/api/activity.js") {
      return handleApi(activityHandler, req, res, url);
    }

    if (url.pathname === "/api/hire-config" || url.pathname === "/api/hire-config.js") {
      return handleApi(hireConfigHandler, req, res, url);
    }

    let filePath = safeJoin(ROOT, url.pathname === "/" ? "/index.html" : url.pathname);
    if (!filePath) return send(res, 403, "Forbidden");

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, "index.html");
    }

    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return send(res, 404, "Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const data = fs.readFileSync(filePath);
    send(res, 200, data, { "Content-Type": MIME[ext] || "application/octet-stream" });
  } catch (err) {
    console.error(err);
    send(res, 500, "Internal Server Error");
  }
});

server.listen(PORT, () => {
  const hasToken = Boolean(process.env.GITHUB_TOKEN);
  const hasHireKey = Boolean(process.env.WEB3FORMS_ACCESS_KEY);
  console.log(`Portfolio local server → http://localhost:${PORT}`);
  console.log(`GITHUB_TOKEN: ${hasToken ? "loaded from .env" : "MISSING — set in .env"}`);
  console.log(
    `WEB3FORMS_ACCESS_KEY: ${hasHireKey ? "loaded from .env" : "MISSING — Hire Me form needs it"}`
  );
});
