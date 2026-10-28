#!/usr/bin/env python3
"""Build Efe's game sprites + site avatar from the AI-drawn source art.

  assets/animationsheet.png -> assets/efe/sprites.webp   one row per animation
  assets/hero.png           -> assets/efe/hero.webp      site hero avatar

Each sheet frame is cleaned (glow residue, ground shadow, dust puffs, frame
numbers and sparkles go), scaled by ONE factor so every pose keeps the same
size, and pasted into a fixed cell with the soles on the cell's bottom edge
and the head centred, so frames never jitter and mirroring never shifts.
Prints the cell size + frame counts for HERO_SHEET in game.js.

Needs Pillow.   python3 tools/build_sprites.py [--preview DIR]
"""
import math
import os
import sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

SHEET = 'assets/animationsheet.png'
HERO = 'assets/hero.png'
OUT = 'assets/efe'
DENSITY = 5         # atlas px per game px; the game draws the standing hero 30 px tall
STAND_H = 30 * DENSITY
HERO_MAX = 960      # longest side of the site avatar (~2x its biggest on-screen size)
SKY = (92, 148, 252, 255)

# sheet rows -> (y band, x band) holding the frame centres; labels + Blink fall
# outside. Measured on the 1536 px wide sheet, scaled to whatever size it is now.
REF_W = 1536
ROWS = {
    'idle': ((0, 215), (130, 1000)),
    'walk': ((215, 420), (130, 1536)),
    'run':  ((420, 620), (120, 1536)),
    'jump': ((620, 830), (120, 960)),
    'land': ((620, 830), (1000, 1536)),
    'wave': ((830, 1024), (130, 1536)),
}


def blobs(mask):
    """4-connected blobs of 255s in an L mask, as lists of flat pixel indices."""
    w, h = mask.size
    buf = bytearray(mask.tobytes())
    for i in range(w * h):
        if buf[i] != 255:
            continue
        buf[i] = 1
        stack, comp = [i], []
        while stack:
            j = stack.pop()
            comp.append(j)
            x = j % w
            for k, ok in ((j - 1, x > 0), (j + 1, x < w - 1), (j - w, j >= w), (j + w, j < w * (h - 1))):
                if ok and buf[k] == 255:
                    buf[k] = 1
                    stack.append(k)
        yield comp


def from_indices(size, idx):
    out = bytearray(size[0] * size[1])
    for j in idx:
        out[j] = 255
    return Image.frombytes('L', size, bytes(out))


def largest(mask):
    return from_indices(mask.size, max(blobs(mask), key=len, default=[]))


