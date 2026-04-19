# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server on http://localhost:5173 (auto-opens browser)
npm run build      # Production build → dist/
npm run preview    # Serve the production build locally
node scripts/generate-placeholders.mjs   # Regenerate the 42 SVG product placeholders in public/images/products/
```

No test runner is configured and no linter is wired up — verification is manual (DevTools console + `__cart` debug helper exposed on the catalog page).

## Architecture

### Multi-page Vite app (Vanilla JS + CSS custom properties)

Three static HTML entry points in the project root, each with its own JS entry under [src/js/pages/](src/js/pages/). They are registered in [vite.config.js](vite.config.js) as Rollup inputs (`main`, `product`, `cart`). There is no router — navigation is plain `<a href>` between HTML pages. Do not introduce an SPA router.

- [index.html](index.html) → [src/js/pages/catalog.js](src/js/pages/catalog.js) (catalog grid)
- [product.html](product.html) → [src/js/pages/product.js](src/js/pages/product.js) (`?id=N` query param)
- [cart.html](cart.html) → [src/js/pages/cart.js](src/js/pages/cart.js)

Each page entry is responsible for importing its own CSS (`tokens.css` + `global.css` + page-specific), calling `renderHeader(activeKey)` and `renderFooter()`, and mounting page content. CSS is not linked from HTML — Vite injects it from the JS imports.

### Cart store (single source of truth)

[src/js/store/cart.js](src/js/store/cart.js) owns all cart state. State shape is minimal: `{ items: [{id, qty}], promoCode: string|null }` — product details (title, price, image) are resolved via [src/js/store/products.js](src/js/store/products.js) on demand. All mutations produce new arrays (immutable updates), persist to `localStorage` under key `pet-shop:cart:v1`, and emit a `cart:change` event through the bus in [src/js/lib/events.js](src/js/lib/events.js).

Any UI that needs to react to cart changes (header badge, product card button, cart page totals) subscribes via `onCartChange(listener)` — do not read `state` directly from other modules. The promo code `SAVE10` gives a 10% discount; `getTotals(products)` returns `{ subtotal, discount, total, missing }` and expects the caller to pass the products array (keeps the store decoupled from the product loader).

### Products loader

[src/js/store/products.js](src/js/store/products.js) imports [src/data/products.json](src/data/products.json) at build time and deep-freezes the array on first call (`loadProducts()`). Treat products as immutable. There is no API — to change the catalog, edit the JSON and regenerate placeholders if the product count changes.

### Design system (CSS custom properties)

[src/styles/tokens.css](src/styles/tokens.css) defines the full palette, typography scale, spacing scale, radii, shadows, and motion tokens. Do not hardcode colors or sizes in component CSS — always reference tokens. The brand gradient (`--gradient-brand`, orange → hot pink) and accent orange (`#F97316`) are the anchors of the Figma prototype design (Variant 3).

Each component owns a sibling CSS file (e.g. [src/js/components/header.js](src/js/components/header.js) imports [src/styles/header.css](src/styles/header.css)). CSS uses kebab-case BEM-ish classes (`.site-header__logo-mark`). One shared `.container` utility in [src/styles/global.css](src/styles/global.css) caps content at `--container-max` (1280px).

## Workflow conventions (important)

- **Plan-driven development**: work follows a 15-step plan (see `~/.claude/plans/dazzling-marinating-moonbeam.md` when present, or the user's TodoWrite list). After finishing each step, propose a git commit to the user and wait for approval — do not commit autonomously.
- **Conventional Commits** in Russian-friendly English: `feat(catalog): ...`, `feat(cart): ...`, `chore: ...`, `style: ...`.
- **Commit authorship**: all commits are authored only by the user. Never add `Co-Authored-By: Claude ...` trailers.
- **Branches**: work on `dev`, PR into `main`. The user drives pushes — ask before `git push`.
- **User language**: informal Russian with recurring catchphrases (see `~/.claude/CLAUDE.md`). Address the user as "Кирилл".

## Figma prototype reference

The target design is Variant 3 at https://fabric-ease-87779820.figma.site (brand name in the prototype is "PawsStore"). WebFetch returns only the title — design decisions come from user-provided screenshots. Key anchors: orange→pink gradient hero banners, white rounded-`--radius-lg` cards with a floating orange price pill on the product image, dark navy (`#0B1220`) footer, paw-mark logo rotated ~35°.
