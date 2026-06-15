#!/usr/bin/env python3
"""Generate a placeholder ANIMATED hero sprite sheet (hatless base; the game
draws the straw hat as an overlay). 16x16 frames, horizontal strips.
Output: assets/hero/Idle.png (2), Run.png (4), Jump.png (1)."""
from PIL import Image
import os

PAL = {
    '.': (0, 0, 0, 0),
    'K': (90, 58, 30, 255),    # hair
    'S': (244, 194, 140, 255), # skin
    's': (217, 154, 99, 255),  # skin shadow
    'E': (26, 16, 36, 255),    # eye
    'R': (229, 37, 33, 255),   # vest red
    'B': (47, 99, 214, 255),   # shorts/legs blue
    'N': (16, 26, 76, 255),    # shoe navy
}

def pad(rows):
    return [r.ljust(16, '.')[:16] for r in rows]

# upper body rows 0..12 (eyes open). Head cols 5-10, body cols 4-11.
def upper(blink=False):
    eyes = '.....SSSSSS' if blink else '.....SESSES'
    return [
        '................',
        '......KKKK......',
        '.....KSSSSK.....',
        '.....SSSSSS.....',
        eyes,
        '.....SSSSSS.....',
        '......sSSs......',
        '....RRRRRRRR....',
        '...SRRRRRRRRS...',
        '...SRRRRRRRRS...',
        '....RRRRRRRR....',
        '....BBBBBBBB....',
        '....BBBBBBBB....',
    ]

# leg sets (rows 13,14,15)
LEGS = {
    'stand':  ['....BBB..BBB....', '....BBB..BBB....', '...NNNN..NNNN...'],
    'strideR':['....BBB..BBB....', '....BB...BBB....', '...NNN....NNNN..'],
    'strideL':['....BBB..BBB....', '....BBB...BB....', '..NNNN....NNN...'],
    'jump':   ['....BBB..BBB....', '...NNNN..NNNN...', '................'],
}

def frame(blink=False, legs='stand', bob=0):
    grid = pad(upper(blink)) + pad(LEGS[legs])   # 16 rows
    if bob:                                       # shift whole body up `bob` px
        grid = grid[bob:] + ['.' * 16] * bob
    return grid

def render(grid, scale=1):
    img = Image.new('RGBA', (16 * scale, 16 * scale), (0, 0, 0, 0))
    px = img.load()
    for y, row in enumerate(grid):
        for x, ch in enumerate(row):
            c = PAL.get(ch, (0, 0, 0, 0))
            if c[3] == 0:
                continue
            for dy in range(scale):
                for dx in range(scale):
                    px[x * scale + dx, y * scale + dy] = c
    return img

def strip(frames, name, scale=1):
    imgs = [render(f, scale) for f in frames]
    w = 16 * scale * len(imgs)
    sheet = Image.new('RGBA', (w, 16 * scale), (0, 0, 0, 0))
    for i, im in enumerate(imgs):
        sheet.paste(im, (i * 16 * scale, 0))
    out = os.path.join('assets', 'hero', name)
    sheet.save(out)
    print('wrote', out, sheet.size, len(imgs), 'frames')

idle = [frame(blink=False), frame(blink=True)]
run = [frame(legs='stand'), frame(legs='strideR', bob=1),
       frame(legs='stand'), frame(legs='strideL', bob=1)]
jump = [frame(legs='jump')]

strip(idle, 'Idle.png')
strip(run, 'Run.png')
strip(jump, 'Jump.png')
print('done')
