# Customer app design system

The customer app speaks the same visual language as the partner dashboard: **calm, confident and content-first**.
Deep indigo ink, one mint accent, cool indigo-tinted neutrals, hairline borders, soft shadows. People, places and
times are the heroes; surfaces stay quiet.

## Principles

1. **Hierarchy before decoration.** One hero per screen. Everything else supports it.
2. **Boldness in one place.** Deep indigo (`brand`) is the primary action and the selected state. Mint is only the
   live signal ("Open now"). Everything else is neutral.
3. **State is the word first, colour second.** Status pills say "Confirmed", "Pending" in sentence case. Never
   ALL-CAPS labels, never letter-spaced micro-labels, never coloured bars down the side of a row, never emoji.
4. **Honest data.** Never invent a number the backend does not give. A missing photo shows `Photo`'s placeholder,
   never a grey hole.
5. **Motion explains change.** Blocks rise in with `enter(i)`; things give a little under the finger
   (`PressableScale`); loading shows `Skeleton`s shaped like the content. Everything honours reduce-motion.

## Tokens (`src/theme`)

Always read colours with `useColors()`; never hard-code a hex in a screen (the only exceptions are token files).

| Role | Token | Notes |
|---|---|---|
| Screen | `background` | A faintly lavender canvas. Screens sit on it. |
| Card | `surface` | White. Cards sit on the canvas. |
| Sunken fill | `backgroundMuted` | Inputs, chips' tracks, image placeholders. |
| Text | `textPrimary` / `textSecondary` / `textTertiary` | Primary, supporting, quiet metadata. |
| Lines | `border` / `divider` | Hairlines. |
| Brand | `brand` (+ `textOnBrand`) | Primary buttons, selected chips. Inverts to light lavender in dark mode. |
| Interactive | `brandAccent`, `brandTint`, `brandTintStrong` | Links, icons, soft fills. |
| Hero surface | `hero` (+ `onHero`, `onHeroMuted`, `onHeroTint`) | Deep indigo card, dark in BOTH themes. One per screen at most. |
| Live | `mint`, `mintInk`, `mintTint` | "Open now", happening today. Nothing else. |
| Semantic | `success`/`warning`/`danger`/`info` + `successTint`/`warningTint`/`dangerTint`/`neutralTint` | Status. |
| Rating | `ratingStar` | Star fills only. |

**Type** (`ThemedText variant=...`, Instrument Sans): `display` 36, `h1` 30, `h2` 22 (section and screen titles),
`h3` 17 (card titles), `bodyLarge` 17, `body` 15, `bodyMedium` 15, `caption` 13, `captionStrong` 13, `label` 12,
`captionSmall` 12, `button` 16. `overline` exists only for old call sites: do not use it, and never apply
`textTransform: 'uppercase'` or `letterSpacing`.

**Spacing** (`spacing`): `xxs 4, xs 8, sm 12, md 16, lg 24, xl 32, gutter 20`. Screens use `spacing.gutter` as the
side margin; vertical rhythm between sections is 28; `paddingBottom: 120` clears the tab bar.

**Radius**: `sm 10, md 14, lg 20 (cards), xl 28 (sheets, hero), pill`. **Shadows**: `shadows.sm` for cards,
`md` for raised/hero, `lg` for sheets and dialogs.

**Motion**: `enter(index)` (rise in, staggered), `enterFromTop`, `fade` from `@/theme`, used as
`<Animated.View entering={enter(2)}>` with `Animated` from `react-native-reanimated`. Press feedback and the
skeleton pulse use React Native's own `Animated`, so they work on web and in tests.

## Components (`src/components`)

Use these; do not re-implement them per screen.

- `Screen` (safe area + canvas), `ThemedText`.
- `Button` (`variant`: `primary` filled brand, `secondary` soft tint, `ghost` outlined; `tone="danger"`;
  `size="sm"|"md"`; `icon="..."` Ionicons name; `loading`; `fullWidth`). One `primary` per screen. `accent` is a
  legacy alias of `primary`.
- `Card` (`padding="none"|"sm"|"md"`, optional `onPress`): white, hairline border, soft shadow.
- `Pill` (`tone`: success/warning/danger/neutral/brand/mint, optional `icon`, `dot`): status, sentence case.
- `Chip` (`selected`, `icon`): filters. `IconButton` (`variant`: surface/tint/overlay). `Divider`.
- `ListRow` (icon well, title, subtitle, value, trailing/chevron): settings-style rows inside a
  `<Card padding="none">` separated by `<Divider />`.
