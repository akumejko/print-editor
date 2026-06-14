<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# Kreator Nadruku — Project Context

Customer-facing print customization tool. Users design a print wrap for a physical product (mug, cup, bottle), save it, and receive an 8-character project ID. The shop owner downloads the print-ready PNG via a secret URL using that ID.

**UI language: Polish throughout.**

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 16.2.7, App Router, Turbopack |
| Language | TypeScript |
| Canvas editor | Fabric.js 7.4.x |
| UI | TailwindCSS v4 + shadcn/ui (Nova preset, Base library) |
| Icons | lucide-react |
| Database | better-sqlite3 (direct, no Prisma) |
| Image export | Fabric `canvas.toDataURL()` scaled to print resolution |
| Dev server | `npm run dev` → http://localhost:3000 |

## File Structure

```
src/
  app/
    page.tsx                        # Landing: product selection (3 cards)
    layout.tsx                      # Root layout, Google Fonts <link>, lang="pl"
    globals.css                     # TailwindCSS v4 + shadcn theme vars
    editor/[productId]/page.tsx     # Editor page — server component, validates productId
    api/
      save/route.ts                 # POST — receives base64 PNG, saves file + DB row, returns { id }
      download/[id]/route.ts        # GET — streams PNG by download_token (UUID)
      admin/[displayId]/route.ts    # GET ?key=ADMIN_SECRET — redirects to download URL
  components/
    canvas/
      CanvasEditor.tsx              # Slim orchestrator (~120 lines) — wires hooks + panels
      CanvasToolbar.tsx             # Undo/redo/save toolbar
      ProjectIdBanner.tsx           # Green success banner shown after save
      types.ts                      # Shared: ToolSection, SelectedObjState
      hooks/
        useCanvasHistory.ts         # Undo/redo stack (historyRef + loadFromJSON)
        useFabricCanvas.ts          # Canvas init, events, object actions (add/delete/update)
        useSaveProject.ts           # POST /api/save + clipboard copy
      panels/
        TextToolPanel.tsx           # Left panel: text form (local state, calls onAdd)
        AssetsPanel.tsx             # Left panel: preset shape grid
        UploadPanel.tsx             # Left panel: file upload dropzone
        PropertiesPanel.tsx         # Right panel: angle/opacity/font/bold/italic
    ui/                             # shadcn components: button, input, label, card, badge, select
  config/
    products.ts                     # Hardcoded product list + Product interface + getProduct()
    assets.ts                       # PRESET_ASSETS (20 CC0 SVGs) + FONTS list (14 fonts)
  lib/
    db.ts                           # better-sqlite3 helpers: saveProject(), getProjectPath(), getDownloadToken()
    ratelimit.ts                    # In-memory IP rate limiter (default 10 saves/day, SAVE_RATE_LIMIT env)
    utils.ts                        # shadcn cn() utility
  test/
    setup.ts                        # Vitest global setup (@testing-library/jest-dom)

public/
  products/                         # SVG product mockup placeholders (mug-ceramic, cup-plastic, bottle-sport)
  assets/                           # 20 CC0 SVG shapes (star, heart, crown, lightning, paw, sun, flower,
                                    #   diamond, arrow, shield, wave, circle-dots, moon, trophy, anchor,
                                    #   music, snowflake, tree, peace, butterfly)

saved_projects/                     # Runtime: saved PNG files (git-ignored)
projects.db                         # Runtime: SQLite database (git-ignored)
next.config.ts                      # output: standalone, serverExternalPackages: sharp, better-sqlite3
Dockerfile                          # Multi-stage build; node:20-slim + python3/make/g++ for better-sqlite3
fly.toml                            # Fly.io config: app=print-editor, region=arn, port=8080, 256MB VM
scripts/
  clear-data.sh                     # Clears /data/projects.db and /data/saved_projects/ on Fly.io via SSH
vitest.config.ts                    # Vitest + @vitejs/plugin-react, jsdom, @ alias
```

## Products (hardcoded in `src/config/products.ts`)

| id | Name | Print area (mm) | Export (px) | Canvas (px) |
|---|---|---|---|---|
| `mug-ceramic` | Kubek ceramiczny | 210×95 | 2480×1122 | 720×326 |
| `cup-plastic` | Kubek plastikowy | 250×90 | 2953×1063 | 720×259 |
| `bottle-sport` | Bidon sportowy | 200×140 | 2362×1654 | 720×504 |

`canvasWidth/Height` is the display size in the browser. Export uses `multiplier = exportWidthPx / canvasWidth` in `canvas.toDataURL()`.

To add a product: add an entry to `PRODUCTS` array and drop a matching SVG in `public/products/`.

## Database Schema (`projects.db`)

