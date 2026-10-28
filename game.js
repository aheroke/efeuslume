/* =================================================================
   EFE WORLD 1-1  —  a playable résumé
   Vanilla canvas platformer. No dependencies; the only asset files are
   Efe's sprite atlas + site art in assets/efe (tools/build_sprites.py).
   Hero = Efe himself × Mario. Palette threads the
   Persona-4 / Fenerbahçe yellow throughout.
   ================================================================= */
(() => {
'use strict';

/* ---------------------------------------------------------------- *
 *  CONTENT  (pulled from CV + the fun facts)
 * ---------------------------------------------------------------- */
// All game-side copy lives here per language. Site copy is captured from the
// DOM (TR) + overridden from SITE_EN (EN). QUIZ/PROJECTS/BONUS are set by applyLang().
let QUIZ, PROJECTS, BONUS, lang = 'tr';

const GAME_STR = {
  tr: {
    quiz: [
      { q: 'Hangi alan benim mühendisliğim?', opts: ['Bilgisayar', 'Kontrol & Otomasyon', 'Makine'], correct: 1,
        reveal: 'Control Engineer — Kontrol & Otomasyon. Şimdi Tsukuba Digital Control Lab’deyim.' },
      { q: 'Nereliyim?', opts: ['Ankara', 'İzmir', 'Bursa'], correct: 2,
        reveal: 'Bursalıyım — Gemlik. Dünyanın en güzel semti.' },
      { q: 'En sevdiğim Hasır Şapka üyesi?', opts: ['Luffy', 'Zoro', 'Brook'], correct: 2,
        reveal: 'Brook! Yohohoho~' },
      { q: 'Persona 4’te favori karakterim (waifu)?', opts: ['Chie', 'Yukiko', 'Rise'], correct: 1,
        reveal: 'Yukiko — her zaman ve sonsuza dek.' },
      { q: 'League of Legends’te en çok oynadığım şampiyon?', opts: ['Ahri', 'Lillia', 'Akali'], correct: 1,
        reveal: 'Lillia — 750k uzmanlık. S24 · TR 23. · Dünya 127.' },
      { q: 'N5 seviyesinde hangi dili öğreniyorum?', opts: ['Korece 한국어', 'Japonca 日本語', 'Çince 中文'], correct: 1,
        reveal: 'Türkçe (ana dil) · English · 日本語 (Japonca N5).' },
    ],
    projects: [
      { title: 'ANLAMETRE', body: 'Günlük Türkçe kelime tahmin oyunu — gizliyi anlamca yakın kelimelerle bul. fastText + NLP.', link: 'https://anlametre.tech', linkLabel: 'anlametre.tech →' },
      { title: 'ARADA', body: 'İki kelimenin arasına alfabetik giren kelimeyi bul. iOS uygulaması, baştan sona tek başıma.', link: 'https://apps.apple.com/us/app/arada-kelime-oyunu/id6749009793', linkLabel: 'App Store →' },
    ],
    bonus: [
      { title: 'CEPHANELİK', body: 'Python · JavaScript · Arduino · MATLAB · PLC (TIA Portal) · Soft Robotik · Firebase.' },
      { title: 'ÇILGIN TEORİ', body: 'Atomlar da bizim gibi birer evren olabilir; bizden büyük evrenler de bizi gözlüyordur. Boyut ve zaman farkından göremiyoruz sadece.' },
      { title: 'İTİRAF', body: 'Maalesef Fenerbahçeliyim. Tedavi olmaya çalışıyorum.' },
    ],
    ui: { quiz: 'SORU', project: 'PROJE', bonus: 'BONUS', continue: 'DEVAM ▶',
      correct: '✓ Doğru!  ', wrong: '✗ Yanlış.  ', visit: 'Ziyaret et →',
      statCorrect: 'doğru', statProjects: 'proje', statCoins: 'madeni' },
  },
  en: {
    quiz: [
      { q: 'What kind of engineer am I?', opts: ['Computer', 'Control & Automation', 'Mechanical'], correct: 1,
        reveal: 'Control Engineer — Control & Automation. Now at the Tsukuba Digital Control Lab.' },
      { q: 'Where am I from?', opts: ['Ankara', 'İzmir', 'Bursa'], correct: 2,
        reveal: 'Bursa — Gemlik, the most beautiful district in the world.' },
      { q: 'My favorite Straw Hat crew member?', opts: ['Luffy', 'Zoro', 'Brook'], correct: 2,
        reveal: 'Brook! Yohohoho~' },
      { q: 'My favorite Persona 4 character (waifu)?', opts: ['Chie', 'Yukiko', 'Rise'], correct: 1,
        reveal: 'Yukiko — now and forever.' },
      { q: 'My most-played champion in League of Legends?', opts: ['Ahri', 'Lillia', 'Akali'], correct: 1,
        reveal: 'Lillia — 750k mastery. S24 · TR 23rd · World 127th.' },
      { q: 'Which language am I learning (N5)?', opts: ['Korean 한국어', 'Japanese 日本語', 'Chinese 中文'], correct: 1,
        reveal: 'Turkish (native) · English · 日本語 (Japanese, N5).' },
    ],
    projects: [
      { title: 'ANLAMETRE', body: 'A daily Turkish word-guessing game — find the hidden word with words close to it in meaning. fastText + NLP.', link: 'https://anlametre.tech', linkLabel: 'anlametre.tech →' },
      { title: 'ARADA', body: 'Guess the word that falls alphabetically between two others. iOS app, built end-to-end, solo.', link: 'https://apps.apple.com/us/app/arada-kelime-oyunu/id6749009793', linkLabel: 'App Store →' },
    ],
    bonus: [
      { title: 'ARSENAL', body: 'Python · JavaScript · Arduino · MATLAB · PLC (TIA Portal) · Soft Robotics · Firebase.' },
      { title: 'WILD THEORY', body: 'Atoms might be whole universes, like us; and universes bigger than us might be watching back. We just can’t see it — scale and time.' },
      { title: 'CONFESSION', body: 'Unfortunately, I support Fenerbahçe. Seeking treatment.' },
    ],
    ui: { quiz: 'QUIZ', project: 'PROJECT', bonus: 'BONUS', continue: 'CONTINUE ▶',
      correct: '✓ Correct!  ', wrong: '✗ Wrong.  ', visit: 'Visit →',
      statCorrect: 'correct', statProjects: 'projects', statCoins: 'coins' },
  },
};

// English overrides for the static [data-i18n] site/game-chrome elements.
// TR is taken from the DOM as authored, so only EN is listed here.
const SITE_EN = {
  'hud.goal': '⚑ CASTLE →', 'touch.jump': 'jump',
  'start.eyebrow': 'EFE WORLD  1-1',
  'start.title': 'WANNA PLAY A<br />LITTLE GAME TO<br /><span class="accent">GET TO KNOW ME?</span>',
  'start.sub': 'Headbutt the ? blocks, stomp the enemies,<br />reach the flag. Get to know me along the way.',
  'start.play': '▶ PLAY',
  'start.kb1': '<b>← →</b> / <b>A D</b> move', 'start.kb2': '<b>SPACE</b> / <b>↑</b> / <b>W</b> jump',
  'start.touch1': '<b>◀ ▶</b> move', 'start.touch2': '<b>Ⓐ</b> jump',
  'start.skip': 'or skip straight to the site →',
  'end.title': 'YOU’RE AWESOME!', 'end.sub': 'Thanks for taking the time to get to know me.',
  'end.enter': 'ENTER THE SITE ▶',
  'nav.about': 'About', 'nav.fun': 'Fun Zone', 'nav.work': 'Worlds', 'nav.projects': 'Projects',
  'nav.contact': 'Contact', 'nav.replay': '↻ Play the game',
  'hero.role': 'Control Engineer <span class="x">×</span> Full-stack Developer',
  'hero.lead': 'Right now I’m at the University of Tsukuba’s Digital Control Lab, doing a master’s in Systems and Information Engineering — Intelligent and Mechanical Interaction Systems. Writing code and designing sites is my personal hobby.',
  'hero.cta1': 'See my work', 'hero.cta2': 'Say hi',
  'about.kicker': '01 — ABOUT', 'about.heading': 'Me, briefly.',
  'about.body': 'I’m Efe. From Bursa, currently in Japan. None of that really matters, though. The things that do: my favorite Straw Hat is <b>Brook</b>, my Persona 4 waifu will forever be <b>Yukiko</b>, and — most importantly — I have 750k mastery on <b>Lillia</b> in League of Legends (S24 · TR 23rd · World 127th). And, unfortunately, I support Fenerbahçe; I’m seeking treatment.',
  'about.fact1': 'YTU · Control & Automation Eng. (2018–2024)',
  'about.fact2': 'Turkish · English · 日本語 (N5)',
  'fun.kicker': '02 — FUN ZONE',
  'fun.heading': 'To really know someone, you should know the most useless things about them.',
  'fun.c1.t': 'A wild theory',
  'fun.c1.b': 'My biggest theory: atoms are actually star systems — whole universes — just like ours. And universes far bigger than us watch us the same way we watch atoms; they just can’t quite see us, across the gap in scale and time.',
  'fun.c2.t': 'Three things I can’t eat',
  'fun.c2.b': 'Cauliflower, tahini and chestnut. The only three foods in the world I can’t eat.',
  'fun.c3.t': 'Seven deadly sins',
  'fun.c3.b': 'The ones that suit me best are probably pride and sloth.',
  'work.kicker': '03 — WORLDS',
  'work.w1': 'Eighteen epic years in Gemlik — the most beautiful district of the most beautiful city in the world. They’ll talk about it for centuries.',
  'work.w2': 'The stagnation era. Six years of chaos and stress.',
  'work.w3': 'The rise, and some peace. Gathering strength to write the next saga.',
  'projects.kicker': '04 — PROJECTS', 'projects.heading': 'Things I’ve made',
  'proj.anlametre': 'A daily Turkish word-guessing game — find the hidden word by typing words close to it in meaning. I built the UI/UX, backend and database solo. NLP similarity scoring with fastText word vectors.',
  'proj.arada': 'A daily word puzzle — guess the word that falls alphabetically <em>between</em> two given words in the dictionary. An iOS app; I ran the whole development process solo.',
  'skills.kicker': '05 — ARSENAL', 'skills.col1': 'Programming', 'skills.col2': 'Tools', 'skills.col3': 'Technologies',
  'skill.control': 'Control Systems', 'skill.automation': 'Automation', 'skill.softrobotics': 'Soft Robotics', 'skill.imaging': 'Image Processing',
  'contact.kicker': '06 — CONTACT', 'contact.heading': 'Next level together?',
  'contact.lead': 'Always up for academic, scientific, or a good One Piece discussion.',
  'contact.replay': '↻ Play again',
  'song.label': '♪ MY FAVOURITE SONG LATELY', 'song.play': '► LISTEN',
  'footer.note': 'Made with Press Start 2P',
};

// Document <title> + meta description per language.
const META = {
  tr: { title: 'Efe | Kişisel Bilgiler', desc: 'Efe Uslu, dünyaya kendini tanıtıyor.' },
  en: { title: 'Efe | Personal Information', desc: 'Efe Uslu introduces himself to the world.' },
};

/* ---------------------------------------------------------------- *
 *  PIXEL SPRITES  (rows of color keys; '.' = transparent)
 *  normalizeSprite() pads every row so a miscount can't break art.
 * ---------------------------------------------------------------- */
const PAL = {
  // stand-in mini Efe (only drawn until the sprite atlas loads)
  h: '#3b2418', H: '#6b4128', R: '#e52521', S: '#f4c28c', s: '#d99a63',
  E: '#1a1024', B: '#2f63d6', N: '#101a4c',
  // turtle
  G: '#2aa53a', g: '#176b25', Y: '#ffe08a', F: '#e0b84a', W: '#ffffff',
  // crab
  O: '#e8702a', o: '#b4500f', P: '#ffd2b0',
};

function normalizeSprite(rows, w) {
  return rows.map(r => (r.length >= w ? r.slice(0, w) : r + '.'.repeat(w - r.length)));
}

// tiny stand-in, feet on the bottom row; drawHero() uses it until the atlas loads
const HERO = normalizeSprite([
  '....hhhhhh......',
  '...hhHhhHhh.....',
  '..hhhhhhhhhh....',
  '..hhhhhhhhhh....',
  '..hhSSSSSShh....',
  '..hSSESSSESh....',
  '...SSSSSSSS.....',
  '....sSSSSs......',
  '...RRRWWRRR.....',
  '..SRRRWWRRRS....',
  '..SRRRWWRRRS....',
  '...RRRRRRRR.....',
  '...NNNNNNNN.....',
  '...NNN..NNN.....',
  '...NNN..NNN.....',
  '..WWWR..WWWR....',
], 16);

/* ---------------------------------------------------------------- *
 *  HERO SPRITES — one atlas, built by tools/build_sprites.py from
 *  assets/animationsheet.png. Each frame sits in a cw×ch cell with the
 *  soles on the cell's bottom edge and the head centred, so frames never
 *  jitter and mirroring never shifts. density = atlas px per game px.
 *  anims: atlas row, frames to play (sheet order, 0-based), fps.
 * ---------------------------------------------------------------- */
const HERO_SHEET = {
  src: 'assets/efe/sprites.webp?v=efe-20261029-hd',
  cw: 200, ch: 155, density: 5,
  anims: {
    idle: { row: 0, frames: [0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 3, 4, 5], fps: 8 },
    walk: { row: 1, frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 20 },   // matches the outro's 1.4 px/frame
    run:  { row: 2, frames: [0, 1, 2, 3, 4, 5, 6, 7], fps: 18 },   // at full speed
    jump: { row: 3, frames: [2], fps: 1 },
    apex: { row: 3, frames: [3], fps: 1 },
    fall: { row: 3, frames: [4], fps: 1 },
    land: { row: 4, frames: [1], fps: 1 },
    hurt: { row: 4, frames: [0], fps: 1 },
    win:  { row: 5, frames: [1, 2, 3, 4, 3, 2], fps: 8 },
  },
};
const heroImg = new Image();
let heroReady = false;
function loadHeroSheet() {
  heroImg.onload = () => { heroReady = true; };
  heroImg.src = HERO_SHEET.src;
}

const TURTLE = normalizeSprite([
  '................',
  '................',
  '.......ggggg....',
  '.....ggGGGGgg...',
  '....gGGGGGGGGg..',
  '...gGGYYYYYGGg..',
  '..EWGGYYYYYGGGg.',
  '..EWGGYYYYYGGGg.',
  '...gGGYYYYYGGg..',
  '....gGGGGGGGGg..',
  '.....gGGGGGGg...',
  '......gggggg....',
  '.....F.....F....',
  '....FF.....FF...',
  '................',
  '................',
], 16);

const CRAB = normalizeSprite([
  '................',
  '................',
  '................',
  '..o..........o..',
  '.oOo........oOo.',
  '..oOo......oOo..',
  '...oOoooooooOo..',
  '..oOOOOOOOOOOOo.',
  '.oOWEOOOOOWEOOo.',
  '.oOOOOOOOOOOOOo.',
  '..ooOOOOOOOOoo..',
  '...o.o.o.o.o.o..',
  '..o..o...o..o...',
  '................',
  '................',
], 16);

const QGLYPH = [
  '01110',
  '10001',
  '00010',
  '00100',
  '00100',
  '00000',
  '00100',
];

/* ---------------------------------------------------------------- *
 *  CONSTANTS
 * ---------------------------------------------------------------- */
const T = 16;                 // tile size
const VIEW_W = 256, VIEW_H = 240;
const MAX_RENDER_SCALE = 6;   // backing px per game px follows the screen (see fitCanvas), capped here
const ROWS = 15;
const GRAVITY = 0.46;
const MOVE = 0.30, MAXVX = 1.95, AIR = 0.22;
const JUMP = -7.7, JUMP_CUT = 0.45, COYOTE = 6;
const ESPD = 0.34;

/* ---------------------------------------------------------------- *
 *  LEVEL  — built programmatically so columns always line up
 * ---------------------------------------------------------------- */
const W = 96;                 // world width in tiles
const GROUND = 13;            // top ground row (13 & 14 solid)
let tiles, bump, qIndexMap, enemies, coins, flagX, castleX, startX;

function buildLevel() {
  tiles = Array.from({ length: ROWS }, () => Array(W).fill(' '));
  bump = new Map();           // "c,r" -> animation phase
  qIndexMap = new Map();
  enemies = [];
  coins = [];

  const set = (c, r, ch) => { if (r >= 0 && r < ROWS && c >= 0 && c < W) tiles[r][c] = ch; };
  const fill = (c0, c1, r, ch) => { for (let c = c0; c <= c1; c++) set(c, r, ch); };
  const ground = (c0, c1) => { fill(c0, c1, 13, '#'); fill(c0, c1, 14, '#'); };

  // floor with two forgiving pits
  ground(0, 37); ground(40, 70); ground(73, W - 1);

  startX = 2 * T;

  // ? blocks (cols 7,12,25,29,43,57) -> QUIZ 0..5 by x order
  [7, 12, 25, 43, 57].forEach(c => set(c, 9, '?'));
  // bricks around a couple of them
  fill(10, 11, 9, '='); set(12, 9, '?');
  // elevated brick platform with a ? (col 29 @ row 8)
  fill(28, 30, 8, '='); set(29, 8, '?');
  coins.push(c2(29, 6), c2(30, 6));

  // pipes (2 wide). top row, then body to ground.
  pipe(20, 11);   // 2 tall
  pipe(61, 10);   // 3 tall

  // enemies — each kept in a zone fenced by pipes/pits so none roams into spawn
  // turtles -> PROJECTS (2), crabs -> BONUS (3), assigned by x order in buildLevel()
  enemies.push(mkEnemy('crab', 30));     // BONUS 0  cephanelik    (zone 22–37)
  enemies.push(mkEnemy('turtle', 44));   // PROJECT 0  Anlametre    (zone 40–60)
  enemies.push(mkEnemy('turtle', 50));   // PROJECT 1  Arada        (zone 40–60)
  enemies.push(mkEnemy('crab', 56));     // BONUS 1  çılgın teori  (zone 40–60)
  enemies.push(mkEnemy('crab', 66));     // BONUS 2  itiraf        (zone 63–70)

  // coin arcs over the pits + a few treats
  [5, 6, 24, 25, 26].forEach(c => coins.push(c2(c, 10)));
  [38, 39].forEach((c, i) => coins.push(c2(c, 8 - i)));
  [44, 45, 46].forEach(c => coins.push(c2(c, 7)));
  [71, 72].forEach(c => coins.push(c2(c, 7)));

  // Mario staircase up to the flag (cols 73..77)
  for (let i = 0; i < 5; i++) fill(73 + i, 77, 12 - i, '#');

  // flag + castle
  flagX = 82 * T;
  for (let r = 4; r <= 12; r++) set(82, r, '|');   // pole marker (non-solid)
  castleX = 87 * T;

  // assign ? -> fact index by (left→right, top→bottom)
  let qi = 0;
  for (let c = 0; c < W; c++)
    for (let r = 0; r < ROWS; r++)
      if (tiles[r][c] === '?') qIndexMap.set(c + ',' + r, qi++);

  // assign enemy reveal indices by x order
  enemies.sort((a, b) => a.x - b.x);
  let pi = 0, bi = 0;
  enemies.forEach(e => {
    if (e.type === 'turtle') e.reveal = { type: 'project', data: PROJECTS[pi++] };
    else e.reveal = { type: 'bonus', data: BONUS[bi++] };
  });

  function pipe(c, topRow) {
    set(c, topRow, 'T'); set(c + 1, topRow, 'Y');
    for (let r = topRow + 1; r <= 12; r++) { set(c, r, 'I'); set(c + 1, r, 'i'); }
  }
}
function c2(c, r) { return { x: c * T + T / 2, y: r * T + T / 2, got: false }; }
function mkEnemy(type, col) {
  return { type, x: col * T, y: (GROUND - 1) * T, w: 14, h: 14, vx: -ESPD, vy: 0,
           dir: -1, dead: false, deadT: 0, reveal: null };
}

const SOLID = new Set(['#', '=', '?', 'U', 'T', 'Y', 'I', 'i']);
function tileAt(c, r) { return (r < 0 || r >= ROWS || c < 0 || c >= W) ? ' ' : tiles[r][c]; }
// left/right world edges act as invisible walls (so nothing gets knocked off-screen);
// vertical out-of-bounds stays open so pits still work.
function solidAt(px, py) {
  const c = Math.floor(px / T), r = Math.floor(py / T);
  if (c < 0 || c >= W) return true;
  return SOLID.has(tileAt(c, r));
}

/* ---------------------------------------------------------------- *
 *  STATE
 * ---------------------------------------------------------------- */
// h matches the drawn body (hair tips aside), so the head bumps ? blocks where it touches them
const player = { x: 0, y: 0, w: 11, h: 26, vx: 0, vy: 0, grounded: false,
                 face: 1, coyote: 0, invuln: 0, animT: 0, animState: 'idle', squash: 0,
                 hurt: 0, land: 0 };
let cam = 0, frame = 0;
let running = false, paused = false;
let outro = null;             // {phase, t}
let safe = { x: 0, y: 0 };
const score = { facts: 0, correct: 0, projects: 0, bonus: 0, coins: 0 };

// juice
let particles = [];
let pending = [];             // [{at, fn}] timed callbacks (so effects play before a popup pauses)
let shake = 0, flash = 0;
let quizState = null;         // { item, wrap, answered }
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

function schedule(frames, fn) { pending.push({ at: frame + frames, fn }); }

function resetGame() {
  buildLevel();
  player.x = startX; player.y = (GROUND - 2) * T;
  player.vx = player.vy = 0; player.face = 1; player.invuln = 0; player.squash = 0;
  player.hurt = player.land = 0;
  player.animT = 0; player.animState = 'idle';
  cam = 0; outro = null; paused = false;
  particles = []; pending = []; shake = 0; flash = 0; frame = 0; quizState = null;
  safe = { x: player.x, y: player.y };
  score.facts = score.correct = score.projects = score.bonus = score.coins = 0;
  updateHUD();
}

/* ---------------------------------------------------------------- *
 *  INPUT
 * ---------------------------------------------------------------- */
const keys = { left: false, right: false, jump: false, jumpHeld: false };

addEventListener('keydown', e => {
  if (!running || paused) return;
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') keys.left = true;
  else if (k === 'arrowright' || k === 'd') keys.right = true;
  else if (k === ' ' || k === 'arrowup' || k === 'w') { keys.jump = true; keys.jumpHeld = true; }
  else return;
  if ([' ', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(k)) e.preventDefault();
});
addEventListener('keyup', e => {
  const k = e.key.toLowerCase();
  if (k === 'arrowleft' || k === 'a') keys.left = false;
  else if (k === 'arrowright' || k === 'd') keys.right = false;
  else if (k === ' ' || k === 'arrowup' || k === 'w') keys.jumpHeld = false;
});

function bindTouch() {
  document.querySelectorAll('.tbtn').forEach(btn => {
    const key = btn.dataset.key;
    const on = e => { e.preventDefault(); if (key === 'jump') { keys.jump = true; keys.jumpHeld = true; } else keys[key] = true; };
    const off = e => { e.preventDefault(); if (key === 'jump') keys.jumpHeld = false; else keys[key] = false; };
    btn.addEventListener('pointerdown', on);
    btn.addEventListener('pointerup', off);
    btn.addEventListener('pointerleave', off);
    btn.addEventListener('pointercancel', off);
  });
}

/* ---------------------------------------------------------------- *
 *  AUDIO  (tiny Web Audio blips)
 * ---------------------------------------------------------------- */
let actx = null, muted = false;
function audioOn() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') actx.resume(); }
function blip(freq, dur, type = 'square', vol = 0.05, slide = 0) {
  if (!actx || muted) return;
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.value = freq;
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(60, freq + slide), actx.currentTime + dur);
  g.gain.value = vol; g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + dur);
  o.connect(g).connect(actx.destination); o.start(); o.stop(actx.currentTime + dur);
}
const SFX = {
  jump:  () => blip(420, 0.16, 'square', 0.05, 260),
  coin:  () => { blip(988, 0.07, 'square', 0.05); setTimeout(() => blip(1319, 0.12, 'square', 0.05), 70); },
  stomp: () => { blip(300, 0.05, 'square', 0.07, -150); setTimeout(() => blip(680, 0.10, 'square', 0.05, 220), 45); },
  bump:  () => blip(150, 0.10, 'square', 0.05, 40),
  brick: () => blip(120, 0.08, 'square', 0.05, -40),
  power: () => { [523, 784, 1047].forEach((f, i) => setTimeout(() => blip(f, 0.10, 'square', 0.05), i * 55)); },
  hurt:  () => { blip(440, 0.10, 'sawtooth', 0.06, -220); setTimeout(() => blip(170, 0.24, 'sawtooth', 0.05, -70), 60); },
  correct: () => { [660, 880, 1320].forEach((f, i) => setTimeout(() => blip(f, 0.13, 'square', 0.055), i * 80)); },
  wrong: () => { blip(200, 0.18, 'sawtooth', 0.06, -60); setTimeout(() => blip(150, 0.22, 'sawtooth', 0.05, -40), 120); },
  clear: () => { [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => blip(f, 0.16, 'square', 0.06), i * 130)); },
};

