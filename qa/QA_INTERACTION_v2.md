# QA Interaction v2 (precision + walk-to transitions)

## Result
- Cases: 25
- Passed: 25
- Failed: 0

## Validation focus
- Overlap resolution within hotspots: smallest rectangle wins.
- Transition hotspots (gotoScene) trigger only after walk-to collision completion.
- Non-transition hotspots and entities trigger immediately on click.

## Overlap findings
- cabin | hotspot-hotspot | table x door @ [326, 198, 2, 30]
- cabin | hotspot-entity | fireplace x younger @ [84, 188, 10, 94]
- cabin | hotspot-entity | table x older @ [452, 198, 22, 30]

## Coordinate test matrix
| # | Scene | Coord | Expected target | Expected trigger | Actual target | Actual trigger | Pass |
|---|---|---|---|---|---|---|---|
| 1 | cabin | (380,245) | hotspot:notebook | immediate | hotspot:notebook | immediate | PASS |
| 2 | cabin | (40,200) | hotspot:fireplace | immediate | hotspot:fireplace | immediate | PASS |
| 3 | cabin | (305,160) | hotspot:door | walk_to_collision | hotspot:door | walk_to_collision | PASS |
| 4 | cabin | (327,210) | hotspot:table | immediate | hotspot:table | immediate | PASS |
| 5 | cabin | (95,220) | entity:younger | immediate | entity:younger | immediate | PASS |
| 6 | cabin | (90,230) | hotspot:fireplace | immediate | hotspot:fireplace | immediate | PASS |
| 7 | cabin | (460,210) | hotspot:table | immediate | hotspot:table | immediate | PASS |
| 8 | cabin | (20,340) | none:None | none | none:None | none | PASS |
| 9 | forest | (200,250) | hotspot:woodpile | immediate | hotspot:woodpile | immediate | PASS |
| 10 | forest | (305,230) | hotspot:lantern | immediate | hotspot:lantern | immediate | PASS |
| 11 | forest | (470,210) | hotspot:marktree | immediate | hotspot:marktree | immediate | PASS |
| 12 | forest | (50,220) | hotspot:cabin_return | walk_to_collision | hotspot:cabin_return | walk_to_collision | PASS |
| 13 | forest | (585,220) | hotspot:trail_signpost | walk_to_collision | hotspot:trail_signpost | walk_to_collision | PASS |
| 14 | forest | (365,230) | hotspot:hollow_path | walk_to_collision | hotspot:hollow_path | walk_to_collision | PASS |
| 15 | forest | (260,330) | none:None | none | none:None | none | PASS |
| 16 | ranger_station | (410,180) | hotspot:station_board | immediate | hotspot:station_board | immediate | PASS |
| 17 | ranger_station | (510,220) | hotspot:station_radio | immediate | hotspot:station_radio | immediate | PASS |
| 18 | ranger_station | (40,220) | hotspot:station_trail_back | walk_to_collision | hotspot:station_trail_back | walk_to_collision | PASS |
| 19 | ranger_station | (600,220) | hotspot:station_orchard_route | walk_to_collision | hotspot:station_orchard_route | walk_to_collision | PASS |
| 20 | moonwell_hollow | (300,210) | hotspot:moonwell_pool | immediate | hotspot:moonwell_pool | immediate | PASS |
| 21 | moonwell_hollow | (150,230) | hotspot:moonwell_stones | immediate | hotspot:moonwell_stones | immediate | PASS |
| 22 | moonwell_hollow | (30,230) | hotspot:moonwell_to_forest | walk_to_collision | hotspot:moonwell_to_forest | walk_to_collision | PASS |
| 23 | windfall_orchard | (430,240) | hotspot:orchard_cart | immediate | hotspot:orchard_cart | immediate | PASS |
| 24 | windfall_orchard | (120,210) | hotspot:orchard_gate | immediate | hotspot:orchard_gate | immediate | PASS |
| 25 | windfall_orchard | (600,220) | hotspot:orchard_to_station | walk_to_collision | hotspot:orchard_to_station | walk_to_collision | PASS |

## Quick manual smoke script
1. Launch engine; enable Debug (D) to visualize rects and hover labels.
2. In each scene, click one non-transition hotspot and verify instant response (text/dialogue/pickup).
3. Click each transition hotspot once and verify message shows movement intent (walkToText) before scene changes.
4. Confirm scene change occurs only when player reaches approach X (collision endpoint), not at initial click time.
5. Cabin overlap checks:
   - Click door/table overlap near (327,210): table should resolve immediately (smaller hotspot rect).
   - Click fireplace/younger overlap near (90,230): fireplace hotspot wins over entity under current precedence.
6. Click plain walkable floor in each scene and verify only movement occurs, no interaction trigger.
