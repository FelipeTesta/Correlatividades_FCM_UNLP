# Correlatividades Medicina UNLP

Plan de Estudios de la Facultad de Ciencias Médicas — Universidad Nacional de La Plata. Carrera de Medicina.

Visualiza las correlatividades de la carrera, marca las materias que ya aprobaste o regularizaste, y descubre qué puedes cursar y cuándo puedes rendir cada final.

## Funcionalidades

- **Seguimiento de materias**: Marca materias como aprobadas (✅) o regularizadas (🟧)
- **Progreso visual**: Barra de progreso con sistema de puntos por categoría (anual, cuatrimestral, bimestral, optativas)
- **Modo Árbol**: Vista visual de árbol de correlatividades con líneas de conexión SVG, zoom, y selección interactiva
- **Cursando**: Marca materias que estás cursando actualmente (toggle con animación cyan)
- **Fechas de finales**: Consulta las fechas de exámenes finales disponibles (actualizado Feb-Dic 2026, 61 materias)
- **Vacunas**: Seguimiento de vacunación requerida para la carrera
- **Cartelera**: Verifica publicaciones de cátedras (avisos, exámenes, notas) con filtros por fecha y modos de visualización (por materia / cronológico)
- **Notificaciones por email**: Recibe emails (9h/13h/19h ART) cuando haya nuevas publicaciones en tus cátedras
- **Exportar/Importar**: Guarda y restaura tu estado de progreso
- **Responsive**: Funciona en desktop y mobile
- **Modo oscuro**: Tema "Deep Black" (#000000)

## Cómo usar

### Página principal (index.html)

Marca tus materias como aprobadas (✅) o regularizadas (🟧). Las listas se actualizan automáticamente mostrando qué puedes cursar, qué no puedes cursar, y qué finales podes rendir. Consulta las fechas de exámenes con el botón de calendario. Exporta tu progreso para mantenerlo respaldado.

### Modo Árbol (arbol.html)

Vista visual de todas las correlatividades organizadas por año. Hacé click en una materia para destacar sus correlativas (prerrequisitos y dependientes). Usá los botones ✅🟧🔄 en cada nodo para cambiar el estado. Activá el toggle "Cursando" en las materias disponibles. Ajustá el zoom (30%–300%) y ocultá las optativas con el toggle correspondiente.

### Cartelera (cartelera.html)

Muestra las publicaciones de las cátedras correspondientes a tus materias con estado "Cursando" o "Regularizada", más las publicaciones generales de la Facultad (sección "🏛 Avisos Generales de la Facultad", siempre visible). Seleccioná la cátedra cuando haya múltiples opciones. Filtra por fecha (365, 30 o 7 días) y alterná entre vista por materia o cronológica. Marcá publicaciones como leídas (👁). Usá el botón 🔔 Notificarme para suscribirte y recibir emails 3x/día (9h/13h/19h ART) con nuevas publicaciones (de cátedras y/o generales de la Facultad, con opción separada).

## Versión

v0.08 — Agosto 2026

## Registro de cambios

- **04/08/2026:** Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → requiere Anatomía regularizada. Añadido aviso de privacidad (banner fijo) en las 3 páginas HTML + CSS. (home) en la página (sección "🏛 Avisos Generales de la Facultad") y en notificaciones de email (opt-in separado en el modal)
- **03/08/2026 (2):** Sincronización materias↔cátedras: fallbacks añadidos (HG001, C2001, BG008, BG013, EDS13, PINV) y mensaje de error restaurado a "No hay datos de cátedras para este código" (PFOFO/TASPO sin cátedra).
- **03/08/2026 (3):** Filtros cartelera: intervalo por defecto 365→90 días, campo personalizado con sufijo "dias" y resaltado cian cuando se usa un intervalo personalizado (syncFilterUI).
- **03/08/2026 (4):** Cartelera cutoff+3 (intervalo real = mostrado+3 días, invisible) y diseño de cards en grilla CSS (auto-fill, mejor uso de espacio en desktop)
- **03/08/2026 (5):** Sistema de auto-reload: version.json con hash de versión + script inline en las 3 páginas que recarga silenciosamente cuando detecta nueva versión
- **04/08/2026:** Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → requiere Anatomía regularizada. Añadido aviso de privacidad (banner fijo) en las 3 páginas HTML + CSS.
- **04/08/2026 (6):** Fix: PG001 (Psicología Médica) ahora requiere Anatomía regularizada para cursar + Aviso de privacidad en todas las páginas
- **04/08/2026 (7):** FAB mobile: posicionamiento horizontal simplificado (CSS left/right en vez de JS pixel math). Help modal: reescrito a single-page, removida paginación y "Últimas Actualizaciones".
- **04/08/2026 (8):** Fix privacy banner flash no PC: banner escondido inicialmente (display:none) + anti-loop no version auto-reload (3s cooldown).
- **07/08/2026 (2):** Modal "Recibir novedades" rediseñado con tabs Obligatorias/Optativas y divisores por año ("1° año", "2° año", etc.).
- **07/08/2026 (3):** Cartelera: renombrado "Suscripción" → "Otras" (3 labels en JS). Cards: título más grande (15px, blanco, bold 600, line-height 1.3), nombre de materia siempre visible incluso en cards leídos (11px→13px, dimmed #666 cuando leído), fuente "Otras" cambiado de purple #a855f7 a amber #f59e0b.
- **07/08/2026 (4):** Rediseño completo de cards en Cartelera: tag type movido a pills, fecha única (modificada si existe, sino original), botón "lido" bottom-right, estado leído oculta todas las tags. Compactado (gaps/paddings/fonts reducidos). Auditoría WIG aplicada: transition:all→específico, :focus→:focus-visible, min-width:0 en flex children, touch-action+tap-highlight+overscroll+color-scheme:dark en body, text-wrap:balance en títulos. CSS limpo: eliminados .pub-tag standalone, .pub-details-row, .pub-modificada-pill; nuevos .pub-tags-row, .pub-date-modified.
- **14/07/2026:** Corrección de bug: FAB mobile (touch-and-hold) aparecía fuera de la pantalla en Modo Árbol — medición de dimensión durante animación causaba overflow; corregido con offsetWidth/offsetHeight + clamp + container flex-wrap
- **07/07/2026:** Botón "¿Cómo usar?" en Modo Árbol + leyenda actualizada con 🟡 + optimizaciones mobile UI/UX (touch-action, color-scheme, reduced-motion, modal responsive)
- **05/07/2026:** Corrección plan estudios UNLP (RM 578/25) — DL001, TX001, P9002 movidas a 5° año
- **30/06/2026:** Notificaciones por email + botón ⚙ Alterar cátedras
- **29/06/2026:** Cartelera de cátedras (publicaciones, filtros, modos)

Ver [LOG.md](LOG.md) para el historial completo de modificaciones.