/* ---- juice helpers ---- */
const BUMP_FRAMES = 12;
function burst(x, y, color, n) {
  if (reduceMotion) n = Math.min(n, 3);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 0.6 + Math.random() * 2.0;
    particles.push({ x, y, vx: Math.cos(a) * sp, vy: -Math.abs(Math.sin(a) * sp) - 0.7,
      life: 20 + Math.random() * 14, color, size: Math.random() < 0.4 ? 2 : 1 });
  }
}
function shakeIt(m) { if (!reduceMotion) shake = Math.max(shake, m); }
function flashIt(f) { if (!reduceMotion) flash = Math.max(flash, f); }
function tickEffects() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]; p.x += p.vx; p.y += p.vy; p.vy += 0.18; p.life--;
    if (p.life <= 0) particles.splice(i, 1);
  }
  for (const [k, v] of bump) { if (v <= 1) bump.delete(k); else bump.set(k, v - 1); }
  if (shake > 0) { shake *= 0.84; if (shake < 0.3) shake = 0; }
  if (flash > 0) flash--;
}

/* ---------------------------------------------------------------- *
 *  UPDATE
 * ---------------------------------------------------------------- */
function update() {
  frame++;
  runPending();
  tickEffects();
  if (paused) return;          // popup open — freeze the world
  if (outro) { stepOutro(); return; }

  // --- horizontal ---
  const accel = player.grounded ? MOVE : AIR;
  if (keys.left && !keys.right) { player.vx -= accel; player.face = -1; }
  else if (keys.right && !keys.left) { player.vx += accel; player.face = 1; }
  else player.vx *= player.grounded ? 0.78 : 0.92;
  player.vx = Math.max(-MAXVX, Math.min(MAXVX, player.vx));
  if (Math.abs(player.vx) < 0.04) player.vx = 0;

  collideX();

  // --- jump ---
  if (player.grounded) player.coyote = COYOTE; else if (player.coyote > 0) player.coyote--;
  if (keys.jump && player.coyote > 0) { player.vy = JUMP; player.grounded = false; player.coyote = 0; SFX.jump(); }
  keys.jump = false;
  if (!keys.jumpHeld && player.vy < 0) { player.vy *= JUMP_CUT; }

  // --- gravity ---
  const airborne = !player.grounded;
  player.vy = Math.min(player.vy + GRAVITY, 9);
  const fallSpeed = player.vy;
  player.grounded = false;
  collideY();
  if (airborne && player.grounded && fallSpeed > 5) player.land = 8;   // hard landing → brief crouch

  if (player.grounded && player.vy >= 0) safe = { x: player.x, y: player.y - 2 };
  // hero animation state → picks the atlas row + frames in drawHero()
  let astate = 'idle';
  if (player.hurt > 0) { astate = 'hurt'; player.hurt--; }
  else if (!player.grounded) astate = player.vy < -1.5 ? 'jump' : player.vy < 1.5 ? 'apex' : 'fall';
  else if (Math.abs(player.vx) > 0.3) astate = 'run';
  else if (player.land > 0) astate = 'land';
  if (player.land > 0) player.land--;
  if (astate !== player.animState) { player.animState = astate; player.animT = 0; }
  else player.animT += astate === 'run' ? Math.abs(player.vx) / MAXVX : 1;   // stride follows speed

  // --- fell in a pit ---
  if (player.y > VIEW_H + 40) respawn();

  // --- camera ---
  cam = Math.max(0, Math.min(player.x - 96, W * T - VIEW_W));

  updateEnemies();
  updateCoins();
  if (player.invuln > 0) player.invuln--;

  // --- reached the flag ---
  if (player.x + player.w >= flagX && !outro) startOutro();
}

