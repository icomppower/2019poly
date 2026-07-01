<div align="center">

# 理大圍城 2019 · The Siege of PolyU

### A self-playing **3D documentary** of the **November 2019 siege of Hong Kong Polytechnic University** — real terrain, a self-directing camera, bilingual (中／EN) narration, and evidence tags.

[![live](https://img.shields.io/badge/live-github_pages-2ea44f?style=for-the-badge)](https://icomppower.github.io/2019poly/)
&nbsp;
[![code MIT](https://img.shields.io/badge/code-MIT-blue)](LICENSE)
[![content CC BY 4.0](https://img.shields.io/badge/content-CC_BY_4.0-blue)](https://creativecommons.org/licenses/by/4.0/)
[![engine Three.js](https://img.shields.io/badge/engine-Three.js-000)](https://threejs.org/)
[![no build](https://img.shields.io/badge/build-none-success)](#run-it-locally)

**▶ [icomppower.github.io/2019poly](https://icomppower.github.io/2019poly/)**

</div>

---

## About

A **neutral documentary reconstruction** of the siege of the Hong Kong Polytechnic
University (PolyU), **11–29 November 2019**, told as an auto-playing 3D flyover over
real satellite terrain with bilingual narration.

Built on the **`cinematic-3d-battle-engine`** (Keith Li, MIT) — the same engine as
[`battle-of-hong-kong-1941`](https://github.com/icomppower) — in the **neutral
documentary posture** shared with the Kyiv 2022 build:

- **Flat grade** — no cinematic sepia/vignette wash.
- **No flags or faction emblems** — each side is a plain colour swatch:
  校內人士 **inside** (ochre), 警方封鎖線 **police cordon** (steel), 調停人員 **mediators** (grey).
- **No strength bars, no combat VFX** — unit movement only (`hold / march / retreat / dead`).
- **Evidence tags** on every caption — `verified` / `approx` / `contested` — marking source confidence.

It is a **documentary, not advocacy**: positions, the cordon and escape routes are
**illustrative and approximate**; the timeline is cross-checked across Reuters, AP,
BBC, HKFP and SCMP; figures (e.g. the ~1,300 arrested/surrendered) and some details
remain disputed. See the in-app **Notes** panel and [`data.js`](data.js) `notes`.

## The fork contract

The engine modules are **never edited**. This fork lives entirely in:

- [`data.js`](data.js) — all 11 acts, units, narration, `meta.geo`, factions, sources.
- [`flags.js`](flags.js) — neutral colour swatches (no national flags).
- `index.html` `<head>` — title / branding only (the body is battle-agnostic).
- `lib/tiles/` — the committed campus tile cache (imagery + DEM).

Two guards enforce this:

```bash
node tools/validate.mjs        # data.js passes the engine data contract  → OK
node tools/check-agnostic.mjs  # no battle text leaked into engine/shell  → OK
```

## Run it locally

```bash
node tools/serve.js            # → http://localhost:5050
```

`file://` will not work (the browser can't read the terrain tiles) — use the server.

## Map tiles

The campus box (`meta.geo` in `data.js`, zoom 15) is fetched with:

```bash
node tools/fetch_tiles.mjs --dry   # print the tile range + count
node tools/fetch_tiles.mjs         # download imagery + DEM into lib/tiles/
```

Tiles are **committed** to `lib/tiles/` so the static site is self-contained.

## Music

Left intentionally unwired. Drop a **neutral, ambient CC0** track (e.g. from Pixabay —
no militaristic / triumphalist / dramatic character) into `lib/` and uncomment the
`<audio>` tag in `index.html`. The engine auto-shows the music button when it is present.

## Deploy

Static, no backend — **GitHub Pages** (`.github/workflows/pages.yml` fetches tiles in CI
and publishes on push to `main`) → live at **https://icomppower.github.io/2019poly/**.

## Credits & licence

- **Content & code:** MIT ([`LICENSE`](LICENSE)) / CC BY 4.0 for the documentary content.
- **Engine:** [`cinematic-3d-battle-engine`](https://github.com/keithligh/cinematic-3d-battle-engine) © **Keith Li** (MIT).
- **3D library:** [Three.js](https://threejs.org/) (MIT).
- **Imagery:** EOX Sentinel-2 cloudless 2016 (CC BY 4.0). **Elevation:** AWS Terrain Tiles / Mapzen Terrarium DEM (SRTM/USGS).

See [`THIRD_PARTY_NOTICES.md`](THIRD_PARTY_NOTICES.md) for full third-party terms.
