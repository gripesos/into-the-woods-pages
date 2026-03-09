# Style Catalog (Engine v0.6)

Use these style IDs in the UI or save data:

- `cozy_classic` — default readable baseline
- `moonlit_mystery` — cool blue nocturnal mood
- `warm_hearth` — warm and lively
- `ink_noir` — high-contrast desaturated
- `pastel_storybook` — soft, dreamy palette
- `twilight_whispers` — dusk/mist blend with muted purples and hush tone

## Notes
- Styles control **scene art pools** and **NPC sprite-sheet sets**.
- NPC style folders are under `assets/sprites/npc/styles/`.
- Each style now supports 6 sheet keys per NPC set:
  - `older_idle`, `younger_idle`
  - `older_walk`, `younger_walk`
  - `older_talk`, `younger_talk`
- You can add new styles by appending entries to `style_catalog.json`.
