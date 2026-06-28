(function () {
  'use strict';
  var cv = document.getElementById('seaCanvas');
  if (!cv) return;
  var ctx = cv.getContext('2d');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = matchMedia('(pointer: coarse)').matches;
  var mobile = coarse || Math.min(window.innerWidth, window.innerHeight) < 760;
  var GLOW = mobile ? 0 : 1;
  var cursorLight = document.getElementById('cursorLight');
  var stormFlash = document.getElementById('stormFlash');

  var C = {
    sky0: '#061d23', sky1: '#0a2c33', beacon: '#f0a73a', foam: '#a7cdc8',
    ok: '#86d6ab', cream: '#f2ecdd', land: '#09232a'
  };
  var WSTOPS = [[0, '#11414a'], [480, '#0b2f37'], [1100, '#072028'], [1900, '#03141a'], [3000, '#010a0e'], [4200, '#01070a']];
  function hx(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function mix(c1, c2, t) { var a = hx(c1), b = hx(c2); return 'rgb(' + (lerp(a[0], b[0], t) | 0) + ',' + (lerp(a[1], b[1], t) | 0) + ',' + (lerp(a[2], b[2], t) | 0) + ')'; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(x, a, b) { return x < a ? a : x > b ? b : x; }

  var W = 0, H = 0, dpr = 1, t = 0, scroll = 0;
  var surfaceY = 0, worldH = 0, floorY = 0;
  var lx = 0, peakY = 0;
  var N = 0, hf = null, vf = null;
  var drops = [], splashes = [], creatures = [], clouds = [], stars = [], bolts = [], fog = [];
  var island = [], wall = [], landmass = [], floorPts = [], rocks = [];
  var mx = -9999, my = -9999, mActive = false, flash = 0, nextBolt = 3;

  function depthAt(y) { return y - surfaceY; }
  function waterColor(y) {
    var d = depthAt(y); if (d < 0) return C.sky1;
    for (var i = 0; i < WSTOPS.length - 1; i++) { if (d <= WSTOPS[i + 1][0]) { var f = (d - WSTOPS[i][0]) / (WSTOPS[i + 1][0] - WSTOPS[i][0]); return mix(WSTOPS[i][1], WSTOPS[i + 1][1], f); } }
    return WSTOPS[WSTOPS.length - 1][1];
  }

  function resize() {
    dpr = Math.min(mobile ? 1.5 : 2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var hero = document.querySelector('.hero');
    surfaceY = (hero ? hero.offsetHeight : H) * 0.66;
    worldH = Math.max(document.documentElement.scrollHeight, H * 3);
    floorY = worldH - 30;
    lx = W * 0.82; peakY = surfaceY - 66;
    buildScenery(); initField(); initRain(); initClouds(); initStars(); initFog(); initLife();
  }

  function buildScenery() {
    var halfW = Math.max(116, W * 0.085);
    // above-water rocky island (jagged), peak under the lighthouse
    island = [{ x: lx - halfW, y: surfaceY + 6 }];
    var steps = 10;
    for (var i = 0; i <= steps; i++) { var tt = i / steps, x = lx - halfW + tt * halfW * 2; var rise = Math.pow(Math.sin(tt * Math.PI), 0.8) * (surfaceY - peakY); var jag = (Math.random() - 0.5) * 16 * Math.sin(tt * Math.PI); island.push({ x: x, y: surfaceY + 6 - rise + jag }); }
    island.push({ x: lx + halfW, y: surfaceY + 6 });
    // small foreground rocks to nestle the tower base
    rocks = [{ x: lx - halfW * 0.5, y: peakY + 30, r: 26 }, { x: lx + halfW * 0.55, y: peakY + 26, r: 30 }, { x: lx - halfW * 0.15, y: peakY + 40, r: 20 }];
    // underwater rock pillar beneath, tapering into murk
    wall = [{ x: lx - halfW, y: surfaceY }, { x: lx + halfW, y: surfaceY }];
    var wd = 1500;
    for (var j = 1; j <= 6; j++) { var d = j / 6, tap = halfW * (1 - d * 0.7); wall.push({ x: lx + tap + Math.sin(j) * 12, y: surfaceY + d * wd }); }
    for (var k = 6; k >= 1; k--) { var d2 = k / 6, tap2 = halfW * (1 - d2 * 0.7); wall.push({ x: lx - tap2 - Math.cos(k) * 12, y: surfaceY + d2 * wd }); }
    // distant shore on the horizon (low, anchored to the waterline)
    landmass = []; var segs = 16;
    for (var m = 0; m <= segs; m++) { var mxp = (m / segs) * W; var hh = 14 + Math.sin(m * 0.6) * 10 + Math.sin(m * 1.7) * 6 + (m > segs * 0.6 ? 10 : 0); landmass.push({ x: mxp, y: surfaceY - hh }); }
    // seafloor
    floorPts = []; var fsegs = 12;
    for (var n = 0; n <= fsegs; n++) { var fx = (n / fsegs) * W; var fh = 30 + Math.sin(n * 0.8) * 22 + Math.sin(n * 2.3) * 10; floorPts.push({ x: fx, y: floorY - fh }); }
  }

  function initField() { N = Math.max(64, Math.floor(W / 11)); hf = new Float32Array(N); vf = new Float32Array(N); }
  function idxAt(x) { var i = Math.round(x / (W / (N - 1))); return i < 0 ? 0 : i > N - 1 ? N - 1 : i; }
  function splash(x, p) { var i = idxAt(x); vf[i] -= p; if (i > 0) vf[i - 1] -= p * 0.5; if (i < N - 1) vf[i + 1] -= p * 0.5; splashes.push({ x: x, r: 1, a: 0.35 }); }
  function stepField() { var k = 0.014, damp = 0.97, spread = 0.10, i; for (i = 0; i < N; i++) { vf[i] += -k * hf[i]; vf[i] *= damp; } for (i = 0; i < N; i++) { var l = i > 0 ? hf[i - 1] : hf[i], r = i < N - 1 ? hf[i + 1] : hf[i]; vf[i] += spread * ((l + r) * 0.5 - hf[i]); } for (i = 0; i < N; i++) hf[i] += vf[i]; }
  function surfacePageY(x) { var swell = Math.sin(x * 0.006 + t * 0.28) * 0.5 + Math.sin(x * 0.013 - t * 0.4) * 0.28; var fx = x / (W / (N - 1)), i = Math.floor(fx); if (i < 0) i = 0; if (i > N - 2) i = N - 2; var f = fx - i, disp = hf[i] * (1 - f) + hf[i + 1] * f; return surfaceY + swell + disp; }

  function initRain() { drops.length = 0; var n = reduce ? 0 : Math.min(mobile ? 90 : 360, Math.floor(W / (mobile ? 8 : 3.1))); for (var i = 0; i < n; i++) drops.push(mkDrop(true)); }
  function mkDrop(any) { var z = Math.random(); return { x: rand(-60, W), y: any ? rand(-H, surfaceY) : rand(-90, -10), z: z, sp: 9 + z * 12 }; }
  function initClouds() { clouds.length = 0; var n = reduce ? 3 : 6; for (var i = 0; i < n; i++) clouds.push({ x: rand(0, W), y: rand(18, surfaceY * 0.4), s: rand(1.1, 2.0), sp: rand(5, 13) }); }
  function initStars() { stars.length = 0; for (var i = 0; i < 16; i++) stars.push({ x: rand(0, W), y: rand(0, surfaceY * 0.42), r: rand(0.5, 1.3), p: rand(0, 6.28) }); }
  function initFog() { fog.length = 0; if (reduce) return; var sN = mobile ? 3 : 5; for (var i = 0; i < sN; i++) fog.push({ y: surfaceY + 16 + i * 36 + rand(-12, 12), ph: rand(0, 6.28), a: rand(0.05, 0.11), deep: false }); }

  function initLife() {
    creatures.length = 0; if (reduce) return; var floorD = floorY - surfaceY;
    spawn(5, function () { return mk('school', rand(60, 660)); });
    spawn(8, function () { return mk('mackerel', rand(60, 680)); });
    spawn(7, function () { return mk('lantern', rand(620, 1500)); });
    spawn(5, function () { return mk('hatchet', rand(700, 1500)); });
    spawn(3, function () { return mk('squid', rand(650, 1500)); });
    spawn(5, function () { return mk('jelly', rand(500, 1700), true); });
    spawn(4, function () { return mk('angler', rand(1500, Math.max(1700, floorD - 200))); });
    spawn(3, function () { return mk('viper', rand(1500, Math.max(1700, floorD - 200))); });
    spawn(2, function () { return mk('gulper', rand(1700, Math.max(1900, floorD - 150))); });
    spawn(5, function () { return mk('jelly', rand(1600, Math.max(1800, floorD - 100)), true); });
    creatures.push(mk('giantsquid', clamp(floorD - 600, 1800, floorD)));
    spawn(4, function () { return mkFloor('rattail'); });
    spawn(5, function () { return mkFloor('isopod'); });
    spawn(70, function () { return mk('snow', rand(900, floorD)); });
    creatures.sort(function (a, b) { return a.y - b.y; });
  }
  function spawn(n, f) { var m = mobile ? Math.max(1, Math.round(n * 0.4)) : n; for (var i = 0; i < m; i++) creatures.push(f()); }
  function mk(kind, depth, glow) { return { k: kind, x: rand(0, W), y: surfaceY + depth, home: surfaceY + depth, s: rand(0.75, 1.4), dir: Math.random() < 0.5 ? 1 : -1, sp: rand(8, 30), ph: rand(0, 6.28), amp: rand(10, 34), glow: !!glow, cd: 0, hue: Math.random() < 0.5 ? C.ok : C.foam }; }
  function mkFloor(kind) { var o = mk(kind, floorY - surfaceY - rand(4, 16)); o.sp = rand(4, 12); o.floor = true; return o; }

  function onMove(e) { if (coarse) return;
    var x = e.clientX, y = e.clientY;
    if (x >= 0 && y >= 0 && x <= W && y <= H) { mx = x; my = y; mActive = true; if (cursorLight) { cursorLight.style.setProperty('--mx', x + 'px'); cursorLight.style.setProperty('--my', y + 'px'); cursorLight.style.opacity = '1'; } }
    else { mActive = false; if (cursorLight) cursorLight.style.opacity = '0'; }
  }
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerdown', function (e) { if (e.clientY < surfacePageY(e.clientX) - scroll) return; splash(e.clientX, 2); });
  window.addEventListener('scroll', function () { scroll = window.scrollY || window.pageYOffset || 0; }, { passive: true });
  window.addEventListener('resize', resize);

  function swim(o, sy, dt, vbob) {
    var scared = 0;
    if (mActive && !o.floor) { var dx = o.x - mx, dy = sy - my, dd = Math.hypot(dx, dy), R = 90; if (dd < R) { var f = (R - dd) / R; o.x += (dx / (dd || 1)) * f * 1.4; scared = 1; } }
    if (flash > 0.5 && !o.floor) { o.x += (Math.random() - 0.5) * 5; scared = 1; }
    o.cd -= dt; o.x += o.dir * o.sp * (scared ? 1.7 : 1) * dt;
    if (o.x > W - 18 && o.cd <= 0) { o.dir = -1; o.cd = 2.2; } else if (o.x < 18 && o.cd <= 0) { o.dir = 1; o.cd = 2.2; }
    o.x = clamp(o.x, -40, W + 40);
    if (vbob && !o.floor) o.y = o.home + Math.sin(t * 0.5 + o.ph) * o.amp;
    return scared;
  }

  function dMackerel(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.5; ctx.fillStyle = C.foam; ctx.beginPath(); ctx.ellipse(0, 0, 12, 5, 0, 0, 6.2832); ctx.fill(); var tw = Math.sin(t * 8 + o.ph) * 2.2; ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(-18, -5 + tw); ctx.lineTo(-18, 5 + tw); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  function dSchool(o, sx, sy) { ctx.save(); ctx.globalAlpha = 0.45; ctx.fillStyle = C.foam; for (var i = 0; i < 6; i++) { var ox = Math.cos(i * 1.7 + o.ph) * 14 * o.s, oy = Math.sin(i * 2.1 + o.ph) * 9 * o.s; ctx.save(); ctx.translate(sx + ox, sy + oy); ctx.scale(o.dir * 0.5 * o.s, 0.5 * o.s); ctx.beginPath(); ctx.ellipse(0, 0, 9, 4, 0, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(-7, 0); ctx.lineTo(-13, -4); ctx.lineTo(-13, 4); ctx.closePath(); ctx.fill(); ctx.restore(); } ctx.restore(); ctx.globalAlpha = 1; }
  function dLantern(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.fillStyle = '#0c2a30'; ctx.globalAlpha = 0.9; ctx.beginPath(); ctx.ellipse(0, 0, 11, 4.5, 0, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(-9, 0); ctx.lineTo(-16, -4); ctx.lineTo(-16, 4); ctx.closePath(); ctx.fill(); ctx.shadowColor = C.ok; ctx.shadowBlur = GLOW * 6; ctx.fillStyle = C.ok; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 2.6, 3.4, 0.9, 0, 6.2832); ctx.fill(); } ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  function dHatchet(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.fillStyle = '#9fb2b0'; ctx.globalAlpha = 0.6; ctx.beginPath(); ctx.moveTo(-4, -10); ctx.quadraticCurveTo(10, -8, 8, 2); ctx.quadraticCurveTo(6, 10, -4, 9); ctx.quadraticCurveTo(-12, 4, -10, -3); ctx.closePath(); ctx.fill(); ctx.shadowColor = C.foam; ctx.shadowBlur = GLOW * 6; ctx.fillStyle = C.foam; for (var i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 3, 9, 0.9, 0, 6.2832); ctx.fill(); } ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  function dSquid(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.5; ctx.fillStyle = '#5e6f74'; ctx.beginPath(); ctx.moveTo(0, -14); ctx.quadraticCurveTo(8, -6, 6, 4); ctx.quadraticCurveTo(0, 8, -6, 4); ctx.quadraticCurveTo(-8, -6, 0, -14); ctx.closePath(); ctx.fill(); ctx.lineWidth = 1.4; ctx.strokeStyle = '#5e6f74'; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 1.8, 5); ctx.quadraticCurveTo(i * 1.8 + Math.sin(t * 4 + i) * 3, 16, i * 2 + Math.sin(t * 3 + i) * 4, 26); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
  function dJelly(o, sx, sy) { var pulse = 1 + Math.sin(t * 2 + o.ph) * 0.16; ctx.save(); ctx.translate(sx + Math.sin(t * 0.4 + o.ph) * 10, sy); ctx.scale(o.s * pulse, o.s); if (o.glow) { ctx.shadowColor = C.foam; ctx.shadowBlur = GLOW * 16; } ctx.globalAlpha = o.glow ? 0.5 : 0.3; ctx.fillStyle = C.foam; ctx.beginPath(); ctx.ellipse(0, 0, 13, 11, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-13, 0, 26, 4); ctx.globalAlpha = o.glow ? 0.4 : 0.2; ctx.lineWidth = 1.4; ctx.strokeStyle = C.foam; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 3.2, 3); ctx.quadraticCurveTo(i * 3.2 + Math.sin(t * 3 + i) * 3, 16, i * 3.2 + Math.sin(t * 2 + i) * 4, 28); ctx.stroke(); } ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  function dAngler(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); var lurX = 22, lurY = -15, gl = ctx.createRadialGradient(lurX, lurY, 0, lurX, lurY, 15); gl.addColorStop(0, 'rgba(134,214,171,.95)'); gl.addColorStop(1, 'rgba(134,214,171,0)'); ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(lurX, lurY, 15, 0, 6.2832); ctx.fill(); ctx.strokeStyle = 'rgba(167,205,200,.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(6, -3); ctx.quadraticCurveTo(18, -17, lurX, lurY); ctx.stroke(); ctx.fillStyle = '#0a2227'; ctx.globalAlpha = 0.92; ctx.beginPath(); ctx.ellipse(0, 0, 16, 12, 0, 0, 6.2832); ctx.fill(); ctx.beginPath(); ctx.moveTo(-14, 0); ctx.lineTo(-26, -9); ctx.lineTo(-26, 9); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.cream; ctx.globalAlpha = 0.8; for (var i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(1 + i * 3, 9); ctx.lineTo(3 + i * 3, 3); ctx.lineTo(5 + i * 3, 9); ctx.closePath(); ctx.fill(); } ctx.fillStyle = C.ok; ctx.beginPath(); ctx.arc(7, -4, 1.8, 0, 6.2832); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  function dViper(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.9; ctx.fillStyle = '#0a2227'; ctx.beginPath(); ctx.moveTo(18, 0); ctx.quadraticCurveTo(6, -7, -6, -3); ctx.quadraticCurveTo(-26, -2, -34, 0); ctx.quadraticCurveTo(-26, 2, -6, 3); ctx.quadraticCurveTo(6, 7, 18, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.cream; ctx.globalAlpha = 0.85; ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(10, 7); ctx.lineTo(12, 1); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(10, -7); ctx.lineTo(12, -1); ctx.closePath(); ctx.fill(); ctx.shadowColor = C.ok; ctx.shadowBlur = GLOW * 5; ctx.fillStyle = C.ok; for (var i = -5; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 4, 3, 0.8, 0, 6.2832); ctx.fill(); } ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  function dGulper(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.9; ctx.fillStyle = '#08201f'; ctx.beginPath(); ctx.moveTo(20, -10); ctx.quadraticCurveTo(22, 2, 6, 6); ctx.quadraticCurveTo(-30, 4, -52, 1); ctx.quadraticCurveTo(-30, -2, 4, -4); ctx.quadraticCurveTo(16, -6, 20, -10); ctx.closePath(); ctx.fill(); ctx.shadowColor = C.ok; ctx.shadowBlur = GLOW * 6; ctx.fillStyle = C.ok; ctx.beginPath(); ctx.arc(-52, 1, 1.6, 0, 6.2832); ctx.fill(); ctx.restore(); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
  function dGiantSquid(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * 1.6, 1.6); ctx.globalAlpha = 0.22; ctx.fillStyle = '#05171c'; ctx.beginPath(); ctx.moveTo(0, -34); ctx.quadraticCurveTo(16, -12, 12, 6); ctx.quadraticCurveTo(0, 12, -12, 6); ctx.quadraticCurveTo(-16, -12, 0, -34); ctx.closePath(); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#05171c'; for (var i = -4; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * 2.4, 8); ctx.quadraticCurveTo(i * 5 + Math.sin(t * 1.5 + i) * 8, 40, i * 7 + Math.sin(t + i) * 12, 78); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
  function dRattail(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.55; ctx.fillStyle = '#243b3e'; ctx.beginPath(); ctx.moveTo(12, 0); ctx.quadraticCurveTo(2, -6, -8, -3); ctx.quadraticCurveTo(-34, -1, -46, 0); ctx.quadraticCurveTo(-34, 1, -8, 3); ctx.quadraticCurveTo(2, 6, 12, 0); ctx.closePath(); ctx.fill(); ctx.fillStyle = C.foam; ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(7, -1, 1.3, 0, 6.2832); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  function dIsopod(o, sx, sy) { ctx.save(); ctx.translate(sx, sy); ctx.scale(o.dir * o.s, o.s); ctx.globalAlpha = 0.6; ctx.fillStyle = '#3a4b46'; ctx.beginPath(); ctx.ellipse(0, 0, 9, 5, 0, 0, 6.2832); ctx.fill(); ctx.strokeStyle = '#28332f'; ctx.lineWidth = 0.8; for (var i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 2, -4); ctx.lineTo(i * 2, 4); ctx.stroke(); } ctx.restore(); ctx.globalAlpha = 1; }
  function dSnow(o, sx, sy) { var a = 0.22 + Math.abs(Math.sin(t * 1.1 + o.ph)) * 0.4; ctx.globalAlpha = a; ctx.fillStyle = o.hue; ctx.beginPath(); ctx.arc(sx, sy, o.s * 1.1, 0, 6.2832); ctx.fill(); ctx.globalAlpha = 1; }

  function drawCreature(o, sy, dt) {
    var k = o.k;
    if (k === 'snow') { o.y -= 4 * dt; if (o.y < surfaceY + 600) o.y = floorY; o.x += Math.sin(t + o.ph) * 0.2; dSnow(o, o.x, sy); return; }
    if (k === 'giantsquid') { swim(o, sy, dt, true); dGiantSquid(o, o.x, sy); return; }
    swim(o, sy, dt, k !== 'school');
    if (k === 'school') { o.y = o.home + Math.sin(t * 0.5 + o.ph) * o.amp; dSchool(o, o.x, sy); }
    else if (k === 'mackerel') dMackerel(o, o.x, sy);
    else if (k === 'lantern') dLantern(o, o.x, sy);
    else if (k === 'hatchet') dHatchet(o, o.x, sy);
    else if (k === 'squid') dSquid(o, o.x, sy);
    else if (k === 'jelly') dJelly(o, o.x, sy);
    else if (k === 'angler') dAngler(o, o.x, sy);
    else if (k === 'viper') dViper(o, o.x, sy);
    else if (k === 'gulper') dGulper(o, o.x, sy);
    else if (k === 'rattail') dRattail(o, o.x, sy);
    else if (k === 'isopod') dIsopod(o, o.x, sy);
  }

  function drawLandmass(off) {
    var oy = off * 0.12;
    ctx.save(); ctx.beginPath(); ctx.moveTo(landmass[0].x, landmass[0].y - oy); for (var i = 1; i < landmass.length; i++) ctx.lineTo(landmass[i].x, landmass[i].y - oy); ctx.lineTo(W, surfaceY - oy + 4); ctx.lineTo(0, surfaceY - oy + 4); ctx.closePath();
    ctx.fillStyle = C.land; ctx.globalAlpha = 0.92; ctx.fill();
    ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    var g = ctx.createLinearGradient(lx, 0, lx - W * 0.7, 0); g.addColorStop(0, 'rgba(240,167,58,' + (0.05 + flash * 0.4) + ')'); g.addColorStop(1, 'rgba(240,167,58,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    if (flash > 0.01) { ctx.fillStyle = 'rgba(150,190,210,' + flash * 0.35 + ')'; ctx.fillRect(0, 0, W, H); }
    ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawIslandRock(off) { ctx.save(); ctx.beginPath(); var w0 = wall[0]; ctx.moveTo(w0.x, w0.y - off); for (var i = 1; i < wall.length; i++) ctx.lineTo(wall[i].x, wall[i].y - off); ctx.closePath(); ctx.fillStyle = '#06181d'; ctx.globalAlpha = 0.92; ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
  function drawIslandTop(off) {
    ctx.save(); ctx.beginPath(); ctx.moveTo(island[0].x, island[0].y - off); for (var i = 1; i < island.length; i++) ctx.lineTo(island[i].x, island[i].y - off); ctx.closePath();
    var g = ctx.createLinearGradient(0, peakY - off, 0, surfaceY - off + 10); g.addColorStop(0, '#16323a'); g.addColorStop(1, '#0a2228'); ctx.fillStyle = g; ctx.fill();
    ctx.clip(); ctx.globalCompositeOperation = 'lighter'; var lg = ctx.createRadialGradient(lx, peakY - off, 0, lx, peakY - off, 170); lg.addColorStop(0, 'rgba(240,167,58,' + (0.16 + flash * 0.5) + ')'); lg.addColorStop(1, 'rgba(240,167,58,0)'); ctx.fillStyle = lg; ctx.fillRect(0, 0, W, H); if (flash > 0.01) { ctx.fillStyle = 'rgba(150,190,210,' + flash * 0.35 + ')'; ctx.fillRect(0, 0, W, H); } ctx.restore(); ctx.globalAlpha = 1;
  }
  function drawBaseRocks(off) { for (var i = 0; i < rocks.length; i++) { var r = rocks[i], y = r.y - off; ctx.save(); ctx.beginPath(); ctx.moveTo(r.x - r.r, y + r.r * 0.5); ctx.quadraticCurveTo(r.x - r.r * 0.6, y - r.r * 0.7, r.x, y - r.r * 0.5); ctx.quadraticCurveTo(r.x + r.r * 0.7, y - r.r * 0.6, r.x + r.r, y + r.r * 0.5); ctx.closePath(); var g = ctx.createLinearGradient(0, y - r.r, 0, y + r.r); g.addColorStop(0, '#143038'); g.addColorStop(1, '#081e24'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); } }
  function drawLighthouse(off) {
    var baseY = peakY - off + 12, topY = baseY - 100, botY = baseY;   // base embedded into the rock
    var topW = 14, botW = 24;
    function tX(yy, sgn) { var f = (yy - topY) / (botY - topY); return lx + sgn * (topW + (botW - topW) * f); }
    var g = ctx.createLinearGradient(lx - botW, 0, lx + botW, 0); g.addColorStop(0, '#cdd8d4'); g.addColorStop(0.5, C.cream); g.addColorStop(1, '#aab8b4');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(tX(topY, -1), topY); ctx.lineTo(tX(botY, -1), botY); ctx.lineTo(tX(botY, 1), botY); ctx.lineTo(tX(topY, 1), topY); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#c2503a'; for (var s = 0; s < 3; s++) { var y0 = topY + (botY - topY) * (0.16 + s * 0.3), y1 = y0 + (botY - topY) * 0.12; ctx.beginPath(); ctx.moveTo(tX(y0, -1), y0); ctx.lineTo(tX(y1, -1), y1); ctx.lineTo(tX(y1, 1), y1); ctx.lineTo(tX(y0, 1), y0); ctx.closePath(); ctx.fill(); }
    ctx.fillStyle = '#10353c'; ctx.fillRect(lx - 19, topY - 6, 38, 8);
    ctx.fillStyle = '#0c2a30'; ctx.fillRect(lx - 13, topY - 22, 26, 18);
    var lgl = ctx.createRadialGradient(lx, topY - 14, 0, lx, topY - 14, 58); lgl.addColorStop(0, 'rgba(255,212,140,1)'); lgl.addColorStop(0.5, 'rgba(240,167,58,.5)'); lgl.addColorStop(1, 'rgba(240,167,58,0)'); ctx.fillStyle = lgl; ctx.beginPath(); ctx.arc(lx, topY - 14, 58, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#ffe6b0'; ctx.beginPath(); ctx.arc(lx, topY - 14, 4.6, 0, 6.2832); ctx.fill();
    ctx.fillStyle = '#0c2a30'; ctx.beginPath(); ctx.moveTo(lx - 13, topY - 22); ctx.lineTo(lx, topY - 37); ctx.lineTo(lx + 13, topY - 22); ctx.closePath(); ctx.fill();
    // (base-rock blobs removed - caused a shadow artifact at the tower base)
  }
  function beamDir() { return -2.0 + Math.sin(t * 0.4) * 0.5; }
  function drawBeam(off) { var ang = beamDir(), spread = 0.17, len = W, oy = peakY - 110 - off; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(lx, oy); var g = ctx.createLinearGradient(0, 0, Math.cos(ang) * len, Math.sin(ang) * len); g.addColorStop(0, 'rgba(245,182,84,.46)'); g.addColorStop(0.5, 'rgba(240,167,58,.14)'); g.addColorStop(1, 'rgba(240,167,58,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(ang - spread) * len, Math.sin(ang - spread) * len); ctx.lineTo(Math.cos(ang + spread) * len, Math.sin(ang + spread) * len); ctx.closePath(); ctx.fill(); ctx.restore(); }
  function drawFerry(off) {
    var fxp = W * 0.34, bob = Math.sin(t * 0.5) * 1.8, sy = surfaceY - off - 19 + bob, sc = 1.7, tilt = Math.sin(t * 0.5 + 0.6) * 0.028;
    ctx.save(); ctx.translate(fxp, sy); ctx.rotate(tilt); ctx.scale(sc, sc);
    ctx.fillStyle = C.cream; ctx.beginPath(); ctx.moveTo(-46, 0); ctx.lineTo(46, 0); ctx.lineTo(36, 15); ctx.lineTo(-36, 15); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#e7dec9'; ctx.fillRect(-34, -15, 64, 15);
    var cols = [C.beacon, C.foam, C.beacon, C.foam, C.beacon]; for (var i = 0; i < 5; i++) { ctx.fillStyle = cols[i]; ctx.fillRect(-30 + i * 13, -11, 10, 10); }
    ctx.fillStyle = '#123e45'; ctx.fillRect(-32, -26, 7, 12);
    ctx.fillStyle = C.beacon; ctx.beginPath(); ctx.arc(28, -19, 2.4, 0, 6.2832); ctx.fill(); ctx.restore();
  }
  function drawSeafloor(off) { ctx.save(); ctx.beginPath(); ctx.moveTo(floorPts[0].x, floorPts[0].y - off); for (var i = 1; i < floorPts.length; i++) ctx.lineTo(floorPts[i].x, floorPts[i].y - off); ctx.lineTo(W, H + 40); ctx.lineTo(0, H + 40); ctx.closePath(); var g = ctx.createLinearGradient(0, floorY - 60 - off, 0, floorY - off); g.addColorStop(0, '#06141a'); g.addColorStop(1, '#020a0e'); ctx.fillStyle = g; ctx.fill(); ctx.restore(); }
  function drawClouds(off) {
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i]; c.x += c.sp * 0.016; if (c.x > W + 160) c.x = -160; var y = c.y - off * 0.35;
      ctx.save(); ctx.globalAlpha = 0.85;
      for (var b = 0; b < 5; b++) {
        var bx = c.x + (b - 2) * 40 * c.s, by = y + Math.sin(b * 1.3) * 10, br = (34 + (b % 2) * 18) * c.s;
        var top = flash > 0.3 ? '#5a6e76' : '#36474f', bot = flash > 0.3 ? '#3f5258' : '#26343b';
        var g = ctx.createRadialGradient(bx, by - br * 0.3, 0, bx, by, br); g.addColorStop(0, top); g.addColorStop(0.6, bot); g.addColorStop(1, 'rgba(30,44,50,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(bx, by, br, 0, 6.2832); ctx.fill();
      }
      ctx.restore();
    }
  }
  function drawFog(off) {
    for (var i = 0; i < fog.length; i++) {
      var fo = fog[i], sy = fo.y - off * (fo.deep ? 1 : 0.85) + Math.sin(t * 0.2 + fo.ph) * 8;
      if (sy < -90 || sy > H + 90) continue;
      var hh = fo.deep ? 80 : 54, col = fo.deep ? '4,16,20' : '150,178,184', a = fo.a * (fo.deep ? 1 : (flash > 0.2 ? 1.8 : 1));
      var g = ctx.createLinearGradient(0, sy - hh, 0, sy + hh); g.addColorStop(0, 'rgba(' + col + ',0)'); g.addColorStop(0.5, 'rgba(' + col + ',' + a + ')'); g.addColorStop(1, 'rgba(' + col + ',0)');
      ctx.fillStyle = g; ctx.fillRect(0, sy - hh, W, hh * 2);
    }
  }
  function fireBolt() { var c = clouds[(Math.random() * clouds.length) | 0] || { x: rand(0, W), y: 40 }; var pts = [{ x: c.x, y: c.y }], x = c.x, y = c.y, endY = surfaceY - 10; while (y < endY) { y += rand(20, 46); x += rand(-32, 32); pts.push({ x: x, y: y }); } bolts.push({ pts: pts, a: 1 }); flash = 1; }

  var last = performance.now(), lastDraw = 0;
  function frame(now) {
    if (mobile && now - lastDraw < 33) { requestAnimationFrame(frame); return; }
    lastDraw = now;
    var dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
    var off = scroll, surfScreen = surfaceY - off, i, x;

    if (!reduce && !mobile) { nextBolt -= dt; if (nextBolt <= 0) { fireBolt(); nextBolt = rand(7, 16); } }
    if (flash > 0) flash = Math.max(0, flash - dt * 2.6);
    if (stormFlash) stormFlash.style.opacity = (flash * 0.22).toFixed(3);

    var topC = waterColor(off), botC = waterColor(off + H), bg = ctx.createLinearGradient(0, 0, 0, H);
    if (surfScreen > 0) { var sp = clamp(surfScreen / H, 0, 1); bg.addColorStop(0, C.sky0); bg.addColorStop(sp, C.sky1); bg.addColorStop(Math.min(1, sp + 0.001), waterColor(off + surfScreen + 1)); bg.addColorStop(1, botC); }
    else { bg.addColorStop(0, topC); bg.addColorStop(1, botC); }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    if (surfScreen > -60) {
      var skyA = clamp(surfScreen / 120, 0, 1);
      for (i = 0; i < stars.length; i++) { var stt = stars[i]; ctx.globalAlpha = (0.2 + Math.abs(Math.sin(t * 0.8 + stt.p)) * 0.5) * skyA; ctx.fillStyle = '#cfe2de'; ctx.beginPath(); ctx.arc(stt.x, stt.y - off, stt.r, 0, 6.2832); ctx.fill(); }
      ctx.globalAlpha = 1;
      drawLandmass(off); drawClouds(off); drawBeam(off);
      if (!reduce) {
        var R = 54;
        for (i = 0; i < drops.length; i++) {
          var d = drops[i]; d.y += d.sp; d.x += 1.2; var tw2 = surfacePageY(d.x);
          if (d.y >= tw2) { splash(d.x, 0.4 + d.z * 0.25); drops[i] = mkDrop(false); continue; }
          var rx = d.x, ry = d.y, lit = 0.34 + d.z * 0.34 + flash * 0.4;
          if (mActive) { var syy = d.y - off, ax = d.x - mx, ay = syy - my, dist = Math.hypot(ax, ay); if (dist < R) { var pw = (R - dist) / R; pw *= pw; rx += (ax >= 0 ? 1 : -1) * pw * 36; ry += (ay / (dist || 1)) * pw * 6; lit += (1 - dist / R) * 0.4; } }
          ctx.strokeStyle = 'rgba(208,224,232,' + Math.min(0.95, lit) + ')'; ctx.lineWidth = 1 + d.z * 0.5; ctx.beginPath(); ctx.moveTo(rx, ry - off); ctx.lineTo(rx - 1.4, ry - off - (9 + d.z * 11)); ctx.stroke();
        }
      }
    }

    if (mActive && Math.abs((my + off) - surfacePageY(mx)) < 36) vf[idxAt(mx)] -= 0.18;
    stepField();

    // (underwater rock pillar removed - showed as a dark column below the waterline)

    ctx.save();
    if (surfScreen > -20 && surfScreen < H + 20) { ctx.beginPath(); ctx.moveTo(0, surfacePageY(0) - off); for (x = 0; x <= W; x += 6) ctx.lineTo(x, surfacePageY(x) - off); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); var sea = ctx.createLinearGradient(0, Math.max(0, surfScreen), 0, H); sea.addColorStop(0, waterColor(Math.max(off, surfaceY) + 1)); sea.addColorStop(1, botC); ctx.fillStyle = sea; ctx.fill(); ctx.clip(); }
    else { ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip(); }

    var rayA = clamp(1 - off / 700, 0, 1) * 0.06;
    if (rayA > 0.01) { ctx.globalCompositeOperation = 'lighter'; for (i = 0; i < 3; i++) { var gx = W * (0.24 + i * 0.26) + Math.sin(t * 0.3 + i) * 30, base = surfScreen > 0 ? surfScreen : 0; var rg = ctx.createLinearGradient(gx, base, gx - 50, H); rg.addColorStop(0, 'rgba(167,205,200,' + rayA + ')'); rg.addColorStop(1, 'rgba(167,205,200,0)'); ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(gx - 14, base); ctx.lineTo(gx + 14, base); ctx.lineTo(gx - 44, H); ctx.lineTo(gx - 92, H); ctx.closePath(); ctx.fill(); } ctx.globalCompositeOperation = 'source-over'; }

    if (floorY - off < H + 80) drawSeafloor(off);
    drawFog(off);

    for (i = 0; i < creatures.length; i++) { var o = creatures[i], sy = o.y - off; if (sy < -180 || sy > H + 180) { if (o.k === 'snow') { o.y -= 4 * dt; if (o.y < surfaceY + 600) o.y = floorY; } continue; } drawCreature(o, sy, dt); }
    ctx.restore();

    var murk = clamp((off - surfaceY) / 2600, 0, 0.55); if (murk > 0.01) { ctx.fillStyle = 'rgba(2,8,11,' + murk + ')'; ctx.fillRect(0, 0, W, H); }

    for (i = splashes.length - 1; i >= 0; i--) { var s2 = splashes[i]; s2.r += 20 * dt; s2.a -= 0.9 * dt; if (s2.a <= 0) { splashes.splice(i, 1); continue; } ctx.strokeStyle = 'rgba(190,214,222,' + s2.a + ')'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(s2.x, surfacePageY(s2.x) - off, s2.r, s2.r * 0.28, 0, 0, 6.2832); ctx.stroke(); }
    if (surfScreen > -220 && surfScreen < H + 260) { drawFerry(off); drawIslandTop(off); drawLighthouse(off); }

    for (i = bolts.length - 1; i >= 0; i--) { var bo = bolts[i]; bo.a -= dt * 3.0; if (bo.a <= 0) { bolts.splice(i, 1); continue; } ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(214,232,236,' + bo.a + ')'; ctx.shadowColor = '#bfe0ff'; ctx.shadowBlur = GLOW * 16; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bo.pts[0].x, bo.pts[0].y - off); for (var p = 1; p < bo.pts.length; p++) ctx.lineTo(bo.pts[p].x, bo.pts[p].y - off); ctx.stroke(); ctx.restore(); }

    if (!reduce) requestAnimationFrame(frame);
  }

  scroll = window.scrollY || 0;
  resize();
  requestAnimationFrame(frame);
})();