- `TextField` (label, hint, error): all text inputs.
- `Photo` (`uri`, `name`, `tone`): every image of a business or offer. Draws the initial on a hue wash when there is
  no picture. `Avatar` is for people.
- `Skeleton`: loading placeholders in the shape of the final content (no bare spinners for page loads).
- `EmptyState` (`icon`, `title`, `body`, action), `SectionHeader` (title + "See all"), `ScreenHeader`
  (back button + title + subtitle + `right`), `SegmentedControl`, `ConfirmDialog`, `StoreCard`,
  `PressableScale` (any tappable surface), `FloatingTabBar` (the bottom bar: a floating pill, real liquid glass on
  iOS 26 via `expo-glass-effect`, with a drop that springs and stretches between tabs; it stays in the layout flow).
  Venue and chat use the same rules.

## Screen recipe

```
<Screen>                                  // canvas, safe area
  <ScrollView contentContainerStyle={{ paddingHorizontal: spacing.gutter, paddingBottom: 120, gap: 28 }}>
    <Animated.View entering={enter(0)}>   // title / header
    <Animated.View entering={enter(1)}>   // hero or first block
    ...
```

- Top-level tab screens: a large `h1` title (`Activity`), no back button.
- Pushed screens: `ScreenHeader` with the back button.
- Lists of things: `Card`s on the canvas with `gap: spacing.sm`; lists of settings: one `Card` with `ListRow`s.
- Loading: `Skeleton`s. Empty: `EmptyState` with an icon, what will appear here, and (when there is one) the next
  step. Error: say what happened in plain words with a retry.
- Sticky bottom actions (book, confirm): a bar on `surface` with a hairline top border and a full-width `Button`.
- Money: `formatMoney` from `@/lib/money`. Times: the helpers in `@/lib/time/branchTime` (branch time zone, never the
  phone's).
- Accessibility: every tappable thing has an `accessibilityLabel` and a 44pt target; images that carry meaning have
  labels; text never conveys state by colour alone.
- Right-to-left: the app ships Arabic. Prefer `marginStart/End`, `paddingStart/End`, `start/end` over left/right
  where it is not a purely decorative offset, and never assume text direction.

## Seeing your work

The app runs in a browser at phone size. A dev server is already running at **http://localhost:8083** (do not start
another one on the same port).

- Sign in as a demo customer (`lina@slotify.dev` / `password123`) with the saved session:
  `storageState` file `/private/tmp/claude-501/-Users-omar-soudy-Desktop-Slotify-slotify-partners-web/9fb035d1-e7ac-4eb7-9233-f2e94ec1413b/scratchpad/lina-state.json`.
- Use a **new browser context** (never the shared default one) at `{ width: 390, height: 844 }`,
  `deviceScaleFactor: 2`; also check `320` wide. Add `?theme=dark` to any address to see dark mode (it sticks for
  that tab). Example with Playwright's `browser_run_code_unsafe`:

```js
async (page) => {
  const ctx = await page.context().browser().newContext({
    viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
    storageState: '<the lina-state.json path above>',
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8083/activity');
  await p.waitForTimeout(5000);
  await p.screenshot({ path: '.playwright-mcp/my-screen.png' });
  await ctx.close();
}
```

- Scroll with `await p.mouse.move(200, 500); await p.mouse.wheel(0, 700)`. The map is a grey placeholder on web.
- Useful addresses: `/` (Home), `/explore`, `/activity`, `/profile`, `/notifications`,
  `/venue/d0000000-0000-4000-8000-000000000001` (Glamour Studio, Maadi; ids `...0002` Zamalek, `...0003`
  Nasr City, `...0004` Śródmieście), `/booking/<venueId>/configure`. Booking-specific screens need a booking id:
  open `/activity` and click a booking.
- Demo venues have no photos: that is what `Photo`'s placeholder is for.
- Look at EVERY screen you touch in light and dark mode and at 320 wide before calling it done; read the screenshots.

## Checks

`npx tsc --noEmit`, `npx eslint <files>` and `npx jest` must stay clean (334 tests at the start of the redesign).
Match the existing Prettier config (`npx prettier --write <files>`). Keep behaviour, data hooks, routes and i18n
keys; you may add i18n keys, but add them to BOTH `src/lib/i18n/en.json` and `ar.json`.
