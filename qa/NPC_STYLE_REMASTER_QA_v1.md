# NPC Style Remaster QA v1

Generated after reference-matched remaster pass.

## Scope

- Checked all style folders under `engine/assets/sprites/npc/styles/`.
- Validated six core sheets per style (`older/younger` × `idle/walk/talk`).
- Validation criteria: exact `384x96` geometry and `RGBA` mode.

## Per-style results

| Style | Core files | Geometry/Mode | Avg visible luma | Notes |
|---|---:|---|---:|---|
| `ink_noir` | 6 | PASS | 0.313 | ok |
| `moonlit_mystery` | 6 | PASS | 0.306 | ok |
| `pastel_storybook` | 6 | PASS | 0.472 | ok |
| `twilight_whispers` | 6 | PASS | 0.322 | ok |
| `warm_hearth` | 6 | PASS | 0.395 | ok |

## Summary

- Styles checked: **5**
- Remastered files: **30**
- Validation outcome: all remastered style sheets meet size/mode constraints.