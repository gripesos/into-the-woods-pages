# Manual Art Help — Fastest Way You Can Improve Quality

## 1) ComfyUI startup behavior (fixed)
If you launch ComfyUI and port `8188` is already in use, launcher now:
- reuses existing ComfyUI if it is already running, and opens browser
- otherwise tries next free port

Primary URL: `http://127.0.0.1:8188`

## 2) Human curation pass (highest impact)
Use this file and fill it quickly while reviewing images:

- `engine/data/art/manual_art_review_template.csv`

Columns:
- `score_1to5`: visual quality score
- `keep_y_n`: `y` if keeper
- `notes`: what feels wrong (lighting, anatomy, clutter, palette drift)

Tip: only rate low/high confidence assets first (1–2 or 4–5).

## 3) What to review first
Prioritize these groups:
1. Backgrounds for `cabin` + `forest` (all styles)
2. NPC `older_talk_4f` and `younger_talk_4f` sheets (all styles)
3. New chapter scenes (`ranger_station`, `moonwell_hollow`, `windfall_orchard`)

## 4) If you generate manual replacements in ComfyUI
Save outputs to one of these naming patterns so I can auto-apply:
- Background: `engine/assets/bg/styles/<style>/<scene>_final_v1.png`
- NPC sheet: `engine/assets/sprites/npc/styles/<style>/<name>_final_v1.png`

Then tell me “apply replacements”, and I will wire them in.

## 5) Gold reference set (optional but powerful)
Drop 5–15 “perfect mood” images in:
- `engine/data/styles/reference_set/`

I can run a stricter palette/tone match pass against that curated set.
