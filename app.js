/* Fixed view, no page scroll. Every scroll gesture is one beat of the take: the
   video plays forward from where it stopped to the end of that beat and parks
   there; scrolling up rewinds the same beat.

   What is different here from v4: this cut carries its own interface. The HUD,
   the project cards and the tick row are rendered into the footage, so the page
   adds no cards of its own — it letterboxes the whole frame (cropping would cut
   someone's button in half) and lays transparent anchors over the pixels that
   are supposed to be clickable. The words are repeated in a visually hidden
   block in the markup, because a picture of a sentence is not a sentence.

   The beats are the still holds in the footage, measured off the frames: the
   camera moves, then the picture settles, and the settle is where a scroll
   parks. 105.4s at 30fps, seven marks after the opening, six scrolls. */

const BEATS = [
  { t:   0.00, cue: 'the machine, far off' },
  { t:   8.00, cue: 'framed' },
  { t:  19.00, cue: 'Sidekick',                                    acts: 1 },
  { t:  35.00, cue: 'The Efficiency Engine',                       acts: 1 },
  { t:  63.00, cue: 'round one: Jimmy AI, Neat Freak, Kyron',      acts: 3 },
  { t:  75.00, cue: 'round two: Hero Chat, MatchMate, Swayzee',    acts: 3 },
  { t:  87.00, cue: 'round three: Portals, Troops, That Feeling',  acts: 3 },
  { t: 105.00, cue: 'Daniel Halper',                               acts: 3 },
];

/* Stretches of the take the transport steps over, in either direction. 96–97 is
   a second where nothing moves at all; it is no longer a stop, but played
   through it still reads as the page having frozen mid-run, so the run jumps it
   (and the rewind jumps it back). */
const SKIPS = [[96.00, 97.00]];

/* The take opens on its own: the page does not wait for a scroll to show the
   machine arriving, it plays beat 0 -> 1 the moment the loader lifts. A scroll
   during it is not ignored — it carries straight on to the next beat. */
const INTRO = 1;

/* ---- what is clickable, in the footage's own coordinates --------------------
   Measured off 1920x1080 frames — the pill in the corner of the HUD, the button
   on each card, the links on the closing panel — and written as percentages of
   the frame, so they follow the picture at any size. `beat` is the beat the
   target belongs to; the two HUD pills belong to all of them. */

const FRAME = { w: 1920, h: 1080 };

const HITS = [
  { beat: '*', x: 1566, y:  17, w: 170, h: 43, label: 'Book 15 minutes',
    href: 'mailto:danihalp@me.com?subject=15%20minutes' },
  { beat: '*', x: 1747, y:  17, w: 137, h: 43, label: 'Resume',
    href: 'https://dhalps.com/' },

  { beat: 2,  x: 1586, y: 872, w: 256, h: 56, label: 'Sidekick — full case study',
    href: 'https://sidekick.stepuptutoring.org' },

  { beat: 3,  x: 1580, y: 538, w: 254, h: 54, label: 'The Efficiency Engine — full case study',
    href: 'https://dhalps.com/' },

  { beat: 4,  x: 1590, y: 320, w: 245, h: 52, label: 'Jimmy AI — see a live one',
    href: 'https://www.quickresponse-plumbing.com/' },
  { beat: 4,  x: 1590, y: 588, w: 245, h: 52, label: 'Neat Freak — install it',
    href: 'https://chromewebstore.google.com/detail/neat-freak/gmojchpnnkacfighmaoiofkddbaohpan' },
  { beat: 4,  x: 1583, y: 856, w: 252, h: 52, label: 'Kyron Learning — see the platform',
    href: 'https://app.kyronlearning.com' },

  { beat: 5,  x: 1590, y: 320, w: 245, h: 52, label: 'Hero Chat — full case study', href: 'https://dhalps.com/' },
  { beat: 5,  x: 1590, y: 588, w: 245, h: 52, label: 'MatchMate — full case study', href: 'https://dhalps.com/' },
  { beat: 5,  x: 1590, y: 856, w: 245, h: 52, label: 'Swayzee — full case study',   href: 'https://dhalps.com/' },

  { beat: 6,  x: 1590, y: 320, w: 245, h: 52, label: 'Step Up Portals — full case study',   href: 'https://dhalps.com/' },
  { beat: 6,  x: 1590, y: 588, w: 245, h: 52, label: 'Troops — full case study',            href: 'https://dhalps.com/' },
  { beat: 6,  x: 1590, y: 856, w: 245, h: 52, label: 'That Feeling When — full case study', href: 'https://dhalps.com/' },

  { beat: 7,  x:  992, y: 882, w: 254, h: 50, label: 'Email danihalp@me.com', href: 'mailto:danihalp@me.com' },
  { beat: 7,  x: 1263, y: 884, w: 273, h: 47, label: 'LinkedIn',             href: 'https://linkedin.com/in/daniel-halper' },
  { beat: 7,  x: 1552, y: 884, w: 250, h: 47, label: 'GitHub',               href: 'https://github.com/danielhalper' },
];