Table auto-created on first request by `src/lib/db.ts`:

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,              -- 8-char uppercase alphanumeric (shown to customer)
  download_token TEXT UNIQUE NOT NULL, -- UUID (used in download URL, never shown to customer)
  product_id TEXT NOT NULL,
  file_path TEXT NOT NULL,          -- absolute path to saved_projects/{id}.png
  created_at INTEGER NOT NULL       -- Unix ms timestamp
)
```

## API Routes

| Method | Route | Description |
|---|---|---|
| POST | `/api/save` | Body: `{ dataUrl: string, productId: string }`. Saves PNG, inserts DB row. Returns `{ id: string }` (display ID only) |
| GET | `/api/download/[token]` | Streams PNG by **download_token** (UUID). 404 HTML page if not found. |
| GET | `/api/admin/[displayId]?key=SECRET` | Owner lookup: accepts short display ID + ADMIN_SECRET, redirects to download URL. |

## Security: two-token model

Customers never see the download URL. Two separate values are stored per project:

| Field | Example | Who sees it |
|---|---|---|
| `id` (display ID) | `AB12CD34` | Customer — shown after save |
| `download_token` (UUID) | `550e8400-e29b-41d4-a716-446655440000` | Never exposed — used in download URL |

**Owner workflow**: customer gives you `AB12CD34`, you visit:
```
https://yoursite.com/api/admin/AB12CD34?key=YOUR_ADMIN_SECRET
```
This redirects straight to the PNG download.

`ADMIN_SECRET` is set in `.env.local` (git-ignored). Change the default value before going to production.

## Canvas Editor Architecture (`src/components/canvas/CanvasEditor.tsx`)

- **Client component** (`"use client"`)
- Slim orchestrator (~120 lines) — wires three hooks and six panel components
- Three collapsible tool sections in the left panel: **Tekst**, **Kształty i grafiki**, **Własna grafika**
- Right panel appears only when an object is selected (angle, opacity; font/size/color/bold/italic for text)
- `Delete` / `Backspace` key removes selected object (guards against firing inside `<input>`)
- Save flow: `canvas.toDataURL({ multiplier })` → `POST /api/save` → show project ID in green banner
- Exported PNG has **transparent background** — no `backgroundColor` set on the Fabric canvas; white is CSS-only on the wrapper div

### Hook responsibilities
- `useCanvasHistory` — undo/redo stack via `fc.toJSON()` / `fc.loadFromJSON()`; exposes `saveHistory`, `undo`, `redo`, `canUndo`, `canRedo`, `isRestoringRef`
- `useFabricCanvas` — canvas init + all object actions (`addText`, `addPresetAsset`, `handleUpload`, `deleteSelected`, `updateSelected`); uses a `cbRef` pattern so callbacks never cause the canvas init effect to re-run
- `useSaveProject` — `POST /api/save` call + clipboard copy

### Critical: cbRef pattern in `useFabricCanvas`
All mutable callbacks (`saveHistory`, `undo`, `redo`, `onSelectionChange`) are stored in a `cbRef` that is updated on every render **without** being in the canvas init effect's dependency array. This prevents the canvas from being destroyed and re-created whenever state changes (e.g. `canUndo` toggling). The init effect only depends on `[product, fabricRef, syncSelection]`.

### Fabric.js v7 gotchas
- Import as `import * as fabric from "fabric"` (no default export)
- `new fabric.IText(...)` for editable text (not `fabric.Text`)
- `fabric.FabricImage.fromURL(src, options)` — async, returns `FabricImage` directly (not a callback)
- Object property updates require `obj.set({ ... })` then `fc.renderAll()`
- `canvas.toDataURL({ format, multiplier, quality })` — `multiplier` is the scale factor

### shadcn Select gotcha
`onValueChange` receives `string | null` in this shadcn version. Always guard: `onValueChange={(v) => { if (!v) return; ... }}`.

## Google Fonts

Loaded via `<link>` in `src/app/layout.tsx` `<head>`. 14 families available: Inter (system), Roboto, Playfair Display, Oswald, Dancing Script, Montserrat, Lato, Raleway, Pacifico, Bebas Neue, Nunito, Lobster, Merriweather, Ubuntu. To add more: extend the `<link>` href and the `FONTS` array in `src/config/assets.ts`.

## Roadmap (remaining)

- Keyboard shortcut hints
- Mobile-friendly toolbar (currently collapses on `lg:` breakpoint)
- 404 page for expired/unknown project IDs on `/api/download/[id]`
- Replace SVG product mockups with real product photography (drop `.webp` files into `public/products/` — `mockupImage` field already points to `.webp`)

## Testing

Vitest + React Testing Library. 20 tests across 4 files covering `useCanvasHistory`, `useSaveProject`, `ProjectIdBanner`, and `PropertiesPanel`.

```bash
npm test          # Run tests (watch mode)
npm test -- --run # Run tests once
```

## Deployment (Fly.io)

App: `print-editor`, region: `arn` (Stockholm), port: 8080, 256MB shared VM.
Persistent volume mounted at `/data` — database and saved PNGs stored there.
`DATA_DIR` env var points the app at `/data` in production.
`ADMIN_SECRET` and `SAVE_RATE_LIMIT` configured as Fly.io secrets.

```bash
fly deploy        # Deploy from local (requires flyctl)
```

## Common Commands

```bash
npm run dev       # Start dev server on :3000
npm run build     # Production build (verify no TS errors)
npx tsc --noEmit  # Type-check only
```
