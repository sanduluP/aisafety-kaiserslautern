/* Skyline strip at the top of the hero: Kaiserslautern landmarks with a network inside them.
   Historic buildings (Stiftskirche, Fruchthalle, Rathaus, Betzenberg) and the research
   cluster (RPTU, Fraunhofer, MPI-SWS, DFKI). Nodes run up inside each building; the street
   line links them. 1 red dot tours the city: up each building and back down, then along
   the street to the next one. Hovering a building highlights it and shows its name.
   The buildings keep their proportions; the gaps between them stretch to the page width.
   Simplified silhouettes, drawn in code. Plain canvas, no libraries.
   - Colours follow the page: dark palette when the body background is dark.
   - 1 still frame for prefers-reduced-motion; pauses off screen or in a hidden tab. */
(function () {
  var canvas = document.querySelector('.hero-net');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var story = document.querySelector('.skyline-story');
  var WIDEN = 2.2;   // buildings drawn wider than tall-to-scale, so they read in a low strip

  // Buildings in design units: x 0..1600, height above the street (tallest 320).
  // Each entry is 1 outline from street to street.
  var BUILDINGS = [
    [[120,0],[120,60],[170,60],[170,0]],
    [[230,0],[230,140],[245,220],[260,140],[260,110],[330,110],[330,140],[345,230],[360,140],[360,0]],  // Stiftskirche
    [[430,0],[430,90],[520,135],[610,90],[610,0]],                                                      // Fruchthalle
    [[700,0],[700,320],[790,320],[790,0]],                                                              // Rathaus
    [[850,0],[850,55],[880,80],[910,55],[910,0]],
    [[950,0],[950,65],[990,65],[990,0]],
    [[1060,0],[1080,65],[1110,80],[1110,220],[1128,220],[1128,83],[1250,83],[1250,220],[1268,220],[1268,80],[1300,65],[1320,0]],  // Betzenberg
    // research cluster, stylised modern buildings (not the real facades)
    [[1600,0],[1600,110],[1700,110],[1700,170],[1740,170],[1740,110],[1760,110],[1760,0]],              // RPTU
    [[1810,0],[1810,95],[1835,108],[1865,115],[1895,113],[1920,105],[1940,92],[1940,0]],                // Fraunhofer
    [[1990,0],[1990,130],[1980,130],[1980,140],[2100,140],[2100,130],[2090,130],[2090,0]],              // MPI-SWS
    [[2140,0],[2140,95],[2160,95],[2160,140],[2280,162],[2280,122],[2308,122],[2308,72],[2280,72],[2280,0]]  // DFKI
  ];
  // names shown on hover (null: no label)
  var NAMES = [null, 'Stiftskirche', 'Fruchthalle', 'Rathaus', null, null, 'Fritz-Walter-Stadion',
               'RPTU', 'Fraunhofer IESE and ITWM', 'MPI-SWS', 'DFKI'];
  // extra lines inside buildings: [building, x1, y1, x2, y2]
  var DETAILS = [
    [7, 1605, 32, 1755, 32], [7, 1605, 64, 1755, 64], [7, 1605, 92, 1755, 92],   // RPTU floors
    [7, 1705, 140, 1735, 140],
    [8, 1835, 10, 1835, 100], [8, 1860, 10, 1860, 106], [8, 1885, 10, 1885, 106], [8, 1910, 10, 1910, 100],  // Fraunhofer fins
    [9, 1995, 40, 2085, 40], [9, 1995, 80, 2085, 80], [9, 1995, 115, 2085, 115], [9, 2040, 10, 2040, 128],  // MPI-SWS grid
    [10, 2145, 28, 2275, 28], [10, 2145, 52, 2275, 52], [10, 2145, 76, 2275, 76],  // DFKI window bands
    [10, 2165, 100, 2275, 100], [10, 2165, 122, 2275, 122],
    [10, 2284, 97, 2304, 97],                                                      // cantilever band
    [10, 2212, 150, 2212, 192], [10, 2206, 180, 2218, 180]                         // antenna
  ];
  // columns of nodes inside buildings: x, top height, count
  var COLS = [[145,45,2],[245,185,4],[345,195,4],[480,80,2],[560,80,2],[745,290,7],
              [880,45,2],[970,45,2],[1119,200,4],[1185,55,2],[1259,200,4],
              [1720,160,4],[1875,100,3],[2040,125,4],[2222,130,4]];
  var ARCHES = [445, 474, 503, 532, 561];               // Fruchthalle arcade, inside 430..610

  function buildingOf(x) {
    for (var b = 0; b < BUILDINGS.length; b++) {
      var o = BUILDINGS[b];
      if (x >= o[0][0] && x <= o[o.length - 1][0]) return b;
    }
    return 0;
  }

  var w = 0, h = 0, dpr = 1, last = 0, running = false, visible = true, raf = 0, palette;
  var u = 1, centres = [], route = [], pos = 0, bounds = [], hover = -1;

  function setPalette() {
    var m = getComputedStyle(document.body).backgroundColor.match(/\d+(\.\d+)?/g);
    var dark = m && (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) < 128;
    palette = dark
      ? { ink: '170, 196, 238', fire: '255, 92, 104', k: .85 }
      : { ink: '18, 48, 94', fire: '206, 21, 35', k: .7 };
  }

  // map a design point to the canvas: uniform scale per building, centres spread across the width
  function X(x, bIdx) {
    var b = bIdx === undefined ? buildingOf(x) : bIdx, o = BUILDINGS[b];
    var c = (o[0][0] + o[o.length - 1][0]) / 2;
    return centres[b] + (x - c) * u * WIDEN;
  }
  function Y(y) { return h - 1.5 - y * u; }

  function measure() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = rect.width; h = rect.height;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    u = (h - 4) / 320;
    // spread the buildings from the left edge to just before the "About the skyline" link
    var left = Math.min(56, w * 0.05);
    var right = w;
    if (story) right = story.getBoundingClientRect().left - rect.left - 56;
    // equal gaps between buildings: measure each building's drawn width, share the rest
    var k = u * WIDEN, spans = BUILDINGS.map(function (o) {
      var xs = o.map(function (p) { return p[0]; });
      return { lo: Math.min.apply(null, xs), hi: Math.max.apply(null, xs), c: (o[0][0] + o[o.length - 1][0]) / 2 };
    });
    var used = spans.reduce(function (t, sp) { return t + (sp.hi - sp.lo) * k; }, 0);
    var gap = Math.max(4, (right - left - used) / (spans.length - 1)), at = left;
    centres = spans.map(function (sp) {
      var centre = at + (sp.c - sp.lo) * k;
      at += (sp.hi - sp.lo) * k + gap;
      return centre;
    });
    // on-screen box of each building, for the hover labels
    bounds = BUILDINGS.map(function (o, bi) {
      var xs = o.map(function (p) { return X(p[0], bi); }), ys = o.map(function (p) { return p[1]; });
      return { l: Math.min.apply(null, xs), r: Math.max.apply(null, xs), top: Y(Math.max.apply(null, ys)) };
    });
    buildRoute();
  }

  // the dot's route: for each column, from the street up to the top and back down,
  // then along the street to the next column
  function colY(c, k) { return Y(15 + (c[1] - 15) * (k / Math.max(c[2] - 1, 1))); }
  function buildRoute() {
    var keepFrac = route.total ? pos / route.total : 0;
    route = [];
    var cols = COLS.slice().sort(function (a, b) { return a[0] - b[0]; });
    cols.forEach(function (c) {
      var x = X(c[0]);
      route.push({ x: x, y: Y(0) });
      for (var k = 0; k < c[2]; k++) route.push({ x: x, y: colY(c, k) });
      for (var j = c[2] - 2; j >= 0; j--) route.push({ x: x, y: colY(c, j) });
      route.push({ x: x, y: Y(0) });
    });
    var total = 0;
    route[0].d = 0;
    for (var i = 1; i < route.length; i++) {
      total += Math.hypot(route[i].x - route[i - 1].x, route[i].y - route[i - 1].y);
      route[i].d = total;
    }
    route.total = total;
    pos = keepFrac * total;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    var ink = palette.ink, k = palette.k;
    ctx.lineJoin = 'round';
    // street line across the full width
    ctx.strokeStyle = 'rgba(' + ink + ',' + (0.45 * k).toFixed(3) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, Y(0)); ctx.lineTo(w, Y(0)); ctx.stroke();
    // building outlines
    ctx.strokeStyle = 'rgba(' + ink + ',' + (0.7 * k).toFixed(3) + ')';
    ctx.lineWidth = 1.1;
    BUILDINGS.forEach(function (o, bi) {
      var on = bi === hover;
      ctx.strokeStyle = 'rgba(' + ink + ',' + ((on ? 1 : 0.7) * k).toFixed(3) + ')';
      ctx.lineWidth = on ? 1.8 : 1.1;
      ctx.beginPath();
      o.forEach(function (p, i) { i ? ctx.lineTo(X(p[0], bi), Y(p[1])) : ctx.moveTo(X(p[0], bi), Y(p[1])); });
      ctx.stroke();
    });
    // window bands and antenna, faint
    ctx.strokeStyle = 'rgba(' + ink + ',' + (0.35 * k).toFixed(3) + ')';
    ctx.lineWidth = .8;
    ctx.beginPath();
    DETAILS.forEach(function (d) { ctx.moveTo(X(d[1], d[0]), Y(d[2])); ctx.lineTo(X(d[3], d[0]), Y(d[4])); });
    ctx.stroke();
    // Fruchthalle arches, faint
    ctx.strokeStyle = 'rgba(' + ink + ',' + (0.3 * k).toFixed(3) + ')';
    ctx.lineWidth = .8;
    ARCHES.forEach(function (ax) {
      var l = X(ax, 2), r = X(ax + 24, 2), rad = Math.abs(r - l) / 2, top = Y(40);   // 2 = Fruchthalle
      ctx.beginPath();
      ctx.moveTo(l, Y(0)); ctx.lineTo(l, top + rad);
      ctx.arc(l + rad, top + rad, rad, Math.PI, 0);
      ctx.lineTo(r, Y(0)); ctx.stroke();
    });
    // columns and their nodes
    COLS.forEach(function (c) {
      var x = X(c[0]);
      ctx.strokeStyle = 'rgba(' + ink + ',' + (0.4 * k).toFixed(3) + ')';
      ctx.beginPath(); ctx.moveTo(x, Y(0)); ctx.lineTo(x, colY(c, c[2] - 1)); ctx.stroke();
      ctx.fillStyle = 'rgba(' + ink + ',' + (0.85 * k).toFixed(3) + ')';
      for (var n = 0; n < c[2]; n++) { ctx.beginPath(); ctx.arc(x, colY(c, n), 1.6, 0, 6.283); ctx.fill(); }
    });
    // the 1 red dot
    if (route.total) {
      var i = 1;
      while (i < route.length - 1 && route[i].d < pos) i++;
      var A = route[i - 1], B = route[i], seg = (B.d - A.d) || 1;
      var f = Math.min(1, Math.max(0, (pos - A.d) / seg));
      var px = A.x + (B.x - A.x) * f, py = A.y + (B.y - A.y) * f;
      var g = ctx.createRadialGradient(px, py, 0, px, py, 7);
      g.addColorStop(0, 'rgba(' + palette.fire + ',.35)');
      g.addColorStop(1, 'rgba(' + palette.fire + ',0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(px, py, 7, 0, 6.283); ctx.fill();
      ctx.fillStyle = 'rgba(' + palette.fire + ',.9)';
      ctx.beginPath(); ctx.arc(px, py, 2.2, 0, 6.283); ctx.fill();
    }
  }

  var SPEED = 0.045;     // px per ms: a calm walking pace
  function frame(now) {
    var dt = last ? Math.min(now - last, 50) : 16;
    last = now;
    pos = (pos + SPEED * dt) % (route.total || 1);
    draw();
    raf = requestAnimationFrame(frame);
  }
  function start() {
    if (running || reduce.matches || !visible || document.hidden) return;
    running = true; last = 0;
    raf = requestAnimationFrame(frame);
  }
  function stop() { running = false; cancelAnimationFrame(raf); }

  setPalette(); measure(); draw(); start();

  window.addEventListener('resize', function () { measure(); if (!running) draw(); });
  window.addEventListener('load', function () { measure(); if (!running) draw(); });
  document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }).observe(canvas);
  }
  if (reduce.addEventListener) reduce.addEventListener('change', function () { reduce.matches ? (stop(), draw()) : start(); });
  new MutationObserver(function () { setPalette(); if (!running) draw(); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) mq.addEventListener('change', function () { setPalette(); if (!running) draw(); });

  // hover: highlight the building under the pointer and show its name below the street
  var row = canvas.parentElement;
  var tip = document.createElement('span');
  tip.className = 'skyline-tip';
  tip.setAttribute('aria-hidden', 'true');
  row.appendChild(tip);
  row.addEventListener('pointermove', function (e) {
    var x = e.clientX - canvas.getBoundingClientRect().left, found = -1;
    for (var b = 0; b < bounds.length; b++) {
      if (NAMES[b] && x >= bounds[b].l - 6 && x <= bounds[b].r + 6) { found = b; break; }
    }
    if (found !== hover) {
      hover = found;
      if (found >= 0) {
        tip.textContent = NAMES[found];
        tip.style.left = ((bounds[found].l + bounds[found].r) / 2) + 'px';
        tip.classList.add('is-on');
      } else {
        tip.classList.remove('is-on');
      }
      if (!running) draw();
    }
  });
  row.addEventListener('pointerleave', function () {
    hover = -1; tip.classList.remove('is-on'); if (!running) draw();
  });

  // "About the skyline": close the panel on a click anywhere outside it, or on Escape
  if (story) {
    document.addEventListener('click', function (e) {
      if (story.open && !story.contains(e.target)) story.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && story.open) {
        story.open = false;
        story.querySelector('summary').focus();
      }
    });
  }
})();
