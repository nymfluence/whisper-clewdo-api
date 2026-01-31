// app/api/clewdo/narrative/route.js

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { killTemplates, revealTemplates } from "../../../../data/narratives.js";

function fill(template, vars) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}

function pickFrom(pool, excludeIds) {
  const filtered = pool.filter((x) => !excludeIds.includes(x.id));
  if (filtered.length) return filtered[Math.floor(Math.random() * filtered.length)];
  // if everything is excluded, allow repeats rather than error
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const mode = (searchParams.get("mode") || "kill").toLowerCase(); // kill|reveal
    const exclude = (searchParams.get("exclude") || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const room = searchParams.get("room") || "";
    const victim = searchParams.get("victim") || "";
    const weapon = searchParams.get("weapon") || "";
    const killer = searchParams.get("killer") || "";

    const pool = mode === "reveal" ? revealTemplates : killTemplates;
    if (!Array.isArray(pool) || pool.length === 0) {
      return new Response(JSON.stringify({ error: "No templates loaded" }), {
        status: 500,
        headers: { "content-type": "application/json" },
      });
    }

    const pick = pickFrom(pool, exclude);

    const text = fill(pick.t, {
      room,
      victim,
      weapon,
      killer,
    });

    return new Response(
      JSON.stringify({
        id: pick.id,
        text,
      }),
      { status: 200, headers: { "content-type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
