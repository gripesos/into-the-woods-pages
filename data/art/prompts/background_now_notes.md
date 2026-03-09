# Background NOW Production Notes

Date: 2026-03-01

## Produced engine-ready outputs (640x360 PNG)

Folder: `/home/catmaster/Documents/Ideas/intothewoods/engine/assets/bg/requisition_now/`

- `bg_bg_cabin_day_v1_640x360.png` (source: `engine/assets/bg/cabin.png`, warm daylight grade)
- `bg_bg_cabin_night_v1_640x360.png` (source: `engine/assets/bg/cabin.png`, blue-hour night variant)
- `bg_bg_forest_trail_v1_640x360.png` (source: `engine/assets/bg/forest.png`, depth/readability tune)
- `bg_rq_add_001_640x360.png` (source: `engine/assets/bg/cabin.png`, hearthline glow proxy)
- `bg_rq_add_002_640x360.png` (source: `engine/assets/bg/forest.png`, moonlit verge + lantern proxy)
- `bg_rq_add_007_640x360.png` (source: `engine/assets/bg/forest.png`, fog reveal variant)
- `bg_bg_ranger_station_v1_640x360.png` (source: `engine/assets/bg/cabin.png`, archive-room placeholder grade)
- `bg_rq_add_008_640x360.png` (source: `engine/assets/bg/forest.png`, moonwell noir placeholder)
- `bg_rq_add_010_640x360.png` (source: `engine/assets/bg/forest.png`, orchard ruin pastel variant)

## Prompt pack

Created:
- `/home/catmaster/Documents/Ideas/intothewoods/engine/data/art/prompts/background_now_prompts.json`

Fields included per requisition:
- `id`
- `scene`
- `style_tags`
- `prompt_seed`
- `negative_prompt`
- `notes`

## What still needs external high-res generation

Deterministic transforms were used as fallback to ensure immediate playable assets.
The following entries still need external concept/master generation (1920x1080+ paint quality, and 2560x1440 for moonwell wide):

- `bg_cabin_day_v1` (hi-res prop detailing pass)
- `bg_cabin_night_v1` (window silhouette storytelling pass)
- `bg_forest_trail_v1` (parallax-layer concept master)
- `rq_add_001` (hearthline + character silhouette narrative detail)
- `rq_add_002` (explicit moss-band geometry and landmark fidelity)
- `rq_add_007` (stepping-stone reveal and fog depth art direction)
- `bg_ranger_station_v1` (true ranger station environment build)
- `rq_add_008` (native wide-shot moonwell concept at 2560x1440)
- `rq_add_010` (orchard ruin landmark pass with ledger clue staging)

## Validation summary

- All generated PNGs verified at `640x360`.
- Prompt pack JSON parse check passed.
- `engine/src/main.js` was not modified.
