import { kv } from "@vercel/kv";

const KEY = "clewdo:tributes";

function isAuthed(req) {
  const token = req.headers.get("authorization") || "";
  const expected = `Bearer ${process.env.CLEWDO_API_KEY || ""}`;
  return process.env.CLEWDO_API_KEY && token === expected;
}

export async function GET() {
  const tributes = (await kv.get(KEY)) || [];
  return Response.json({ tributes });
}

export async function POST(req) {
  if (!isAuthed(req)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = String(body.userId || "");
  const username = String(body.username || "");
  const avatar = String(body.avatar || "");
  const joinedAt = Number(body.joinedAt || Date.now());

  if (!userId || !username) {
    return new Response("Missing userId/username", { status: 400 });
  }

  const tributes = (await kv.get(KEY)) || [];

  // Prevent duplicates
  const exists = tributes.some(t => String(t.userId) === userId);
  if (!exists) {
    tributes.push({ userId, username, avatar, joinedAt });
    await kv.set(KEY, tributes);
  }

  return Response.json({ ok: true, count: tributes.length });
}

export async function DELETE(req) {
  if (!isAuthed(req)) {
    return new Response("Unauthorized", { status: 401 });
  }
  await kv.set(KEY, []);
  return Response.json({ ok: true });
}
