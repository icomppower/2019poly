<div align="center">

# 理大圍城 2019 · The Siege of PolyU

### A self-playing 3D documentary of the **November 2019 siege of Hong Kong Polytechnic University**, rendered on **real terrain** with a directed cinematic camera and bilingual captions.

[![live demo](https://img.shields.io/badge/live_demo-online-2ea44f?style=for-the-badge)](https://icomppower.github.io/2019poly/)
&nbsp;
[![code MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content CC BY 4.0](https://img.shields.io/badge/content-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)
[![Three.js r128](https://img.shields.io/badge/Three.js-r128-000000)](https://threejs.org/)
[![no build, runs offline](https://img.shields.io/badge/build-none-success)](#run-it-locally)

**▶ [Try the live demo](https://icomppower.github.io/2019poly/)**

</div>

---

## About

This is a **neutral documentary reconstruction** of the siege of the Hong Kong
Polytechnic University (PolyU) between **11–29 November 2019**, presented as a
self-playing, to-scale 3D tour on real terrain with bilingual (中／EN) narration.

It reuses, almost unchanged, the cinematic engine built for the
[**Battle of Hong Kong 1941**](https://github.com/keithligh/battle-of-hong-kong-1941)
project by **Keith Li** (MIT). That engine was made for a *war*; this build
deliberately **strips the militarised aesthetics** so a recent, contested civil
event is shown in a restrained, documentary tone:

- **No national flags, no muzzle flashes, no combat VFX** — the flag system is
  disabled and the particle/flash effects never fire (only neutral
  `hold`/`march`/`retreat` movement states are used).
- **Neutral side colours** — inside (示威者・學生) ochre · police (警方) steel ·
  mediators (調停者) grey. No war-faction reds/blues.
- **No period film grade** — a 2019 event must not look like 1941 newsreel.
- **One campus, high zoom** — tiles are tightened from the whole territory to the
  PolyU / Hung Hom area.

It is a **documentary, not advocacy**: positions, the cordon and routes are
**illustrative and approximate**; the timeline is cross-checked across Reuters,
AP, BBC, HKFP and SCMP; figures (e.g. the ~1,100 arrested/registered) and some
details remain disputed.

## Run it locally

Real map tiles must be served over HTTP (not `file://`).

```bash
# 1) fetch the campus terrain tiles once (Node — no PowerShell needed)
node tools/fetch_tiles.mjs     # → lib/tiles/   (PowerShell users: pwsh tools/fetch_tiles.ps1)

# 2) serve and open
node tools/serve.js            # http://localhost:5050
```

Tiles are committed to the repo, so the published site needs no backend.

## What's in here

| File | Role |
| --- | --- |
| `index.html` | shell + UI (neutral titles, legend, captions) |
| `config.js` | `CFG` (campus bbox z15, neutral grade, day axis 11–29, VFX off) + neutral `FAC` |
| `data.js` | the PolyU content — geography, sides, the 10-act storyboard, sources |
| `app.js` · `core.js` · `state.js` · `projection.js` | engine boot, renderer, clock, projection |
| `terrain.js` | real DEM + imagery terrain, sea, labels, cordon line |
| `entities.js` | side markers + movement (flags/combat VFX disabled) |
| `director.js` | the self-playing camera, captions, transport |
| `flags.js` | national-flag painter — **disabled** (`flagTexture` returns null) |
| `tools/` | tile fetchers (`.mjs` Node / `.ps1` PowerShell) + static server |

## Credits & licence

- **Engine** © **Keith Li** — [battle-of-hong-kong-1941](https://github.com/keithligh/battle-of-hong-kong-1941), MIT. This PolyU adaptation keeps that licence and notice.
- **Code:** MIT (see `LICENSE`). **Content:** CC BY 4.0.
- **Imagery:** EOX Sentinel-2 cloudless 2016 © EOX IT Services GmbH · s2maps.eu (modified Copernicus Sentinel data), CC BY 4.0.
- **Elevation:** SRTM courtesy USGS, via AWS Terrain Tiles.
- **3D:** [Three.js](https://threejs.org/) r128 (MIT).

See `THIRD_PARTY_NOTICES.md` for full third-party attributions.
