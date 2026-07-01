/* =====================================================================
 *  data.js — 理大圍城 2019 · The Siege of PolyU (11–29 November 2019)
 *  ---------------------------------------------------------------------
 *  A fork of keithligh/cinematic-3d-battle-engine (MIT), same engine as
 *  battle-of-hong-kong-1941; NEUTRAL-DOCUMENTARY posture shared with
 *  kyiv2022-3d. The engine modules are never edited — a fork lives entirely
 *  in this file + flags.js + index.html <head> + lib/tiles.
 *
 *  Posture (neutral documentary, not cinematic):
 *    • flat grade (theme.grade.filter="none"), neutral sky
 *    • no faction emblems — flags.js draws plain colour swatches
 *    • no strength bars — every unit cf:false
 *    • no combat VFX — hotspots:[] and unit states limited to
 *      hold | march | retreat | dead (no attack/landing/fire)
 *    • evidence chips (verified / approx / contested) prefix each caption
 *
 *  Sides: 校內人士 inside (ochre) · 警方封鎖線 police (steel) · 調停人員 mediators (grey).
 *  Coordinates are approximate reconstructions from public reporting; the
 *  campus is near-flat, so 3D relief is minimal (meta.vexag pinned).
 *  Every act (0–10) has at least one unit with a 2+ keyframe track (movement rule).
 *  Day axis: d = day-of-month in November (11 … 29) == meta.dayMin/dayMax.
 * ===================================================================== */
