import sharp from "sharp";

export const runtime = "nodejs"; // required for sharp in Vercel/Next
export const dynamic = "force-dynamic";

const OWNER = "nymfluence";
const ASSETS_REPO = "whisper-clewdo-assets";
const ASSETS_BRANCH = "main";

// We try these in order so your mix of png/jpg/jpeg “just works”.
const IMAGE_EXTENSIONS = ["png", "jpg", "jpeg"];

// Build a GitHub RAW base URL (NO extension).
function ghRawBase(pathNoExt) {
  return `https://raw.githubusercontent.com/${OWNER}/${ASSETS_REPO}/${ASSETS_BRANCH}/${pathNoExt}`;
}

// Try fetch with .png then .jpg then .jpeg until one exists.
async function fetchImageAnyExt(pathNoExt) {
  const base = ghRawBase(pathNoExt);

  for (const ext of IMAGE_EXTENSIONS) {
    const url = `${base}.${ext}`;
    const res = await fetch(url);

    if (res.ok) {
      const buf = Buffer.from(await res.arrayBuffer());
      const contentType = res.headers.get("content-type") || "image/jpeg";
      return { buf, url, contentType };
    }
  }

  throw new Error(`Failed to fetch file: ${pathNoExt} (${IMAGE_EXTENSIONS.join("/")})`);
}

