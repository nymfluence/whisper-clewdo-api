# whisper-clewdo-api

Vercel API that composites a Discord member avatar into WHISPER · CLEWDO room templates hosted in `whisper-clewdo-assets`

## Endpoint

GET `/api/clewdo/render?room=12&avatar=<discord_avatar_url>`

- `room`: 1..36
- `avatar`: required for rooms 3..36

Rooms 1 and 2 return the base image unchanged.

## Environment variables

Required:
- `CLEWDO_ASSETS_OWNER` (your GitHub username/org)

Optional:
- `CLEWDO_ASSETS_REPO` (default `whisper-clewdo-assets`)
- `CLEWDO_ASSETS_BRANCH` (default `main`)
- `GITHUB_TOKEN` (recommended to avoid rate limits when fetching raw assets)
