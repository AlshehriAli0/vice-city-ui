# Vice City UI

![Vice City UI: a Grand Theft Auto VI design system](.github/banner.png)

A complete design system styled after Grand Theft Auto VI, built with [Vercel UI SDK](https://ui-sdk.dev): game UI and everyday components for React.

Check it out here: [vice-city-ui.vercel.app](https://vice-city-ui.vercel.app)

Open any component for its live demo, keyboard map and source, or press ⌘K / Ctrl+K to search.

## Layout

- `src/leonida/` holds the GTA VI components and `src/ui/` the core kit. Each is `<name>.tsx` with `<name>.css` beside it. Tokens live in `src/leonida/tokens.css`.
- `src/gallery/` holds the demos, one file per section. Each demo can carry `keys` and `file` for its detail page.
- `src/site/` is the catalogue: home grid, detail pages, search and the hash router.
- `tests/` has behavior and agent tests.
- `DESIGN.md` has the design rules.

Set `data-motion="still"` on `<html>` to stop every animation.
