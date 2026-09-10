# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.08] — 2026-09-10

### Added
+ Extension data cleanup: removed dead `evidencia` property (never referenced by `extension.js`). Added Instagram link for Parto respetado (`partorespetado.unlp`).
+ AGENTS.md rewritten in English: concise agent guidance structure (Guidelines, Overview, Data Structure, Core Logic, State Management, UI Conventions, Development Rules, Page Architecture, IMPLEMENT). Verbose technical details moved to README.md "Arquitectura Técnica" section.

### Fixed
+ When marking a subject as approved/regularized/reset, the `cursando` state is now cleared to prevent duplication in Cartelera. `arbol.js`: `setSubjectState()` now includes cursando cleanup + cache invalidation. `app.js`: new `clearCursandoForSubject()` called in 5 state buttons.
+ Removed "Horas Optativas Acumuladas" field (duplicated with progress bar). Toggle "Abreviar nombres" moved to top-bar (before "¿CÓMO USAR?"). CSS `.optativas-box`/`.horas-count`/`.horas-label` removed. `actualizarHorasOptativas()` eliminated from `app.js`.

### Changed
+ Unified navbar font-size + line-height `!important` on `.app-navbar-link` desktop + mobile (`nav.css` L154-155). Font cascade fix: `style.css` `li:not(.app-navbar-list li)` excluded from navbar. Duplicate scrollbar blocks removed from `arbol.css` (~20 lines).
+ Topbar layout: uniform `min-height:37px` on all buttons, `gap:8px`, `margin-bottom:8px`. Toggle-switch `margin-right:auto` pushes optativas left. Same layout desktop + mobile.
+ Button height unification: `style.css` `.btn-help` + `.btn-reset-hold` height 40→37px, line-height 38→35px (matches `arbol.css` `.tree-top-bar` rules).
+ `arbol.css` cleanup: removed duplicate `* box-sizing` (3 lines), scrollbar blocks (~20 lines), orphan `.tree-top-bar h1 font-size` rule. Kept `html overflow:visible` + `body overflow-x:hidden` (single scroll).
+ Optativa arrows: removed early-return purple blocks in `getConnectionVisualStyle()` — optativas now use same 4-case system (gray/white/green-dashed/green-solid) as obligatory subjects.
+ `prefers-reduced-motion`: removed from `arbol.css` entirely (user explicit request — page is lightweight).
+ h1 titles: hidden globally via `base.css` (`display:none !important` on `body>h1`, `.tree-top-bar h1`, `.top-bar h1`) — redundant with navbar page title.
+ Deploy: branch `feature/navbar-unificado` merged to main, old main backed up as `backup/pre-navbar-unificado`. `version.json` bumped to `2d94c94`.

## [0.07] — 2026-09-05

