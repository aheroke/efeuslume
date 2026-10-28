# Efe World 1-1 — efeuslu.me

A playable résumé. Visitors are greeted with *"Beni tanımak için küçük bir oyuna var mısın?"*
and drop into a short Mario-style level: hit **?** blocks to reveal facts about Efe, stomp
**turtles** to reveal projects and **crabs** for bonus cards, then reach the **flag + castle** →
**HARİKASIN!** → warp into the real portfolio.

Concept puts **Efe himself** into the Mario grammar (curly hair, red jacket, backpack), with a
**Persona 4** yellow victory splash and a **Fenerbahçe** sarı-lacivert palette; One Piece lives
on in the quiz.

## Stack
Plain static site — no build step, no dependencies. Three files plus the hero's art; enemies,
tiles and everything else are drawn in canvas from pixel maps.

| File | What it is |
|------|------------|
| `index.html` | Game screen markup + the static portfolio (works with JS off / good for SEO) |
| `styles.css` | Palette tokens, pixel UI, full portfolio styling, responsive + a11y |
| `game.js`   | Vanilla-canvas platformer engine, level, content, audio, transitions |
| `assets/efe/` | `sprites.webp` (the hero's animation atlas) + `hero.webp` (site avatar) |

## Hero art
Built by `tools/build_sprites.py` (needs Pillow) from two source images that stay out of the
upload: `assets/animationsheet.png` (Idle / Walk / Run / Jump / Land / Wave rows) and
`assets/hero.png`. It cleans each frame, scales them all by one factor and aligns feet + head
in fixed cells. After changing either source:
```bash
python3 tools/build_sprites.py            # --preview DIR writes zoomed checks
```
If the cell size or density it prints changes, update `HERO_SHEET` in `game.js` (which frames
play for each move live there too). The game canvas renders at the screen's own resolution, so
the hero is as sharp as the atlas: `DENSITY = 5` in the script already uses nearly all of the
sheet's detail (~170 px per figure). Going sharper on big retina screens needs a bigger source
sheet: the script scales its layout to the sheet's width, so a 2× version of the same sheet
drops right in. Then raise `DENSITY` to 6 (the game's `MAX_RENDER_SCALE`).

Fonts load from Google Fonts (Press Start 2P · VT323 · DotGothic16).

## Run locally
Any static server works:
```bash
python3 -m http.server 8910      # then open http://localhost:8910
```

## Deploy

### Hostinger (where the domain lives now)
Upload `index.html`, `styles.css`, `game.js` and the `assets/efe/` folder (keep the path) to
`public_html` via **hPanel → File Manager** or FTP. That's it — no build, no Node. Nothing else
in `assets/` is used by the site. The domain `efeuslu.me` already points there.

### Vercel (alternative)
```bash
npx vercel        # from this folder; it's detected as a static site
```
Then add `efeuslu.me` as a custom domain in the Vercel dashboard and update the DNS records
at Hostinger to point to Vercel.

## Before going live — fill these in
- **LinkedIn URL** — `index.html` contact section links to a placeholder
  (`<a ... data-placeholder="true">`). Swap in your real profile URL.
- **Project logos** — the project cards use letter placeholders (`.proj-logo`). Drop in real
  logos when ready (replace the `<div class="proj-logo">…</div>` with an `<img>`).
- **Optional:** GitHub link, a CV download button, analytics.

## Accessibility / quality notes
- Portfolio is real HTML and renders even with JavaScript disabled (the game just doesn't start).
- "Doğrudan siteye geç" on the start screen and "↻ Oyunu oyna" in the site let people skip or replay.
- Touch controls appear on touch devices; keyboard is Arrow/WASD + Space.
- `prefers-reduced-motion` is respected; focus styles are visible; sound is muted-toggleable.
