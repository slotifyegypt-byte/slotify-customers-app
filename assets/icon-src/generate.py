#!/usr/bin/env python3
"""Writes the SVG sources of every app icon into this folder.

One mark (a calendar with the mint "slot" sliding in), drawn once in a 600x600 box and placed on each canvas with
a palette per variant. The PNGs in assets/images are rendered from these SVGs in a browser at the sizes below:

    icon-light.svg      1024  iOS light + the app's `icon`
    icon-dark.svg       1024  iOS dark
    icon-tinted.svg     1024  iOS tinted (greyscale; iOS applies the tint)
    android-background  1024  adaptive icon background
    android-foreground  1024  adaptive icon foreground (transparent)
    android-monochrome  1024  Android 13+ themed icon (single colour, transparent)
    notification        256   Android notification glyph (white, transparent)
    splash-light/dark   1080  splash image (transparent)
    logo-mark           512   the mark alone, for the white tile on the sign-in screen
    favicon             196   web

Run: python3 assets/icon-src/generate.py   (then re-render the PNGs)
"""
from pathlib import Path

OUT = Path(__file__).parent

INDIGO_DEEP = '#2F2059'
MINT = '#6DCFBF'

# Palettes. `body` is the calendar page, `head` the header band and rings, `dot` the faint date dots.
LIGHT = dict(
    bg=('#FFFFFF', '#E4E1F3'),
    body=('#FFFFFF', '#F3F1FB'),
    body_stroke='none',
    head=('#43319A', '#2A1A58'),
    ring='#2F2059',
    dot=('#2F2059', 0.14),
    pill=('#8BE4D5', '#52C2B0'),
    shadow=('#2F2059', 0.28),
    glow=None,
    soft='#0E5E52',
)
DARK = dict(
    bg=('#2C2166', '#0A0912'),
    body=('#272062', '#17133A'),
    body_stroke=('#ECEBFF', 0.16),
    head=('#7E6CF0', '#4B3BA6'),
    ring='#C9C0FF',
    dot=('#ECEBFF', 0.2),
    pill=('#8BE4D5', '#52C2B0'),
    shadow=('#000000', 0.5),
    glow=('#6DCFBF', 0.45),
    soft='#052B25',
)
TINTED = dict(
    bg=('#000000', '#000000'),
    body=('#2E2E2E', '#262626'),
    body_stroke=('#FFFFFF', 0.18),
    head=('#DCDCDC', '#BEBEBE'),
    ring='#E6E6E6',
    dot=('#FFFFFF', 0.22),
    pill=('#FFFFFF', '#F0F0F0'),
    shadow=('#000000', 0.4),
    glow=None,
    soft='#000000',
)
# Same colours as LIGHT, but the page is tinted so it reads on a plain white tile.
ON_WHITE = dict(LIGHT, body=('#EFECFA', '#E6E2F6'))


def mark(p, uid, mono=None):
    """The mark in a 600x600 box. `mono` ('#000'/'#fff') draws a flat single-colour version."""
    if mono:
        return f'''
  <defs>
    <clipPath id="body{uid}"><rect x="30" y="100" width="540" height="470" rx="104"/></clipPath>
  </defs>
  <g fill="{mono}">
    <rect x="47" y="117" width="506" height="436" rx="87" fill="none" stroke="{mono}" stroke-width="34"/>
    <g clip-path="url(#body{uid})"><rect x="30" y="100" width="540" height="150"/></g>
    <rect x="165" y="38" width="58" height="124" rx="29"/>
    <rect x="377" y="38" width="58" height="124" rx="29"/>
    <g transform="translate(376 388) rotate(-30)">
      <rect x="-142" y="-70" width="284" height="140" rx="52"/>
      <line x1="-256" y1="-32" x2="-180" y2="-32" stroke="{mono}" stroke-width="22" stroke-linecap="round"/>
      <line x1="-218" y1="34" x2="-180" y2="34" stroke="{mono}" stroke-width="22" stroke-linecap="round"/>
    </g>
  </g>'''
    dot_c, dot_o = p['dot']
    stroke = (
        f'stroke="{p["body_stroke"][0]}" stroke-opacity="{p["body_stroke"][1]}" stroke-width="3"'
        if p['body_stroke'] != 'none'
        else ''
    )
    sh_c, sh_o = p['shadow']
    glow = ''
    if p['glow']:
        gc, go = p['glow']
        glow = f'''<g transform="translate(376 388) rotate(-30)" filter="url(#blur{uid})" opacity="{go}">
      <rect x="-142" y="-70" width="284" height="140" rx="52" fill="{gc}"/></g>'''
    dots = ''.join(
        f'<circle cx="{x}" cy="{y}" r="15" fill="{dot_c}" fill-opacity="{dot_o}"/>'
        for x, y in [(104, 300), (166, 300), (228, 300), (290, 300), (104, 362), (166, 362)]
    )
    return f'''
  <defs>
    <linearGradient id="body{uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="{p['body'][0]}"/><stop offset="1" stop-color="{p['body'][1]}"/>
    </linearGradient>
    <linearGradient id="head{uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{p['head'][0]}"/><stop offset="1" stop-color="{p['head'][1]}"/>
    </linearGradient>
    <linearGradient id="pill{uid}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{p['pill'][0]}"/><stop offset="1" stop-color="{p['pill'][1]}"/>
    </linearGradient>
    <clipPath id="clip{uid}"><rect x="30" y="100" width="540" height="470" rx="104"/></clipPath>
    <filter id="shadow{uid}" x="-20%" y="-20%" width="140%" height="150%">
      <feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="{sh_c}" flood-opacity="{sh_o}"/>
    </filter>
    <filter id="soft{uid}" x="-30%" y="-30%" width="160%" height="180%">
      <feDropShadow dx="0" dy="10" stdDeviation="12" flood-color="{p['soft']}" flood-opacity="0.35"/>
    </filter>
    <filter id="blur{uid}" x="-50%" y="-80%" width="200%" height="260%"><feGaussianBlur stdDeviation="26"/></filter>
  </defs>
  <rect x="30" y="100" width="540" height="470" rx="104" fill="url(#body{uid})" filter="url(#shadow{uid})" {stroke}/>
  <g clip-path="url(#clip{uid})"><rect x="30" y="100" width="540" height="140" fill="url(#head{uid})"/></g>
  {dots}
  <rect x="165" y="38" width="58" height="124" rx="29" fill="{p['ring']}"/>
  <rect x="377" y="38" width="58" height="124" rx="29" fill="{p['ring']}"/>
  {glow}
  <g transform="translate(376 388) rotate(-30)">
    <line x1="-256" y1="-32" x2="-180" y2="-32" stroke="{p['pill'][1]}" stroke-width="22" stroke-linecap="round" opacity="0.55"/>
    <line x1="-218" y1="34" x2="-180" y2="34" stroke="{p['pill'][1]}" stroke-width="22" stroke-linecap="round" opacity="0.32"/>
    <rect x="-142" y="-70" width="284" height="140" rx="52" fill="url(#pill{uid})" filter="url(#soft{uid})"/>
    <rect x="-130" y="-60" width="260" height="42" rx="21" fill="#FFFFFF" opacity="0.18"/>
  </g>'''


