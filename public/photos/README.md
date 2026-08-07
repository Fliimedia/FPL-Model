# Photos folder

Optional. The app resolves each portrait in this order:

1. `/photos/{code}.png` (this folder)
2. Premier League CDN, 250px
3. Premier League CDN, 110x140
4. the club crest, as a last resort

Leave this folder empty and the CDN serves everything. Add a file only where
you want to override, named by the player code below.

Mount at the site root so paths resolve as `/photos/154561.png`. On Vercel
that means `public/photos/`.

| Player | Club | File |
| --- | --- | --- |
| Anderson | MCI | `215379.png` |
| B.Fernandes | MUN | `141746.png` |
| Calvert-Lewin | LEE | `177815.png` |
| Dubravka | TOT | `67089.png` |
| Gabriel | ARS | `226597.png` |
| Gibbs-White | NFO | `222531.png` |
| Guéhi | MCI | `209036.png` |
| Gyökeres | ARS | `224117.png` |
| Haaland | MCI | `223094.png` |
| Hughes | CRY | `108413.png` |
| João Pedro | CHE | `475168.png` |
| Konsa | AVL | `199798.png` |
| Lammens | MUN | `465247.png` |
| Mbeumo | MUN | `446008.png` |
| Mitchell | CRY | `244723.png` |
| N.Williams | NFO | `215136.png` |
| Ndiaye | EVE | `440993.png` |
| O'Reilly | MCI | `472769.png` |
| Pedro Porro | TOT | `441164.png` |
| Pickford | EVE | `111234.png` |
| Raya | ARS | `154561.png` |
| Rice | ARS | `204480.png` |
| Rogers | CHE | `244850.png` |
| Semenyo | MCI | `437730.png` |
| Shaw | MUN | `106760.png` |
| Szoboszlai | LIV | `424876.png` |
| Tarkowski | EVE | `17761.png` |
| Thiago | BRE | `502500.png` |
| Virgil | LIV | `97032.png` |
| Watkins | AVL | `178301.png` |
