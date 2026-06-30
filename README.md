# Correlatividades Medicina UNLP

Plan de Estudios de la Facultad de Ciencias Médicas — Universidad Nacional de La Plata. Carrera de Medicina.

Visualiza las correlatividades de la carrera, marca las materias que ya aprobaste o regularizaste, y descubre qué puedes cursar y cuándo puedes rendir cada final.

## Funcionalidades

- **Seguimiento de materias**: Marca materias como aprobadas (✅) o regularizadas (🟨)
- **Progreso visual**: Barra de progreso con sistema de puntos por categoría (anual, cuatrimestral, bimestral, optativas)
- **Modo Árbol**: Vista visual de árbol de correlatividades con líneas de conexión SVG, zoom, y selección interactiva
- **Cursando**: Marca materias que estás cursando actualmente (toggle con animación cyan)
- **Fechas de finales**: Consulta las fechas de exámenes finales disponibles (actualizado Feb-Dic 2026, 61 materias)
- **Vacunas**: Seguimiento de vacunación requerida para la carrera
- **Cartelera**: Verifica publicaciones de cátedras (avisos, exámenes, notas) con filtros por fecha y modos de visualización (por materia / cronológico)
- **Notificaciones por email**: Recibe un email diario (8am) cuando haya nuevas publicaciones en tus cátedras
- **Exportar/Importar**: Guarda y restaura tu estado de progreso
- **Responsive**: Funciona en desktop y mobile
- **Modo oscuro**: Tema "Deep Black" (#000000)

## Cómo usar

### Página principal (index.html)

Marca tus materias como aprobadas (✅) o regularizadas (🟨). Las listas se actualizan automáticamente mostrando qué puedes cursar, qué no puedes cursar, y qué finales podes rendir. Consulta las fechas de exámenes con el botón de calendario. Exporta tu progreso para mantenerlo respaldado.

### Modo Árbol (arbol.html)

Vista visual de todas las correlatividades organizadas por año. Hacé click en una materia para destacar sus correlativas (prerrequisitos y dependientes). Usá los botones ✅🟨🔄 en cada nodo para cambiar el estado. Activá el toggle "Cursando" en las materias disponibles. Ajustá el zoom (30%–300%) y ocultá las optativas con el toggle correspondiente.

### Cartelera (cartelera.html)

Muestra las publicaciones de las cátedras correspondientes a tus materias con estado "Cursando" o "Regularizada". Seleccioná la cátedra cuando haya múltiples opciones. Filtra por fecha (365, 30 o 7 días) y alterná entre vista por materia o cronológica. Marcá publicaciones como leídas (👁). Usá el botón 🔔 Notificarme para suscribirte y recibir emails diarios con nuevas publicaciones.

## Versión

v0.08 — Junio 2026

## Registro de cambios

Ver [LOG.md](LOG.md) para el historial completo de modificaciones.
