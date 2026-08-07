import React, { useState, useEffect, createContext, useContext, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   Sten's FPL Voorspellingen
   Same design system as wk2026-voorspellingen: one font family, the FS type
   scale, the THEMES tokens, marker/chipStyle, the accordion and match-row
   patterns, the nav with the model icon pinned top right.
   Data on this build is dummy data. Swap it for the FPL Review export.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── TYPE SCALE ─────────────────────────────────────────────────────────── */
const FONT = "'Inter','Helvetica Neue',Helvetica,Arial,sans-serif";

const FS = {
  display: 22,   // hero numbers
  h1: 17,        // page titles
  h2: 15,        // card titles
  body: 13,      // primary body copy
  small: 12,     // secondary body, table values
  caption: 10,   // captions, sub-labels
  micro: 8,      // column headers, tiny uppercase tags
};

const WEIGHT = { regular: 400, medium: 600, semibold: 700, bold: 800 };
const TYPE = {
  hero: { fontSize: FS.display, fontWeight: WEIGHT.bold, letterSpacing: -0.4 },
  title: { fontSize: FS.h1, fontWeight: WEIGHT.bold, letterSpacing: -0.3 },
  cardTitle: { fontSize: FS.h2, fontWeight: WEIGHT.semibold, letterSpacing: -0.2 },
  body: { fontSize: FS.body, fontWeight: WEIGHT.regular, lineHeight: 1.6 },
  label: { fontSize: FS.small, fontWeight: WEIGHT.medium },
  value: { fontSize: FS.small, fontWeight: WEIGHT.semibold },
  caption: { fontSize: FS.caption, fontWeight: WEIGHT.regular, lineHeight: 1.5 },
  eyebrow: { fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 1.2, textTransform: "uppercase" },
  tag: { fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 0.4 },
};

function hexA(hex, a) {
  if (typeof hex === "string" && /^#([0-9a-f]{6})$/i.test(hex)) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
  }
  return hex;
}
function marker(T, tone = "accent") {
  const D = T.id === "dark";
  const map = {
    accent: { fg: T.accent, base: T.accent },
    info: { fg: T.accent2, base: T.accent2 },
    neon: { fg: T.neonInk, base: T.neon },
    green: { fg: T.green, base: T.green },
    up: { fg: T.green, base: T.green },
    red: { fg: T.red, base: T.red },
    down: { fg: T.red, base: T.red },
    neutral: { fg: T.textSub, base: T.textSub },
  };
  const c = map[tone] || map.orange;
  return { fg: c.fg, base: c.base, bg: hexA(c.base, D ? 0.16 : 0.12), border: hexA(c.base, 0.3) };
}
function chipStyle(T, tone = "accent") {
  const m = marker(T, tone);
  return {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px",
    borderRadius: 20, background: m.bg, border: `1px solid ${m.border}`,
    fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 0.4, color: m.fg,
  };
}

/* Palette taken from the Premier League brand set that Fantasy Premier League
   runs on: #38003C purple, #00FF85 green, #04F5FF cyan, #E90052 pink,
   #963CFF violet, white. Purple carries the chrome, green is the highlight
   and only ever sits on a dark surface, pink is the negative signal. */
const PL = {
  purple: "#38003C", purpleDeep: "#22002A", purpleLift: "#4A0F50",
  violet: "#963CFF", green: "#00FF85", cyan: "#04F5FF", pink: "#E90052",
};

const THEMES = {
  default: {
    id: "default",
    bg: "#F2F0F5", card: "#FFFFFF", nav: PL.purple,
    navText: "#FFFFFF", navSub: "rgba(255,255,255,0.60)", navAccent: PL.green,
    border: "#E2DEE8", borderStrong: "#C6BED0",
    text: "#1B0021", textSub: "#5F5468", textFaint: "#9C93A6",
    accent: PL.purple, accent2: PL.violet,
    accentFaint: "#F6EEF9",
    neon: PL.green, neonInk: PL.purple, cyan: PL.cyan,
    gold: "#C9A227",
    green: "#00874A", red: PL.pink,
    pitch: `linear-gradient(160deg,${PL.purple} 0%,#2A0030 62%,${PL.purpleDeep} 100%)`,
    shirt: `linear-gradient(135deg,${PL.green},#00C468)`,
    shirtInk: PL.purple,
  },
  dark: {
    id: "dark",
    bg: "#170019", card: "#26002C", nav: PL.purpleDeep,
    navText: "#FFFFFF", navSub: "rgba(255,255,255,0.58)", navAccent: PL.green,
    border: "#3D1044", borderStrong: PL.green,
    text: "#F6F1F8", textSub: "#BCAEC4", textFaint: "#877A90",
    accent: PL.green, accent2: PL.cyan,
    accentFaint: "rgba(0,255,133,0.09)",
    neon: PL.green, neonInk: PL.purpleDeep, cyan: PL.cyan,
    gold: "#FFC861",
    green: PL.green, red: "#FF3D77",
    pitch: `linear-gradient(160deg,${PL.purpleLift} 0%,${PL.purple} 55%,${PL.purpleDeep} 100%)`,
    shirt: `linear-gradient(135deg,${PL.green},#00C468)`,
    shirtInk: PL.purpleDeep,
  },
};

/* ── TRANSLATIONS ───────────────────────────────────────────────────────── */
const LANG = {
  nl: {
    tabs: { team: "Team", players: "Spelers", league: "Competitie", model: "Model" },
    appTitle: "FPL 2026/27", gw: "Speelweek",
    squadTitle: "De selectie", squadSub: "Vijftien spelers, exact 100.0 besteed. Tik op een speler voor de onderbouwing.",
    watchTitle: "In de gaten houden", watchSub: "De vijftien namen die het net niet haalden, met de reden waarom ze tweede keus zijn.",
    colPlayer: "Speler", colClub: "Club", colPos: "Pos", colVal: "Waarde", colXg: "xG", colXa: "xA", colEp: "P/W", colPp: "PPT",
    xiLbl: "Basis", benchLbl: "Bank", captain: "Aanvoerder", vice: "Reserve-aanvoerder",
    whyPicked: "Waarom deze speler", whyWatch: "Waarom tweede keus",
    ppgLbl: "Punten per duel", ppgSub: "vorig seizoen",
    ppTitle: "PPT staat los van de selectie", ppSub: "Alleen ter informatie", startsLbl: "Basisplaatsen", ownLbl: "Eigendom", epLbl: "vPnt volgens FPL",
    noData: "Geen Premier League data beschikbaar",
    totalRow: "Totaal", squadValue: "Ploegwaarde", bankLbl: "In kas", xiPoints: "P/W basiself",
    poolTitle: "Alle spelers", poolSub: "De volledige pool waaruit gekozen is, met dezelfde cijfers. Filter op club.",
    allClubs: "Alle clubs", inSquad: "In selectie", onWatch: "Op de lijst",
    sortBy: "Sorteer", sortEp: "P/W", sortPp: "PPT", sortVal: "Waarde", sortXg: "xG", sortXa: "xA",
    matchesTitle: "Wedstrijden", matchesSub: "Aftraptijden en uitslagen. Geen voorspellingen.",
    notPlayed: "nog niet gespeeld", standingBefore: "Stand", result: "Uitslag",
    standings: "Stand", standingsSub: "Seizoen nog niet begonnen",
    modelTitle: "Hoe deze vijftien tot stand kwamen", modelSub: "De volledige route van data naar selectie",
    pillarsTitle: "Drie bronnen", pillarsSub: "Alle drie publiek en controleerbaar",
    formulaTitle: "De weging", formulaSub: "Hoe de drie bronnen tot een cijfer werden samengevoegd",
    optTitle: "Van cijfer naar vijftien namen", optSub: "Wat de optimalisatie precies doet",
    honestTitle: "Wat hier niet klopt", honestSub: "De zwakke plekken, expliciet benoemd",
  },
  en: {
    tabs: { team: "Team", players: "Players", league: "League", model: "Model" },
    appTitle: "FPL 2026/27", gw: "Gameweek",
    squadTitle: "The squad", squadSub: "Fifteen players, exactly 100.0 spent. Tap a player for the reasoning.",
    watchTitle: "Worth watching", watchSub: "The fifteen names that just missed out, with why they are second choice.",
    colPlayer: "Player", colClub: "Club", colPos: "Pos", colVal: "Value", colXg: "xG", colXa: "xA", colEp: "P/M", colPp: "PPT",
    xiLbl: "Starting", benchLbl: "Bench", captain: "Captain", vice: "Vice-captain",
    whyPicked: "Why this player", whyWatch: "Why second choice",
    ppgLbl: "Points per match", ppgSub: "last season",
    ppTitle: "PPT plays no part in the selection", ppSub: "Shown for information only", startsLbl: "Starts", ownLbl: "Ownership", epLbl: "xPts per the FPL API",
    noData: "No Premier League data available",
    totalRow: "Total", squadValue: "Squad value", bankLbl: "Bank", xiPoints: "Starting XI P/M",
    poolTitle: "All players", poolSub: "The full pool the squad was chosen from, same figures. Filter by club.",
    allClubs: "All clubs", inSquad: "In squad", onWatch: "On the list",
    sortBy: "Sort", sortEp: "P/M", sortPp: "PPT", sortVal: "Value", sortXg: "xG", sortXa: "xA",
    matchesTitle: "Matches", matchesSub: "Kick off times and results. No predictions.",
    notPlayed: "not played yet", standingBefore: "Table", result: "Result",
    standings: "Table", standingsSub: "Season has not started",
    modelTitle: "How these fifteen were arrived at", modelSub: "The full route from data to squad",
    pillarsTitle: "Three sources", pillarsSub: "All three public and checkable",
    formulaTitle: "The weighting", formulaSub: "How the three sources were combined into one number",
    optTitle: "From a number to fifteen names", optSub: "What the optimisation actually does",
    honestTitle: "What is wrong with this", honestSub: "The weak points, stated plainly",
  },
};

/* ── CLUBS ──────────────────────────────────────────────────────────────── */
/* Badge ids follow the official Premier League badge path. The Crest falls
   back to a coloured monogram when an image does not resolve. */
const CLUBS = {
  ARS: { name: "Arsenal", badge: 3, c1: "#EF0107", c2: "#FFFFFF" },
  AVL: { name: "Aston Villa", badge: 7, c1: "#670E36", c2: "#95BFE5" },
  BOU: { name: "Bournemouth", badge: 91, c1: "#DA291C", c2: "#000000" },
  BRE: { name: "Brentford", badge: 94, c1: "#E30613", c2: "#FFFFFF" },
  BHA: { name: "Brighton", badge: 36, c1: "#0057B8", c2: "#FFCD00" },
  CHE: { name: "Chelsea", badge: 8, c1: "#034694", c2: "#FFFFFF" },
  COV: { name: "Coventry City", badge: 9, c1: "#1D1D3C", c2: "#78D0F3" },
  CRY: { name: "Crystal Palace", badge: 31, c1: "#1B458F", c2: "#C4122E" },
  EVE: { name: "Everton", badge: 11, c1: "#003399", c2: "#FFFFFF" },
  FUL: { name: "Fulham", badge: 54, c1: "#000000", c2: "#FFFFFF" },
  HUL: { name: "Hull City", badge: 88, c1: "#F5A12D", c2: "#000000" },
  IPS: { name: "Ipswich Town", badge: 40, c1: "#3A64A3", c2: "#FFFFFF" },
  LEE: { name: "Leeds", badge: 2, c1: "#1D428A", c2: "#FFCD00" },
  LIV: { name: "Liverpool", badge: 14, c1: "#C8102E", c2: "#00B2A9" },
  MCI: { name: "Man City", badge: 43, c1: "#6CABDD", c2: "#1C2C5B" },
  MUN: { name: "Man Utd", badge: 1, c1: "#DA291C", c2: "#FBE122" },
  NEW: { name: "Newcastle", badge: 4, c1: "#241F20", c2: "#FFFFFF" },
  NFO: { name: "Nott'm Forest", badge: 17, c1: "#DD0000", c2: "#FFFFFF" },
  SUN: { name: "Sunderland", badge: 56, c1: "#EB172B", c2: "#211E1E" },
  TOT: { name: "Spurs", badge: 6, c1: "#132257", c2: "#FFFFFF" },
};
/* Crest resolution, tried in order and falling through on any load error.
   Drop your own files at /crests/ARS.svg, /crests/LIV.svg and so on, keyed by
   the three letter code, and they take priority automatically. No code change
   needed, and nothing is bundled into this file. If a file is absent the
   official Premier League CDN answers, and if that fails too you get a
   coloured monogram. Badge id is teams[].code from the FPL API. */
/* Inline 128px renders of the crest files, background cleared, so the app
   shows real badges even when nothing is serving /crests/. The files on
   disk still take priority wherever they resolve. */
const CREST_PNG = {
  ARS: "data:image/png;base64,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",
  AVL: "data:image/png;base64,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",
  BHA: "data:image/png;base64,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",
  BRE: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAA/1BMVEVbMh6olCDqzy1pVRzppqGGbR1yS0aRXlrLsyfghX6LNCny29nXYFc7NAuom5rvwb2IhXIAAAAAAAD+/v7MNCgZGRiHh4fo5+dGRUVoZmaop6ezMykoJiaWlpZ4eHfHx8c3NzeLJBvY2Ni3t7dXV1dUFxIAAACrLCKSLCQAAAAAAAAAAABtHBVxKSOwhYIAAAAuJBCwYVx4IxkAAACvdG/deG/xyMUpGxNqVxUrCwhRRhDQQjdSMS+HeHbuvLh2VlQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKkMQpAAAAQHRSTlP//////////////////////wD+/////////////////////////0v//8+tL////23///+Q////////////////U1wlTQAADGZJREFUeNrtm2ubojgWgEFLrb7OdkISCCSBgIJlOeVoTWu56/j//9WeBPB+t7p2P3SefuxICefNybnkAHF+/I+b8xvgN8BvgP9PgJen3jvLGRy75EGAJwStP3kviEFvYi6IJhcC9BCK0yAuIV4Gd4/cXMinGgeoP7gIAJEAQ/OS7hu6h2LwMunD6cSnCtuWEnQZgG9/7pnWkX5ELMXTpHcxRu9lYseNYsk1XrfgeoA/ocPS7lupC8vx0jtGMui9gOS+/WHkb8u+BwDjEHp5W/pxqY2Kpf9Ut36/vzoMkkW6J/odALxX2y2S8XN36sdxFFUCozj2/SwLqEjVEcFGjVqlIkYGFvXvAbDdv+pumHcZPiE05UIGmb+pONN6JwFergDwvF0AGKkVGu8KvRgAYsa1AKBdEJqBiaATjZCLAIz7XAIAQsEYIFKQk0Ij3wY0qhlWKU7jswDWmo8CgNRnI5WclJoJkVmpoBwujO0jxDG2143PAJTetAVgJhWkTt9OyYxiP5CUQ6hDkeZRhhWppUqMYWao6cIBfRpgMnmBMAMADHwGhnpKKkFxFkjBU81kAGMVfpZigggzMiROUSU1xljWABDi/ZMAEELrSHZEKAF/N70UxsiwBAUTn0lzZWOAmsAfpNGIlWSlQpfWALHtHwfoHRNsg4yCYUYRq64Bsphv9At/lSgrASiJ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",
  CHE: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAA/1BMVEXhopnUs1uan6jZ1NqSjF7n0JTwTlVed7EqYKLuLDNYcHJ5gm52lMI8YHicq8vfnRTBliBbg7bzfYPvPUTEs8UAAAAERpP+/f1MZmsxWnj36stvh7jaoBEyZaROeK4ZUpHU1tfu2qhydVAkVonNmxnn6e2pts/aoRGFfUWlijHaoRGUp8jZxo/XoxHaoBBrenDboBHQ2OaZhTmHlsSupHbaoBHz4riWlXO1ky/zdXrZnRHboRDpyHW5xdTzaG14lbkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABtnRT4AAAAQHRSTlP///////////////////8k//////8A////////8//////////////P//8v//8UcP+L/////6j/////F0P/////nCu+YwAAB5FJREFUeNrtmml7ojoUgMPi2m3amXvCDhHFDcXd2lb9///qngQQusy0Dtj5Qvo8dUE5b86eRPLfPx6kAqgAKoAKoAKoACqACqACqAAqgAqgAqgAinx5Mho9P49Gk38BcDdd9y3L6v740cWH/no6+k6A57XVHXY0HZKha51h11o/fw/A08zqdrhsX8N/qnqi6HSt2eTiACh+yAWDxDY1HXSjxl9oYRjxh+H5CGcCTK0FTl51AZjBOXRFADBFEi9BX1izCwKM+o8auLCiW4CQqiQCnQoAw2irN6iVrQv6Y//uUgBTqwOwZZquMNQCZSsNAUIOsKUGmkCjxgbROtb0IgCTdZe7nkqJxqgKEZXB5xqINNA0lWsipFeRxO3QXU/KB3jqD2NvZ9QIKUPrG4zpOjPQDSW2ogTalEpJZA77T2UDTPoLuCE1latbwrlGIK2u0kTgSizUhVdIcUTqi/6kXIBJXwV9I6no6u7G0LVaO84/ncGgk2QkTdnEQPoKzaF+leBrAHc4f1gxfvcIg4AnH20hvaD+KTUM9iItNJ4MNnjBXRl0hde/qoOvAay5/UPDB4gYz4D+QGL01WDSwActclX0CSpSwnBdHsC0C7H/oxp43KsvBn03jJcBwBXbbiiLPaM7LQtgZAnjuoyyEONdkz4QLxAkUR2EBbi1rFFJAP1Ockd09jZO/43cXva0hkogsQVwdPrlAEwfITceNyjy+np/Ejo3xxnB5hExs89OywB4srS8fFT/3MEn94lIZWzD/TwzQ572xnoqAWC2eCOfLqF5bECsAxQvRlP5iGA4Kw4wsfTshuqGCoDj3oRY8b0lvu04LripFjaD7PP65yr4FGA2zO6n1eJZg286iQboUswfwE5VQF+0c1TwKUDeA6TE7U1sCmQPnwW31664YtuBdyKQcshWUYDnbs4AafzP/Vg+DZykGnlevU7SgDRyRug+FwRYYw6wTSHHf8kirxnEz8yEwO9hOKAj3MYq8Pl7jokOOpgVBEAXlAk5ENT04JQAr69te5wYQyjgyD3AHOOreaoCF79EZHTDYgB3XbBJvUUO8skDOICJU3TH+/kyBjC9nof691AfcuoF8oG06sSG7qgQwHQI5q612+0IaCwHIOQ6jfgRzMT4qPPYNEwDsjvgF00YTgsBoAs49cPuAQEWWcKdJ5Y3G4mrja9FSjDB8eJPLBDgYXeoO9BZFwLoYxAqD4jg5CxA6a0dHG3uZidvD9Af7lF+L41EB8U/KBiI/UIAPA26MvnlgJ4vgoHt0dt8ibKVHneAVD590cH5RWQXPvVC8kkhylIKewOA8w2aifjA824xOd+eaiTL0tcn2fjPAKMsDXWMNwDUC8zEC318tbRtnK+dlqROBjC6EEBv2bj2k4uYf5YNcE0Tju8AukUAnn+c7jOgrwEUc9k4XTSxL0DhiuzIiRdk2fjH8wUAlqa5dHI+6KDYpWP25sckDMsC+I0J0i6EV0GcvigFmIaae8yG5ZrgYwDFzKJvD3YDIfZxico6s5KcMAlD7t/5MORV2DZ99+ilkSB8r9E8tac1HoZ2s3AYikTkkDrWoleJaGw6nqd43vy2kZRq3o00bJNmiai5qxOzaCLiqbh5IPWfhLxKxUFj3xNKv04jwVmOTewVe6emyNwhQMssmoqxGMmtB6LUd/liFCci2jNPkWA70LR5QqZpMZJbhJAWKVqMeDkmpE4Oh+YrJxAA46wWQTAPxpiQs0xM6kpdQcUVLMfYkDjY7e1+3uYbkgQgVoBz5BzuPr9Gw4bEOSB2Sy7akIiW7CdpPTj5lgwTAY+7wMQuMPB6stCEa2dBKFqyFv65RVsy0ZQ6Dq+ruaaUJq0XZkOhCrmBKDD2TgoQNeIeG4TiTWm+Lc9UMLaDXtyCgTMXqckRJfECbflHCxMBwMUuebcyT3Rx711kYfLR0gzHXlHmylLovZcs0E45oOSl2QeLU5GCHF6HcEnENRHwgEwL8evF6aQwwOvl+TBxg33aCHg8JsVT+ULLc1TB2w0K0ZgfHVx6CQMEaV/8Tn77cwX83RYNJ/DGnrIXfjcPPOyF4iy4ef3ZUrZosk2qm7YIxpf3m1NUiV/VhP23V+VuUv13F/uhv6lFIhb+vE0HJDS25W7TxRuVPqtdJd4w+AjBkMT0fW1rSBu31I3KeKvWV9EGNSJ2RH6zVcvVo4fu1liVvFUbb1bj2Gy3cpqU3m1WixHKES6kS9+sFtv1OGouk2/kKDsuzG3X44hW4BtiNxnUrx5ZfPXA4knoYFsLdUMNNR/eD19Wb4wbaJNz5v8XRzYaA3Z1xbbgvgGoRW2QQ8mNj2y+fGh01qHVjbByyNwr5keb0AUMeLTHSpjA0PytT/T40OrrJ3dnH9sBd7FQBpkZmmvoruGjRvjbKxbGznGpY7v04FII06G2Mlx5swVDByInR1UC77F/1kH62Ue3w8Tlt2TlhjIDY9XeslMLog/Pmn6Rw2vh+OgBUZSFxDccXnNnnFndgf4+DPXBtxzfx53q7KMfMMy+6QcMSXL+pz/hODlE/COWpyL3qH5HVAFUABVABVABVAAVQAVQAVQAFUAFUAH8c4D/AVDmiwrTlxCiAAAAAElFTkSuQmCC",
  COV: "data:image/png;base64,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",
  CRY: "data:image/png;base64,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",
  EVE: "data:image/png;base64,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",
  FUL: "data:image/png;base64,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",
  HUL: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAA/1BMVEXkzK2okG9wSRKKd1vh3trnpFrfiC6hZSm8vsC9qI9jWUhGPjDNtZbBeyAAAADwiQEQGSD9/f0vJxzVdAtONhhyRhXgdA6RVRHKahCzZQ4XHB6oWxKGTBUtNDjU1tfn5+caIylOVFnHycokKy+EiIyRlZlwdXm0trlESk9jPRilqas7QkhjaW4eIB41PEJcYmdBLhy9cAg9MBlWXWK+wcP16NZ9goWanqGdoaR4fYF1Z1HegATPtpXf4OGdYA1MRjoAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA1JAnjAAAAQHRSTlP//////////////////wD/////////////////////////////////////////////////////////////////X3FOqAAAD4lJREFUeNrFW4l22sgSxWuSmXnQq3qRkAAhdjDe7cRO/v+vXlVLAgmEJRsn0ckhYEB1u9Zb1U2r/Zev1se/+hrm1+vrHwNwPpgNR7eTbkz2rng1uRols8HvAhDOHvpd0uTqza+G4/AzAYSz0XxPymSy84d49wPPs+gTAERPi9Kd+8NU8JxGJXFjSukYNTTpFz7fXdSCeBPA4GFVEJIM4NWMDt2LFaVFAI80uotoCM8GdEHi8fBqY67Vw+BjAAajrcmH4W16a5LQx3RtZQAhvSUxpfCNiE5IH9QBiDbo49HgvQDCYS69Px7iuhOUDQ/PdJzeswyAUvCSwWsXn3VJ92GAELpkPM5v0x2G7wAw7qeGXYDsBSp2hGIXdEDIFT7ge5T2Ci5AaWb5TDPPdDBZIPA+ekUvW0pDALPu9rZdXGpMJuhyc7z3JHe+jciyQfrOEVKVgenoiHQjNF36saQJgHB73wF8H8y7SKGAzNVWlPtLfm1jYkTvUp9YpK+GcJNZwVcaABgX/B41n+ANQnqFeK62ghHNNjhpuPnKrADvliZDGhZsNW4AICnel/biBFfnou8JH9DL8YpoITk5z4jncR6mk0xPcxqWNEWSBgAWJeeO0J1X4FR3mSsOMoue0/72c84/H3Dx6dujzFXBgVBr22vUAEAxxWJ++xqBJ/RxSX16jn9K+lfPMRjl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",
  IPS: "data:image/png;base64,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",
  LEE: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAMAAAD04JH5AAAA/1BMVEURZ6tPjsCgr0+6w3K3x57u4GnJ2dIAYJ8FX6ZgjnOArtLgzyy80tLAvz0AAAD+3hoFYKb9/v7r1SQzd4zQxzSSqFbV5PAZapuutkdViHlwlmr/7oz/8ZiRudgFYKcFYaYEYKd3qM/G2urj7PEBY6oFYKaty+K50+YEYKcFYKdYlcRHgYEEXqctebUAXKMFXqYhbpZFib3/5UgEX6djnMidwdz/4jAFX6c6grq+vT5BfoShw97/98qAnmGCoGAFX6cAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8CdEYAAAAQHRSTlPj////////EJL//////wD//v/////////////////OLbP///8SUv//b4v//1D/EC/////t////Zv////////+vrcmfRwAABxxJREFUeNrtmtl6ozgQRp1O0ullBiR2nGCbxWDjfWxn7e68/1uNJEAUS2MMOLmhLhI+s9ShVPpLEhoIn2yDHqAH6AF6gB6gB+gBeoCW93vrTwPwpvPJHhHbT+bT9UcDbOYDlLHRfPxxAN5sFHndLobEFts2DOcDLCPvuqlKYmySMYwgRtNLA3hPzL0+VMScKUOdIczuLgiwnrP3NA2x1AyTnZ57FwJYz9jL/5HEv5qk0jDs5+tLADxR97Ja4T4Kg0wRZp0DTGnby4ZYwxjCaNkpgDehwVfFmsYa4t3rDmBJo/9bEmubNKR3zDoCWNPovyplfhRDVQ2ljExZ0HbwugBYlkdfUs1tosNbsyQ3DdoO0/YAtO+Z+cf/VOXY924XHxT7h0RlYd4WgGafWi441H1oWWGCgBb5TqKSHyetAGjzb5Vc6HnkbUdzfN/RNBv9JQwKCdTEawFA3l+WilIXmWVZDnY1rB0ti/+oZzuLRAjemwPM8v6Be7TTfA3jIMCYHOzS37MJSwlmjQEmSJdyAU3t6GBib0f6V/PhGRk2mqRXp0ElAMl/8KghdEKyj3m+udHo/8AK4dkhuI1kbFOAMewAkpwdg9m2b73dUOc3lhX4dvYsaDnSFcYNAUgK8GAqetYDogGwrvHtLb6mrWDlTuv8zheEnhoCkOFH8iLSNucAOTT0LpZu8VfaFFr+/JbfWq1Gg+ocLG1/ZsEb8fvVJUYBjk7hAp4H1VlYBTBCcvIQufB8yyYh+HqN3et/SABsv3ABuHfUEAB0gsLj0UojAFea62ohbYHn4hX1ukE1wDBtx4KRCLA8wK6DNbvkAiltvmYAHkJ/KgBQ6NuYWeAcUDXAuhEAkAGlzMHKclw3CDTNsVZl55VUCDZtAX6WOdgNSD30Axr+XVUEGgNsEDKqmuCUSbWksF4EPh1AlBqY2GEOtLLGEdh8NsAaCJGiRKN/epAcP/7H7TF/jt8Q6cBdWyX8Elf4eFAQVft7zO1BzJ2kx0ZbJQS1wIir6yus9TFAcLXSHmDNTggMXgv2ravhv5FPMzPWiADcFb5yHzKjlkV0rLSuhu98PKAoYFCQvBkDCA6h7eOHrGSb6T2txgNgRJT3byQAGhubPcQ/kbYqDEqJiH3rYEwYzbOSeZoqJwDH5yQJZRUQgP6rNB8TTuGD4if/jo45wPORA0SxiTm/QPBlQwAPxPIFxFZBCYDmrHAKEBHkMuXEcODUxETOjsrN5JgBaIcArd7I3DSIAWBfQWknaDwxoXNTCaY36+GMhQEEzztLCwcrP4lATLCAABJqMTUjWfjC+1JGDOWiEsoZGeQ92GgzOd2ko0IznmokevsXgJQgEdHf1TOzE+sDe/TKc7kghgTAt1Ya1p4ZQFYGef95rU6B0wsUUtKUzP93kGAsAkjDoR0pYUYGdaleCpwAAEpQFGMKYIVEC+NqmJFBpZ4KnALw4pCWiCEDcEkADnYCUCKDtEes26ySTWA5yD2fAIQHwuBygBxhnRY4BQDVOB/he+wQ5/Yh7gVlBZMSTdutE6ZiKMEcWzCAw4FkQOBEAK9QBiUug3uvHcA81VQT9LJIBw7PP+xdeBXrAOinZlpBvrVcKd2kT1OAzsRCFJDp8ZuWCFEqg4B503ateAAfx12UK2Fy2kxbbdR6sXqa1mQlrTUJgG9RcxIpjhqIL+4OT4lAreX6EViq4o0cA9ihv7JJO/BaYPLLagag3veCYWFkKCe1gGoxLEa5Szv4XsBCoOTF8EuSAw7CcRIWZFCpE4A6AFOwWAW9UCkOV2hlxUqo5kTIrJEB9T5awRDIaZxpN8Qri0/Notbhi7T1AlALYAMW/SSdx+OeTQvSuSEj0CHquCMAKodqOjxe8GKk4Z0FAUjUYRWYC10BrIG4iYbEAd5CC2cAJANkIPI6A6B5KGc/THIltMMfkQ5kP63JtTKw/rfj93R4ysQwUUKNJmE8LH/NSsBE6BLAQ1kxkJMRkQ1qQSoBdB617hSArliB70ffY4AQgWJkwu9EqO5mjtr7B75l0kCNAOIAMAA1kwBzoWsAOjw0M6tf9zhATrYXxPGpnQBnAXij3LLdPfZpJXLzAGQuNLq7AABNAzDtj5rgiB0/B0BLwhkbis7ZRTOGpUYUH39h55lJ0a9HMTN2XwqXAaB6lCNglvd/1m6m8zYyLfcZAvGW+r8Xs/6fhMsB5GNAggBfn/mfCZcEYBsq1Ipl6XP9n7+ZbZob+AH708B/k910KK9IYOa0FC4PwHqjXNg1w2ZEG+EjAIQx0UT9JbdviNSf0cdsaBTinV1qYb+MJ3wUAOkMRBAW0nk7hjoFYImgG2ftmeoWgBVHtsWKbVwbjYWPBoh2OOoGe/1Z86e02Vk9jnf3Nn99oe3WbrbNc97qES33lm9Go43wmQDtrQfoAXqAHqAH6AF6gB7g0wH+B2GM4ApN+bF9AAAAAElFTkSuQmCC",
  LIV: "data:image/png;base64,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",
  MCI: "data:image/png;base64,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",
  MUN: "data:image/png;base64,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",
  NEW: "data:image/png;base64,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",
  NFO: "data:image/png;base64,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",
  SUN: "data:image/png;base64,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",
  TOT: "data:image/png;base64,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",
};

const CREST_DIR = "/crests-v11";
const BADGE_PATHS = [
  /* the vector file wins wherever it is actually served */
  (code, key) => `${CREST_DIR}/${key}.svg`,
  (code, key) => `${CREST_DIR}/${key}.png`,
  /* then the inline render, which needs no host at all */
  (code, key) => CREST_PNG[key] || null,
  /* then the CDN, larger size first since 70px is soft on a dense screen */
  (code) => `https://resources.premierleague.com/premierleague25/badges/100/t${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague/badges/100/t${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague25/badges/70/t${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague/badges/70/t${code}.png`,
];

const CLUB_KEYS = Object.keys(CLUBS);


const SQUAD = [
  { n: "Raya", c: "ARS", pos: "GK", price: 6.0, own: 30.9, xg: 0.0, xa: 0.0, ppg: 4.4, ep: 4.0, code: "154561", pp: 4.2, starts: 37,
    nl: "Meest gekozen keeper (30.9%) en 4.4 punten per duel vorig seizoen. Arsenal opent thuis tegen promovendus Coventry. Drie van de zes expertdrafts hebben hem, en de FPL-API zet hem op 4.0 verwachte punten, het maximum dat de API afgeeft.",
    en: "Most-owned keeper at 30.9% and 4.4 points per match last season. Arsenal open at home to promoted Coventry. Three of six expert drafts have him, and the FPL API rates him 4.0 expected points, the ceiling the API issues." },
  { n: "Dubravka", c: "TOT", pos: "GK", price: 4.0, own: 23.8, xg: 0.0, xa: 0.0, ppg: 2.7, ep: 1.0, code: "67089", pp: null, starts: 35,
    nl: "Reservekeeper op 4.0, puur een enabler: hij maakt Haaland en Bruno samen betaalbaar. 23.8% eigendom en drie expertvermeldingen laten zien dat het veld dezelfde rekensom maakt.",
    en: "Backup keeper at 4.0, purely an enabler: he is what makes Haaland and Bruno affordable together. 23.8% ownership and three expert mentions show the field is doing the same arithmetic." },
  { n: "Shaw", c: "MUN", pos: "DEF", price: 4.5, own: 24.7, xg: 0.02, xa: 0.06, ppg: 3.0, ep: 1.7, code: "106760", pp: null, starts: 38,
    nl: "Vier expertvermeldingen, de meeste van alle verdedigers, en 24.7% eigendom. United opent tegen Hull en Ipswich. Op 4.5 met 3.0 punten per duel is dit de goedkoopste ingang in die defensie.",
    en: "Four expert mentions, the most of any defender, and 24.7% ownership. United open against Hull and Ipswich. At 4.5 with 3.0 points per match this is the cheapest way into that defence." },
  { n: "Pedro Porro", c: "TOT", pos: "DEF", price: 5.5, own: 23.8, xg: 0.03, xa: 0.14, ppg: 3.4, ep: 2.5, code: "441164", pp: null, starts: 32,
    nl: "Hoogste xA per 90 van alle verdedigers in de selectie (0.14) en 3.4 punten per duel. Aanvallende wingback, 23.8% eigendom, twee expertvermeldingen.",
    en: "Highest expected assists per 90 of any defender in the squad at 0.14, and 3.4 points per match. Attacking wing-back, 23.8% ownership, two expert mentions." },
  { n: "N.Williams", c: "NFO", pos: "DEF", price: 5.0, own: 12.9, xg: 0.06, xa: 0.11, ppg: 3.5, ep: 2.2, code: "215136", pp: null, starts: 36,
    nl: "3.5 punten per duel en 0.11 xA per 90 op 5.0. Forest speelt geen Europees voetbal dit seizoen, wat de speeltijd helpt. Twee expertvermeldingen bij slechts 12.9% eigendom.",
    en: "3.5 points per match and 0.11 expected assists per 90 at 5.0. Forest are not in Europe this season, which helps the minutes. Two expert mentions at only 12.9% ownership." },
  { n: "Konsa", c: "AVL", pos: "DEF", price: 4.5, own: 16.9, xg: 0.04, xa: 0.02, ppg: 2.9, ep: 1.7, code: "199798", pp: null, starts: 34,
    nl: "Enabler op 4.5 met echte speeltijd en 2.9 punten per duel. 16.9% eigendom. Staat op de bank en hoeft alleen te spelen bij uitval.",
    en: "Enabler at 4.5 with real minutes and 2.9 points per match. 16.9% ownership. Sits on the bench and only plays if someone drops out." },
  { n: "Mitchell", c: "CRY", pos: "DEF", price: 4.5, own: 6.9, xg: 0.04, xa: 0.07, ppg: 3.6, ep: 1.7, code: "244723", pp: null, starts: 36,
    nl: "3.6 punten per duel, het hoogste van elke verdediger op 4.5 in het spel, bij slechts 6.9% eigendom. Puur een cijfermatige keuze die het veld nog niet heeft opgepikt.",
    en: "3.6 points per match, the highest of any 4.5 defender in the game, at only 6.9% ownership. Purely a numbers pick the field has not caught up with." },
  { n: "B.Fernandes", c: "MUN", pos: "MID", price: 12.0, own: 48.7, xg: 0.32, xa: 0.36, ppg: 6.7, ep: 4.0, code: "141746", pp: null, starts: 35,
    nl: "6.7 punten per duel, tweede in het hele spel, en de hoogste gecombineerde xG plus xA per 90 (0.32 en 0.36). Zes van de zes expertdrafts, 48.7% eigendom, en 4.0 verwachte punten van de FPL-API.",
    en: "6.7 points per match, second in the entire game, and the highest combined expected goals and assists per 90 at 0.32 and 0.36. Six of six expert drafts, 48.7% ownership, and 4.0 expected points from the FPL API." },
  { n: "Szoboszlai", c: "LIV", pos: "MID", price: 7.0, own: 47.0, xg: 0.13, xa: 0.19, ppg: 4.4, ep: 2.5, code: "424876", pp: 5.8, starts: 36,
    nl: "De waardeconsensus van deze zomer: 7.0, zes van de zes expertdrafts en 47.0% eigendom. 4.4 punten per duel. Met Salah weg loopt er meer via hem en hij wordt genoemd voor de strafschoppen.",
    en: "The value consensus of this summer: 7.0, six of six expert drafts and 47.0% ownership. 4.4 points per match. With Salah gone more runs through him and he is being tipped for penalties." },
  { n: "Rogers", c: "CHE", pos: "MID", price: 7.5, own: 29.8, xg: 0.19, xa: 0.12, ppg: 4.6, ep: 2.6, code: "244850", pp: 5.9, starts: 37,
    nl: "4.6 punten per duel en 0.19 xG per 90, bij 29.8% eigendom en drie expertvermeldingen. De goedkoopste tweede ingang in de Chelsea-aanval naast João Pedro.",
    en: "4.6 points per match and 0.19 expected goals per 90, at 29.8% ownership and three expert mentions. The cheapest second route into the Chelsea attack alongside João Pedro." },
  { n: "Ndiaye", c: "EVE", pos: "MID", price: 6.0, own: 16.3, xg: 0.22, xa: 0.14, ppg: 4.0, ep: 2.1, code: "440993", pp: null, starts: 32,
    nl: "0.22 xG per 90 is het hoogste van elke middenvelder onder 6.5, met 4.0 punten per duel. Slechts 16.3% eigendom, dus dit is de plek waar rang gewonnen kan worden.",
    en: "0.22 expected goals per 90 is the highest of any midfielder under 6.5, with 4.0 points per match. Only 16.3% ownership, so this is where rank can be won." },
  { n: "Hughes", c: "CRY", pos: "MID", price: 4.5, own: 11.1, xg: 0.06, xa: 0.11, ppg: 1.5, ep: 1.0, code: "108413", pp: null, starts: 19,
    nl: "De zwakste plek in de selectie en bewust zo gelaten. Enabler op 4.5 met 1.5 punten per duel. Le Fée heeft meer expertsteun als je de 0.5 kunt vrijmaken.",
    en: "The weakest slot in the squad and knowingly left that way. Enabler at 4.5 with 1.5 points per match. Le Fée has more expert support if you can free up the 0.5." },
  { n: "Haaland", c: "MCI", pos: "FWD", price: 15.5, own: 74.8, xg: 0.78, xa: 0.08, ppg: 6.8, ep: 4.0, code: "223094", pp: 8.4, starts: 34,
    nl: "74.8% eigendom. Niet bezitten is een risico op rang, geen puntenkeuze. 6.8 punten per duel en 0.78 xG per 90, beide het hoogste in het spel. 4.0 verwachte punten van de FPL-API en zes van de zes expertdrafts. Aanvoerder, thuis tegen Bournemouth.",
    en: "74.8% ownership. Not owning him is a rank risk, not a points choice. 6.8 points per match and 0.78 expected goals per 90, both the highest in the game. 4.0 expected points from the FPL API and six of six expert drafts. Captain, at home to Bournemouth." },
  { n: "João Pedro", c: "CHE", pos: "FWD", price: 7.5, own: 54.2, xg: 0.5, xa: 0.07, ppg: 5.1, ep: 2.3, code: "475168", pp: 5.1, starts: 31,
    nl: "54.2% eigendom en zes expertvermeldingen. 5.1 punten per duel en 0.50 xG per 90 op 7.5 is de reden dat het veld hier massaal zit.",
    en: "54.2% ownership and six expert mentions. 5.1 points per match and 0.50 expected goals per 90 at 7.5 is why the field has piled in." },
  { n: "Calvert-Lewin", c: "LEE", pos: "FWD", price: 6.0, own: 23.1, xg: 0.51, xa: 0.04, ppg: 4.1, ep: 2.0, code: "177815", pp: 4.4, starts: 30,
    nl: "0.51 xG per 90 en 4.1 punten per duel op 6.0. Vier expertvermeldingen en 23.1% eigendom. Maakt de derde aanvallersplek betaalbaar zonder hem weg te gooien.",
    en: "0.51 expected goals per 90 and 4.1 points per match at 6.0. Four expert mentions and 23.1% ownership. Makes the third forward slot affordable without wasting it." },
];

const WATCH = [
  { n: "Gabriel", c: "ARS", pos: "DEF", price: 8.0, own: 26.2, xg: 0.1, xa: 0.06, ppg: 6.5, ep: 4.0, code: "226597", pp: 7.2, starts: 30,
    nl: "6.5 punten per duel, het hoogste van elke verdediger in het spel, en 26.2% eigendom. Hij staat hier omdat 8.0 precies 3.5 meer is dan Mitchell of 3.0 meer dan Williams. Koop hem als je zekerheid boven waarde stelt.",
    en: "6.5 points per match, the highest of any defender in the game, and 26.2% ownership. He is here because 8.0 is exactly 3.5 more than Mitchell or 3.0 more than Williams. Buy him if you value certainty over value." },
  { n: "Semenyo", c: "MCI", pos: "MID", price: 8.5, own: 22.6, xg: 0.31, xa: 0.09, ppg: 5.5, ep: 2.9, code: "437730", pp: 7.1, starts: 37,
    nl: "5.5 punten per duel en 0.31 xG per 90, bij 22.6% eigendom. De prijs is het enige bezwaar: op 8.5 verdringt hij Bruno of Haaland uit de begroting.",
    en: "5.5 points per match and 0.31 expected goals per 90, at 22.6% ownership. Price is the only objection: at 8.5 he crowds out Bruno or Haaland from the budget." },
  { n: "Mbeumo", c: "MUN", pos: "MID", price: 8.0, own: 18.3, xg: 0.41, xa: 0.17, ppg: 4.5, ep: 2.8, code: "446008", pp: 5.9, starts: 31,
    nl: "0.41 xG per 90 is aanvallerswaarde in een middenvelder en hij heeft drie expertvermeldingen. Het bezwaar is speeltijd: United heeft te veel aanvallende opties, en dat drukt 4.5 punten per duel.",
    en: "0.41 expected goals per 90 is forward-level output from a midfielder and he has three expert mentions. The objection is minutes: United have too many attacking options, which holds him to 4.5 points per match." },
  { n: "O'Reilly", c: "MCI", pos: "DEF", price: 6.5, own: 22.6, xg: 0.21, xa: 0.09, ppg: 4.7, ep: 3.1, code: "472769", pp: null, starts: 29,
    nl: "0.21 xG per 90 voor een verdediger is uitzonderlijk en 22.6% van het veld ziet dat ook. Op 6.5 is hij 2.0 duurder dan Mitchell voor een vergelijkbaar aantal punten per duel.",
    en: "0.21 expected goals per 90 from a defender is exceptional and 22.6% of the field can see it. At 6.5 he is 2.0 more than Mitchell for a comparable points per match." },
  { n: "Lammens", c: "MUN", pos: "GK", price: 5.0, own: 20.4, xg: 0.0, xa: 0.0, ppg: 3.4, ep: 2.6, code: "465247", pp: 4.5, starts: 32,
    nl: "Drie expertvermeldingen en 20.4% eigendom. Op 5.0 de duidelijke upgrade van Dubravka als je de 1.0 kunt vrijmaken.",
    en: "Three expert mentions and 20.4% ownership. At 5.0 the clear upgrade on Dubravka if you can free the 1.0." },
  { n: "Guéhi", c: "MCI", pos: "DEF", price: 6.0, own: 23.7, xg: 0.12, xa: 0.07, ppg: 5.1, ep: 2.8, code: "209036", pp: null, starts: 35,
    nl: "5.1 punten per duel en 23.7% eigendom. Een volstrekt redelijke ruil tegen Pedro Porro, alleen 0.5 duurder.",
    en: "5.1 points per match and 23.7% ownership. A perfectly reasonable swap for Pedro Porro, just 0.5 more expensive." },
  { n: "Gibbs-White", c: "NFO", pos: "MID", price: 8.0, own: 11.6, xg: 0.31, xa: 0.08, ppg: 5.1, ep: 2.8, code: "222531", pp: 6.3, starts: 35,
    nl: "0.31 xG per 90 en 5.1 punten per duel. Forest speelt geen Europees voetbal, wat de speeltijd helpt. Op 8.0 en 11.6% eigendom een echte differential.",
    en: "0.31 expected goals per 90 and 5.1 points per match. Forest are not in Europe, which helps the minutes. At 8.0 and 11.6% ownership a genuine differential." },
  { n: "Tarkowski", c: "EVE", pos: "DEF", price: 6.0, own: 9.9, xg: 0.07, xa: 0.06, ppg: 4.6, ep: 2.8, code: "17761", pp: null, starts: 37,
    nl: "4.6 punten per duel bij slechts 9.9% eigendom. Saai maar stabiel, en de experts noemen die lage eigendom expliciet verrassend.",
    en: "4.6 points per match at only 9.9% ownership. Boring but stable, and the experts explicitly call that low ownership surprising." },
  { n: "Thiago", c: "BRE", pos: "FWD", price: 8.0, own: 16.0, xg: 0.56, xa: 0.05, ppg: 4.8, ep: 2.5, code: "502500", pp: 6.4, starts: 37,
    nl: "0.56 xG per 90, het hoogste na Haaland, en 4.8 punten per duel. Op 8.0 het directe alternatief als je de dubbele premium niet wilt.",
    en: "0.56 expected goals per 90, the highest after Haaland, and 4.8 points per match. At 8.0 the direct alternative if you do not want the double premium." },
  { n: "Rice", c: "ARS", pos: "MID", price: 7.5, own: 22.4, xg: 0.09, xa: 0.21, ppg: 5.1, ep: 2.6, code: "204480", pp: 5.9, starts: 35,
    nl: "5.1 punten per duel en 0.21 xA per 90, bij 22.4% eigendom. Verscheen in geen enkele expertdraft die we hebben gezien, wat het verschil verklaart met zijn cijfers.",
    en: "5.1 points per match and 0.21 expected assists per 90, at 22.4% ownership. Appeared in none of the expert drafts we saw, which explains the gap with his numbers." },
  { n: "Virgil", c: "LIV", pos: "DEF", price: 6.5, own: 16.3, xg: 0.1, xa: 0.04, ppg: 4.6, ep: 3.1, code: "97032", pp: null, starts: 38,
    nl: "4.6 punten per duel en de veiligste verdediger op deze lijst qua speeltijd, alleen zonder de aanvallende dreiging van Porro of O'Reilly.",
    en: "4.6 points per match and the safest defender on this list for playing time, just without the attacking threat of Porro or O'Reilly." },
  { n: "Anderson", c: "MCI", pos: "MID", price: 6.5, own: 12.0, xg: 0.08, xa: 0.13, ppg: 4.7, ep: 2.3, code: "215379", pp: null, starts: 37,
    nl: "4.7 punten per duel op 6.5 bij 12.0% eigendom. De cijfers waarderen hem hoger dan het veld, wat hem de meest onderschatte naam op deze lijst maakt.",
    en: "4.7 points per match at 6.5 with 12.0% ownership. The numbers rate him above the field, which makes him the most underrated name on this list." },
  { n: "Watkins", c: "AVL", pos: "FWD", price: 8.0, own: 12.6, xg: 0.49, xa: 0.04, ppg: 4.5, ep: 2.5, code: "178301", pp: 5.9, starts: 33,
    nl: "0.49 xG per 90 en 4.5 punten per duel. Als Calvert-Lewin niet start is dit de eerste vervanger.",
    en: "0.49 expected goals per 90 and 4.5 points per match. If Calvert-Lewin does not start, this is the first replacement." },
  { n: "Pickford", c: "EVE", pos: "GK", price: 5.5, own: 9.0, xg: 0.0, xa: 0.01, ppg: 3.6, ep: 3.3, code: "111234", pp: 4.7, starts: 38,
    nl: "3.6 punten per duel op 5.5 en twee expertvermeldingen. Everton heeft een goede opening, maar 9.0% eigendom laat zien dat het veld niet overtuigd is.",
    en: "3.6 points per match at 5.5 and two expert mentions. Everton have a good opening run, but 9.0% ownership shows the field is not convinced." },
  { n: "Gyökeres", c: "ARS", pos: "FWD", price: 7.5, own: 13.1, xg: 0.5, xa: 0.08, ppg: 3.6, ep: 2.3, code: "224117", pp: 5.6, starts: 26,
    nl: "0.50 xG per 90 maar slechts 3.6 punten per duel, wat aangeeft dat het rendement nog niet in punten is omgezet. 13.1% eigendom.",
    en: "0.50 expected goals per 90 but only 3.6 points per match, which says the underlying output has not yet converted into points. 13.1% ownership." },
];
const XI_NAMES = ["Raya", "Shaw", "Pedro Porro", "N.Williams", "B.Fernandes", "Szoboszlai", "Rogers", "Ndiaye", "Haaland", "João Pedro", "Calvert-Lewin"];

/* ── DUMMY STANDINGS ────────────────────────────────────────────────────── */
/* The season starts on 21 August 2026 and no match has been played, so the
   table is empty. Showing invented positions here would be a fiction. */
const SEASON_START = "2026-08-21";
const STANDINGS = CLUB_KEYS.slice().sort((x, y) => CLUBS[x].name.localeCompare(CLUBS[y].name))
  .map((c) => ({ c, pl: 0, w: 0, d: 0, l: 0, gd: 0, pts: 0 }));

/* ── FIXTURES AND RESULTS ───────────────────────────────────────────────────
   The League tab carries actual match information only: kick off times, real
   results, and the table. Nothing here is projected. Anything the model
   thinks about a fixture stays out of it. */
/* ── REAL FIXTURES, 2026/27 ─────────────────────────────────────────────────
   All 380 matches as published by the Premier League on 19 June 2026, checked
   for completeness: 38 gameweeks, 10 matches each, 38 per club, 19 at home.
   Format is [gameweek, home, away, date, kickoff]. Kick offs default to 15:00
   at weekends and 20:00 midweek where no time was given, and the league notes
   that all fixtures remain subject to change. */
const FIXTURES = [
  [1,"ARS","COV","2026-08-21","20:00"],
  [1,"HUL","MUN","2026-08-22","12:30"],
  [1,"EVE","CRY","2026-08-22","15:00"],
  [1,"IPS","SUN","2026-08-22","15:00"],
  [1,"NFO","LEE","2026-08-22","15:00"],
  [1,"BRE","TOT","2026-08-22","17:30"],
  [1,"BHA","AVL","2026-08-23","14:00"],
  [1,"MCI","BOU","2026-08-23","14:00"],
  [1,"NEW","LIV","2026-08-23","16:30"],
  [1,"FUL","CHE","2026-08-24","20:00"],
  [2,"CRY","MCI","2026-08-28","20:00"],
  [2,"LIV","NFO","2026-08-29","12:30"],
  [2,"BOU","EVE","2026-08-29","15:00"],
  [2,"COV","HUL","2026-08-29","15:00"],
  [2,"TOT","NEW","2026-08-29","17:30"],
  [2,"CHE","BHA","2026-08-30","14:00"],
  [2,"LEE","BRE","2026-08-30","14:00"],
  [2,"SUN","FUL","2026-08-30","14:00"],
  [2,"MUN","IPS","2026-08-30","16:30"],
  [2,"AVL","ARS","2026-08-31","20:00"],
  [3,"IPS","LIV","2026-09-04","20:00"],
  [3,"NEW","BOU","2026-09-05","12:30"],
  [3,"BRE","SUN","2026-09-05","15:00"],
  [3,"BHA","LEE","2026-09-05","15:00"],
  [3,"FUL","CRY","2026-09-05","15:00"],
  [3,"MCI","COV","2026-09-05","15:00"],
  [3,"NFO","TOT","2026-09-05","15:00"],
  [3,"HUL","AVL","2026-09-05","17:30"],
  [3,"EVE","MUN","2026-09-06","14:00"],
  [3,"ARS","CHE","2026-09-06","16:30"],
  [4,"BOU","BRE","2026-09-12","15:00"],
  [4,"AVL","NFO","2026-09-12","15:00"],
  [4,"CHE","HUL","2026-09-12","15:00"],
  [4,"CRY","IPS","2026-09-12","15:00"],
  [4,"LIV","FUL","2026-09-12","15:00"],
  [4,"TOT","EVE","2026-09-12","17:30"],
  [4,"SUN","ARS","2026-09-12","20:00"],
  [4,"COV","BHA","2026-09-13","14:00"],
  [4,"MUN","MCI","2026-09-13","16:30"],
  [4,"LEE","NEW","2026-09-14","20:00"],
  [5,"BRE","CHE","2026-09-18","20:00"],
  [5,"TOT","AVL","2026-09-19","12:30"],
  [5,"BHA","ARS","2026-09-19","15:00"],
  [5,"EVE","IPS","2026-09-19","15:00"],
  [5,"LEE","CRY","2026-09-19","15:00"],
  [5,"MCI","SUN","2026-09-19","15:00"],
  [5,"NEW","HUL","2026-09-19","15:00"],
  [5,"NFO","COV","2026-09-19","17:30"],
  [5,"BOU","LIV","2026-09-20","14:00"],
  [5,"FUL","MUN","2026-09-20","16:30"],
  [6,"ARS","LEE","2026-10-10","15:00"],
  [6,"AVL","BRE","2026-10-10","15:00"],
  [6,"CHE","BOU","2026-10-10","15:00"],
  [6,"COV","NEW","2026-10-10","15:00"],
  [6,"CRY","NFO","2026-10-10","15:00"],
  [6,"HUL","EVE","2026-10-10","15:00"],
  [6,"IPS","FUL","2026-10-10","15:00"],
  [6,"LIV","MCI","2026-10-10","15:00"],
  [6,"MUN","TOT","2026-10-10","15:00"],
  [6,"SUN","BHA","2026-10-10","15:00"],
  [7,"BOU","SUN","2026-10-17","15:00"],
  [7,"BRE","LIV","2026-10-17","15:00"],
  [7,"BHA","CRY","2026-10-17","15:00"],
  [7,"EVE","CHE","2026-10-17","15:00"],
  [7,"FUL","HUL","2026-10-17","15:00"],
  [7,"LEE","MUN","2026-10-17","15:00"],
  [7,"MCI","IPS","2026-10-17","15:00"],
  [7,"NEW","AVL","2026-10-17","15:00"],
  [7,"NFO","ARS","2026-10-17","15:00"],
  [7,"TOT","COV","2026-10-17","15:00"],
  [8,"ARS","EVE","2026-10-24","15:00"],
  [8,"AVL","MCI","2026-10-24","15:00"],
  [8,"CHE","TOT","2026-10-24","15:00"],
  [8,"COV","FUL","2026-10-24","15:00"],
  [8,"CRY","NEW","2026-10-24","15:00"],
  [8,"HUL","BRE","2026-10-24","15:00"],
  [8,"IPS","NFO","2026-10-24","15:00"],
  [8,"LIV","BHA","2026-10-24","15:00"],
  [8,"MUN","BOU","2026-10-24","15:00"],
  [8,"SUN","LEE","2026-10-24","15:00"],
  [9,"BOU","LEE","2026-10-31","15:00"],
  [9,"AVL","FUL","2026-10-31","15:00"],
  [9,"BRE","NFO","2026-10-31","15:00"],
  [9,"CHE","MUN","2026-10-31","15:00"],
  [9,"COV","SUN","2026-10-31","15:00"],
  [9,"HUL","IPS","2026-10-31","15:00"],
  [9,"LIV","ARS","2026-10-31","15:00"],
  [9,"MCI","BHA","2026-10-31","15:00"],
  [9,"NEW","EVE","2026-10-31","15:00"],
  [9,"TOT","CRY","2026-10-31","15:00"],
  [10,"ARS","HUL","2026-11-07","15:00"],
  [10,"BHA","BRE","2026-11-07","15:00"],
  [10,"CRY","LIV","2026-11-07","15:00"],
  [10,"EVE","COV","2026-11-07","15:00"],
  [10,"FUL","NEW","2026-11-07","15:00"],
  [10,"IPS","BOU","2026-11-07","15:00"],
  [10,"LEE","TOT","2026-11-07","15:00"],
  [10,"MUN","AVL","2026-11-07","15:00"],
  [10,"NFO","MCI","2026-11-07","15:00"],
  [10,"SUN","CHE","2026-11-07","15:00"],
  [11,"BOU","NFO","2026-11-21","15:00"],
  [11,"AVL","SUN","2026-11-21","15:00"],
  [11,"BRE","EVE","2026-11-21","15:00"],
  [11,"CHE","LEE","2026-11-21","15:00"],
  [11,"COV","CRY","2026-11-21","15:00"],
  [11,"HUL","BHA","2026-11-21","15:00"],
  [11,"LIV","MUN","2026-11-21","15:00"],
  [11,"MCI","FUL","2026-11-21","15:00"],
  [11,"NEW","ARS","2026-11-21","15:00"],
  [11,"TOT","IPS","2026-11-21","15:00"],
  [12,"ARS","MCI","2026-11-28","15:00"],
  [12,"BHA","NEW","2026-11-28","15:00"],
  [12,"CRY","HUL","2026-11-28","15:00"],
  [12,"EVE","LIV","2026-11-28","15:00"],
  [12,"FUL","BOU","2026-11-28","15:00"],
  [12,"IPS","AVL","2026-11-28","15:00"],
  [12,"LEE","COV","2026-11-28","15:00"],
  [12,"MUN","BRE","2026-11-28","15:00"],
  [12,"NFO","CHE","2026-11-28","15:00"],
  [12,"SUN","TOT","2026-11-28","15:00"],
  [13,"BOU","BHA","2026-12-02","20:00"],
  [13,"AVL","EVE","2026-12-02","20:00"],
  [13,"BRE","ARS","2026-12-02","20:00"],
  [13,"CHE","CRY","2026-12-02","20:00"],
  [13,"COV","IPS","2026-12-02","20:00"],
  [13,"HUL","NFO","2026-12-02","20:00"],
  [13,"LIV","SUN","2026-12-02","20:00"],
  [13,"MCI","LEE","2026-12-02","20:00"],
  [13,"NEW","MUN","2026-12-02","20:00"],
  [13,"TOT","FUL","2026-12-02","20:00"],
  [14,"BOU","HUL","2026-12-05","15:00"],
  [14,"AVL","CRY","2026-12-05","15:00"],
  [14,"BRE","MCI","2026-12-05","15:00"],
  [14,"CHE","LIV","2026-12-05","15:00"],
  [14,"EVE","FUL","2026-12-05","15:00"],
  [14,"LEE","IPS","2026-12-05","15:00"],
  [14,"MUN","COV","2026-12-05","15:00"],
  [14,"NEW","SUN","2026-12-05","15:00"],
  [14,"NFO","BHA","2026-12-05","15:00"],
  [14,"TOT","ARS","2026-12-05","15:00"],
  [15,"ARS","BOU","2026-12-12","15:00"],
  [15,"BHA","EVE","2026-12-12","15:00"],
  [15,"COV","AVL","2026-12-12","15:00"],
  [15,"CRY","MUN","2026-12-12","15:00"],
  [15,"FUL","BRE","2026-12-12","15:00"],
  [15,"HUL","TOT","2026-12-12","15:00"],
  [15,"IPS","NEW","2026-12-12","15:00"],
  [15,"LIV","LEE","2026-12-12","15:00"],
  [15,"MCI","CHE","2026-12-12","15:00"],
  [15,"SUN","NFO","2026-12-12","15:00"],
  [16,"BOU","COV","2026-12-19","15:00"],
  [16,"ARS","MUN","2026-12-19","15:00"],
  [16,"BRE","NEW","2026-12-19","15:00"],
  [16,"BHA","IPS","2026-12-19","15:00"],
  [16,"CHE","AVL","2026-12-19","15:00"],
  [16,"LEE","FUL","2026-12-19","15:00"],
  [16,"LIV","TOT","2026-12-19","15:00"],
  [16,"MCI","HUL","2026-12-19","15:00"],
  [16,"NFO","EVE","2026-12-19","15:00"],
  [16,"SUN","CRY","2026-12-19","15:00"],
  [17,"AVL","LEE","2026-12-26","15:00"],
  [17,"COV","CHE","2026-12-26","15:00"],
  [17,"CRY","ARS","2026-12-26","15:00"],
  [17,"EVE","SUN","2026-12-26","15:00"],
  [17,"FUL","BHA","2026-12-26","15:00"],
  [17,"HUL","LIV","2026-12-26","15:00"],
  [17,"IPS","BRE","2026-12-26","15:00"],
  [17,"MUN","NFO","2026-12-26","15:00"],
  [17,"NEW","MCI","2026-12-26","15:00"],
  [17,"TOT","BOU","2026-12-26","15:00"],
  [18,"AVL","LIV","2026-12-30","20:00"],
  [18,"COV","BRE","2026-12-30","20:00"],
  [18,"CRY","BOU","2026-12-30","20:00"],
  [18,"EVE","MCI","2026-12-30","20:00"],
  [18,"FUL","ARS","2026-12-30","20:00"],
  [18,"HUL","LEE","2026-12-30","20:00"],
  [18,"IPS","CHE","2026-12-30","20:00"],
  [18,"MUN","SUN","2026-12-30","20:00"],
  [18,"NEW","NFO","2026-12-30","20:00"],
  [18,"TOT","BHA","2026-12-30","20:00"],
  [19,"BOU","AVL","2027-01-02","15:00"],
  [19,"ARS","IPS","2027-01-02","15:00"],
  [19,"BRE","CRY","2027-01-02","15:00"],
  [19,"BHA","MUN","2027-01-02","15:00"],
  [19,"CHE","NEW","2027-01-02","15:00"],
  [19,"LEE","EVE","2027-01-02","15:00"],
  [19,"LIV","COV","2027-01-02","15:00"],
  [19,"MCI","TOT","2027-01-02","15:00"],
  [19,"NFO","FUL","2027-01-02","15:00"],
  [19,"SUN","HUL","2027-01-02","15:00"],
  [20,"ARS","BRE","2027-01-06","20:00"],
  [20,"BHA","BOU","2027-01-06","20:00"],
  [20,"CRY","CHE","2027-01-06","20:00"],
  [20,"EVE","AVL","2027-01-06","20:00"],
  [20,"FUL","TOT","2027-01-06","20:00"],
  [20,"IPS","COV","2027-01-06","20:00"],
  [20,"LEE","MCI","2027-01-06","20:00"],
  [20,"MUN","NEW","2027-01-06","20:00"],
  [20,"NFO","HUL","2027-01-06","20:00"],
  [20,"SUN","LIV","2027-01-06","20:00"],
  [21,"BOU","IPS","2027-01-16","15:00"],
  [21,"AVL","MUN","2027-01-16","15:00"],
  [21,"BRE","BHA","2027-01-16","15:00"],
  [21,"CHE","SUN","2027-01-16","15:00"],
  [21,"COV","EVE","2027-01-16","15:00"],
  [21,"HUL","ARS","2027-01-16","15:00"],
  [21,"LIV","CRY","2027-01-16","15:00"],
  [21,"MCI","NFO","2027-01-16","15:00"],
  [21,"NEW","FUL","2027-01-16","15:00"],
  [21,"TOT","LEE","2027-01-16","15:00"],
  [22,"ARS","NEW","2027-01-23","15:00"],
  [22,"BHA","MCI","2027-01-23","15:00"],
  [22,"CRY","TOT","2027-01-23","15:00"],
  [22,"EVE","BRE","2027-01-23","15:00"],
  [22,"FUL","AVL","2027-01-23","15:00"],
  [22,"IPS","HUL","2027-01-23","15:00"],
  [22,"LEE","CHE","2027-01-23","15:00"],
  [22,"MUN","LIV","2027-01-23","15:00"],
  [22,"NFO","BOU","2027-01-23","15:00"],
  [22,"SUN","COV","2027-01-23","15:00"],
  [23,"BOU","FUL","2027-01-30","15:00"],
  [23,"AVL","IPS","2027-01-30","15:00"],
  [23,"BRE","MUN","2027-01-30","15:00"],
  [23,"CHE","NFO","2027-01-30","15:00"],
  [23,"COV","LEE","2027-01-30","15:00"],
  [23,"HUL","CRY","2027-01-30","15:00"],
  [23,"LIV","EVE","2027-01-30","15:00"],
  [23,"MCI","ARS","2027-01-30","15:00"],
  [23,"NEW","BHA","2027-01-30","15:00"],
  [23,"TOT","SUN","2027-01-30","15:00"],
  [24,"ARS","LIV","2027-02-06","15:00"],
  [24,"BHA","HUL","2027-02-06","15:00"],
  [24,"CRY","COV","2027-02-06","15:00"],
  [24,"EVE","NEW","2027-02-06","15:00"],
  [24,"FUL","MCI","2027-02-06","15:00"],
  [24,"IPS","TOT","2027-02-06","15:00"],
  [24,"LEE","BOU","2027-02-06","15:00"],
  [24,"MUN","CHE","2027-02-06","15:00"],
  [24,"NFO","BRE","2027-02-06","15:00"],
  [24,"SUN","AVL","2027-02-06","15:00"],
  [25,"AVL","BOU","2027-02-10","20:00"],
  [25,"COV","LIV","2027-02-10","20:00"],
  [25,"CRY","BRE","2027-02-10","20:00"],
  [25,"EVE","LEE","2027-02-10","20:00"],
  [25,"FUL","NFO","2027-02-10","20:00"],
  [25,"HUL","SUN","2027-02-10","20:00"],
  [25,"IPS","ARS","2027-02-10","20:00"],
  [25,"MUN","BHA","2027-02-10","20:00"],
  [25,"NEW","CHE","2027-02-10","20:00"],
  [25,"TOT","MCI","2027-02-10","20:00"],
  [26,"BOU","CRY","2027-02-20","15:00"],
  [26,"ARS","FUL","2027-02-20","15:00"],
  [26,"BRE","COV","2027-02-20","15:00"],
  [26,"BHA","TOT","2027-02-20","15:00"],
  [26,"CHE","IPS","2027-02-20","15:00"],
  [26,"LEE","AVL","2027-02-20","15:00"],
  [26,"LIV","HUL","2027-02-20","15:00"],
  [26,"MCI","NEW","2027-02-20","15:00"],
  [26,"NFO","MUN","2027-02-20","15:00"],
  [26,"SUN","EVE","2027-02-20","15:00"],
  [27,"AVL","CHE","2027-02-27","15:00"],
  [27,"COV","BOU","2027-02-27","15:00"],
  [27,"CRY","SUN","2027-02-27","15:00"],
  [27,"EVE","NFO","2027-02-27","15:00"],
  [27,"FUL","LEE","2027-02-27","15:00"],
  [27,"HUL","MCI","2027-02-27","15:00"],
  [27,"IPS","BHA","2027-02-27","15:00"],
  [27,"MUN","ARS","2027-02-27","15:00"],
  [27,"NEW","BRE","2027-02-27","15:00"],
  [27,"TOT","LIV","2027-02-27","15:00"],
  [28,"BOU","TOT","2027-03-03","20:00"],
  [28,"ARS","CRY","2027-03-03","20:00"],
  [28,"BRE","IPS","2027-03-03","20:00"],
  [28,"BHA","FUL","2027-03-03","20:00"],
  [28,"CHE","COV","2027-03-03","20:00"],
  [28,"LEE","HUL","2027-03-03","20:00"],
  [28,"LIV","AVL","2027-03-03","20:00"],
  [28,"MCI","EVE","2027-03-03","20:00"],
  [28,"NFO","NEW","2027-03-03","20:00"],
  [28,"SUN","MUN","2027-03-03","20:00"],
  [29,"BOU","NEW","2027-03-13","15:00"],
  [29,"AVL","HUL","2027-03-13","15:00"],
  [29,"CHE","ARS","2027-03-13","15:00"],
  [29,"COV","MCI","2027-03-13","15:00"],
  [29,"CRY","FUL","2027-03-13","15:00"],
  [29,"LEE","BHA","2027-03-13","15:00"],
  [29,"LIV","IPS","2027-03-13","15:00"],
  [29,"MUN","EVE","2027-03-13","15:00"],
  [29,"SUN","BRE","2027-03-13","15:00"],
  [29,"TOT","NFO","2027-03-13","15:00"],
  [30,"ARS","SUN","2027-03-20","15:00"],
  [30,"BRE","BOU","2027-03-20","15:00"],
  [30,"BHA","COV","2027-03-20","15:00"],
  [30,"EVE","TOT","2027-03-20","15:00"],
  [30,"FUL","LIV","2027-03-20","15:00"],
  [30,"HUL","CHE","2027-03-20","15:00"],
  [30,"IPS","CRY","2027-03-20","15:00"],
  [30,"MCI","MUN","2027-03-20","15:00"],
  [30,"NEW","LEE","2027-03-20","15:00"],
  [30,"NFO","AVL","2027-03-20","15:00"],
  [31,"BOU","MCI","2027-04-10","15:00"],
  [31,"AVL","BHA","2027-04-10","15:00"],
  [31,"CHE","FUL","2027-04-10","15:00"],
  [31,"COV","ARS","2027-04-10","15:00"],
  [31,"CRY","EVE","2027-04-10","15:00"],
  [31,"LEE","NFO","2027-04-10","15:00"],
  [31,"LIV","NEW","2027-04-10","15:00"],
  [31,"MUN","HUL","2027-04-10","15:00"],
  [31,"SUN","IPS","2027-04-10","15:00"],
  [31,"TOT","BRE","2027-04-10","15:00"],
  [32,"ARS","AVL","2027-04-17","15:00"],
  [32,"BRE","LEE","2027-04-17","15:00"],
  [32,"BHA","CHE","2027-04-17","15:00"],
  [32,"EVE","BOU","2027-04-17","15:00"],
  [32,"FUL","SUN","2027-04-17","15:00"],
  [32,"HUL","COV","2027-04-17","15:00"],
  [32,"IPS","MUN","2027-04-17","15:00"],
  [32,"MCI","CRY","2027-04-17","15:00"],
  [32,"NEW","TOT","2027-04-17","15:00"],
  [32,"NFO","LIV","2027-04-17","15:00"],
  [33,"BOU","ARS","2027-04-24","15:00"],
  [33,"AVL","COV","2027-04-24","15:00"],
  [33,"BRE","FUL","2027-04-24","15:00"],
  [33,"CHE","MCI","2027-04-24","15:00"],
  [33,"EVE","BHA","2027-04-24","15:00"],
  [33,"LEE","LIV","2027-04-24","15:00"],
  [33,"MUN","CRY","2027-04-24","15:00"],
  [33,"NEW","IPS","2027-04-24","15:00"],
  [33,"NFO","SUN","2027-04-24","15:00"],
  [33,"TOT","HUL","2027-04-24","15:00"],
  [34,"ARS","TOT","2027-05-01","15:00"],
  [34,"BHA","NFO","2027-05-01","15:00"],
  [34,"COV","MUN","2027-05-01","15:00"],
  [34,"CRY","AVL","2027-05-01","15:00"],
  [34,"FUL","EVE","2027-05-01","15:00"],
  [34,"HUL","BOU","2027-05-01","15:00"],
  [34,"IPS","LEE","2027-05-01","15:00"],
  [34,"LIV","CHE","2027-05-01","15:00"],
  [34,"MCI","BRE","2027-05-01","15:00"],
  [34,"SUN","NEW","2027-05-01","15:00"],
  [35,"BOU","MUN","2027-05-08","15:00"],
  [35,"BRE","AVL","2027-05-08","15:00"],
  [35,"BHA","SUN","2027-05-08","15:00"],
  [35,"EVE","HUL","2027-05-08","15:00"],
  [35,"FUL","IPS","2027-05-08","15:00"],
  [35,"LEE","ARS","2027-05-08","15:00"],
  [35,"MCI","LIV","2027-05-08","15:00"],
  [35,"NEW","COV","2027-05-08","15:00"],
  [35,"NFO","CRY","2027-05-08","15:00"],
  [35,"TOT","CHE","2027-05-08","15:00"],
  [36,"ARS","NFO","2027-05-15","15:00"],
  [36,"AVL","NEW","2027-05-15","15:00"],
  [36,"CHE","EVE","2027-05-15","15:00"],
  [36,"COV","TOT","2027-05-15","15:00"],
  [36,"CRY","BHA","2027-05-15","15:00"],
  [36,"HUL","FUL","2027-05-15","15:00"],
  [36,"IPS","MCI","2027-05-15","15:00"],
  [36,"LIV","BRE","2027-05-15","15:00"],
  [36,"MUN","LEE","2027-05-15","15:00"],
  [36,"SUN","BOU","2027-05-15","15:00"],
  [37,"BOU","CHE","2027-05-23","15:00"],
  [37,"BRE","HUL","2027-05-23","15:00"],
  [37,"BHA","LIV","2027-05-23","15:00"],
  [37,"EVE","ARS","2027-05-23","15:00"],
  [37,"FUL","COV","2027-05-23","15:00"],
  [37,"LEE","SUN","2027-05-23","15:00"],
  [37,"MCI","AVL","2027-05-23","15:00"],
  [37,"NEW","CRY","2027-05-23","15:00"],
  [37,"NFO","IPS","2027-05-23","15:00"],
  [37,"TOT","MUN","2027-05-23","15:00"],
  [38,"ARS","BHA","2027-05-30","15:00"],
  [38,"AVL","TOT","2027-05-30","15:00"],
  [38,"CHE","BRE","2027-05-30","15:00"],
  [38,"COV","NFO","2027-05-30","15:00"],
  [38,"CRY","LEE","2027-05-30","15:00"],
  [38,"HUL","NEW","2027-05-30","15:00"],
  [38,"IPS","EVE","2027-05-30","15:00"],
  [38,"LIV","BOU","2027-05-30","15:00"],
  [38,"MUN","FUL","2027-05-30","15:00"],
  [38,"SUN","MCI","2027-05-30","15:00"]
];

/* strength_overall_home and strength_overall_away, read from the FPL API teams
   array. Real ratings, not a difficulty scale I invented. */
const STRENGTH = { ARS: [4, 5], AVL: [3, 4], BOU: [3, 3], BRE: [3, 3], BHA: [2, 3], CHE: [4, 4], COV: [2, 2], CRY: [3, 3], EVE: [3, 3], FUL: [2, 3], HUL: [2, 2], IPS: [2, 2], LEE: [2, 3], LIV: [4, 4], MCI: [4, 5], MUN: [4, 4], NEW: [2, 3], NFO: [3, 3], TOT: [3, 3], SUN: [2, 3] };

/* Difficulty of a fixture is the opponent's strength in the venue they travel
   to: facing a side at home is judged on their away rating, and the reverse. */
function fixtureDifficulty(opp, atHome) {
  const s = STRENGTH[opp];
  if (!s) return 3;
  return atHome ? s[1] : s[0];
}

const GW_DATES = (() => {
  const m = {};
  FIXTURES.forEach((f) => { if (!m[f[0]] || f[3] < m[f[0]]) m[f[0]] = f[3]; });
  return m;
})();

function fixturesForGw(gw) {
  return FIXTURES.filter((f) => f[0] === gw);
}

const MONTHS_NL = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];
const MONTHS_EN = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS_NL = ["Zondag","Maandag","Dinsdag","Woensdag","Donderdag","Vrijdag","Zaterdag"];
const DAYS_EN = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
function labelDate(iso) {
  const d = new Date(iso + "T12:00:00Z");
  return {
    nl: `${DAYS_NL[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_NL[d.getUTCMonth()]}`,
    en: `${DAYS_EN[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS_EN[d.getUTCMonth()]}`,
  };
}
/* A round is built from the real fixtures, grouped by matchday. Nothing has
   been played, so no round carries results. */
