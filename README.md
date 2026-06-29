# Correlatividades Medicina UNLP

Plan de Estudios de la Facultad de Ciencias Médicas - Universidad Nacional de La Plata.

Visualiza las correlatividades de la carrera de Medicina: selecciona las materias que ya cursaste/aprobaste y descubre qué puedes cursar.

## Funcionalidades

- **Seguimiento de materias**: Marca materias como aprobadas o regularizadas
- **Progreso visual**: Barra de progreso con sistema de puntos por categoría
- **Modo Árbol**: Vista de árbol de correlatividades con líneas de conexión SVG
- **Fechas de finales**: Consulta las fechas de exámenes finales disponibles
- **Vacunas**: Seguimiento de vacunación requerida
- **Exportar/Importar**: Guarda y restaura tu estado
- **Responsive**: Funciona en desktop y mobile

## Archivos principales

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Página principal |
| `app.js` | Lógica principal |
| `APP/materias.js` | Datos de materias (61 materias) |
| `style.css` | Estilos tema Deep Black |
| `arbol.html` | Modo Árbol (vista de correlatividades) |
| `arbol.js` | Lógica del Modo Árbol |
| `arbol.css` | Estilos del Modo Árbol |
| `cartelera.html` | Página Cartelera (verificar publicaciones de cátedras) |
| `APP/cartelera.js` | Lógica de Cartelera (fetch, parse, render, cache) |
| `APP/cartelera.css` | Estilos de Cartelera (tema oscuro, cards, spinner) |
| `APP/cartelera_ids.js` | Mapeo cátedra→ID de cartelera (67 entries) |
| `worker.js` | Cloudflare Worker proxy (referencia, deploy separado) |
| `vacunas.html` | Seguimiento de vacunas |
| `APP/finales/finales.json` | Fechas de finales |
| `REF/correlativas optativas/optativas.csv` | Datos de referencia (CSV) |

## Registro de cambios

Ver [LOG.md](LOG.md) para el historial completo de modificaciones.
