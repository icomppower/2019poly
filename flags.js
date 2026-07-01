/* =====================================================================
 *  flags.js — 理大圍城 2019 · neutral plain-colour swatches.
 *
 *  Neutral-documentary posture: NO national flags, NO faction emblems.
 *  Each side flies a flat solid swatch matching its data.js faction colour
 *  (校內人士 ochre · 警方封鎖線 steel · 調停人員 grey). The hoist shadow +
 *  border are kept only as a legibility cue on the 3D pole. Same contract as
 *  kyiv2022-3d/flags.js: export flagTexture(unit) keyed by unit.flag.
 * ===================================================================== */
const W = 230, H = 150;
const SWATCH = {
  inside:    "#d9a441",   // ochre / amber
  police:    "#5b7fa6",   // steel blue
  mediators: "#b9c0c8",   // grey
};

const flagTexCache = {};
export function flagTexture(unit) {
  if (flagTexCache[unit.id]) return flagTexCache[unit.id];
  const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
  const c = cv.getContext("2d");
  const fill = SWATCH[unit.flag];
  if (!fill) console.warn(`unknown flag "${unit.flag}" for ${unit.id}`);
  c.fillStyle = fill || SWATCH.inside; c.fillRect(0, 0, W, H);
  const sh = c.createLinearGradient(0, 0, W * 0.18, 0);
  sh.addColorStop(0, "rgba(0,0,0,0.28)"); sh.addColorStop(1, "rgba(0,0,0,0)");
  c.fillStyle = sh; c.fillRect(0, 0, W * 0.18, H);
  c.strokeStyle = "rgba(0,0,0,0.42)"; c.lineWidth = 3; c.strokeRect(1.5, 1.5, W - 3, H - 3);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; tex.needsUpdate = true;
  flagTexCache[unit.id] = tex; return tex;
}