/* The eleven boxes along the bottom are in the footage too. They are a map, so
   they are wired as one: tapping a number goes straight to the beat where that
   project is on screen — a cut with a short crossfade, not a run through every
   beat in between. */
const TICK = { x: 745, y: 1006, w: 31, h: 30, step: 40 };
const TICK_BEAT = [2, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];

const EPS    = 0.03;   // seconds; closer than this counts as parked
const RATE   = 1.5;    /* What the number does to the picture: the take is 30fps,
                          so the browser presents 30 x RATE frames a second. On a
                          60Hz screen that is even only when 30 x RATE divides 60
                          — RATE 2 gives exactly 60fps, one new frame per refresh,
                          and 1 gives 30. At 1.5 it is 45fps, which does not
                          divide, so frames are held for two refreshes and then
                          one and the motion carries a faint judder. That is the
                          trade for the slower, more readable pace. (90Hz panels
                          do divide it evenly; 60 and 120 do not.) */
const REWIND = 1.6 * RATE;
const NUDGE  = 26;     // wheel delta that counts as one gesture
const GAP    = 240;    /* ms of wheel silence that ends a gesture. A trackpad
                          swipe keeps sending wheel events long after the finger
                          lifts — the momentum tail, every ~16ms, fading out over
                          a second or two — and a hard swipe used to spend that
                          tail on the next beat, and the next. Now a gesture is
                          the whole stream up to the first real pause, and it
                          moves the take one beat however hard it was. */

const plate = document.getElementById('plate');
const hits  = document.getElementById('hits');
const waitEl = document.getElementById('wait');
const frame = document.getElementById('frame');
const stage = document.getElementById('stage');
const cueEl = document.getElementById('cue');

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

// ---- the hit layer -----------------------------------------------------------

const pc = (v, total) => `${(v / total * 100).toFixed(4)}%`;

function anchor(h, cls) {
  const a = document.createElement('a');
  a.href = h.href;
  a.textContent = h.label;
  if (cls) a.className = cls;
  if (!h.href.startsWith('mailto:')) { a.target = '_blank'; a.rel = 'noopener'; }
  a.style.left   = pc(h.x, FRAME.w);
  a.style.top    = pc(h.y, FRAME.h);
  a.style.width  = pc(h.w, FRAME.w);
  a.style.height = pc(h.h, FRAME.h);
  hits.append(a);
  return a;
}

const targets = HITS.map(h => ({ beat: h.beat, el: anchor(h) }));

TICK_BEAT.forEach((b, i) => {
  const el = anchor({
    x: TICK.x + i * TICK.step, y: TICK.y, w: TICK.w, h: TICK.h,
    href: '#', label: `Go to project ${String(i + 1).padStart(2, '0')}`,
  }, 'tick');
  el.addEventListener('click', e => {
    e.preventDefault();
    if (e.detail) el.blur();          // a mouse or tap click leaves no focus behind; a keyboard one keeps it
    jump(b);
  });
  targets.push({ beat: '*', el });
});