def find_frames(sheet):
    """Source boxes of every frame, per row, left to right."""
    k = sheet.width / REF_W
    s = max(1, round(4 * k))
    a = sheet.getchannel('A').resize((sheet.width // s, sheet.height // s), Image.Resampling.BOX)
    w = a.width
    rows = {name: [] for name in ROWS}
    for comp in blobs(a.point(lambda v: 255 if v >= 128 else 0)):
        if len(comp) < 500:                      # row labels, frame numbers, specks
            continue
        xs = [j % w for j in comp]
        ys = [j // w for j in comp]
        box = (min(xs) * s, min(ys) * s, (max(xs) + 1) * s, (max(ys) + 1) * s)
        cx, cy = (box[0] + box[2]) / 2 / k, (box[1] + box[3]) / 2 / k
        for name, ((y0, y1), (x0, x1)) in ROWS.items():
            if y0 <= cy < y1 and x0 <= cx < x1:
                rows[name].append(box)
    return {name: sorted(boxes) for name, boxes in rows.items()}


def clean(fr):
    """Keep only the character: everything outside its dark outline goes."""
    r, g, b, a = fr.split()
    a = a.point(lambda v: 0 if v < 24 else 255 if v >= 235 else v)
    sat = ImageChops.subtract(ImageChops.lighter(ImageChops.lighter(r, g), b),
                              ImageChops.darker(ImageChops.darker(r, g), b))
    pale = ImageChops.multiply(fr.convert('L').point(lambda v: 255 if v > 150 else 0),
                               sat.point(lambda v: 255 if v < 40 else 0))
    # solid, non-pale pixels form the outline wall; pale areas inside it (shirt,
    # soles, eye whites) survive, pale areas outside it (dust puffs) do not
    wall = ImageChops.multiply(a.point(lambda v: 255 if v == 255 else 0), ImageChops.invert(pale))
    wall = wall.filter(ImageFilter.MaxFilter(3))
    w, h = wall.size
    reach = []
    for comp in blobs(ImageChops.invert(wall)):
        if any(j < w or j >= w * (h - 1) or j % w in (0, w - 1) for j in comp):
            reach += comp
    outside = from_indices(fr.size, reach)
    puff_edge = ImageChops.multiply(outside.filter(ImageFilter.MaxFilter(3)), pale)   # pale ring the wall kept
    fr.putalpha(keep_body(ImageChops.subtract(a, ImageChops.lighter(outside, puff_edge))))
    drop_ground(fr)
    fr.putalpha(keep_body(fr.getchannel('A')))      # crumbs the ground cut left floating
    return fr


def keep_body(a):
    """Alpha of the biggest blob only (frame numbers, sparkles, neighbours' edges go)."""
    body = largest(a.point(lambda v: 255 if v >= 64 else 0)).filter(ImageFilter.MaxFilter(3))
    return ImageChops.multiply(a, body)


def drop_ground(fr):
    """Ground shadow + puff crumbs: in the feet band, nothing may sit below the
    lowest black-ink or coloured pixel of a column (the sole's outline), and a
    column with neither holds only shadow."""
    px = fr.load()
    w, h = fr.size
    _, top, _, bottom = solid_box(fr)
    feet = bottom - (bottom - top) // 5
    for x in range(w):
        low = None
        for y in range(feet, h):
            r, g, b, al = px[x, y]
            if al == 255 and ((299 * r + 587 * g + 114 * b) // 1000 < 40 or max(r, g, b) - min(r, g, b) >= 40):
                low = y
        for y in range(feet if low is None else low + 2, h):
            px[x, y] = (0, 0, 0, 0)


def scaled(im, s):
    size = (max(1, round(im.width * s)), max(1, round(im.height * s)))
    return im.convert('RGBa').resize(size, Image.Resampling.LANCZOS).convert('RGBA')


def solid_box(im):
    return im.getchannel('A').point(lambda v: 255 if v >= 128 else 0).getbbox()


def anchor(im):
    """(head centre x, sole y): centroid of the hair in the figure's top third."""
    x0, y0, x1, y1 = solid_box(im)
    px = im.load()
    sx = n = 0
    for y in range(y0, y0 + (y1 - y0) // 3):
        for x in range(x0, x1):
            r, g, b, al = px[x, y]
            if al >= 200 and max(r, g, b) < 140 and r > b + 8 and max(r, g, b) - min(r, g, b) < 90:
                sx += x
                n += 1
    return (sx / n if n else (x0 + x1) / 2), y1 - 1


def build_sheet(preview):
    sheet = Image.open(SHEET).convert('RGBA')
    found = find_frames(sheet)
    pad = round(10 * sheet.width / REF_W)
    raw = {name: [clean(sheet.crop((x0 - pad, y0 - pad, x1 + pad, y1 + pad)))
                  for x0, y0, x1, y1 in boxes] for name, boxes in found.items()}
    heights = sorted(solid_box(f)[3] - solid_box(f)[1] for f in raw['idle'])
    s = STAND_H / heights[len(heights) // 2]
    frames = {name: [] for name in raw}
    for name, frs in raw.items():
        for f in frs:
            f = scaled(f, s)
            ax, sole = anchor(f)
            frames[name].append((f, ax, sole))
    # one cell for all frames: symmetric around the head so mirroring is free,
    # and a whole number of game px each way so the feet land on the pixel grid
    half = up = 0
    for frs in frames.values():
        for f, ax, sole in frs:
            x0, y0, x1, y1 = f.getchannel('A').getbbox()
            half = max(half, ax - x0, x1 - ax)
            up = max(up, sole + 1 - y0)
    cw = 2 * DENSITY * math.ceil((half + 1) / DENSITY)
    ch = DENSITY * math.ceil((up + 1) / DENSITY)
    cols = max(len(frs) for frs in frames.values())
    atlas = Image.new('RGBA', (cw * cols, ch * len(frames)), (0, 0, 0, 0))
    for row, frs in enumerate(frames.values()):
        for col, (f, ax, sole) in enumerate(frs):
            atlas.alpha_composite(f, (col * cw + cw // 2 - round(ax), row * ch + ch - 1 - sole))
    os.makedirs(OUT, exist_ok=True)
    path = os.path.join(OUT, 'sprites.webp')
    # lossy colour is invisible at this density (and 2.6x smaller); alpha stays exact
    atlas.save(path, 'WEBP', quality=90, alpha_quality=100, method=6)
    print(f'{path}  {atlas.width}x{atlas.height}  {os.path.getsize(path) // 1024} KB  scale {s:.3f}')
    print(f'  cell {cw}x{ch} at density {DENSITY} (= {cw // DENSITY}x{ch // DENSITY} game px), feet centre on the cell bottom')
    for row, (name, frs) in enumerate(frames.items()):
        print(f'  row {row}: {name:5} {len(frs)} frames')
    if preview:
        write_preview(preview, atlas, frames, cw, ch)


def write_preview(folder, atlas, frames, cw, ch):
    os.makedirs(folder, exist_ok=True)
    z = max(1, 6 // DENSITY)
    sky = Image.new('RGBA', atlas.size, SKY)
    sky.alpha_composite(atlas)
    big = sky.resize((atlas.width * z, atlas.height * z), Image.Resampling.NEAREST)
    d = ImageDraw.Draw(big)
    for row in range(len(frames)):
        for col in range(atlas.width // cw):
            cx, by = (col * cw + cw // 2) * z, (row + 1) * ch * z
            d.line([(cx, by - ch * z), (cx, by)], fill=(255, 60, 60, 255))
            d.line([(col * cw * z, by - 1), ((col + 1) * cw * z, by - 1)], fill=(255, 210, 0, 255))
    big.save(os.path.join(folder, 'atlas_x3.png'))
    # onion skin per row: every frame stacked, to spot jitter of head and feet
    z = max(1, 8 // DENSITY)
    onion = Image.new('RGBA', (cw * z * len(frames), ch * z), SKY)
    for i, row in enumerate(range(len(frames))):
        layer = Image.new('RGBA', (cw, ch), (0, 0, 0, 0))
        n = len(list(frames.values())[row])
        for col in range(n):
            cell = atlas.crop((col * cw, row * ch, (col + 1) * cw, (row + 1) * ch))
            cell.putalpha(cell.getchannel('A').point(lambda v: v * 2 // (n + 1)))
            layer.alpha_composite(cell)
        onion.alpha_composite(layer.resize((cw * z, ch * z), Image.Resampling.NEAREST), (i * cw * z, 0))
    onion.save(os.path.join(folder, 'onion_x4.png'))
    print('  preview ->', folder)


def build_hero():
    im = Image.open(HERO).convert('RGBA')
    im.putalpha(keep_body(im.getchannel('A').point(lambda v: 0 if v < 24 else 255 if v >= 235 else v)))
    im = im.crop(im.getchannel('A').getbbox())
    im = scaled(im, HERO_MAX / max(im.size))
    path = os.path.join(OUT, 'hero.webp')
    im.save(path, 'WEBP', quality=88, alpha_quality=90, method=6)
    print(f'{path}  {im.width}x{im.height}  {os.path.getsize(path) // 1024} KB')


if __name__ == '__main__':
    preview = sys.argv[sys.argv.index('--preview') + 1] if '--preview' in sys.argv else None
    build_sheet(preview)
    build_hero()