function runPending() {
  for (let i = pending.length - 1; i >= 0; i--) {
    if (frame >= pending[i].at) { const fn = pending[i].fn; pending.splice(i, 1); fn(); }
  }
}

function isSolidTile(c, r) { return (c < 0 || c >= W) ? true : SOLID.has(tileAt(c, r)); }

/* Axis-separated tile collision: scan only the tiles the box overlaps. */
function collideX() {
  player.x += player.vx;
  if (player.vx === 0) return;
  const top = Math.floor(player.y / T);
  const bot = Math.floor((player.y + player.h - 1) / T);
  if (player.vx > 0) {
    const col = Math.floor((player.x + player.w - 1) / T);
    for (let r = top; r <= bot; r++) if (isSolidTile(col, r)) { player.x = col * T - player.w; player.vx = 0; break; }
  } else {
    const col = Math.floor(player.x / T);
    for (let r = top; r <= bot; r++) if (isSolidTile(col, r)) { player.x = (col + 1) * T; player.vx = 0; break; }
  }
}

function collideY() {
  player.y += player.vy;
  const left = Math.floor(player.x / T);
  const right = Math.floor((player.x + player.w - 1) / T);
  if (player.vy > 0) {
    const row = Math.floor((player.y + player.h) / T);
    for (let c = left; c <= right; c++) if (isSolidTile(c, row)) { player.y = row * T - player.h; player.vy = 0; player.grounded = true; break; }
  } else if (player.vy < 0) {
    const row = Math.floor(player.y / T);
    // bump only the solid block the head actually overlaps, nearest to player's center
    let best = -1, bd = 1e9; const cx = player.x + player.w / 2;
    for (let c = left; c <= right; c++) if (isSolidTile(c, row)) { const d = Math.abs((c * T + T / 2) - cx); if (d < bd) { bd = d; best = c; } }
    if (best >= 0) { player.y = (row + 1) * T; player.vy = 0; bumpBlock(best, row); }
  }
}

