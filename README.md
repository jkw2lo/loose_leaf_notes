# Loose Leaf Notes

A tea journal for people who take tea seriously. Keep a shelf of the teas you own, brew them against a guide written for that specific tea, time and taste each infusion, and keep a library of the teas you've finished.

It runs entirely in the browser with no build step and no dependencies. It can also be published as a [Claude artifact](https://claude.ai), where it gains a synced database, file downloads and Claude-powered import from product pages.

## What it does

- **Tea shelf.** Your teas grouped by family (Japanese green, Wuyi rock oolong, raw pu'er, breakfast and Earl Grey blends, and so on). Each tea tracks brand, origin, harvest, cultivar, how much is left and what it cost.
- **Brewing guides.** 115 tea types across 16 families, each listing only the methods traditionally used for it: sencha gets kyusu, cold brew and ice brew; matcha gets usucha and koicha; masala chai is simmered. Each guide covers teaware, leaf, water, temperature, infusion schedule and typical liquor colour, plus step-by-step instructions. You can edit any guide to set your own baseline.
- **Producer's recipe.** Record the brewing instructions on the packet and compare them with the typical guide.
- **Sessions.** Log a brew in three steps: setup, steep and how it was. A built-in timer chimes when an infusion is done, and each infusion can have its own liquor colour, score, flavours and note.
- **Comparison.** Each tea shows your sessions charted against the guide: steep curves, deviations in leaf, temperature and infusions, and palate overlays.
- **Library.** Finished teas move to a library with a final score, a "would you buy it again" answer and a parting note, with every session still available.
- **Journal and insights.** Sessions by date, plus what correlates with your best-rated cups.
- **Settings.** Your teaware (only these appear when logging), temperature input style (dial, steps, scale or typed), °C/°F, your own tea types, export and restore.

## Run it locally

You need Node 18 or newer only for the dev server and build. The app itself is plain HTML, CSS and JavaScript.

```bash
npm run dev
```

Open http://localhost:5173. Notes are saved in your browser's local storage.

To try it with sample data, open **Settings → Restore from a backup** and choose `examples/sample-data.json`.

## Build

```bash
npm run build
```

This writes two single-file pages:

| File | Use |
| --- | --- |
| `dist/index.html` | A standalone page to open directly or host anywhere |
| `dist/artifact.html` | The same page in Claude artifact format |

`npm run check` builds, confirms the bundle parses, and validates the tea data: families, methods, temperature and leaf ranges, vessels, liquor colours, places and brands.

## Deploy to GitHub Pages

The repository root is a working site, so no build is needed. In the repository's **Settings → Pages**, choose **Deploy from a branch**, then select `main` and `/ (root)`.

## Publish as a Claude artifact

Publish `dist/artifact.html` with these capabilities:

```json
{ "db": {}, "downloads": true, "sample": {} }
```

- `db` stores teas, sessions and settings so they sync across devices.
- `downloads` lets the page offer CSV and JSON exports.
- `sample` powers "Fill in from the product page", where Claude reads pasted page text or a label photo. Each use spends the viewer's own Claude usage, after they allow it.

Without these, for example on GitHub Pages, the app falls back to local storage, ordinary browser downloads, and a built-in text parser for product pages.

## Project structure

```
index.html                 Page shell; lists the stylesheet and scripts in load order
src/styles.css             All styles; colours are tokens with light and dark themes
src/js/data/tea-data.js    Tea families, types, brewing methods, liquor colours, places, brands, teaware
src/js/core/               Utilities, guide logic, storage, export and backup
src/js/ui/                 SVG illustrations: teaware, leaf piles, beaker, thermometer, charts
src/js/views/              Shelf, tea page, library, journal, insights, guides, settings, routing
src/js/sheets/             Session form and timer, session detail, tea form and import, comboboxes
src/js/events.js           Event delegation for the whole app
src/js/main.js             Boot
scripts/                   Dev server, build and checks (no dependencies)
examples/sample-data.json  Sample teas and sessions to restore
```

The scripts are classic scripts that share globals and load in the order listed in `index.html`. The build inlines them in that same order.

### Data model

- **Tea:** `name`, `lib` (tea type), `fam` (family), `brand`, `origin`, `harvest`, `cultivar`, `url`, `notes`, `producer` (recipe), `stock` (grams, price), `finished`, `verdict`.
- **Session:** `teaId`, `at`, `style` (method), `vesselType`, `g`, `ml`, `temp` (°C), `rinse`, `steeps` (each with seconds, liquor, score, tags, note), `rating`, `axes` (palate), `notes`.
- **Settings:** `tempMode`, `unit`, `vessels`, `customTypes`, `guideOverrides`.

### Editing tea data

Tea knowledge lives in `src/js/data/tea-data.js`. Families define the methods traditional for them. Each tea type can narrow them (`only`), adjust them (`m`), add new ones (`add`) or override water temperature (`t`), leaf description, character and liquor colours. Run `npm run check` after editing.
