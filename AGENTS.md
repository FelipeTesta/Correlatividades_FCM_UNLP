# AI Development Guide — Correlatividades Medicina UNLP

Guide for AI agents to understand the project's structure, conventions, and architecture for consistent updates.

## Agent Rules

1. **Planning mode first:** If you can't modify files, assume planning mode. Read files, plan changes, wait for user to switch to Build mode.
2. **Mobile first:** Always check and ensure responsiveness on mobile.
3. **Documentation:** After completing changes, update the changelog in **LOG.md** (and README.md for feature details).
4. **Task tracking:** Pending tasks live in `TODO.md` (section "Backlog general"); completed work goes to the `LOG.md` changelog. Do not keep feature logs in this file.
5. **Keep this file lean:** This file is for agent guidance, not feature documentation. Technical details go in README.md.
6. **License (must preserve):** Open source for PERSONAL use — sharing/copying allowed WITH credits, commercialization FORBIDDEN. Section "Licencia y Uso" in README.md — never remove or weaken it in any derivative.

## Project Overview

- **Architecture:** Vanilla JavaScript (ES6+), HTML5, CSS3. No frameworks.
- **Theme:** "Deep Black" (#000000 background, #e5e5e5 text). Centralized palette in `APP/variables.css`.
- **State:** All persistent state lives in `localStorage`. No backend database (except Cloudflare Worker for Cartelera proxy/email).

### Folder Layout

```
Root (HTML entry points + infra):
  *.html              — index, arbol, cartelera, vacunas, extension, universidades
  version.json        — Deploy version (git hash + timestamp; bumped by deploy.ps1)
  worker.js (1082L)   — Cloudflare Worker: cartelera proxy + email + cron reminders
  wrangler.toml       — Worker config
  deploy.ps1          — Deploy helper
  README.md / LOG.md / TODO.md / AGENTS.md — docs, changelog, tasks, this guide

APP/ (all logic + styles — vanilla ES6+, no build step):
  Shared modules (load before page logic — order matters):
    materias.js (655L, pure data) — subjects array
    state-cache.js (19L)          — localStorage read/write layer
    utils.js (35L)                — shared helpers
    requisitos.js (61L)           — prerequisite evaluation (year gate for optativas)
    calendar_data.js (148L)       — mini calendario data (2026 events + windows)
    minical.js (288L)             — mini calendario strip render/tooltip/drag/stickers
    abbreviation.js (48L)          — name abbreviation toggle
    nav.js (158L)                 — shared navbar + presence badge (POST /heartbeat)
    version-check.js (24L)        — auto-reload prompt on new deploy
  Page logic:
    app.js (1522L)                — main page
    arbol.js (1377L)              — tree mode
    cartelera.js (1821L)          — cartelera
    universidades.js (1317L)      — otras universidades (Leaflet via CDN)
    vacunas.js (460L)             — vaccination tracker + pathogen map
    extension.js (158L)           — extension projects
  Page data (pure data, zero functions):
    universidades_data.js (2047L) · extension_data.js (302L) · vacunas_data.js ·
    vacunas_fichas.js (418L, pathogen map) · cartelera_ids.js (48L, cátedra→ID, 67 entries) ·
    finales/finales.json (62 codes — real SIU Guaraní data, past dates kept as libre evidence)
  Styles (cascade): variables.css (palette) → base.css (global) → nav.css → <page>.css

tools/ (agent scripts, NOT deployed):
  fetch-finales.js (242L)          — parse Guaraní public calendar → finals.json (dry-run/--write)
  validate-universidades.js (125L) — universidades data sanity checks

FLOW/ (process maps *.dot, gitignored) — finals-cycle, minical, universidades, agents…
REF/ (reference data, gitignored) — PDFs, xlsx, csv, cloudflare-usage.md
```

## Data Structure — `APP/materias.js`

The `materias` array contains objects with this schema:

```javascript
{
  codigo: "A0001",           // Unique ID
  nombre: "Anatomía",        // Display name
  nombreCorto: "Anat",       // Abbreviated name (for abbreviation toggle)
  anio: 1,                   // Recommended year (1–6)
  categoria: "anual",        // Points: anual(120), cuatrimestral(60), bimestral(30), optativa(variable)
  horas: 200,                // (Optional) Total hours, mainly for optativas
  paraCursar: [              // Prerequisites to START the course
    { materia: "CODE", condicion: "aprobada" | "regularizada" }
  ],
  paraAprobar: [...]         // Prerequisites to take the FINAL EXAM
}
```

**Key difference:** `paraCursar` = can I enroll. `paraAprobar` = can I take the final.

## Core Logic — `APP/app.js`

| Function | Purpose |
|---|---|
| `resolverRequisitosTransitivos` | Recursively resolves entire dependency chain |
| `calcularProgreso` | Returns `{cumplidos, total, faltantes}` — points-based (Anual=120, Cuatr=60, Bim=30, Optativas capped at 270) |
| `cumpleRequisitos` | Validates if a course is "Puede Cursar" or "No Puede Cursar" |
| `render()` | Single-pass: clears all lists, repopulates based on current state + data |
| `guardarLocalYRender()` | **Must be called after any state change** — saves to localStorage and re-renders |

## State Management — localStorage Keys

| Key | Type | Purpose |
|---|---|---|
| `estados` | `{ "CODE": "aprobada" \| "regularizada" }` | Subject states |
| `cursando` | `{ "CODE": true }` | Currently enrolled subjects |
| `proyectosExtension` | `[{ id, nombre, horas }]` | Extension project favorites |
| `anioIngreso` | `number` | Enrollment year |
| `boxStates` | `{ "BoxName": true/false }` | Collapsed/expanded UI boxes |
| `catedrasSeleccionadas` | `{ "CODE": "catedra_name" }` | Selected cátedra per subject |
| `optativasFavoritas` | `{ "CODE": true }` | Starred optativas |
| `arbolAbbreviateNames` | `boolean` | Abbreviation toggle (tree) |
| `mainAbbreviateNames` | `boolean` | Abbreviation toggle (main page) |
| `carteleraFilterDays` | `number` | Cartelera date filter (days) |
| `carteleraViewMode` | `"subject" \| "chrono"` | Cartelera grouping mode (Por materia / Cronológico) |
| `carteleraCollapsed` | `{ key: boolean }` | Cartelera section collapse state |
| `carteleraCollapsedSubjects` | `{ key: boolean }` | Cartelera per-subject collapse |
| `carteleraLeidas` | `{ key: boolean }` | Read publications |
| `carteleraNotifyEmail` | `string` | Email for notifications |
| `carteleraSubscribedSubjects` | `string[]` | Additional tracked subjects |

## UI Conventions

- **Icons:** ✅ aprobada, 🟧 regularizada, 🔄 reset, ⚠ warning/missing prerequisites
- **List IDs:** `aprobadas`, `puedeFinal`, `noPuedeFinal`, `puedeCursar-obligatorias`, `puedeCursar-optativas`, `noPuedeCursar-obligatorias`, `noPuedeCursar-optativas`, `optativasFavoritas`
- **CSS variables:** Use `var(--aprobada)`, `var(--regularizada)`, `var(--cursando)`, `var(--optativa)`, etc. (see `APP/variables.css`)
- **Modals:** Custom modal system via `mostrarPopupFaltantes` (dynamic DOM creation)
- **Grid:** Use `.item-row` for complex list item layouts

## Development Rules

1. **Naming:** All new functions, variables, CSS classes in **English**. Never rename existing legacy Spanish/Portuguese code.
2. **State changes:** Always call `guardarLocalYRender()` after modifying state.
3. **DOM:** Prefer `document.createElement` + `innerText` over `innerHTML` for security.
4. **Data separation:** `materias.js` = pure data only. Logic goes in `app.js` / `arbol.js`.
5. **CSS:** Use CSS variables from `variables.css`. Never hardcode hex colors for the core palette.
6. **Modularity:** Shared logic lives in `APP/state-cache.js`, `APP/utils.js`, `APP/requisitos.js`, `APP/abbreviation.js`. Page-specific logic stays in the page file.

## Page Architecture — Script Load Map

Script order in each HTML matters (shared modules first, page logic last):

| Page | Scripts (load order) |
|---|---|
| index | materias → state-cache → utils → requisitos → calendar_data → minical → abbreviation → **app** → version-check → nav |
| arbol | materias → state-cache → utils → requisitos → calendar_data → minical → abbreviation → **arbol** → version-check → nav |
| cartelera | materias → utils → cartelera_ids → **cartelera** → version-check → nav |
| vacunas | materias → state-cache → requisitos → vacunas_data → vacunas_fichas → **vacunas** → nav |
| extension | extension_data → **extension** → version-check → nav |
| universidades | universidades_data → leaflet (CDN) → **universidades** |

- **Main Page (app.js):** single-pass `render()`, six list boxes + progress bar. Finals display: 5-day enrollment rule (`FINALES_INSCRIPCION_DIAS`), dates PER CÁTEDRA never unified; the popup "Ver Fechas" cátedra selector persists in `catedrasSeleccionadas` and filters the card dates.
- **Tree Mode (arbol.js):** separate page, shares localStorage. Year rows + SVG connectors. Mini calendario strip + "Inscripción" stickers; "Libre" tags on optativas built dynamically from finals.json.
- **Cartelera:** standalone; reads `cursando` + `estados`; publications via Worker proxy; "Por materia"/"Cronológico" modes; email notifications via Worker cron.
- **Extension:** static data, filters + search, no backend.
- **Universidades:** Leaflet map + read-only tree + stats table (research state in TODO.md).
- **Worker (worker.js):** cartelera proxy (`?id=` → cartelera.med.unlp.edu.ar, zero KV); `POST /heartbeat` (D1 presence + visits, counts memoized 60s); Resend email; cron 12/16/22 UTC = daily stats + presence cleanup + inscripciones pages check (day 1 monthly) + finales reminder (1st business day of Feb + 1st business day post-winter-break, flag KV per semester); `/test-*` diagnostic endpoints.

---
## LOG

Changelog moved to **LOG.md** (single source of truth). Do not add log entries here.