function arm(i) {
  targets.forEach(t => t.el.classList.toggle('on', t.beat === '*' || t.beat === i));
}

// ---- the transport: one beat per gesture ------------------------------------

let beat = 0;      // the beat the footage is parked on (or heading for)
let busy = false;  // …and whether it is still on its way there
let raf = 0;
let seekBack = null;
let seekWait = 0;

function stop() {
  cancelAnimationFrame(raf);
  clearTimeout(seekWait);
  if (seekBack) { plate.removeEventListener('seeked', seekBack); seekBack = null; }
}

// how much of the take is here, measured from where we are standing
function buffered(from) {
  const b = plate.buffered;
  for (let i = 0; i < b.length; i++) {
    if (b.start(i) <= from + 0.1 && from <= b.end(i) + 0.1) return b.end(i);
  }
  return from;
}

/* The take is streamed, so a beat can run past the end of what has arrived.
   There is no point checking the buffer before starting, though: a paused media
   element stops fetching once it has "enough", so a beat that waits for more
   would wait for something that is never coming. Start it, and let the element
   itself say when it is short — which it does, by firing `waiting`. */
/* Kept, but it should never be seen: the take is in memory by the time the page
   opens. It is here for the fallback path, where the element loads the file the
   ordinary way because fetch or streams were unavailable. */
function waiting(on) { waitEl.classList.toggle('on', on); }
plate.addEventListener('waiting', () => { if (busy) waiting(true); });
plate.addEventListener('playing', () => waiting(false));
plate.addEventListener('seeked',  () => waiting(false));

function go(dir) {
  const n = clamp(beat + dir, 0, BEATS.length - 1);
  if (n === beat) return;
  beat = n;
  drive();
}

/* A tick is a map, not a scroll: it goes straight to that project's beat.
   The current picture is held on a canvas over the video, the video seeks
   underneath it, and once the new frame is up the held one fades away. Nothing
   in between is played, forwards or back. */
const fade = document.createElement('canvas');
fade.id = 'xfade';
plate.after(fade);
let cutting = 0;
let pending = 0;          // a scroll that arrived mid-cut, run as soon as it lands

function jump(n) {
  n = clamp(n, 0, BEATS.length - 1);
  if (!revealed || cutting || (n === beat && !busy)) return;
  stop();
  plate.pause();
  hideCue();

  const w = 960, h = 540;
  if (fade.width !== w) { fade.width = w; fade.height = h; }
  try { fade.getContext('2d').drawImage(plate, 0, 0, w, h); } catch (_) {}
  fade.classList.remove('out');
  fade.classList.add('on');

  beat = n;
  busy = true;
  pending = 0;
  const id = ++cutting;
  const done = () => {
    if (cutting !== id) return;
    cutting = 0;
    park();
    requestAnimationFrame(() => fade.classList.add('out'));
    if (pending) { const d = pending; pending = 0; go(d); }
  };
  plate.addEventListener('seeked', () => afterFrame(done), { once: true });
  setTimeout(done, 900);              // never strand the page behind the still
  plate.currentTime = BEATS[n].t;
}

// once the frame for the current position is actually on screen
function afterFrame(fn) {
  if (plate.requestVideoFrameCallback) {
    let ran = false;
    const go = () => { if (!ran) { ran = true; fn(); } };
    plate.requestVideoFrameCallback(go);
    setTimeout(go, 120);              // a paused element may not present again
  } else requestAnimationFrame(() => requestAnimationFrame(fn));
}

// a position inside a skipped stretch, moved to the side we are heading for
function overSkip(t, dir) {
  for (const [a, b] of SKIPS) if (t > a + EPS && t < b - EPS) return dir > 0 ? b : a;
  return t;
}

