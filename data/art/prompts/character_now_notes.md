# Character NOW Prompt Pack Notes

This pack translates active NOW requisitions into stable prompt/spec entries plus swap-safe placeholders.

## Scope Covered
- `npc_family_set_v1`
- `npc_ines_v1`
- `rq_add_004`
- `rq_add_005`
- `rq_add_011`
- `rq_add_012`

## Prompt Authoring Conventions
- **Engine-safe IDs**: kept exactly aligned to requisition IDs.
- **Replaceable structure**: each entry keeps only production fields needed by the pipeline:
  - `id`, `type`, `scene`, `style_tags`, `prompt_seed`, `expression_targets`, `pose_targets`, `sheet_targets`, `dependencies`
- **No hard lock to one renderer/model**: `prompt_seed` is descriptive and portable.
- **Sheet targets are naming contracts** for future rendered exports, not hardcoded file paths.

## Placeholder Strategy
- Placeholders are copied from existing engine sprite bases to keep files lightweight and valid.
- Filenames are keyed to requisition IDs for easy swap later.
- Current placeholders are intended as temporary visual stand-ins for content routing/UI verification.

## Replacement Guidance
1. Generate final sheets per `sheet_targets` in the JSON.
2. Keep requisition-keyed filenames available (or map them in importer) until final assets land.
3. Preserve sprite framing/canvas dimensions when replacing to avoid animation or alignment regressions.

## Placeholder Mapping (current)
- `npc_family_set_v1.png` ← `engine/assets/sprites/npc/younger_idle_4f.png`
- `npc_ines_v1.png` ← `engine/assets/sprites/npc/older_idle_4f.png`
- `rq_add_004.png` ← `engine/assets/sprites/npc/styles/warm_hearth/younger_talk_4f.png`
- `rq_add_005.png` ← `engine/assets/sprites/npc/styles/pastel_storybook/younger_idle_4f.png`
- `rq_add_011.png` ← `engine/assets/sprites/father_walk.png`
- `rq_add_012.png` ← `engine/assets/sprites/npc/styles/ink_noir/older_walk_4f.png`
