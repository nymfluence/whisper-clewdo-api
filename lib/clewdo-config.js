const OWNER  = process.env.CLEWDO_ASSETS_OWNER || "";
const REPO   = process.env.CLEWDO_ASSETS_REPO || "whisper-clewdo-assets";
const BRANCH = process.env.CLEWDO_ASSETS_BRANCH || "main";

// Optional token to avoid GitHub rate limits (recommended)
const TOKEN  = process.env.GITHUB_TOKEN || "";

/**
 * Raw GitHub URL for files in your assets repo.
 */
export function rawUrl(path) {
  // Example: https://raw.githubusercontent.com/<owner>/<repo>/<branch>/clewdo/config/rooms.json
  return `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${path}`;
}

async function fetchJson(path) {
  const url = rawUrl(path);
  const headers = {};
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch JSON: ${path} (${res.status})`);
  }
  return res.json();
}

async function fetchBuffer(path) {
  const url = rawUrl(path);
  const headers = {};
  if (TOKEN) headers["Authorization"] = `Bearer ${TOKEN}`;

  const res = await fetch(url, { headers, cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to fetch file: ${path} (${res.status})`);
  }
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

/**
 * Cached-in-memory for a short period per runtime instance.
 * (Vercel cold starts reset this; that's fine.)
 */
let _roomsCache = null;
let _framesCache = null;
let _cacheAt = 0;

export async function getRoomsAndFrames() {
  const now = Date.now();
  const ttlMs = 60_000; // 1 minute in-instance cache

  if (_roomsCache && _framesCache && (now - _cacheAt) < ttlMs) {
    return { rooms: _roomsCache, frames: _framesCache };
  }

  const rooms = await fetchJson("clewdo/config/rooms.json");
  const frames = await fetchJson("clewdo/config/pfp-frames.json");

  _roomsCache = rooms;
  _framesCache = frames;
  _cacheAt = now;

  return { rooms, frames };
}

export async function getRoomBaseImageBuffer(roomIndex) {
  const { rooms } = await getRoomsAndFrames();
  const room = (rooms.rooms || []).find(r => Number(r.index) === Number(roomIndex));
  if (!room) throw new Error(`Unknown room index: ${roomIndex}`);

  const filePath = `clewdo/rooms/${room.file}`;
  return fetchBuffer(filePath);
}

export function roomHasVictimFrame(roomIndex) {
  // Room 1 & 2 have no victim frame
  return Number(roomIndex) >= 3;
}

export function getVictimFrame(roomIndex, framesJson) {
  const frames = framesJson.frames || {};
  const f = frames[String(roomIndex)];
  if (!f) return null;
  return {
    x: Number(f.x),
    y: Number(f.y),
    w: Number(f.w),
    h: Number(f.h)
  };
}
