# STYLE_REMASTER_NOTES_v1

Reference palette anchor: `ref_palette.json` (mean `rgb(17,10,6)`, deep near-black umber mood).
Processing stack: deterministic ffmpeg transforms (scale 640x360, EQ, colorbalance, gblur, vignette).

## Per-style tone remaster adjustments
### cozy_classic
- EQ: brightness -0.18, contrast 1.05, saturation 0.86, gamma 1.1
- Color-balance shadow offsets: red 0.1, green 0.03, blue -0.05
- Atmosphere: blur sigma 0.5, vignette angle 0.18
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

### moonlit_mystery
- EQ: brightness -0.28, contrast 1.18, saturation 0.7, gamma 1.2
- Color-balance shadow offsets: red -0.1, green 0.02, blue 0.12
- Atmosphere: blur sigma 0.9, vignette angle 0.28
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

### warm_hearth
- EQ: brightness -0.14, contrast 1.1, saturation 0.95, gamma 1.05
- Color-balance shadow offsets: red 0.13, green 0.04, blue -0.12
- Atmosphere: blur sigma 0.4, vignette angle 0.16
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

### ink_noir
- EQ: brightness -0.32, contrast 1.3, saturation 0.35, gamma 1.28
- Color-balance shadow offsets: red 0.04, green 0.0, blue -0.08
- Atmosphere: blur sigma 0.7, vignette angle 0.3
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

### pastel_storybook
- EQ: brightness -0.22, contrast 0.92, saturation 0.62, gamma 1.0
- Color-balance shadow offsets: red 0.09, green 0.03, blue -0.03
- Atmosphere: blur sigma 1.0, vignette angle 0.12
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

### twilight_whispers
- EQ: brightness -0.26, contrast 1.02, saturation 0.66, gamma 1.18
- Color-balance shadow offsets: red 0.0, green -0.01, blue 0.08
- Atmosphere: blur sigma 0.8, vignette angle 0.24
- Palette mapping intent: pull mids/shadows into dark warm-charcoal base while keeping style identity through differential channel bias.

Generated remaster backgrounds: 30 (6 styles × 5 active scenes).
All active scenes now have style sceneArt coverage with `*_refmatch_v1.png` placed first in each list.