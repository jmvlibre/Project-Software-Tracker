const SUPABASE_TIMEOUT_MS = 7000;

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
  const timeout = setTimeout(() => controller.abort(), SUPABASE_TIMEOUT_MS);

  try {
    const response = await fetch(`${url}/rest/v1/${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

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
    clearTimeout(timeout);
  }
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
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      const tasks = await supabaseRequest("tasks?select=*&order=created_at.desc");
      return res.status(200).json({ tasks: tasks || [] });
    }

    if (req.method === "POST") {
      const { title, project, owner, status, priority, due_date, notes, remarks } = requestBody(req);
      const rows = await supabaseRequest("tasks?select=*", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify([{ title, project, owner, status: status || "To Do", priority: priority || "Medium", due_date, notes, remarks }])
      });
      return res.status(201).json(rows?.[0] || null);
    }

    if (req.method === "PUT") {
      const { id, ...updates } = requestBody(req);
      const rows = await supabaseRequest(`tasks?id=eq.${encodeURIComponent(id)}&select=*`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Prefer: "return=representation"
        },
        body: JSON.stringify(updates)
      });
      return res.status(200).json(rows?.[0] || null);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      await supabaseRequest(`tasks?id=eq.${encodeURIComponent(id)}`, {
        method: "DELETE"
      });
      return res.status(204).end();
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: error.message || "Server error" });
  }
};
