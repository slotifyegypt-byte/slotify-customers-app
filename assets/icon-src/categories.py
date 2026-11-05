#!/usr/bin/env python3
"""Writes the SVG sources of the category badges (Home chips, map pins), light and dark.

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
    'dentist': '#1C93A8',
    'dermatologist': '#D0804A',
    'doctor': '#3A7BC8',
    'lab-and-imaging': '#8A5CC2',
    'lawyer': '#7A6232',
    'makeup-artist': '#C23B6B',
    'pilates-studio': '#4E9F3D',
    'real-estate': '#2D6A9F',
    'therapist': '#E08A2E',
    'wedding-dress-atelier': '#C48A9C',
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
    if key == 'dentist':
        return f'''
  <path d="M30 38Q30 24 42 24Q47 24 50 27Q53 24 58 24Q70 24 70 38Q70 50 64 58Q62 77 56 77Q51 77 50 64Q49 77 44 77Q38 77 36 58Q30 50 30 38Z" fill="{P}" stroke="{P}" stroke-width="2" stroke-linejoin="round"/>
  <path d="M38 33Q39 29 43 29" stroke="{HI}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  {sparkle(76, 26, 8, S)}{sparkle(24, 64, 5, S)}'''
    if key == 'dermatologist':
        return f'''
  <path d="M50 20C50 20 27 46 27 61A23 23 0 0 0 73 61C73 46 50 20 50 20Z" fill="{P}"/>
  <path d="M50 20C50 20 27 46 27 61A23 23 0 0 0 38 80C28 66 34 48 50 20Z" fill="{S}" opacity="0.55"/>
  <path d="M36 62Q37 72 46 75" stroke="{HI}" stroke-width="3.5" stroke-linecap="round" fill="none" opacity="0.55"/>
  {sparkle(72, 28, 8, S)}{sparkle(27, 30, 5, S)}'''
    if key == 'doctor':
        return f'''
  <path d="M32 22V44Q32 63 50 63Q68 63 68 44V22" stroke="{P}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <circle cx="32" cy="21" r="5" fill="{S}"/><circle cx="68" cy="21" r="5" fill="{S}"/>
  <path d="M50 63V70Q50 78 58 78" stroke="{P}" stroke-width="6" stroke-linecap="round" fill="none"/>
  <circle cx="66" cy="78" r="9" fill="{P}"/><circle cx="66" cy="78" r="4" fill="{BG}"/>
  {sparkle(80, 40, 6, S)}'''
    if key == 'lab-and-imaging':
        return f'''
  <defs><clipPath id="fl"><path d="M42 24H58V42L73 70Q77 79 67 79H33Q23 79 27 70L42 42Z"/></clipPath></defs>
  <path d="M42 24H58V42L73 70Q77 79 67 79H33Q23 79 27 70L42 42Z" fill="{S}"/>
  <g clip-path="url(#fl)"><rect x="20" y="58" width="60" height="26" fill="{P}"/></g>
  <rect x="38" y="19" width="24" height="7" rx="3.5" fill="{P}"/>
  <circle cx="45" cy="67" r="3" fill="{HI}" opacity="0.5"/><circle cx="56" cy="71" r="2.2" fill="{HI}" opacity="0.5"/><circle cx="52" cy="50" r="2.6" fill="{P}" opacity="0.6"/>
  {sparkle(76, 28, 7, S)}'''
    if key == 'lawyer':
        return f'''
  <g stroke-linecap="round">
    <line x1="24" y1="31" x2="76" y2="31" stroke="{P}" stroke-width="4"/>
    <line x1="50" y1="24" x2="50" y2="74" stroke="{P}" stroke-width="4"/>
    <line x1="28" y1="32" x2="18" y2="56" stroke="{P}" stroke-width="2"/><line x1="28" y1="32" x2="38" y2="56" stroke="{P}" stroke-width="2"/>
    <line x1="72" y1="32" x2="62" y2="56" stroke="{P}" stroke-width="2"/><line x1="72" y1="32" x2="82" y2="56" stroke="{P}" stroke-width="2"/>
  </g>
  <circle cx="50" cy="23" r="5" fill="{P}"/>
  <path d="M15 56H41Q41 68 28 68Q15 68 15 56Z" fill="{S}"/><path d="M59 56H85Q85 68 72 68Q59 68 59 56Z" fill="{S}"/>
  <rect x="34" y="73" width="32" height="7" rx="3.5" fill="{P}"/>'''
    if key == 'makeup-artist':
        return f'''
  <rect x="37" y="55" width="26" height="25" rx="4" fill="{P}"/>
  <rect x="40" y="46" width="20" height="11" rx="2" fill="{S}"/>
  <path d="M42 46V32L58 22V46Z" fill="{P}"/>
  <rect x="42" y="61" width="4" height="14" rx="2" fill="{HI}" opacity="0.45"/>
  {sparkle(76, 36, 8, S)}{sparkle(25, 30, 5, S)}'''
    if key == 'pilates-studio':
        return f'''
  <circle cx="50" cy="23" r="8" fill="{P}"/>
  <g stroke-linecap="round" fill="none" stroke-width="7">
    <path d="M50 36V58" stroke="{P}"/>
    <path d="M50 40L31 22" stroke="{S}"/><path d="M50 40L69 22" stroke="{S}"/>
    <path d="M50 58L37 76" stroke="{P}"/><path d="M50 58L63 76" stroke="{P}"/>
  </g>
  <rect x="20" y="81" width="60" height="6" rx="3" fill="{S}"/>
  {sparkle(78, 44, 6, S)}'''
    if key == 'real-estate':
        return f'''
  <rect x="64" y="23" width="8" height="18" rx="2" fill="{P}"/>
  <rect x="26" y="46" width="48" height="33" rx="4" fill="{S}"/>
  <path d="M50 20L82 47H18Z" fill="{P}" stroke="{P}" stroke-width="4" stroke-linejoin="round"/>
  <rect x="44" y="57" width="12" height="22" rx="2.5" fill="{P}"/><circle cx="53" cy="68" r="1.4" fill="{BG}"/>
  <rect x="30" y="54" width="9" height="9" rx="1.5" fill="{BG}"/><rect x="61" y="54" width="9" height="9" rx="1.5" fill="{BG}"/>
  {sparkle(80, 24, 6, S)}'''
    if key == 'therapist':
        return f'''
  <path d="M48 48H76Q80 48 80 52V70Q80 74 76 74H72L74 86L60 74H48Q44 74 44 70V52Q44 48 48 48Z" fill="{S}"/>
  <circle cx="53" cy="61" r="2.6" fill="{P}"/><circle cx="62" cy="61" r="2.6" fill="{P}"/><circle cx="71" cy="61" r="2.6" fill="{P}"/>
  <path d="M26 20H58Q64 20 64 26V46Q64 52 58 52H44L28 64L30 52H26Q20 52 20 46V26Q20 20 26 20Z" fill="{P}"/>
  <path d="M42 45C32 38 32 30 37 29C40 28.5 42 30 42 32C42 30 44 28.5 47 29C52 30 52 38 42 45Z" fill="{BG}"/>'''
    if key == 'wedding-dress-atelier':
        return f'''
  <path d="M38 50H62L81 81Q50 90 19 81Z" fill="{S}"/>
  <g stroke="{BG}" stroke-width="2" stroke-linecap="round" opacity="0.8"><line x1="46" y1="56" x2="38" y2="82"/><line x1="54" y1="56" x2="62" y2="82"/><line x1="50" y1="56" x2="50" y2="85"/></g>
  <path d="M37 27Q43 34 50 29Q57 34 63 27L62 50H38Z" fill="{P}"/>
  <rect x="35" y="47" width="30" height="6" rx="3" fill="{P}"/>
  
  {sparkle(77, 30, 8, S)}{sparkle(23, 40, 5, S)}'''
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
