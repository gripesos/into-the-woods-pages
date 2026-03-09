# HOTSPOT LINT v1

## Summary
- Scenes scanned: 5
- Hotspot-hotspot overlaps: 1
- Hotspot-entity overlaps: 2
- Oversized hotspots: 0
- Transition hotspots missing/invalid approachX: 0
- Invalid rect definitions: 0

## Thresholds
- Max hotspot area (% of scene): 12.0%
- Max hotspot area (% of 640x360 reference): 12.0%
- Shrink suggestions enabled: True

## Per-scene details
### cabin
- hotspots=4, entities=2
- overlaps: hotspot-hotspot=1, hotspot-entity=2; oversized=0; missing approachX=0; invalid rects=0
- Hotspot-hotspot overlaps:
  - table x door @ [326, 198, 2, 30] area=60 (a=1.351%, b=0.834%, scene=0.026%)
    - hint: shrink table to [328, 198, 146, 30]
    - hint: shrink door to [270, 108, 56, 124]
- Hotspot-entity overlaps:
  - fireplace x younger @ [84, 188, 10, 94] area=940 (hotspot=11.657%, entity=13.971%, scene=0.408%)
    - hint: shrink fireplace to [22, 170, 62, 112]
  - table x older @ [452, 198, 22, 30] area=660 (hotspot=14.865%, entity=8.929%, scene=0.286%)
    - hint: shrink table to [326, 198, 126, 30]

### forest
- hotspots=6, entities=0
- overlaps: hotspot-hotspot=0, hotspot-entity=0; oversized=0; missing approachX=0; invalid rects=0

### moonwell_hollow
- hotspots=3, entities=0
- overlaps: hotspot-hotspot=0, hotspot-entity=0; oversized=0; missing approachX=0; invalid rects=0

### ranger_station
- hotspots=4, entities=0
- overlaps: hotspot-hotspot=0, hotspot-entity=0; oversized=0; missing approachX=0; invalid rects=0

### windfall_orchard
- hotspots=3, entities=0
- overlaps: hotspot-hotspot=0, hotspot-entity=0; oversized=0; missing approachX=0; invalid rects=0
