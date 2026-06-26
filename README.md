<div align="center">

# 理大圍城 2019 · The Siege of PolyU

### A self-playing **2D documentary map** of the **November 2019 siege of Hong Kong Polytechnic University** — sharp satellite imagery, a directed tour of the cordon / positions / escape routes, bilingual captions.

[![live demo](https://img.shields.io/badge/live_demo-online-2ea44f?style=for-the-badge)](https://2019poly.vercel.app/)
&nbsp;
[![code MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content CC BY 4.0](https://img.shields.io/badge/content-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)
[![Leaflet 1.9](https://img.shields.io/badge/Leaflet-1.9-199900)](https://leafletjs.com/)
[![no build, no API key](https://img.shields.io/badge/build-none-success)](#run-it-locally)

**▶ [Try the live demo](https://2019poly.vercel.app/)**

</div>

---

## About

A **neutral documentary reconstruction** of the siege of the Hong Kong Polytechnic
University (PolyU), **11–29 November 2019**, told as a self-playing overhead map
tour with bilingual (中／EN) narration.

> **Two builds live in this repo.**
> - **`dev` (this branch) — 2D Leaflet map.** PolyU is a flat urban campus, so an
>   overhead view tells the siege better than 3D terrain *and* gives **sharp
>   sub-metre satellite imagery** (Esri World Imagery, z17–19). No API key, no
>   tile fetching, a single `index.html`.
> - **`main` — 3D Three.js flyover.** Reuses the *Battle of Hong Kong 1941* engine
>   (Keith Li, MIT) on real terrain. Kept for reference; its imagery is soft because
>   the free Sentinel-2 source caps at ~10 m/px.

Either way it is a **documentary, not advocacy**: positions, the cordon and routes
are **illustrative and approximate**; the timeline is cross-checked across Reuters,
AP, BBC, HKFP and SCMP; figures (e.g. the ~1,100 arrested/registered) and some
details remain disputed.

### How it works (dev / Leaflet)

- **Basemap:** Esri World Imagery tiles, no API key.
- **Content:** read from `data.js` (`window.BATTLE_DATA`) — the same 10-act
  bilingual storyboard, side positions (`units[].track`) and cordon (`lines[]`)
  as the 3D build, schema unchanged.
- **Per act:** the map flies to the act's focus, draws the police cordon when it
  forms (~17 Nov), and plots side positions as circle markers sized by headcount —
  inside **ochre** `#d9a441`, police **steel** `#5b7fa6`, mediators **grey**
  `#b9c0c8`. No flags, no combat VFX.
- **Tour:** auto-advances per act (`hold` seconds), with play/pause · prev/next ·
  a 中／EN caption toggle · a notes & sources panel.

## Run it locally

No build, no tile fetching — Leaflet + tiles load from their CDNs at runtime.

```bash
node tools/serve.js     # http://localhost:5050
```

## Deploy

Static, no backend. Deployed to **Vercel** (`vercel deploy --prod`) → live at
**https://2019poly.vercel.app/**. (The repo is private; Vercel serves the static
files publicly without making the repo public.)

## Credits & licence

- **Content & code:** MIT (`LICENSE`) / CC BY 4.0 for the documentary content.
- **3D engine (`main` branch)** © **Keith Li** — [battle-of-hong-kong-1941](https://github.com/keithligh/battle-of-hong-kong-1941), MIT.
- **Map library:** [Leaflet](https://leafletjs.com/) 1.9 (BSD-2).
- **Imagery:** Esri World Imagery — *Esri, Maxar, Earthstar Geographics* (non-commercial use).

See `THIRD_PARTY_NOTICES.md` for full third-party terms.