### Added
+ Centralized CSS design system: `variables.css` with 18 custom properties (--bg, --bg-elevated, --bg-card, --bg-hover, --bg-input, --text, --text-muted, --text-dim, --text-faint, --border, --border-strong, --aprobada, --regularizada, --cursando, --optativa, --optativa-dark, --puede-cursar, --danger). Linked in all 3 pages before page CSS. Refactored `style.css` (77 vars), `arbol.css` (102), `cartelera.css` (118).
+ Main page: box headers styled in Cartelera pattern (`.source-header`) — 4px colored left border + tint rgba background + hover `brightness(1.2)` + collapsed `opacity(0.7)`. Color-coding per box: Aprobadas=green, Regularizadas=orange, Puede cursar=yellow, Proyectos=cyan, No puede cursar=gray.
+ Star feature ⭐ for electives: ⭐/☆ button on right side of "Puede cursar" items; new collapsible "Optativas ⭐ | 00 Horas" section above regular electives; starred subjects move to favorites with hours sum in title; localStorage `optativasFavoritas` + cross-tab sync. Favorites have same buttons as normal electives (✅ Approve, 🟧 Regularize, toggle Cursando, 🗓 Ver Fechas).
+ "Abbreviate names" system ported from Tree Mode to main page: switch on "Horas Optativas Acumuladas" row (far right), localStorage `mainAbbreviateNames` (default ON), uses `nombreCorto` from `materias.js`, +30% font when active.
+ Text abbreviations: "Próxima final libre"→"Prox final libre", "Próximas Finales: sin fechas previstas"→"-" (when abbreviated). Categories abbreviated: bimestral→Bi, trimestral→Tri, cuatrimestral→Quatri, optativa→Opt (helper `abreviarCategoria()`).
+ Progress bar: new silver segment (#c0c0c0) for subjects with `cursando=on` (previously counted as approved). `pctTotal` includes cursando.
+ Created `FLOW/finales-update.dot` — periodic procedure for updating exam dates.

### Fixed
+ Collapse animation: removed horizontal movement (`transition:all` + padding changes). Now only slides vertically (`max-height` + opacity).
+ Main page: text selection disabled (`user-select:none` on body). Lateral margins desktop 12% (`@media min-width:769px`) for vertical view.

## [0.06] — 2026-08-30

### Added
+ Added `opencode.json` at project root — MCP cloudflare×5 (cloudflare, cloudflare-docs, cloudflare-bindings, cloudflare-builds, cloudflare-observability) moved from global (`~/.config/opencode`) to project scope. Cloudflare tools now only load in this project.

## [0.05] — 2026-08-28

### Fixed
+ `glassShine` animation (glass reflection on `.status-aprobada` nodes) no longer respects `prefers-reduced-motion` — removed rule that disabled animation. Other animations (cursando border, FAB, zoom) still respect accessibility preference. Fix verified: animation appeared in Chrome device toolbar but not on real phone due to "Reduce animations" enabled in accessibility settings.

## [0.04] — 2026-08-27

### Changed
+ Tree Mode: "Ver optativas" button repositioned between Zoom and Cartelera (CSS order: zoom=3, toggle=4, cartelera=5). Legend fully restored — Colors: Aprobada, Regularizada, Puede cursar, Cursando, Próximas materias a liberar, No puede cursar, Optativa (puede cursar), Optativa (no puede cursar), 🟡 Falta 1 requisito, ⭕ No puede final, Abreviar nomes (toggle). Arrows: Cumplido, Puede cursar falta final, Falta Cursada, Falta Final. Buttons: "← Modo Lista", "📋 Cartelera".
+ Toggle switch unified: desktop `min-height auto` (padding 6px 12px font 12px), mobile `min-height 37px` (padding 8px 10px font 11px) matching standard buttons; slider reduced 28×14px (was 36×18px).

### Fixed
+ Overlay z-index legend mobile: 1000→99 (below legend z-index 100) — prevents instant close when clicking inside legend.
+ Media query CSS `@media (max-width: 768px)`: closing braces, invalid nested rules, orphan properties — page was rendering blank.
+ Removed dead code `NAME_ABBREVIATIONS` (`arbol.js`) and duplicate in README.
+ `app.js` TDZ fix: `_stateCache` declared before `getCachedState('estados')` at line 11.
+ `arbol.js`: `canTakeFinal()` recursive counts `cursando=on` as satisfied prerequisite.
+ `APP/materias.js`: MI291 requires final of MI191 (aprobada).

## [0.03] — 2026-08-25

### Added
+ Performance D1+D2: in-memory cache for estados/cursando (invalidates on focus), throttle 100ms on tree scroll redraw.
+ Added `nombreCorto` property to all subjects (obligatory & elective) in `APP/materias.js`.
+ Added "Abreviar nomes" toggle switch in legend panel with localStorage persistence (`arbolAbbreviateNames`).
+ Increased font-size by ~30% (10px→13px desktop, 8px→11px mobile) when abbreviated mode is ON.
+ Disabled text selection (`user-select: none`) and touch callouts on `.subject-node`.

### Changed
+ Device detection now capability-based: `isMobileDevice()` and help-modal `isMobile` use `!matchMedia('(hover: hover) and (pointer: fine)').matches`; CSS hides action buttons via `@media (hover: none) and (pointer: coarse)`. PC with mouse/trackpad keeps hover buttons even in small windows; true touch devices get FAB click-hold.
+ Reverted `.cursando-active`/`.cursando-pending` CSS to original GitHub version (bulletproof override was visually wrong).
+ Reverted media queries from 1024px/hover:none to 768px (1024px change broke Cursando display on PC).

### Fixed
+ Button Regularizar wrong color: `arbol.js` used Unicode escape `\uD83D\uDFE8` (🟨) instead of `\uD83D\uDFE7` (🟧) at L259 (node button) and L1426 (help modal). Grep by emoji literal didn't detect escapes. Fixed 🟨→🟧 in FLOW diagrams too.

### Removed
+ Dead `NAME_ABBREVIATIONS` dictionary (unused, had English keys) from `arbol.js`; deleted untracked residue files `arbol.js.backup` and `Nomes abreviados.md`.

## [0.02] — 2026-08-14

### Fixed
+ Cartelera page now shows edited publications even if original publication date is old. Date filter uses `(p.modificadaDate || p.date) >= cutoff` (last edit date prioritized, otherwise publication date). Fixes asymmetry with email (worker detected modification by snapshot title+date+modified, but page hid by filtering original date). Applied in `render()` L1096, `allVisibleRead()` L385, `marcarTodasLeidas()` L414/424, and subject mode sort L1099.

## [0.01] — 2026-08-11

### Changed
+ Notification cron updated: 1x/day 8h → 3x/day 9h/13h/19h ART (`0 12,16,22 * * * UTC`). Fixes issue where publications appearing after 8am were only detected next day.
+ Worker redeployed: vfc35c8bd

## [0.00] — 2026-08-07

### Added
+ Welcome email restriction (`worker.js`): initial welcome email now filters publications to last 5 from last 12 months (`pubsFromLastMonths` helper + `parsePubDate`), avoiding ancient pubs flood.
+ Feature "Recibir novedades de": added tabs Obligatorias/Optativas, grouped by year with dividers. Modal redesigned with tabBar buttons `.subscribe-tab.active` (purple #a855f7), `renderSubjectGroup()` sorts by year + inserts `.subscribe-year-divider`, checkbox selection persists in `localStorage.carteleraSubscribedSubjects`. Fix: `saveBtn` queries `content.querySelectorAll` (both tabs) instead of nonexistent `body`. CSS: `.subscribe-tab-bar`, `.subscribe-tab`, `.subscribe-tab.active`, `.subscribe-year-divider` + mobile min-height/size.
+ Feature "Recibir novedades de": new 📬 button in Cartelera controls-bar, modal with checkboxes for all subjects with available cartelera (`resolveCatedraForCode`), stored in `localStorage.carteleraSubscribedSubjects`, integrated in `resolveAndFetch` (source="subscribed") and `populateNotifySubjects`. "Suscripciones extra" group in subject mode, "Suscripción" badge in chronological. CSS: `.subscribe-modal`, `.subscribe-subject-label`, `.btn-subscribe` (purple #a855f7), `.source-header-subscribed`, `.pub-source-subscribed`.
+ Edited publication detection (`worker.js`): `parseCatedraHtml`/`parseHomeHtml` extract `modified` field via regex. Snapshot comparison in `scheduled()` now includes `s.modified === p.modified`. New `/test-edits` endpoint for diagnostics. Client (`APP/cartelera.js`): parses `modificadaDate` (Date object), renders badge "🔄 Actualizada DD/MM/YYYY HH:MM" (`.pub-modificada-badge`), `isLeida`/`marcarLeida` with modification timestamp — if publication edited after read, it reappears as unread. Backward compat with boolean format. CSS: `.pub-modificada-badge` (orange italic).
+ New functions: `getSubscribedCodes`, `saveSubscribedCodes`, `formatDateTime`, `openSubscribeModal`, `closeSubscribeModal`.
+ New localStorage key: `carteleraSubscribedSubjects`.
+ New `carteleraLeidas` format: `{read: true, mod: "DD/MM/YYYY HH:MM"}` (backward compat with boolean `true`).
+ Card redesign: tag type moved to tag container as pill, single date (modified if exists, otherwise original), "lido" button bottom-right, read state hides all tags. CSS: removed `.pub-tag` standalone, `.pub-details-row`, `.pub-modificada-pill`; new `.pub-tags-row`, `.pub-date-modified`.
+ Rename "Suscripción" → "Otras" (`cartelera.js` — 3 labels: renderSourceGroup header, chrono badge, subscribe modal note).
+ Cartelera CSS card hierarchy: `.pub-title` 15px white bold 600 line-height 1.3 (+ mobile 13px→15px).
+ `.pub-subject-name` always visible in read cards (removed from `.pub-read display:none` list), dimmed #666 when read.
+ `.pub-subject-name` font-size 12px→13px.
+ `.pub-read .pub-title` dimmed #888 weight 400.
+ Subscribed source color purple #a855f7 → amber #f59e0b (header + badge).

### Fixed
+ Fixed PG001 (Psicología Médica, year 2): `paraCursar` empty → added `[{materia:"A0001",condicion:"regularizada"}]`. PG001 was the only year-2 obligatory without prerequisite to enroll.
+ Privacy notice: fixed flash on PC — banner starts with `display:none`, version auto-reload script shows banner after confirming no reload; anti-loop (`lastReloadAttempt` 3s) prevents infinite reload from cache.

### Changed
+ Privacy notice converted to floating bar with X button (reappears on reload).
+ Modal "Cómo usar" rewritten: 1 page, 9 short items, no pagination.
+ Fix FAB mobile: positioning via CSS left/right (removed pixel calculation), overflow eliminated.
+ Toggle Cursando on main page: synced with localStorage, subtle cyan background, affects progress bar.
+ Hover subtle on list items on desktop (`rgba 0.03`).

## [0.00-beta] — 2026-08-03

### Added
+ Cartelera: general faculty publications (`cartelera.med.unlp.edu.ar/`) now appear on Cartelera page and email notifications.
+ Main page: new purple section "🏛 Avisos Generales de la Facultad" — always visible, top of "Por materia" mode (collapsible home group, `.source-header-home` purple #a855f7) with "General" badge (`.pub-source-home`) in "Cronológico" mode. Even with 0 active subjects, home renders. New consts `HOME_KEY="__HOME__"`, `HOME_ID="home"`, `HOME_LABEL="Avisos Generales de la Facultad"`. `parseHomeHtml()` parses `card.card-outline-success`. `resolveAndFetch()` always appends `{codigo:HOME_KEY, id:'home'}` and routes `fetch ?id=home → parseHomeHtml`. `renderHomeGroup()` first in `renderSubjectMode`. CSS: `.source-header-home`, `.pub-source-home`, `.pub-tag.tag-general`, `.notify-home-label`. Files: `APP/cartelera.js`, `APP/cartelera.css`, `cartelera.html`.
+ Email (worker): `/subscribe` accepts `{email,codes,names,home}` (default false), KV `{codes,names,home}`; if home → `fetchHomePubs` + snapshot KV 'home' + welcome includes `buildHomeEmailSection` (slice 5). Cron `scheduled()`: builds `homeEmails[]` (subs home:true), after catedra loop fetches home 1x, diff vs snapshot 'home', emails all (try/catch, subject "Nueva publicación general en la Facultad - Cartelera UNLP"), snapshot updates only if ≥1 email OK. Proxy `?id=home` → root `https://cartelera.med.unlp.edu.ar/`. `/test-cron` includes home diagnostics. Helpers: `parseHomeHtml`, `fetchHomePubs`, `buildHomeEmailSection`; `buildWelcomeHtml(catedraPubs,names,homePubs)`.
+ Subjects↔cátedras sync: added 6 fallbacks to `CARTELERA_FALLBACK_CATEDRAS` (HG001→Salud Pública, C2001→Cirugía B, BG008/BG013→Biología, EDS13→Educación para la Salud, PINV→Seminarios de Investigación Científica).
+ Cartelera filters: default interval 365→90 days; custom field `#daysInput` with "dias" suffix; new `syncFilterUI()` centralizes highlight. Custom interval active in cyan #22d3ee. Files: `cartelera.html`, `APP/cartelera.js`, `APP/cartelera.css`.
+ Cartelera cutoff +3: filter interval uses `currentDays+3` invisible (e.g. 30→33) to ensure visibility of pre-weekend publications.
+ Cartelera cards grid: publications rendered in CSS grid (`grid auto-fill minmax 260px`) for better desktop space usage. Wrappers `.cards-grid` in `renderSourceGroup`, `renderHomeGroup`, `renderChronoMode`.
+ Silent auto-reload system via `version.json`: detects new version, reloads page automatically (localStorage survives reload). 4 files: `version.json` + inline script in `index.html`, `arbol.html`, `cartelera.html`.

## [alpha] — 2026-07-14

### Fixed
+ FAB mobile (touch-and-hold) positioned incorrectly outside screen bounds in Tree Mode. Root cause: `createFAB` measured `fabContainer.getBoundingClientRect()` inside `requestAnimationFrame` while `fabSlideIn` animation was at initial frame (`transform: scale(0.7)`), returning ~70% actual width → centering offset right and border clamp didn't detect overflow. Fix: use `offsetWidth`/`offsetHeight` (layout dimensions, ignores transforms), reorder clamp (right border first, then `left>=8` for never negative), add `flex-wrap`/`justify-content:center`/`max-width:calc(100vw-16px)` in `.mobile-fab-container` as safety net.
+ Overlay blur legend on PC: `@media (min-width:769px)` hides `.tree-legend-overlay`/`.visible` with `display:none!important` — overlay (z-index:1000, backdrop-filter:blur) covered `.tree-legend` (z-index:100) on desktop.

### Changed
+ Mobile Tree Mode: "Ver materias optativas" switch redesigned as button (border #444, padding 4px 8px, border-radius 4px, min-height 37px) — vertical slider smaller (44×24px→18×28px, knob 20×20px→14×14px, `translateX(20px)`→`translateY(12px)`), label 11px→10px.
+ Mobile Tree Mode: button heights reduced 15% (`min-height 44px→37px` on btn-back/btn-legend/btn-cartelera/btn-help; zoom-controls button 44×44px→37×37px).
+ Desktop Tree Mode: "Ver materias optativas" switch redesigned as button also on PC (border #444, padding 4px 8px, border-radius 4px, min-height 37px, vertical slider 18×28px, knob 14×14px, `translateX`→`translateY(12px)`) + unified CSS (removed duplicate `.toggle-slider`/`.toggle-slider::after`/`:checked` overrides).
+ Mobile Tree Mode top-bar compacted vertically: `gap 6px→4px`, `padding 8px→4px 6px`, `h1 font-size 14px→13px`, `btn-back font-size 13px→12px + padding 8px 12px→6px 10px`.
+ Pinch-to-zoom gesture (2 fingers) in Tree Mode mobile: touchstart captures initial distance + base zoom, touchmove calculates ratio and adjusts `currentZoom` with clamp (`ZOOM_MIN..ZOOM_MAX`), calls `applyZoomTransform` + `updateZoomDisplay` in real time, touchend reconfigures SVG. Cancels long-press FAB if 2 fingers active.
+ Zoom buttons + and − hidden on mobile (CSS `nth-of-type display:none`), reset ⟲ and % indicator remain visible.

### Fixed
+ FAB fix: removed CSS `translateX(-50%)` from `.mobile-fab-container` + `fabSlideIn` keyframes — JS already handles centering with bounds checking, CSS was causing double-centering.
+ Scroll fix attempt reverted: height adjustment (`scrollHeight × zoom`) broke scroll entirely — `transform:scale()` restored without height fix, empty space issue remains pending.
+ REVERTED: entire-page scroll in Tree Mode — reverted to original system (scroll in `.tree-wrapper`, top-bar fixed, `html/body overflow-x:hidden`, `.tree-page overflow:hidden height:100vh`, `.tree-wrapper overflow:auto flex:1`) — original zoom/scroll system from commit `0f7ccdc` restored.
+ Fixed duplicate subject name in fechas-proximas field (`app.js`: removed prefix `materia.nombre` + `catedraSel` that caused double display).
+ Redesigned "🗓 Ver Fechas" button: from square 44×44px (icon-only) to compact pill (padding 6px 10px, border-radius 20px, font 12px, gap 4px, white-space nowrap) + `aria-label` accessibility.
+ Button "🗓" → "🗓 Ver Fechas" in all occurrences.

## [alpha-2] — 2026-07-07

### Added
+ Mobile: touch-and-hold FAB (400ms long press, 10px threshold) with dark overlay and contextual buttons.
+ Help button "❓ Cómo usar" in top-bar with context-aware modal (desktop=hover, mobile=long-press).
+ Legend redesigned: sections "Colores" (8 items) + "Flechas" (5 items), close button ×, overlay backdrop.
+ Flash animation legend (red+white glow 2s) triggers on every close (auto-hide, X, overlay).
+ FAB improvements: 58px, transparent container, 🔛/🟦 cursando toggle.
+ Toggle label: "Ver materias optativas".
+ Top-bar mobile: 3-row layout with CSS order.
+ CSS: `color-scheme dark`, `overscroll-behavior`, `touch-action`, `prefers-reduced-motion`.
+ Mobile: action buttons (✅🟧🔄) replaced by touch-and-hold (400ms long press) floating action buttons (FAB) with dark overlay.
+ FAB appears above node with contextual buttons (Aprobar/Regularizar/Resetear/Cursando) based on current status.
+ Tap on overlay or click outside closes FAB.
+ FAB buttons 58×58px (touch targets ≥44px), slideIn animation.
+ Desktop behavior unchanged (hover buttons remain).

### Changed
+ Top-bar reorganized in 3 columns: [Vacunas, Modo Árbol] | [Año de ingreso] | [¿Cómo usar?, ⚠️ Resetear].
+ Button Resetear with hold-to-confirm: 1.5s with animated progress bar (CSS ::after + transition), reset only after animation completes.
+ Title h1 centered (`text-align: center`).
+ Study plan updated from 2004 to 2023 in title.

### Fixed
+ Study plan correction (RM 578/25): DL001 Deontología, TX001 Toxicología, P9002 Psiquiatría II moved from year 4 to year 5 (5th year obligatory according to official plan).
+ Critical bug: snapshot was updating even when email failed → publications lost forever. Fix: `anyEmailSent` flag, only updates snapshot if at least 1 email sent successfully; if all fail, log + retry next cron.
+ Endpoint `/test-cron` (GET): full diagnostics without sending emails.
+ Endpoint `/test-send` (POST): sends test email to verify Resend API from Worker.
+ Deployed v39e7661f → c759c36e.

## [alpha-1] — 2026-06-30

### Added
+ Email notifications improved: subject names instead of "Cátedra ID" (names map sent from client, stored in KV alongside codes).
+ Clickable links to each publication in emails (welcome + cron): `parseCatedraHtml` extracts `href` from `<a>` in card-title.
+ Unsubscribe link in emails: points to `https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html`.
+ Button "Remover mi email" in modal: hold-to-confirm 1s (CSS progress bar), calls `POST /unsubscribe`, clears localStorage.
+ KV format changed: `[codes]` → `{codes, names}` (backward-compat in `scheduled()` handles both formats).
+ Review fixes: (1) regex title capture `.*?` → `[\s\S]*?` for multi-line; (2) pub link handles absolute URLs; (3) touch device double-fire guard (`touchInProgress`); (4) mobile touch target `min-height 44px`.
+ General review found 5 bugs + 1 critical bug. Applied 5 fixes: `typeof` guard email, `try/catch` proxy fetch, `response.ok` check, `catedrasLoaded` guard, `AbortController` 15s timeout.
+ Critical bug: `parseCatedraHtml` used `DOMParser` (browser-only API) in Cloudflare Workers → silent failure, emails never sent. Rewritten with regex parser.
+ `.gitignore`: `.wrangler/` added.
+ Worker redeployed `v8a894969`, test `/subscribe` confirmed `welcomeEmailSent:true`.
+ Correct Worker URL: `https://cartelera-proxy.felipestesta.workers.dev`.

### Changed
+ ⚙ "Alterar cátedras" button moved inside `<h3>` (APP/cartelera.js + APP/cartelera.css): button now inserted inside `<h3>` of subject title (not after), using `flex` + `margin-left: auto` to align right. Same behavior: visible only if >1 cátedra option, `e.stopPropagation()` on click.
+ `/subscribe` changed from MERGE → OVERWRITE (`worker.js`): before, `{email, codes}` merged new codes with existing — user couldn't remove subjects. Now `POST /subscribe` completely replaces the code list — unchecking checkbox removes subject from subscription.
+ Welcome email on `/subscribe` (`worker.js` + `cartelera.js`): on modal confirm, `/subscribe` now: (1) saves subscription in KV, (2) fetches last 5 publications per cátedra, (3) sends welcome email with those publications, (4) initializes snapshot in KV with current publications (avoids flood on first cron). New `buildWelcomeHtml()` function.
+ Worker refactor: shared helpers extracted (`parseCatedraHtml`, `fetchCatedraPubs`, `sendEmail`, `buildWelcomeHtml`) used by both `/subscribe` and `scheduled()`.
+ Snapshot stores FULL publications array: before stored `pubs.slice(0, 5)` (only first 5) — caused false positives when pub #6 was new but #1-#5 were in snapshot. Now stores complete array.

### Fixed
+ `escapeHtml(str)`: sanitization function applied to cátedra IDs in links and email HTML content (prevents XSS via malicious cátedra name).
+ Email validation regex + lowercase normalization: email validated with regex before saving in KV; converted to lowercase to prevent duplicates (a@B.com vs A@b.com).
+ CORS header on proxy error: error response from proxy `?id=` (without parameter) now includes `Access-Control-Allow-Origin: *` to avoid CORS in frontend.
+ Per-email `try/catch` in `scheduled()`: each email processed in individual try/catch — failure in one email does NOT interrupt batch (other subscribers still receive notifications).
+ `Promise.allSettled` parallel fetch in `/subscribe`: cátedra publication fetch uses `Promise.allSettled` instead of sequential — reduces total time and prevents Worker timeout (30s limit).

## [alpha-0] — 2026-06-29

### Added
+ ⚙ "Alterar cátedras" button per subject (`APP/cartelera.js` + `APP/cartelera.css`): new helper `getCatedraOptionsForCode(code)` returns cátedra options array without auto-selecting or mutating localStorage. New `openCatedraSelectorForCode(code)` reopens cátedra selector for specific subject, adds "✕ Cerrar" button and smooth scroll to `#catedraSelector`. Button injection in `renderSubjectMode()` after subject title (only if >1 cátedra option), with `e.stopPropagation()` to prevent h3 collapse. CSS `.catedra-change-btn` (28×28px desktop, 44×44px mobile) + `.selector-close-btn`.
+ Email notifications — Worker Cron + Resend (`worker.js` + `wrangler.toml` + `cartelera.html` + `APP/cartelera.js` + `APP/cartelera.css`): `worker.js` extended (179 lines): maintains existing proxy `?id=` intact; adds `scheduled(event,env,ctx)` handler (Cron 1x/day 8am) that reads subscriptions from KV `CARTELERA_SUBS`, fetches each cátedra, compares with snapshot in KV `CARTELERA_SNAPSHOTS` (last 5 title+date pairs), sends email via Resend API if new publication, updates snapshot. New routes: `POST /subscribe` (saves {email, codes:[...]} in KV), `POST /unsubscribe` (removes), `GET /health`, with CORS preflight (OPTIONS). try/catch: email failure does NOT update snapshot (retry next cron). `wrangler.toml`: cron `0 8 * * *`, 2 KV namespaces (CARTELERA_SUBS, CARTELERA_SNAPSHOTS). UI in `cartelera.html`: 🔔 Notificarme button in controls-bar + modal with email input + active subjects checkboxes. `APP/cartelera.js`: `populateNotifySubjects()`, `openNotifyModal()`, `closeNotifyModal()`, `handleNotifySubscribe()` + email persistence in `localStorage.carteleraNotifyEmail`.
+ Cartelera fallbacks: added `CARTELERA_FALLBACK_CATEDRAS` for SEM91 (Medicina Interna D/E/F) and P9001 (Psiquiatría I) when missing from `finales.json`.
+ "👁 lido" button: each publication has button marking it as read, collapses card and persists state in `localStorage.carteleraLeidas`.
+ "👁 todas lidas" button: top bar, marks all currently visible publications as read.
+ Collapsible sections: headers "Cursando" and "Regularizada" clickable with ▾/▸ indicator, state persisted in `localStorage.carteleraCollapsed`.
+ Names in chronological: Chronological mode now shows subject name via `getSubjectName()` (loads from `materias.js`).
+ Regularized subjects included in Cartelera: `getRegularizadaCodes()` reads subjects with status `"regularizada"` from `localStorage.estados`. `resolveAndFetch()` now combines cursando + regularized subjects, with precedence cursando > regular. Subject mode: colored group headers — Cursando in cyan (#22d3ee), Regularizada in orange (#f97316). Chronological mode: each card shows origin badge (Cursando / Regularizada) with corresponding color. `cartelera.html`: cátedra selector and timeline now include both sources.

### Fixed
+ SEM91 fallback expanded from 3 to 6 options: Medicina Interna A, B, C, D, E, F.
+ Cátedra selector now shows subject name via `getSubjectName()` instead of code.
+ "👁 todas lidas" button now toggles: 1st click marks all visible as read, 2nd click unmarks (text alternates between "lidas" and "não lidas").
+ Date filters (365d/30d/7d) persist in `localStorage.carteleraFilterDays`.
+ Each subject can be individually collapsed in "Por materia" mode (click h3 ▾/▸), persisted in `localStorage.carteleraCollapsedSubjects` as `{CODE: bool}`.
+ Semiología bug fix: `resolveCatedraForCode` now does fallback chain when selected cátedra name doesn't resolve (instead of returning error that hid the subject).
+ Cátedra selector doesn't auto-close on render — `render()` no longer hides `selectorEl`. Only `resolveAndFetch` manages visibility.
+ `catedrasLoaded` guard: refresh button blocked until `finales.json` loaded.
+ `render()` early-exit now checks `anyErrorOverall` (not just `anyPubOverall`) — error messages render instead of generic empty.
+ `renderCatedraSelector` uses `btn.dataset.catedra` (auto-decodes HTML entities) instead of `getAttribute`.
+ `fetchCatedra` with `AbortController` 15s timeout (no infinite spinner).
+ `console.log` removed from production code.
+ Mobile touch targets: padding 10px 14px (≥44px) for filter/group/refresh/selector buttons.
+ Contrast: `.pub-professor` #777→#aaa, `.pub-modificada` #666→#999 (WCAG AA).
+ Accessibility: `focus-visible` outline (#22d3ee), `aria-pressed` on toggle buttons, `aria-label` on 👁 buttons, `role=button` + `tabindex=0` + `onkeydown` on collapsible h2/h3.

### Changed
+ Cartelera date filter default 365→90 days; custom field `#daysInput` with "dias" suffix (`.filter-days-wrap`/`.filter-days-suffix`); new `syncFilterUI()` centralizes highlight (predefined button 60/30/7 OR wrapper `.filter-days-wrap.active` in cyan #22d3ee when custom interval active).
+ Cartelera cards grid: publications rendered in CSS grid (`grid auto-fill minmax 260px`).

## [initial] — 2026-06-14

### Fixed
+ SVG arrow flash: removed CSS transition `opacity 0.3s` on `svg path.connection-line` — arrows appear instantly on click, no flash.
+ Tree Mode scroll handler: removed `updateSvgDimensions()` from scroll handler (scroll doesn't change dimensions, only `drawConnections()` needed).
+ Tree Mode `selectNode`: removed redundant `applySelectionVisuals()` call on old paths that would be destroyed — eliminates double flash.
+ Tree Mode `drawConnections`: now preserves `<defs>` in SVG when clearing paths (removes only `path.connection-line`, not all children).
+ Tree Mode `selectNode`: added `requestAnimationFrame()` for immediate SVG recalculation + `setTimeout(300ms)` for post-expansion correction.
+ Tree Mode `deselectAll`: replaced `setTimeout(250ms)` with `requestAnimationFrame()` for immediate SVG recalculation.
+ Tree Mode CSS: added `transition: none` on `.subject-node.selected .node-actions` — buttons appear instantly on click.
+ Tree Mode mobile: added `margin: 0 2px 8px 2px` on `.subject-node` for vertical spacing between cards.

### Changed
+ Mobile Tree Mode: action buttons (✅🟧🔄) now hidden by default (`opacity: 0`, `max-height: 0`). Appear only when card is `.highlighted` (selected/touched) with smooth transition. Logic equivalent to desktop hover, adapted for touch.

## [initial-mobile] — 2026-06-14

### Fixed
+ Mobile portrait Tree Mode: `.node-content` now uses `flex-direction: column` (like desktop) instead of `row` — cards are vertical: name on top, info below.
+ Removed `text-overflow: ellipsis`, `white-space: nowrap`, `overflow: hidden` — text wraps naturally with `word-wrap: break-word`.
+ `.node-meta` with `flex-wrap: wrap` for sub-info that needs line break.
+ Zoom portrait increased from 55% to 65% for better readability.
+ Cards maintain lateral compaction (`min-width 65px`, `max-width 110px`) but grow vertically.

### Changed
+ Mobile portrait compact: `.subject-node` no longer stacks in `flex: 1 1 100%` — now uses `flex: 0 0 auto` with `min-width 65px` and `max-width 110px`.
+ New `@media (max-width: 768px) and (orientation: portrait)` applies `transform: scale(0.55)` on `.tree-zoom-container`.
+ Mobile cards: name 8px (ellipsis), meta 7px, buttons 28px, compact padding.
+ User is forced to rotate to landscape or use PC/tablet for full experience.
+ SVG arrows resize handler (line 44) now calls `updateSvgDimensions()` before `drawConnections()`. Before: on orientation change, SVG arrows were clipped because SVG dimensions were stale (still sized for portrait viewport).

## [initial-states] — 2026-06-12

### Added
+ `removeSubjectState()` (`arbol.js`): when resetting a subject (🔄 button), the corresponding cursando state is also removed from localStorage.
+ `resetearTodos()` (`app.js`): when resetting all states (main page button), the "cursando" key is also removed from localStorage.
+ `getConnectionVisualStyle()`: new function replacing `getLineColor()` — evaluates `paraCursar` AND `paraAprobar` simultaneously. 4 visual states: (1) Gray #666 solid: can't enroll, missing cursada; (2) White #ffffff solid: can't enroll, missing final; (3) Green #22c55e dashed: can enroll but can't take final; (4) Green #22c55e solid: can enroll and take final.
+ Cursando toggle (toggle switch) + purple/lilac elective colors in Tree Mode. New `cursando` state persisted in localStorage (`cursando: { "CODE": true }`). Toggle switch "Cursando" on left side of `puede-cursar` / `optativa-puede-cursar` nodes. When Cursando ON: node gets cyan gradient background + rotating border glow animation. Dependent correlatives get subtle rotating black/white border animation. CSS animation: `@property --border-angle` + `@keyframes borderAngleRotate` (3s linear infinite). Elective colors changed from cyan to purple/lilac: `#22d3ee`→`#a855f7` (border, text, label, dependents, toggle switch), `#1a6b73`→`#581c87` (dark variant for no-puede-cursando), `rgba(34,211,238,...)`→`rgba(168,85,247,...)` (background opacity). JS functions: `isCursando()`, `toggleCursando()`, `cumpleRequisitosConCursando()`, `verificarRequisitoConCursando()`, `wouldBeAvailableWithCursando()`, `applyCursandoEffects()`.

### Changed
+ Legend restored: "Cursando (ON)" swatch with cyan gradient and glow. Removed duplicate "📖 Cursando" button from legend-buttons.
+ `initTree()` now hides `optLabel` (`display:none`) when toggle Optativas=OFF. Before only `.subjects-row.optativas` was hidden, the "Optativa" label remained visible.
+ Refactored `drawConnections()`: collects AND stores both requirements (paraCursar + paraAprobar) per connection. Two passes: paraCursar first, then paraAprobar (merge on same object). Each connection uses `getConnectionVisualStyle()` returning `{ color, dashed }`.
+ Legend updated: 5 items: Cumplido (green), No cumplido Cursada (gray), No cumplido Final (white), Puede cursar falta final (green dashed), Optativa (purple).

### Fixed
+ Toggle Cursando position (`arbol.css`): added `order: -1` on `.node-cursando-toggle` to position left of action buttons.
+ Arrow colors paraAprobar (`arbol.js`): refactored `drawConnections()`: collects all connections in two passes (paraAprobar first, then paraCursar). paraAprobar has priority over paraCursar when same pair appears in both arrays. Correct coloring: unfulfilled paraAprobar arrows now show #ffffff (white) instead of #666 (gray).
+ Dashed lines (`arbol.js` + `arbol.html`): added `isDashed` parameter in `drawBezier()` with `stroke-dasharray: 6 3`. Unfulfilled paraAprobar arrows are dashed; fulfilled or elective remain solid. Legend updated: "No cumplido (Final)" shows dashed white line.

## [initial-visual] — 2026-06-07

### Added
+ Orange dark gradient on regularized subjects in Tree Mode (`arbol.css`): gradient follows same pattern as `.status-aprobada` (angle 100deg, solid fallback) but in dark orange tones (`#4a1a06` → `#782808`). No glass/reflection effect (no `::after` pseudo-element).

### Fixed
+ SVG arrows in Tree Mode (scroll, hover, click): arrows disappeared on scroll, hover and click. Root fix: `updateSvgDimensions()` used `getBoundingClientRect()` (viewport-relative) which shrank during scroll. Rewritten to hide-SVG → measure scrollWidth/scrollHeight → restore-SVG.
+ Selection bug: `drawConnections()` called `selectNode(selectedNode)` to reapply highlight, but `selectNode()` has toggle logic (if same node → deselectAll). Created `applySelectionVisuals()` that applies highlight/dimmed classes directly without toggle.
+ Click flash: removed `mouseenter` listener that called `drawConnections()` after 250ms, causing visible clear+recreate cycle.
+ Cleanup handlers: resize and scroll listeners no longer call `updateSvgDimensions()` — only `drawConnections()`. Scroll listener registered once on `DOMContentLoaded` (not inside `initTree`).

## [initial-polish] — 2026-06-06

### Added
+ Glass reflection effect on approved subject nodes: `::after` with animated white gradient (glassShine keyframe).
+ Action buttons (✅🟧🔄) visible only on hover, always visible on mobile.
+ SVG vertical arrows: exit from bottom-center of prerequisite, arrive at top-center of dependent.
+ Dashed lines for paraAprobar (missing final), solid for paraCursar (missing cursada).
+ Compact layout: reduced spacing, smaller fonts, tighter padding.
+ Layout centered: `max-width: 1200px; margin: 0 auto` on zoom container.
+ Labels "Año" and "Optativa" in Spanish (corrected from "Ano").
+ Mobile responsive optimized: vertical cards, always-visible buttons, touch targets 44px, `100dvh`.
+ Z-index corrected: SVG behind nodes (z-index: 0), nodes above (z-index: 1 via zoom container).

### Changed
+ Subject node background changed to dark gradient (`#003803`).
+ Glass shine animation angle adjusted to 100deg (consistent with background).
+ Glass shine animation made slower (6s) and continuous.
+ Removed dotted line style (`paraAprobar`); now all are continuous.
+ Line colors updated: White (#ffffff) = unfulfilled requirement (Final), Gray (#666) = unfulfilled (Cursada).
+ Fixed `selectNode` and `findCorrelatives` logic: now maps only direct connections (neighbors), preventing selection of entire network at once.

## [initial-setup] — 2026-06-05

### Added
+ GitHub Pages configuration: added `_config.yml` to disable Jekyll processing (`theme: null`), added `.nojekyll` as safety marker for full Jekyll bypass. Excluded from build: AGENTS.md, LOG.md, REF/, .gitignore, README.md. Security scan completed: no sensitive information found (100% clean for public deploy).
+ Folder structure reorganization: created `APP/` directory for site logic. `materias.js` moved to `APP/materias.js`. `finales.json` moved from `REF/finales/` to `APP/finales/finales.json`. `vacunas_data.js` moved to `APP/vacunas_data.js`. `optativas_lista.js` removed (data already in materias.js). `REF/` now contains only reference data (CSV). Paths updated in `index.html`, `arbol.html` and `app.js`.
+ 🟡 indicator in nodes with exactly 1 missing prerequisite (status "no-puede-cursar" or "optativa-no-puede-cursar"). New `countMissingPrerequisites()` function counts unfulfilled requirements in `paraCursar`, including OPT-HORAS.
+ Multi-column for Year 4 obligatory (17 subjects in 2 sub-columns) and Year 5 elective (12 electives in 2 sub-columns). New CSS classes `.multi-column` and `.sub-column` for 2-column flex layout.

### Changed
+ Horizontal layout: years as rows, subjects as cards side by side with `.subjects-row`.
+ Long lists split into 2 `.sub-row` (obligatory >8, elective >6).
+ Legends updated: "No cumplido (Cursada)" solid line, "No cumplido (final)" dashed line.
+ Auto-hide legend after 10 seconds, "📋 Legenda" button to re-exhibit.
+ Elective status now distinguishes: optativa-puede-cursar (cyan #22d3ee) and optativa-no-puede-cursar (#1a6b73) based on prerequisites.
+ Layout restructured: 6 year columns, each with sub-columns obligatory (left) + elective (right).
+ Added toggle "Optativas" in top-bar to hide/show elective columns.
+ SVG connections ignore hidden nodes (`offsetParent === null`) to prevent invalid curves.
+ Elective left border removed for correct card alignment.
+ SVG line color scheme updated: green (#22c55e) = fulfilled, gray (#666) = unfulfilled (cursada), light gray (#999) = unfulfilled (final), cyan (#22d3ee) = elective.

### Fixed
+ `categoryOrder` with values 0-3 caused inverted sorting (0 was falsy with `|| 99`). Values changed to 1-4.
+ `.top-bar` without `display:flex` on desktop — "¿CÓMO USAR?" button wasn't right-aligned.
+ `body { margin: 20px }` reduced to `12px` (excessive space).
+ `.box h3 { margin-left: 14px }` changed to `0` (inconsistency with `ul`).
+ Category order bug in `app.js` where `categoryOrder` values 0-3 caused inverted sorting.
+ Accessibility: `*:focus-visible` with cyan outline (#22d3ee) added in `style.css` and `arbol.css`. ARIA labels added to action buttons ✅🟧🔄 in Tree Mode. `role="switch"` and `aria-label` added to electives toggle. `aria-live="polite"` added to zoom display. `tabindex="0"` and `role="button"` added to box headers (h3/h4). Keyboard support (Enter/Space) for box toggles. Contrast corrected: `#4a4a4a`→`#666`, `#777`→`#999`, `#4ade80`→`#6ee7a0`.
+ Touch targets: `.btn-calendario` increased 28→44px, `.node-btn` mobile 44px minimum, zoom buttons 44px.
+ Robustness: all `localStorage.getItem/setItem` wrapped in try/catch (Safari private browsing).
+ Performance: removed redundant `setTimeout` in `arbol.js` (double-render). Removed `console.log` from production (4 occurrences in `app.js`).
+ Cleanup: dead CSS rule `.node-border.status-optativa` removed from `arbol.css`.
+ Scrollbar double: `height: 100vh; overflow: hidden` on page, `overflow: auto; min-height: 0` on wrapper.

## [initial-tree] — 2026-06-05

### Added
+ Tree Mode implementation (`arbol.html`, `arbol.css`, `arbol.js`). Independent page sharing localStorage with main page. 6-column layout (one per year) with CSS grid. Rounded nodes with 4px left border colored by state (aprobada=#22c55e, regularizada=#f97316, puede-cursar=#4ade80, no-puede-cursar=#333, optativa=#22d3ee). Click cycles state: none → regularizada → aprobada → none. SVG Bezier curved lines from prerequisites to dependents, with arrows. Line colors by fulfillment: green (fulfilled), orange (pending), gray (unfulfilled), cyan (elective). Special prerequisite handling: OPT-HORAS (elective hours >= 270). Forward reference PD001 (year 4) → I0001 (year 5) with right-to-left curves. Zoom controls: +, −, reset, with CSS transform scale. Floating legend fixed in bottom-right corner. Responsive design with horizontal scroll on mobile. "🌳 Modo Árbol" button added to top-bar of `index.html`.

## [initial-main] — 2026-05-04

### Added
+ Box state persistence in localStorage: collapsed/open state of main boxes and elective subsections persists between sessions. New `boxStates` key in localStorage saves user preferences. State restored automatically after each `render()`.
+ Item counters `[N]` in all boxes and subsections (Aprobadas, Regularizadas, Puede cursar, No puede cursar, Proyectos de Extensión + internal subsections). New `actualizarContadores()` function called at end of `render()`. Fixed `toggleSubsection()` and `restoreBoxStates()` to use `innerHTML` when swapping ▾/▸ icons, preserving `<span class="box-count">` element.
+ Calendar button (`.btn-calendario`) redesigned: always square shape, internal/external shadows with volume effect, hover without scale (only shadows and border animate).

### Fixed
+ Date sorting in finals popup: "Próximas" ascending (min→max), "Anteriores" descending (max→min). Fixed in `actualizarFechasPopup()` and `datos` construction in `mostrarPopupFechas()`.
+ Critical ID fix in `agregar()`: fixed syntax errors in `app.js` where ID comparisons had extra spaces (`"no puedeFinal"`→`"noPuedeFinal"`, `"no puede cursar"`→`"noPuedeCursar"`), which prevented correct display of finals dates in UI.
+ Finals date display: fixed subject name mapping in `cargarFechasFinales()` to ensure dates display correctly.
+ Critical CSS fix: removed duplicate CSS outside `@media` query (lines 987-1132 of 1132). Mobile rules were being applied on all screens. Removed duplicate selectors: `.btn-primary:hover`, `.top-bar-controls label`, `.top-bar-divider`. Fixed `grid-template-columns: 1fr` in `.listas` (element is flex, not grid). Added `NaN` validation in `parseFechaLocal()` to prevent invalid dates. CSS reduced from 1132 to 971 lines.

### Changed
+ Migrated finals system from CSV to JSON (`REF/finales/finales.json`) for better maintainability and robustness. Refactored `cargarFechasFinales()` in `app.js` to consume JSON file.
+ Updated finals dates (April-December 2026). Migrated logs to LOG.md and cleaned up README.md. Implemented pagination in help modal showing latest updates.
+ Regenerated `finales.json` from both CSV sheets (1st and 2nd quad 2026). 61 subjects with complete dates (February-December 2026). Fixed timezone bug: replaced `new Date(f.fecha)` with `parseFechaLocal()` to prevent -1 day offset in GMT-3. Fixed truncated cátedra names (e.g. "sicología Médica" → "Psicología Médica").

## [initial-data] — 2026-03-29

### Changed
+ Data unification: merged `optativas_lista.js` into `materias.js`.
+ Fixed incorrect `anio` values: FM001:2, GE001:2, IES01:1, MGF:5.
+ Modified progress percentage calculation: excluded "puede cursar" segment.
+ Verified `resetearTodos()`: correctly cleans all states.
+ Confirmed working with unified data structure.