function bumpBlock(c, r) {
  const ch = tileAt(c, r);
  const bx = c * T + T / 2, by = r * T;
  if (ch === '?') {
    bump.set(c + ',' + r, BUMP_FRAMES);
    tiles[r][c] = 'U';
    const qi = qIndexMap.get(c + ',' + r) ?? 0;
    SFX.power(); burst(bx, by, '#ffd200', 12); shakeIt(2);
    schedule(13, () => openQuiz(QUIZ[qi]));   // let the block-bump play, then ask
  } else if (ch === '=') {
    bump.set(c + ',' + r, BUMP_FRAMES); SFX.brick(); burst(bx, by, '#d2693a', 7); shakeIt(1.5);
  } else {
    SFX.bump();
  }
}

function respawn() {
  player.x = safe.x; player.y = safe.y;
  player.vx = 0; player.vy = 0; player.invuln = 50;
  flashIt(12); shakeIt(3); SFX.hurt();
}

function updateEnemies() {
  for (const e of enemies) {
    if (e.dead) { e.deadT++; continue; }
    // gravity
    e.vy = Math.min(e.vy + GRAVITY, 8);
    e.y += e.vy;
    if (solidAt(e.x + e.w / 2, e.y + e.h)) { e.y = Math.floor((e.y + e.h) / T) * T - e.h; e.vy = 0; }
    // walk + turn at walls/ledges
    e.x += e.vx;
    const ahead = e.dir < 0 ? e.x : e.x + e.w;
    const wall = solidAt(ahead + e.dir, e.y + e.h / 2);
    const ledge = !solidAt(ahead + e.dir, e.y + e.h + 2);
    if (wall || ledge) { e.dir *= -1; e.vx = ESPD * e.dir; }

    // collide with player
    if (player.invuln <= 0 && aabb(player, e)) {
      const stomp = player.vy > 0.6 && (player.y + player.h) - e.y < e.h * 0.7;
      if (stomp) {
        e.dead = true; e.deadT = 0; player.vy = JUMP * 0.6;       // springy bounce
        burst(e.x + e.w / 2, e.y + 2, e.type === 'turtle' ? '#2aa53a' : '#e8702a', 14);
        shakeIt(3); SFX.stomp();
        if (e.type === 'turtle') score.projects++; else score.bonus++;
        updateHUD();
        const rev = e.reveal;
        schedule(18, () => openInfo(rev.type, rev.data));  // squash plays first
      } else {
        // gentle knockback, no death — clear feedback
        player.vx = (player.x < e.x ? -1 : 1) * 2.6; player.vy = -3.4; player.invuln = 72; player.hurt = 24;
        shakeIt(4); flashIt(10); SFX.hurt();
        burst(player.x + player.w / 2, player.y + player.h / 2, '#ff5b4f', 9);
      }
    }
  }
}
function aabb(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function updateCoins() {
  for (const co of coins) {
    if (co.got) continue;
    if (Math.abs((player.x + player.w / 2) - co.x) < 12 && Math.abs((player.y + player.h / 2) - co.y) < 14) {
      co.got = true; score.coins++; updateHUD(); SFX.coin();
    }
  }
}

/* ----- outro: slide pole → cheer → walk to castle → splash ----- */
function startOutro() {
  outro = { phase: 'slide', t: 0, flag: flagX, py: player.y };
  paused = false; keys.left = keys.right = false;
  player.vx = 0; player.hurt = 0; player.invuln = 0; player.face = 1; SFX.clear();
  player.animState = 'jump'; player.animT = 0;     // reaching for the pole
}
function stepOutro() {
  outro.t++;
  const floor = GROUND * T - player.h;             // feet on the ground row
  if (outro.phase === 'slide') {
    player.x = flagX - player.w - 1;
    player.y = Math.min(player.y + 2.2, floor);
    if (player.y >= floor) {
      outro.phase = 'cheer'; outro.t = 0;
      player.animState = 'win'; player.animT = 0;
      burst(player.x + player.w / 2, player.y, '#ffd200', 14);
    }
  } else if (outro.phase === 'cheer') {
    player.animT++;
    if (outro.t > 60) { outro.phase = 'walk'; outro.t = 0; player.animState = 'walk'; player.animT = 0; }
  } else if (outro.phase === 'walk') {
    player.x += 1.4; player.animT++;
    cam = Math.max(0, Math.min(player.x - 96, W * T - VIEW_W));
    if (player.x >= castleX + 8) { outro.phase = 'enter'; outro.t = 0; }
  } else if (outro.phase === 'enter') {
    if (outro.t > 28) showEnd();
  }
}

/* ---------------------------------------------------------------- *
 *  RENDER
 * ---------------------------------------------------------------- */
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Back the canvas with as many pixels as it covers on screen (whole multiple of
// the game size, so pixel-art edges stay on the grid) — that's what lets the
// hero's high-res atlas actually show its detail.
let renderScale = 2;
function fitCanvas() {
  const r = cv.getBoundingClientRect();
  const shownH = Math.min(r.height, r.width * VIEW_H / VIEW_W);   // object-fit: contain
  if (!shownH) return;                                              // hidden (site mode)
  const s = Math.max(2, Math.min(MAX_RENDER_SCALE, Math.round(shownH * (window.devicePixelRatio || 1) / VIEW_H)));
  if (cv.width === VIEW_W * s) return;
  renderScale = s;
  cv.width = VIEW_W * s; cv.height = VIEW_H * s;
}
fitCanvas();
new ResizeObserver(fitCanvas).observe(cv);

function px(c) { return PAL[c]; }
function drawSprite(sp, dx, dy, flip) {
  const w = sp[0].length;
  for (let r = 0; r < sp.length; r++) {
    const row = sp[r];
    for (let c = 0; c < w; c++) {
      const ch = row[c];
      if (ch === '.' || ch === undefined) continue;
      const x = Math.round(dx + (flip ? (w - 1 - c) : c));
      ctx.fillStyle = px(ch);
      ctx.fillRect(x, Math.round(dy + r), 1, 1);
    }
  }
}

// draw the hero with its feet centre on the hitbox's bottom centre: an atlas
// cell when loaded, else the tiny procedural HERO
function drawHero(ox) {
  const fx = player.x - ox + player.w / 2, fy = player.y + player.h;
  const flip = player.face < 0;
  if (!heroReady) {
    drawSprite(HERO, Math.round(fx - 8), Math.round(fy - 16), flip);
    return;
  }
  const s = HERO_SHEET, a = s.anims[player.animState] || s.anims.idle;
  const col = a.frames[Math.floor(player.animT * a.fps / 60) % a.frames.length];
  const w = s.cw / s.density, h = s.ch / s.density;
  ctx.save();
  ctx.translate(Math.round(fx - w / 2) + (flip ? w : 0), Math.round(fy - h));
  if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = true;                 // a painting: resample it smoothly to the screen
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(heroImg, col * s.cw, a.row * s.ch, s.cw, s.ch, 0, 0, w, h);
  ctx.restore();
}

function render() {
  ctx.setTransform(renderScale, 0, 0, renderScale, 0, 0);
  ctx.imageSmoothingEnabled = false;
  // sky — drawn full-bleed and never shaken
  const g = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  g.addColorStop(0, '#4a86fc'); g.addColorStop(0.6, '#5c94fc'); g.addColorStop(1, '#8fb8ff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  let sx = 0, sy = 0;
  if (shake > 0) { sx = (Math.random() * 2 - 1) * shake; sy = (Math.random() * 2 - 1) * shake; }
  ctx.save();
  ctx.translate(Math.round(sx), Math.round(sy));

  drawScenery();

  const ox = Math.round(cam);
  const c0 = Math.floor(cam / T) - 1, c1 = c0 + 18;
  for (let c = c0; c <= c1; c++) {
    for (let r = 0; r < ROWS; r++) {
      const ch = tileAt(c, r);
      if (ch === ' ' || ch === '|') continue;
      let by = 0; const v = bump.get(c + ',' + r);
      if (v !== undefined) { const prog = 1 - v / BUMP_FRAMES; by = -Math.sin(prog * Math.PI) * 8; }
      drawTile(ch, c * T - ox, r * T + by, c, r);
    }
  }

  drawFlag(ox);
  drawCastle(ox);

  for (const co of coins) {
    if (co.got) continue;
    const x = co.x - ox; if (x < -16 || x > VIEW_W + 16) continue;
    drawCoin(x, co.y);
  }

  for (const e of enemies) {
    const x = e.x - ox; if (x < -20 || x > VIEW_W + 20) continue;
    if (e.dead) { drawSquashed(e, x); continue; }
    drawSprite(e.type === 'turtle' ? TURTLE : CRAB, x - 1, e.y - 2, e.dir > 0);
  }

  // player (camera-relative; blink while invulnerable)
  if (!(player.invuln > 0 && Math.floor(frame / 4) % 2)) {
    drawHero(ox);
  }

  // particles
  for (const p of particles) {
    const x = Math.round(p.x - ox); if (x < -4 || x > VIEW_W + 4) continue;
    ctx.fillStyle = p.color; ctx.fillRect(x, Math.round(p.y), p.size, p.size);
  }

  ctx.restore();

  // damage flash — full-frame
  if (flash > 0) { ctx.fillStyle = 'rgba(229,37,33,' + (flash / 12 * 0.45) + ')'; ctx.fillRect(0, 0, VIEW_W, VIEW_H); }
}

function drawTile(ch, x, y, c, r) {
  x = Math.round(x); y = Math.round(y);
  switch (ch) {
    case '#': // ground brick
      ctx.fillStyle = '#c8602c'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#e0793c'; ctx.fillRect(x, y, T, 3);
      ctx.fillStyle = '#8a3b10';
      ctx.fillRect(x, y + 7, T, 2); ctx.fillRect(x, y + T - 2, T, 2);
      ctx.fillRect(x + 5, y, 2, 7); ctx.fillRect(x + 11, y + 9, 2, 7);
      break;
    case '=': // brick block
      ctx.fillStyle = '#b5471c'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#1a1024'; ctx.fillRect(x, y + 7, T, 1); ctx.fillRect(x, y + T - 1, T, 1);
      ctx.fillStyle = '#d2693a'; ctx.fillRect(x, y, T, 2);
      ctx.fillStyle = '#1a1024'; ctx.fillRect(x + 7, y + 1, 1, 6); ctx.fillRect(x + 3, y + 8, 1, 7); ctx.fillRect(x + 11, y + 8, 1, 7);
      break;
    case '?': { // question block
      const t = (frame % 60) < 30;
      ctx.fillStyle = t ? '#ffd200' : '#f0b000'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#1a1024'; ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y + T - 1, T, 1); ctx.fillRect(x, y, 1, T); ctx.fillRect(x + T - 1, y, 1, T);
      ctx.fillStyle = '#7a5200'; // rivets
      [[2,2],[T-3,2],[2,T-3],[T-3,T-3]].forEach(([a,b]) => ctx.fillRect(x+a, y+b, 1, 1));
      // ? glyph
      ctx.fillStyle = '#fff';
      for (let gy = 0; gy < QGLYPH.length; gy++) for (let gx = 0; gx < 5; gx++)
        if (QGLYPH[gy][gx] === '1') ctx.fillRect(x + 3 + gx * 2, y + 1 + gy * 2, 2, 2);
      break;
    }
    case 'U': // used block
      ctx.fillStyle = '#9a5a2c'; ctx.fillRect(x, y, T, T);
      ctx.fillStyle = '#6b3a14'; ctx.fillRect(x, y, T, 1); ctx.fillRect(x, y + T - 1, T, 1); ctx.fillRect(x, y, 1, T); ctx.fillRect(x + T - 1, y, 1, T);
      [[3,3],[T-4,3],[3,T-4],[T-4,T-4]].forEach(([a,b]) => ctx.fillRect(x+a, y+b, 2, 2));
      break;
    case 'T': case 'Y': case 'I': case 'i': drawPipe(ch, x, y); break;
  }
}

function drawPipe(ch, x, y) {
  const lip = (ch === 'T' || ch === 'Y');
  const left = (ch === 'T' || ch === 'I');
  ctx.fillStyle = '#2aa53a'; ctx.fillRect(x, y, T, T);
  ctx.fillStyle = '#7fe08a'; ctx.fillRect(x, y, left ? 4 : 2, T); // highlight
  ctx.fillStyle = '#176b25'; ctx.fillRect(x + (left ? T - 2 : 0), y, 2, T);
  ctx.fillStyle = '#1a1024';
  if (left) ctx.fillRect(x, y, 1, T); else ctx.fillRect(x + T - 1, y, 1, T);
  if (lip) { ctx.fillStyle = '#176b25'; ctx.fillRect(x, y, T, 1); ctx.fillStyle = '#1a1024'; ctx.fillRect(x, y + 5, T, 1); }
}

function drawCoin(x, y) {
  const s = Math.abs(Math.cos(frame * 0.12));
  const w = Math.max(2, Math.round(8 * s));
  x = Math.round(x - w / 2); y = Math.round(y - 6);
  ctx.fillStyle = '#7a5200'; ctx.fillRect(x - 1, y - 1, w + 2, 14);
  ctx.fillStyle = '#ffd200'; ctx.fillRect(x, y, w, 12);
  ctx.fillStyle = '#fff4b0'; if (w > 3) ctx.fillRect(x + 1, y + 2, 2, 8);
}

function drawSquashed(e, x) {
  if (e.deadT > 48) return;                       // pancake, then gone
  const h = Math.max(2, 7 - e.deadT * 0.16);
  const yy = Math.round(e.y + e.h - h), xx = Math.round(x) - 1;
  ctx.fillStyle = e.type === 'turtle' ? '#176b25' : '#b4500f';
  ctx.fillRect(xx, yy, e.w + 4, Math.round(h));
  ctx.fillStyle = '#1a1024';                        // x_x eyes
  ctx.fillRect(xx + 3, yy + 1, 1, 1); ctx.fillRect(xx + e.w, yy + 1, 1, 1);
}

function drawFlag(ox) {
  const x = flagX - ox;
  if (x < -20 || x > VIEW_W + 20) return;
  // pole
  ctx.fillStyle = '#cfd6e8'; ctx.fillRect(Math.round(x) + 6, 4 * T, 2, 9 * T);
  ctx.fillStyle = '#aab4cc'; ctx.fillRect(Math.round(x) + 6, 4 * T, 1, 9 * T);
  // ball top
  ctx.fillStyle = '#ffd200'; ctx.fillRect(Math.round(x) + 4, 4 * T - 6, 6, 6);
  ctx.fillStyle = '#1a1024'; ctx.fillRect(Math.round(x) + 4, 4 * T - 6, 6, 1);
  // flag (navy w/ yellow star vibe) — lowers during outro
  let fy = 4 * T + 6;
  if (outro && outro.phase === 'slide') fy = Math.min(4 * T + 6 + outro.t * 2.2, (GROUND - 1) * T - 14);
  else if (outro) fy = (GROUND - 1) * T - 14;
  fy = Math.round(fy);
  const fx = Math.round(x) + 8;
  ctx.fillStyle = '#101a4c';
  ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx + 14, fy + 6); ctx.lineTo(fx, fy + 12); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#ffd200'; ctx.fillRect(fx + 3, fy + 5, 3, 3);
}

function drawCastle(ox) {
  const x = Math.round(castleX - ox);
  if (x < -80 || x > VIEW_W + 80) return;
  const base = (GROUND) * T, bw = 64, bx = x - 8, by = base - 56;
  ctx.fillStyle = '#b5471c'; ctx.fillRect(bx, by, bw, 56);
  ctx.fillStyle = '#8a3b10';
  for (let i = 0; i < bw; i += 8) ctx.fillRect(bx + i, by + 12, 7, 1);
  for (let j = 0; j < 56; j += 12) for (let i = ((j/12)%2)*4; i < bw; i += 8) ctx.fillRect(bx + i, by + j, 1, 12);
  // battlements
  for (let i = 0; i < bw; i += 10) { ctx.fillStyle = '#b5471c'; ctx.fillRect(bx + i, by - 6, 6, 6); }
  // central tower
  ctx.fillStyle = '#b5471c'; ctx.fillRect(bx + 24, by - 22, 16, 22);
  for (let i = 0; i < 16; i += 6) ctx.fillRect(bx + 24 + i, by - 28, 4, 6);
  // door
  ctx.fillStyle = '#1a1024'; ctx.fillRect(bx + 26, base - 18, 12, 18);
  ctx.fillStyle = '#101a4c'; ctx.fillRect(bx + 28, base - 16, 8, 16);
  // little flag
  ctx.fillStyle = '#cfd6e8'; ctx.fillRect(bx + 31, by - 40, 1, 14);
  ctx.fillStyle = '#ffd200'; ctx.fillRect(bx + 32, by - 40, 8, 5);
}

const CLOUDS = [[40,40],[150,28],[300,54],[470,36],[640,30],[820,48],[1000,34],[1180,44],[1340,30]];
const HILLS = [[80,2],[360,1],[700,2],[1020,1],[1280,2]];
const BUSH = [[180],[520],[900],[1150]];
function drawScenery() {
  const p = cam * 0.5;
  for (const [cx, cy] of CLOUDS) {
    const x = cx - p; if (x < -50 || x > VIEW_W + 20) continue;
    ctx.fillStyle = '#f8f8ff';
    ctx.fillRect(x, cy, 26, 9); ctx.fillRect(x + 5, cy - 5, 16, 9); ctx.fillRect(x - 5, cy + 3, 36, 7);
  }
  const gy = GROUND * T;
  for (const [cx, sc] of HILLS) {
    const x = cx - cam * 0.8; const w = 40 * sc, h = 22 * sc;
    if (x < -w || x > VIEW_W + w) continue;
    ctx.fillStyle = '#3aa83a';
    ctx.beginPath(); ctx.moveTo(x - w, gy); ctx.lineTo(x, gy - h); ctx.lineTo(x + w, gy); ctx.fill();
    ctx.fillStyle = '#2e8c2e'; ctx.fillRect(x - 2, gy - h + 4, 4, h - 4);
  }
  for (const [cx] of BUSH) {
    const x = cx - cam; if (x < -40 || x > VIEW_W + 20) continue;
    ctx.fillStyle = '#2aa53a';
    ctx.fillRect(x, gy - 8, 30, 8); ctx.fillRect(x + 4, gy - 12, 9, 6); ctx.fillRect(x + 16, gy - 12, 9, 6);
  }
}

/* ---------------------------------------------------------------- *
 *  GAME LOOP
 * ---------------------------------------------------------------- */
let last = 0, acc = 0; const STEP = 1000 / 60;
function loop(now) {
  requestAnimationFrame(loop);
  if (!last) last = now;
  let dt = now - last; last = now;
  if (dt > 100) dt = 100;
  if (running && !paused) { acc += dt; if (acc > 250) acc = 250; while (acc >= STEP) { update(); acc -= STEP; } }
  else acc = 0;
  render();
}
requestAnimationFrame(loop);

/* ---------------------------------------------------------------- *
 *  DOM  /  FLOW
 * ---------------------------------------------------------------- */
const $ = id => document.getElementById(id);
const body = document.body;

function updateHUD() {
  $('hud-facts').textContent = '★ ' + score.facts + '/' + QUIZ.length;
  $('hud-coins').textContent = '◉ ' + score.coins;
}

/* ---- i18n ---- */
function t(k) { return GAME_STR[lang].ui[k]; }
let siteTR = null;                       // TR captured from the authored DOM
function captureSiteTR() {
  siteTR = {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    siteTR[el.dataset.i18n] = (el.dataset.i18nHtml !== undefined) ? el.innerHTML : el.textContent;
  });
}
function applyLang(l) {
  lang = (l === 'en') ? 'en' : 'tr';
  try { localStorage.setItem('efe-lang', lang); } catch (e) {}
  document.documentElement.lang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = lang === 'tr' ? siteTR[key] : (SITE_EN[key] != null ? SITE_EN[key] : siteTR[key]);
    if (val == null) return;
    if (el.dataset.i18nHtml !== undefined) el.innerHTML = val; else el.textContent = val;
  });
  document.querySelectorAll('.lang-toggle').forEach(b => { b.textContent = lang === 'tr' ? 'EN' : 'TR'; });
  const meta = META[lang];
  document.title = meta.title;
  const setMeta = (sel, val) => { const el = document.querySelector(sel); if (el) el.setAttribute('content', val); };
  setMeta('meta[name="description"]', meta.desc);
  setMeta('meta[property="og:title"]', meta.title);
  setMeta('meta[property="og:description"]', meta.desc);
  const g = GAME_STR[lang];
  QUIZ = g.quiz; PROJECTS = g.projects; BONUS = g.bonus;
  updateHUD();
}

