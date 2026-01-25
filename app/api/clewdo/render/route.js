export const runtime = "nodejs";

import { NextResponse } from "next/server";
import {
  getRoomsAndFrames,
  getRoomBaseImageBuffer,
  roomHasVictimFrame,
  getVictimFrame
} from "../../../../lib/clewdo-config.js";
import {
  isAllowedAvatarUrl,
  fetchImageBuffer,
  compositeAvatarIntoBase
} from "../../../../lib/image.js";

/**
 * GET /api/clewdo/render?room=12&avatar=<discord_avatar_url>
 *
 * room: 1..36
 * avatar: required for rooms with victim frame (3..36). Not required for room 1-2.
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const room = Number(searchParams.get("room"));
    const avatarUrl = searchParams.get("avatar") || "";

    if (!room || room < 1 || room > 36) {
      return NextResponse.json(
        { error: "Invalid room. Use 1..36" },
        { status: 400 }
      );
    }

    // Base image for this room
    const base = await getRoomBaseImageBuffer(room);

    // Rooms 1-2: return base image unchanged (no PFP compositing)
    if (!roomHasVictimFrame(room)) {
      return new NextResponse(base, {
        status: 200,
        headers: {
          "Content-Type": "image/png",
          "Cache-Control": "public, max-age=31536000, immutable"
        }
      });
    }

    // Rooms 3..36 require avatar
    if (!avatarUrl) {
      return NextResponse.json(
        { error: "avatar is required for this room" },
        { status: 400 }
      );
    }

    if (!isAllowedAvatarUrl(avatarUrl)) {
      return NextResponse.json(
        { error: "avatar URL host not allowed" },
        { status: 400 }
      );
    }

    // Load frames config & get victim frame bounds
    const { frames } = await getRoomsAndFrames();
    const frame = getVictimFrame(room, frames);

    if (!frame) {
      return NextResponse.json(
        { error: `No frame config for room ${room}` },
        { status: 500 }
      );
    }

    // Fetch avatar and composite into base at given coordinates
    const avatar = await fetchImageBuffer(avatarUrl);

    const composed = await compositeAvatarIntoBase({
      basePngBuffer: base,
      avatarBuffer: avatar,
      x: frame.x,
      y: frame.y,
      w: frame.w,
      h: frame.h
    });

    // Cache: avatar changes per victim; allow caching but not immutable
    return new NextResponse(composed, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
