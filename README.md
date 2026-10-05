# Correlatividades Medicina UNLP

Plan de Estudios de la Facultad de Ciencias Médicas — Universidad Nacional de La Plata. Carrera de Medicina.

Visualiza las correlatividades de la carrera, marca las materias que ya aprobaste o regularizaste, y descubre qué puedes cursar y cuándo puedes rendir cada final.

## Licencia y Uso

**Este proyecto es de código abierto para uso PERSONAL.**

- ✅ **Permitido**: usar, copiar, compartir y adaptar el código **para uso personal y sin fines de lucro**, siempre dando los **créditos correspondientes** al proyecto (Correlatividades Medicina UNLP) y manteniendo esta nota de licencia.
- ❌ **Prohibido**: cualquier forma de **comercialización** — vender, alquilar, cobrar por acceso, o monetizar este proyecto o derivados, total o parcialmente.

Si compartís o forkeás este proyecto, **debés citar la fuente con los créditos**. Las fuentes de datos citadas en cada sección (universidades, SPU, QS, EduRank, Numbeo, Hornero) pertenecen a sus respectivos autores y conservan sus condiciones de uso.

## Funcionalidades

- **Seguimiento de materias**: Marca materias como aprobadas (✅) o regularizadas (🟧)
- **Progreso visual**: Barra de progreso con sistema de puntos por categoría (anual, cuatrimestral, bimestral, optativas)
- **Modo Árbol**: Vista visual de árbol de correlatividades con líneas de conexión SVG, zoom, y selección interactiva
- **Mini calendario** (Modo Árbol + página principal): Strip de 53 semanas del año con emojis por evento (⚫ verano, 🔘 período letivo, 🔵 invierno, 🟡 inscripciones obligatorias, 🟣 optativas, 🟠 ingresantes, 🟢 semana actual). Tooltip con fechas y horarios escalonados por año. Sticker "Inscripción" en las materias que podés cursar cuando su ventana de inscripción está a ≤14 días o abierta (árbol: esquina del nodo; principal: tag amarilla tras el nombre). En la página principal vive debajo de la barra de progreso, centrada. Arrastrá el strip horizontalmente (móvil: centrado en la semana actual). Fechas 2026 verificadas contra la cartelera oficial + calendario FCM; worker chequea mensualmente la página de inscripciones y avisa por email si cambia.
- **Cursando**: Marca materias que estás cursando actualmente (toggle con animación cyan)
- **Abreviar nombres**: Toggle "Abreviar nombres" muestra abreviaturas/siglas médicas (`nombreCorto` de cada materia) en vez del nombre completo. Disponible en modo Árbol (panel de Leyenda) y en la página principal (en la barra superior, junto a "¿CÓMO USAR?"). Persistido en localStorage (`arbolAbbreviateNames` / `mainAbbreviateNames`, default activado). Cuando activo, la fuente del nombre aumenta ~30%.
- **Fechas de finales**: Consulta las fechas de exámenes finales disponibles (actualizado Feb-Dic 2026, 61 materias)
- **Vacunas**: Seguimiento del esquema de vacunación del personal de salud. dTpa exigida solo al poder cursar Pediatría (antes, dT). Incluye vacunas opcionales del Calendario Nacional 2026 (atenuadas, sin alerta) y el **Mapa de Vacunas y Cepas**: círculos por patógeno + contornos por vacuna (filtros por patología; clic → ficha educativa con tipos, marcas, esquemas y enlaces oficiales MSAL/OMS). Footer con fuentes oficiales (MSAL, SADI, ANLIS).
- **Cartelera**: Verifica publicaciones de cátedras (avisos, exámenes, notas) con filtros por fecha y modos de visualización (por materia / cronológico)
- **Notificaciones por email**: Recibe emails (9h/13h/19h ART) cuando haya nuevas publicaciones en tus cátedras
- **Responsive**: Funciona en desktop y mobile
- **Modo oscuro**: Tema "Deep Black" (#000000)
- **Contador de visitantes**: Badge (🟢 online/hoy) en el navbar — heartbeat único cada 60s (pausado en pestaña oculta), presencia en D1 (KV reservado a suscripciones/snapshots), conteo diario por dispositivo, exclusiones admin
- **Otras Universidades**: mapa interactivo con planes de estudio de Medicina de otras universidades públicas argentinas (referencia visual, sin almacenar datos)

## Cómo usar

### Página principal (index.html)

Marca tus materias como aprobadas (✅) o regularizadas (🟧). Las listas se actualizan automáticamente mostrando qué puedes cursar, qué no puedes cursar, y qué finales podes rendir. Consulta las fechas de exámenes con el botón de calendario.

### Modo Árbol (arbol.html)

Vista visual de todas las correlatividades organizadas por año. Hacé click en una materia para destacar sus correlativas (prerrequisitos y dependientes). Usá los botones ✅🟧🔄 en cada nodo para cambiar el estado. Activá el toggle "Cursando" en las materias disponibles. El toggle "Abreviar nombres" está disponible en el panel de Leyenda del modo Árbol. Ajustá el zoom (30%–300%) y ocultá las optativas con el toggle correspondiente.

Arriba del árbol está el **mini calendario**: una línea con las 53 semanas del año. Pasá el mouse (o tocá en móvil) una bolilla para ver las fechas y los eventos de esa semana. La semana actual es 🟢 (intercala con el color del evento). Cuando una materia que podés cursar abre inscripción pronto (≤14 días) o ya está abierta, aparece el sticker amarillo **"Inscripción"** en su esquina inferior derecha, con el detalle en el tooltip del nodo. En móvil, arrastrá el calendario con el dedo — arranca centrado en la semana actual.

### Cartelera (cartelera.html)

Muestra las publicaciones de las cátedras correspondientes a tus materias con estado "Cursando" o "Regularizada", más las publicaciones generales de la Facultad (sección "🏛 Avisos Generales de la Facultad", siempre visible). Seleccioná la cátedra cuando haya múltiples opciones. Filtra por fecha (365, 30 o 7 días) y alterná entre vista por materia o cronológica. Marcá publicaciones como leídas (👁). Usá el botón 🔔 Notificarme para suscribirte y recibir emails 3x/día (9h/13h/19h ART) con nuevas publicaciones (de cátedras y/o generales de la Facultad, con opción separada).

## Versión

v0.09 — Septiembre 2026

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
- **03/08/2026 (5):** Sistema de auto-reload: version.json con hash de versão + script inline en las 3 páginas que recarga silenciosamente quando detecta nova versão
- **04/08/2026:** Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → requiere Anatomía regularizada. Añadido aviso de privacidad (banner fijo) en las 3 páginas HTML + CSS.
- **04/08/2026 (6):** Fix: PG001 (Psicología Médica) ahora requiere Anatomía regularizada para cursar + Aviso de privacidad en todas las páginas
- **04/08/2026 (8):** FAB mobile: posicionamiento horizontal simplificado (CSS left/right em vez de JS pixel math). Help modal: reescrito a single-page, removida paginación e "Últimas Actualizaciones".
- **04/08/2026 (8):** Fix privacy banner flash no PC: banner escondido inicialmente (display:none) + anti-loop no version auto-reload (3s cooldown).
- **07/08/2026 (2):** Modal "Recibir novedades" rediseñado com tabs Obligatorias/Optativas e divisores por ano ("1° ano", "2° ano", etc.).
- **07/08/2026 (3):** Cartelera: renombrado "Suscripción" → "Otras" (3 labels en JS). Cards: título mais grande (15px, branco, bold 600, line-height 1.3), nome de materia sempre visível mesmo em cards lidos (11px→13px, dimmed #666 quando leido), fonte "Otras" alterado de purple #a855f7 a amber #f59e0b.
- **07/08/2026 (4):** Rediseño completo de cards em Cartelera: tag type movido a pills, data única (modificada se existir, senão original), botão "lido" bottom-right, estado leído oculta todas as tags. Compactado (gaps/paddings/fonts reduzidos). Auditoría WIG aplicada: transition:all→específico, :focus→:focus-visible, min-width:0 em flex children, touch-action+tap-highlight+overscroll+color-scheme:dark em body, text-wrap:balance em títulos. CSS limpo: eliminados .pub-tag standalone, .pub-details-row, .pub-modificada-pill; novos .pub-tags-row, .pub-date-modified.
- **14/07/2026:** Correção de bug: FAB mobile (touch-and-hold) aparecia fora da tela em Modo Árbol — medição de dimensão durante animação causava overflow; corregido com offsetWidth/offsetHeight + clamp + container flex-wrap
- **07/07/2026:** Botão "Como usar?" em Modo Árbol + legenda atualizada com 🟡 + optimizaçoes mobile UI/UX (touch-action, color-scheme, reduced-motion, modal responsive)
- **05/07/2026:** Correção plan estudos UNLP (RM 578/25) — DL001, TX001, P9002 movidas a 5° ano
- **30/06/2026:** Notificações por email + botão ⚙ Alterar cátedras
- **29/06/2026:** Cartelera de cátedras (publicações, filtros, modos)
- 
Ver [LOG.md](LOG.md) para o historial completo de modificações.

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

### Otras Universidades — Detalles

- **Página independiente:** `universidades.html` en el raíz. Zero localStorage, sin módulos compartidos, prefijo CSS `.uni-*`, dependencias externas: Leaflet CDN (unpkg.com/leaflet@1.9.4/) + tiles CARTO (API key en `APP/universidades.js`). Selección de texto deshabilitada.
- **Navbar (clon visual del app-navbar):** HOME → "← Modo Árbol" + título centrado; PLAN → | "← Volver" | título de la universidad | "Otras Universidades ▾" (dropdown con las 24 para saltar entre planes).
- **Home = 3 sectores:** mapa Leaflet con tiles CARTO dark (24 pins con sigla; clic en pin → modal; control ⤢ = fitBounds a todas) + barra **Filtrar** (5 sliders de doble puño: costo vida, alumnos, % intern., ranking, dist. capital + checkboxes español/método con opción "—"; solo sesión, contador "X de 24" + limpiar; el mapa refleja el filtro — pins fuera del requisito se atenúan) + tabla de universidades (sigla — nombre completo al hover, región abreviada CABA/GBA/PBA/CBA…, 📍 mapa, 🌲 plan, 🌎 sitio + 10 columnas de métricas con "—" hasta Fase 2; clic en fila → modal; scroll horizontal con primera columna sticky, cabecera sticky ≥1250px, columnas ordenables por clic).
- **📍 Focus:** scroll al mapa + centrado + pulso en el pin. Zoom adaptativo por KM a capital: ≤100km (cluster CABA/GBA/La Plata) → z9; aisladas → z8 — pins vecinos visibles sin zoom-out.
- **UNLP especial:** 🌲 → redirige al Modo Árbol (el plan de la UNLP vive ahí).
- **Árbol de solo lectura:** réplica visual del Modo Árbol — franja lateral, headers de año cian, conexiones SVG bezier ocultas por defecto (base #666); al seleccionar una materia: flechas SILVER (#c0c0c0) hacia sus prerrequisitos (retrógradas) y CIAN hacia las materias que dependen de ella (anterógradas). Materias con correlativa del MISMO año nunca comparten línea (sub-filas automáticas via `computeYearRows`). Etiqueta de duración (Anual/Cuatrimestral) solo si verificada, si no "—". Sin zoom. Routing por hash: `universidades.html#uba`, `#unc`.
- **Nota de ingreso:** arriba de cada árbol, 2-4 líneas explicando el ingreso y el primer año (`plan.ingresoNota`); la línea con nombre del plan + fuente quedó debajo del árbol.
- **Estados de materias (solo sesión, sin localStorage):** botón 🔘 (semitransparente, esquina inferior derecha) → 🟢 marcada. PC: clic en el botón; móvil: mantener la tarjeta 1s (repetir para reset). Contorno azul = "puede cursar" (todas las correlativas marcadas); materias iniciales (sin correlativas) nunca se resaltan — se consideran cursables desde el inicio. Al recargar o cambiar de universidad se pierde.
- **Datos reales:** UBA Plan de Estudios 09 (42 materias, 7 años CBC→PFO; fmed.uba.ar) y UNC (43 materias, 503 correlativas; fcm.unc.edu.ar) — correlativas curadas por Hornero (horneroapp.ar). Resto `plan: null` hasta investigación. Métricas verificadas: UNLP 6 años/40 materias, UBA 6,5/42, UNC 6/43. Plan de evolución en `TODO.md` (Fase 2: otros planes + métricas + notas de ingreso; Fase 3: columnas ordenables).
- **Eliminación:** borrar `universidades.html`, `APP/universidades_*`, `TODO.md`, el bloque del footer en `arbol.html`, el bloque CSS en `arbol.css`, `FLOW/universidades.dot` y las secciones en README/LOG/AGENTS.

### Otras Universidades — Fuentes de investigación

Registros de verificación 2026-09-29. Para futuras pasadas de datos, consultar en este orden:

- **Rankings:** QS World University Rankings by Subject — Medicine 2026 (Excel local en `REF/`; fuente primaria: UBA #133, UNC #351-400, UNLP #501-550) → fallback EduRank Medicine, lista completa de Argentina: <https://edurank.org/medicine/ar/> (42 escuelas, actualizada 2026-03; provee rank nacional/mundial para universidades fuera de QS: UNR 5/1364, UNT 6/1859, UNMdP 7/1915, UNL 8/1918, UNS 9/2002, UNCuyo 10/2072, UNComahue 14/2387, UNNE 17/3040, UNSa 21/3269, UNER 30/4341, UNLaM 36/5360).
- **Alumnos por carrera:** SPU Anuario Estadístico 2024, Cuadro 2.1.16 (alumnos de Medicina por universidad; copia local en `REF/adelanto_anuario_24_14-08/`). Base nivel-carrera del studentCount de todas las universidades (2024).
- **Existencia de carreras (verificaciones 2026-09-29):** UNM Moreno <https://www.unm.edu.ar/?oferta-academica=carreras-de-pregrado-y-grado> — sin Medicina → **REMOVIDA**. UNSAdA <https://www.unsada.edu.ar/academico/oferta-academica> — sin Medicina (solo Fonoaudiología/Enfermería/Podología/Gerontología) → **NO agregada**. UNFV Florencio Varela — universidad fantasma (proyecto absorbido por la UNAJ en 2009; su artículo de Wikipedia no existe) → **REMOVIDA**. UNRN Medicina — **CONFIRMADA** (Sede Andina, Bariloche; Plan 2021, Res. ME 350/22; inscripción 2027 abierta).
- **Planes oficiales:** UBA <https://www.fmed.uba.ar/carreras/medicina/informacion-general> · UNC <https://fcm.unc.edu.ar/medicina-asignaturas-del-plan-de-estudio-por-ano/> · UNT <https://www.fm.unt.edu.ar/index.php/medicina> (duración oficial: 7 años) · UNRN <https://www.unrn.edu.ar/carreras/Medicina-81> (duración oficial: 6 años, ingreso CPU + curso disciplinar + MEM).
- **Correlatividades:** Hornero <https://horneroapp.ar> — tablas curadas por universidad (`/carreras/{uba,unc,uncuyo,unt,unr,mdp,unse,unlp}-medicina/`); cruzar SIEMPRE con la fuente oficial antes de marcar verificado; su columna "Cuatri" es poco confiable.
- **Costo de vida:** Numbeo por ciudad (sin margen: alquiler + gastos). Cobertura baja en ciudades chicas → sin widget resumido, se deriva del canasto y se marca LOW reliability.
- **Requisito de español:** UNLP B2 (med.unlp.edu.ar) · UBA C1 (academica.rec.uba.ar, desde dic 2023).
- **Fuentes bloqueadas para agentes (usar navegador Edge del usuario vía edge-devtools MCP):** transparencia.unlp.edu.ar (login SAML — PDF de egresados requiere descarga manual del usuario), fmed.uba.ar y fcm.unc.edu.ar (anti-bot), topuniversities.com (403), Google (CAPTCHA para agentes).