function popupShell(kind, cls) {
  paused = true;
  const k = $('popup-kind'); k.textContent = kind; k.className = 'popup-kind ' + cls;
  const wrap = $('quiz-options'); wrap.classList.add('hidden'); wrap.innerHTML = '';
  $('popup-body').classList.add('hidden');
  $('popup-link').classList.add('hidden');
  $('popup-continue').classList.add('hidden');
  $('popup').classList.remove('hidden');
}

// enemy reveals (projects / bonus) — straight info card
function openInfo(type, data) {
  popupShell(t(type), type === 'project' ? 'kind-project' : 'kind-bonus');
  $('popup-title').textContent = data.title;
  const b = $('popup-body'); b.textContent = data.body; b.classList.remove('hidden');
  const lk = $('popup-link');
  if (data.link) { lk.href = data.link; lk.textContent = data.linkLabel || t('visit'); lk.classList.remove('hidden'); }
  const cont = $('popup-continue'); cont.textContent = t('continue'); cont.classList.remove('hidden'); cont.focus();
}

// ? blocks — a 3-choice question
function openQuiz(item) {
  popupShell(t('quiz'), 'kind-quiz');
  score.facts = Math.min(QUIZ.length, score.facts + 1); updateHUD();
  $('popup-title').textContent = item.q;
  const wrap = $('quiz-options'); wrap.classList.remove('hidden');
  const letters = ['A', 'B', 'C', 'D'];
  item.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt'; btn.type = 'button';
    btn.innerHTML = '<span class="key">' + letters[i] + '</span><span>' + opt + '</span>';
    btn.addEventListener('click', () => answerQuiz(i));
    wrap.appendChild(btn);
  });
  quizState = { item, wrap, answered: false };
  const first = wrap.querySelector('.quiz-opt'); if (first) first.focus();
}

