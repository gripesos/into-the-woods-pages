# Scene Lighting Consistency v1

Lighting normalization pass across style-scene background PNGs.

## Summary
- Scene count: **5**
- PNG files scanned: **30**
- Outlier files corrected: **28**
- Method: per scene, compute luminance means across styles; target median scene luminance; apply bounded RGB scale (±15%) to outlier styles only.

## Per-scene luminance stats (across style means)

| Scene | Before mean | Before std | After mean | After std | Corrected outliers |
|---|---:|---:|---:|---:|---:|
| cabin_refmatch_v1.png | 0.094954 | 0.026755 | 0.090305 | 0.014010 | 6 |
| forest_refmatch_v1.png | 0.166075 | 0.046837 | 0.159077 | 0.026973 | 4 |
| moonwell_hollow_refmatch_v1.png | 0.144454 | 0.048579 | 0.137151 | 0.030350 | 6 |
| ranger_station_refmatch_v1.png | 0.087276 | 0.023771 | 0.083084 | 0.011988 | 6 |
| windfall_orchard_refmatch_v1.png | 0.114632 | 0.038955 | 0.108639 | 0.023853 | 6 |

## Outliers corrected

### cabin_refmatch_v1.png
- `cozy_classic`: mean 0.121181 → 0.101599, z=0.980, scale=0.850
- `ink_noir`: mean 0.063422 → 0.072226, z=-1.179, scale=1.150
- `moonlit_mystery`: mean 0.076312 → 0.084198, z=-0.697, scale=1.125
- `pastel_storybook`: mean 0.095412 → 0.083938, z=0.017, scale=0.900
- `twilight_whispers`: mean 0.075161 → 0.084768, z=-0.740, scale=1.142
- `warm_hearth`: mean 0.138237 → 0.115101, z=1.618, scale=0.850

### forest_refmatch_v1.png
- `cozy_classic`: mean 0.214882 → 0.180932, z=1.042, scale=0.850
- `ink_noir`: mean 0.101822 → 0.115804, z=-1.372, scale=1.150
- `moonlit_mystery`: mean 0.135509 → 0.151175, z=-0.653, scale=1.129
- `warm_hearth`: mean 0.238363 → 0.200677, z=1.543, scale=0.850

### moonwell_hollow_refmatch_v1.png
- `cozy_classic`: mean 0.194752 → 0.163806, z=1.035, scale=0.850
- `ink_noir`: mean 0.077002 → 0.087477, z=-1.388, scale=1.150
- `moonlit_mystery`: mean 0.110668 → 0.125593, z=-0.695, scale=1.150
- `pastel_storybook`: mean 0.143721 → 0.130922, z=-0.015, scale=0.926
- `twilight_whispers`: mean 0.122315 → 0.131633, z=-0.456, scale=1.088
- `warm_hearth`: mean 0.218263 → 0.183476, z=1.519, scale=0.850

### ranger_station_refmatch_v1.png
- `cozy_classic`: mean 0.109925 → 0.092045, z=0.953, scale=0.850
- `ink_noir`: mean 0.060924 → 0.069329, z=-1.109, scale=1.150
- `moonlit_mystery`: mean 0.072486 → 0.078096, z=-0.622, scale=1.098
- `pastel_storybook`: mean 0.086724 → 0.077638, z=-0.023, scale=0.918
- `twilight_whispers`: mean 0.066946 → 0.076167, z=-0.855, scale=1.150
- `warm_hearth`: mean 0.126652 → 0.105230, z=1.657, scale=0.850

### windfall_orchard_refmatch_v1.png
- `cozy_classic`: mean 0.153846 → 0.129150, z=1.007, scale=0.850
- `ink_noir`: mean 0.063910 → 0.072574, z=-1.302, scale=1.150
- `moonlit_mystery`: mean 0.088545 → 0.100104, z=-0.670, scale=1.150
- `pastel_storybook`: mean 0.114224 → 0.100866, z=-0.010, scale=0.899
- `twilight_whispers`: mean 0.091255 → 0.101641, z=-0.600, scale=1.126
- `warm_hearth`: mean 0.176009 → 0.147499, z=1.576, scale=0.850

## Validation checks

- JSON metrics written and parseable: `engine/qa/scene_lighting_metrics_v1.json`
- Script runtime printed processed file count.
- PNG validity check: all 30 files open/verify successfully.
- Dimensions remained consistent per scene across styles (single dimension variant per scene).