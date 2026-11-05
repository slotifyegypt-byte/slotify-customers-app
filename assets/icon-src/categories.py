#!/usr/bin/env python3
"""Writes the SVG sources of the nine category badges (Home chips, map pins), light and dark.

Every badge is a square (the app crops it to a circle): a soft wash of the category colour with a two-tone glyph.
`P` is the glyph's main colour, `S` its softer second tone, `BG` the badge wash (also used for cut-outs).

    python3 assets/icon-src/categories.py     # writes cat-<key>-<light|dark>.svg here
    # then render each at 192x192 into assets/images/categories/<key>-<light|dark>.png
"""
from pathlib import Path

OUT = Path(__file__).parent

# key: category colour (matches the map-pin palette in src/features/home/utils/categoryIcon.ts)
CATEGORIES = {
    'barber': '#4C6FD1',
    'nail-salon': '#D65C6C',
    'hair-salon': '#C4517C',
    'spa': '#4C41A8',
    'car-care': '#0F6E56',
    'tire-shop': '#3B4A6B',
    'tailor': '#A8511F',
    'vet': '#2F7D6B',
    'automotive': '#854F0B',
}


def mix(a, b, t):
    """a * (1 - t) + b * t, as a hex colour."""
    pa = [int(a[i : i + 2], 16) for i in (1, 3, 5)]
    pb = [int(b[i : i + 2], 16) for i in (1, 3, 5)]
    return '#' + ''.join(f'{round(x * (1 - t) + y * t):02X}' for x, y in zip(pa, pb))


def palette(base, scheme):
    if scheme == 'light':
        return dict(
            bg=mix('#FFFFFF', base, 0.14),
            bg2=mix('#FFFFFF', base, 0.22),
            P=mix(base, '#15112B', 0.18),
            S=mix('#FFFFFF', base, 0.5),
            hi='#FFFFFF',
        )
    return dict(
        bg=mix('#121120', base, 0.3),
        bg2=mix('#0A0912', base, 0.22),
        P=mix(base, '#FFFFFF', 0.62),
        S=mix('#121120', base, 0.72),
        hi='#FFFFFF',
    )


