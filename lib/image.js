import sharp from "sharp";

export function isAllowedAvatarUrl(urlString) {
  try {
    const u = new URL(urlString);

    // Allow Discord CDN & common proxy host used by Discord embeds
    const allowedHosts = new Set([
      "cdn.discordapp.com",
      "media.discordapp.net",
      "images-ext-1.discordapp.net",
      "images-ext-2.discordapp.net"
    ]);

    return allowedHosts.has(u.hostname);
  } catch {
    return false;
  }
}

export async function fetchImageBuffer(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch avatar (${res.status})`);
  const ab = await res.arrayBuffer();
  return Buffer.from(ab);
}

/**
 * Center-crop to square, resize to W x H, composite onto base at X,Y.
 * Optional: slight softening to feel printed.
 */
export async function compositeAvatarIntoBase({
  basePngBuffer,
  avatarBuffer,
  x,
  y,
  w,
  h
}) {
  // Prepare avatar: crop to square, resize to target box
  const avatar = sharp(avatarBuffer).rotate(); // respect EXIF if present

  const meta = await avatar.metadata();
  const aw = meta.width || 0;
  const ah = meta.height || 0;

  if (!aw || !ah) throw new Error("Avatar metadata missing");

  const side = Math.min(aw, ah);
  const left = Math.floor((aw - side) / 2);
  const top  = Math.floor((ah - side) / 2);

  const avatarProcessed = await avatar
    .extract({ left, top, width: side, height: side })
    .resize(Math.round(w), Math.round(h), { fit: "cover" })
    // tiny blur to sit naturally in the photo (optional but looks good)
    .blur(0.2)
    .png()
    .toBuffer();

  // Composite onto base
  const out = await sharp(basePngBuffer)
    .composite([
      { input: avatarProcessed, left: Math.round(x), top: Math.round(y) }
    ])
    .png()
    .toBuffer();

  return out;
}
