# Into the Woods — Art Requisitions

Production style target: **retro Sierra adventure readability + ecological mystery mood + intimate family staging**.

## NOW (Sprint-Critical)

1. **bg_cabin_day_v1**  
   - Type: background | Priority: P0 | Scene: cabin  
   - Style tags: retro-sierra, pixel-art, warm-interior, family-intimacy  
   - Resolution: 1920x1080  
   - Description: Main cabin daytime layout with clear interactables.

2. **bg_cabin_night_v1**  
   - Type: background | Priority: P0 | Scene: cabin  
   - Style tags: retro-sierra, pixel-art, blue-hour, mystery  
   - Resolution: 1920x1080  
   - Description: Night variant with lamp contrast and ominous tree-line silhouettes.

3. **bg_forest_trail_v1**  
   - Type: background | Priority: P0 | Scene: forest  
   - Style tags: retro-sierra, lush-forest, eco-mystery, parallax-ready  
   - Resolution: 1920x1080  
   - Description: Foundational forest exploration screen with landmark tree.

4. **npc_family_set_v1**  
   - Type: npc_sprite | Priority: P0 | Scene: cabin|forest  
   - Style tags: pixel-art, expressive-idle, family-drama  
   - Resolution: 512x512 per character sheet  
   - Description: Tomás, Clara, Lia core pose set.

5. **npc_ines_v1**  
   - Type: npc_sprite | Priority: P1 | Scene: ranger_station|forest  
   - Style tags: pixel-art, aged-ranger, grounded  
   - Resolution: 512x512  
   - Description: Inês mentor sprite with map tube and cane variants.

6. **prop_clue_pack_v1**  
   - Type: prop | Priority: P0 | Scene: cabin|forest  
   - Style tags: inventory-icons, evidence-core, pixel-art  
   - Resolution: 256x256 each  
   - Description: Notebook, chalk, compass, marker, stake, cassette.

7. **fx_hum_anomaly_v1**  
   - Type: fx | Priority: P1 | Scene: forest  
   - Style tags: subtle-vfx, environmental-clue, diegetic  
   - Resolution: 1024x1024 sprite sheet  
   - Description: Ground distortion effect for hidden machinery hum.

8. **ui_notebook_overlay_v1**  
   - Type: ui_motif | Priority: P1 | Scene: global  
   - Style tags: diegetic-ui, paper-texture, investigation  
   - Resolution: 1600x900  
   - Description: Clue notebook overlay with pins and symbol slots.

9. **bg_ranger_station_v1**  
   - Type: background | Priority: P1 | Scene: ranger_station  
   - Style tags: retro-sierra, archive-room, documentary-mystery  
   - Resolution: 1920x1080  
   - Description: Archive scene supporting evidence and exposition.

10. **prop_evidence_board_v1**  
    - Type: prop | Priority: P1 | Scene: cabin  
    - Style tags: story-prop, red-string, investigation  
    - Resolution: 1024x1024  
    - Description: Progression pinboard for dynamic clue display.

## LATER (Post-Vertical Slice)

- **bg_drained_marsh_v1** — drained ecosystem proof scene.  
- **bg_river_lock_tunnel_v1** — climax infrastructure reveal.  
- **npc_mateus_v1** — morally conflicted contractor contact.  
- **prop_floodgate_key_v1** — late-game critical key prop.  
- **fx_storm_rain_overlay_v1** — storm climax readability layer.  
- **ui_signal_decoder_v1** — optional radio tuning minigame motif.

## Field Requirements (applies to every request entry)
- id
- type
- priority
- scene
- style_tags
- resolution
- description
- prompt_seed
- dependencies