def glyph(key, c):
    P, S, BG, HI = c['P'], c['S'], c['bg'], c['hi']
    sparkle = lambda x, y, r, col: (
        f'<path d="M{x} {y - r} Q{x + r * .18} {y - r * .18} {x + r} {y} Q{x + r * .18} {y + r * .18} {x} {y + r} '
        f'Q{x - r * .18} {y + r * .18} {x - r} {y} Q{x - r * .18} {y - r * .18} {x} {y - r}Z" fill="{col}"/>'
    )
    if key == 'barber':
        return f'''
  <defs><clipPath id="cap"><rect x="39" y="26" width="22" height="48" rx="11"/></clipPath></defs>
  <rect x="39" y="26" width="22" height="48" rx="11" fill="{S}"/>
  <g clip-path="url(#cap)" fill="{P}">
    <polygon points="30,36 70,18 70,30 30,48"/><polygon points="30,60 70,42 70,54 30,72"/><polygon points="30,84 70,66 70,78 30,96"/>
  </g>
  <rect x="35" y="19" width="30" height="9" rx="4.5" fill="{P}"/><rect x="35" y="72" width="30" height="9" rx="4.5" fill="{P}"/>
  <rect x="44" y="32" width="4" height="36" rx="2" fill="{HI}" opacity="0.45"/>
  {sparkle(76, 28, 7, S)}'''
    if key == 'hair-salon':
        return f'''
  <g stroke-linecap="round" fill="none">
    <line x1="35" y1="19" x2="63" y2="65" stroke="{P}" stroke-width="7"/>
    <line x1="65" y1="19" x2="37" y2="65" stroke="{S}" stroke-width="7"/>
    <circle cx="67" cy="74" r="9" stroke="{P}" stroke-width="6"/>
    <circle cx="33" cy="74" r="9" stroke="{S}" stroke-width="6"/>
  </g>
  <circle cx="50" cy="43" r="4" fill="{BG}"/>
  {sparkle(76, 24, 8, P)}'''
    if key == 'nail-salon':
        return f'''
  <rect x="35" y="45" width="30" height="35" rx="10" fill="{P}"/>
  <rect x="44" y="41" width="12" height="8" rx="2" fill="{S}"/>
  <rect x="42" y="17" width="16" height="26" rx="5" fill="{S}"/>
  <rect x="46" y="21" width="3.5" height="16" rx="1.75" fill="{HI}" opacity="0.5"/>
  <rect x="40.5" y="54" width="5" height="19" rx="2.5" fill="{HI}" opacity="0.5"/>
  {sparkle(76, 36, 8, S)}{sparkle(25, 62, 5, S)}'''
    if key == 'spa':
        return f'''
  <g transform="translate(50 74)">
    <ellipse cx="0" cy="-22" rx="9" ry="22" transform="rotate(-62)" fill="{S}"/>
    <ellipse cx="0" cy="-22" rx="9" ry="22" transform="rotate(62)" fill="{S}"/>
    <ellipse cx="0" cy="-22" rx="9" ry="22" transform="rotate(-32)" fill="{P}" opacity="0.7"/>
    <ellipse cx="0" cy="-22" rx="9" ry="22" transform="rotate(32)" fill="{P}" opacity="0.7"/>
    <ellipse cx="0" cy="-24" rx="10" ry="24" fill="{P}"/>
  </g>
  <path d="M24 78 Q50 92 76 78" stroke="{S}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <rect x="47" y="34" width="3.5" height="20" rx="1.75" fill="{HI}" opacity="0.4"/>'''
    if key == 'car-care':
        return f'''
  <path d="M20 62V54Q20 49 25 48L35 46L42 35Q44 32 48 32H62Q66 32 68 35L74 46L78 48Q82 49 82 54V62Q82 66 78 66H24Q20 66 20 62Z" fill="{P}"/>
  <path d="M40 46L45 37H52V46Z" fill="{BG}"/><path d="M56 46V37H62L67 46Z" fill="{BG}"/>
  <circle cx="34" cy="67" r="9" fill="{S}" stroke="{BG}" stroke-width="3"/><circle cx="68" cy="67" r="9" fill="{S}" stroke="{BG}" stroke-width="3"/>
  <circle cx="34" cy="67" r="3.2" fill="{BG}"/><circle cx="68" cy="67" r="3.2" fill="{BG}"/>
  {sparkle(76, 22, 8, S)}{sparkle(26, 28, 5, S)}'''
    if key == 'tire-shop':
        nubs = ''.join(f'<rect x="48" y="20" width="4" height="6" rx="2" fill="{BG}" transform="rotate({a} 50 50)"/>' for a in range(0, 360, 30))
        spokes = ''.join(f'<line x1="50" y1="43" x2="50" y2="35" stroke="{P}" stroke-width="4.5" stroke-linecap="round" transform="rotate({a} 50 50)"/>' for a in range(0, 360, 72))
        return f'''
  <circle cx="50" cy="50" r="30" fill="{P}"/>{nubs}
  <circle cx="50" cy="50" r="19" fill="{S}"/>{spokes}
  <circle cx="50" cy="50" r="7" fill="{P}"/><circle cx="50" cy="50" r="2.6" fill="{BG}"/>
  <path d="M34 30A24 24 0 0 1 48 23" stroke="{HI}" stroke-width="3" stroke-linecap="round" fill="none" opacity="0.4"/>'''
    if key == 'tailor':
        return f'''
  <path d="M50 42V36Q50 29 56 28Q63 27 63 33Q63 38 57 40" stroke="{P}" stroke-width="5" stroke-linecap="round" fill="none"/>
  <path d="M50 41L82 63Q86 67 81 68H19Q14 67 18 63Z" fill="{P}"/>
  <line x1="27" y1="61" x2="73" y2="61" stroke="{BG}" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="1 6" opacity="0.9"/>
  {sparkle(75, 26, 7, S)}
  <rect x="22" y="74" width="56" height="5" rx="2.5" fill="{S}"/>'''
    if key == 'vet':
        return f'''
  <path d="M50 47C38 47 28 59 31 68C33 74 42 72 50 72C58 72 67 74 69 68C72 59 62 47 50 47Z" fill="{P}"/>
  <ellipse cx="29" cy="46" rx="6.5" ry="9" transform="rotate(-24 29 46)" fill="{S}"/>
  <ellipse cx="42" cy="32" rx="6.8" ry="9.5" transform="rotate(-8 42 32)" fill="{P}"/>
  <ellipse cx="58" cy="32" rx="6.8" ry="9.5" transform="rotate(8 58 32)" fill="{P}"/>
  <ellipse cx="71" cy="46" rx="6.5" ry="9" transform="rotate(24 71 46)" fill="{S}"/>
  <path d="M50 68C44 63 41 60 41 57C41 54 43.5 52.5 45.5 52.5C47.5 52.5 49 53.5 50 55C51 53.5 52.5 52.5 54.5 52.5C56.5 52.5 59 54 59 57C59 60 56 63 50 68Z" fill="{BG}"/>'''
    # automotive: crossed wrenches
    wrench = lambda col, rot: f'''<g transform="rotate({rot} 50 50)">
    <rect x="45" y="36" width="10" height="46" rx="5" fill="{col}"/><circle cx="50" cy="31" r="14" fill="{col}"/>
    <path d="M45 18.5V31H55V18.5Q52.5 17 50 17Q47.5 17 45 18.5Z" fill="{BG}"/><circle cx="50" cy="76" r="3.4" fill="{BG}"/></g>'''
    return wrench(S, 45) + wrench(P, -45)


def svg(key, base, scheme):
    c = palette(base, scheme)
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 100 100">'
        f'<defs><linearGradient id="w" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{c["bg2"] if scheme == "dark" else c["bg"]}"/>'
        f'<stop offset="1" stop-color="{c["bg"] if scheme == "dark" else c["bg2"]}"/></linearGradient></defs>'
        '<rect width="100" height="100" fill="url(#w)"/>'
        f'<g transform="translate(50 50) scale(0.92) translate(-50 -50)">{glyph(key, c)}</g></svg>'
    )


for key, base in CATEGORIES.items():
    for scheme in ('light', 'dark'):
        (OUT / f'cat-{key}-{scheme}.svg').write_text(svg(key, base, scheme))
print('wrote', len(list(OUT.glob('cat-*.svg'))), 'category svgs')
