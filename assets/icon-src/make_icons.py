#!/usr/bin/env python3
"""Builds every app icon from the official Slotify mark (Brand Kit, page 4 "Logo and Variations").

Source: `slotify-mark-brand.png` next to this script, the brand's icon artwork exactly as delivered: the navy
calendar (#2F1F5B) and the mint slot with its speed lines (#6BCFC0) on a white background. The two colours never
touch, so each pixel is unmixed against white into (part, opacity): that gives a clean transparent mark that can be
recoloured for the brand's variations without redrawing it.

Variations used (as on page 4):
  colour  navy calendar + mint slot             light backgrounds ("on White")
  inverse white calendar + mint slot            dark / navy backgrounds ("on Black")
  tinted  white calendar + light-grey slot      iOS tinted icons (greyscale; iOS applies the tint)
  solid   one colour, the whole mark            Android themed icon and notification glyph

Run from the app's root:  python3 assets/icon-src/make_icons.py customer|partner
(and for the web dashboard: python3 assets/icon-src/make_icons.py web ../slotify-partners-web/public)
The customer app keeps the white tile; the partner app uses the navy tile, so the two apps are easy to tell apart.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / 'images'

NAVY = np.array([0x2F, 0x1F, 0x5B], float)
MINT = np.array([0x6B, 0xCF, 0xC0], float)
WHITE = np.array([255, 255, 255], float)
DARK_BG = (0x0A, 0x09, 0x12)  # the apps' dark splash background


def unmix(path: Path):
    """(calendar alpha, slot alpha) in 0..1, from the artwork on white."""
    rgb = np.asarray(Image.open(path).convert('RGB'), float)
    layers = []
    for colour in (NAVY, MINT):
        d = WHITE - colour
        # How far each pixel has moved from white towards this colour (least squares over the three channels).
        a = ((WHITE - rgb) @ d) / (d @ d)
        # Distance from the white→colour line: pixels belonging to the other colour are far from it.
        resid = np.linalg.norm((WHITE - rgb) - a[..., None] * d, axis=-1)
        layers.append((np.clip(a, 0, 1), resid))
    (a_cal, r_cal), (a_slot, r_slot) = layers
    cal = np.where(r_cal <= r_slot, a_cal, 0.0)
    slot = np.where(r_slot < r_cal, a_slot, 0.0)
    # Drop the faint noise left in the white background.
    cal[cal < 0.02] = 0
    slot[slot < 0.02] = 0
    return cal, slot


def render(cal, slot, cal_rgb, slot_rgb) -> Image.Image:
    """The mark as RGBA, cropped to its edges."""
    alpha = np.clip(cal + slot, 0, 1)
    rgb = (cal[..., None] * np.array(cal_rgb, float) + slot[..., None] * np.array(slot_rgb, float)) / np.maximum(
        alpha, 1e-6
    )[..., None]
    img = Image.fromarray(np.dstack([np.clip(rgb, 0, 255), alpha * 255]).astype(np.uint8), 'RGBA')
    return img.crop(img.getbbox())


def place(mark: Image.Image, size: int, height_ratio: float, bg=None) -> Image.Image:
    """The mark centred on a square canvas, its height a share of the canvas (it is slightly taller than wide)."""
    h = round(size * height_ratio)
    w = round(mark.width * h / mark.height)
    m = mark.resize((w, h), Image.LANCZOS)
    canvas = Image.new('RGBA', (size, size), (*bg, 255) if bg else (0, 0, 0, 0))
    canvas.alpha_composite(m, ((size - w) // 2, (size - h) // 2))
    return canvas


def save(img: Image.Image, name: str, opaque=False):
    (img.convert('RGB') if opaque else img).save(OUT / name, optimize=True)
    print('wrote', name, img.size)


def main():
    app = sys.argv[1] if len(sys.argv) > 1 else ''
    if app == 'web':
        return web(Path(sys.argv[2]).resolve())
    if app not in ('customer', 'partner'):
        sys.exit('usage: make_icons.py customer|partner, or make_icons.py web <slotify-partners-web/public>')
    cal, slot = unmix(HERE / 'slotify-mark-brand.png')
    W, N, M = (255, 255, 255), tuple(NAVY.astype(int)), tuple(MINT.astype(int))
    colour = render(cal, slot, N, M)
    inverse = render(cal, slot, W, M)
    tinted = render(cal, slot, W, (200, 200, 200))
    solid = render(cal, slot, W, W)

    # Home-screen icon. Apple and Google round the corners themselves.
    tile_bg, tile_mark = ((255, 255, 255), colour) if app == 'customer' else (tuple(NAVY.astype(int)), inverse)
    save(place(tile_mark, 1024, 0.62, tile_bg), 'icon.png', opaque=True)
    # iOS 18 dark and tinted icons: transparent, iOS draws the background.
    save(place(inverse, 1024, 0.62), 'icon-dark.png')
    save(place(tinted, 1024, 0.62), 'icon-tinted.png')
    # Android adaptive icon: the launcher masks a 108dp square to as little as a 66dp circle, so the whole mark
    # stays inside the middle 61% (its corners included).
    save(Image.new('RGBA', (1024, 1024), (*tile_bg, 255)), 'android-icon-background.png', opaque=True)
    save(place(tile_mark, 1024, 0.44), 'android-icon-foreground.png')
    save(place(solid, 1024, 0.44), 'android-icon-monochrome.png')
    # Splash screens (light and dark backgrounds come from app.config.ts).
    save(place(colour, 1080, 0.6), 'splash-icon.png')
    save(place(inverse, 1080, 0.6), 'splash-icon-dark.png')
    # Android notification glyph: white on transparent, as Android requires.
    save(place(solid, 256, 0.78), 'notification-icon.png')
    # Web favicon (Expo web): the home-screen tile, small.
    save(place(tile_mark, 196, 0.66, tile_bg), 'favicon.png', opaque=True)
    # The mark alone (transparent), for logo tiles inside the app.
    if app == 'customer':
        save(place(colour, 512, 0.92), 'logo-mark.png')
    else:
        # Shown in a tile that follows the theme (dark in dark mode): keep the mark on its own white square.
        save(place(colour, 512, 0.84, (255, 255, 255)), 'slotify-logo.png', opaque=True)


def web(public: Path):
    """The partner dashboard's logo, favicon and home-screen icon (public/ of slotify-partners-web)."""
    global OUT
    OUT = public
    cal, slot = unmix(HERE / 'slotify-mark-brand.png')
    colour = render(cal, slot, tuple(NAVY.astype(int)), tuple(MINT.astype(int)))
    # On a white square: the logo sits in white tiles and on dark pages alike, and a tab bar may be dark.
    save(place(colour, 512, 0.84, (255, 255, 255)), 'slotify-logo.png', opaque=True)
    save(place(colour, 64, 0.84, (255, 255, 255)), 'favicon.png', opaque=True)
    save(place(colour, 180, 0.66, (255, 255, 255)), 'apple-touch-icon.png', opaque=True)


if __name__ == '__main__':
    main()
