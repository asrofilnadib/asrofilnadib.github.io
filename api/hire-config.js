/**
 * Public Web3Forms access key for Hire Me form.
 * Key is not a secret (client-side by design); keep domain lock in Web3Forms dashboard.
 *
 * Local: WEB3FORMS_ACCESS_KEY in .env
 * Vercel: Environment Variable WEB3FORMS_ACCESS_KEY
 */
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const key = String(process.env.WEB3FORMS_ACCESS_KEY || "")
    .trim()
    .replace(/^["']|["']$/g, "");

  if (!key) {
    return res.status(503).json({
      ok: false,
      error: "WEB3FORMS_ACCESS_KEY not configured",
    });
  }

  return res.status(200).json({
    ok: true,
    accessKey: key,
    to: "asrofilnadibs28@gmail.com",
  });
};
