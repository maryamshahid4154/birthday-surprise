/* =========================================================
   BIRTHDAY WEBSITE — script.js (vanilla ES6+, no dependencies)
   All content lives in index.html; this file only adds behavior.
   ========================================================= */
(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const scrollToEl = (el) => el && el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });

  /* ---------- Urdu toggle (side tab) ----------
     Translates ONLY paragraph text: every element that has a data-ur="..." attribute.
     Headings, buttons, labels and chips stay in English. Click again to go back to English.
     To edit a translation, just change the data-ur text in index.html. */
  let urduOn = false;
  let refreshTypewriter = () => {};
  const initUrdu = () => {
    const tab = $('#langTab');
    if (!tab) return;
    const label = $('.lang-tab__text', tab);
    const paras = $$('[data-ur]');
    const typewriter = $('#typewriter');
    const deckQuote = $('#deckQuote');
    if (typewriter) typewriter.dataset.linesEn = typewriter.dataset.lines;

    const apply = (on) => {
      urduOn = on;
      document.documentElement.classList.toggle('ur-on', on);
      paras.forEach((el) => {
        if (el.dataset.en === undefined) el.dataset.en = el.innerHTML;
        el.innerHTML = on ? el.dataset.ur : el.dataset.en;
        el.classList.toggle('is-ur', on);
      });
      if (typewriter && typewriter.dataset.linesUr) {
        typewriter.dataset.lines = on ? typewriter.dataset.linesUr : typewriter.dataset.linesEn;
        typewriter.parentElement.classList.toggle('is-ur', on);
        refreshTypewriter();
      }
      if (deckQuote) {
        deckQuote.classList.toggle('is-ur', on);
        const active = $('.card3d.is-active');
        if (active) deckQuote.textContent = `“${on && active.dataset.quoteUr ? active.dataset.quoteUr : active.dataset.quote}”`;
      }
      label.textContent = on ? label.dataset.labelUr : label.dataset.labelEn;
      tab.setAttribute('aria-pressed', String(on));
    };
    tab.addEventListener('click', () => apply(!urduOn));
  };
  initUrdu();

  /* ---------- Intro ---------- */
  const initIntro = (onDone, delay = 2400) => {
    const intro = $('#intro');
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      intro.classList.add('is-done');
      onDone();
    };
    if (!intro) return finish();
    intro.addEventListener('click', finish);
    window.addEventListener('keydown', finish, { once: true });
    setTimeout(finish, reduceMotion ? 300 : delay);
  };

  /* ---------- Scroll reveal ---------- */
  const initReveal = () => {
    const items = $$('.reveal');
    if (!('IntersectionObserver' in window)) return items.forEach((el) => el.classList.add('is-in'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    items.forEach((el) => io.observe(el));
  };

  /* ---------- Floating emoji + dots ---------- */
  const initFloaters = () => {
    const layer = $('#floaters');
    if (!layer || reduceMotion) return;
    const glyphs = ['👑', '⭐', '🔥', '⚡', '🎮', '🍻', '🏆', '👊'];
    const count = window.innerWidth < 700 ? 11 : 20;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      const isDot = i % 3 === 0;
      el.className = 'floater' + (isDot ? ' floater--dot' + (i % 2 ? ' is-gold' : '') : ' emoji');
      if (!isDot) { el.textContent = pick(glyphs); el.style.fontSize = `${rand(16, 32)}px`; }
      el.style.left = `${rand(2, 96)}%`;
      el.style.animationDuration = `${rand(16, 32)}s`;
      el.style.animationDelay = `-${rand(0, 30)}s`;
      el.style.setProperty('--dx', `${rand(-70, 70)}px`);
      el.style.setProperty('--rot', `${rand(-200, 200)}deg`);
      frag.appendChild(el);
    }
    layer.appendChild(frag);
  };

  /* ---------- Marquees (duplicate content for a seamless loop) ---------- */
  const initMarquees = () => {
    $$('[data-marquee]').forEach((track, i) => {
      const originals = [...track.children];
      // 1) repeat until one "half" is wider than the viewport, 2) duplicate the half
      let guard = 0;
      while (track.scrollWidth < window.innerWidth * 1.6 && guard++ < 6) {
        originals.forEach((k) => track.appendChild(k.cloneNode(true)));
      }
      [...track.children].forEach((k) => track.appendChild(k.cloneNode(true)));
      [...track.children].forEach((k, idx) => {
        if (idx >= originals.length) {
          k.setAttribute('aria-hidden', 'true');
          if (k.matches('button, a')) k.tabIndex = -1;
        }
      });
      track.style.setProperty('--speed', `${30 + i * 5}s`);
    });
  };

  /* ---------- Typewriter ---------- */
  const initTypewriter = () => {
    const el = $('#typewriter');
    if (!el) return;
    const getLines = () => el.dataset.lines.split('|').map((x) => x.trim()).filter(Boolean);
    if (reduceMotion) { refreshTypewriter = () => { el.textContent = getLines().pop(); }; return; }
    let li = 0, ci = 0, del = false, done = false;
    const tick = () => {
      const lines = getLines();
      const line = lines[li % lines.length];
      ci += del ? -1 : 1;
      el.textContent = line.slice(0, ci);
      let wait = del ? 28 : 52;
      if (!del && ci === line.length) { del = li < lines.length - 1; wait = del ? 1600 : 0; if (!del) { done = true; return; } }
      else if (del && ci === 0) { del = false; li = (li + 1) % lines.length; wait = 350; }
      setTimeout(tick, wait);
    };
    // language switched: start typing again in the new language
    refreshTypewriter = () => { li = 0; ci = 0; del = false; if (done) { done = false; el.textContent = ''; setTimeout(tick, 250); } };
    el.textContent = ''; setTimeout(tick, 400);
  };

  /* ---------- Dialogs ---------- */
  const closeOnBackdrop = (dlg) => {
    dlg.addEventListener('click', (e) => {
      const r = dlg.getBoundingClientRect();
      const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
      if (!inside) dlg.close();
    });
  };

  const initLetterModal = () => {
    const modal = $('#letterModal');
    $('#openSurprise').addEventListener('click', () => { modal.showModal(); burst(innerWidth / 2, innerHeight * 0.4, 50); });
    $('#modalClose').addEventListener('click', () => modal.close());
    $('#modalContinue').addEventListener('click', () => { modal.close(); scrollToEl($('#letter')); });
    closeOnBackdrop(modal);
  };

  const viewer = { dlg: null, open(src, alt, title) {
    $('#viewerImg').src = src; $('#viewerImg').alt = alt || title || 'Photo';
    $('#viewerTitle').textContent = title || '';
    $('#viewer figcaption').hidden = !title;          // no caption bar for plain photos
    this.dlg.showModal();
  } };
  const initViewer = () => {
    viewer.dlg = $('#viewer');
    $('#viewerClose').addEventListener('click', () => viewer.dlg.close());
    closeOnBackdrop(viewer.dlg);
    $$('.photo').forEach((btn) => btn.addEventListener('click', () => {
      const img = $('img', btn);                       // open the exact picture that was tapped
      viewer.open(img.getAttribute('src'), img.alt, btn.dataset.title || '');
    }));
  };

  /* ---------- Coverflow deck ---------- */
  const initDeck = () => {
    const stage = $('#deckStage');
    const cards = $$('.card3d', stage);
    const dots = $('#deckDots');
    const cap = { box: $('#deckCaption'), no: $('#deckNo'), title: $('#deckTitle'), sub: $('#deckSub'), quote: $('#deckQuote') };
    const prev = $('#deckPrev'), next = $('#deckNext');
    let cur = Math.floor(cards.length / 2);

    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', `Show memory ${i + 1}`);
      b.addEventListener('click', () => go(i));
      dots.appendChild(b);
    });

    const render = (first) => {
      cards.forEach((c, i) => {
        const o = i - cur, a = Math.abs(o);
        c.style.setProperty('--o', Math.max(-3, Math.min(3, o)));
        c.style.setProperty('--abs', Math.min(a, 3));
        c.dataset.hidden = a > 2 ? 'true' : 'false';
        c.classList.toggle('is-active', o === 0);
      });
      $$('button', dots).forEach((d, i) => d.classList.toggle('is-active', i === cur));
      prev.disabled = cur === 0; next.disabled = cur === cards.length - 1;
      const d = cards[cur].dataset;
      const setText = () => {
        cap.no.textContent = d.no; cap.title.textContent = d.title;
        cap.sub.innerHTML = d.sub; cap.quote.textContent = `“${urduOn && d.quoteUr ? d.quoteUr : d.quote}”`;
        cap.box.classList.remove('is-swap');
      };
      if (first) return setText();
      cap.box.classList.add('is-swap'); setTimeout(setText, 220);
    };
    const go = (i) => { const n = Math.max(0, Math.min(cards.length - 1, i)); if (n !== cur) { cur = n; render(); } };

    prev.addEventListener('click', () => go(cur - 1));
    next.addEventListener('click', () => go(cur + 1));
    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); }
      if (e.key === 'Enter') { const c = cards[cur]; viewer.open($('img', c).src, $('img', c).alt, c.dataset.title); }
    });

    // Drag / swipe + click-to-focus
    let startX = 0, dragging = false, moved = false;
    stage.addEventListener('pointerdown', (e) => { dragging = true; moved = false; startX = e.clientX; stage.classList.add('is-drag'); });
    window.addEventListener('pointermove', (e) => { if (dragging && Math.abs(e.clientX - startX) > 8) moved = true; });
    window.addEventListener('pointerup', (e) => {
      if (!dragging) return;
      dragging = false; stage.classList.remove('is-drag');
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 45) go(cur + (dx < 0 ? 1 : -1));
    });
    cards.forEach((c, i) => c.addEventListener('click', () => {
      if (moved) return;
      if (i === cur) viewer.open($('img', c).src, $('img', c).alt, c.dataset.title); else go(i);
    }));
    render(true);
  };

  /* ---------- Kinetic wavy text ---------- */
  const initWave = () => {
    const section = $('#kinetic');
    if (!section || reduceMotion) return;
    const chars = [];
    $$('[data-wave]', section).forEach((el, row) => {
      const text = el.textContent; el.textContent = '';
      let i = 0;
      text.split(' ').forEach((word, wi, all) => {
        const w = document.createElement('span'); w.className = 'wave-word';
        [...word].forEach((ch) => {
          const s = document.createElement('span'); s.className = 'wave-ch'; s.textContent = ch;
          w.appendChild(s); chars.push({ s, i: i++, row, amp: parseFloat(getComputedStyle(el).fontSize) * 0.14 });
        });
        el.appendChild(w);
        if (wi < all.length - 1) { el.appendChild(document.createTextNode(' ')); i++; }
      });
    });
    let visible = false, raf = 0;
    const draw = () => {
      raf = 0;
      const y = window.scrollY * 0.012;
      chars.forEach(({ s, i, row, amp }) => {
        const p = i * 0.38 + row * 1.3 + y * 6;
        s.style.transform = `translateY(${Math.sin(p) * amp}px) rotate(${Math.cos(p) * 5}deg)`;
      });
    };
    const request = () => { if (visible && !raf) raf = requestAnimationFrame(draw); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; request(); }).observe(section);
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', () => chars.forEach((c) => { c.amp = parseFloat(getComputedStyle(c.s.parentElement).fontSize) * 0.14; }));
  };

  /* ---------- Counters ---------- */
  const initCounters = () => {
    const els = $$('[data-count]');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        const end = +e.target.dataset.count;
        if (reduceMotion || end < 3) return;
        const t0 = performance.now();
        const step = (t) => {
          const k = Math.min(1, (t - t0) / 1400);
          e.target.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
          if (k < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  };

  /* ---------- Confetti / fireworks (canvas) ---------- */
  const canvas = $('#confetti');
  const ctx = canvas.getContext('2d');
  const parts = [];
  let confettiRaf = 0;
  const colors = ['#ffb61e', '#ffd66b', '#1a6bff', '#5b9bff', '#ffffff', '#f5f5fa'];
  const fit = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  fit(); window.addEventListener('resize', fit);

  function burst(x, y, n = 80, palette = colors, power = 1) {
    const count = reduceMotion ? Math.ceil(n / 4) : n;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), v = rand(2, 9) * power;
      parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 3, w: rand(4, 9), h: rand(3, 6),
        r: rand(0, 6), vr: rand(-.3, .3), life: rand(70, 140), c: pick(palette), g: 0.14 });
    }
    if (!confettiRaf) confettiRaf = requestAnimationFrame(loop);
  }
  function loop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life--;
      if (p.life <= 0 || p.y > innerHeight + 20) { parts.splice(i, 1); continue; }
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.globalAlpha = Math.min(1, p.life / 40); ctx.fillStyle = p.c;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    }
    confettiRaf = parts.length ? requestAnimationFrame(loop) : 0;
    if (!parts.length) ctx.clearRect(0, 0, innerWidth, innerHeight);
  }
  const celebrate = (ms = 4200) => {
    const end = performance.now() + ms;
    const fire = () => {
      burst(rand(innerWidth * .15, innerWidth * .85), rand(innerHeight * .15, innerHeight * .55), 70);
      if (performance.now() < end) setTimeout(fire, rand(220, 480));
    };
    fire();
  };

  /* ---------- Burger & final ---------- */
  /* ---------- Burger: tap anywhere on it to take a bite ---------- */
  const initBurger = () => {
    const cv = $('#burgerCanvas');
    if (!cv) return;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    const LW = 560, LH = 480, SC = cv.width / LW;          // draw in a 560x480 space, canvas is 1.5x for sharpness
    const CRUMBS = ['#f4d58d', '#e8b25d', '#c98a2b', '#8a4b14', '#6fb23a'];
    let total = 1, busy = false;

    const seeded = (seed) => () => { seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const rr = (x, y, w, h, [tl, tr, br, bl]) => {         // rounded rectangle path
      ctx.beginPath(); ctx.moveTo(x + tl, y); ctx.lineTo(x + w - tr, y); ctx.arcTo(x + w, y, x + w, y + tr, tr);
      ctx.lineTo(x + w, y + h - br); ctx.arcTo(x + w, y + h, x + w - br, y + h, br);
      ctx.lineTo(x + bl, y + h); ctx.arcTo(x, y + h, x, y + h - bl, bl);
      ctx.lineTo(x, y + tl); ctx.arcTo(x, y, x + tl, y, tl); ctx.closePath();
    };
    const grad = (y0, y1, stops) => { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; };
    const layer = (fill) => { ctx.shadowColor = 'rgba(0,0,0,.38)'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 4; ctx.fillStyle = fill; ctx.fill(); ctx.shadowColor = 'transparent'; };

    const draw = () => {
      const R = seeded(7);
      ctx.setTransform(SC, 0, 0, SC, 0, 0);
      ctx.globalCompositeOperation = 'source-over';
      ctx.clearRect(0, 0, LW, LH);

      // bottom bun
      rr(78, 396, 404, 52, [8, 8, 28, 28]); layer(grad(396, 448, [[0, '#ebab48'], [1, '#bb701b']]));

      // patty (with grill texture)
      rr(60, 338, 440, 64, [30, 30, 30, 30]); layer(grad(338, 402, [[0, '#80482a'], [1, '#35190b']]));
      ctx.save(); rr(60, 338, 440, 64, [30, 30, 30, 30]); ctx.clip();
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = i % 3 ? 'rgba(0,0,0,.26)' : 'rgba(255,196,140,.14)';
        ctx.beginPath(); ctx.arc(60 + R() * 440, 338 + R() * 64, 1.4 + R() * 2.4, 0, 6.3); ctx.fill();
      }
      ctx.restore();

      // cheese with two drips
      ctx.beginPath();
      [[64, 324], [496, 324], [496, 346], [470, 346], [444, 382], [418, 346], [150, 346], [118, 374], [90, 346], [64, 346]]
        .forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.closePath(); ctx.lineJoin = 'round'; ctx.lineWidth = 6; ctx.strokeStyle = '#f4ac06';
      layer(grad(324, 382, [[0, '#ffdc5a'], [1, '#f2a500']])); ctx.shadowColor = 'transparent'; ctx.stroke();
      ctx.fillStyle = grad(324, 382, [[0, '#ffdc5a'], [1, '#f2a500']]); ctx.fill();

      // tomato slices
      [[84, 190], [286, 190]].forEach(([x, w]) => {
        rr(x, 292, w, 38, [16, 16, 16, 16]); layer(grad(292, 330, [[0, '#f04a3d'], [1, '#b61f19']]));
        rr(x + 10, 298, w - 20, 12, [6, 6, 6, 6]); ctx.fillStyle = 'rgba(255,255,255,.2)'; ctx.fill();
        for (let k = 0; k < 6; k++) { ctx.fillStyle = '#ffd36b'; ctx.beginPath(); ctx.ellipse(x + 24 + k * ((w - 48) / 5), 318, 3.2, 2, 0, 0, 6.3); ctx.fill(); }
      });

      // ruffled lettuce
      ctx.beginPath(); ctx.moveTo(46, 262); ctx.lineTo(514, 262);
      for (let i = 0, x = 514; x > 46; i++, x -= 16) ctx.quadraticCurveTo(x - 8, 292 + (i % 2 ? 20 : -2), x - 16, 292);
      ctx.closePath(); layer(grad(262, 312, [[0, '#a9e466'], [1, '#4b9a27']]));
      ctx.beginPath(); for (let i = 0, x = 514; x > 46; i++, x -= 16) { if (!i) ctx.moveTo(x, 292); ctx.quadraticCurveTo(x - 8, 290 + (i % 2 ? 20 : -2), x - 16, 292); }
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2; ctx.stroke();

      // top bun dome + highlight + sesame
      const dome = () => { ctx.beginPath(); ctx.moveTo(78, 264); ctx.bezierCurveTo(68, 118, 170, 50, 280, 50);
        ctx.bezierCurveTo(390, 50, 492, 118, 482, 264); ctx.quadraticCurveTo(280, 282, 78, 264); ctx.closePath(); };
      dome(); layer(grad(50, 280, [[0, '#f9cc6c'], [.55, '#e29b37'], [1, '#bf6f1b']]));
      ctx.save(); dome(); ctx.clip();
      const hl = ctx.createRadialGradient(205, 110, 8, 205, 120, 190); hl.addColorStop(0, 'rgba(255,255,255,.42)'); hl.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = hl; ctx.fillRect(0, 0, LW, LH);
      for (let n = 0; n < 28;) {
        const x = 105 + R() * 350, y = 78 + R() * 160;
        if (((x - 280) / 205) ** 2 + ((y - 168) / 120) ** 2 > 0.85) continue;
        ctx.save(); ctx.translate(x, y); ctx.rotate(R() * 3.14);
        ctx.fillStyle = '#fff3cd'; ctx.strokeStyle = 'rgba(120,68,10,.4)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(0, 0, 8, 4.4, 0, 0, 6.3); ctx.fill(); ctx.stroke(); ctx.restore(); n++;
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      total = Math.max(1, solid());
    };

    // number of "solid" pixels left (used to know when the burger is finished)
    const solid = () => {
      const d = ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0;
      for (let i = 3; i < d.length; i += 16) if (d[i] > 200) n++;          // every 4th pixel is enough
      return n;
    };
    const isBurger = (x, y) => {                                              // is there burger under this point?
      const px = Math.round(x * SC), py = Math.round(y * SC);
      const d = ctx.getImageData(Math.max(0, px - 2), Math.max(0, py - 2), 5, 5).data;
      for (let i = 3; i < d.length; i += 4) if (d[i] > 120) return true;
      return false;
    };

    // One bite: a round hole with scalloped "teeth" edge, centred on the tap.
    const bite = (x, y) => {
      const r = rand(46, 58), teeth = 8, off = rand(0, 6.28);
      ctx.save(); ctx.setTransform(SC, 0, 0, SC, 0, 0); ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = '#000';
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.3); ctx.fill();
      for (let i = 0; i < teeth; i++) {
        const a = off + (i / teeth) * 6.283 + rand(-.12, .12), t = rand(12, 17);
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * r * 0.98, y + Math.sin(a) * r * 0.98, t, 0, 6.3); ctx.fill();
      }
      ctx.restore();
    };

    const eatAt = (x, y, sx, sy) => {
      if (busy || !isBurger(x, y)) return;
      bite(x, y);
      cv.classList.remove('is-chomp'); void cv.offsetWidth; cv.classList.add('is-chomp');   // restart the squish
      burst(sx, sy, 16, CRUMBS, 0.55);
      if (solid() / total < 0.3) finish();
    };

    // Burger gone: little celebration, then a fresh one appears so it can be eaten again.
    const finish = () => {
      busy = true; cv.classList.add('is-gone');
      cv.removeAttribute('tabindex'); cv.setAttribute('aria-hidden', 'true');
      const r = cv.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, 70);
      const done = $('#burgerDone'), label = $('#burgerLabel');
      if (label) label.classList.add('is-hidden');
      // No new burger: "Happy Birthday" appears in its place (busy stays true, so it cannot be eaten again)
      setTimeout(() => {
        if (!done) return;
        done.hidden = false; void done.offsetWidth; done.classList.add('is-in');
        burst(r.left + r.width / 2, r.top + r.height / 2, 50);
      }, reduceMotion ? 100 : 600);
    };

    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect();
      eatAt((e.clientX - r.left) / r.width * LW, (e.clientY - r.top) / r.height * LH, e.clientX, e.clientY);
    });
    cv.addEventListener('keydown', (e) => {                                  // keyboard: Enter / Space bites a random spot
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      const r = cv.getBoundingClientRect();
      for (let i = 0; i < 60; i++) {
        const x = rand(70, 490), y = rand(60, 440);
        if (isBurger(x, y)) return eatAt(x, y, r.left + x / LW * r.width, r.top + y / LH * r.height);
      }
    });
    draw();
  };
  /* ---------- Video section: shows a placeholder + disables Download until the video file exists ---------- */
  const initVideo = () => {
    const video = $('#giftVideo'), frame = $('#videoFrame'), empty = $('#videoEmpty'), dl = $('#videoDownload');
    if (!video || !frame) return;
    const src = $('source', video);
    if (src && dl) dl.href = src.getAttribute('src');          // download link always follows the video's source
    const missing = () => {
      frame.classList.add('is-empty'); if (empty) empty.hidden = false;
      if (dl) { dl.setAttribute('aria-disabled', 'true'); dl.tabIndex = -1; }
    };
    if (src) src.addEventListener('error', missing);
    video.addEventListener('error', missing);
    // The birthday song would play over the video, so pause it while the video plays and resume afterwards.
    let pausedSong = false;
    video.addEventListener('play', () => { if (sound.music.playing) { sound.music.pause(); pausedSong = true; } });
    const resume = () => { if (pausedSong) { pausedSong = false; sound.music.start(); } };
    video.addEventListener('pause', resume);
    video.addEventListener('ended', resume);
  };
  const initFinal = () => {
    $('#launchBtn').addEventListener('click', () => celebrate());
    new IntersectionObserver(([e], o) => { if (e.isIntersecting) { setTimeout(() => burst(innerWidth / 2, innerHeight * 0.35, 60), 500); o.disconnect(); } },
      { threshold: 0.6 }).observe($('#final'));
  };

  /* ---------- Audio ----------
     Exactly two <audio> players, created once and never duplicated:
       ringtone  -> assets/audio/incoming-ringtone.mp3   (loops on the call screen until answered)
       song      -> assets/audio/birthday-song.mp3       (loops on the website; never restarts on scroll)
     Paths are set on <body data-ringtone-src / data-music-src>. Browsers only allow sound after a tap or key
     press, so a blocked start is reported in the UI; a missing file is reported instead of failing silently. */
  const createSound = () => {
    const cfg = document.body.dataset;
    const api = { onchange() {} };
    const changed = () => api.onchange();

    const makeTrack = (src, preload) => {
      const a = new Audio();
      a.loop = true; a.preload = preload;
      const t = { a, src, failed: false, blocked: false, wanted: false, muted: false, unlocked: false, priming: false };
      a.addEventListener('error', () => {
        // Fallback: if the .mp3 isn't found, try the same name with .mpeg / .mp4 / .m4a before giving up.
        const alts = ['.mpeg', '.mpga', '.m4a', '.wav'];
        t.tried = t.tried || 0;
        if (/\.mp3$/i.test(src) && t.tried < alts.length) {
          a.src = src.replace(/\.mp3$/i, alts[t.tried++]);
          if (t.wanted) a.play().catch(() => {});
          return;
        }
        t.failed = true;
        console.warn(`[audio] Could not load "${src}". Check that the file exists and is a valid mp3.`);
        changed();
      });
      ['playing', 'pause'].forEach((ev) => a.addEventListener(ev, changed));
      if (src) a.src = src; else t.failed = true;
      Object.defineProperty(t, 'playing', { get: () => !a.paused && !t.failed && !t.priming });

      t.start = () => {                              // resolves true when playback actually began
        t.wanted = true;
        if (t.failed) return Promise.resolve(false);
        return Promise.resolve(a.play())
          .then(() => { t.blocked = false; changed(); return true; })
          .catch((err) => {
            if (err && err.name === 'NotAllowedError') t.blocked = true;      // needs a tap first
            else if (err && err.name === 'NotSupportedError') t.failed = true; // missing / unreadable file
            changed(); return false;
          });
      };
      t.pause = () => { t.wanted = false; a.pause(); };                         // keeps the position
      t.stop = () => { t.pause(); try { a.currentTime = 0; } catch (err) { /* not seekable yet */ } };
      t.setMuted = (m) => { t.muted = m; a.muted = m; changed(); };

      // Smooth volume change (ease-in-out). Used for the "song arriving from far away" effect.
      t.fadeId = 0;
      t.fade = (to, ms) => {
        clearInterval(t.fadeId);
        const from = a.volume, t0 = performance.now();
        t.fadeId = setInterval(() => {
          const p = Math.min(1, (performance.now() - t0) / ms);
          const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
          try { a.volume = Math.max(0, Math.min(1, from + (to - from) * e)); } catch (err) { /* iOS ignores volume */ }
          if (p >= 1) clearInterval(t.fadeId);
        }, 40);
      };
      return t;
    };

    api.ring = makeTrack(cfg.ringtoneSrc, 'auto');
    api.music = makeTrack(cfg.musicSrc, 'metadata');

    // The two sources can never overlap.
    const startRing = api.ring.start, startMusic = api.music.start;
    api.ring.start = () => (api.music.playing ? Promise.resolve(false) : startRing());
    api.music.start = () => { api.ring.stop(); return startMusic(); };

    // iOS/Safari only lets an element play later if it was first started inside a tap.
    // Called from the "answer" tap: starts the song silently for a moment, then pauses it.
    api.unlock = () => {
      const s = api.music;
      if (s.unlocked || s.failed) return;
      s.unlocked = true; s.priming = true; s.a.muted = true;
      Promise.resolve(s.a.play())
        .then(() => { if (!s.wanted) { s.a.pause(); try { s.a.currentTime = 0; } catch (err) { /* ignore */ } } })
        .catch(() => {})
        .finally(() => { s.priming = false; s.a.muted = s.muted; changed(); });
    };
    return api;
  };
  const sound = createSound();

  /* Song fade settings (easy to tweak):
     FAR_VOLUME   - how quiet the song is when the call is answered (0 = silent, 1 = full)
     FAR_FADE_MS  - time to drift from silence up to FAR_VOLUME during the call
     RISE_MS      - time to rise from FAR_VOLUME to FULL_VOLUME once the website opens */
  const FAR_VOLUME = 0.12, FAR_FADE_MS = 2200;
  const FULL_VOLUME = 1, RISE_MS = 6000;

  // Keeps the buttons (call screen + website) in sync with the real audio state.
  const syncSoundUI = () => {
    const ring = sound.ring, song = sound.music;
    const cs = $('#callSound'), hint = $('#callSoundHint');
    if (cs) {
      cs.setAttribute('aria-pressed', String(!ring.muted));
      cs.setAttribute('aria-label', ring.muted ? 'Ringtone muted. Press to unmute.' : 'Ringtone on. Press to mute.');
    }
    if (hint) {
      hint.textContent = ring.failed ? 'Ringtone file not found' : 'Tap anywhere for ringtone';
      hint.hidden = !ring.failed;
    }
    const play = $('#musicPlay'), mute = $('#musicMute'), note = $('#musicNote');
    if (play && mute && note) {
      play.hidden = mute.hidden = song.failed;
      note.hidden = !song.failed;
      play.setAttribute('aria-pressed', String(song.playing));
      play.setAttribute('aria-label', song.playing ? 'Pause birthday song' : 'Play birthday song');
      mute.setAttribute('aria-pressed', String(!song.muted));
      mute.setAttribute('aria-label', song.muted ? 'Unmute birthday song' : 'Mute birthday song');
    }
  };
  sound.onchange = syncSoundUI;

  const initMusicControls = () => {
    const box = $('#music');
    if (!box) return;
    box.hidden = false;
    $('#musicPlay').addEventListener('click', () => (sound.music.playing ? sound.music.pause() : sound.music.start()));
    $('#musicMute').addEventListener('click', () => sound.music.setMuted(!sound.music.muted));
    syncSoundUI();
  };

  /* ---------- Incoming call overlay ----------
     Resolves when the visitor has answered and the overlay starts leaving.
     Everything here is simulated: no audio, mic, camera, contacts or real call. */
  const initCall = () => new Promise((resolve) => {
    const root = $('#call');
    if (!root) return resolve();

    const ac = new AbortController();               // one abort() removes every listener below
    const on = (el, type, fn, opts) => el.addEventListener(type, fn, { ...opts, signal: ac.signal });
    const html = document.documentElement;
    const behind = [$('main')].filter(Boolean);
    const q = (id) => $(id, root);
    const thumb = q('#callAnswer'), slide = q('#callSlide'), status = q('#callStatus');
    const incoming = q('#callIncoming'), live = q('#callLive'), toast = q('#callToast'), sheet = q('#callSheet');
    const grid = q('#callGrid'), keypad = q('#callKeypad'), readout = q('#callReadout');
    let state = 'incoming', seconds = 0, tickId = 0, autoId = 0, toastId = 0;

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    html.classList.add('call-active');
    behind.forEach((el) => { el.inert = true; });    // keep the hidden site out of tab order
    window.scrollTo(0, 0);

    const say = (msg) => {
      toast.textContent = msg; toast.classList.add('is-on');
      clearTimeout(toastId); toastId = setTimeout(() => toast.classList.remove('is-on'), 2200);
    };

    /* --- slide to answer (pointer events: mouse + touch + pen) --- */
    let startX = 0, x = 0, max = 0, dragging = false, moved = 0, swallowClick = false;
    const setX = (v) => {
      x = v; thumb.style.setProperty('--x', `${v}px`);
      slide.style.setProperty('--p', max ? (v / max).toFixed(3) : 0);
    };
    on(thumb, 'pointerdown', (e) => {
      if (state !== 'incoming' || (e.pointerType === 'mouse' && e.button !== 0)) return;
      max = slide.clientWidth - thumb.offsetWidth - 8;
      dragging = true; moved = 0; startX = e.clientX;
      thumb.setPointerCapture(e.pointerId); thumb.classList.add('is-drag');
    });
    on(thumb, 'pointermove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      setX(Math.max(0, Math.min(max, dx)));
    });
    const release = () => {
      if (!dragging) return;
      dragging = false; thumb.classList.remove('is-drag');
      if (moved > 8) { swallowClick = true; setTimeout(() => { swallowClick = false; }, 0); }
      if (max && x / max >= 0.78) { setX(max); answer(); } else setX(0);
    };
    on(thumb, 'pointerup', release);
    on(thumb, 'pointercancel', release);
    on(thumb, 'click', () => { if (!swallowClick) answer(); });   // tap / Enter / Space
    on(thumb, 'keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); answer(); } });

    /* --- Remind Me / Message --- */
    on(q('#callRemind'), 'click', (e) => {
      const btn = e.currentTarget, set = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(set));
      $('span', btn).textContent = set ? 'Reminder set' : 'Remind Me';
      say(set ? 'Okay! The surprise will wait for you ⏰' : 'Reminder cancelled');
    });
    const openSheet = () => { sheet.hidden = false; q('#callSheetClose').focus({ preventScroll: true }); };
    const closeSheet = () => { if (sheet.hidden) return; sheet.hidden = true; q('#callMessage').focus({ preventScroll: true }); };
    on(q('#callMessage'), 'click', openSheet);
    on(q('#callSheetClose'), 'click', closeSheet);
    on(q('#callSheetAnswer'), 'click', () => { sheet.hidden = true; answer(); });
    on(root, 'keydown', (e) => { root.classList.add('is-kb'); if (e.key === 'Escape') closeSheet(); });

    /* --- connected state --- */
    const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
    function answer() {
      if (state !== 'incoming') return;
      state = 'live'; seconds = 0;
      sound.ring.stop();
      // Call answered -> birthday song starts very faintly (as if heard from far away) and slowly drifts closer.
      sound.music.a.volume = 0;
      sound.music.unlocked = true;                    // this tap already unlocks audio, no silent priming needed
      sound.music.start();
      sound.music.fade(FAR_VOLUME, FAR_FADE_MS);
      sheet.hidden = true;
      root.classList.add('is-live');
      incoming.hidden = true; live.hidden = false;
      status.textContent = fmt(0);
      tickId = setInterval(() => { seconds += 1; status.textContent = fmt(seconds); }, 1000);
      autoId = setTimeout(proceed, reduceMotion ? 1200 : 2600);
      live.focus({ preventScroll: true });          // focus a neutral element so a key-repeat can't hit "end"
    }
    // Using a control pauses the auto-continue and offers a manual way in.
    const hold = () => { clearTimeout(autoId); q('#callContinue').hidden = false; };
    on(live, 'pointerdown', (e) => { if (e.target.closest('.call__ctl, .call__key, .call__hide')) hold(); });
    on(live, 'keydown', (e) => { if (e.target.closest('.call__ctl, .call__key, .call__hide')) hold(); });

    on(grid, 'click', (e) => {
      const b = e.target.closest('.call__ctl'); if (!b) return;
      const k = b.dataset.ctl;
      if (k === 'mute' || k === 'speaker') {
        const set = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(set));
        say(`${k === 'mute' ? 'Mute' : 'Speaker'} ${set ? 'on' : 'off'} · simulated`);
      } else if (k === 'keypad') { grid.hidden = true; keypad.hidden = false; q('#callHideKeys').focus({ preventScroll: true }); }
      else if (k === 'add') say('Add call is simulated · nothing is dialed');
      else if (k === 'facetime') say('FaceTime is simulated · no camera is used');
      else if (k === 'contacts') say('Contacts are never accessed');
    });
    const keys = q('#callKeys');
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].forEach((d) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'call__key'; b.textContent = d; b.setAttribute('aria-label', d);
      keys.appendChild(b);
    });
    on(keys, 'click', (e) => {
      const b = e.target.closest('.call__key'); if (!b) return;
      readout.textContent = (readout.textContent.trim() + b.textContent).slice(-12);
    });
    on(q('#callHideKeys'), 'click', () => { keypad.hidden = true; grid.hidden = false; });

    on(q('#callEnd'), 'click', endCall);
    on(q('#callContinue'), 'click', proceed);

    // End = harmless: return to the ringing screen, the site is untouched.
    function endCall() {
      if (state !== 'live') return;
      state = 'ended';
      clearInterval(tickId); clearTimeout(autoId);
      status.textContent = 'Call ended'; root.classList.add('is-ended');
      setTimeout(reset, 1100);
    }
    function reset() {
      state = 'incoming'; seconds = 0;
      sound.music.stop(); clearInterval(sound.music.fadeId); sound.music.a.volume = 1;
      root.classList.remove('is-live', 'is-ended');
      live.hidden = true; incoming.hidden = false;
      keypad.hidden = true; grid.hidden = false; readout.innerHTML = '&nbsp;'; q('#callContinue').hidden = true;
      $$('[aria-pressed]', grid).forEach((b) => b.setAttribute('aria-pressed', 'false'));
      status.textContent = 'is calling...';
      sound.ring.start();
      max = slide.clientWidth - thumb.offsetWidth - 8; setX(0);
      thumb.focus({ preventScroll: true });
    }

    // Reveal the site: start leaving, unlock, release the page boot, then clean up.
    function proceed() {
      if (state !== 'live') return;
      state = 'done';
      clearInterval(tickId); clearTimeout(autoId); clearTimeout(toastId);
      sound.ring.stop();
      root.classList.add('is-leaving');
      html.classList.remove('call-active');
      behind.forEach((el) => { el.inert = false; });
      window.scrollTo(0, 0);
      resolve();
      setTimeout(() => { ac.abort(); root.remove(); }, reduceMotion ? 60 : 800);
    }

    // Ringtone loops until answered. Browsers block autoplay, so the first tap / key press starts it.
    const wake = (e) => {
      if (e.target.closest && e.target.closest('#callSound')) return;
      if (state === 'incoming' && !sound.ring.playing) sound.ring.start();
    };
    ['pointerdown', 'pointerup', 'keydown'].forEach((t) => on(root, t, wake, { capture: true }));
    on(q('#callSound'), 'click', () => {
      if (state !== 'incoming') return;
      if (!sound.ring.playing && !sound.ring.muted) return sound.ring.start();   // first tap = start
      sound.ring.setMuted(!sound.ring.muted);
      if (!sound.ring.muted) sound.ring.start();
    });
    sound.ring.start();                                  // only succeeds if the browser allows autoplay

    thumb.focus({ preventScroll: true });
  });

  /* ---------- Boot ---------- */
  initMarquees();
  initFloaters();
  initLetterModal();
  initViewer();
  initDeck();
  initWave();
  initCounters();
  initBurger();
  initVideo();
  initFinal();
  // The old intro now plays out under the call overlay: it finishes the moment the call is answered.
  initCall().then(() => {
    if (!sound.music.wanted) sound.music.start();         // fallback if it was not started during the call
    sound.music.fade(FULL_VOLUME, RISE_MS);              // website opened -> song slowly rises to full volume
    initMusicControls();
    const kick = () => { const m = sound.music; if (m.wanted && !m.playing && !m.failed) m.start(); };
    ['pointerdown', 'touchend', 'keydown'].forEach((t) => window.addEventListener(t, kick, { passive: true }));
    initIntro(() => { initReveal(); initTypewriter(); }, 0);
  });
})();