window.BATTLE_DATA = (function () {

  const INSIDE = "inside", POLICE = "police", MED = "mediators";

  const factions = {
    inside: { main:0xd9a441, glow:0xf0c469, dim:0x8a6a28, css:"#d9a441",
              name_zh:"校內人士", name_en:"Inside (protesters)",
              role:"defender", maxStrength:1500, defaultFlag:"inside" },
    police: { main:0x5b7fa6, glow:0x84a8cf, dim:0x36506e, css:"#5b7fa6",
              name_zh:"警方封鎖線", name_en:"Police cordon",
              role:"attacker", maxStrength:2000, defaultFlag:"police" },
    mediators:{ main:0xb9c0c8, glow:0xd8dde2, dim:0x7d838a, css:"#b9c0c8",
              name_zh:"調停人員", name_en:"Mediators",
              role:"neutral", maxStrength:200, defaultFlag:"mediators" },
  };

  /* Campus box (Notion 5 · The Build). Safe band (>8% inside each edge):
   * lng [114.172, 114.193] · lat [22.2973, 22.3107] — every coord below fits.  */
  const meta = {
    geo: { minLng:114.170, maxLng:114.195, minLat:22.296, maxLat:22.312, Z:18 },
    dayMin:11, dayMax:29, year:2019, month:11, lastDay:29,
    title:"理大圍城 2019", subtitle:"The Siege of PolyU · 11–29 November 2019",
    vexag:1.5,   // near-flat urban campus — pin so the auto-derive doesn't spike tiny relief
    theme: {
      /* neutral documentary: flat legible satellite, no sepia/grain/vignette wash */
      grade: { filter:"none", vignette:0.12, grain:0, brightness:1.06 },
      sky:   { day:0x9fb4c8, dayB:0xc4d2de, night:0x0d1117, nightB:0x1a2230 },
    },
  };

  /* top-level UI overrides (config.js reads D.ui, not D.meta.ui):
   *  hide the running-time chip, and replace the engine's default EOX disclaimer
   *  with the Esri attribution this fork actually uses. */
  const ui = {
    sceneLabel: false,
    disclaimer: "Present-day satellite imagery — the campus may differ from November 2019.<br>"
      + "Imagery © Esri, Maxar, Earthstar Geographics · illustrative reconstruction, positions approximate",
  };

  const intro = {
    title_zh:"理大圍城 2019", title_en:"The Siege of PolyU",
    sub_zh:"2019年11月11–29日 · 香港理工大學 · 一場校園圍困的紀錄重建。",
    sub_en:"11–29 November 2019 · Hong Kong Polytechnic University · a documentary reconstruction of a campus siege.",
    cam: { lng:114.182, lat:22.304, dist:2400, az:0, el:44, orbit:0.5 },
  };

  const outro = {
    title_zh:"圍城終結", title_en:"End of the Siege",
    narration_zh:"圍城歷時約十三日。約1,300人被捕或自首，約百人經渠道、繩索或車隊離開。事件成為2019年運動最受關注的場面之一。本作為紀錄重建，非倡議；來源見說明面板。",
    narration_en:"The siege lasted about thirteen days. Roughly 1,300 people were arrested or surrendered; about a hundred left via drains, ropes, or vehicle convoys. It became one of the most closely watched episodes of 2019. This is a documentary reconstruction, not advocacy; sources are in the Notes panel.",
    cam: { lng:114.182, lat:22.3035, dist:2700, az:0, el:42, orbit:1.0, tween:3.4 },
  };

  /* plain-swatch legend rows (no national flags) */
  const flagLegend = [
    { flag:"inside",    zh:"校內人士",     en:"Inside (protesters)", faction:"inside" },
    { flag:"police",    zh:"警方封鎖線",   en:"Police cordon",       faction:"police" },
    { flag:"mediators", zh:"調停人員",     en:"Mediators",           faction:"mediators" },
  ];

  /* ---- geography (orientation labels + the police cordon) ------------ */
  const geography = {
    points: [
      { name_zh:"香港理工大學",   name_en:"PolyU",                type:"region", lng:114.1798, lat:22.3042, h:0 },
      { name_zh:"紅磡海底隧道",   name_en:"Cross-Harbour Tunnel", type:"town",   lng:114.1787, lat:22.3019, h:0 },
      { name_zh:"紅磡站",         name_en:"Hung Hom Station",     type:"town",   lng:114.1819, lat:22.3034, h:0 },
      { name_zh:"香港體育館",     name_en:"HK Coliseum",          type:"town",   lng:114.1818, lat:22.3021, h:0 },
      { name_zh:"行人天橋",       name_en:"Footbridge",           type:"fort",   lng:114.1787, lat:22.3029, h:0 },
      { name_zh:"漆咸道南",       name_en:"Chatham Road South",   type:"town",   lng:114.1806, lat:22.3050, h:0 },
    ],
    lines: [
      /* Police cordon ring around the campus (declared a "riot scene" ~18 Nov; the
       * narration carries the timing — the ring itself is drawn throughout for orientation). */
      { name_zh:"警方封鎖線", name_en:"Police cordon", color:"#5b7fa6",
        path:[[114.1778,22.3013],[114.1815,22.3013],[114.1820,22.3050],[114.1782,22.3052],[114.1778,22.3013]] },
    ],
  };

  /* ---- units (all cf:false → no strength bars; kind:command = the water-cannon /
   *  armoured vehicle, distinct diamond glyph; everything else infantry). ---------- */
  const units = [
    /* — INSIDE (校內人士) — */
    { id:"inside_core", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"校內人士（主體）", name_en:"Inside — main body",
      track:[
        { d:11.0, lng:114.1793, lat:22.3034, s:600,  st:"march" },
        { d:11.6, lng:114.1798, lat:22.3042, s:1100, st:"hold"  },
        { d:13.0, lng:114.1798, lat:22.3042, s:1100, st:"hold"  },
        { d:18.0, lng:114.1798, lat:22.3042, s:900,  st:"hold"  },
        { d:20.0, lng:114.1798, lat:22.3042, s:600,  st:"hold"  },
        { d:24.0, lng:114.1798, lat:22.3042, s:300,  st:"hold"  },
        { d:29.0, lng:114.1798, lat:22.3042, s:60,   st:"dead"  },
      ] },
    { id:"inside_blockade", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"封路（紅隧）", name_en:"Tunnel blockade",
      track:[
        { d:11.6, lng:114.1798, lat:22.3042, s:300, st:"march"   },
        { d:12.0, lng:114.1787, lat:22.3021, s:300, st:"hold"    },
        { d:13.0, lng:114.1787, lat:22.3021, s:300, st:"hold"    },
        { d:17.0, lng:114.1799, lat:22.3039, s:200, st:"retreat" },
      ] },
    { id:"inside_perim", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"外圍防線", name_en:"Perimeter line",
      track:[
        { d:14.0, lng:114.1807, lat:22.3047, s:260, st:"hold"    },
        { d:16.0, lng:114.1807, lat:22.3047, s:260, st:"hold"    },
        { d:17.0, lng:114.1799, lat:22.3039, s:200, st:"retreat" },
      ] },
    { id:"inside_consolidate", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"向中心收縮", name_en:"Consolidation",
      track:[
        { d:20.0, lng:114.1804, lat:22.3036, s:220, st:"march" },
        { d:21.5, lng:114.1798, lat:22.3041, s:250, st:"hold"  },
        { d:24.0, lng:114.1798, lat:22.3041, s:200, st:"hold"  },
      ] },
    { id:"inside_escape_rope", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"離開（吊繩）", name_en:"Escape — rope rappel",
      track:[
        { d:18.5, lng:114.1798, lat:22.3042, s:120, st:"march" },
        { d:18.7, lng:114.1787, lat:22.3029, s:100, st:"march" },
        { d:19.0, lng:114.1784, lat:22.3022, s:60,  st:"dead"  },
      ] },
    { id:"inside_escape_drain", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"離開（渠道）", name_en:"Escape — storm drains",
      track:[
        { d:19.1, lng:114.1804, lat:22.3036, s:80, st:"march" },
        { d:19.4, lng:114.1789, lat:22.3017, s:40, st:"dead"  },
      ] },
    { id:"inside_escape_west", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"離開（西面）", name_en:"Escape — west",
      track:[
        { d:19.1, lng:114.1799, lat:22.3039, s:70, st:"march"   },
        { d:19.5, lng:114.1783, lat:22.3031, s:40, st:"retreat" },
      ] },
    { id:"inside_surrender", faction:INSIDE, kind:"infantry", flag:"inside", cf:false,
      name_zh:"自首／離開", name_en:"Surrender flow",
      track:[
        { d:27.0, lng:114.1798, lat:22.3042, s:150, st:"march" },
        { d:28.0, lng:114.1795, lat:22.3030, s:100, st:"march" },
        { d:28.6, lng:114.1811, lat:22.3044, s:60,  st:"dead"  },
      ] },

    /* — POLICE (警方封鎖線) — */
    { id:"police_south", faction:POLICE, kind:"infantry", flag:"police", cf:false,
      name_zh:"警方（南／隧道）", name_en:"Police — south / tunnel",
      track:[
        { d:13.0, lng:114.1806, lat:22.3050, s:400, st:"march" },
        { d:13.5, lng:114.1789, lat:22.3025, s:400, st:"hold"  },
        { d:18.0, lng:114.1789, lat:22.3025, s:500, st:"hold"  },
        { d:28.9, lng:114.1789, lat:22.3025, s:500, st:"hold"  },
        { d:29.0, lng:114.1798, lat:22.3042, s:500, st:"march" },
      ] },
    { id:"police_east", faction:POLICE, kind:"infantry", flag:"police", cf:false,
      name_zh:"警方（東／紅磡站）", name_en:"Police — east / station",
      track:[
        { d:16.0, lng:114.1819, lat:22.3034, s:300, st:"march" },
        { d:17.5, lng:114.1811, lat:22.3044, s:400, st:"hold"  },
        { d:18.0, lng:114.1811, lat:22.3044, s:400, st:"hold"  },
        { d:28.9, lng:114.1811, lat:22.3044, s:400, st:"hold"  },
        { d:29.0, lng:114.1799, lat:22.3039, s:400, st:"march" },
      ] },
    { id:"police_ring", faction:POLICE, kind:"infantry", flag:"police", cf:false,
      name_zh:"警方（封鎖環）", name_en:"Police — cordon ring",
      track:[
        { d:18.0, lng:114.1805, lat:22.3054, s:400, st:"march" },
        { d:18.3, lng:114.1802, lat:22.3049, s:400, st:"hold"  },
        { d:20.0, lng:114.1802, lat:22.3049, s:400, st:"hold"  },
        { d:29.0, lng:114.1802, lat:22.3049, s:400, st:"hold"  },
      ] },
    { id:"police_armor", faction:POLICE, kind:"command", flag:"police", cf:false,
      name_zh:"水炮／裝甲車", name_en:"Water cannon / armour",
      track:[
        { d:17.0, lng:114.1789, lat:22.3025, s:120, st:"hold"  },
        { d:17.5, lng:114.1787, lat:22.3022, s:120, st:"march" },
        { d:18.0, lng:114.1787, lat:22.3022, s:120, st:"hold"  },
        { d:20.0, lng:114.1787, lat:22.3022, s:120, st:"hold"  },
      ] },

    /* — MEDIATORS (調停人員) — */
    { id:"mediators", faction:MED, kind:"infantry", flag:"mediators", cf:false,
      name_zh:"調停人員", name_en:"Mediators",
      track:[
        { d:11.0, lng:114.1806, lat:22.3050, s:30, st:"march"   },
        { d:11.4, lng:114.1793, lat:22.3034, s:30, st:"hold"    },
        { d:21.5, lng:114.1793, lat:22.3034, s:30, st:"march"   },
        { d:22.5, lng:114.1798, lat:22.3041, s:40, st:"hold"    },
        { d:26.0, lng:114.1798, lat:22.3041, s:40, st:"hold"    },
        { d:28.0, lng:114.1795, lat:22.3030, s:30, st:"hold"    },
        { d:29.0, lng:114.1798, lat:22.3041, s:30, st:"hold"    },
        { d:29.5, lng:114.1806, lat:22.3050, s:20, st:"retreat" },
      ] },
  ];

  /* movement is conveyed by the units' own tracks — no separate combat arrows */
  const arrows = [];

  /* neutral posture: no combat VFX emitters */
  const hotspots = [];

  /* weather here only tints daylight/sky — clear late-November days, darker
   * pre-dawn for the 18–19 Nov breakout, night for the final clearance. No rain, no smoke. */
  const weather = [
    { d:11.0, night:0.05, fog:0.10, rain:0, smoke:0, zh:"晴",   en:"Clear"        },
    { d:13.0, night:0.05, fog:0.10, rain:0, smoke:0, zh:"晴",   en:"Clear"        },
    { d:18.0, night:0.20, fog:0.12, rain:0, smoke:0, zh:"凌晨", en:"Before dawn"  },
    { d:19.0, night:0.08, fog:0.10, rain:0, smoke:0, zh:"晴",   en:"Clear"        },
    { d:24.0, night:0.05, fog:0.10, rain:0, smoke:0, zh:"晴",   en:"Clear"        },
    { d:29.0, night:0.55, fog:0.15, rain:0, smoke:0, zh:"入夜", en:"Nightfall"    },
  ];

  /* ---- storyboard: 11 shots (Acts 0–10). Evidence chip prefixes each caption. -- *
   *  Camera dist is box-relative (box normalises to ~2000 units):
   *    ~2200–2400 = wide aerial establisher · ~900–1000 = mid · ~700–800 = tight.  */
  const storyboard = [
    /* 0 — Prologue / Context */
    { day:11.0, hold:9,
      cam:{ lng:114.182, lat:22.304, dist:2300, az:0, el:46, orbit:0.6 },
      dateLabel:"2019年11月", title_zh:"理大圍城 · 序", title_en:"PolyU — Prologue",
      narration_zh:'<span class="evtag verified">已核實</span> 2019年11月，反修例運動已持續數月。香港理工大學位處紅磡，緊鄰紅磡海底隧道，成為抗議運動最後的大型據點之一。',
      narration_en:'<span class="evtag verified">VERIFIED</span> In November 2019, months into the protest movement, Hong Kong Polytechnic University — beside the Cross-Harbour Tunnel in Hung Hom — became one of the last major strongholds.',
      focus:["mediators"], side:"mediators" },

    /* 1 — Occupation begins (11–12 Nov) */
    { day:11.6, hold:9,
      cam:{ lng:114.1798, lat:22.3040, dist:920, az:22, el:54, orbit:0.6 },
      dateLabel:"2019年11月11–12日", title_zh:"佔據校園", title_en:"Occupation begins",
      narration_zh:'<span class="evtag verified">已核實</span> 示威者佔據理大校園，並封堵毗鄰的紅磡海底隧道過海通道，使過海要道癱瘓。',
      narration_en:'<span class="evtag verified">VERIFIED</span> Protesters occupy the PolyU campus and block the approach road to the Hung Hom Cross-Harbour Tunnel, shutting the cross-harbour route.',
      focus:["inside_core","inside_blockade"], side:"inside" },

    /* 2 — Tunnel blockade & first confrontation (13 Nov) */
    { day:13.0, hold:9,
      cam:{ lng:114.1790, lat:22.3026, dist:1000, az:-14, el:52, orbit:0.6 },
      dateLabel:"2019年11月13日", title_zh:"封隧 · 首度對峙", title_en:"Tunnel blockade",
      narration_zh:'<span class="evtag verified">已核實</span> 抗議者以雜物封堵紅磡海底隧道入口，警方在外圍待命，隧道停止通車。',
      narration_en:'<span class="evtag verified">VERIFIED</span> Protesters block the Cross-Harbour Tunnel entrance. Police stage outside; the tunnel closes to traffic.',
      focus:["inside_blockade","police_south"], side:"both" },

    /* 3 — Escalation (14–17 Nov) */
    { day:15.5, hold:9,
      cam:{ lng:114.1802, lat:22.3042, dist:820, az:32, el:56, orbit:0.6 },
      dateLabel:"2019年11月14–17日", title_zh:"衝突升級", title_en:"Escalation",
      narration_zh:'<span class="evtag approx">約略</span> 校園外圍衝突加劇。11月17日警方包圍理大並嘗試清場；一輛裝甲車一度起火，一名警方傳媒聯絡隊員被箭射中。位置由片段部分重建。',
      narration_en:'<span class="evtag approx">APPROX.</span> Confrontations intensify around the perimeter. On 17 November police surround PolyU and move to clear it; an armoured vehicle is briefly set alight and a media-liaison officer is struck by an arrow. Positions are partly reconstructed from video.',
      focus:["inside_perim","police_east","police_armor"], side:"both" },

    /* 4 — Cordon sealed (18 Nov) */
    { day:18.0, hold:9,
      cam:{ lng:114.1800, lat:22.3034, dist:1600, az:8, el:60, orbit:0.6 },
      dateLabel:"2019年11月18日", title_zh:"封鎖出口", title_en:"Cordon sealed",
      narration_zh:'<span class="evtag verified">已核實</span> 警方宣布理大為「暴動現場」，封鎖所有出口。留在校內者被警告可被控暴動，數以百計人士被困。',
      narration_en:'<span class="evtag verified">VERIFIED</span> Police declare PolyU a "riot scene" and seal every exit. Those inside are warned they could be charged with rioting; hundreds are trapped.',
      focus:["police_ring","police_south","inside_core"], side:"both" },

    /* 5 — Escape: rope rappel (18–19 Nov) */
    { day:18.6, hold:9,
      cam:{ lng:114.1789, lat:22.3028, dist:720, az:6, el:60, orbit:0.5 },
      dateLabel:"2019年11月18–19日", title_zh:"吊繩逃離", title_en:"Escape — rope rappel",
      narration_zh:'<span class="evtag verified">已核實</span> 部分人員從行人天橋以繩索滑下，接駁等候的電單車離開；大多數路線於數小時內被封堵。',
      narration_en:'<span class="evtag verified">VERIFIED</span> A group rappels down ropes from the footbridge to waiting motorcycles. Most escape routes are sealed within hours.',
      focus:["inside_escape_rope","police_east"], side:"inside" },

    /* 6 — Escape: sewer & convoy (19 Nov) */
    { day:19.2, hold:9,
      cam:{ lng:114.1793, lat:22.3024, dist:820, az:-8, el:52, orbit:0.6 },
      dateLabel:"2019年11月19日", title_zh:"渠道 · 車隊", title_en:"Escape — drains & convoy",
      narration_zh:'<span class="evtag approx">約略</span> 有人嘗試經排水渠道與車隊離開，大部分被截獲，少數成功。確切路線僅部分重建。',
      narration_en:'<span class="evtag approx">APPROX.</span> Further attempts via storm drains and a vehicle convoy — most intercepted, a few successful. Exact routes are only partly reconstructed.',
      focus:["inside_escape_drain","inside_escape_west","police_south"], side:"both" },

    /* 7 — Standoff: numbers fall (20–24 Nov) */
    { day:21.0, hold:9,
      cam:{ lng:114.1799, lat:22.3041, dist:980, az:18, el:54, orbit:0.6 },
      dateLabel:"2019年11月20–24日", title_zh:"對峙 · 人數下降", title_en:"Standoff",
      narration_zh:'<span class="evtag approx">約略</span> 校內人數由逾千人跌至約百人，食物及醫療物資漸告短缺；餘下人員向校園中心收縮。',
      narration_en:'<span class="evtag approx">APPROX.</span> Numbers inside fall from over a thousand to about a hundred as food and medical supplies run low; those remaining consolidate toward the campus core.',
      focus:["inside_consolidate","inside_core"], side:"inside" },

    /* 8 — Mediation & negotiation (21–26 Nov) */
    { day:22.0, hold:9,
      cam:{ lng:114.1796, lat:22.3038, dist:900, az:12, el:54, orbit:0.6 },
      dateLabel:"2019年11月21–26日", title_zh:"斡旋 · 談判", title_en:"Mediation",
      narration_zh:'<span class="evtag verified">已核實</span> 中學校長、宗教人士與社工在協商下進入校園斡旋；18歲以下者登記資料後獲准離開，不即時拘捕。',
      narration_en:'<span class="evtag verified">VERIFIED</span> School principals, clergy, and social workers enter under negotiated access to help broker exits; those under 18 are allowed to leave after their details are recorded, without immediate arrest.',
      focus:["mediators","inside_core"], side:"mediators" },

    /* 9 — Surrender flow (27–28 Nov) */
    { day:27.5, hold:9,
      cam:{ lng:114.1797, lat:22.3037, dist:820, az:26, el:54, orbit:0.6 },
      dateLabel:"2019年11月27–28日", title_zh:"陸續離開", title_en:"Surrender flow",
      narration_zh:'<span class="evtag verified">已核實</span> 餘下人員陸續自首或在調停下離開校園，警方於封鎖線出口逐一登記處理。',
      narration_en:'<span class="evtag verified">VERIFIED</span> Remaining occupants surrender or leave under mediation. Police process each individual at the cordon exit.',
      focus:["inside_surrender","police_east"], side:"both" },

    /* 10 — Clearance & outro (29 Nov) */
    { day:29.0, hold:11,
      cam:{ lng:114.182, lat:22.3035, dist:2300, az:0, el:44, orbit:0.7 },
      dateLabel:"2019年11月29日", title_zh:"圍城終結", title_en:"End of the Siege",
      narration_zh:'<span class="evtag verified">已核實</span> 警方進入校園搜索，圍城正式結束。事件中前後約1,300人被捕或自首，校園其後關閉數月。',
      narration_en:'<span class="evtag verified">VERIFIED</span> Police enter and search the campus; the siege ends. In all, roughly 1,300 people were arrested or surrendered. The campus stayed closed for months.',
      focus:["police_south","police_east","inside_core"], side:"both" },
  ];

  /* ---- notes (required; sources non-empty) -------------------------- */
  const notes = {
    summary:"理大圍城 2019 — 2019年11月11至29日，香港理工大學被抗議者佔據、遭警方封鎖的紀錄重建。以真實地形與導覽鏡頭呈現據點、封鎖線與逃離路線；持平、註明來源、描述發生了什麼。 · The Siege of PolyU, 11–29 November 2019: a documentary reconstruction of the occupation and police cordon of Hong Kong Polytechnic University, on real terrain with a directed camera — restrained, sourced, describing what happened.",
    caveats:[
      "證據標籤 Evidence tags: 已核實 VERIFIED = 多個獨立來源佐證 · 約略 APPROX. = 廣泛報導但確切位置／時序不確定 · 有爭議 CONTESTED = 具爭議或單一來源。",
      "所有單位位置與路線僅為約略示意重建，非戰術級精確；座標為佔位值。 · All unit positions and routes are approximate illustrative reconstructions, not tactical-level precision.",
      "中立紀錄，不持立場：無國旗或派系徽章，各方以純色色塊表示，不隱含對任何一方行為的判斷。 · Neutral documentary: no flags or faction emblems; each side is a plain colour swatch; no judgment is implied on any party's conduct.",
      "衛星影像為近年素材（Esri World Imagery，次米級），地形接近平坦，以平面海平面為基準，3D 起伏極微。 · Present-day satellite imagery (Esri World Imagery, sub-metre); the campus is near sea level, rendered over a flat baseline, so 3D relief is minimal.",
      "人數讀數已隱去；標記大小不代表精確兵力。 · Strength readouts are suppressed; marker size does not encode precise numbers.",
    ],
    sources:"時序與位置綜合自路透社 Reuters、美聯社 AP、BBC、香港自由新聞 HKFP、南華早報 SCMP（2019年11月）；拘捕數字參考香港警方新聞稿與國際特赦組織報告；學術參考 Yuen, S. & Cheng, E. (2020), 'Hong Kong's Summer of Uprising'。數字與部分細節仍有爭議。 Imagery: Esri World Imagery — © Esri, Maxar, Earthstar Geographics (educational / non-commercial use). Elevation: flat sea-level baseline (the Hung Hom campus is near sea level).",
  };

  return { meta, ui, factions, intro, outro, flagLegend, geography, units, arrows,
           hotspots, weather, storyboard, notes };
})();