// Fetch avatar image (Discord CDN etc).
async function fetchAvatar(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch avatar (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Rooms:
 * - All base images live in: clewdo/rooms/<NN-name>-base.(png/jpg/jpeg)
 * - Only rooms 3–36 have an avatar slot; room 1+2 are “no avatar”.
 *
 * Coordinates are treated as TOP-LEFT of a square.
 */
const ROOMS = {
  1: { fileNoExt: "clewdo/rooms/01-entrance-hall-base" },
  2: { fileNoExt: "clewdo/rooms/02-front-desk-base" },

  3:  { fileNoExt: "clewdo/rooms/03-cloakroom-base",        pfp: { x: 847.1, y: 552.7, w: 226.7, h: 226.7 } },
  4:  { fileNoExt: "clewdo/rooms/04-gallery-base",          pfp: { x: 202.5, y: 367.5, w: 272.4, h: 272.4 } },
  5:  { fileNoExt: "clewdo/rooms/05-hall-of-fame-base",     pfp: { x: 395.1, y: 431.9, w: 235.4, h: 235.4 } },
  6:  { fileNoExt: "clewdo/rooms/06-smoking-terrace-base",  pfp: { x: 832.2, y: 534.6, w: 227.1, h: 227.1 } },
  7:  { fileNoExt: "clewdo/rooms/07-fire-escape-base",      pfp: { x: 572.9, y: 558.1, w: 211.5, h: 211.5 } },
  8:  { fileNoExt: "clewdo/rooms/08-bar-base",              pfp: { x: 673.4, y: 390.6, w: 309.0, h: 309.0 } },
  9:  { fileNoExt: "clewdo/rooms/09-wine-cellar-base",      pfp: { x: 595.4, y: 484.9, w: 234.9, h: 234.9 } },
  10: { fileNoExt: "clewdo/rooms/10-snug-base",             pfp: { x: 627.9, y: 443.1, w: 236.5, h: 236.5 } },
  11: { fileNoExt: "clewdo/rooms/11-booths-base",           pfp: { x: 632.1, y: 495.7, w: 226.7, h: 226.7 } },
  12: { fileNoExt: "clewdo/rooms/12-powder-room-base",      pfp: { x: 313.5, y: 464.4, w: 302.4, h: 302.4 } },
  13: { fileNoExt: "clewdo/rooms/13-gents-bathroom-base",   pfp: { x: 434.5, y: 474.5, w: 276.3, h: 276.3 } },
  14: { fileNoExt: "clewdo/rooms/14-dance-floor-base",      pfp: { x: 434.7, y: 473.0, w: 271.4, h: 271.4 } },
  15: { fileNoExt: "clewdo/rooms/15-dj-booth-base",         pfp: { x: 501.4, y: 433.4, w: 239.2, h: 239.2 } },
  16: { fileNoExt: "clewdo/rooms/16-games-room-base",       pfp: { x: 596.1, y: 500.1, w: 224.9, h: 224.9 } },
  17: { fileNoExt: "clewdo/rooms/17-casino-base",           pfp: { x: 626.2, y: 513.2, w: 231.3, h: 231.3 } },
  18: { fileNoExt: "clewdo/rooms/18-shop-base",             pfp: { x: 589.4, y: 470.9, w: 265.5, h: 265.5 } },
  19: { fileNoExt: "clewdo/rooms/19-greenroom-base",        pfp: { x: 580.2, y: 439.4, w: 271.3, h: 271.3 } },
  20: { fileNoExt: "clewdo/rooms/20-staffroom-base",        pfp: { x: 567.6, y: 492.6, w: 244.7, h: 244.7 } },
  21: { fileNoExt: "clewdo/rooms/21-champagne-lounge-base", pfp: { x: 588.9, y: 464.0, w: 303.9, h: 303.9 } },
  22: { fileNoExt: "clewdo/rooms/22-confessional-base",     pfp: { x: 589.4, y: 423.3, w: 264.1, h: 264.1 } },
  23: { fileNoExt: "clewdo/rooms/23-vacuum-chamber-base",   pfp: { x: 658.7, y: 545.5, w: 225.2, h: 225.2 } },
  24: { fileNoExt: "clewdo/rooms/24-red-room-base",         pfp: { x: 797.1, y: 366.5, w: 273.6, h: 273.6 } },
  25: { fileNoExt: "clewdo/rooms/25-flash-stage-base",      pfp: { x: 53.2,  y: 367.7, w: 279.7, h: 279.7 } },
  26: { fileNoExt: "clewdo/rooms/26-owners-office-base",    pfp: { x: 170.0, y: 475.2, w: 252.5, h: 252.5 } },
  27: { fileNoExt: "clewdo/rooms/27-lift-base",             pfp: { x: 572.7, y: 579.4, w: 198.1, h: 198.1 } },
  28: { fileNoExt: "clewdo/rooms/28-hotel-floor-base",      pfp: { x: 467.0, y: 407.6, w: 216.8, h: 216.8 } },
  29: { fileNoExt: "clewdo/rooms/29-bedroom-one-base",      pfp: { x: 465.5, y: 481.0, w: 296.1, h: 296.1 } },
  30: { fileNoExt: "clewdo/rooms/30-bedroom-two-base",      pfp: { x: 531.2, y: 472.7, w: 251.3, h: 251.3 } },
  31: { fileNoExt: "clewdo/rooms/31-bedroom-three-base",    pfp: { x: 439.6, y: 370.5, w: 256.9, h: 256.9 } },
  32: { fileNoExt: "clewdo/rooms/32-bedroom-four-base",     pfp: { x: 437.4, y: 377.9, w: 288.2, h: 288.2 } },
  33: { fileNoExt: "clewdo/rooms/33-hot-tub-terrace-base",  pfp: { x: 525.3, y: 589.6, w: 212.5, h: 212.5 } },
  34: { fileNoExt: "clewdo/rooms/34-penthouse-base",        pfp: { x: 476.1, y: 400.7, w: 262.2, h: 262.2 } },
  35: { fileNoExt: "clewdo/rooms/35-late-checkout-desk-base", pfp: { x: 487.1, y: 488.8, w: 259.7, h: 259.7 } },
  36: { fileNoExt: "clewdo/rooms/36-vip-lounge-base",       pfp: { x: 450.0, y: 416.2, w: 345.8, h: 345.8 } },
};

function jsonError(message, status = 400, extra = {}) {
  return new Response(JSON.stringify({ error: message, ...extra }, null, 2), {
    status,
    headers: { "content-type": "application/json; charset=utf-8" },
  });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const room = Number(searchParams.get("room") || "");
    const avatarUrl = searchParams.get("avatar") || "";

    if (!Number.isFinite(room) || room < 1 || room > 36) {
      return jsonError("Invalid room. Use room=1..36", 400);
    }

    const cfg = ROOMS[room];
    if (!cfg?.fileNoExt) {
      return jsonError(`Room config missing for room ${room}`, 500);
    }

    // 1) Load base image (png/jpg/jpeg — whichever exists)
    const { buf: baseBuf } = await fetchImageAnyExt(cfg.fileNoExt);

    // 2) If no avatar slot (room 1–2) OR no avatar provided -> return base as PNG
    if (!cfg.pfp || !avatarUrl) {
      const out = await sharp(baseBuf).png({ quality: 95 }).toBuffer();
      return new Response(out, {
        status: 200,
        headers: {
          "content-type": "image/png",
          // Cache OK since base templates rarely change; tweak if you prefer.
          "cache-control": "public, max-age=3600",
        },
      });
    }

    // 3) Fetch + prep avatar
    const avatarBuf = await fetchAvatar(avatarUrl);

    const w = Math.max(1, Math.round(cfg.pfp.w));
    const h = Math.max(1, Math.round(cfg.pfp.h));
    const x = Math.round(cfg.pfp.x);
    const y = Math.round(cfg.pfp.y);

    // Resize avatar to the frame (cover) and convert to PNG for stable compositing.
    const avatarPng = await sharp(avatarBuf)
      .resize(w, h, { fit: "cover" })
      .png()
      .toBuffer();

    // 4) Composite avatar into base
    const out = await sharp(baseBuf)
      .composite([{ input: avatarPng, left: x, top: y }])
      .png({ quality: 95 })
      .toBuffer();

    return new Response(out, {
      status: 200,
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=60",
      },
    });
  } catch (err) {
    // If GitHub fetch fails, surface the exact path we attempted
    const msg = (err && err.message) ? err.message : "Unknown error";
    return jsonError(msg, 500);
  }
}