function roundFor(gw) {
  const games = fixturesForGw(gw);
  const byDate = {};
  games.forEach((f) => { (byDate[f[3]] = byDate[f[3]] || []).push({ h: f[1], a: f[2], t: f[4] }); });
  return {
    gw, played: false,
    nl: `Speelweek ${gw}`, en: `Gameweek ${gw}`,
    days: Object.keys(byDate).sort().map((iso) => ({ date: labelDate(iso), games: byDate[iso] })),
  };
}
const ROUNDS = [roundFor(1), roundFor(2), roundFor(3)];


/* ── CONTEXT ────────────────────────────────────────────────────────────── */
const LangCtx = createContext("nl");
const ThemeCtx = createContext(THEMES.default);
const NavCtx = createContext({});
const useLang = () => useContext(LangCtx);
const useTheme = () => useContext(ThemeCtx);
const useT = () => LANG[useContext(LangCtx)];
const useNav = () => useContext(NavCtx);

/* ── SMALL COMPONENTS ───────────────────────────────────────────────────── */

function Chevron({ open = false, color = "currentColor", size = 10 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 6" fill="none"
      style={{ display: "block", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
      <path d="M1 1L5 5L9 1" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Image based crest with a coloured monogram fallback, same role the Flag
   component plays in the World Cup build. */
function Crest({ club, style }) {
  const [step, setStep] = useState(0);
  const cl = CLUBS[club];
  /* a club with no inline render simply has one fewer source to try */
  const sources = useMemo(
    () => (cl ? BADGE_PATHS.map((fn) => fn(cl.badge, club)).filter(Boolean) : []),
    [cl, club]
  );
  if (!cl) return <span style={{ lineHeight: 1, ...style }}>?</span>;
  if (step >= sources.length) {
    return (
      <span style={{
        height: "1.34em", width: "1.34em", borderRadius: 3, background: cl.c1, color: cl.c2,
        fontSize: "0.58em", fontWeight: WEIGHT.bold, letterSpacing: -0.2,
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        verticalAlign: "middle", flexShrink: 0, ...style,
      }}>{club}</span>
    );
  }
  return (
    <img key={step} src={sources[step]} alt={cl.name} loading="lazy"
      onError={() => setStep((n) => n + 1)}
      style={{ height: "1.34em", width: "1.34em", objectFit: "contain", verticalAlign: "middle", display: "inline-block", flexShrink: 0, ...style }} />
  );
}

/* Player portraits, resolved in the same cascading way as the crests. Drop your
   own files at /photos/{code}.png to override, otherwise the official Premier
   League CDN answers. Nothing is bundled into this file: portraits are press
   photography and they are hotlinked, not redistributed. If every source
   fails the club crest stands in, so a row never renders empty. */
const PHOTO_DIR = "/photos";
const PHOTO_PATHS = [
  (code) => `${PHOTO_DIR}/${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague25/photos/players/250x250/${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague/photos/players/250x250/p${code}.png`,
  (code) => `https://resources.premierleague.com/premierleague/photos/players/110x140/p${code}.png`,
];

/* Always a circle, with a thin ring, the way the portraits sit in the WK2026
   app. Press photos are shot as tall portraits, so the image is scaled up and
   pinned to the top of the circle: that keeps the head centred instead of
   cropping the face out at the sides. */
function PlayerPhoto({ code, club, size = 56, ring }) {
  const T = useTheme();
  const [step, setStep] = useState(0);
  const frame = {
    width: size, height: size, borderRadius: "50%", flexShrink: 0,
    background: T.bg, border: `2px solid ${ring || T.border}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", position: "relative",
  };
  if (!code || step >= PHOTO_PATHS.length) {
    return (
      <div style={frame}>
        <span style={{ fontSize: Math.round(size * 0.52), lineHeight: 1, opacity: 0.8 }}>
          <Crest club={club} />
        </span>
      </div>
    );
  }
  return (
    <div style={frame}>
      <img key={step} src={PHOTO_PATHS[step](code)} alt="" loading="lazy"
        onError={() => setStep(step + 1)}
        style={{
          width: "128%", height: "128%", objectFit: "cover",
          objectPosition: "top center", transform: "translateY(-2%)",
        }} />
    </div>
  );
}

function Tag({ children, color }) {
  const T = useTheme();
  const c = color || T.textSub;
  return <span style={{ display: "inline-block", fontSize: FS.caption, fontWeight: WEIGHT.medium, color: c, background: `${c}22`, padding: "2px 5px", borderRadius: 3, whiteSpace: "nowrap" }}>{children}</span>;
}

function PSection({ label, sub, accent }) {
  const T = useTheme();
  const col = accent || T.accent;
  return (
    <div style={{ marginTop: 30, marginBottom: 14, paddingLeft: 13, paddingRight: 13 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 4, height: 18, borderRadius: 2, background: col, flexShrink: 0 }} />
        <span style={{ fontSize: FS.h2, fontWeight: WEIGHT.bold, color: T.text, letterSpacing: 0.2 }}>{label}</span>
      </div>
      {sub && <div style={{ fontSize: FS.caption, color: T.textSub, marginTop: 4, paddingLeft: 12, lineHeight: 1.4 }}>{sub}</div>}
    </div>
  );
}

function SegControl({ options, value, onChange }) {
  const T = useTheme();
  return (
    <div style={{ display: "flex", border: `1px solid ${T.accent}`, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
      {options.map((o, i) => {
        const on = value === o.v;
        return (
          <button key={o.v} onClick={() => onChange(o.v)} style={{
            padding: "5px 10px", fontSize: FS.caption, fontWeight: on ? WEIGHT.semibold : WEIGHT.medium,
            background: on ? T.accent : "transparent", color: on ? (T.id === "dark" ? T.neonInk : "#FFFFFF") : T.textSub,
            border: "none", borderRight: i < options.length - 1 ? `1px solid ${T.accent}` : "none",
            cursor: "pointer", whiteSpace: "nowrap", transition: "background 0.18s ease",
          }}>{o.l}</button>
        );
      })}
    </div>
  );
}

function SoccerIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" style={{ display: "block" }}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7zM12 3v4M4 10l4.5 -0.5M20 10l-4.5 -0.5M7 20l2.5 -3.9M17 20l-2.5 -3.9" />
    </svg>
  );
}
function MoonIcon({ color }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block" }}>
      <path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" />
    </svg>
  );
}

function ThemeToggle({ theme, setTheme }) {
  const SEG = 27, H = 27;
  const T = useTheme();
  const PURPLE = "#38003C", GREEN = "#00FF85", WHITE = "#FFFFFF";
  const ORANGE = T.accent;
  const M = {
    default: [{ bg: WHITE, icon: PURPLE }, { bg: WHITE, icon: PURPLE }],
    dark: [{ bg: PURPLE, icon: GREEN }, { bg: GREEN, icon: PURPLE }],
  };
  const active = M[theme] || M.default;
  const targets = ["default", "dark"];
  const cells = [(col) => <SoccerIcon color={col} />, (col) => <MoonIcon color={col} />];
  return (
    <div style={{ position: "relative", display: "flex", width: SEG * 2, height: H, border: `1px solid ${ORANGE}`, borderRadius: 6, overflow: "hidden", flexShrink: 0 }}>
      {cells.map((render, i) => (
        <div key={i} onClick={(e) => { e.stopPropagation(); setTheme(targets[i]); }}
          style={{
            position: "relative", width: SEG, height: "100%", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: active[i].bg, borderRight: i < 1 ? `1px solid ${ORANGE}` : "none",
            transition: "background 0.32s ease",
          }}>
          <div style={{ display: "flex", transition: "transform 0.45s cubic-bezier(.4,0,.2,1)" }}>{render(active[i].icon)}</div>
        </div>
      ))}
    </div>
  );
}

/* model icon pinned top right, same as the World Cup build */
function DataTabButton({ onOpen, active }) {
  const T = useTheme();
  const tr = useT();
  const [anim, setAnim] = useState(false);
  const iconCol = T.navAccent;
  const handle = (e) => { e.stopPropagation(); setAnim(true); setTimeout(() => setAnim(false), 520); onOpen && onOpen(); };
  return (
    <button onClick={handle} aria-label={tr.tabs.model} title={tr.tabs.model}
      style={{
        width: 28, height: 28, flexShrink: 0, cursor: "pointer", border: "none", borderRadius: 0,
        background: active ? "rgba(0,255,133,0.16)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
        transform: anim ? "scale(0.9)" : "scale(1)",
        transition: "transform 0.18s cubic-bezier(.34,1.56,.64,1)",
      }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ display: "block" }}
        stroke={iconCol} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      </svg>
    </button>
  );
}

function Nav({ tab, setTab }) {
  const T = useTheme();
  const tr = useT();
  const tabs = [
    { id: "team", label: tr.tabs.team },
    { id: "players", label: tr.tabs.players },
    { id: "projection", label: tr.tabs.projection },
    { id: "league", label: tr.tabs.league },
  ];
  return (
    <div style={{ position: "sticky", top: 0, zIndex: 20, background: T.nav, borderBottom: `2px solid ${T.border}`, width: "100%", overflowX: "hidden" }}>
      <div style={{ height: 4, background: `linear-gradient(90deg,${T.neon} 0%,${T.cyan} 55%,${T.accent2} 100%)` }} aria-hidden="true" />
      <div style={{ display: "flex", alignItems: "stretch", padding: "0 10px", width: "100%", boxSizing: "border-box" }}>
        <div style={{ display: "flex", alignItems: "center", marginRight: 10, flexShrink: 0 }}>
          <div aria-label="SB" style={{
            width: 28, height: 28, flexShrink: 0, border: `1px solid ${T.neon}`, borderRadius: 6,
            background: "transparent", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 13, fontWeight: WEIGHT.bold, letterSpacing: -0.5, color: T.neon, lineHeight: 1 }}>SB</span>
          </div>
        </div>
        <div style={{ width: 1, background: "rgba(255,255,255,0.20)", flexShrink: 0, marginRight: 2 }} />
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "11px 10px", fontSize: FS.small, background: "none", border: "none",
              borderBottom: active ? `2px solid ${T.navAccent}` : "2px solid transparent",
              color: active ? T.navAccent : T.navSub, fontWeight: active ? 700 : 400,
              whiteSpace: "nowrap", flexShrink: 0, cursor: "pointer", marginBottom: -2,
            }}>{t.label}</button>
          );
        })}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", flexShrink: 0 }}>
          <DataTabButton active={tab === "model"} onOpen={() => setTab("model")} />
        </div>
      </div>
    </div>
  );
}



/* ── DERIVED VALUES ─────────────────────────────────────────────────────── */
const XI_SET = new Set(XI_NAMES);
const POS_ORDER = ["GK", "DEF", "MID", "FWD"];
const CAPTAIN = "Haaland";
const VICE = "B.Fernandes";
const SQUAD_COST = SQUAD.reduce((a, p) => a + p.price, 0);
const XI_PPG = SQUAD.filter((p) => XI_SET.has(p.n)).reduce((a, p) => a + (p.ppg || 0), 0);
const POOL = SQUAD.map((p) => ({ ...p, tag: "squad" }))
  .concat(WATCH.map((p) => ({ ...p, tag: "watch" })));

const num = (v, d = 2) => (v == null ? "\u2013" : v.toFixed(d));

/* ── PLAYER TABLE ───────────────────────────────────────────────────────── */
const GRID = "16px minmax(0,1fr) 24px 30px 30px 30px 32px 32px";

function TableHead() {
  const T = useTheme();
  const tr = useT();
  const h = {
    fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.4,
    textTransform: "uppercase", color: T.textFaint, textAlign: "right",
  };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: GRID, gap: 4, alignItems: "center",
      padding: "6px 10px", background: T.bg, borderBottom: `1px solid ${T.border}`,
    }}>
      <span />
      <span style={{ ...h, textAlign: "left" }}>{tr.colPlayer}</span>
      <span style={{ ...h, textAlign: "left" }}>{tr.colPos}</span>
      <span style={h}>{tr.colVal}</span>
      <span style={h}>{tr.colXg}</span>
      <span style={h}>{tr.colXa}</span>
      <span style={h}>{tr.colEp}</span>
      <span style={{ ...h, color: T.accent2 }}>{tr.colPp}</span>
    </div>
  );
}

function PlayerRow({ p, open, onToggle, mode }) {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const bench = mode === "squad" && !XI_SET.has(p.n);
  const isCap = p.n === CAPTAIN;
  const isVice = p.n === VICE;
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div onClick={onToggle} style={{
        display: "grid", gridTemplateColumns: GRID, gap: 4, alignItems: "center",
        padding: "8px 10px", cursor: "pointer",
        background: open ? T.accentFaint : (bench ? T.bg : T.card),
      }}>
        <span style={{ fontSize: 14, lineHeight: 1, opacity: bench ? 0.6 : 1 }}><Crest club={p.c} /></span>

        <span style={{ minWidth: 0, display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{
            fontSize: FS.small, fontWeight: bench ? 400 : WEIGHT.medium,
            color: bench ? T.textSub : T.text,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{p.n}</span>
          {isCap && <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, color: T.neonInk, background: T.accent, borderRadius: 2, padding: "0 3px", flexShrink: 0 }}>C</span>}
          {isVice && <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, color: T.textSub, border: `1px solid ${T.border}`, borderRadius: 2, padding: "0 3px", flexShrink: 0 }}>V</span>}
        </span>

        <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.3, color: T.textFaint }}>{p.pos}</span>
        <span style={{ fontSize: FS.caption, color: T.textSub, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.price.toFixed(1)}</span>
        <span style={{ fontSize: FS.caption, color: T.textSub, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{num(p.xg)}</span>
        <span style={{ fontSize: FS.caption, color: T.textSub, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{num(p.xa)}</span>
        <span style={{ fontSize: FS.small, fontWeight: WEIGHT.bold, color: p.ppg ? T.accent : T.textFaint, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.ppg ? p.ppg.toFixed(1) : "\u2013"}</span>
        <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: p.pp == null ? T.textFaint : T.accent2, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{p.pp == null ? "\u2013" : p.pp.toFixed(1)}</span>
      </div>

      {open && (
        <div style={{ padding: "10px 12px", background: T.bg, borderLeft: `3px solid ${T.accent2}` }}>
          <div style={{ display: "flex", gap: 11, marginBottom: 10 }}>
            <PlayerPhoto code={p.code} club={p.c} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 0.8, textTransform: "uppercase", color: T.textFaint, marginBottom: 5 }}>
                {mode === "squad" ? tr.whyPicked : tr.whyWatch}
              </div>
              <div style={{ fontSize: FS.small, color: T.text, lineHeight: 1.65 }}>
                {lang === "nl" ? p.nl : p.en}
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 12px" }}>
            {[
              [tr.ppgLbl, p.ppg ? p.ppg.toFixed(1) : "\u2013"],
              [tr.ownLbl, p.own ? p.own.toFixed(1) + "%" : "\u2013"],
              [tr.startsLbl, p.starts != null ? String(p.starts) : "\u2013"],
              [tr.epLbl, p.ep ? p.ep.toFixed(1) : "\u2013"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: FS.caption, color: T.textSub }}>{k}</span>
                <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: T.text, textAlign: "right" }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlayerTable({ rows, mode, openKey, setOpenKey }) {
  const T = useTheme();
  const sorted = rows.slice().sort((a, b) =>
    POS_ORDER.indexOf(a.pos) - POS_ORDER.indexOf(b.pos) ||
    (mode === "squad" ? (XI_SET.has(a.n) ? 0 : 1) - (XI_SET.has(b.n) ? 0 : 1) : 0) ||
    (b.ppg || 0) - (a.ppg || 0));
  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
      <TableHead />
      {sorted.map((p) => (
        <PlayerRow key={p.n + p.c} p={p} mode={mode}
          open={openKey === p.n + p.c}
          onToggle={() => setOpenKey(openKey === p.n + p.c ? null : p.n + p.c)} />
      ))}
    </div>
  );
}

/* ── TEAM TAB ───────────────────────────────────────────────────────────── */
function TeamTab() {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const [openKey, setOpenKey] = useState(null);
  const cap = SQUAD.find((p) => p.n === CAPTAIN);

  return (
    <div style={{ padding: "12px 13px 0" }}>
      {/* headline: the squad in one glance */}
      <div style={{ background: T.pitch, borderRadius: 6, padding: 13, borderLeft: `4px solid ${T.neon}`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: 90, height: "100%", background: "linear-gradient(90deg,transparent,rgba(4,245,255,0.12))", pointerEvents: "none" }} />
        <div style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 1.5, textTransform: "uppercase", color: T.neon, marginBottom: 8 }}>
          {tr.gw} 1 &middot; 21/08/2026
        </div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            [SQUAD_COST.toFixed(1), tr.squadValue],
            [(100 - SQUAD_COST).toFixed(1), tr.bankLbl],
            [XI_PPG.toFixed(1), tr.xiPoints],
          ].map(([v, k]) => (
            <div key={k}>
              <div style={{ fontSize: FS.h2, fontWeight: WEIGHT.bold, color: "#FFFFFF", lineHeight: 1.1 }}>{v}</div>
              <div style={{ fontSize: FS.micro, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 11, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
          <PlayerPhoto code={cap.code} club={cap.c} size={40} ring={T.neon} />
          <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>{tr.captain}</span>
          <span style={{ fontSize: 15, lineHeight: 1 }}><Crest club={cap.c} /></span>
          <span style={{ fontSize: FS.body, fontWeight: WEIGHT.bold, color: "#FFFFFF", flex: 1 }}>{cap.n}</span>
          <span style={{ fontSize: FS.small, fontWeight: WEIGHT.bold, color: T.neon }}>{cap.ppg.toFixed(1)}</span>
        </div>
      </div>

      <PSection label={tr.squadTitle} sub={tr.squadSub} />
      <div style={{ marginTop: -4 }}>
        <PlayerTable rows={SQUAD} mode="squad" openKey={openKey} setOpenKey={setOpenKey} />
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 7, marginBottom: 4 }}>
        {[[tr.xiLbl, T.card], [tr.benchLbl, T.bg]].map(([l, bg]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: FS.micro, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint }}>
            <span style={{ width: 9, height: 9, borderRadius: 2, background: bg, border: `1px solid ${T.border}` }} />{l}
          </span>
        ))}
      </div>

      <PSection label={tr.watchTitle} sub={tr.watchSub} accent={T.accent2} />
      <div style={{ marginTop: -4, marginBottom: 18 }}>
        <PlayerTable rows={WATCH} mode="watch" openKey={openKey} setOpenKey={setOpenKey} />
      </div>
    </div>
  );
}

/* ── PLAYERS TAB ────────────────────────────────────────────────────────── */
function PlayersTab() {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const [club, setClub] = useState("ALL");
  const [sort, setSort] = useState("ppg");
  const [openKey, setOpenKey] = useState(null);

  const clubs = [...new Set(POOL.map((p) => p.c))].sort();
  const rows = POOL
    .filter((p) => club === "ALL" || p.c === club)
    .sort((a, b) => {
      if (sort === "val") return b.price - a.price;
      if (sort === "xg") return (b.xg || 0) - (a.xg || 0);
      if (sort === "xa") return (b.xa || 0) - (a.xa || 0);
      if (sort === "pp") return (b.pp || 0) - (a.pp || 0);
      return (b.ppg || 0) - (a.ppg || 0);
    });

  return (
    <div style={{ padding: "12px 13px 0" }}>
      <PSection label={tr.poolTitle} sub={tr.poolSub} />
      <div style={{ marginTop: -4, marginBottom: 9 }}>
        <SegControl value={sort} onChange={setSort} options={[
          { v: "ppg", l: tr.sortEp }, { v: "val", l: tr.sortVal },
          { v: "xg", l: tr.sortXg }, { v: "xa", l: tr.sortXa }, { v: "pp", l: tr.sortPp },
        ]} />
      </div>
      <select value={club} onChange={(e) => setClub(e.target.value)} style={{
        width: "100%", marginBottom: 10, padding: "8px 10px",
        background: T.card, color: T.text, border: `1px solid ${T.border}`,
        borderRadius: 4, fontSize: FS.small, fontWeight: WEIGHT.medium,
      }}>
        <option value="ALL">{tr.allClubs}</option>
        {clubs.map((c) => <option key={c} value={c}>{CLUBS[c] ? CLUBS[c].name : c}</option>)}
      </select>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden", marginBottom: 18 }}>
        <TableHead />
        {rows.map((p) => (
          <div key={p.n + p.c}>
            <div style={{ position: "relative" }}>
              <PlayerRow p={p} mode={p.tag === "squad" ? "squad" : "watch"}
                open={openKey === p.n + p.c}
                onToggle={() => setOpenKey(openKey === p.n + p.c ? null : p.n + p.c)} />
              <span style={{
                position: "absolute", top: 8, right: 4, fontSize: FS.micro,
                fontWeight: WEIGHT.bold, letterSpacing: 0.3,
                color: p.tag === "squad" ? T.green : T.textFaint, pointerEvents: "none",
              }}>{p.tag === "squad" ? "\u25CF" : "\u25CB"}</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: -10, marginBottom: 18 }}>
        {[[tr.inSquad, T.green, "\u25CF"], [tr.onWatch, T.textFaint, "\u25CB"]].map(([l, c, g]) => (
          <span key={l} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: FS.micro, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint }}>
            <span style={{ color: c }}>{g}</span>{l}
          </span>
        ))}
      </div>
    </div>
  );
}

function StandingsAccordion() {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const [open, setOpen] = useState(false);
  const top = STANDINGS.slice(0, 4);
  const bottom = STANDINGS.slice(-3);
  return (
    <div style={{ background: T.card, border: `1px solid ${open ? T.accent : T.border}`, borderRadius: 4, overflow: "hidden", marginBottom: 10 }}>
      <div onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 10, padding: "12px 13px",
        background: open ? T.accentFaint : T.card, cursor: "pointer",
      }}>
        <div style={{
          width: 24, height: 24, borderRadius: 6, flexShrink: 0, display: "flex",
          alignItems: "center", justifyContent: "center", background: T.accent,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={T.id === "dark" ? "#22002A" : "#FFFFFF"} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 21h8M12 17v4M5 3h14l-1 7a6 6 0 01-12 0L5 3zM3 7h18" />
          </svg>
        </div>
        <div style={{ flex: 1, fontSize: FS.small, fontWeight: WEIGHT.semibold, color: T.text, lineHeight: 1, whiteSpace: "nowrap" }}>{tr.standings}</div>
        <Chevron open={open} color={T.textSub} />
      </div>

      {/* collapsed summary: europe up, relegation down */}
      {!open && (
        <div onClick={() => setOpen(true)} style={{
          display: "flex", alignItems: "center", gap: 7, padding: "9px 13px",
          borderTop: `1px solid ${T.border}`, cursor: "pointer", background: T.bg,
          flexWrap: "nowrap", overflow: "hidden",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <svg width="9" height="11" viewBox="0 0 7 9" fill="none" style={{ flexShrink: 0 }}><path d="M3.5 0L7 4H4.5V9H2.5V4H0L3.5 0Z" fill={T.green} /></svg>
            {top.map((r) => <span key={r.c} style={{ fontSize: 15, lineHeight: 1 }}><Crest club={r.c} /></span>)}
          </div>
          <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: T.textFaint, whiteSpace: "nowrap", margin: "0 auto", letterSpacing: 0.3, textTransform: "uppercase" }}>{tr.europe}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            {bottom.map((r) => <span key={r.c} style={{ fontSize: 15, lineHeight: 1, opacity: 0.85 }}><Crest club={r.c} /></span>)}
            <svg width="9" height="11" viewBox="0 0 7 9" fill="none" style={{ flexShrink: 0 }}><path d="M3.5 9L0 5H2.5V0H4.5V5H7L3.5 9Z" fill={T.red} /></svg>
          </div>
        </div>
      )}

      {open && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          <div style={{
            display: "grid", gridTemplateColumns: "20px 22px 1fr 26px 30px 28px",
            alignItems: "center", gap: 6, padding: "5px 12px",
            borderBottom: `1px solid ${T.border}`, background: T.bg,
          }}>
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint }}>#</span>
            <span />
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint }}>{lang === "nl" ? "Club" : "Club"}</span>
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint, textAlign: "right" }}>{tr.played}</span>
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint, textAlign: "right" }}>{tr.gd}</span>
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, letterSpacing: 0.5, textTransform: "uppercase", color: T.textFaint, textAlign: "right" }}>{tr.pts}</span>
          </div>
          {STANDINGS.map((r, i) => {
            const ucl = i < 4, rel = i >= 17;
            return (
              <div key={r.c} style={{
                display: "grid", gridTemplateColumns: "20px 22px 1fr 26px 30px 28px",
                alignItems: "center", gap: 6, padding: "6px 12px",
                borderBottom: i < STANDINGS.length - 1 ? `1px solid ${T.border}` : "none",
                background: ucl ? hexA(T.accent, 0.05) : rel ? hexA(T.red, 0.05) : "transparent",
              }}>
                <span style={{ fontSize: FS.small, fontWeight: WEIGHT.semibold, color: ucl ? T.accent : rel ? T.red : T.textFaint, textAlign: "center" }}>{i + 1}</span>
                <span style={{ fontSize: 14, lineHeight: 1 }}><Crest club={r.c} /></span>
                <span style={{ fontSize: FS.small, fontWeight: ucl ? 600 : 400, color: ucl ? T.text : T.textSub, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{CLUBS[r.c].name}</span>
                <span style={{ fontSize: FS.caption, color: T.textSub, textAlign: "right" }}>{r.pl}</span>
                <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: r.gd > 0 ? T.green : r.gd < 0 ? T.red : T.textFaint, textAlign: "right" }}>{r.gd > 0 ? "+" : ""}{r.gd}</span>
                <span style={{ fontSize: FS.small, fontWeight: WEIGHT.semibold, color: T.text, textAlign: "right" }}>{r.pts}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const posOf = {};
STANDINGS.forEach((r, i) => { posOf[r.c] = { pos: i + 1, pts: r.pts }; });

/* A match row carries what happened, or when it will happen. No forecast. */
function GameRow({ g, played, open, onToggle }) {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const res = g.res;
  const win = res ? (res[0] > res[1] ? g.h : res[1] > res[0] ? g.a : null) : null;
  const draw = res ? res[0] === res[1] : false;
  const side = (club, score, align) => (
    <span style={{
      flex: 1, fontSize: FS.small,
      fontWeight: res && win === club ? 600 : 400,
      color: !res ? T.text : (win === club || draw ? T.text : T.textSub),
      textAlign: align, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
    }}>{CLUBS[club].name}</span>
  );
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <div onClick={onToggle} style={{
        display: "flex", alignItems: "center", gap: 6, padding: "8px 11px",
        cursor: "pointer", background: open ? T.accentFaint : T.card,
      }}>
        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}><Crest club={g.h} /></span>
        {side(g.h, res && res[0], "left")}
        {res ? (
          <div style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}>
            <span style={{ fontSize: FS.body, fontWeight: WEIGHT.bold, color: win === g.h ? T.text : draw ? T.text : T.textSub, minWidth: 12, textAlign: "right" }}>{res[0]}</span>
            <span style={{ fontSize: FS.caption, color: T.textFaint }}>-</span>
            <span style={{ fontSize: FS.body, fontWeight: WEIGHT.bold, color: win === g.a ? T.text : draw ? T.text : T.textSub, minWidth: 12, textAlign: "left" }}>{res[1]}</span>
          </div>
        ) : (
          <span style={{
            fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: T.textSub,
            fontVariantNumeric: "tabular-nums", flexShrink: 0,
            border: `1px solid ${T.border}`, borderRadius: 3, padding: "2px 6px",
          }}>{g.t}</span>
        )}
        {side(g.a, res && res[1], "right")}
        <span style={{ fontSize: 14, lineHeight: 1, flexShrink: 0 }}><Crest club={g.a} /></span>
        <Chevron open={open} color={T.textSub} />
      </div>

      {open && (
        <div style={{ padding: "9px 11px", background: T.bg, borderLeft: `3px solid ${T.accent2}`, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ ...chipStyle(T, "info"), width: "fit-content", marginBottom: 8 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={marker(T, "info").fg} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.bold, letterSpacing: 0.4 }}>
              {g.t}{played ? "" : " · " + tr.notPlayed}
            </span>
          </div>
          <div style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 0.8, textTransform: "uppercase", color: T.textFaint, marginBottom: 5 }}>{tr.standingBefore}</div>
          {[g.h, g.a].map((club) => {
            const st = posOf[club] || { pos: "-", pts: "-" };
            return (
              <div key={club} style={{ display: "flex", alignItems: "center", gap: 7, padding: "3px 0" }}>
                <span style={{ fontSize: 13, lineHeight: 1 }}><Crest club={club} /></span>
                <span style={{ fontSize: FS.caption, color: T.textSub, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{CLUBS[club].name}</span>
                <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: T.textSub }}>#{st.pos}</span>
                <span style={{ fontSize: FS.caption, fontWeight: WEIGHT.semibold, color: T.text, width: 26, textAlign: "right" }}>{st.pts}</span>
              </div>
            );
          })}
          <div style={{ marginTop: 9, paddingTop: 8, borderTop: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 0.8, textTransform: "uppercase", color: T.textFaint }}>{tr.result}</span>
            {res
              ? <span style={{ fontSize: FS.small, fontWeight: WEIGHT.bold, color: T.text }}>{res[0]} - {res[1]}</span>
              : <span style={{ fontSize: FS.caption, fontStyle: "italic", color: T.textFaint }}>{tr.notPlayed}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function LeagueTab() {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const [round, setRound] = useState(ROUNDS[0].gw);
  const [openGame, setOpenGame] = useState(null);
  const r = ROUNDS.find((x) => x.gw === round) || ROUNDS[0];
  return (
    <div style={{ padding: "12px 13px 0" }}>
      <StandingsAccordion />

      <PSection label={tr.matchesTitle} sub={tr.matchesSub} />
      <div style={{ marginTop: -4, marginBottom: 10 }}>
        <SegControl value={round} onChange={(v) => { setRound(v); setOpenGame(null); }}
          options={ROUNDS.map((x) => ({ v: x.gw, l: lang === "nl" ? x.nl : x.en }))} />
      </div>

      <div style={{ paddingBottom: 16 }}>
        {r.days.map((md) => (
          <div key={md.date.en} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 2px 7px" }}>
              <div style={{ width: 3, height: 12, borderRadius: 2, background: T.accent2, flexShrink: 0 }} />
              <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, letterSpacing: 1.2, textTransform: "uppercase", color: T.textSub }}>
                {lang === "nl" ? md.date.nl : md.date.en}
              </span>
              <div style={{ flex: 1, height: 1, background: T.border }} />
              <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.semibold, color: T.textFaint }}>{md.games.length}</span>
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
              {md.games.map((g) => {
                const k = `${r.gw}-${g.h}-${g.a}`;
                return <GameRow key={k} g={g} played={r.played} open={openGame === k}
                  onToggle={() => setOpenGame(openGame === k ? null : k)} />;
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── MODEL TAB ──────────────────────────────────────────────────────────── */


const IC = {
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
  users: "M19 20a7 7 0 00-14 0M12 11a3.5 3.5 0 100-7 3.5 3.5 0 000 7z",
  trend: "M3 3v18h18M7 16l4-4 4 4 4-4",
  layers: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  sigma: "M18 4H6l6 8-6 8h12",
  info: "M12 16v-4M12 8h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  arrow: "M5 12h14M12 5l7 7-7 7",
  bars: "M18 20V10M12 20V4M6 20v-6",
};



/* ── MODEL TAB ──────────────────────────────────────────────────────────── */
const PILLARS = [
  { icon: "users", metric: "74.8% \u2192 0.5%",
    nl: "1. Werkelijke eigendom", en: "1. Live ownership",
    nlD: "Het percentage managers dat een speler bezit, rechtstreeks uit de FPL-API van vandaag. Dit is een meting, geen mening. Het telt het zwaarst omdat FPL een rangspel is: Haaland niet bezitten op 74.8% is een risico op rang, los van of hij per miljoen de beste keuze is.",
    enD: "The percentage of managers who own a player, read straight from today's FPL API. This is a measurement, not an opinion. It weighs most because FPL is a rank game: not owning Haaland at 74.8% is a rank risk regardless of whether he is the best pick per million." },
  { icon: "star", metric: "6 drafts",
    nl: "2. Gepubliceerde expertdrafts", en: "2. Published expert drafts",
    nlD: "Zes gepubliceerde speelweek 1 selecties van managers met bewezen resultaten, waaronder meervoudige top 10k finishers. Per speler geteld hoe vaak hij voorkomt. Dit vangt informatie die nog in geen enkele statistiek zit: blessures uit persconferenties, opstellingen uit oefenwedstrijden, rolwijzigingen na een trainerswissel.",
    enD: "Six published gameweek 1 squads from managers with proven records, including multiple top 10k finishers. Counted per player as the number of drafts he appears in. This captures information not in any statistic yet: injuries from press conferences, line-ups from friendlies, role changes after a managerial switch." },
  { icon: "layers", metric: "FPL-API",
    nl: "3. Officiële prestatiecijfers", en: "3. Official performance data",
    nlD: "Punten per duel, xG en xA per 90 minuten, en het aantal basisplaatsen van vorig seizoen. Allemaal rechtstreeks gepubliceerd door de FPL-API, die zijn onderliggende cijfers van Opta betrekt. Iedereen kan deze getallen ophalen en controleren.",
    enD: "Points per match, expected goals and assists per 90 minutes, and starts made last season. All published directly by the FPL API, which sources its underlying numbers from Opta. Anyone can pull these figures and check them." },
];

const FORMULA = [
  { w: "2.2", nl: "Eigendom, geschaald naar de hoogst bezeten speler", en: "Ownership, scaled against the most-owned player" },
  { w: "1.6", nl: "Expertvermeldingen, geschaald naar zes van zes", en: "Expert mentions, scaled against six of six" },
  { w: "1.4", nl: "Punten per duel vorig seizoen", en: "Points per match last season" },
  { w: "0.4", nl: "Betrouwbaarheid, uit het aantal basisplaatsen", en: "Reliability, from the number of starts" },
];

const OPT_STEPS = [
  { icon: "sigma",
    nl: "Waardeer de selectie, niet de speler", en: "Value the squad, not the player",
    nlD: "Alleen elf spelers scoren. De basiself telt voor de volle waarde, de bank voor 0.45, 0.25 en 0.10. Vijftien spelers op volle waarde optellen duwt geld naar de bank, en dat is precies hoe je een selectie bouwt die op papier sterk lijkt en zwak begint.",
    enD: "Only eleven players score. The starting XI counts at full value, the bench at 0.45, 0.25 and 0.10. Adding fifteen players at face value pushes money onto the bench, which is exactly how you build a squad that looks strong on paper and starts weak." },
  { icon: "layers",
    nl: "De spelregels als harde grens", en: "The game rules as hard constraints",
    nlD: "Twee keepers, vijf verdedigers, vijf middenvelders, drie aanvallers. Maximaal drie spelers per club. Samen niet meer dan 100.0, tegen de echte prijzen van 2026/27.",
    enD: "Two keepers, five defenders, five midfielders, three forwards. At most three players from one club. No more than 100.0 in total, against the real 2026/27 prices." },
  { icon: "trend",
    nl: "Klimmen vanaf vijftig startpunten", en: "Climb from fifty starting points",
    nlD: "Vanaf elk willekeurig legaal startpunt pakt het model steeds de wissel die de selectiewaarde het meest verhoogt, tot niets meer verbetert. De beste van vijftig uitkomsten wint. Klimmen vanaf een enkel startpunt bleef aantoonbaar steken.",
    enD: "From each random legal starting point the model repeatedly takes the swap that raises squad value most, until nothing improves. The best of fifty outcomes wins. Climbing from a single starting point demonstrably got stuck." },
];

const HONEST = [
  { nl: "De PPT-kolom bepaalt niets",
    en: "The PPT column decides nothing",
    nlD: "PPT is de verwachte punten van FPL Prophet, een extern model, en staat er puur ter informatie. Het is niet meegewogen bij het samenstellen van de vijftien. Twee redenen: hun eigen site meldt dat de cijfers voor speelweek 1 tot 3 op prijs gebaseerde vuistregels zijn in plaats van hun machine learning model, en wij hebben dat gecontroleerd. Binnen een positie correleren hun cijfers 0.88 tot 0.91 met de prijs, dus het is grotendeels de prijs opnieuw. Bij keepers loopt het zelfs andersom: goedkopere keepers krijgen een hoger cijfer. Niet iedere speler heeft een waarde, want hun lijst toont alleen de bovenste namen.",
    enD: "PPT is FPL Prophet's expected points, an external model, and it sits here purely for information. It played no part in choosing the fifteen. Two reasons: their own site states that the gameweek 1 to 3 figures are price-based rules of thumb rather than their machine learning model, and we checked that. Within a position their numbers correlate 0.88 to 0.91 with price, so it is largely price restated. For goalkeepers it even runs backwards, with cheaper keepers scoring higher. Not every player has a value, because their list only shows the top names." },
  { nl: "Verwachte punten bestaat niet als publieke maatstaf",
    en: "Expected points does not exist as a public metric",
    nlD: "Voor xG en xA is er een publieke standaard van Opta die overal hetzelfde betekent. Voor verwachte punten is die er niet. De FPL-API geeft wel een eigen vPnt af, maar in de voorbereiding is dat cijfer samengeperst: slechts vier spelers in het hele spel halen het plafond van 4.0. Daarom staat in de tabel punten per duel van vorig seizoen, een gepubliceerd feit in plaats van een voorspelling.",
    enD: "For expected goals and assists there is a public Opta standard that means the same thing everywhere. For expected points there is not. The FPL API does publish its own figure, but in preseason it is compressed: only four players in the entire game reach the 4.0 ceiling. So the table shows points per match from last season, a published fact rather than a forecast." },
  { nl: "Punten per duel kijkt achteruit",
    en: "Points per match looks backwards",
    nlD: "Het cijfer komt van vorig seizoen en weet niets van een transfer, een trainerswissel of een veranderde rol. Daarom zijn de expertdrafts als tweede bron meegewogen: die vangen precies wat de statistiek nog niet weet.",
    enD: "The figure comes from last season and knows nothing about a transfer, a change of manager or a changed role. That is why the expert drafts count as a second source: they capture exactly what the statistic does not know yet." },
  { nl: "Promovendi hebben geen cijfers",
    en: "Promoted clubs have no numbers",
    nlD: "Spelers van Coventry, Hull en Ipswich hebben geen Premier League historie, dus geen punten per duel en geen xG. Ze konden niet op cijfers gekozen worden, hoe goed ze ook zijn. Datzelfde geldt voor iedereen die nieuw is in de competitie.",
    enD: "Players at Coventry, Hull and Ipswich have no Premier League history, so no points per match and no expected goals. They could not be selected on numbers regardless of quality. The same applies to anyone new to the league." },
  { nl: "Eigendom is een momentopname",
    en: "Ownership is a snapshot",
    nlD: "De eigendomscijfers zijn van vandaag, twee weken voor de deadline van 21 augustus. Ze bewegen snel zodra oefenwedstrijden en persconferenties landen. Deze selectie wil vlak voor de deadline nog een keer tegen het licht.",
    enD: "The ownership figures are from today, two weeks before the deadline on 21 August. They move fast once friendlies and press conferences land. This squad wants one more check right before the deadline." },
  { nl: "De bank staat op nul",
    en: "The bank is at zero",
    nlD: "De optimalisatie besteedt tot de laatste 0.1, want ongebruikt geld scoort niets. Het gevolg is dat er geen ruimte is om bij de deadline een zijwaartse wissel te maken. Overweeg bewust 0.5 achter te houden.",
    enD: "The optimisation spends to the last 0.1, because unspent money scores nothing. The consequence is no room for a sideways move at the deadline. Consider deliberately holding back 0.5." },
];

function ModelViz() {
  const T = useTheme();
  const lang = useLang();
  const tr = useT();
  const orange = T.accent;
  const [openH, setOpenH] = useState(null);

  return (
    <div style={{ padding: "12px 13px 0" }}>
      <PSection label={tr.modelTitle} sub={tr.modelSub} />
      <div style={{
        marginTop: -4, background: T.card, border: `1px solid ${T.border}`,
        borderLeft: `3px solid ${T.accent2}`, borderRadius: 3, padding: "10px 12px",
        fontSize: FS.small, color: T.textSub, lineHeight: 1.65, marginBottom: 12,
      }}>
        {lang === "nl"
          ? "Elk cijfer in deze app is publiek en controleerbaar: eigendom en prestatiecijfers uit de offici\u00eble FPL-API, plus zes gepubliceerde expertdrafts. Er zit geen eigen voorspellingsmodel achter. Drie bronnen zijn per speler gescoord en samengevoegd, waarna een optimalisatie de best mogelijke legale vijftien binnen 100.0 zoekt."
          : "Every figure in this app is public and checkable: ownership and performance data from the official FPL API, plus six published expert drafts. There is no in-house prediction model behind it. Three sources were scored per player and combined, after which an optimisation searches for the best legal fifteen within 100.0."}
      </div>

      <PSection label={tr.pillarsTitle} sub={tr.pillarsSub} accent={T.accent2} />
      <div style={{ marginTop: -4 }}>
        {PILLARS.map((s) => (
          <div key={s.icon} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
            padding: "11px 12px", marginBottom: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ flexShrink: 0 }}>{IC[s.icon]}</span>
              <span style={{ flex: 1, fontSize: FS.small, fontWeight: WEIGHT.bold, color: T.text }}>
                {lang === "nl" ? s.nl : s.en}
              </span>
              <span style={{ fontSize: FS.micro, fontWeight: WEIGHT.bold, color: orange, whiteSpace: "nowrap" }}>{s.metric}</span>
            </div>
            <div style={{ fontSize: FS.caption, color: T.textSub, lineHeight: 1.65 }}>
              {lang === "nl" ? s.nlD : s.enD}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        background: T.card, border: `1px solid ${T.border}`, borderLeft: `3px solid ${T.accent2}`,
        borderRadius: 3, padding: "10px 12px", marginTop: 8, marginBottom: 2,
      }}>
        <div style={{ fontSize: FS.small, fontWeight: WEIGHT.semibold, color: T.text, marginBottom: 3 }}>{tr.ppTitle}</div>
        <div style={{ fontSize: FS.caption, color: T.textSub, lineHeight: 1.6 }}>{tr.ppSub}</div>
      </div>

      <PSection label={tr.formulaTitle} sub={tr.formulaSub} />
      <div style={{ marginTop: -4, background: T.card, border: `1px solid ${T.border}`, borderRadius: 4, overflow: "hidden" }}>
        {FORMULA.map((f, i) => (
          <div key={f.w} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "9px 12px",
            borderBottom: i < FORMULA.length - 1 ? `1px solid ${T.border}` : "none",
          }}>
            <span style={{
              fontSize: FS.small, fontWeight: WEIGHT.bold, color: orange,
              minWidth: 28, fontVariantNumeric: "tabular-nums",
            }}>{f.w}</span>
            <span style={{ fontSize: FS.caption, color: T.textSub, lineHeight: 1.5 }}>{lang === "nl" ? f.nl : f.en}</span>
          </div>
        ))}
        <div style={{ padding: "9px 12px", background: T.bg, borderTop: `1px solid ${T.border}`, fontSize: FS.caption, color: T.textSub, lineHeight: 1.6 }}>
          {lang === "nl"
            ? "De gewichten zijn een oordeel, geen meting. Eigendom telt het zwaarst omdat het de enige bron is die direct over rang gaat. Punten per duel telt lichter omdat het achteruit kijkt en niets weet van transfers of rolwijzigingen."
            : "The weights are a judgement, not a measurement. Ownership counts most because it is the only source that speaks directly to rank. Points per match counts less because it looks backwards and knows nothing about transfers or changes of role."}
        </div>
      </div>

      <PSection label={tr.optTitle} sub={tr.optSub} accent={T.accent2} />
      <div style={{ marginTop: -4 }}>
        {OPT_STEPS.map((s) => (
          <StepCard key={s.icon} icon={IC[s.icon]}
            title={lang === "nl" ? s.nl : s.en}
            body={lang === "nl" ? s.nlD : s.enD} />
        ))}
      </div>

      <PSection label={tr.honestTitle} sub={tr.honestSub} accent={T.red} />
      <div style={{ marginTop: -4, marginBottom: 18 }}>
        {HONEST.map((h, i) => (
          <div key={i} style={{
            background: T.card, border: `1px solid ${T.border}`,
            borderLeft: `3px solid ${T.red}`, borderRadius: 3, marginBottom: 8, overflow: "hidden",
          }}>
            <button onClick={() => setOpenH(openH === i ? null : i)} aria-expanded={openH === i}
              style={{
                width: "100%", display: "flex", alignItems: "center", gap: 8,
                padding: "10px 12px", background: "transparent", border: "none", textAlign: "left",
              }}>
              <span style={{ flex: 1, fontSize: FS.small, fontWeight: WEIGHT.semibold, color: T.text }}>
                {lang === "nl" ? h.nl : h.en}
              </span>
              <Chevron open={openH === i} color={T.textSub} />
            </button>
            {openH === i && (
              <div style={{ padding: "0 12px 11px", fontSize: FS.caption, color: T.textSub, lineHeight: 1.65 }}>
                {lang === "nl" ? h.nlD : h.enD}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepCard({ icon, title, body }) {
  const T = useTheme();
  return (
    <div style={{
      background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
      padding: "11px 12px", marginBottom: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <span style={{ flexShrink: 0 }}>{icon}</span>
        <span style={{ fontSize: FS.small, fontWeight: WEIGHT.bold, color: T.text }}>{title}</span>
      </div>
      <div style={{ fontSize: FS.caption, color: T.textSub, lineHeight: 1.65 }}>{body}</div>
    </div>
  );
}

/* ── APP ────────────────────────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang] = useState("nl");
  const [theme, setTheme] = useState("default");
  const [tab, setTab] = useState("team");
  const T = THEMES[theme] || THEMES.default;
  const tr = LANG[lang];

  return (
    <LangCtx.Provider value={lang}>
      <ThemeCtx.Provider value={T}>
        <NavCtx.Provider value={{ tab, setTab }}>
          <div style={{
            minHeight: "100vh", background: T.bg, color: T.text,
            fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif",
            maxWidth: 520, margin: "0 auto", paddingBottom: 30,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 9,
              padding: "13px 13px 10px", borderBottom: `1px solid ${T.border}`,
            }}>
              <SoccerIcon color={T.accent} />
              <span style={{ fontSize: FS.h2, fontWeight: WEIGHT.bold, letterSpacing: -0.3, flex: 1 }}>{tr.appTitle}</span>
              <button onClick={() => setLang(lang === "nl" ? "en" : "nl")} style={{
                background: "transparent", border: `1px solid ${T.border}`, borderRadius: 4,
                color: T.textSub, padding: "4px 8px", fontSize: FS.micro,
                fontWeight: WEIGHT.bold, letterSpacing: 0.5,
              }}>{lang === "nl" ? "EN" : "NL"}</button>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>

            <Nav tab={tab} setTab={setTab} />

            {tab === "team" && <TeamTab />}
            {tab === "players" && <PlayersTab />}
            {tab === "league" && <LeagueTab />}
            {tab === "model" && <ModelViz />}
          </div>
        </NavCtx.Provider>
      </ThemeCtx.Provider>
    </LangCtx.Provider>
  );
}