function answerQuiz(choice) {
  if (!quizState || quizState.answered) return;
  quizState.answered = true;
  const { item, wrap } = quizState;
  const btns = [...wrap.querySelectorAll('.quiz-opt')];
  btns.forEach((b, i) => {
    b.setAttribute('disabled', '');
    if (i === item.correct) b.classList.add('correct');     // right answer always lights green
    else if (i === choice) b.classList.add('wrong');         // your wrong pick lights red
  });
  const right = choice === item.correct;
  if (right) { score.correct++; SFX.correct(); } else { SFX.wrong(); flashIt(8); }
  const b = $('popup-body');
  b.textContent = (right ? t('correct') : t('wrong')) + item.reveal;
  b.classList.remove('hidden');
  const cont = $('popup-continue'); cont.textContent = t('continue'); cont.classList.remove('hidden'); cont.focus();
}

function closePopup() {
  $('popup').classList.add('hidden');
  quizState = null; paused = false; keys.jump = false; keys.jumpHeld = false;
}

function beginPlay() {
  audioOn();
  resetGame();
  $('start').classList.add('hidden');
  $('popup').classList.add('hidden');
  $('end').classList.add('hidden');
  running = true; paused = false;
}

function showEnd() {
  running = false;
  $('end-facts').textContent = '★ ' + score.correct + '/' + QUIZ.length + ' ' + t('statCorrect');
  $('end-projects').textContent = '⚑ ' + score.projects + ' ' + t('statProjects');
  $('end-coins').textContent = '◉ ' + score.coins + ' ' + t('statCoins');
  $('end').classList.remove('hidden');
  $('enter-btn').focus();
}

