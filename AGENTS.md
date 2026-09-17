# AI Development Guide — Correlatividades Medicina UNLP

Guide for AI agents to understand the project's structure, conventions, and architecture for consistent updates.

## Agent Rules

1. **Planning mode first:** If you can't modify files, assume planning mode. Read files, plan changes, wait for user to switch to Build mode.
2. **Mobile first:** Always check and ensure responsiveness on mobile.
3. **Update this file:** After completing changes, update this file and the changelog in README.md.
4. **IMPLEMENT section:** At the bottom of this file — mark completed items with ✅ and add new entries as needed.
5. **Keep this file lean:** This file is for agent guidance, not feature documentation. Technical details go in README.md.

---

## Project Overview

- **Architecture:** Vanilla JavaScript (ES6+), HTML5, CSS3. No frameworks.
- **Theme:** "Deep Black" (#000000 background, #e5e5e5 text). Centralized palette in `APP/variables.css`.
- **State:** All persistent state lives in `localStorage`. No backend database (except Cloudflare Worker for Cartelera proxy/email).

### Folder Layout

```
Root (HTML entry points + config):
  index.html          — Main page (subject tracking)
  arbol.html          — Tree mode (visual dependency graph)
  cartelera.html      — Cartelera (bulletin board)
  vacunas.html        — Vaccination tracker
  extension.html      — Extension projects
  version.json        — Deploy version (git hash + timestamp)
  worker.js           — Cloudflare Worker (proxy + email cron)
  wrangler.toml       — Worker config

APP/ (all logic + styles):
  materias.js          — Subject data (pure data, no logic)
  app.js               — Main page logic
  style.css            — Main page styles
  arbol.js             — Tree mode logic
  arbol.css            — Tree mode styles
  variables.css        — CSS custom properties (centralized palette)
  base.css             — Global resets + shared styles
  nav.css              — Navbar styles
  state-cache.js       — localStorage read/write layer
  requisitos.js        — Prerequisite evaluation functions
  utils.js             — Shared utilities
  abbreviation.js      — Name abbreviation logic
  finales/finales.json — Exam dates (61 subjects, Feb–Dec 2026)
  vacunas_data.js      — Vaccine data
  cartelera.js         — Cartelera page logic
  cartelera.css        — Cartelera page styles
  cartelera_ids.js     — Catedra→cartelera ID mapping (67 entries)
  extension_data.js    — Extension project data (20 projects)
  extension.js         — Extension page logic

REF/ (reference data, not used by app):
  correlativas optativas/optativas.csv
```

---

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

---

## Core Logic — `APP/app.js`

| Function | Purpose |
|---|---|
| `resolverRequisitosTransitivos` | Recursively resolves entire dependency chain |
| `calcularProgreso` | Returns `{cumplidos, total, faltantes}` — points-based (Anual=120, Cuatr=60, Bim=30, Optativas capped at 270) |
| `cumpleRequisitos` | Validates if a course is "Puede Cursar" or "No Puede Cursar" |
| `render()` | Single-pass: clears all lists, repopulates based on current state + data |
| `guardarLocalYRender()` | **Must be called after any state change** — saves to localStorage and re-renders |

---

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
| `carteleraCollapsed` | `{ key: boolean }` | Cartelera section collapse state |
| `carteleraCollapsedSubjects` | `{ key: boolean }` | Cartelera per-subject collapse |
| `carteleraLeidas` | `{ key: boolean }` | Read publications |
| `carteleraNotifyEmail` | `string` | Email for notifications |
| `carteleraSubscribedSubjects` | `string[]` | Additional tracked subjects |

---

## UI Conventions

- **Icons:** ✅ aprobada, 🟧 regularizada, 🔄 reset, ⚠ warning/missing prerequisites
- **List IDs:** `aprobadas`, `puedeFinal`, `noPuedeFinal`, `puedeCursar-obligatorias`, `puedeCursar-optativas`, `noPuedeCursar-obligatorias`, `noPuedeCursar-optativas`, `optativasFavoritas`
- **CSS variables:** Use `var(--aprobada)`, `var(--regularizada)`, `var(--cursando)`, `var(--optativa)`, etc. (see `APP/variables.css`)
- **Modals:** Custom modal system via `mostrarPopupFaltantes` (dynamic DOM creation)
- **Grid:** Use `.item-row` for complex list item layouts

---

## Development Rules

1. **Naming:** All new functions, variables, CSS classes in **English**. Never rename existing legacy Spanish/Portuguese code.
2. **State changes:** Always call `guardarLocalYRender()` after modifying state.
3. **DOM:** Prefer `document.createElement` + `innerText` over `innerHTML` for security.
4. **Data separation:** `materias.js` = pure data only. Logic goes in `app.js` / `arbol.js`.
5. **CSS:** Use CSS variables from `variables.css`. Never hardcode hex colors for the core palette.
6. **Modularity:** Shared logic lives in `APP/state-cache.js`, `APP/utils.js`, `APP/requisitos.js`, `APP/abbreviation.js`. Page-specific logic stays in the page file.

---

## Page Architecture

### Main Page (index.html + app.js)
Single-pass render. Six list boxes + progress bar. Subject tracking with prerequisite evaluation.

### Tree Mode (arbol.html + arbol.js)
Separate page, shares localStorage. Horizontal rows per year. SVG connectors between nodes. Node states mirror main page. Selection system for highlighting dependencies. Zoom controls.

### Cartelera (cartelera.html + cartelera.js)
Standalone page. Reads `cursando` + `estados` (regularizada) to find active subjects. Fetches publications via Cloudflare Worker proxy. Two rendering modes: "Por materia" (grouped) / "Cronológico" (timeline). Email notifications via Worker cron.

### Extension (extension.html + extension.js)
Static data from `APP/extension_data.js`. Filters + search. No backend.

---

## IMPLEMENT

_(New features and pending tasks — mark ✅ when done)_

- [x] Extension data cleanup: removido campo `evidencia` (dato muerto, nunca referenciado por extension.js). Agregado Instagram de Parto respetado (partorespetado.unlp).
- [x] Visitor counter fix: admin detection now IP-based (`ADMIN_IPS` in `worker.js`), session IDs no longer use `admin-` prefix.
- [x] Visitor counter dedup: `visitorSessionId` now stored in `localStorage` (was `sessionStorage`) so same device counts once per day, not per page load.
- [x] iOS Safari CSS fixes: `max-height: 9999px` for box collapse, `100dvh` fallback for video overlay, `overflow-x: hidden` fallback, removed global `user-select: none`, scoped `touch-action: manipulation`.
- [x] Finales data cleanup: merged 10 split/duplicate entries in `finales.json` (GE001, IM001, IMD01, NEUAT, LCM01, H0001, F9002, IAA01, T0100, BC002). Regular/Libre pairs now correctly structured.
- [x] Finales inline display: optativas show "Libre:" or "Regular:" label based on `catedrasSeleccionadas`. Click label to toggle modalidad (no visual change). 3-day registration filter. Date dedup for shared Regular/Libre dates.
- [x] Finales monitoring (`worker.js`): automated detection of exam date changes from UNLP HTML table. Cron: 1st/15th of month. Email admin on changes. Endpoints: `/test-finales` (diagnostic), `/test-finales-send` (force). Process map: `FLOW/finals-cycle.dot`.
- [ ] Añadir exportar/importar estado (REMOVIDO: feature nunca implementada — menção falsa removida do app/README)
- [ ] REVERTIDO: Mover el scroll de toda la página en el Modo Árbol — regresó al sistema original (scroll en .tree-wrapper, barra superior fija)
- [ ] Corregir el scroll en retrato móvil: espacio vacío debajo del contenido visual (transform:scale no afecta el diseño) — pendiente

---

## LOG

Changelog moved to **LOG.md** (single source of truth). Do not add log entries here.
