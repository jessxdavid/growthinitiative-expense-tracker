// Expense Tracker - sync Worker (Cloudflare Workers + KV)
// Stores the whole app state as one JSON document under key "state".
// Auth: every request must send  Authorization: Bearer <SYNC_KEY>
// SYNC_KEY is set as a Worker secret (see DEPLOY.md). No credit card, no R2.

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "GET, PUT, OPTIONS",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // auth: every request must send  Authorization: Bearer <SYNC_KEY>
    // SYNC_KEY is a Worker secret you set once with:  wrangler secret put SYNC_KEY
    const auth = request.headers.get("authorization") || "";
    if (!env.SYNC_KEY || auth !== "Bearer " + env.SYNC_KEY) {
      return json({ error: "unauthorized" }, 401);
    }

    if (request.method === "GET") {
      const v = await env.HUB.get("state");
      return new Response(v || '{"updatedAt":0,"expenses":[],"categories":[],"templates":[]}', {
        headers: { ...CORS, "content-type": "application/json" },
      });
    }

    if (request.method === "PUT") {
      const body = await request.text();
      try { JSON.parse(body); } catch (e) { return json({ error: "invalid json" }, 400); }
      if (body.length > 24 * 1024 * 1024) return json({ error: "too large" }, 413);
      await env.HUB.put("state", body);
      return json({ ok: true });
    }

    return json({ error: "method not allowed" }, 405);
  },
};

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, "content-type": "application/json" },
  });
}