function drive() {
  stop();
  hideCue();
  const target = BEATS[beat].t;
  const gap = target - plate.currentTime;

  if (Math.abs(gap) <= EPS) { park(); return; }
  busy = true;

  if (gap > 0) {
    plate.playbackRate = RATE;      // some browsers reset the rate on a source change
    plate.play().catch(() => {});   // forward is real playback, so it never judders
    const fwd = () => {
      const now = plate.currentTime;
      if (now >= target - EPS) return park();
      for (const [a, b] of SKIPS) {
        if (now >= a - EPS && now < b - EPS && b <= target) { plate.currentTime = b; break; }
      }
      raf = requestAnimationFrame(fwd);
    };
    raf = requestAnimationFrame(fwd);
  } else {
    /* Backwards is a run of seeks, not playback. Asking every animation frame
       piles requests on a decoder that is still working on the last one, which
       is what makes a rewind lurch; ask for the next position only once the
       previous has been presented and it runs as fast as the decoder can hold. */
    plate.pause();
    waiting(false);
    let last = performance.now();
    const back = () => {
      clearTimeout(seekWait);
      const now = performance.now();
      const step = Math.min((now - last) / 1000, 1 / 20) * REWIND;
      last = now;
      // the gap the forward run jumped is not worth crawling back through
      let t = overSkip(plate.currentTime - step, -1);
      if (t <= target + EPS) return park();
      seekBack = back;
      plate.addEventListener('seeked', back, { once: true });
      seekWait = setTimeout(() => { if (seekBack === back) back(); }, 400);
      plate.currentTime = t;
    };
    back();
  }
}

function park() {
  stop();
  plate.pause();
  waiting(false);
  // only snap if we are actually off; forward playback lands within a frame of
  // the mark and seeking back to it would show as a stutter
  if (Math.abs(plate.currentTime - BEATS[beat].t) > EPS) plate.currentTime = BEATS[beat].t;
  busy = false;
  arm(beat);
  paint(true);
  scheduleCue();
}

// ---- gestures ---------------------------------------------------------------

let acc = 0, quiet = 0, spent = false;

function intent(d) {
  hideCue();
  if (!revealed) return false;
  if (cutting) { pending = d; return true; }   // mid-crossfade: hold it, run it when the cut lands
  if (busy) { beat = clamp(beat + d, 0, BEATS.length - 1); drive(); return true; }  // a new gesture mid-run chains on
  go(d);
  return true;
}

addEventListener('wheel', e => {
  e.preventDefault();
  // a scroll is never aimed at a link: let go of any tick or button still holding focus
  if (document.activeElement && document.activeElement.closest && document.activeElement.closest('#hits')) document.activeElement.blur();
  clearTimeout(quiet);
  quiet = setTimeout(() => { acc = 0; spent = false; }, GAP);
  if (spent) return;                  // this gesture has had its beat; the rest is momentum
  acc += e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? innerHeight : 1);
  if (Math.abs(acc) >= NUDGE) { const d = Math.sign(acc); acc = 0; spent = intent(d); }
}, { passive: false });

addEventListener('keydown', e => {
  const d = { ArrowDown: 1, PageDown: 1, ' ': 1, ArrowUp: -1, PageUp: -1 }[e.key];
  if (d === undefined) return;
  /* only Space is a link's own key; the arrows and Page keys always drive the
     take, even with a tick or a card button focused — that focus is what used
     to leave the keyboard dead after clicking a tick */
  if (e.key === ' ' && e.target.closest('a')) return;
  e.preventDefault();
  if (e.repeat) return;                    // a held key is one press, like a swipe
  intent(d);
});

let touchY = null;
addEventListener('touchstart', e => { touchY = e.touches[0].clientY; }, { passive: true });
addEventListener('touchmove', e => {
  if (touchY === null) return;
  const dy = touchY - e.touches[0].clientY;
  if (Math.abs(dy) > 40) { touchY = null; intent(Math.sign(dy)); }
}, { passive: true });
addEventListener('touchend', () => { touchY = null; });

