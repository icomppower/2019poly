/* =====================================================================
 *  data.js — 理大圍城 2019 · The Siege of PolyU
 *  Drives the (de-militarised) 1941 cinematic engine. Adapted to the
 *  engine's window.BATTLE_DATA contract:
 *    - units use `faction` (jp=inside · uk=police · med=mediator) and
 *      `name_zh`/`name_en` (the engine reads these, not `side`/`name:{}`);
 *    - track states are limited to hold | march | retreat (no combat VFX);
 *    - the engine REQUIRES fronts / hotspots / weather / intro / outro /
 *      notes keys, so they are present (fronts & hotspots empty on purpose).
 *
 *  Illustrative reconstruction. Coordinates are approximate placeholders
 *  (refine on geojson.io). Day axis 11–29 == CFG.DAY_MIN/MAX.
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  const geography = {
    regions: [
      { name_en:"Hung Hom", name_zh:"紅磡", type:"region", lng:114.180, lat:22.302, h:0 },
    ],
    points: [
      { name_en:"PolyU",                name_zh:"香港理工大學",   type:"fort", lng:114.1797, lat:22.3042, h:20 },
      { name_en:"Cross-Harbour Tunnel", name_zh:"紅磡海底隧道",   type:"town", lng:114.1788, lat:22.3017, h:5 },
      { name_en:"Hung Hom Station",     name_zh:"紅磡站",         type:"town", lng:114.1822, lat:22.3033, h:8 },
      { name_en:"HK Coliseum",          name_zh:"香港體育館",     type:"town", lng:114.1818, lat:22.3019, h:10 },
      { name_en:"Footbridge (abseil)",  name_zh:"天橋（吊繩處）", type:"fort", lng:114.1786, lat:22.3028, h:15 },
    ],
    // The engine renders lines[0] as a single tube; here it is the police
    // cordon (label comes from name_zh/name_en — terrain.js reads them).
    lines: [
      { name_en:"Police cordon", name_zh:"警方封鎖線", side:"uk",
        path:[[114.1776,22.2995],[114.1842,22.2995],[114.1842,22.3060],[114.1776,22.3060],[114.1776,22.2995]] },
    ],
  };

  // faction: jp=inside · uk=police · med=mediator. track state: hold | march | retreat (no combat).
  const units = [
    { id:"inside_main", name_zh:"示威者・學生", name_en:"Protesters & students", faction:"jp",
      track:[ {d:11,lng:114.1797,lat:22.3043,s:1100,st:"hold"}, {d:18,lng:114.1797,lat:22.3043,s:900,st:"hold"},
              {d:22,lng:114.1797,lat:22.3043,s:300,st:"hold"}, {d:29,lng:114.1797,lat:22.3043,s:40,st:"hold"} ] },
    { id:"civilians", name_zh:"市民", name_en:"Civilians", faction:"civ",
      track:[ {d:11,lng:114.1815,lat:22.3030,s:200,st:"hold"}, {d:12,lng:114.1815,lat:22.3030,s:160,st:"hold"},
              {d:13,lng:114.1815,lat:22.3030,s:80,st:"retreat"} ] },   // context only, gone by Act 3
    { id:"firstaid", name_zh:"急救站", name_en:"First-aid station", faction:"aid",
      track:[ {d:12,lng:114.1804,lat:22.3047,s:60,st:"hold"}, {d:25,lng:114.1804,lat:22.3047,s:30,st:"hold"} ] },
    { id:"reporters", name_zh:"記者", name_en:"Reporters", faction:"press",
      track:[ {d:12,lng:114.1790,lat:22.3038,s:50,st:"hold"}, {d:17.2,lng:114.1790,lat:22.3038,s:20,st:"retreat"} ] },
    { id:"police_s", name_zh:"警方防線（南）", name_en:"Police line (S)", faction:"uk",
      track:[ {d:17,lng:114.1797,lat:22.3023,s:600,st:"hold"}, {d:29,lng:114.1797,lat:22.3023,s:600,st:"hold"} ] },
    { id:"police_e", name_zh:"警方防線（東）", name_en:"Police line (E)", faction:"uk",
      track:[ {d:17,lng:114.1817,lat:22.3044,s:500,st:"hold"}, {d:29,lng:114.1817,lat:22.3044,s:500,st:"hold"} ] },
    { id:"watercannon", name_zh:"水炮／裝甲車", name_en:"Water cannon / armour", faction:"uk",
      track:[ {d:17,lng:114.1783,lat:22.3048,s:120,st:"hold"}, {d:20,lng:114.1783,lat:22.3048,s:120,st:"hold"} ] },
    { id:"mediators", name_zh:"調停（校長・議員）", name_en:"Mediators", faction:"med",
      track:[ {d:22,lng:114.1810,lat:22.3037,s:30,st:"hold"}, {d:26,lng:114.1810,lat:22.3037,s:30,st:"hold"} ] },
    { id:"breakout", name_zh:"突圍", name_en:"Breakout attempt", faction:"jp",
      track:[ {d:18,lng:114.1800,lat:22.3038,s:200,st:"march"}, {d:18.4,lng:114.1816,lat:22.3033,s:120,st:"retreat"} ] },
    { id:"escape", name_zh:"離開（吊繩・渠道）", name_en:"Escape (abseil / drains)", faction:"jp",
      track:[ {d:18.5,lng:114.1786,lat:22.3028,s:80,st:"march"}, {d:19,lng:114.1781,lat:22.3016,s:40,st:"retreat"} ] },
  ];

  const arrows = []; // movement is conveyed by the units' own tracks; no separate combat arrows

  const storyboard = [
    { day:11, hold:9, cam:{lng:114.180,lat:22.303,dist:900,az:0,el:48,orbit:0.6},
      dateLabel:"2019年11月", title_zh:"理大圍城・背景", title_en:"PolyU under occupation",
      narration_zh:"2019年11月，反修例運動已持續數月。理大位處紅磡，緊鄰紅磡海底隧道，成為被佔據的校園之一。",
      narration_en:"By November 2019, months into the protests, PolyU — beside the Cross-Harbour Tunnel — had become one of several occupied campuses.",
      focus:["inside_main"], side:"jp" },
    { day:11.5, hold:9, anim:"pulse", cam:{lng:114.1793,lat:22.3025,dist:700,az:20,el:52,orbit:0.6},
      dateLabel:"11月11–16日", title_zh:"築防線・封紅隧", title_en:"Fortify & blockade the tunnel",
      narration_zh:"11月中，示威者在校園築起防線，並封堵毗鄰的紅隧收費廣場，使過海要道癱瘓多日。",
      narration_en:"In mid-November, protesters fortified the campus and blockaded the adjacent tunnel toll plaza, shutting the cross-harbour route for days.",
      focus:["inside_main"], side:"jp" },
    { day:17, hold:9.5, anim:"clash", cam:{lng:114.1798,lat:22.3038,dist:620,az:30,el:58,orbit:0.6},
      dateLabel:"11月17日", title_zh:"警方包圍・外圍衝突", title_en:"Police surround the campus",
      narration_zh:"11月17日，警方包圍理大並嘗試清場。外圍天橋與出入口爆發衝突，警方施放催淚彈、水炮，示威者以汽油彈、磚塊還擊。",
      narration_en:"On 17 November police surrounded PolyU and moved to clear it. Clashes erupted at the footbridges and entrances — tear gas and water cannon met petrol bombs and bricks.",
      focus:["inside_main","police_s","watercannon"], side:"both" },
    { day:17.3, hold:9.5, anim:"clash", cam:{lng:114.1789,lat:22.3030,dist:560,az:14,el:60,orbit:0.5},
      dateLabel:"11月17日", title_zh:"衝突升級", title_en:"Escalation",
      narration_zh:"一輛警方裝甲車一度起火；一名警方傳媒聯絡隊員被箭射中小腿；警方警告若再有致命武器，或會使用實彈。",
      narration_en:"A police armoured vehicle was briefly set alight; a media-liaison officer was struck in the leg by an arrow; police warned live rounds might be used.",
      focus:["watercannon","police_s"], side:"both" },
    { day:17.8, hold:9, anim:"cordon", cam:{lng:114.1800,lat:22.3040,dist:680,az:36,el:55,orbit:0.6},
      dateLabel:"11月17–18日", title_zh:"封鎖出口・數百人被困", title_en:"Cordon sealed; hundreds trapped",
      narration_zh:"警方封鎖所有出口，宣布留在校內者可被控暴動。數以百計示威者、學生、急救員與記者被困。",
      narration_en:"Police sealed every exit and declared that those inside could be charged with rioting. Hundreds — protesters, students, first-aiders and reporters — were trapped.",
      focus:["inside_main","police_e","police_s"], side:"both" },
    { day:18, hold:9, anim:"move", cam:{lng:114.1808,lat:22.3035,dist:600,az:50,el:56,orbit:0.6},
      dateLabel:"11月18日", title_zh:"突圍・多人被捕", title_en:"Breakout attempts",
      narration_zh:"11月18日凌晨，被困者多次嘗試突圍，向紅磡方向衝出，多人被捕；校園出口一度起火。",
      narration_en:"Before dawn on 18 November, those inside made repeated breakout attempts toward Hung Hom; many were arrested, and fires burned at the exits.",
      focus:["breakout","police_e"], side:"both" },
    { day:18.5, hold:9.5, anim:"abseil", cam:{lng:114.1786,lat:22.3024,dist:520,az:8,el:62,orbit:0.5},
      dateLabel:"11月18–19日", title_zh:"吊繩・渠道離開", title_en:"Escape routes",
      narration_zh:"有人從天橋以繩索吊下，登上接應的電單車；亦有人嘗試經渠道與排水管離開。",
      narration_en:"Some abseiled on ropes from a footbridge to motorcycles waiting on the tunnel approach road; others tried the drainage tunnels.",
      focus:["escape"], side:"jp" },
    { day:20, hold:9, anim:"pulse", cam:{lng:114.1799,lat:22.3041,dist:620,az:24,el:55,orbit:0.6},
      dateLabel:"11月19–20日", title_zh:"人道狀況惡化", title_en:"Conditions deteriorate",
      narration_zh:"校內糧食、衞生與醫療物資短缺，急救站與紅十字會照料傷者。",
      narration_en:"Inside, shortages of food, sanitation and medical supplies set in, with first-aid stations and the Red Cross tending the injured.",
      focus:["firstaid","inside_main"], side:"jp" },
    { day:22, hold:9, anim:"fadein", cam:{lng:114.1803,lat:22.3038,dist:640,az:18,el:54,orbit:0.6},
      dateLabel:"11月19–22日", title_zh:"斡旋・未成年者離開", title_en:"Negotiated exits",
      narration_zh:"中學校長、宗教人士、立法會議員與醫護人員介入斡旋；18歲以下者獲准登記資料後離開，不即時拘捕。",
      narration_en:"School principals, clergy, lawmakers and medics helped broker exits; those under 18 were allowed to leave after their details were recorded, without immediate arrest.",
      focus:["mediators","inside_main"], side:"med" },
    { day:29, hold:10, anim:"fadeout", cam:{lng:114.180,lat:22.3032,dist:880,az:6,el:48,orbit:0.6},
      dateLabel:"11月22–29日", title_zh:"落幕・約1,100人被捕", title_en:"Wind-down (~1,100 arrested)",
      narration_zh:"校內人數逐日減少，警方於11月底（約28–29日）進入校園搜索。事件中前後約1,100人被捕或登記。理大圍城成為2019年運動的標誌性場面。",
      narration_en:"Numbers dwindled; police searched the campus around 28-29 November. In all, roughly 1,100 people were arrested or registered. The siege became a defining image of 2019.",
      focus:["inside_main","police_s"], side:"both" },
  ];

  // ---- required-by-engine keys (kept minimal / neutral) -------------------
  const fronts   = [];   // no moving front line (terrain.updateFront tolerates empty)
  const hotspots = [];   // no combat VFX emitters (entities.updateEffects tolerates empty)

  // weather drives only the daylight/sky tone here — clear late-November days,
  // a touch darker before the pre-dawn breakout. No rain, no smoke.
  const weather = [
    { d:11, night:0.05, fog:0.10, rain:0, smoke:0, zh:"晴", en:"Clear" },
    { d:17, night:0.06, fog:0.10, rain:0, smoke:0, zh:"晴", en:"Clear" },
    { d:18, night:0.18, fog:0.12, rain:0, smoke:0, zh:"凌晨", en:"Before dawn" },
    { d:19, night:0.06, fog:0.10, rain:0, smoke:0, zh:"晴", en:"Clear" },
    { d:29, night:0.06, fog:0.10, rain:0, smoke:0, zh:"晴", en:"Clear" },
  ];

  const intro = {
    title_zh:"理大圍城 2019", title_en:"THE SIEGE OF POLYU · 2019",
    narration_zh:"2019年11月11日至29日 · 香港理工大學 · 一場校園圍困",
    narration_en:"11–29 November 2019 · Hong Kong Polytechnic University · a campus under siege",
  };

  const outro = {
    title_zh:"理大圍城・尾聲", title_en:"AFTERMATH",
    narration_zh:"圍城歷時約十三日。事件中前後約1,100人被捕或登記，成為2019年運動最受關注的場面之一。此重建僅作示意，數字與細節仍有爭議。",
    narration_en:"The siege lasted about thirteen days. Around 1,100 people were arrested or registered — one of the most closely watched episodes of 2019. This reconstruction is illustrative; figures and details remain disputed.",
  };

  const caveats = [
    "示意重建 · Illustrative reconstruction — positions, cordon and routes are approximate; coordinates are placeholders (geojson.io).",
    "現今衛星影像與地形 · Present-day imagery and terrain; the campus is near-flat, so 3D relief is minimal.",
    "時序綜合自報導（路透社、美聯社、BBC、HKFP、南華早報）· Timeline from Reuters, AP, BBC, HKFP, SCMP; figures approximate; some details disputed.",
    "底圖 · Imagery: EOX Sentinel-2 cloudless 2016 (CC BY 4.0). Elevation: SRTM/USGS via AWS Terrain Tiles.",
  ];

  const notes = {
    summary: "一段以真實地形與導覽鏡頭重建的紀錄短片，呈現2019年11月香港理工大學的圍困事件。本作為紀錄而非倡議：盡量持平、註明來源、描述發生了什麼。 · An interactive 3D documentary of the November 2019 siege of Hong Kong Polytechnic University, on real terrain with a directed camera. Documentary, not advocacy: restrained, sourced, describing what happened.",
    caveats,
    sources: "路透社 Reuters · 美聯社 AP · BBC · 香港自由新聞 HKFP · 南華早報 SCMP。數字與部分細節仍有爭議。 · Cross-checked across Reuters, AP, BBC, HKFP and SCMP; figures and some details remain disputed.",
  };

  return { geography, units, arrows, storyboard, fronts, hotspots, weather, intro, outro, caveats, notes };
})();
