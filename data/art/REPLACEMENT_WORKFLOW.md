# Replacement Workflow (v1)

This workflow maps placeholder assets to production assets, then applies replacements safely with automatic backups.

## Files

- Manifest: `/home/catmaster/Documents/Ideas/intothewoods/engine/data/art/replacement_manifest_v1.json`
- Tool: `/home/catmaster/Documents/Ideas/intothewoods/tools/apply_replacements.py`
- Backup root (auto-created during apply):
  - `/home/catmaster/Documents/Ideas/intothewoods/engine/assets/_backup_replacements/`

## Manifest contract

Each entry must include:

- `id`
- `type`
- `placeholderPath`
- `preferredFinalPath`
- `fallbackPaths` (array)
- `status` (`planned` | `ready` | `applied`)
- `notes`

Path values are repo-root relative.

## State model

- `planned`: replacement designed but not ready to apply.
- `ready`: final art is ready; apply tool can replace if source exists.
- `applied`: already replaced in a previous run.

## Safe apply procedure

1. Add/update entries in manifest.
2. Mark an entry `ready` only when final file is available.
3. Run dry-run to verify resolution:
   ```bash
   /home/catmaster/Documents/Ideas/intothewoods/tools/apply_replacements.py --dry-run
   ```
4. Apply ready replacements:
   ```bash
   /home/catmaster/Documents/Ideas/intothewoods/tools/apply_replacements.py --apply-ready
   ```
5. Review JSON summary output for:
   - `applied`
   - `skipped`
   - `errors`
6. If desired, update manifest statuses from `ready` to `applied` manually after QA verification.

## Resolution order

For each manifest entry, source lookup order is:

1. `preferredFinalPath`
2. each path in `fallbackPaths` (in order)

The first existing file is used.

## Backups

When applying:

- Existing placeholder file is copied first.
- Backup path mirrors asset subtree under `_backup_replacements`.
- Backup filenames include timestamp, e.g.:
  - `rq_add_013_placeholder.20260301-061600.png`

## Summary JSON

The tool prints a machine-readable summary to stdout and can write it to file with:

```bash
/home/catmaster/Documents/Ideas/intothewoods/tools/apply_replacements.py \
  --dry-run \
  --summary-out /home/catmaster/Documents/Ideas/intothewoods/engine/data/art/replacement_summary_latest.json
```

