const STATE_KEY = "directory-management";
const MAX_PAYLOAD_BYTES = 1_000_000;
const SUPABASE_TIMEOUT_MS = 2500;

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return {
    url: url.replace(/\/+$/, ""),
    key
  };
}

async function supabaseRequest(path, options = {}) {
  const { url, key } = getSupabaseConfig();
  const controller = new AbortController();
  let timeoutId;
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("Supabase request timed out."));
    }, SUPABASE_TIMEOUT_MS);
  });

  try {
    const response = await Promise.race([
      fetch(`${url}/rest/v1/${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          Accept: "application/json",
          ...(options.headers || {})
        }
      }),
      timeout
    ]);

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    if (!response.ok) {
      const message = body?.message || body?.error || `Supabase request failed with status ${response.status}`;
      throw new Error(message);
    }

    return body;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("Supabase request timed out.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function sendCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Cache-Control", "no-store");
}

function payloadSize(payload) {
  return Buffer.byteLength(JSON.stringify(payload || {}), "utf8");
}

function requestBody(req) {
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body || "{}");
    } catch {
      return {};
    }
  }
  return req.body || {};
}

module.exports = async function handler(req, res) {
  sendCors(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  try {
    if (req.method === "GET") {
      const rows = await supabaseRequest(
        `app_state?key=eq.${encodeURIComponent(STATE_KEY)}&select=payload,updated_at,updated_by`
      );
      const row = Array.isArray(rows) ? rows[0] : null;

      return res.status(200).json({
        data: row?.payload || null,
        updatedAt: row?.updated_at || null,
        updatedBy: row?.updated_by || null
      });
    }

    if (req.method === "PUT") {
      const body = requestBody(req);
      const payload = body.data;
      const updatedBy = typeof body.updatedBy === "string"
        ? body.updatedBy.slice(0, 120)
        : null;

      if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
        return res.status(400).json({ error: "Request body must include a data object." });
      }

      if (payloadSize(payload) > MAX_PAYLOAD_BYTES) {
        return res.status(413).json({ error: "Data is too large to sync." });
      }

      const rows = await supabaseRequest("app_state?on_conflict=key&select=updated_at,updated_by", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation"
        },
        body: JSON.stringify({ key: STATE_KEY, payload, updated_by: updatedBy })
      });
      const row = Array.isArray(rows) ? rows[0] : null;

      return res.status(200).json({ ok: true, updatedAt: row?.updated_at || null, updatedBy: row?.updated_by || null });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("App data API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};
