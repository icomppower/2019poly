// fetch_tiles.mjs — Node port of fetch_tiles.ps1 (pwsh-free).
// Downloads REAL terrain into lib/tiles/ (run once, offline thereafter).
//   DEM : AWS open Terrarium terrain-RGB (elev = R*256 + G + B/256 - 32768 m), no API key
//   IMG : EOX Sentinel-2 cloudless 2016 (CC BY 4.0) {z}/{y}/{x} JPEG, no API key
// Tile range is DERIVED from the bbox+zoom — keep in sync with config.js CFG.GEO
// and tools/fetch_tiles.ps1.  Usage:  node tools/fetch_tiles.mjs
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// --- campus bounding box + zoom (keep in sync with config.js CFG.GEO) ------
const minLng = 114.173, maxLng = 114.187, minLat = 22.298, maxLat = 22.309, z = 15;
// AWS Terrarium DEM maxzoom is 15; the engine uses one zoom for DEM + imagery, so z is capped at 15.

const lngToX = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const latToY = (lat, z) => { const r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * 2 ** z); };

const xmin = lngToX(minLng, z), xmax = lngToX(maxLng, z);
const ymin = latToY(maxLat, z), ymax = latToY(minLat, z);   // north = smaller y
const nx = xmax - xmin + 1, ny = ymax - ymin + 1;
console.log(`zoom ${z}  x ${xmin}..${xmax} (${nx})  y ${ymin}..${ymax} (${ny})  => ${nx * ny} tiles/layer`);

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const demDir = join(root, "lib", "tiles", "dem");
const imgDir = join(root, "lib", "tiles", "img");
await mkdir(demDir, { recursive: true });
await mkdir(imgDir, { recursive: true });

const jobs = [];
for (let x = xmin; x <= xmax; x++) for (let y = ymin; y <= ymax; y++) {
  jobs.push({ url: `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${x}/${y}.png`,
              path: join(demDir, `${z}_${x}_${y}.png`), kind: "dem" });
  jobs.push({ url: `https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless_3857/default/g/${z}/${y}/${x}.jpg`,
              path: join(imgDir, `${z}_${x}_${y}.jpg`), kind: "img" });
}

async function fetchTile(job, tries = 4) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(job.url, { headers: { "User-Agent": "polyu-siege-2019/1.0 (tile fetch)" } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      await writeFile(job.path, buf);
      return null;
    } catch (e) {
      if (attempt === tries) return `FAIL ${job.url}  ->  ${e.message}`;
      await new Promise(r => setTimeout(r, 1500 * attempt));
    }
  }
}

// modest concurrency
const fails = [];
const THROTTLE = 8;
for (let i = 0; i < jobs.length; i += THROTTLE) {
  const batch = jobs.slice(i, i + THROTTLE);
  const results = await Promise.all(batch.map(fetchTile));
  for (const r of results) if (r) fails.push(r);
}

const demN = (await readdir(demDir)).filter(f => f.endsWith(".png")).length;
const imgN = (await readdir(imgDir)).filter(f => f.endsWith(".jpg")).length;
console.log(`DEM tiles: ${demN}   IMG tiles: ${imgN}   expected each: ${nx * ny}`);
if (fails.length) { console.log("FAILURES:"); fails.forEach(f => console.log("  " + f)); }
console.log(fails.length ? "Done with some failures (terrain tolerates <25% missing)." : "OK, all tiles downloaded.");
