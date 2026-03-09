# STYLE_REFMATCH_v2

Strict reference-match pass for BG style assets and NPC style sheets.

## Reference
- Path: `/home/catmaster/Documents/Ideas/intothewoods/good ref.png`
- Dimensions: 1536x1024
- Mean RGB: [16.5205, 10.3668, 5.5624]
- Std RGB: [19.6846, 13.5805, 8.0601]
- Mean luma: 11.3287

## Scope
- BG files processed: 30
- NPC files processed: 30
- Total files processed: 60

## Aggregate Result
- Mean color distance (before): 0.3708
- Mean color distance (after):  0.1773
- Improvement: 52.1901%

## Per-style mean color distance to reference (before → after)
- **cozy_classic** (bg, n=5): 0.1488 → 0.0599 (59.7045%)
- **ink_noir** (bg,npc, n=11): 0.2867 → 0.1382 (51.7976%)
- **moonlit_mystery** (bg,npc, n=11): 0.3748 → 0.1795 (52.107%)
- **pastel_storybook** (bg,npc, n=11): 0.4705 → 0.2282 (51.4954%)
- **twilight_whispers** (bg,npc, n=11): 0.3934 → 0.1888 (52.0147%)
- **warm_hearth** (bg,npc, n=11): 0.4296 → 0.2051 (52.2641%)

## Validation
- Dimensions preserved for all processed PNGs: **True**
- Dimension failures: none
- JSON parse validation: passed (`/home/catmaster/Documents/Ideas/intothewoods/engine/qa/style_refmatch_metrics_v2.json`)

## Artifacts
- Metrics JSON: `/home/catmaster/Documents/Ideas/intothewoods/engine/qa/style_refmatch_metrics_v2.json`
- Reference palette: `/home/catmaster/Documents/Ideas/intothewoods/engine/data/styles/ref_palette_v2.json`
- Script: `/home/catmaster/Documents/Ideas/intothewoods/tools/style_refmatch_v2.py`
