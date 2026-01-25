import { NextResponse } from "next/server";
import sharp from "sharp";

// ====== CONFIG ======
const ASSETS_OWNER = process.env.CLEWDO_ASSETS_OWNER || "nymfluence";
const ASSETS_REPO = process.env.CLEWDO_ASSETS_REPO || "whisper-clewdo-assets";
const ASSETS_BRANCH = process.env.CLEWDO_ASSETS_BRANCH || "main";

// Where your room images live inside the assets repo:
const ROOMS_PREFIX = "clewdo/rooms/";

// Raw GitHub URL base:
const RAW_BASE = `https://raw.githubusercontent.com/${ASSETS_OWNER}/${ASSETS_REPO}/${ASSETS_BRANCH}/`;

// Room image filenames (your naming convention)
const ROOM_FILES = {
  1: "01-entrance-hall-base.png",
  2: "02-front-desk-base.png",
  3: "03-cloakroom-base.png",
  4: "04-gallery-base.png",
  5: "05-hall-of-fame-base.png",
  6: "06-smoking-terrace-base.png",
  7: "07-fire-escape-base.png",
  8: "08-bar-base.png",
  9: "09-wine-cellar-base.png",
  10: "10-snug-base.png",
  11: "11-booths-base.png",
  12: "12-powder-room-base.png",
  13: "13-gents-bathroom-base.png",
  14: "14-dance-floor-base.png",
  15: "15-dj-booth-base.png",
  16: "16-games-room-base.png",
  17: "17-casino-base.png",
  18: "18-shop-base.png",
  19: "19-greenroom-base.png",
  20: "20-staffroom-base.png",
  21: "21-champagne-lounge-base.png",
  22: "22-confessional-base.png",
  23: "23-vacuum-chamber-base.png",
  24: "24-red-room-base.png",
  25: "25-flash-stage-base.png",
  26: "26-owners-office-base.png",
  27: "27-lift-base.png",
  28: "28-hotel-floor-base.png",
  29: "29-bedroom-one-base.png",
  30: "30-bedroom-two-base.png",
  31: "31-bedroom-three-base.png",
  32: "32-bedroom-four-base.png",
  33: "33-hot-tub-terrace-base.png",
  34: "34-penthouse-base.png",
  35: "35-late-checkout-desk-base.png",
  36: "36-vip-lounge-base.png",
};

/**
 * Avatar placement:
 * x,y = TOP-LEFT of the (unrotated) square window
 * w,h = window size
 * rot = degrees (positive = CCW, negative = CW) [Sharp convention]
 */
const ROOM_AVATAR = {
  3:  { x: 847.1, y: 552.7, w: 226.7, h: 226.7, rot:  2.1 },
  4:  { x: 202.5, y: 367.5, w: 272.4, h: 272.4, rot: -1.1 },
  5:  { x: 395.1, y: 431.9, w: 235.4, h: 235.4, rot: -1.4 },
  6:  { x: 832.2, y: 534.6, w: 227.1, h: 227.1, rot:  2.1 },
  7:  { x: 572.9, y: 558.1, w: 211.5, h: 211.5, rot: -1.4 },
  8:  { x: 673.4, y: 390.6, w: 309.0, h: 309.0, rot: -1.3 },
  9:  { x: 595.4, y: 484.9, w: 234.9, h: 234.9, rot: -1.3 },
  10: { x: 627.9, y: 443.1, w: 236.5, h: 236.5, rot: -1.1 },
  11: { x: 632.1, y: 495.7, w: 226.7, h: 226.7, rot: -1.4 },
  12: { x: 313.5, y: 464.4, w: 302.4, h: 302.4, rot: -1.6 },
  13: { x: 434.5, y: 474.5, w: 276.3, h: 276.3, rot: -2.9 },
  14: { x: 434.7, y: 473.0, w: 271.4, h: 271.4, rot: -3.4 },
  15: { x: 501.4, y: 433.4, w: 239.2, h: 239.2, rot: -1.5 },
  16: { x: 596.1, y: 500.1, w: 224.9, h: 224.9, rot: -2.6 },
  17: { x: 626.2, y: 513.2, w: 231.3, h: 231.3, rot: -1.4 },
  18: { x: 589.4, y: 470.9, w: 265.5, h: 265.5, rot: -1.5 },
  19: { x: 580.2, y: 439.4, w: 271.3, h: 271.3, rot: -1.9 },
  20: { x: 567.6, y: 492.6, w: 244.7, h: 244.7, rot: -1.9 },
  21: { x: 588.9, y: 464.0, w: 303.9, h: 303.9, rot: -1.3 },
  22: { x: 589.4, y: 423.3, w: 264.1, h: 264.1, rot: -2.2 },
  23: { x: 658.7, y: 545.5, w: 225.2, h: 225.2, rot: -1.4 },
  24: { x: 797.1, y: 366.5, w: 273.6, h: 273.6, rot: -1.2 },
  25: { x:  53.2, y: 367.7, w: 279.7, h: 279.7, rot: -1.5 },
  26: { x: 170.0, y: 475.2, w: 252.5, h: 252.5, rot: -1.4 },
  27: { x: 572.7, y: 579.4, w: 198.1, h: 198.1, rot: -3.4 },
  28: { x: 467.0, y: 407.6, w: 216.8, h: 216.8, rot: -2.1 },
  29: { x: 465.5, y: 481.0, w: 296.1, h: 296.1, rot: -1.2 },
  30: { x: 531.2, y: 472.7, w: 251.3, h: 251.3, rot: -1.9 },
  31: { x: 439.6, y: 370.5, w: 256.9, h: 256.9, rot: -1.4 },
  32: { x: 437.4, y: 377.9, w: 288.2, h: 288.2, rot: -1.9 },
  33: { x: 525.3, y: 589.6, w: 212.5, h: 212.5, rot: -1.5 },
  34: { x: 476.1, y: 400.7, w: 262.2, h: 262.2, rot: -1.7 },
  35: { x: 487.1, y: 488.8, w: 259.7, h: 259.7, rot: -2.1 },
  36: { x: 450.0, y: 416.2, w: 345.8, h: 345.8, rot: -1.3 },
};

