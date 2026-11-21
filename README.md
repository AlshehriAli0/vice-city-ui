# Vice City UI

A design system styled after Grand Theft Auto VI's menus and HUD: the wanted stars, pause menu, settings, weapon wheel, radio, phone and Wasted screen, plus a core kit of everyday components. It's built on [Vercel UI SDK](https://ui-sdk.dev), which handles keyboard, focus and ARIA; Vice City UI handles the look.

The catalogue lists every component. Open one for its demo, keyboard map and source, or press ⌘K / Ctrl+K to search.

## Layout

- `src/leonida/` holds the GTA VI components and `src/ui/` the core kit. Each is `<name>.tsx` with `<name>.css` beside it. Tokens and the three themes (`day`, `sunset`, `night`) live in `src/leonida/tokens.css`.
- `src/gallery/` holds the demos, one file per section. Each demo can carry `keys` and `file` for its detail page.
- `src/site/` is the catalogue: home grid, detail pages, search and the hash router.
- `tests/` has behavior and agent tests.
- `DESIGN.md` has the design rules.

Set `data-theme="day" | "sunset" | "night"` on `<html>` to change the time of day. `data-motion="still"` stops every animation.
