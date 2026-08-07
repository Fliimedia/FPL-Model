# Crest folder

One file per club, named by its three letter code. The app checks `.svg`
first, then `.png`, then the Premier League CDN, then a coloured monogram.
Any club without a file here keeps using the CDN, so a partial set is fine.

Mount at the site root so paths resolve as `/crests/ARS.svg`. On Vercel
that means `public/crests/`.

| File | Club | Status |
| --- | --- | --- |
| `ARS.svg` | Arsenal | present |
| `AVL.svg` | Aston Villa | present |
| `BOU.svg` | Bournemouth | **missing, falls back to CDN** |
| `BRE.svg` | Brentford | present |
| `BHA.svg` | Brighton | present |
| `CHE.svg` | Chelsea | present |
| `COV.svg` | Coventry City | present |
| `CRY.svg` | Crystal Palace | present |
| `EVE.svg` | Everton | present |
| `FUL.svg` | Fulham | present |
| `HUL.svg` | Hull City | present |
| `IPS.svg` | Ipswich Town | present |
| `LEE.svg` | Leeds | present |
| `LIV.svg` | Liverpool | present |
| `MCI.svg` | Man City | present |
| `MUN.svg` | Man Utd | present |
| `NEW.svg` | Newcastle | present |
| `NFO.svg` | Nott'm Forest | present |
| `SUN.svg` | Sunderland | present |
| `TOT.svg` | Spurs | present |

## Notes

- Bournemouth was not in the archive. It renders from the CDN until a file is added.
- `FUL.svg` is only 1.8KB against 12 to 170KB for the rest, so it is likely a
  simplified mark rather than the full crest. Worth an eyeball.
- Aspect ratios vary a lot, from square to roughly 1:2 for Spurs. The Crest
  component uses `objectFit: contain` in a square box, so tall crests sit
  smaller than square ones. That is correct rendering, not a bug.
