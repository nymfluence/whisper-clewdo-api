import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ASSETS_BASE =
  process.env.ASSETS_BASE_URL?.replace(/\/$/, "") ||
  "https://raw.githubusercontent.com/nymfluence/whisper-clewdo-assets/main";

const ROOMS_DIR = "clewdo/rooms";

/**
 * Exact filenames in your assets repo (minus extension).
 */
const ROOM_BASE = {
  1:  "01-entrance-hall-base",
  2:  "02-front-desk-base",
  3:  "03-cloakroom-base",
  4:  "04-gallery-base",
  5:  "05-hall-of-fame-base",
  6:  "06-smoking-terrace-base",
  7:  "07-fire-escape-base",
  8:  "08-bar-base",
  9:  "09-wine-cellar-base",
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

  // Bedrooms
  29: "29-bedroom-one-base",
  30: "30-bedroom-two-base",
  31: "31-bedroom-three-base",
  32: "32-bedroom-four-base",

  33: "33-hot-tub-terrace-base",
  34: "34-penthouse-base",
  35: "35-late-checkout-desk-base",
  36: "36-vip-lounge-base",
};

/**
 * Avatar placement (top-left X/Y, size W/H, rotation degrees).
 * UPDATED to your latest recalibration values.
 */
const PFP = {
  3:  { x: 846.6, y: 551.6, w: 228.2, h: 228.2, r:  2.1 },
  4:  { x: 201.8, y: 364.4, w: 275.3, h: 275.3, r: -1.0 },
  5:  { x: 393.5, y: 432.4, w: 236.3, h: 236.3, r: -1.3 },
  6:  { x: 833.5, y: 534.9, w: 226.0, h: 226.0, r:  2.3 },
  7:  { x: 575.7, y: 559.6, w: 207.5, h: 207.5, r: -1.3 },
  8:  { x: 675.3, y: 386.8, w: 310.9, h: 310.9, r: -1.5 },
  9:  { x: 597.6, y: 485.4, w: 232.2, h: 232.2, r: -1.8 },
  10: { x: 623.4, y: 445.5, w: 240.2, h: 240.2, r: -1.7 },
  11: { x: 637.8, y: 498.4, w: 219.9, h: 219.9, r: -1.4 },
  12: { x: 310.4, y: 463.9, w: 305.3, h: 305.3, r: -1.8 },
  13: { x: 436.1, y: 473.7, w: 275.8, h: 275.8, r: -3.0 },
  14: { x: 431.6, y: 471.3, w: 276.2, h: 276.2, r: -2.9 },
  15: { x: 498.0, y: 438.9, w: 239.1, h: 239.1, r: -3.4 },
  16: { x: 596.4, y: 499.9, w: 243.9, h: 243.9, r: -2.5 },
  17: { x: 626.2, y: 513.0, w: 230.0, h: 230.0, r: -1.8 },
  18: { x: 588.8, y: 471.9, w: 267.6, h: 267.6, r: -1.2 },
  19: { x: 581.7, y: 438.5, w: 271.3, h: 271.3, r: -2.0 },
  20: { x: 566.4, y: 493.8, w: 244.9, h: 244.9, r: -2.3 },
  21: { x: 586.2, y: 464.9, w: 304.4, h: 304.4, r: -1.0 },
  22: { x: 590.7, y: 423.4, w: 258.7, h: 258.7, r: -2.6 },
  23: { x: 656.4, y: 552.3, w: 224.6, h: 224.6, r: -2.4 },
  24: { x: 797.0, y: 364.0, w: 274.9, h: 274.9, r: -1.1 },
  25: { x:  56.9, y: 366.4, w: 273.8, h: 273.8, r: -1.2 },
  26: { x: 170.7, y: 478.5, w: 247.8, h: 247.8, r: -1.4 },
  27: { x: 570.8, y: 578.0, w: 195.0, h: 195.0, r: -4.6 },
  28: { x: 466.4, y: 407.6, w: 218.8, h: 218.8, r: -1.7 },

  29: { x: 527.6, y: 468.4, w: 256.2, h: 256.2, r: -1.6 },
  30: { x: 443.0, y: 379.2, w: 281.2, h: 281.2, r: -1.7 },
  31: { x: 466.7, y: 475.2, w: 290.7, h: 290.7, r: -1.5 },
  32: { x: 438.2, y: 372.1, w: 258.2, h: 258.2, r: -1.8 },

  33: { x: 524.3, y: 594.3, w: 212.0, h: 212.0, r: -1.3 },
  34: { x: 476.1, y: 400.7, w: 262.2, h: 262.2, r: -1.7 },
  35: { x: 489.4, y: 491.3, w: 258.1, h: 258.1, r: -1.9 },
  36: { x: 450.0, y: 416.2, w: 345.8, h: 345.8, r: -1.3 },
};

