// app/api/clewdo/render/route.js

import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ASSETS_BASE =
  process.env.ASSETS_BASE_URL?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/nymfluence/whisper-clewdo-assets/main";

const ROOMS_DIR = "clewdo/rooms";

const ROOM_BASE = {
  1: "01-entrance-hall-base",
  2: "02-front-desk-base",
  3: "03-cloakroom-base",
  4: "04-gallery-base",
  5: "05-hall-of-fame-base",
  6: "06-smoking-terrace-base",
  7: "07-fire-escape-base",
  8: "08-bar-base",
  9: "09-wine-cellar-base",
  10: "10-snug-base",
  11: "11-booths-base",
  12: "12-powder-room-base",
  13: "13-gents-bathroom-base",
  14: "14-dance-floor-base",
  15: "15-dj-booth-base",
  16: "16-games-room-base",
  17: "17-casino-base",
  18: "18-shop-base",
  19: "19-greenroom-base",
  20: "20-staffroom-base",
  21: "21-champagne-lounge-base",
  22: "22-confessional-base",
  23: "23-vacuum-chamber-base",
  24: "24-red-room-base",
  25: "25-flash-stage-base",
  26: "26-owners-office-base",
  27: "27-lift-base",
  28: "28-hotel-floor-base",
  29: "29-bedroom-one-base",
  30: "30-bedroom-two-base",
  31: "31-bedroom-three-base",
  32: "32-bedroom-four-base",
  33: "33-hot-tub-terrace-base",
  34: "34-penthouse-base",
  35: "35-late-checkout-desk-base",
  36: "36-vip-lounge-base",
};

// ✅ Default “micro alignment” nudge (right + down)
const NUDGE_X_DEFAULT = 4;
const NUDGE_Y_DEFAULT = 4;

const VICTIM_FRAME = {
  3:  { x: 847.1, y: 552.7, w: 226.7, h: 226.7, r:  2.1 },
  4:  { x: 202.5, y: 367.5, w: 272.4, h: 272.4, r: -1.1 },
  5:  { x: 395.1, y: 431.9, w: 235.4, h: 235.4, r: -1.4 },
  6:  { x: 832.2, y: 534.6, w: 227.1, h: 227.1, r:  2.1 },
  7:  { x: 572.9, y: 558.1, w: 211.5, h: 211.5, r: -1.4 },
  8:  { x: 673.4, y: 390.6, w: 309.0, h: 309.0, r: -1.3 },
  9:  { x: 595.4, y: 484.9, w: 234.9, h: 234.9, r: -1.3 },
  10: { x: 627.9, y: 443.1, w: 236.5, h: 236.5, r: -1.1 },
  11: { x: 632.1, y: 495.7, w: 226.7, h: 226.7, r: -1.4 },
  12: { x: 313.5, y: 464.4, w: 302.4, h: 302.4, r: -1.6 },
  13: { x: 434.5, y: 474.5, w: 276.3, h: 276.3, r: -2.9 },
  14: { x: 434.7, y: 473.0, w: 271.4, h: 271.4, r: -3.4 },
  15: { x: 501.4, y: 433.4, w: 239.2, h: 239.2, r: -1.5 },
  16: { x: 596.1, y: 500.1, w: 224.9, h: 224.9, r: -2.6 },
  17: { x: 626.2, y: 513.2, w: 231.3, h: 231.3, r: -1.4 },
  18: { x: 589.4, y: 470.9, w: 265.5, h: 265.5, r: -1.5 },
  19: { x: 580.2, y: 439.4, w: 271.3, h: 271.3, r: -1.9 },
  20: { x: 567.6, y: 492.6, w: 244.7, h: 244.7, r: -1.9 },
  21: { x: 588.9, y: 464.0, w: 303.9, h: 303.9, r: -1.3 },
  22: { x: 589.4, y: 423.3, w: 264.1, h: 264.1, r: -2.2 },
  23: { x: 658.7, y: 545.5, w: 225.2, h: 225.2, r: -1.4 },
  24: { x: 797.1, y: 366.5, w: 273.6, h: 273.6, r: -1.2 },
  25: { x:  53.2, y: 367.7, w: 279.7, h: 279.7, r: -1.5 },
  26: { x: 170.0, y: 475.2, w: 252.5, h: 252.5, r: -1.4 },
  27: { x: 572.7, y: 579.4, w: 198.1, h: 198.1, r: -3.4 },
  28: { x: 467.0, y: 407.6, w: 216.8, h: 216.8, r: -2.1 },
  29: { x: 465.5, y: 481.0, w: 296.1, h: 296.1, r: -1.2 },
  30: { x: 531.2, y: 472.7, w: 251.3, h: 251.3, r: -1.9 },
  31: { x: 439.6, y: 370.5, w: 256.9, h: 256.9, r: -1.4 },
  32: { x: 437.4, y: 377.9, w: 288.2, h: 288.2, r: -1.9 },
  33: { x: 525.3, y: 589.6, w: 212.5, h: 212.5, r: -1.5 },
  34: { x: 476.1, y: 400.7, w: 262.2, h: 262.2, r: -1.7 },
  35: { x: 487.1, y: 488.8, w: 259.7, h: 259.7, r: -2.1 },
  36: { x: 450.0, y: 416.2, w: 345.8, h: 345.8, r: -1.3 },
};

