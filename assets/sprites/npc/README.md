# NPC Starter Sprite Sheets

This folder contains starter 4-frame pixel-art style sheets for two NPC variants:

- `older_idle_4f.png`
- `younger_idle_4f.png`
- `older_walk_4f.png`
- `younger_walk_4f.png`
- `older_talk_4f.png`
- `younger_talk_4f.png`

## Format

- Frame size: **96x96**
- Frames per sheet: **4**
- Layout: horizontal strip (left to right)
- Sheet size: **384x96**
- Background: transparent alpha

## Suggested playback

- Idle: 4-8 FPS looping
- Walk: 8-12 FPS looping
- Talk: 8-10 FPS looping (mouth movement cycle)

## Notes

- Art style is intentionally simple/procedural for readability at low resolution.
- If replacing with final art later, keep the same dimensions and frame ordering for compatibility.

## Style variants

Palette variants are available under `styles/`:

- `styles/moonlit_mystery/`
- `styles/warm_hearth/`
- `styles/ink_noir/`
- `styles/pastel_storybook/`
- `styles/twilight_whispers/`

Each folder mirrors the same 6-sheet naming scheme (`older/younger` × `idle/walk/talk`) for compatibility with style presets.

## Reference-matched remaster pass (v1)

A ref-match grading pass was applied to all NPC style sheets under `styles/*/` using the dark cinematic mood from:

- `/home/catmaster/Documents/Ideas/intothewoods/good ref.png`
- helper stats from `engine/data/styles/ref_palette.json`

### Intent by style

- `ink_noir`: strongest desaturation, high-contrast charcoal/sepia shadows.
- `moonlit_mystery`: cool moon-blue mids and subdued highlights.
- `pastel_storybook`: softened warm tones while still grounded in darker values.
- `twilight_whispers`: muted violet dusk tint with gentle contrast.
- `warm_hearth`: amber-brown warmth with low-key cinematic shading.

### Compatibility guarantees

- Geometry unchanged: **384x96** sheets, **96x96** frames, 4-frame horizontal strips.
- Alpha/background unchanged: transparent RGBA preserved.
- Base fallback sheets in `engine/assets/sprites/npc/` were left intact.