async function fetchAsBuffer(url, method = "GET") {
  const res = await fetch(url, { method, cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch file: ${url} (${res.status})`);
  if (method === "HEAD") return Buffer.from([]);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

async function resolveRoomAssetUrl(roomNum) {
  const file = ROOM_FILES[roomNum];
  if (!file) throw new Error(`Invalid room. Use room=1..36`);
  const basePath = `${ROOMS_PREFIX}${file}`;

  const candidates = [basePath];

  // If mapping says .png, also try jpg/jpeg so your repo can contain mixed formats.
  if (file.toLowerCase().endsWith(".png")) {
    candidates.push(basePath.replace(/\.png$/i, ".jpg"));
    candidates.push(basePath.replace(/\.png$/i, ".jpeg"));
  }

  // If mapping says jpg/jpeg, also try png
  if (file.toLowerCase().endsWith(".jpg") || file.toLowerCase().endsWith(".jpeg")) {
    candidates.push(basePath.replace(/\.(jpg|jpeg)$/i, ".png"));
  }

  for (const rel of candidates) {
    const url = RAW_BASE + rel;
    const head = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (head.ok) return url;
  }

  return RAW_BASE + basePath; // will throw a clearer error on GET
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const room = Number(searchParams.get("room"));
    if (!Number.isInteger(room) || room < 1 || room > 36) {
      return NextResponse.json({ error: "Invalid room. Use room=1..36" }, { status: 400 });
    }

    const avatarUrl = searchParams.get("avatar"); // optional
    const roomUrl = await resolveRoomAssetUrl(room);

    const baseBuf = await fetchAsBuffer(roomUrl);

    const placement = ROOM_AVATAR[room];

    // No avatar OR no placement -> just return base image as PNG
    if (!avatarUrl || !placement) {
      const out = await sharp(baseBuf).png().toBuffer();
      return new NextResponse(out, {
        headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
      });
    }

    // Fetch avatar and resize to target
    const avatarBuf = await fetchAsBuffer(avatarUrl);

    const w = Math.round(placement.w);
    const h = Math.round(placement.h);
    const rot = Number(placement.rot || 0);

    const avatarLayer = await sharp(avatarBuf)
      .resize(w, h, { fit: "cover" })
      .png()
      .toBuffer();

    // Rotate around center with transparent background
    const rotated = await sharp(avatarLayer)
      .rotate(rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();

    const meta = await sharp(rotated).metadata();
    const rotW = meta.width || w;
    const rotH = meta.height || h;

    // Convert your top-left to center, then place rotated layer by center alignment
    const cx = placement.x + placement.w / 2;
    const cy = placement.y + placement.h / 2;

    const left = Math.round(cx - rotW / 2);
    const top = Math.round(cy - rotH / 2);

    const composed = await sharp(baseBuf)
      .composite([{ input: rotated, left, top }])
      .png()
      .toBuffer();

    return new NextResponse(composed, {
      headers: { "Content-Type": "image/png", "Cache-Control": "no-store" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}