// ---- the bands either side ---------------------------------------------------
/* A screen wider (or taller) than 16:9 leaves bands round the frame. They are
   plain colour — no picture in them — but not one fixed colour: the take's floor
   shifts from amber to deep orange between beats, so any single paint is wrong
   somewhere. Each band is filled with the floor colour at its own edge of the
   frame: a strip of the outermost pixels is shrunk to 32 samples, anything that
   is not floor (the blue machine, a card, a toy, the white court lines) is
   thrown out, and the median of what is left is the colour. It is re-read a few
   times a second while the take moves, and the band eases to it, so it follows
   the floor without ever showing a pattern. */
const STRIP = 8;          // source pixels at each edge
const SAMPLES = 32;
const BANDS = ['l', 'r', 't', 'b'].map(k => {
  const el = document.createElement('div');
  el.className = `band ${k}`;
  stage.prepend(el);
  return { k, el, on: false, rgb: '' };
});
const probe = document.createElement('canvas');
probe.width = SAMPLES; probe.height = SAMPLES + 2;   // cols 0/1: left/right edge · last two rows: top/bottom edge
const pctx = probe.getContext('2d', { willReadFrequently: true });

function place() {
  const r = frame.getBoundingClientRect();
  const W = innerWidth, H = innerHeight;
  const off = upright.matches;        // upright phones keep the preview card
  const px = v => `${Math.round(v)}px`;
  for (const b of BANDS) {
    const s = b.el.style;
    if (b.k === 'l') { b.on = r.left > 1;       Object.assign(s, { left: '0', top: '0', width: px(r.left + 1), height: '100%' }); }
    if (b.k === 'r') { b.on = W - r.right > 1;  Object.assign(s, { left: px(r.right - 1), top: '0', width: px(W - r.right + 1), height: '100%' }); }
    if (b.k === 't') { b.on = r.top > 1;        Object.assign(s, { left: '0', top: '0', width: '100%', height: px(r.top + 1) }); }
    if (b.k === 'b') { b.on = H - r.bottom > 1; Object.assign(s, { left: '0', top: px(r.bottom - 1), width: '100%', height: px(H - r.bottom + 1) }); }
    if (off) b.on = false;
    b.el.classList.toggle('on', b.on);
  }
  paint(true);
}

// the floor: warm, saturated, not too dark — the machine is blue, the cards are
// blue, the court lines are near-white, the toys are everything else
function floorish(r, g, b) {
  return r > 120 && r >= g && g > b && r - b > 90 && r - g < 120;
}
function median(list) {
  const v = list.slice().sort((x, y) => x - y);
  return v[v.length >> 1];
}
function tone(data, at) {
  const R = [], G = [], B = [];
  for (const i of at) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    if (floorish(r, g, b)) { R.push(r); G.push(g); B.push(b); }
  }
  if (R.length < 4) return '';        // edge covered: keep the last colour
  return `rgb(${median(R)}, ${median(G)}, ${median(B)})`;
}

let lastPaint = 0;
function paint(now) {
  const vw = plate.videoWidth, vh = plate.videoHeight;
  if (!vw || plate.readyState < 2 || !BANDS.some(b => b.on)) return;
  const t = performance.now();
  if (!now && t - lastPaint < 150) return;   // a few reads a second is plenty for a plain colour
  lastPaint = t;
  let data;
  try {
    pctx.drawImage(plate, 0, 0, STRIP, vh, 0, 0, 1, SAMPLES);
    pctx.drawImage(plate, vw - STRIP, 0, STRIP, vh, 1, 0, 1, SAMPLES);
    pctx.drawImage(plate, 0, 0, vw, STRIP, 0, SAMPLES, SAMPLES, 1);
    pctx.drawImage(plate, 0, vh - STRIP, vw, STRIP, 0, SAMPLES + 1, SAMPLES, 1);
    data = pctx.getImageData(0, 0, SAMPLES, SAMPLES + 2).data;
  } catch (_) { return; }             // a frame not ready yet: the ground colour shows
  const col = x => Array.from({ length: SAMPLES }, (_, y) => (y * SAMPLES + x) * 4);
  const row = y => Array.from({ length: SAMPLES }, (_, x) => (y * SAMPLES + x) * 4);
  const at = { l: col(0), r: col(1), t: row(SAMPLES), b: row(SAMPLES + 1) };
  for (const b of BANDS) {
    if (!b.on) continue;
    const c = tone(data, at[b.k]);
    if (c && c !== b.rgb) { b.rgb = c; b.el.style.backgroundColor = c; }
  }
}