def svg(size, body, bg=None, rounded=0):
    clip = ''
    if rounded:
        clip = f'<clipPath id="round"><rect width="{size}" height="{size}" rx="{rounded}"/></clipPath>'
    inner = body
    if rounded:
        inner = f'<g clip-path="url(#round)">{body}</g>'
    return (
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{size}" height="{size}" viewBox="0 0 {size} {size}">'
        f'<defs>{clip}</defs>{inner}</svg>'
    )


def bg_rect(size, colors, glow=False):
    a, b = colors
    extra = ''
    if glow:
        extra = (
            f'<radialGradient id="gl" cx="0.5" cy="0.18" r="0.75"><stop offset="0" stop-color="#5846C8" stop-opacity="0.55"/>'
            f'<stop offset="1" stop-color="#5846C8" stop-opacity="0"/></radialGradient>'
        )
    out = (
        f'<defs><linearGradient id="bgg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{a}"/>'
        f'<stop offset="1" stop-color="{b}"/></linearGradient>{extra}</defs>'
        f'<rect width="{size}" height="{size}" fill="url(#bgg)"/>'
    )
    if glow:
        out += f'<rect width="{size}" height="{size}" fill="url(#gl)"/>'
    return out


def placed(size, scale, inner):
    # The mark's visual centre is about (300, 305) in its own box.
    tx = size / 2 - 300 * scale
    ty = size / 2 - 305 * scale
    return f'<g transform="translate({tx:.2f} {ty:.2f}) scale({scale})">{inner}</g>'


def write(name, content):
    (OUT / f'{name}.svg').write_text(content)


write('icon-light', svg(1024, bg_rect(1024, LIGHT['bg']) + placed(1024, 1.26, mark(LIGHT, 'a'))))
write('icon-dark', svg(1024, bg_rect(1024, DARK['bg'], glow=True) + placed(1024, 1.26, mark(DARK, 'b'))))
write('icon-tinted', svg(1024, bg_rect(1024, TINTED['bg']) + placed(1024, 1.26, mark(TINTED, 'c'))))
write('android-background', svg(1024, bg_rect(1024, LIGHT['bg'])))
write('android-foreground', svg(1024, placed(1024, 0.98, mark(LIGHT, 'd'))))
write('android-monochrome', svg(1024, placed(1024, 0.98, mark(None, 'e', mono='#000000'))))
write('notification', svg(256, placed(256, 0.34, mark(None, 'f', mono='#FFFFFF'))))
write('splash-light', svg(1080, placed(1080, 1.4, mark(LIGHT, 'g'))))
write('splash-dark', svg(1080, placed(1080, 1.4, mark(DARK, 'h'))))
write('logo-mark', svg(512, placed(512, 0.86, mark(ON_WHITE, 'i'))))
write('favicon', svg(196, bg_rect(196, LIGHT['bg']) + placed(196, 0.241, mark(LIGHT, 'j')), rounded=44))
print('wrote', len(list(OUT.glob('*.svg'))), 'svgs')