function enterSite() {
  running = false;
  body.classList.remove('mode-game');
  body.classList.add('warping');
  $('game-screen').setAttribute('aria-hidden', 'true');
  $('site').removeAttribute('aria-hidden');
  window.scrollTo(0, 0);
  setTimeout(() => body.classList.remove('warping'), 800);
}

function restartGame() {
  body.classList.add('mode-game');
  $('game-screen').removeAttribute('aria-hidden');
  beginPlay();
}

/* ----- wire up controls ----- */
$('play-btn').addEventListener('click', beginPlay);
$('skip-btn').addEventListener('click', enterSite);
$('popup-continue').addEventListener('click', closePopup);
$('enter-btn').addEventListener('click', enterSite);
$('replay-btn').addEventListener('click', restartGame);
$('replay-btn-2').addEventListener('click', restartGame);
$('mute-btn').addEventListener('click', () => {
  muted = !muted;
  $('mute-btn').textContent = muted ? '♪̸' : '♪';
  $('mute-btn').classList.toggle('muted', muted);
});
// castle chip: skip ahead — Efe lands on top of the flagpole and the finale plays
$('goal-btn').addEventListener('click', e => {
  e.currentTarget.blur();                          // Space should jump, not press this again
  if (!running || paused || outro) return;
  player.x = flagX - player.w - 1; player.y = 4 * T;
  player.vx = player.vy = 0;
  cam = Math.max(0, Math.min(player.x - 96, W * T - VIEW_W));
  startOutro();
});
document.querySelectorAll('.lang-toggle').forEach(b =>
  b.addEventListener('click', () => applyLang(lang === 'tr' ? 'en' : 'tr')));