// re-read on the frames the video presents (throttled above), and on every park
if (plate.requestVideoFrameCallback) {
  const each = () => { paint(); plate.requestVideoFrameCallback(each); };
  plate.requestVideoFrameCallback(each);
} else {
  let loop = 0;
  const tick = () => { paint(); if (!plate.paused) loop = requestAnimationFrame(tick); };
  plate.addEventListener('play', () => { cancelAnimationFrame(loop); loop = requestAnimationFrame(tick); });
}
plate.addEventListener('seeked', () => paint(true));
plate.addEventListener('loadeddata', place);
addEventListener('resize', place);

// ---- the scroll cue -------------------------------------------------------------
/* The footage says SCROLL in small type in its corner, which is easy to miss.
   So when the take has parked and nobody has moved for a moment, a small cue
   rises at the bottom centre, under the tick row — the one strip of the frame
   that stays clear on every beat — a mouse with its wheel turning, or on a touch
   screen two chevrons climbing. It goes the instant anyone does anything.
   Never on the last beat: there is nothing further to scroll to. */
const IDLE = 1400;
const touchy = matchMedia('(hover: none) and (pointer: coarse)');
let cueWait = 0;

function setCueMode() {
  cueEl.classList.toggle('touch', touchy.matches);
  cueEl.querySelector('b').textContent = touchy.matches ? 'Swipe up' : 'Scroll';
}
setCueMode();
touchy.addEventListener('change', setCueMode);

function scheduleCue() {
  clearTimeout(cueWait);
  if (!revealed || beat >= BEATS.length - 1) return;
  cueWait = setTimeout(() => { if (!busy && !cutting) cueEl.classList.add('on'); }, IDLE);
}
function hideCue() {
  clearTimeout(cueWait);
  cueEl.classList.remove('on');
}

// ---- turn your phone ---------------------------------------------------------

const rotateTip = document.getElementById('rotate');
const upright = matchMedia('(orientation: portrait) and (max-width: 900px)');
let turnOff = 0;

/* In v4 this was a three-second nudge, because the page still worked upright.
   Here it does not: the interface is rendered into a 16:9 frame, and letterboxed
   into a portrait phone that frame is a strip two centimetres tall. So the ask
   stands until the phone is turned — but it can be waved away, because telling
   someone they may not look at a page is worse than a small page. */
function hintTurn() {
  if (!upright.matches || dismissed) return;
  rotateTip.classList.add('on');
}
let dismissed = false;
rotateTip.addEventListener('click', () => {
  dismissed = true;
  rotateTip.classList.remove('on');
});
upright.addEventListener('change', e => {
  clearTimeout(turnOff);
  if (e.matches) hintTurn(); else rotateTip.classList.remove('on');
  place();
});

// ---- loader ------------------------------------------------------------------
/* 55MB is too much to hold the page on, so this one streams: the claw rides
   down on how much has actually buffered and the page opens once there are
   PRELOAD seconds in hand — enough to scroll into while the rest arrives. */

const SRC = 'video.mp4';

const loader = document.getElementById('loader');
const pct = document.getElementById('pct');
const buf = document.getElementById('buf');
let revealed = false;

function progress(p) {
  loader.style.setProperty('--p', p.toFixed(3));
  pct.textContent = `${Math.round(p * 100)}%`;
}

