# FPL 2026/27

A single-file React app for the 2026/27 Fantasy Premier League season. It shows one
fixed fifteen-man squad, a fifteen-name watchlist, the full fixture list, and an
honest account of how the squad was chosen.

## What it is not

There is no in-house prediction model. Every figure in the app is public and
checkable:

- **Ownership, prices, xG and xA per 90, points per match, starts** — the official
  FPL API, which sources its underlying numbers from Opta.
- **Expert consensus** — six published gameweek 1 squads from managers with proven
  records.
- **Fixtures** — all 380 matches as published by the Premier League.
- **PPT column** — FPL Prophet's expected points, shown for information only. It
  plays no part in choosing the squad. See the Model tab for why.

## Layout

| Path | What |
| --- | --- |
| `App.jsx` | The whole app. React, inline styles, no dependencies beyond React. |
| `public/crests-v10/` | Club crests, backgrounds removed. Bournemouth falls back to the Premier League CDN. |
| `public/photos/` | Optional player portrait overrides. Empty by default; the CDN serves them. |

## Notes

- Bilingual Dutch and English, with a language toggle.
- Two themes.
- Crest and photo paths are versioned (`crests-v10`) purely to defeat browser caching.
- Club crests and player portraits are not redistributed here beyond the crest files
  themselves; portraits are hotlinked from the official Premier League CDN.
