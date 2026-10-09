# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
+ Diagnóstico de uso do Cloudflare Free Tier em `REF/cloudflare-usage.md` (fora do git): limites oficiais (KV 1k writes e 1k lists/dia = gargalo real), mapa de consumo por endpoint, matemática por aba aberta (poll 30s consome ~1 write + 1 list/30s → 1 aba ~4,2h = 50% do dia), causa provável do pico de 04/10 (badge online em `nav.js`/`universidades.js`), bugs latentes (cron sem paginação de `list()`; lock 5s < poll 30s). §6 = **plano otimizado** (análise O1–O6 + O7 novo): fundir heartbeat+counts (O1), poll 60s (O2 rev.), lock 1h (O3), higiene do cron (O4), memo Cache API 60s (O5), presença → D1 LITE (O6 red.), pausa em aba oculta (O7). Resultado: KV writes/lists → ~0; D1 100k writes/dia absorve; nenhuma implementada ainda.
+ Vacunas: **dTpa condicional** — exigida solo al poder cursar Pediatría (PD001, 5º año); antes solo dT (`requiereDtpa()` en `APP/vacunas.js`; materias.js + state-cache.js + requisitos.js ahora cargan en vacunas.html). Antes de eso la dTpa se muestra atenuada y sin ⚠.
+ Vacunas: **vacunas opcionales del Calendario Nacional 2026** (fiebre amarilla 1 dosis de por vida — OMS, hepatitis A, varicela, neumocócica VNC20, meningocócica, FHA Candid#1) — listadas atenuadas (opacity 0.5), sin ⚠, con botón Agregar.
+ Vacunas: **Mapa de Vacunas y Cepas interactivo** — capa de círculos por patógeno (bacterianas/virales, nombre dentro) + contornos por vacuna englobando sus patógenos (dT ⊂ dTpa ⊂ Quíntuple anidados; Hep B solapa Quíntuple). Filtros por patología (22 checkboxes) ocultan las vacinas correspondientes. Clic en un contorno → **ficha educativa** (UNA por vacuna del calendario: tipo(s) y marcas como tags, esquema, indicación, patógenos, en desarrollo/estado del arte, enlaces MSAL/OMS). Datos en `APP/vacunas_fichas.js` (19 vacunas, 23 patógenos). Layout calculado a mano (venn.js/d3 probados y descartados — innecesarios para el diseño final).
+ Vacunas: **footer de fuentes oficiales** — Calendario Nacional de Vacunación (MSAL), SADI, ANLIS Malbrán.
+ Modo Árbol: **tag "Libre" en optativas** (esquina inferior izquierda, alineada con el texto del nombre) — verde cuando el calendario vigente (`finals.json`) tiene fechas "Libre" de la cátedra (dinámico, `cargarLibreFinales()`); naranja para libre histórico sin fechas actuales (`OPTATIVAS_LIBRE_HISTORICO`, vacía). Research 2026-10-09: PDFs oficiales 2024 y 2025 (Abr–Dic + Feb–Mar) + Anexo I Res 465/18 — verdes: CE001, GE001, HM001, IM001, NEUAT, T0100, TIN01; ninguna optativa perdió el libre. Tooltip del card: "Puede rendir el final libre".
+ Modo Árbol: **markers 🟡/⭕ con hover propio** — dejan de ser prefijo de texto y pasan a span con `title` ("Te falta 1 materia para cursarla" / "Puede cursar pero no rendir final"); tooltips de los cards ya no repiten el nombre de la materia (redundante).
+ Cartelera: persistencia del modo de agrupación (Por materia / Cronológico) en localStorage — clave `carteleraViewMode` (`"subject" | "chrono"`); botones `.group-btn` restauran el modo al cargar.
+ Modo Árbol: **Mini calendario** dentro del tree-top-bar (en el espacio vacío entre el toggle y los botones; en móvil pasa abajo como fila completa) — `arbol.html` + `APP/calendar_data.js` + `APP/minical.js`. Strip de 53 semanas (lun–dom, gap entre meses) con un emoji por semana: ⚫ verano, 🔘 período letivo, 🔵 receso invierno, 🟡 inscripciones obligatorias, 🟣 optativas, 🟠 ingresantes, 🟢 semana actual (overlay intercalado). Tooltip en hover/tap: rango de fechas + eventos + escalonamiento por año/filtro. Una sola línea, centrado en la semana actual, drag horizontal sin scrollbar (Pointer Events).
+ Mini calendario: **ventanas 2026 verificadas contra la cartelera oficial** (noticias 241/248/249/255/260/264/270): W0 1º año 11–13/03 11h (SIU); W1 14–15/04 escalonado; W2 08/06 (cierre no publicado → placeholder 10/06, research); W3 04–14/08 (1º año cierra 05/08); W4 06–09/10. Optativas COMPLETAS 1º–4º bim: WO1 formulario SAE 31/03→01/04; WO2 09–10/06 (≥30/≥17/sin filtro); WO3 11–13/08 (corregido por asueto 12/08); WO4 08–09/10. Receso invernal UNLP 20/07→02/08 (oficial). Ingresantes 09/11→11/12. Único pendiente `research:true`: cierre W2.
+ Mini calendario: **períodos fijos oficiales** (PNG `calendario-academico-2026.png` de la FCM, leído por subagente Gemini): verano hasta 22/03, letivo 23/03→18/07 y 03/08→05/12, receso 20/07→02/08; bimestres 06/04→13/06, 15/06→18/07, 03/08→10/10, 12/10→05/12; anuales 23/03 (1º año) / 20/04 (2º+)→21/11. Sufijo "(fecha aproximada)" removido del tooltip.
+ Página principal: **mini calendario debajo de la barra de progreso** (`index.html` + skin caja en `style.css`). Componente movido a `base.css` (compartido; árbol mantiene skin transparente inline en tree-top-bar). Tooltip con clamp horizontal dentro del contenedor + modo "below" (hacia abajo) cuando no hay espacio arriba (navbar fijo) — nunca sale de la página.
+ Página principal: **tag "Inscripción" después del nombre** en los ítems Puede Cursar (obligatorias + optativas + favoritas) cuando la ventana está ≤14 días o abierta — tooltip nativo con la ventana; se recalcula en cada render.
+ Modo Árbol: el sticker "Inscripción" **no cubre más los botones del card en PC** — `padding-bottom: 20px` extra en hover/selección (regla `:has()` en `@media (hover:hover) and (pointer:fine)`), acompaña el crecimiento de `.node-actions` (max-height 0→30px).
+ Modo Árbol: sticker **"Inscripción"** (esquina inferior derecha) en materias Puede Cursar / Optativa (puede cursar) cuando su ventana de inscripción está a ≤14 días o abierta — reglas por categoría (anual→W1, 1er año anual→W0 marzo, cuatrimestral→W1+W3, bimestral→todas, optativa→WO1–WO4; overrides: Salud Pública I HG001→W3, HG002→W1). Tooltip del nodo muestra la ventana. Desaparece automáticamente al cerrar la ventana.
+ Worker: **monitoreo mensual de inscripciones** (día 1 de cada mes) — `checkInscripciones()` hace diff de texto de `med.unlp.edu.ar/index.php/inscripciones` + `/ingresantes` contra snapshot KV y avisa al admin por email ante cambios (recordatorio de actualizar `calendar_data.js`). Endpoints: `/test-inscripciones` (diagnóstico sin email), `/test-inscripciones-send` (forzar). Proceso en `FLOW/minical.dot`.

### Changed
+ Worker + frontend: **optimización del uso del Cloudflare Free Tier** — el badge online consumía 1 write + 1 list de KV cada 30s por pestaña (free: 1k/día de cada; 1 pestaña ~4,2h = 50% del día). Presencia online migrada a **D1** (tabla `presence`, expira a los 3 min, cleanup en cron); `/heartbeat` responde `{online, visits}` (1 request en vez de 2, `GET /online` queda memoizado como compat); conteo memoizado 60s en Cache API (`getCounts()` — 0 lists/reads por pestaña); lock de visitas 5s→1h; poll 30s→60s con pausa en pestaña oculta (`visibilitychange`, `nav.js` + `universidades.js`); cron: paginación real de `list()` (bug latente >1000 keys) + skip de keys internas (`:`) + `max_online` vía D1. KV queda solo para suscripciones/snapshots/contadores diarios (~0 writes del badge). Worker deployado (v c3997396). Diagnóstico completo en `REF/cloudflare-usage.md` (fuera del git).
+ Materias: "Medicina Interna I" (MI191) y "Medicina Interna II" (MI291) pasan de `categoria:"anual"` a `categoria:"cuatrimestral"` (120→60 pts c/u en el progreso; `horas` sin cambios).
+ Materias: "Pediatría" (PD001) pasa de `categoria:"anual"` a `categoria:"cuatrimestral"` (120→60 pts en el progreso; `horas` sin cambios).

### Fixed
+ Modo Árbol: el contorno de color izquierdo (`.node-border`) no crecía junto con el card en hover/selected de nodos con sticker — el `padding-bottom: 20px` estaba en el card y el flex-stretch del border no cubre el padding del container; el padding pasó a `.node-content` y el border ahora estira junto (verificado: +17px card = +17px border).
+ Charset: escaneo general UTF-8 del repo — 4 archivos corruptos. `APP/extension_data.js` (visible: descripciones de proyectos) y `REF/correlativas optativas/optativas.csv` re-codificados Latin-1→UTF-8 (81 y 155 acentos recuperados). 23 comentarios de `APP/style.css` + 2 de `APP/arbol.css` con U+FFFD reconstruidos (extensión, matéria, seção, colapsável, botões, mínimo, título, Cómo usar / Modo Árbol). BOM removido de `style.css` y `version.json`. Verificación final: 0 UTF-8 inválido, 0 U+FFFD, 0 BOM, 0 NUL; `node --check` OK en los 18 JS.
+ `deploy.ps1`: bump de `version.json` ahora escribe UTF-8 **sin BOM** (`[IO.File]::WriteAllText` + `UTF8Encoding($false)`) — el `Set-Content -Encoding UTF8` de PowerShell 5.1 reintroducía el BOM en cada bump, deshaciendo el fix de charset.

## [0.09] — 2026-09-29

### Added
+ "Otras Universidades" page (`universidades.html`): navbar fixed (clon visual del app-navbar; HOME → "← Modo Árbol" + título; PLAN → |← Volver| título centrado |Otras Universidades ▾ dropdown|). Home = mapa + filtros + tabla. Árboles de solo lectura con planes REALES, sub-filas automáticas, duración solo si verificada; conexiones ocultas por defecto, al seleccionar: prerrequisitos silver + dependientes cian. user-select deshabilitado, hash routing (#uba/#unc), UNLP → Modo Árbol, zero localStorage (.uni-* prefix). Footer link en Modo Árbol. Investigación en TODO.md. **Página con 24 universidades** (ver Removed).
+ Universidades: sistema de estados de materias en los árboles (solo sesión): botón 🔘→🟢 en TODAS las materias (PC: clic; móvil: mantener 1s). Contorno azul = "puede cursar"; iniciales nunca se resaltan. Recompute por clases en el DOM, sin redibujar el SVG.
+ Universidades: nota de ingreso arriba de cada árbol (`plan.ingresoNota`) + línea de info (nombre del plan + fuente) debajo del árbol.
+ Universidades: registro centralizado — todo vive en el objeto de cada universidad en `universidades_data.js` (`region` + `stats` + `lastReviewed` inline; mapa `UNI_REGIONS` eliminado). Nueva herramienta `tools/validate-universidades.js` (schema, correlativas, consistency, staleness). Correr antes de commits: `node tools/validate-universidades.js`.
+ Universidades: ciclo de revisión — campo `lastReviewed` (fecha ISO) por universidad; se actualiza en cada verificación; revisión cada ~2 años (política: solo info ≤2 años, si se agotan fuentes el campo queda null).
+ Universidades: investigación UBA + UNLP (Fase 2): QS Medicine 2026 (UBA 1/133, UNLP 3/501-550), español C1/B2, método Tradicional UNLP (RM 578/25), costo de vida Numbeo sin margen, immigrantPct UNLP 38.5% (anuario SIU-Araucano via infoplatense). Detalles y GAPs en TODO.md §2.6.
+ Universidades: fuente de ranking → **QS Subject MEDICINE 2026** (Excel en REF/) con fallback **EduRank Medicine 2026** (edurank.org/medicine/ar/) para universidades fuera de QS.
+ Universidades: veredicto de agentes de investigación — LING: alta calidad (retry si vacío). Gemini: **Google BLOQUEADO** (sin search grounding) — bypass real: navegador Edge del usuario vía edge-devtools.
+ Universidades: batch de estadísticas Fase 2 — `distanceToCapitalKm` 24/24 (haversine → CABA), `careerYears`, `subjectCount` (Hornero + oficiales), `rankingSource`, `studentCount` 24/24 verificado contra Cuadro 2.1.16 SPU Anuario 2024 (alcance carrera Medicina). Validator: 0 errors.
+ Universidades: `webUrl` de TODAS las filas → página oficial de Medicina (verificado HTTP 200 + 'medicina'; Edge para TLS roto). Excepciones http (WARN): unchaus, unsalta; unlar caído desde la red local.
+ Universidades: **`livingCostUsd` 24/24 completo** — batch por delegación, sin margen ×1.2 (decisión del usuario). Solo Córdoba con Numbeo real (825, HIGH); resto Estimated LOW/MEDIUM. Validador: 0 errores.
+ Universidades: **`immigrantPct` 13/24** — 11 valores de la tabla del usuario (EduRank 42 escuelas, alcance universidad) + unlp 38.5 y uba 28 conservados (alcance facultad/carrera, fuentes propias); unlar <2% (cota sin número exacto → null + fuente en TODO §2.6). 11 null documentados.
+ Universidades: **`teachingMethod` 14/24** — vocabulario único del usuario (PBL / Tradicional / Híbrido; doble opción → Tradicional). PBL: UNLaM, UNR, UNL, UNCuyo, UNS, UNER. Tradicional: UNLP, UBA, UNT, UNNE, UNMdP, UNComahue. Híbrido: UNC, UNSa. 10 null.
+ Universidades: **`spanishLevel` 7/24** — batch Fase 2 (unc B2, unr Certificado, uncuyo B1/B2, unlar CELU, unaj B2 + las 2 previas). Convención: CEFR directo; certificado sin nivel → 'CELU'/'Certificado'; CELU intermedio → 'B2'. Falsos positivos descartados (unpaz, UNS, UNL).
+ Universidades: **`graduationRate` + `avgGraduationYears` (clave nueva) — known gap documentado** (decisión del usuario): research exhaustiva = NO existe fuente pública per-universidad en Argentina para "egreso en tiempo teórico" ni "duración real promedio". Solo cifras nacionales (26,6% grado 2023 / 25,1% 2022 / 29,6% 2021). Schema: `avgGraduationYears` en STAT_KEYS (13, rango 1-20), 24 filas null explícito → TODO.md §2.6.
+ Universidades: **UNRN registrada** (Medicina Sede Andina, San Carlos de Bariloche; Plan 2021 Res. ME 350/22, 6 años, 143 alumnos Cuadro 2.1.16 SPU, dist. capital 1346 km haversine).
+ Universidades: **ficha + "📋 Mostrar en la tabla" en el modal del mapa** — "📊 Datos de la tabla" (10 columnas con formateos y tooltips) + enlace que cierra el modal, enfoca y hace scroll suave a la fila con pulso cian (`scrollToUniversityRow()`, reverso del 📍). Modal `max-height:85vh` + scroll.
+ Universidades: zoom adaptativo del 📍 (criterio KM): distancia a capital ≤100km (cluster CABA/GBA/La Plata) → z9; aisladas → z8 — pins vecinos visibles sin zoom-out.
+ Universidades: control **⤢** en el mapa (debajo de +/-) — `fitBounds` a todas las universidades.
+ Universidades: botón **Filtrar** encima de la tabla (estilo e-commerce, solo sesión) — 5 sliders de doble puño en una sola pista (costo vida, alumnos, extranjeros, ranking, dist. capital; límites por los valores reales de la tabla y valor visible; **ranking con eje invertido: #1 a la derecha**) + checkboxes español/método **marcados por defecto — desmarcar excluye** (opción "—" = sin dato); contador "X de 24" + "Limpiar filtros"; slider movido oculta las filas "—"; **el mapa refleja el filtro: pins fuera del requisito se atenúan (25%)**; compatible con el ordenamiento.
+ Tabla: 12 columnas ordenables (Universidad, Ciudad, 10 métricas) — ciclo 3 estados asc→desc→orden original, nulls siempre al final, indicador ▲/▼ + aria-sort.
+ Universidades: contraste de texto de la tabla mejorado (WCAG AA) — th/-ciudad/-metric de `--text-dim` (3.3:1 FAIL) a `--text-muted` (6.7:1) + `tabular-nums` en métricas; `--text-faint` para celdas "—".
+ README: sección **"Licencia y Uso"** — código abierto para uso PERSONAL, compartir/copiar CON créditos, comercialización PROHIBIDA. + sección "Otras Universidades — Fuentes de investigación" (veredictos de existencia, rankings, Cuadro 2.1.16, Hornero, Numbeo sin margen, fuentes bloqueadas).

### Changed
+ Universidades tabla: simplificada — Universidad solo sigla (nombre completo en hover), Ciudad solo región abreviada; 10 columnas de métricas; scroll horizontal con primera columna sticky.
+ Universidades mapa: maxBounds ampliados + `maxBoundsViscosity` 0.35 + `dragging: { inertia: false }` — el límite anterior frenaba el arrastre vertical.
+ Tabla: scroll VERTICAL interno eliminado (la tabla extiende la página); cabecera sticky bajo el navbar ≥1250px. Fix transbordo del header (causa raíz doble): (1) base.css da al body `margin: 12px 12%` — la página perdía 24% de ancho → body de la página a `margin: 12px 0` (solo HOME a ancho completo) y (2) el trim de padding ≥1250px se movió después de las reglas base th/td (empate de especificidad). **Vista de PLANES conserva las márgenes del Modo Árbol** (`#uniTreeView { margin: 0 12% }` ≥769px).
+ Universidades: **UNR reestructurada en BLOQUES/ciclos** (estructura del usuario, digraph « Plan de Estudios 2001 »): 5 secciones SIN `anio` (Ciclo de Promoción, Área Instrumental, Prevención, Diagnóstico, Práctica Final), 20 materias, 42 conexiones SVG = exactamente el digraph. Render de bloques: `uni-year-header` muestra SOLO la `etiqueta` cuando falta `anio`; modal 📅 usa `stats.careerYears`.
+ Universidades: duración « anual/cuatrimestral/bimestral » oculta cuando falta — no se crea el span `.uni-node-duracion` sin `materia.duracion`.
+ Universidades: planes sin correlativas (simplified) pierden toda interacción de selección — cursor default + hover neutralizado vía `.is-simplified` en `#uniTreeContent`. Planes FULL conservan selección + estado.
+ Universidades: columna **"% Intern." → "Extranjeros"** en tabla, ficha del modal y slider de filtros.
+ Universidades: **contador de visitantes en el navbar** — badge « 🟢 online/hoy » (mismo worker + clave `visitorSessionId` que nav.js) en HOME y PLAN; heartbeat 30 s.
+ Universidades: **texto y espacio sobre el mapa eliminados** — header `.uni-header`/`.uni-subtitle` removido; el mapa arranca debajo del navbar.
+ `livingCostUsd` sin margen ×1.2 (decisión del usuario): UBA 1545, UNLP 700 — alquiler + gastos Numbeo puro.
+ Universidades: **unvime facultade corregida** → "Escuela de Medicina" (sitio oficial) + careerYears 6 (Plan R.R. 822-2018). unchaus facultade confirmada (resoluciones oficiales DCBA); unlar provisional (sitio caído en ambas redes).

### Removed
+ Otras Universidades: **UNFV y UNMoreno removidas** — UNMoreno sin Medicina en oferta oficial (unm.edu.ar); UNFV = institución fantasma (proyecto absorbido por la UNAJ en 2009, wiki 404). UNSAdA evaluada y NO registrada (oferta oficial sin Medicina). Total: 24 universidades, validador 0 errors.

### Fixed
+ Universidades: el mapa pasaba por ENCIMA del navbar fijo al scrollear (panes internos de Leaflet: z-index hasta 800 vs navbar z100). Navbar ahora a z-index 1000; el modal sigue por encima (z2000).
+ Universidades: corrección factual en `ingresoNota` UNC — decía "Sistema Cardiovascular I y II"; las materias reales del 1er año son **Salud Comunitaria I y II**.
+ Universidades: flechas parpadeando al seleccionar materias — llamada duplicada de `applyUniSelectionVisuals()` en `selectUniNode()` (disparaba la transición sobre paths viejos). Eliminada la duplicada + removida la `transition` de `.uni-connection-line`. Verificado: 0 mutaciones del SVG en reposo.
+ Finales monitoring system (`worker.js`): automated detection of exam date changes from the official UNLP HTML table. `parseFinalesHtml()` → subject→dates map; `checkFinales()` fetches → hashes → diffs → admin email. Cron: 1st/15th via `scheduled` handler. KV snapshot `finale-snapshot`. Endpoints: `GET /test-finales`, `POST /test-finales-send`. + `FLOW/finals-cycle.dot` process map.
+ Finales data: merged 8 split entries in `finales.json` (GE001, IM001, IMD01, NEUAT, LCM01, H0001, F9002, IAA01). Renamed T0100 generic → "Regular". Removed misplaced Nutrición Clínica from BC002.
+ Finales inline display: optativas show correct label ("Libre:"/"Regular:") based on `catedrasSeleccionadas`; click toggles modalities inline. 3-day registration filter. Set-based dedup when Regular+Libre share dates. Removed dead `!== 'Regular'` guards.
+ Visitor counter daily dedup now **per device (IP)** instead of per browser session (`worker.js` `/heartbeat`). Race condition fixed: serialized via Cache API lock (`max-age=5s`) keyed on `ip+date`. `ADMIN_IPS` → `['192.168.0.27', '190.17.188.134']`. Session IDs no longer use `'admin-'` prefix (IP-based detection via `cf-connecting-ip`). `visitorSessionId` moved from `sessionStorage` to `localStorage` (same device counts once/day).
+ iPhone CSS: `max-height: 9999px` in `.sub-content`/`.box-content` collapse (iOS clipping); `100dvh` fallback in video overlay; `overflow-x: hidden` before `clip` in `base.css` (iOS < 15.4); removed global `user-select: none`; `touch-action: manipulation` moved from global to interactive elements only (`cartelera.css`).

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
+ Tree Mode: "Ver optativas" button repositioned entre Zoom e Cartelera (CSS order: zoom=3, toggle=4, cartelera=5). Legend fully restored — ordore Colores/Flechas conforme spec, itens Cursando, Próximas materias a liberar, ⭕ No puede final, toggle Abreviar nomes; Flechas: Cumplido, Puede cursar falta final, Falta Cursada, Falta Final); botão voltar "← Modo Lista"; botão Cartelera "📋 Cartelera"; toggle switch horizontal unificado (desktop 28px / mobile 37px, slider 28×14px); fix overlay z-index legenda mobile; fix media query CSS mobile malformada.
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
+ Added `nombreCorto` property to all subjects (obrigatória + optativa) in `APP/materias.js`.
+ Added "Abreviar nomes" toggle switch in legend panel with localStorage persistence (`arbolAbbreviateNames`).
+ Increased font-size by ~30% (10px→13px desktop, 8px→11px mobile) when abbreviated mode is ON.
+ Disabled text selection (`user-select: none`) and touch callouts on `.subject-node`.

### Changed
+ Device detection now capability-based: `isMobileDevice()` and help-modal `isMobile` use `!matchMedia('(hover: hover) and (pointer: fine)').matches`; CSS hides action buttons via `@media (hover: none) and (pointer: coarse)`. PC com mouse/trackpad mantém botões PC (hover) vs mobile (FAB click-hold).

### Fixed
+ Button Regularizar wrong color: `arbol.js` used Unicode escape `\uD83D\uDFE8` (🟨) invece de `\uD83D\uDFE7` (🟧) em L259 (botão do nó) e L1426 (modal de ajuda). Grep por emoji literal não detectou escapes. Corrigido 🟨→🟧 em diagramas FLOW também.

### Removed
+ Dead `NAME_ABBREVIATIONS` dictionary (unused, tinha chaves em inglês) de `arbol.js`; excluídos arquivos residuais não rastreados `arbol.js.backup` e `Nomes abreviados.md`.

## [0.02] — 2026-08-14

### Fixed
+ Cartelera page agora mostra publicações editadas mesmo se a data de publicação original for antiga. Filtro de data usa `(p.modificadaDate || p.date) >= cutoff` (última data de edição priorizada, caso contrário data de publicação). Corrige assimetria com e-mail (o trabalhador detecta modificação por snapshot de título+data+modificado, mas a página oculta filtrando a data original). Aplicado em `render()` L1096, `allVisibleRead()` L385, `marcarTodasLeidas()` L414/424, e sorteo por assunto L1099.

## [0.01] — 2026-08-11

### Changed
+ Notificação cron atualizada: 1x/dia às 8h → 3x/dia às 9h/13h/19h ART (`0 12,16,22 * * * UTC`). Corrige problema onde publicações que aparecem após as 8h são detectadas apenas no próximo dia.
+ Worker redeployado: vfc35c8bd

## [0.00] — 2026-08-07

### Added
+ Restrição de e-mail de boas-vindas (`worker.js`): e-mail de boas-vindas inicial agora filtra publicações às últimas 5 dos últimos 12 meses (`pubsFromLastMonths` auxiliar + `parsePubDate`), evitando inundação por publicações antigas.
+ Funcionalidade "Receber novedades de": adicionadas guias Obrigatorias/Optativas, agrupadas por ano com divisores. Modal redesenhado com botões de tabBar `.subscribe-tab.active` (roxo #a855f7), `renderSubjectGroup()` ordena por ano + insere `.subscribe-year-divider`, seleção de checkbox persiste em `localStorage.carteleraSubscribedSubjects`. Correção: botão de salvamento consulta `content.querySelectorAll` (ambas as guias) em vez de nenhum existente `body`. CSS: `.subscribe-tab-bar`, `.subscribe-tab`, `.subscribe-tab.active`, `.subscribe-year-divider` + mobile min-height/tamanho.
+ Funcionalidade "Receber novedades de": novo botão 📬 nos controles do Cartelera, modal com caixas de seleção para todos os assuntos com disponibilidade de cartelera (`resolveCatedraParaCódigo`), armazenado em `localStorage.carteleraSubscribedSubjects`, integrado em `resolveAndFetch` (fonte="subscrito") e `populateNotifySubjects`. "Assinaturas extra" no modo de assunto, "Inscrição" no selo no modo cronológico. CSS: `.subscribe-modal`, `.subscribe-subject-label`, `.btn-subscribe` (roxo #a855f7), `.source-header-subscrito`, `.pub-source-subscrito`.
+ Detecção de publicação editada (`worker.js`): `parseCatedraHtml`/`parseHomeHtml` extraem campo `modificado` via regex. Comparação de snapshots em `scheduled()` agora inclui `s.modified === p.modified`. Novo endpoint `/test-edits` para diagnósticos. Cliente (`APP/cartelera.js`): interpreta `modificadaDate` (objeto Date), renderiza selo "🔄 Atualizada DD/MM/YYYY HH:MM" (`.pub-modificada-badge`), `isLeida`/`marcarLeida` com marca de modificação — se publicação editada após leitura, ela reaparece como não lida. Retrocompatibilidade com formato booleano. CSS: `.pub-modificada-badge` (laranja itálico).
+ Novas funções: `getSubscribedCodes`, `saveSubscribedCodes`, `formatDateTime`, `openSubscribeModal`, `closeSubscribeModal`.
+ Novo localStorage key: `carteleraSubscribedSubjects`.
+ Novo formato de `carteleraLeidas`: `{read: true, mod: "DD/MM/YYYY HH:MM"}` (retrocompatível com booleano `true`).
+ Redesenho de card: tipo de marca movido para recipiente como pílula, data única (modificada se existir, senão original), botão "lido" na parte inferior direita, estado lido oculta todas as marcas. CSS: removido `.pub-tag` isolado, `.pub-details-row`, `.pub-modificada-pill`; novos `.pub-tags-row`, `.pub-date-modified`.
+ Renomear "Suscrição" → "Otras" (`cartelera.js` — 3 rótulos: cabeçalho do grupo de fonte, selo crono, nota do modal de inscrição).
+ CSS de hierarquia de cards do Cartelera: `.pub-title` 15px branco bold 600 line-height 1.3 (+ mobile 13px→15px).
+ `.pub-subject-name` sempre visível em cards lidos (removido de `.pub-read display:none` list), dimmed #666 quando lido.
+ `.pub-subject-name` tamanho de fonte 12px→13px.
+ `.pub-read .pub-title` dimmed #888 peso 400.
+ Cor da fonte de assinatura subscrita roxo #a855f7 → âmbar #f59e0b (cabeçalho + selo).

### Corrigido
+ Corrigido PG001 (Psicologia Médica, ano 2): `paraCursar` vazio → adicionado `[{materia:"A0001",condicion:"regularizada"}]`. PG001 era o único obrigatório do ano-2 sem pré-requisito para matricular.
+ Aviso de privacidade: corrigido relâmpago no PC — banner começa com `display:none`, o script de recarga automática de versão mostra o banner após confirmar nenhuma recarga; anti-loop (`lastReloadAttempt` 3s) evita recarga infinita por cache.

### Alterado
+ Aviso de privacidade convertido em barra flutuante com botão X (reaparece na recarga).
+ Modal "Como usar" reescrito: 1 página, 9 itens curtos, sem paginação.
+ Correção do FAB mobile: posicionamento via CSS left/right (removido cálculo de pixels em JS), overflow eliminado.
+ Alternar Cursando na página principal: sincronizado com localStorage, fundo ciano sutil, afeta barra de progresso.
+ Subtilhover em itens da lista em desktop (`rgba 0.03`).

## [0.00-beta] — 2026-08-03

### Adicionado
+ Cartelera: publicações gerais da faculdade (`cartelera.med.unlp.edu.ar/`) agora aparecem na página do Cartelera e nas notificações por e-mail.
+ Página principal: nova seção roxa "🏛 Avisos Generais da Faculdade" — sempre visível, topo do modo "Por matéria" (grupo de casa colapsável, `.source-header-home` roxo #a855f7) com selo "Gerald" (`.pub-source-home`) no modo "Cronológico". Mesmo com 0 assuntos ativos, a casa é renderizada. Novas constantes `HOME_KEY="__HOME__"`, `HOME_ID="home"`, `HOME_LABEL="Avisos Generais da Faculdade"`. `parseHomeHtml()` analisa `card.card-outline-success`. `resolveAndFetch()` sempre anexa `{codigo:HOME_KEY, id:'home'}` e roteia `fetch ?id=home → parseHomeHtml`. `renderHomeGroup()` primeiro no `renderSubjectMode()`. CSS: `.source-header-home`, `.pub-source-home`, `.pub-tag.tag-general`, `.notify-home-label`. Arquivos: `APP/cartelera.js`, `APP/cartelera.css`, `cartelera.html`.
+ E-mail (trabalhador): `/subscribe` aceita `{email,codes,names,home}` (padrão false), KV `{codes,names,home}`; se home → `fetchHomePubs` + snapshot KV 'home' + boas-vindas inclui `buildHomeEmailSection` (fatia 5). Cron `scheduled()`: constrói `homeEmails[]` (subs com home:true), após o loop de cátedras busca home 1x, difere vs snapshot 'home', envia todos (tente/pegue, assunto "Nova publicação geral na Faculdade - Cartelera UNLP"), atualiza o snapshot apenas se ≥1 e-mail OK. Proxy `?id=home` → raíz `https://cartelera.med.unlp.edu.ar/`. `/test-cron` inclui diagnósticos de home. Auxiliares: `parseHomeHtml`, `fetchHomePubs`, `buildHomeEmailSection`; `buildWelcomeHtml(catedraPubs,names,homePubs)`.
+ Sincronização de assuntos↔cátedras: adicionadas 6 falhas a `CARTELERA_FALLBACK_CATEDRAS` (HG001→Saúde Pública, C2001→Cirurgia B, BG008/BG013→Biologia, EDS13→Educação para a Saúde, PINV→Seminários de Pesquisa Científica).
+ Filtros do Cartelera: intervalo padrão 365→90 dias; campo personalizado `#daysInput` com sufixo "dias"; novo `syncFilterUI()` centraliza o destaque. Intervalo personalizado ativo em ciano #22d3ee. Arquivos: `cartelera.html`, `APP/cartelera.js`, `APP/cartelera.css`.
+ Corte do Cartelera +3: o intervalo de filtro usa `currentDays+3` invisível (por exemplo, 30→33) para garantir visibilidade de publicações pré-weekend.
+ Grelha de cards do Cartelera: as publicações são renderizadas em grelha CSS (`grid auto-fill minmax 260px`) para melhor uso de espaço em desktop. Envoltórios `.cards-grid` em `renderSourceGroup`, `renderHomeGroup`, `renderChronoMode`.
+ Sistema automático de recarga silenciosa via `version.json`: detecta nova versão, recarrega a página automaticamente (localStorage sobrevive à recarga). 4 arquivos: `version.json` + script inline em `index.html`, `arbol.html`, `cartelera.html`.

## [alpha] — 2026-07-14

### Corrigido
+ FAB mobile (touch-and-hold) posicionado incorretamente fora dos limites da tela em Modo Árbol. Causa raiz: `createFAB` mediu `fabContainer.getBoundingClientRect()` dentro de `requestAnimationFrame` enquanto o `fabSlideIn` animation estava no frame inicial (`transform: scale(0.7)`), retornando ~70% da largura real → deslocamento para a direita e o aperto de borda não detectou overflow. Correção: use `offsetWidth`/`offsetHeight` (dimensões de layout, ignora transformações), reordene o aperto (borda direita primeiro, depois `left>=8` para nunca negativo), adicione `flex-wrap`/`justify-content:center`/`max-width:calc(100vw-16px)` em `.mobile-fab-container` como rede de segurança.
+ Sobreposição de desfoque da lenda no PC: `@media (min-width:769px)` oculta `.tree-legend-overlay`/`.visible` com `display:none!important` — a sobreposição (z-index:1000, backdrop-filter:blur) cobria a lenda (z-index:100) no desktop.

### Alterado
+ Modo Árbol móvel: interruptor "Ver matérias optativas" redesenhado como botão (borda #444, padding 4px 8px, borda-radius 4px, altura mínima 37px) — slider vertical menor (44×24px→18×28px, manípulo 20×20px→14×14px, `translateX(20px)`→`translateY(12px)`), rótulo 11px→10px.
+ Modo Árbol móvel: alturas dos botões reduzidas 15% (`altura mínima 44px→37px` em botões de voltar/da lenda/do Cartelera/do ajudar; botão de controle de zoom 44×44px→37×37px).
+ Modo Árbol de área de trabalho: interruptor "Ver matérias optativas" redesenhado como botão também no PC (borda #444, padding 4px 8px, borda-radius 4px, altura mínima 37px, slider vertical 18×28px, manípulo 14×14px, `translateX`→`translateY(12px)`) + CSS unificado (removidos duplicados `.toggle-slider`/`.toggle-slider::after`/`:checked` sobrescritos).
+ Barra superior do Modo Árbol móvel compactada verticalmente: `gap 6px→4px`, `padding 8px→4px 6px`, `tamanho da fonte do h1 14px→13px`, `tamanho da fonte do botão de voltar 13px→12px + padding 8px 12px→6px 10px`.
+ Gestão de gesto de pinçar-para-ampliar (2 dedos) no Modo Árbol móvel: touchstart captura a distância inicial + o zoom base, touchmove calcula a razão e ajusta o `currentZoom` com clamp (`ZOOM_MIN..ZOOM_MAX`), chama `applyZoomTransform` e `updateZoomDisplay` em tempo real, touchend reconfigura o SVG. Cancela o long-press FAB se 2 dedos estiverem ativos.
+ Botões de zoom + e − ocultos em dispositivos móveis (CSS `nth-of-type display:none`), reset ⟲ e % indicador permanecem visíveis.

### Corrigido
+ Correção do FAB: remova o CSS `translateX(-50%)` de `.mobile-fab-container` + os keyframes de `fabSlideIn` — o JS já trata o centralização com verificação de limites, o CSS estava causando centralização dupla.
+ Correção da rolagem: a tentativa de correção revertida (`scrollHeight × zoom`) quebrou a rolagem inteiramente — `transform:scale()` restaurada sem correção de altura, o problema de espaço vazio permanece pendente.
+ REVERTIDO: rolagem de toda a página no Modo Árbol — revertido para o sistema original (rolagem em `.tree-wrapper`, barra superior fixa, `html/body overflow-x:hidden`, `.tree-page overflow:hidden height:100vh`, `.tree-wrapper overflow:auto flex:1`) — sistema original de rolagem/zoom do commit `0f7ccdc` restaurado.
+ Corrigido nome duplicado do assunto no campo de datas-proximas (`app.js`: removido o prefixo `materia.nome` + `catedraSel` que causava a exibição dupla).
+ Redesenhado o botão "🗓 Ver Fechas": de quadrado 44×44px (ícone-only) para pílula compacta (padding 6px 10px, borda-radius 20px, fonte 12px, espaço 4px, espaço em branco não quebrado) + `aria-label` de acessibilidade.
+ Botão "🗓" → "🗓 Ver Fechas" em todas as ocorrências.

## [alpha-2] — 2026-07-07

### Adicionado
+ Móvel: toque-e-manter FAB (400ms de pressão longa, 10px de limiar) com sobreposição escura e botões contextuais.
+ Botão de ajuda "❓ Como usar" na barra superior com modal consciente do contexto (desktop=passar o mouse, mobile=pressionar por muito tempo).
+ Lenda redesenhada: seções "Cores" (8 itens) + "Setas" (5 itens), botão de fechamento ×, sobreposição de fundo.
+ Animação de flash da lenda (vermelho+branco brilho 2s) dispara a cada fechamento (auto-ocultar, X, sobreposição).
+ Melhorias do FAB: 58px, recipiente transparente, 🔛/🟦 troca de estado de cursando.
+ Rótulo do alternador: "Ver matérias optativas".
+ Barra superior móvel: layout de 3 linhas com ordem CSS.
+ CSS: `esquema-de-cor escuro`, `sobrescroll-comportamento`, `ação-de-toque`, `preferir-reduzir-movimento`.
+ Móvel: botões de ação (✅🟧🔄) substituídos por toque-e-manter (400ms de pressão longa) de botões de ação flutuante (FAB) com sobreposição escura.
+ O FAB aparece acima do nó com botões contextuais (Aprovar/Regularizar/Resetear/Cursando) baseados no estado atual.
+ Toque na sobreposição ou clique fora fecha o FAB.
+ Botões do FAB 58×58px (alvos de toque ≥44px), animação de deslizamento para dentro.

### Alterado
+ Barra superior reorganizada em 3 colunas: [Vacunas, Modo Árbol] | [Ano de ingresso] | [Como usar?, ⚠️ Resetear].
+ Botão Resetear com hold-to-confirm: 1,5s com barra de progresso animada (CSS ::after + transição), reset apenas após a animação ser concluída.
+ Título h1 centralizado (`text-align: center`).
+ Plano de estudo atualizado de 2004 para 2023 no título.

### Corrigido
+ Correção do plano de estudo (RM 578/25): DL001 Deontologia, TX001 Toxicologia, P9002 Psiquiatria II movidos do ano 4 para o ano 5 (5º ano obrigatório segundo o plano oficial).
+ Bug crítico: o snapshot estava sendo atualizado mesmo quando o e-mail falhava → publicações perdidas para sempre. Correção: flag `anyEmailSent`, atualiza o snapshot apenas se pelo menos 1 e-mail for enviado com sucesso; se todos falharem, registre + tente novamente no próximo cron.

## [alpha-1] — 2026-06-30

### Adicionado
+ Notificações por e-mail melhoradas: nomes dos assuntos em vez de "ID da Cátedra" (mapa de nomes enviado pelo cliente, armazenado no KV junto com os códigos).
+ Cliqueável links para cada publicação nos e-mails (boas-vindas + cron): `parseCatedraHtml` extrai `href` do `<a>` no título da card.
+ Link para cancelar inscrição nos e-mails: aponta para `https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html`.
+ Botão "Remover meu e-mail" no modal: hold-to-confirm 1s (CSS progress bar), chama `POST /unsubscribe`, limpa o localStorage.
+ Formato do KV alterado: `[codes]` → `{codes, names}` (retrocompatível em `scheduled()` trata ambos os formatos).
+ Revisão encontrou 5 bugs + 1 bug crítico. Aplicou 5 correções: (1) guarda de tipo para e-mail, (2) tenta/pega proxy fetch, (3) verifica `response.ok`, (4) guarda de `catedrasLoaded`, (5) `AbortController` 15s de timeout.
+ Bug crítico: `parseCatedraHtml` usou `DOMParser` (API exclusiva do navegador) nos Workers do Cloudflare → falha silenciosa, e-mails nunca enviados. Reescrito com analisador de regex.
+ `.gitignore`: adicionado `.wrangler/`.
+ Worker redeployado `v8a894969`, teste `/subscribe` confirmou `welcomeEmailSent:true`.
+ URL correta do Worker: `https://cartelera-proxy.felipestesta.workers.dev`.

### Alterado
+ ⚙ "Alterar cátedras" movido para dentro do `<h3>` (APP/cartelera.js + APP/cartelera.css): botão agora inserido dentro do `<h3>` do título do assunto (não depois), usando `flex` + `margin-left: auto` para alinhar à direita. Mesmo comportamento: visível apenas se >1 opção de cátedra, `e.stopPropagation()` no clique.
+ `/subscribe` alterado de MERGE → OVERWRITE (`worker.js`): antes, `{email, codes}` mesclava novos códigos com os existentes — o usuário não podia remover assuntos. Agora `POST /subscribe` substitui completamente a lista de códigos — desmarcar a caixa de seleção remove o assunto da assinatura.
+ E-mail de boas-vindas no `/subscribe` (`worker.js` + `cartelera.js`): ao confirmar no modal, `/subscribe` agora: (1) salva a assinatura no KV, (2) busca as últimas 5 publicações por cátedra, (3) envia e-mail de boas-vindas com essas publicações, (4) inicializa o snapshot no KV com as publicações atuais (evita inundação na primeira cron). Nova função `buildWelcomeHtml()`.
+ Refatoração do Worker: auxiliares compartilhados extraídos (`parseCatedraHtml`, `fetchCatedraPubs`, `sendEmail`, `buildWelcomeHtml`) usados tanto por `/subscribe` quanto por `scheduled()`.
+ O snapshot armazena o array COMPLETO de publicações: antes armazenava `pubs.slice(0, 5)` (apenas as primeiras 5) — causava falsos positivos quando a pub #6 era nova, mas as #1-#5 estavam no snapshot. Agora armazena o array completo.

### Corrigido
+ `escapeHtml(str)`: função de sanitização aplicada aos IDs de cátedra nos links e no conteúdo de e-mail (prevenção de XSS através de nomes de cátedra maliciosos).
+ Validação de e-mail por regex + normalização para minúsculas: e-mail validado por regex antes de salvar no KV; convertido para minúsculas para evitar duplicatas (a@B.com vs A@b.com).
+ Cabeçalho CORS em erro do proxy: resposta de erro do proxy `?id=` (sem parâmetro) agora inclui `Access-Control-Allow-Origin: *` para evitar CORS no frontend.
+ `try/catch` individual por e-mail em `scheduled()`: cada e-mail processado em um try/catch individual — falha em um e-mail não interrompe o lote (outros assinados ainda recebem notificações).
+ `Promise.allSettled` busca paralela em `/subscribe`: busca de publicações de cátedra usa `Promise.allSettled` em vez de sequencial — reduz o tempo total e evita o timeout do Worker (30s de limite).

## [alpha-0] — 2026-06-29

### Adicionado
+ ⚙ "Alterar cátedras" por assunto (`APP/cartelera.js` + `APP/cartelera.css`): novo auxiliar `getCatedraOptionsParaCódigo(código)` retorna as opções de cátedra sem auto-seleção ou mutação do localStorage. Novo `openCatedraSelectorParaCódigo(código)` reabre o seletor de cátedra para o assunto específico, adiciona "✕ Fechar" e rolagem suave até `#catedraSelector`. A injeção do botão em `renderSubjectMode()` ocorre após o título do assunto (se houver >1 opção de cátedra), com `e.stopPropagation()` para evitar o colapso do h3.
+ Notificações por e-mail — Worker Cron + Resend (`worker.js` + `wrangler.toml` + `cartelera.html` + `APP/cartelera.js` + `APP/cartelera.css`): `worker.js` ampliado (179 linhas): mantém o proxy existente `?id=` intacto; adiciona o manipulador `scheduled(event,env,ctx)` (Cron 1x/dia às 8h) que lê as assinaturas do KV `CARTELERA_SUBS`, busca cada cátedra, compara com o snapshot no KV `CARTELERA_SNAPSHOTS` (últimas 5 pares de título+data), envia e-mail via Resend API se houver nova publicação, atualiza o snapshot. Novas rotas: `POST /subscribe` (salva `{email, codes:[...]}` no KV), `POST /unsubscribe` (remove), `GET /health`, com CORS pré-voo (OPTIONS). try/catch: falha no e-mail não atualiza o snapshot (retry no próximo cron). `wrangler.toml`: cron `0 8 * * *`, 2 KV namespaces (CARTELERA_SUBS, CARTELERA_SNAPSHOTS). UI em `cartelera.html`: botão 🔔 Notificarme na barra de controles + modal com entrada de e-mail + caixas de seleção para assuntos ativos. `APP/cartelera.js`: `populateNotifySubjects()`, `openNotifyModal()`, `closeNotifyModal()`, `handleNotifySubscribe()` + persistência de e-mail em `localStorage.carteleraNotifyEmail`.
+ Falhas do Cartelera: adicionadas `CARTELERA_FALLBACK_CATEDRAS` para SEM91 (Medicina Interna D/E/F) e P9001 (Psiquiatria I) quando ausentes de `finales.json`.
+ Botão "👁 lido": cada publicação tem botão que a marca como lida, colapsa o card e persiste o estado em `localStorage.carteleraLeidas`.
+ Botão "👁 todas lidas": barra superior, marca todos os atualmente visíveis como lidos.
+ Seções colapsáveis: cabeçalhos "Cursando" e "Regularizada" clicáveis com ▾/▸ indicador, estado persistido em `localStorage.carteleraCollapsed`.
+ Nomes no modo cronológico: o modo cronológico agora mostra o nome do assunto via `getSubjectName()` (carrega de `materias.js`).
+ Assuntos regularizados incluídos no Cartelera: `getRegularizadaCodes()` lê os assuntos com status `"regularizada"` em `localStorage.estados`. `resolveAndFetch()` agora combina os assuntos de cursando + regularizados, com precedência de cursando > regular. Modo de assunto: cabeçalhos de grupo coloridos — Cursando no ciano (#22d3ee), Regularizada no laranja (#f97316). Modo cronológico: cada card mostra a selo de origem (Cursando / Regularizada) com a cor correspondente. `cartelera.html`: o seletor de cátedra e o timeline agora incluem ambas as fontes.

### Corrigido
+ Falha do SEM91 expandida de 3 para 6 opções: Medicina Interna A, B, C, D, E, F.
+ O seletor de cátedra agora mostra o nome do assunto via `getSubjectName()` em vez do código.
+ Botão "👁 todas lidas" agora alterna: 1º clique marca todos os visíveis como lidos, 2º clique desmarca (texto alternates entre "lidas" e "não lidas").
+ Filtros de data (365d/30d/7d) persistem em `localStorage.carteleraFilterDays`.
+ Cada assunto pode ser individualmente colapsado no modo "Por materia" (clique h3 ▾/▸), persistido em `localStorage.carteleraCollapsedSubjects` como `{CODE: bool}`.
+ Bug de Semiologia: `resolveCatedraParaCódigo` agora faz a cadeia de falhas quando o nome da cátedra selecionada não resolve (em vez de retornar um erro que ocultou o assunto).
+ O seletor de cátedra não fecha automaticamente na renderização — `render()` não oculta mais `selectorEl`. Apenas `resolveAndFetch` gerencia a visibilidade.
+ Guarda de `catedrasLoaded`: o botão de atualização é bloqueado até que `finales.json` seja carregado.
+ `render()` sai antecipadamente agora verifica `anyErrorOverall` (não apenas `anyPubOverall`) — mensagens de erro são renderizadas em vez de genéricas vazias.
+ `renderCatedraSelector` usa `btn.dataset.catedra` (auto-decodifica entidades HTML) em vez de `getAttribute`.
+ `fetchCatedra` com `AbortController` 15s de timeout (nenhum girador infinito).
+ `console.log` removido do código de produção.

### Alterado
+ Filtro de data do Cartelera padrão 365→90 dias; campo personalizado `#daysInput` com sufixo "dias" (`.filter-days-wrap`/`.filter-days-suffix`); novo `syncFilterUI()` centraliza o destaque (botão pré-definido 60/30/7 OU envoltório `.filter-days-wrap.active` em ciano #22d3ee quando o intervalo personalizado está ativo).
+ Grelha de cards do Cartelera: as publicações são renderizadas em grelha CSS (`grid auto-fill minmax 260px`).

## [initial] — 2026-06-14

### Corrigido
+ Flash de seta SVG: removida a transição CSS `opacity 0.3s` em `svg path.connection-line` — as setas aparecem instantaneamente ao clicar, sem flash.
+ Manipulador de rolagem do Modo Árbol: removido `updateSvgDimensions()` do manipulador de rolagem (a rolagem não altera as dimensões, apenas chama `drawConnections()`).
+ Tree Mode `selectNode`: removido o `applySelectionVisuals()` chamado nos caminhos antigos que seriam destruídos — elimina o flash duplo.
+ Tree Mode `drawConnections()`: agora preserva o `<defs>` no SVG ao limpar os caminhos (remove apenas `path.connection-line`, não todos os filhos).
+ Tree Mode `selectNode`: adicionado `requestAnimationFrame()` para recálculo imediato do SVG + `setTimeout(300ms)` para correção pós-expansão.
+ Tree Mode `deselectAll`: substituído por `setTimeout(250ms)` por `requestAnimationFrame()` para recálculo imediato do SVG.
+ Tree Mode CSS: adicionado `transition: none` em `.subject-node.selected .node-actions` — os botões aparecem instantaneamente ao clicar.
+ Tree Mode móvel: adicionado `margin: 0 2px 8px 2px` em `.subject-node` para espaçamento vertical entre cartas.

### Alterado
+ Modo Árbol móvel: os botões de ação (✅🟧🔄) agora estão ocultos por padrão (`opacity: 0`, `max-height: 0`). Aparecem apenas quando o cartão é `.highlighted` (selecionado/tocado) com transição suave. Lógica equivalente ao hover do desktop, adaptada para toque.

## [initial-mobile] — 2026-06-14

### Corrigido
+ Retrato móvel do Modo Árbol: `.node-content` agora usa `flex-direction: column` (como desktop) em vez de `row` — as cartas são verticais: nome no topo, informações abaixo.
+ Removido `text-overflow: ellipsis`, `white-space: nowrap`, `overflow: hidden` — o texto envolve naturalmente com `word-wrap: break-word`.
+ `.node-meta` com `flex-wrap: wrap` para sub-informações que necessitam de quebra de linha.
+ Zoom de retrato aumentado de 55% para 65% para melhor legibilidade.
+ As cartas mantêm a compactação lateral (`min-width 65px`, `max-width=110px`) mas crescem verticalmente.

### Alterado
+ Retrato móvel compacto: `.subject-node` não empilha mais em `flex: 1 1 100%` — agora usa `flex: 0 0 auto` com `min-width 65px` e `max-width=110px`.
+ Novo `@media (max-width: 768px) and (orientation: portrait)` aplica `transform: scale(0.55)` no `.tree-zoom-container`.
+ Cartas móveis: nome 8px (ellipsis), meta 7px, botões 28px, padding compacto.

## [initial-states] — 2026-06-12

### Adicionado
+ `removeSubjectState()` (`arbol.js`): ao resetar um assunto (botão 🔄), o estado correspondente de `cursando` também é removido do localStorage.
+ `resetearTodos()` (`app.js`): ao resetar todos os estados (botão da página principal), a chave `cursando` também é removida do localStorage.
+ `getConnectionVisualStyle()`: nova função que substitui `getLineColor()` — avalia `paraCursar` E `paraAprobar` simultaneamente. 4 estados visuais: (1) Cinza #666 sólido: não pode se matricular, faltando cursada; (2) Branco #ffffff sólido: não pode se matricular, faltando final; (3) Verde #22c55e tracejado: pode se matricular mas não pode fazer o final; (4) Verde #22c55e sólido: pode se matricular e fazer o final.

### Alterado
+ Lenda restaurada: "Cursando (ON)" com degradê ciano e brilho. Removido o botão duplicado "📖 Cursando" da legenda-botoes.
+ `initTree()` agora oculta `optLabel` (`display:none`) quando o alternador Optativas=OFF. Antes, apenas a linha `.subjects-row.optativas` era ocultada, o rótulo "Optativa" permanecia visível.
+ Refatorado `drawConnections()`: coleta e armazena ambos os requisitos (paraCursar + paraAprobar) por conexão. Dois passos: paraCursar primeiro, depois paraAprobar (merge no mesmo objeto). Cada conexão usa `getConnectionVisualStyle()` retornando `{ color, dashed }`.

### Corrigido
+ Posicionamento do alternador de Cursando (`arbol.css`): adicionado `order: -1` em `.node-cursando-toggle` para posicionar à esquerda dos botões de ação.
+ Cores das setas paraAprobar (`arbol.js`): refatorado `drawConnections()`: coleta todas as conexões em dois passos (paraAprobar primeiro, depois paraCursar). paraAprobar tem prioridade sobre paraCursar quando o mesmo par aparece em ambos os arrays. Correção da coloração: as setas paraAprobar não cumpridas agora mostram #ffffff (branco) em vez de #666 (cinza).
+ Linhas tracejadas (`arbol.js` + `arbol.html`): adicionado parâmetro `isDashed` em `drawBezier()` com `stroke-dasharray: 6 3`. As setas paraAprobar não cumpridas são tracejadas; as cumpridas ou eletivas permanecem sólidas. A lenda atualizada: "Não cumprido (Final)" mostra uma linha tracejada branca.

## [initial-visual] — 2026-06-07

### Adicionado
+ Gradiente de laranja escuro nos sujeitos regularizados no Modo Árbol (`arbol.css`): o gradiente segue o mesmo padrão que o `.status-aprobada` (ângulo 100deg, fallback sólido) mas em tons de laranja escuro (`#4a1a06` → `#782808`). Sem efeito de vidro/reflexo (nenhum pseudo-elemento `::after`).

### Corrigido
+ Setas SVG no Modo Árbol (rolagem, passar o mouse e clicar): as setas desapareceram durante a rolagem, passar o mouse e clicar. Correção raiz: `updateSvgDimensions()` usou `getBoundingClientRect()` (relativo à viewport) que encolheu durante a rolagem. Reescrito para ocultar-SVG → medir `scrollWidth/scrollHeight` → restaurar-SVG.
+ Erro de seleção: `drawConnections()` chama `selectNode(selectedNode)` para reaplicar o destaque, mas `selectNode()` tem lógica de alternância (se o mesmo nó → deselectAll). Criado `applySelectionVisuals()` que aplica as classes de destaque/diminuição diretamente sem alternância.
+ Flash de clique: removido o ouvinte `mouseenter` que chamava `drawConnections()` após 250ms, causando um ciclo visível de limpeza+recriação.
+ Manipuladores de limpeza: os ouvintes de redimensionamento e rolagem não chamam mais `updateSvgDimensions()` — apenas chama `drawConnections()`. O ouvinte de rolagem foi registrado uma vez em `DOMContentLoaded` (não dentro de `initTree`).

## [initial-polish] — 2026-06-06

### Adicionado
+ Efeito de reflexo de vidro nos nós de assunto aprovado (`arbol.css`): `::after` com gradiente branco animado (keyframe glassShine).
+ Botões de ação (✅🟧🔄) visíveis apenas ao passar o mouse, sempre visíveis em dispositivos móveis.
+ Setas verticais de SVG: sai do centro-inferior do pré-requisito, chega ao centro-superior do dependente.
+ Linhas tracejadas para paraAprobar (faltando final), sólidas para paraCursar (faltando cursada).
+ Layout compacto: redução de espaçamento, fontes menores, padding mais apertado.
+ Layout centralizado: `max-width: 1200px; margin: 0 auto` no contêiner de zoom.
+ Rótulos "Ano" e "Optativa" em espanhol (corrigido de "Ano").
+ Responsividade móvel otimizada: cartas verticais, botões sempre visíveis, alvos de toque 44px, `100dvh`.
+ Z-index corrigido: SVG atrás dos nós (z-index: 0), nós acima (z-index: 1 vía contêiner de zoom).

### Alterado
+ Fundo do nó de assunto alterado para gradiente escuro (`#003803`).
+ Ângulo da animação de brilho de vidro ajustado para 100deg (consistente com o fundo).
+ Animação de brilho de vidro feita mais lenta (6s) e contínua.
+ Removido o estilo de linha pontilhada (`paraAprobar`); agora todas são contínuas.
+ Atualizadas as cores das linhas: Branco (#ffffff) = requisito não cumprido (Final), Cinza (#666) = requisito não cumprido (Cursada).
+ Corrigida a lógica de `selectNode` e `findCorrelatives`: agora mapeia apenas conexões diretas (vizinhos), impedindo a seleção de toda a rede de uma vez.

## [initial-setup] — 2026-06-05

### Adicionado
+ Configuração do GitHub Pages: adicionado `_config.yml` para desativar o processamento do Jekyll (`theme: null`), adicionado `.nojekyll` como marcador de segurança para evitar completamente o Jekyll. Excluído da compilação: AGENTS.md, LOG.md, REF/, .gitignore, README.md. Escaneamento de segurança concluído: nenhuma informação sensível encontrada (100% limpo para implantação pública).
+ Reorganização da estrutura de pastas: criado o diretório `APP/` para a lógica do site. `materias.js` movido para `APP/materias.js`. `finales.json` movido de `REF/finales/` para `APP/finales/finales.json`. `vacunas_data.js` movido para `APP/vacunas_data.js`. `optativas_lista.js` removido (os dados já estão em `materias.js`). `REF/` agora contém apenas dados de referência (CSV). Caminhos atualizados em `index.html`, `arbol.html` e `app.js`.
+ 🟡 indicador nos nós com exatamente 1 pré-requisito faltante (status "no-puede-cursar" ou "optativa-no-puede-cursar"). Nova função `countMissingPrerequisites()` conta os requisitos não cumpridos em `paraCursar`, incluindo OPT-HORAS.
+ Multi-coluna para o Ano 4 obrigatório (17 assuntos em 2 sub-colunas) e Ano 5 eletivo (12 eletivos em 2 sub-colunas). Novas classes CSS `.multi-column` e `.sub-column` para layout flex de 2 colunas.

### Alterado
+ Layout horizontal: anos como linhas, assuntos como cartas lado a lado com `.subjects-row`.
+ Listas longas divididas em 2 `.sub-row` (obrigatória >8, eletiva >6).
+ Lendas atualizadas: "Não cumprido (Cursada)" linha sólida, "Não cumprido (final)" linha tracejada.
+ Auto-ocultar a lenda após 10 segundos, botão "📋 Legenda" para reexibir.
+ Status eletivo agora distingue: optativa-puede-cursar (ciano #22d3ee) e optativa-no-puede-cursar (#1a6b73) com base nos pré-requisitos.
+ Estrutura reestruturada: 6 colunas de anos, cada uma com sub-colunas obrigatórias (esquerda) + eletivas (direita).
+ Adicionado o alternador "Optativas" na barra superior para ocultar/mostrar as colunas eletivas.
+ As conexões do SVG ignoram nós ocultos (`offsetParent === null`) para evitar curvas inválidas.
+ O bordamento esquerdo das cartas eletivas foi removido para o alinhamento correto.
+ O esquema de cores das linhas do SVG foi atualizado: verde (#22c55e) = cumprido, cinza (#666) = não cumprido (cursada), cinza claro (#999) = não cumprido (final), ciano (#22d3ee) = eletivo.

### Corrigido
+ `categoryOrder` com valores 0-3 causou ordenação invertida (0 era falsy com `|| 99`). Os valores foram alterados para 1-4.
+ `.top-bar` sem `display:flex` no desktop — o botão "¿CÓMO USAR?" não estava alinhado à direita.
+ `body { margin: 20px }` reduzido para `12px` (espaço excessivo).
+ `.box h3 { margin-left: 14px }` alterado para `0` (inconsistência com `ul`).
+ Bug de ordem de categoria em `app.js` onde os valores de `categoryOrder` 0-3 causaram ordenação invertida.
+ Acessibilidade: `*:focus-visible` com contorno ciano (#22d3ee) adicionado em `style.css` e `arbol.css`. Rótulos ARIA adicionados aos botões de ação ✅🟧🔄 no Modo Árbol. `role="switch"` e `aria-label` adicionados aos eletivos de alternância. `aria-live="polite"` adicionado ao display de zoom. `tabindex="0"` e `role="button"` adicionados aos cabeçalhos de caixa (h3/h4). Suporte ao teclado (Enter/Space) para os alternadores de caixa. Contraste corrigido: `#4a4a4a`→`#666`, `#777`→`#999`, `#4ade80`→`#6ee7a0`.
+ Alvos de toque: `.btn-calendario` aumentado de 28→44px, `.node-btn` móvel 44px mínimo, botões de zoom 44px.
+ Robustez: todos os `localStorage.getItem/setItem` envolvidos em try/catch (navegação privada do Safari).
+ Performance: removido o `setTimeout` redundante em `arbol.js` (renderização dupla). Removido `console.log` da produção (4 ocorrências em `app.js`).
+ Limpeza: removida a regra CSS morta `.node-border.status-optativa` de `arbol.css`.
+ Dupla barra de rolagem: `height: 100vh; overflow: hidden` na página, `overflow: auto; min-height: 0` no envolvente.

## [initial-tree] — 2026-06-05

### Adicionado
+ Implementação do Modo Árbol (`arbol.html`, `arbol.css`, `arbol.js`). Página independente compartilhando localStorage com a página principal. Layout em grade CSS (6 colunas, uma por ano) com grid de CSS. Nós arredondados com borda esquerda de 4px colorida pelo estado (aprobada=#22c55e, regularizada=#f97316, pode-cursar=#4ade80, no-puede-cursar=#333, optativa=#22d3ee). Clique alterna o estado: none → regularizada → aprobada → none. Linhas curvas de Bezier verticales desde o centro-inferior do pré-requisito até o centro-superior do dependente, com flechas. Cores das linhas por cumprimento: verde (cumprido), laranja (pendente), cinza (não cumprido), ciano (eletivo). Tratamento especial de pré-requisito: OPT-HORAS (horas de eletivas >= 270). Referência encaminhada PD001 (ano 4) → I0001 (ano 5) com curvas da direita para a esquerda. Controles de zoom: +, −, reset, com transformação de escala de CSS. Lenda flutuante fixa no canto inferior-direito. Design responsivo com rolagem horizontal em dispositivos móveis. Botão "🌳 Modo Árbol" adicionado à barra superior de `index.html`.

## [initial-main] — 2026-05-04

### Adicionado
+ Persistência do estado da caixa em localStorage: o estado de colapso/abertura das caixas principais e das subseções eletivas persiste entre as sessões. Nova chave `boxStates` em localStorage salva as preferências do usuário. O estado é restaurado automaticamente após cada `render()`.
+ Contadores de itens `[N]` em todas as caixas e subseções (Aprobadas, Regularizadas, Puede cursar, No puede cursar, Proyectos de Extensión + subseções internas). Nueva función `actualizarContadores()` chamada al final de `render()`. Corregido `toggleSubsection()` y `restoreBoxStates()` para usar `innerHTML` al intercambiar los íconos ▾/▸, preservando el elemento `<span class="box-count">`.
+ Botão de calendario (`.btn-calendario`) rediseñado: siempre cuadrado, sombras interna/externa com efeito de volume, paso sin escala (solo sombras y borde animan).

### Corrigido
+ Ordenación de fechas en el popup de finales: "Próximas" ascendente (min→max), "Anteriores" descendente (max→min). Corregido en `actualizarFechasPopup()` y en la construcción de `datos` en `mostrarPopupFechas()`.
+ Corrección crítica de ID en `agregar()`: corrigido error de sintaxis en `app.js` donde las comparaciones de ID tenían espacios extra (`"no puedeFinal"`→`"noPuedeFinal"`, `"no puede cursar"`→`"noPuedeCursar"`), lo que impedía la correcta visualización de las fechas de los finales en la interfaz.
+ Visualización de fechas de los finales: corregido el mapeo de nombres de asunto en `cargarFechasFinales()` para asegurar que las fechas se muestren correctamente.
+ Corrección crítica de CSS: eliminado CSS duplicado fuera de la consulta `@media` (líneas 987-1132 de 1132). Las reglas móviles estaban siendo aplicadas en todas las pantallas. Eliminados selectores duplicados: `.btn-primary:hover`, `.top-bar-controls label`, `.top-bar-divider`. Corregido `grid-template-columns: 1fr` en `.listas` (elemento es flex, no grid). Añadida validación de `NaN` en `parseFechaLocal()` para evitar fechas inválidas. El CSS se redujo de 1132 a 971 líneas.

### Alterado
+ Migrated the finals system from CSV to JSON (`REF/finales/finales.json`) for better maintainability and robustness. Refactored `cargarFechasFinales()` in `app.js` to consume JSON file.
+ Actualizadas las fechas de los finales (abril-diciembre 2026). Migrado los registros a LOG.md y limpiado el README.md. Implementada paginación en el modal de ayuda mostrando las últimas actualizaciones.
+ Regenerado `finales.json` a partir de ambas hojas de CSV (1er y 2do cuadrimestre 2026). 61 asuntos con fechas completas (febrero-diciembre 2026). Corregido el error de zona horaria: reemplazado `new Date(f.fecha)` por `parseFechaLocal()` para evitar un desfase de -1 día en GMT-3. Corregidos los nombres truncados de cátedra (por ejemplo, "sicología Médica" → "Psicología Médica").

## [initial-data] — 2026-03-29

### Alterado
+ Unificación de datos: fusionado `optativas_lista.js` en `materias.js`.
+ Corregidos los valores incorrectos de `anio`: FM001:2, GE001:2, IES01:1, MGF:5.
+ Modificado el cálculo del porcentaje de progreso: excluido el segmento "puede cursar".
+ Verificado `resetearTodos()`: limpia correctamente todos los estados.
+ Confirmado que funciona con la estructura de datos unificada.

(End of file - total 423 lines)