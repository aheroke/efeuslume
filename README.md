# Efe World 1-1 — efeuslu.me

A playable résumé. Visitors are greeted with *"Beni tanımak için küçük bir oyuna var mısın?"*
and drop into a short Mario-style level: hit **?** blocks to reveal facts about Efe, stomp
**turtles** to reveal projects and **crabs** for bonus cards, then reach the **flag + castle** →
**HARİKASIN!** → warp into the real portfolio.

Concept fuses three worlds into the Mario grammar: a straw-hat hero (**One Piece**), a
**Persona 4** yellow victory splash, and a **Fenerbahçe** sarı-lacivert palette.

## Stack
Plain static site — no build step, no dependencies, no asset files (sprites are drawn in
canvas from pixel maps). Just three files:

| File | What it is |
|------|------------|
| `index.html` | Game screen markup + the static portfolio (works with JS off / good for SEO) |
| `styles.css` | Palette tokens, pixel UI, full portfolio styling, responsive + a11y |
| `game.js`   | Vanilla-canvas platformer engine, level, content, audio, transitions |

Fonts load from Google Fonts (Press Start 2P · VT323 · DotGothic16).

## Run locally
Any static server works:
```bash
python3 -m http.server 8910      # then open http://localhost:8910
```

## Deploy

### Hostinger (where the domain lives now)
Upload `index.html`, `styles.css`, `game.js` (and `README.md` if you like) to `public_html`
via **hPanel → File Manager** or FTP. That's it — no build, no Node. The domain `efeuslu.me`
already points there.

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