async function fetchFirstExisting(urls) {
  for (const url of urls) {
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return { url, buf: Buffer.from(await res.arrayBuffer()) };
  }
  return null;
}

async function loadRoomBase(roomNum) {
  const key = ROOM_BASE[roomNum];
  if (!key) return { error: `Invalid room: ${roomNum}` };

  const basePrefix = `${ASSETS_BASE}/${ROOMS_DIR}/${key}`;
  const found = await fetchFirstExisting([
    `${basePrefix}.png`,
    `${basePrefix}.jpg`,
    `${basePrefix}.jpeg`,
  ]);

  if (!found) {
    return { error: `Missing base image: ${ROOMS_DIR}/${key}(.png|.jpg|.jpeg)` };
  }
  return { buf: found.buf };
}

async function makeRotatedAvatarOverlay(avatarBuf, frame, nudgeX, nudgeY) {
  const resized = await sharp(avatarBuf)
    .resize(Math.round(frame.w), Math.round(frame.h), { fit: "cover" })
    .png()
    .toBuffer();

  const rotated = await sharp(resized)
    .rotate(frame.r, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  const meta = await sharp(rotated).metadata();
  const rw = meta.width || Math.round(frame.w);
  const rh = meta.height || Math.round(frame.h);

  const left = Math.round(frame.x - (rw - frame.w) / 2 + nudgeX);
  const top  = Math.round(frame.y - (rh - frame.h) / 2 + nudgeY);

  return { input: rotated, left, top };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const room = Number(searchParams.get("room") || "0");
    const avatarUrl = searchParams.get("avatar");

    // ✅ optional per-request nudges:
    //   &nx=4&ny=4
    const nx = Number(searchParams.get("nx") ?? NUDGE_X_DEFAULT);
    const ny = Number(searchParams.get("ny") ?? NUDGE_Y_DEFAULT);

    const base = await loadRoomBase(room);
    if (base.error) {
      return new Response(JSON.stringify({ error: base.error }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    }

    if (!avatarUrl) {
      return new Response(base.buf, {
        status: 200,
        headers: { "content-type": "image/png", "cache-control": "no-store" },
      });
    }

    const aRes = await fetch(avatarUrl, { cache: "no-store" });
    if (!aRes.ok) {
      return new Response(JSON.stringify({ error: `Failed to fetch avatar (${aRes.status})` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }
    const avatarBuf = Buffer.from(await aRes.arrayBuffer());

    const frame = VICTIM_FRAME[room];
    if (!frame) {
      return new Response(base.buf, {
        status: 200,
        headers: { "content-type": "image/png", "cache-control": "no-store" },
      });
    }

    const overlay = await makeRotatedAvatarOverlay(avatarBuf, frame, nx, ny);

    const out = await sharp(base.buf)
      .composite([overlay])
      .png()
      .toBuffer();

    return new Response(out, {
      status: 200,
      headers: { "content-type": "image/png", "cache-control": "no-store" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err?.message || "Unknown error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
