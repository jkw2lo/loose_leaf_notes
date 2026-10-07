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

## Arrange mode and mockup export

Press **E** on any page (or **Settings → Layout → Arrange the layout**) to edit the layout in place:

- **Drag a block** to reorder it. Arrow keys do the same when a block is focused.
- **Drag a block's right edge** to change its width, and its **bottom edge** to change its height. Shift + left/right and Shift + up/down do the same. Double-click an edge to reset it.
- Every page's sections are blocks, plus the panels on Tea info, Insights, Settings and Guides, and the parts of the Home stats and the brew page.
- **Drag a column divider** to resize two-column layouts: shelf list vs. stats panel, brew page vs. side column, sliders vs. palate, content vs. metrics rail.
- **Hide** removes a block you don't use; it stays visible (faded) in arrange mode so you can bring it back.
- **Reset page** clears your changes on the current page. Press **Esc** or **Done** to finish.

The layout is saved with your settings, so it syncs. The toolbar can also:

- **Copy layout**: copies the layout as JSON. Paste it into a request to make it the default in the code.
- **Export page / Export all pages**: downloads (and copies) a UI Field Guide mockup file of the live page(s). Open it in UI Field Guide with **Open → Open a file**, rework it, then use **Copy for Claude** and paste the result back as the next design request. Element types are UI Field Guide codes, and widths are scaled to its frames (1280 desktop, 834 tablet, 390 mobile).

### Using it in another project

`src/js/ui/arrange.js` has no dependencies and brings its own styles. Copy it in, then:

1. Mark blocks with `data-arr="key"` on a container and `data-arr-item="id"` (plus `data-arr-label`) on its direct children, or add `data-arr-auto` to make every child a block. Add `data-arr-grid` and set `--arr-n` in CSS for a resizable grid; give items `data-arr-span`.
2. Mark two-column layouts with `data-arr-split="key"`, `data-arr-fixed="1|2"`, `data-arr-min`, `data-arr-max`, and use `var(--arr-w, <default>)` for the fixed column in CSS.
3. Optionally add `data-mock="type"` (a UI Field Guide code, plus `data-mock-label`) so exported mockups name elements precisely. Headings, tables, inputs and tab lists are exported without it.
4. Call `Arrange.init({name, load, save, current, screens, shortcut: 'e'})`. See the comment at the top of the file, and `src/js/core/arrange-setup.js` for this app's version.

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
src/js/ui/                 SVG illustrations and charts; arrange.js, the drop-in layout editor
src/js/views/              Shelf, tea page, library, journal, insights, guides, settings, routing
src/js/sheets/             Session form and timer, session detail, tea form and import, comboboxes
src/js/events.js           Event delegation for the whole app
src/js/core/arrange-setup.js  Arrange mode settings for this app (where layouts save, which pages export)
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