// favourite-song: reveal the Spotify player on click (lazy iframe, no autoplay → no blast)
const songPlay = $('song-play');
if (songPlay) songPlay.addEventListener('click', () => {
  const box = $('song-embed');
  if (box && !box.dataset.loaded) {
    box.innerHTML = '<iframe src="https://open.spotify.com/embed/track/1fZpoShaD1NIwqadYTAfrn?utm_source=generator&theme=0" width="100%" height="152" frameborder="0" loading="lazy" allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
    box.dataset.loaded = '1';
  }
  if (box) box.hidden = false;
  songPlay.hidden = true;
});

// popup keyboard: answer a quiz with A/B/C or 1/2/3; continue with Enter/Space
addEventListener('keydown', e => {
  if ($('popup').classList.contains('hidden')) return;
  if (quizState && !quizState.answered) {
    const map = { '1': 0, '2': 1, '3': 2, a: 0, b: 1, c: 2 };
    const k = e.key.toLowerCase();
    if (k in map && map[k] < quizState.item.opts.length) { e.preventDefault(); answerQuiz(map[k]); return; }
  }
  if (!$('popup-continue').classList.contains('hidden') && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault(); closePopup();
  }
});

/* ----- boot ----- */
function boot() {
  $('year').textContent = String(new Date().getFullYear());
  loadHeroSheet();                       // async; the procedural HERO stands in until then
  captureSiteTR();                       // snapshot authored Turkish, then pick a language
  let saved = null; try { saved = localStorage.getItem('efe-lang'); } catch (e) {}
  applyLang(saved === 'en' ? 'en' : 'tr');   // sets QUIZ/PROJECTS/BONUS too
  const touch = matchMedia('(hover: none) and (pointer: coarse)').matches || 'ontouchstart' in window;
  if (touch) body.classList.add('touch');
  bindTouch();
  buildLevel();          // so the first frame renders behind the start overlay
  player.x = startX; player.y = (GROUND - 2) * T;
  body.classList.add('mode-game');
  running = false;       // wait on the start overlay
}
boot();

})();