const EXT_TRY = ["png", "jpg", "jpeg", "webp"];

async function fetchAnyExt(pathNoExt) {
  for (const ext of EXT_TRY) {
    const url = `${ASSETS_BASE}/${pathNoExt}.${ext}`;
    const res = await fetch(url, { cache: "no-store" });
    if (res.ok) return { buf: Buffer.from(await res.arrayBuffer()), url };
  }
  return null;
}

/**
 * ✅ FIXED: treat null/"" as missing, so fallback works.
 */
function toInt(v, fallback) {
  if (v === null || v === undefined || v === "") return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const room = toInt(searchParams.get("room"), 1);

    // Support BOTH param names (your CC uses avatarUrl)
    const avatarUrl =
      searchParams.get("avatarUrl") || searchParams.get("avatar") || "";

    const debug = searchParams.get("debug") === "1";

    // ✅ Default nudges (applies unless overridden by query)
    const nx = toInt(searchParams.get("nx"), 6);   // right/east
    const ny = toInt(searchParams.get("ny"), -6);  // up/north

    const baseKey = ROOM_BASE[room];
    if (!baseKey) {
      return new Response(JSON.stringify({ error: `Invalid room: ${room}` }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const basePathNoExt = `${ROOMS_DIR}/${baseKey}`;
    const baseFetch = await fetchAnyExt(basePathNoExt);

    if (!baseFetch) {
      return new Response(
        JSON.stringify({
          error: `Missing base image: ${basePathNoExt}(.png|.jpg|.jpeg|.webp)`,
        }),
        { status: 404, headers: { "content-type": "application/json" } }
      );
    }

    let img = sharp(baseFetch.buf);
    const slot = PFP[room];

    if (slot && avatarUrl) {
      const aRes = await fetch(avatarUrl, { cache: "no-store" });
      if (!aRes.ok) {
        return new Response(
          JSON.stringify({ error: `Failed to fetch avatar (${aRes.status})` }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }
      const aBuf = Buffer.from(await aRes.arrayBuffer());

      const resized = await sharp(aBuf)
        .resize(Math.round(slot.w), Math.round(slot.h), { fit: "cover" })
        .png()
        .toBuffer();

      // Rotate, then crop/resize back to slot to keep placement stable
      const rotatedCropped = await sharp(resized)
        .rotate(slot.r, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .resize(Math.round(slot.w), Math.round(slot.h), { fit: "cover" })
        .png()
        .toBuffer();

      img = img.composite([
        {
          input: rotatedCropped,
          left: Math.round(slot.x + nx),
          top: Math.round(slot.y + ny),
        },
      ]);
    }

    if (debug) {
      return new Response(
        JSON.stringify(
          {
            room,
            baseKey,
            baseUsed: baseFetch.url,
            slot: slot || null,
            nx,
            ny,
            avatarUsed: avatarUrl || null,
          },
          null,
          2
        ),
        { status: 200, headers: { "content-type": "application/json" } }
      );
    }

    const out = await img.png().toBuffer();
    return new Response(out, {
      status: 200,
      headers: { "content-type": "image/png", "cache-control": "no-store" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message || e) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