function reveal() {
  if (revealed) return;
  revealed = true;
  progress(1);
  park();                              // beat 0 is set behind the loader

  loader.classList.add('grab');
  setTimeout(() => loader.classList.add('lift'), 260);
  setTimeout(() => {
    loader.classList.add('gone');
    document.documentElement.classList.remove('loading');
  }, 620);
  setTimeout(() => {
    loader.remove();
    hintTurn();
    // and the take opens itself
    if (beat === 0) { beat = INTRO; drive(); }
  }, 1300);
}

/* The whole file is downloaded before the page is shown, and then handed to the
   <video> as a blob. The streamed version opened sooner but a beat could outrun
   the network mid-move, which is the lag: a plain src leaves the browser free to
   fetch in dribs, and every beat that runs into a gap stalls. Once it is a blob
   there is no network left in the loop — playback and the rewind seeks are all
   out of memory. It costs a longer wait at the door; it buys a take that never
   catches. */
function handOver(url) {
  plate.addEventListener('loadeddata', reveal, { once: true });
  plate.addEventListener('error', reveal, { once: true });
  plate.src = url;
  plate.load();
}

async function download() {
  const res = await fetch(SRC);
  if (!res.ok) throw new Error(res.status);

  const total = Number(res.headers.get('content-length')) || 0;
  const chunks = [];
  let got = 0;

  const reader = res.body.getReader();
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    got += value.length;
    if (total) {
      progress(clamp(got / total, 0, 1));
      buf.textContent = `· ${(got / 1048576).toFixed(1)} / ${(total / 1048576).toFixed(1)} MB`;
    }
  }
  handOver(URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' })));
}

// no streams, no fetch, or the file simply is not there: let the element load it
// the ordinary way rather than hanging on a blank page
download().catch(() => handOver(SRC));

// ---- self-check: #selftest ---------------------------------------------------
if (location.hash === '#selftest') {
  const fails = [];
  BEATS.forEach((b, i) => {
    if (i && b.t <= BEATS[i - 1].t) fails.push(`beat ${i} does not run forward`);
    if (!b.cue) fails.push(`beat ${i} has no cue`);
  });
  HITS.forEach((h, i) => {
    if (h.x < 0 || h.y < 0 || h.x + h.w > FRAME.w || h.y + h.h > FRAME.h) fails.push(`hit ${i} falls outside the frame`);
    if (h.beat !== '*' && !BEATS[h.beat]) fails.push(`hit ${i} points at no beat`);
    if (h.beat !== '*' && !BEATS[h.beat].acts) fails.push(`hit ${i} sits on a beat with nothing to press`);
  });
  BEATS.forEach((b, i) => {
    const n = HITS.filter(h => h.beat === i).length;
    if ((b.acts || 0) !== n) fails.push(`beat ${i} shows ${b.acts || 0} buttons but ${n} are wired`);
  });
  if (TICK_BEAT.length !== 11) fails.push('the tick row is not eleven');
  if (!BEATS[INTRO]) fails.push('the intro beat does not exist');
  SKIPS.forEach(([a, b], i) => {
    if (b <= a) fails.push(`skip ${i} does not run forward`);
    if (BEATS.some(m => m.t > a + EPS && m.t < b - EPS)) fails.push(`skip ${i} swallows a beat`);
  });
  TICK_BEAT.forEach((b, i) => { if (!BEATS[b]) fails.push(`tick ${i} points at no beat`); });
  plate.addEventListener('loadedmetadata', () => {
    const end = BEATS[BEATS.length - 1].t;
    if (end > plate.duration) fails.push(`last beat ${end}s is past the ${plate.duration.toFixed(2)}s take`);
    console.log(fails.length ? `selftest FAILED\n - ${fails.join('\n - ')}`
                             : `selftest ok — ${BEATS.length - 1} scrolls, ${targets.length} targets, take ${plate.duration.toFixed(2)}s`);
  }, { once: true });
}
