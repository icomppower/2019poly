/* =====================================================================
 *  config.js: Battle of Hong Kong 1941 · tunables, data handle, utilities
 *  The loud-failure guard, the CFG/FAC constants, small math,
 *  and the boot helpers. Imported by every other module; imports nothing.
 * ===================================================================== */

/* ---- fail loudly, never silently -------------------------------- *
 *  First error wins (shown-once) so the root cause is what the user sees,
 *  not a cascade of follow-on failures.                                 */
let shown = false;
export function fatal(e){
  if(shown) return; shown=true;
  const el=document.getElementById("err");
  el.style.display="block";
  el.textContent="⚠ 初始化失敗 / Initialization error:\n\n"+(e&&e.stack?e.stack:e)+
    "\n\n（本作需透過 http(s) 伺服器開啟；直接以 file:// 開啟會因瀏覽器安全限制無法讀取地形瓦片。"+
    "本機檢視可執行 `node tools/serve.js` 或使用內建預覽。）";
  const boot=document.getElementById("boot"); if(boot) boot.classList.add("gone");
  console.error(e);
}
window.addEventListener("error", ev=>fatal(ev.error||ev.message));

/* ---- dependency guard: a missing vendored lib must fail loud here, *
 *  before any module touches THREE / BATTLE_DATA (Error Transparency). */
try {
  if(typeof THREE==="undefined") throw new Error("THREE 未載入 (lib/three.min.js)");
  if(!THREE.OrbitControls) throw new Error("OrbitControls 未載入");
  if(!THREE.CSS2DRenderer) throw new Error("CSS2DRenderer 未載入");
  if(!window.BATTLE_DATA) throw new Error("BATTLE_DATA 未載入 (data.js)");
}catch(e){ fatal(e); throw e; }   // throw aborts module loading so the broken engine never half-renders

export const D = window.BATTLE_DATA;
export const bootMsg = t => { const m=document.getElementById("boot-msg"); if(m) m.textContent=t; };

/* ========================= CONFIG ================================== *
 *  PolyU 2019 siege · documentary tone. Only CFG + FAC differ from the
 *  1941 engine; the rest of this file (guard, D, bootMsg, math) is the
 *  fork untouched. NOTE: AWS Terrarium DEM maxzoom is 15 and the engine
 *  uses a single zoom for DEM + imagery, so CFG.GEO.Z is capped at 15.
 *  CFG.GEO MUST mirror tools/fetch_tiles.ps1 / tools/fetch_tiles.mjs.   */
export const CFG = {
  // CAMPUS bbox (PolyU + tunnel / Hung Hom station / coliseum / footbridges).
  GEO:{ minLng:114.173, maxLng:114.187, minLat:22.298, maxLat:22.309, Z:15 }, // == tools/fetch_tiles.*
  TARGET_UNITS: 2000,   // world width of the map (height derived → to scale)
  VEXAG: 1.0,           // flat urban → no vertical exaggeration (1941 used 2.0)
  TERR_SEG: 420,        // terrain mesh resolution
  SSAA: 1.0,            // supersample factor (1.0 keeps the framebuffer light enough for integrated GPUs; antialias MSAA still smooths edges)
  MAX_IMAGERY_TEX: 4096,// cap the composited imagery texture's long side (integrated-GPU memory safety)
  // neutral grade — NOT the 1941 sepia newsreel. A 2019 event must not look like period footage.
  GRADE:{ filter:"none", vignette:0.0, grain:0.0 },
  DAY_MIN: 11, DAY_MAX: 29,   // 11–29 November 2019
  TWEEN: 2.4,            // camera move duration between shots (s)
  ZOOM: 0.5,            // multiplies each shot's camera distance → framing on the action
  FOCUS:{ UNIT_DIM:0.12, PLACE_NEAR:300, PLACE_FAR:950, MAX_PLACES:6 }, // show only the nearest few place names
  FLASH_K: 0.0,         // war VFX off (data.js also avoids 'attack'/'firefight' states)
  // entity scale (tuned to the ~2000-unit metric extent)
  FLAG_H: 30, FLAG_W: 26, FLAG_TH: 16,   // flags are disabled (flags.js); kept so refs still resolve
  RING_IN: 5, RING_OUT: 8, TOKEN_R: 6.5, TOKEN_H: 7, POLE_R: 0.6, FINIAL_R: 1.2,
  LBL_REGION: 80, LBL_PEAK: 44, LBL_TOWN: 34, LBL_FORT: 38, LBL_UNIT: 34,
  EU: 5.0,              // effect spatial unit
  GLOW_PSCALE: 400, SMOKE_PSCALE: 340,
};
// neutral SIDE colours; keys kept jp/uk (+ med) so app.js --jp/--uk and entities FAC.uk.glow still resolve.
// jp = inside (ochre) · uk = police (steel) · med = mediators (grey)
export const FAC = {
  jp:{  main:0xd9a441, glow:0xf0c068, dim:0x7a5a14, css:"#d9a441" },
  uk:{  main:0x5b7fa6, glow:0x86a9cf, dim:0x2c3f55, css:"#5b7fa6" },
  med:{ main:0xb9c0c8, glow:0xe2e7ec, dim:0x5a6068, css:"#b9c0c8" },
};
export const REDUCE_MOTION = !!(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);  // honour the OS "reduce motion" preference → drop the cinematic auto-orbit

/* ---- small math --------------------------------------------------- */
export const clamp=(v,a,b)=>v<a?a:v>b?b:v;
export const lerp=(a,b,t)=>a+(b-a)*t;
export const smooth=(e0,e1,x)=>{ const t=clamp((x-e0)/(e1-e0||1e-6),0,1); return t*t*(3-2*t); };
export const easeIO=t=>t<0.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
export const deg=Math.PI/180;
