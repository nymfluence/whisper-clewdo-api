import { NextResponse } from "next/server";
import sharp from "sharp";

const ASSET_BASE =
  "https://raw.githubusercontent.com/nymfluence/whisper-clewdo-assets/main";

const ROOM_CONFIG = {
  3:  { x: 847.1, y: 552.7, w: 226.7, h: 226.7, r: 2.1 },
  4:  { x: 202.5, y: 367.5, w: 272.4, h: 272.4, r: -1.1 },
  5:  { x: 395.1, y: 431.9, w: 235.4, h: 235.4, r: -1.4 },
  6:  { x: 832.2, y: 534.6, w: 227.1, h: 227.1, r: 2.1 },
  7:  { x: 572.9, y: 558.1, w: 211.5, h: 211.5, r: -1.4 },
  8:  { x: 673.4, y: 390.6, w: 309,   h: 309,   r: -1.3 },
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
  25: { x: 53.2,  y: 367.7, w: 279.7, h: 279.7, r: -1.5 },
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
  36: { x: 450.0, y: 416.2, w: 345.8, h: 345.8, r: -1.3 }
};

async function fetchImage(path) {
  const exts = ["png", "jpg", "jpeg"];
  for (const ext of exts) {
    const url = `${ASSET_BASE}/${path}.${ext}`;
    const res = await fetch(url);
    if (res.ok) return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`Missing base image: ${path}`);
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const room = Number(searchParams.get("room"));
    const avatar = searchParams.get("avatar");

    if (!ROOM_CONFIG[room]) {
      return NextResponse.json({ error: "Invalid room" }, { status: 400 });
    }

    const base = await fetchImage(
      `clewdo/rooms/${String(room).padStart(2, "0")}-${Object.keys(ROOM_CONFIG).includes(room)}-base`
    );

    let canvas = sharp(base);

    if (avatar) {
      const cfg = ROOM_CONFIG[room];

      const avatarBuf = Buffer.from(
        await (await fetch(avatar)).arrayBuffer()
      );

      const framed = await sharp(avatarBuf)
        .resize(Math.round(cfg.w), Math.round(cfg.h))
        .rotate(cfg.r, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();

      canvas = canvas.composite([
        {
          input: framed,
          left: Math.round(cfg.x - cfg.w / 2),
          top: Math.round(cfg.y - cfg.h / 2),
        },
      ]);
    }

    const output = await canvas.jpeg({ quality: 92 }).toBuffer();

    return new NextResponse(output, {
      headers: { "Content-Type": "image/jpeg" },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
