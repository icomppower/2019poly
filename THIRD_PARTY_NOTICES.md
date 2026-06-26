# Third-Party Notices

This build (the 2D Leaflet map on the `dev` branch) loads third-party software
and map tiles at runtime. Each retains its own license/terms, referenced below.
Nothing third-party is redistributed in this repository — `index.html` references
the libraries via CDN and the tiles via the providers' tile servers.

> The Three.js 3D build on the `main` branch has its own dependencies (Three.js,
> EOX Sentinel-2 imagery, SRTM/USGS elevation); see that branch's notices.

---

## 1. Leaflet 1.9.4 — software (loaded via unpkg CDN)

> Copyright © 2010–2024 Volodymyr Agafonkin, 2010–2011 CloudMade. All rights reserved.

Leaflet is licensed under the **BSD 2-Clause License**. Source and full text:
https://github.com/Leaflet/Leaflet/blob/main/LICENSE

---

## 2. Satellite imagery — Esri "World Imagery" (loaded at runtime, not redistributed)

> Tiles © **Esri** — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community.

Served from the ArcGIS Online World Imagery service
(`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer`).
Attribution is shown persistently in the app UI. Use is subject to the Esri terms
of use; this is a **non-commercial documentary**. If the project ever becomes
commercial, switch to a licensed basemap (Mapbox / MapTiler / Esri subscription).
Terms: https://www.esri.com/en-us/legal/terms/full-master-agreement

---

## 3. Place geometry / general map reference

> © **OpenStreetMap** contributors (where applicable), ODbL.

https://www.openstreetmap.org/copyright
