# Panel Cut Optimizer

A browser-based, bilingual, kerf-aware 2D guillotine cutting planner. It accepts
fractional stock and part dimensions at runtime, automatically calculates the
number of master sheets needed, compares multiple sorting and placement passes,
and produces scaled sheet diagrams with edge-to-edge cuts and workshop
instructions. Each diagram can be opened in a zoomable, scrollable fullscreen
viewer.

## Run locally

Requirements: Node.js 18 or newer.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. Enter the master sheet length and width,
blade kerf, and part list. Sheet quantity is automatically calculated; no
starting stock quantity is required. Fractional dimensions are supported and
all measurements must use the same unit. Switch between Arabic and English in
the navigation bar. Use **Print workshop plan** to print the diagrams and
cutting sequences.

For a production build:

```sh
npm run build
npm run preview
```

## Android debug APK

The GitHub Actions workflow at `.github/workflows/build-apk.yml` builds the web
app, syncs its assets into the Capacitor Android project, runs Gradle
`assembleDebug`, and uploads `app-debug.apk` as the
`panel-cut-optimizer-debug-apk` artifact. It runs on pushes to `main` or
`master`, pull requests, and manual dispatches.

## Solver

`src/guillotineSolver.js` exports the pure `solveGuillotineCutting` function.
Every placement is made by splitting an existing rectangular region with
full-span cuts. Kerf is removed from the far-side child after each cut; parts
are never nested inside a region without edge-to-edge cuts. The solver compares
area, longest-side, perimeter, and common-edge sorting passes with both split
orientations. Remnants with both dimensions at least 300 × 200 in the selected
dimension unit are classified as usable offcuts; smaller remnants are reported
as scrap.
