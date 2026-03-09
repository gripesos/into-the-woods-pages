# NPC Layout Schema (v1)

`data/npc_layouts.json` provides scene/NPC visual placement for sprite rendering states.

## File shape

```json
{
  "version": "itw-npc-layout-v1",
  "scenes": {
    "<sceneId>": {
      "<npcId>": {
        "states": {
          "idle": { "x": 0, "y": 0, "w": 96, "h": 96, "bobScale": 1.5 },
          "talk": { "x": 0, "y": 0, "w": 96, "h": 96, "bobScale": 2.2 }
        }
      }
    }
  }
}
```

## State fields

- `x` (number): destination X on canvas
- `y` (number): destination Y on canvas
- `w` (number): destination width
- `h` (number): destination height
- `bobScale` (number, optional): amplitude used for idle/talk bob motion

## Runtime precedence

When drawing NPC sprites, runtime chooses layout in this order:

1. `npc_layouts.json` → `scenes[sceneId][npcId].states[stateName]`
2. Scene NPC inline visual data → `scene.npcs[].visual.states[stateName]`
3. Hardcoded compatibility fallback (current cabin defaults)

State fallback inside a source:

- requested state (e.g. `talk`)
- `idle`

## Scene NPC extension fields

`data/scenes/*.json` `npcs[]` can include:

```json
{
  "id": "younger",
  "rect": [84, 188, 58, 116],
  "visual": {
    "layoutScene": "cabin",
    "layoutNpcId": "younger",
    "states": {
      "idle": { "x": 60, "y": 198, "w": 96, "h": 96, "bobScale": 1.5 },
      "talk": { "x": 60, "y": 198, "w": 96, "h": 96, "bobScale": 2.4 }
    }
  }
}
```

`layoutScene`/`layoutNpcId` are metadata hints for tools and future validation; current runtime uses `npc_layouts.json` by active scene + npc id.
