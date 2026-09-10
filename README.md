# Correlatividades Medicina UNLP

Plan de Estudios de la Facultad de Ciencias Médicas — Universidad Nacional de La Plata. Carrera de Medicina.

Visualiza las correlatividades de la carrera, marca las materias que ya aprobaste o regularizaste, y descubre qué puedes cursar y cuándo puedes rendir cada final.

## Funcionalidades

- **Seguimiento de materias**: Marca materias como aprobadas (✅) o regularizadas (🟧)
- **Progreso visual**: Barra de progreso con sistema de puntos por categoría (anual, cuatrimestral, bimestral, optativas)
- **Modo Árbol**: Vista visual de árbol de correlatividades con líneas de conexión SVG, zoom, y selección interactiva
- **Cursando**: Marca materias que estás cursando actualmente (toggle con animación cyan)
- **Abreviar nombres**: Toggle "Abreviar nombres" muestra abreviaturas/siglas médicas (`nombreCorto` de cada materia) en vez del nombre completo. Disponible en modo Árbol (panel de Leyenda) y en la página principal (en la barra superior, junto a "¿CÓMO USAR?"). Persistido en localStorage (`arbolAbbreviateNames` / `mainAbbreviateNames`, default activado). Cuando activo, la fuente del nombre aumenta ~30%.
- **Fechas de finales**: Consulta las fechas de exámenes finales disponibles (actualizado Feb-Dic 2026, 61 materias)
- **Vacunas**: Seguimiento de vacunación requerida para la carrera
- **Cartelera**: Verifica publicaciones de cátedras (avisos, exámenes, notas) con filtros por fecha y modos de visualización (por materia / cronológico)
- **Notificaciones por email**: Recibe emails (9h/13h/19h ART) cuando haya nuevas publicaciones en tus cátedras
- **Responsive**: Funciona en desktop y mobile
- **Modo oscuro**: Tema "Deep Black" (#000000)
- **Contador de visitantes**: Badge en tiempo real (🟢 online/hoy) en el navbar, sesiones únicas por día, exclusiones admin

## Cómo usar

### Página principal (index.html)

Marca tus materias como aprobadas (✅) o regularizadas (🟧). Las listas se actualizan automáticamente mostrando qué puedes cursar, qué no puedes cursar, y qué finales podes rendir. Consulta las fechas de exámenes con el botón de calendario.

### Modo Árbol (arbol.html)

Vista visual de todas las correlatividades organizadas por año. Hacé click en una materia para destacar sus correlativas (prerrequisitos y dependientes). Usá los botones ✅🟧🔄 en cada nodo para cambiar el estado. Activá el toggle "Cursando" en las materias disponibles. El toggle "Abreviar nombres" está disponible en el panel de Leyenda del modo Árbol. Ajustá el zoom (30%–300%) y ocultá las optativas con el toggle correspondiente.

### Cartelera (cartelera.html)

Muestra las publicaciones de las cátedras correspondientes a tus materias con estado "Cursando" o "Regularizada", más las publicaciones generales de la Facultad (sección "🏛 Avisos Generales de la Facultad", siempre visible). Seleccioná la cátedra cuando haya múltiples opciones. Filtra por fecha (365, 30 o 7 días) y alterná entre vista por materia o cronológica. Marcá publicaciones como leídas (👁). Usá el botón 🔔 Notificarme para suscribirte y recibir emails 3x/día (9h/13h/19h ART) con nuevas publicaciones (de cátedras y/o generales de la Facultad, con opción separada).

## Versión

v0.08 — Agosto 2026

## Registro de cambios

- **10/09/2026:** Extension data cleanup: removido campo `evidencia` (dato muerto, nunca referenciado por extension.js). Agregado Instagram de Parto respetado (partorespetado.unlp). AGENTS.md: folder layout actualizado (extension_data.js, extension.js), consolidadas entradas duplicadas en # IMPLEMENT.
- **09/09/2026:** Contador de visitantes en tiempo real — badge `🟢 online/hoy` en el navbar de todas las páginas. Worker con heartbeat cada 30s, sesiones únicas por día, exclusiones admin. Menú hamburguesa mobile rediseñado como panel flutuante. Enlace "Sin nuevas publicaciones" en Cartelera (cada nombre es un link a la cátedra). Fix mobile: "Horas Optativas Acumuladas" en una sola línea. Fix navbar flex para badge en extremo derecho (desktop). D1 database para stats históricas (daily_stats).
- **05/09/2026:** Design system unificado — criado `variables.css` (paleta centralizada em 18 variáveis CSS) e refatorados os 3 CSS (style, arbol, cartelera) para usar var(--). Página principal: headers de boxes coloridos (padrão Cartelera), animação de colapso vertical (sem movimiento horizontal), fundos removidos, espaçamento reducido, seleção de texto desabilitada, margens laterais desktop 12%. Nova funcionalidade estrelas ⭐ para optativas (lista "Optativas ⭐ | 00 Horas" com soma de horas, persistência localStorage). Sistema "Abreviar nomes" portado para a página principal (switch na linha de horas optativas, default ON). Abreviações de texto e categorias (Prox final libre, Bi/Tri/Quatri/Opt). Barra de progresso com segmento silver para cursando=on. Procedimento FLOW/finales-update.dot para atualização periódica de datas de finais.
- **28/08/2026:** Animação glassShine (reflexo vidro nos nós aprovados) não respeita mais prefers-reduced-motion — funciona mesmo com "Reduzir animações" ativado no dispositivo.
- **27/08/2026:** Modo Árbol — botão "Ver optativas" reposicionado entre Zoom e Cartelera; legenda restaurada (ordem Colores/Flechas conforme spec, itens Cursando, Próximas materias a liberar, ⭕ No puede final, toggle Abreviar nomes; Flechas: Cumplido, Puede cursar falta final, Falta Cursada, Falta Final); botão voltar "← Modo Lista"; botão Cartelera "📋 Cartelera"; toggle switch horizontal unificado (desktop 28px / mobile 37px, slider 28×14px); fix overlay z-index legenda mobile; fix media query CSS mobile malformada.
- **27/08/2026 — Restaurado CSS .cursando-active/.cursando-pending à versão original do GitHub; revertidas media queries 1024px→768px; detecção de dispositivo baseada em capability ((hover: hover) and (pointer: fine)) para botões PC (hover) vs mobile (FAB click-hold).**
- **25/08/2026 — Adicionado nombreCorto a todas as matérias (obrigatórias + optativas) em APP/materias.js; toggle 'Abreviar nomes' no modo Árbol com persistência localStorage; correção de cache em toggleCursando (_stateCache['cursando'] = null); user-select: none nos nós; remoção de código morto (NAME_ABBREVIATIONS) e arquivos residuais.**
- **04/08/2026:** Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → requiere Anatomía regularizada. Añadido aviso de privacidad (banner fijo) en las 3 páginas HTML + CSS. (home) en la página (sección "🏛 Avisos Generales de la Facultad") y en notificaciones de email (opt-in separado en el modal)
- **03/08/2026 (2):** Sincronización materias↔cátedras: fallbacks añadidos (HG001, C2001, BG008, BG013, EDS13, PINV) y mensaje de error restaurado a "No hay datos de cátedras para este código" (PFOFO/TASPO sin cátedra).
- **03/08/2026 (3):** Filtros cartelera: intervalo por defecto 365→90 días, campo personalizado con sufijo "dias" y resaltado cian cuando se usa un intervalo personalizado (syncFilterUI).
- **03/08/2026 (4):** Cartelera cutoff+3 (intervalo real = mostrado+3 días, invisible) y diseño de cards en grilla CSS (auto-fill, mejor uso de espacio en desktop)
- **03/08/2026 (5):** Sistema de auto-reload: version.json con hash de versión + script inline en las 3 páginas que recarga silenciosamente cuando detecta nueva versión
- **04/08/2026:** Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → requiere Anatomía regularizada. Añadido aviso de privacidad (banner fijo) en las 3 páginas HTML + CSS.
- **04/08/2026 (6):** Fix: PG001 (Psicología Médica) ahora requiere Anatomía regularizada para cursar + Aviso de privacidad en todas las páginas
- **04/08/2026 (8):** FAB mobile: posicionamiento horizontal simplificado (CSS left/right en vez de JS pixel math). Help modal: reescrito a single-page, removida paginación y "Últimas Actualizaciones".
- **04/08/2026 (8):** Fix privacy banner flash no PC: banner escondido inicialmente (display:none) + anti-loop no version auto-reload (3s cooldown).
- **07/08/2026 (2):** Modal "Recibir novedades" rediseñado con tabs Obligatorias/Optativas y divisores por año ("1° año", "2° año", etc.).
- **07/08/2026 (3):** Cartelera: renombrado "Suscripción" → "Otras" (3 labels en JS). Cards: título más grande (15px, blanco, bold 600, line-height 1.3), nombre de materia siempre visible incluso en cards leídos (11px→13px, dimmed #666 cuando leído), fuente "Otras" cambiado de purple #a855f7 a amber #f59e0b.
- **07/08/2026 (4):** Rediseño completo de cards en Cartelera: tag type movido a pills, fecha única (modificada si existe, sino original), botón "lido" bottom-right, estado leído oculta todas las tags. Compactado (gaps/paddings/fonts reducidos). Auditoría WIG aplicada: transition:all→específico, :focus→:focus-visible, min-width:0 en flex children, touch-action+tap-highlight+overscroll+color-scheme:dark en body, text-wrap:balance en títulos. CSS limpo: eliminados .pub-tag standalone, .pub-details-row, .pub-modificada-pill; nuevos .pub-tags-row, .pub-date-modified.
- **14/07/2026:** Corrección de bug: FAB mobile (touch-and-hold) aparecía fuera de la pantalla en Modo Árbol — medición de dimensión durante animación causaba overflow; corregido con offsetWidth/offsetHeight + clamp + container flex-wrap
- **07/07/2026:** Botón "¿Cómo usar?" en Modo Árbol + leyenda actualizada con 🟡 + optimizaciones mobile UI/UX (touch-action, color-scheme, reduced-motion, modal responsive)
- **05/07/2026:** Corrección plan estudios UNLP (RM 578/25) — DL001, TX001, P9002 movidas a 5° año
- **30/06/2026:** Notificaciones por email + botón ⚙ Alterar cátedras
- **29/06/2026:** Cartelera de cátedras (publicaciones, filtros, modos)
- 
Ver [LOG.md](LOG.md) para el historial completo de modificaciones.

---

## Arquitectura Técnica

Detalles técnicos de implementación para referencia. Ver también [AGENTS.md](AGENTS.md) para orientación a agentes de IA.

### Modo Árbol — Detalles

- **Layout:** Filas horizontales por año. Cada año tiene `.year-section` > `.year-header` + `.subjects-row.obrigatorias` + `.subjects-row.optativas`. Listas largas se dividen en 2 `.sub-row` divs (obrigatórias >8, optativas >6). Centrado con `max-width: 1200px; margin: 0 auto`.
- **Colores de nodo:** aprobada=#22c55e (gradiente verde oscuro + animación glass reflection), regularizada=#f97316 (gradiente naranja oscuro, sin glass), pode-cursar=#facc15, no-puede-cursar=#333 (texto dimmed #4a4a4a), optativa-puede-cursar=#a855f7, optativa-no-puede-cursar=#581c87, cursando-active=#22d3ee (gradiente cyan + borde animado glow)
- **Botones de acción:** 3 botones por nodo (✅ aprobar, 🟧 regularizar, 🔄 resetear). Ocultos por defecto, visibles en hover. En mobile (≤768px): reemplazados por FAB de toque y mantenimiento (400ms).
- **Selección:** Click en nodo resalta correlativas (prerrequisitos + dependientes), dim los demás. ESC o "✕ Limpiar" para deseleccionar. Líneas solo visibles en modo selección.
- **Líneas SVG:** Curvas Bezier verticales desde centro-inferior del prerrequisito hasta centro-superior del dependiente. 4 estados visuales según `paraCursar` + `paraAprobar`: (1) Gris #666 sólido = no puede cursar, falta cursada; (2) Blanco #ffffff sólido = no puede cursar, falta final; (3) Verde #22c55e punteado = puede cursar pero no puede final; (4) Verde #22c55e sólido = todo cumplido. Púrpura #a855f7 = optativa. Usa `getConnectionVisualStyle()`.
- **Leyenda:** Fijo abajo-derecha, auto-oculta después de 10s. "📋 Leyenda" alterna visibilidad.
- **Optativas:** Etiqueta "Optativa" en púrpura antes de cada fila. Toggle "Optativas" oculta/muestra filas + labels.
- **Zoom:** CSS transform scale con controles +, -, reset (30%–300%).
- **🟡 Indicator:** Materias bloqueadas por exactamente 1 prerrequisito faltante muestran 🟡 al lado del nombre.
- **Glass Effect:** Nodos aprobados (`.status-aprobada`) tienen `::after` pseudo-element con gradiente blanco animado (keyframe glassShine).
- **Cursando:** Toggle switch en nodos puede-cursar. ON: gradiente cyan + borde rotativo conic-gradient (con glow). Correlativas pendientes: borde rotativo blanco/negro sutil (sin glow). Estado en localStorage `cursando: { "CODE": true }`. Se limpia al resetear materia.
- **Mobile:** Retrato: layout vertical con cards compactas (min-width 65px, max-width 110px), zoom 65%. Sin truncamiento — texto wrap natural. Landscape: layout normal 100% zoom. FAB de toque y mantenimiento. Touch targets, 100dvh viewport.
- **Scroll:** `html overflow:visible` (override de base.css `overflow-x:clip`), `body overflow-x:hidden` (único contenedor scroll). `overscroll-behavior:none` en base.css (compartido).
- **SVG Dimensions:** `updateSvgDimensions()` usa hide-SVG → medir `scrollWidth/scrollHeight` → restore-SVG para evitar loop de feedback.
- **Scroll Listener:** Registrado una vez en DOMContentLoaded (no dentro de initTree). Solo llama `drawConnections()`, no `updateSvgDimensions()`.

### Cartelera — Detalles

- **Arquitectura:** Página standalone compartiendo localStorage. Accedida desde "📋 Verificar Cartelera" en arbol.html top-bar.
- **Fuentes de estado:** Lee `localStorage.cursando` + `localStorage.estados` (regularizada). Cursando tiene precedencia.
- **Resolución de cátedra:** Código de materia → `localStorage.catedrasSeleccionadas[CODE]` → lookup en `APP/finales/finales.json` → ID de cartelera en `APP/cartelera_ids.js`. Fallbacks: `CARTELERA_FALLBACK_CATEDRAS` para SEM91 (6 opciones Medicina Interna A–F), P9001 (Psiquiatría I), HG001, C2001, BG008/BG013, EDS13, PINV.
- **Fetch:** `cartelera.js` → Cloudflare Worker proxy (`CARTELERA_PROXY`) → `cartelera.med.unlp.edu.ar`. AbortController 15s timeout.
- **Cache:** `sessionStorage` key `carteleraCache` con 30min expiración por URL de cátedra.
- **Parse:** `DOMParser` en HTML → `.ribbon-wrapper.card` → extraer título, fecha, descripción, profesor, imagen, tipo (Avisos/Exámenes/Notas/Otros) por keyword matching.
- **Modos de renderizado:**
  - **Por materia** (default): Agrupado por materia. Headers coloreados: Cursando = cyan, Regularizada = naranja. Colapsable por materia y por sección.
  - **Cronológico:** Timeline plana ordenada por fecha. Badge de materia + badge de origen.
- **Filtros:** Fecha con cutoff `currentDays + 3` (margen invisible). Input personalizado `#daysInput` (default 90d) + presets 60/30/7d. Persistido en `carteleraFilterDays`.
- **Lectura:** Botón "👁 lido" por publicación → marca leída, colapsa card. "👁 todas lidas" en top-bar alterna: 1er clic marca todas, 2do clic desmarca.
- **Modificación:** Detección de publicaciones editadas (fecha de modificación en `text-muted`). Badge "🔄 Actualizada" en cards. Read state reset si modificado.
- **Home / Generales:** Publicaciones generales de la Facultad (no vinculadas a materia) en sección púrpura "🏛 Avisos Generales". Siempre visible en página. En email: solo si usuario opta vía checkbox.
- **Notificaciones email:** Cron 3x/día (9h/13h/19h ART). Snapshot KV para detectar cambios. API Resend. Modal de inscripción. Botón "Remover mi email" con hold-to-confirm. KV format: `{codes, names, home}`.

### Versión Auto-Reload

- `version.json` en root con `{"version":"<git-hash>","timestamp":"..."}`. Script inline en cada HTML compara con `localStorage.lastVersion`. Si diferente → reload silencioso (localStorage intacto). Deploy automatizado via `deploy.ps1`.

### Aviso de Privacidad

- Barra fija (position:fixed; top:0) en las 3 páginas. Comienza oculta, se muestra tras confirmar no-reload. Botón ✕ oculta (sin sessionStorage). Anti-bucle: 3s cooldown.
