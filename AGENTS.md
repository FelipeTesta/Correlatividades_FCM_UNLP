# AI Development Guide - Correlatividades Medicina UNLP
This document is intended for AI agents to understand the project's internal logic, conventions, and architecture for consistent updates.

Guidelines:
1. At the end of this file, the "# IMPLEMENT" explain new implementations and new functions we want for the project;
2. After full implementing the new functions, update LOG on README.md and include "✅" for each sucessfully implemented idea on this file;
3. If you can't modify files assume you are in planning mode, read the files, plan all the changes and wait for the user to change to Build mode;
4. Always check for resposivity mobile;
5. ALWAYS CHECK AND UPDATE THIS FILE AFTER CHANGES IN THE PROJECT!
6. Keep section "# The APP" updated for future editing. Keep it simple and 'AI reading' optimized. It doesn't need to be readable for humans.
___
# THE APP
## 1. Project Overview
- **Architecture:** Vanilla JavaScript (ES6+), HTML5, and CSS3. No frameworks (React/Vue/etc.).
- **Folder Layout:**
  - `APP/materias.js` — Subject data (moved from root)
  - `APP/finales/finales.json` — Exam dates (moved from REF/finales/)
  - `APP/vacunas_data.js` — Vaccine data (moved from root)
  - `REF/correlativas optativas/optativas.csv` — Reference data only (not used by app)
- **Rendering Engine:** Single-pass rendering. The `render()` function in `app.js` clears all lists and repopulates them based on the current state and data.
- **State Management:** Persistent state stored in `localStorage`:
  - `estados`: Object `{ "COURSE_CODE": "status" }`. Status can be `"aprobada"` or `"regularizada"`.
  - `proyectosExtension`: Array of `{ id, nombre, horas }`.
  - `anioIngreso`: Current year of enrollment.
  - `boxStates`: Object `{ "BoxName": true/false }` for collapsed/expanded state of UI boxes.
  - `catedrasSeleccionadas`: Object `{ "COURSE_CODE": "catedra_name" }`.

## 2. Data Structure (`APP/materias.js`)
The `materias` array consists of objects with the following schema:
```javascript
{
  codigo: "A0001",           // Unique ID
  nombre: "Anatomía",        // Display Name
  anio: 1,                   // Recommended year (1-6)
  categoria: "anual",        // Points: anual (120), cuatrimestral (60), bimestral (30), optativa (variable)
  horas: 200,                // (Optional) Total hours, mainly for optativas
  paraCursar: [              // Prerequisites to start the course
    { materia: "CODE", condicion: "aprobada" | "regularizada" }
  ],
  paraAprobar: [...]         // Prerequisites to take the final exam
}
```

## 3. Core Logic (`app.js`)
- **Prerequisite Resolution:** `resolverRequisitosTransitivos` uses recursion to find the entire chain of dependencies.
- **Progress Calculation:** `calcularProgreso` returns an object with `cumplidos`, `total`, and `faltantes` (array of missing requirements).
- **Enforcement:** `cumpleRequisitos` validates if a course should be in "Puede Cursar" or "No Puede Cursar".
- **Progress Bar:** Based on a point system (Anual=120, Cuatr=60, Bim=30). Optativas are capped at 270 points.

## 4. UI & Styling (`style.css`)
- **Theme:** "Deep Black" (#000000 background, #e5e5e5 text).
- **Convention:** Use `.item-row` for list items that require complex layouts (like missing prerequisites).
- **Modals:** A custom modal system exists via `mostrarPopupFaltantes` (dynamic DOM creation).
- **Icons:**
  - ✅: Approved (aprobada)
  - 🟨: Regularized (regularizada)
  - 🔄: Reset state
  - ⚠: Warning/Missing Prerequisites

## 5. Development Rules
1. **Naming Convention:** ALL new functions, variables, and CSS classes must be named in **English**. Do not rename existing legacy code which is mostly in Spanish/Portuguese.
2. **Persistence:** Any state change MUST be followed by a call to `guardarLocalYRender()` to ensure the UI stays in sync with `localStorage`.
3. **DOM Manipulation:** Prefer `document.createElement` and `innerText` for security and performance over `innerHTML` where possible.
4. **Modularity:** Keep `materias.js` as a pure data file. Logic belongs in `app.js`.

## 6. List IDs
- `aprobadas`: Finalized courses.
- `puedeFinal`: Regularized courses ready for final.
- `noPuedeFinal`: Regularized courses blocked by prerequisites.
- `puedeCursar-obligatorias` / `puedeCursar-optativas`: Available courses.
- `noPuedeCursar-obligatorias` / `noPuedeCursar-optativas`: Blocked courses.
- Tree mode page: arbol.html (separate page, shares localStorage)

## 7. Tree Mode (arbol.html)
- **Architecture:** Separate page sharing localStorage state with main page
- **Layout:** Horizontal rows per year. Each year has `.year-section` > `.year-header` + `.subjects-row.obrigatorias` + `.subjects-row.optativas`. Long lists split into 2 `.sub-row` divs (obrigatórias >8, optativas >6). Centered via `max-width: 1200px; margin: 0 auto`.
- **Node Colors:** aprobada=#22c55e (with dark green gradient + glass reflection animation), regularizada=#f97316 (with dark orange gradient, no glass), puede-cursar=#facc15, no-puede-cursar=#333 (dimmed text #4a4a4a), optativa-puede-cursar=#a855f7 (purple/lilás), optativa-no-puede-cursar=#581c87 (dark purple, dimmed text), cursando-active=#22d3ee (cyan gradient + animated border glow)
- **Node Actions:** 3 small buttons per node (✅ aprobar, 🟨 regularizar, 🔄 resetear). Hidden by default, visible on hover (always visible on mobile). On "puede-cursar" nodes, a "Cursando" toggle switch appears on the LEFT side of the actions row (separated from the right-side buttons via CSS `order: -1`).
- **Selection System:** Click node to highlight correlatives (prerequisites + dependents), dim others. ESC or "✕ Limpar" button to deselect. Lines only visible in selection mode.
- **Lines:** Vertical Bezier curves from bottom-center of prerequisite to top-center of dependent. 4 visual states based on both paraCursar AND paraAprobar requirements: (1) Gray #666 solid = can't take course, missing cursada; (2) White #ffffff solid = can't take course, missing final; (3) Green #22c55e dashed = can take course but can't take final; (4) Green #22c55e solid = everything met. Purple #a855f7 = optativa. Only visible when a node is selected (focus mode). Uses `getConnectionVisualStyle()` which evaluates both requirement types simultaneously.
- **Legend:** Fixed bottom-right, auto-hides after 10s. "📋 Legenda" button toggles visibility. Entries: ✅ Cumplido (green #22c55e), ── No cumplido (Cursada) (gray #666), -- No cumplido (final) (light gray #999), purple (#a855f7) = optativa. New entry: Cursando (ON) with cyan dot.
- **Optativas:** "Optativa" label in purple (#a855f7) before each optativas row. Toggle switch "Optativas" hides/shows optativa rows AND their labels, which redraws SVG connections.
- **Scrollbar:** Custom dark-themed scrollbar matching the app theme
- **Zoom:** CSS transform scale with +, -, reset controls (30%-300%)
- **🟡 Indicator:** Subjects blocked by exactly 1 missing prerequisite show 🟡 emoji next to name
- **Glass Effect:** Approved nodes (`.status-aprobada`) have a `::after` pseudo-element with animated white gradient (glassShine keyframe) simulating a glass reflection sweep
- **Year headers:** "Año" (Spanish) instead of "Ano"
- **Compact layout:** Reduced spacing, smaller fonts, tighter padding throughout
- **Mobile:** Cards stack vertically, action buttons always visible, 44px touch targets, 100dvh viewport
- **Cursando Feature:** Toggle switch "Cursando" on puede-cursar nodes. When ON: node gets cyan gradient background + white/cyan rotating conic-gradient border (with glow). Dependent nodes that would become available get a subtle black/white rotating border animation (no glow). State persisted in localStorage as `cursando: { "CODE": true }`.
- **Cursando Animation:** Uses `@property --border-angle` with `@keyframes borderAngleRotate`. Border: 1.5px transparent with `background-clip: padding-box, border-box` technique. `cursando-active` uses `conic-gradient(#ffffff, #22d3ee)` with box-shadow glow. `cursando-pending` uses `conic-gradient(#ffffff, #333)` without glow.
- **Optativa Color Change:** Optativas changed from cyan (#22d3ee) to purple/lilás (#a855f7). Dark variant: #581c87.
- **Double scrollbar fix:** `.tree-page` has `height: 100vh; overflow: hidden`, `.tree-wrapper` has `overflow: auto; min-height: 0`
- **SVG Connector Architecture:** SVG is absolutely positioned inside `.tree-wrapper` (position:relative, overflow:auto) and scrolls with content. `nodeRect - svgRect` (both viewport-relative via getBoundingClientRect()) gives stable coordinates regardless of scroll position.
- **SVG Dimensions:** `updateSvgDimensions()` uses hide-SVG → measure `scrollWidth/scrollHeight` → restore-SVG to avoid feedback loop from SVG contributing to its own scrollWidth.
- **Selection Visuals:** `applySelectionVisuals()` applies highlight/dimmed classes to nodes and paths without toggle logic. Used by both `drawConnections()` (after path recreation) and `selectNode()` (on user click). `drawConnections()` must NOT call `selectNode()` because `selectNode()` has toggle logic that would deselect.
- **Scroll Listener:** Registered once at DOMContentLoaded (not inside initTree which runs on every state change). Only calls `drawConnections()`, NOT `updateSvgDimensions()`.
___
# IMPLEMENT
- [x] Implementar modo oscuro
- [x] Mejorar validación de formularios
- [x] Añadir exportar/importar estado
- [x] Actualizar popup de ayuda con últimas actualizaciones
- [x] Migrar logs a LOG.md
- [x] Actualizar fechas de finales (Abril-Diciembre 2026)
- [x] Migrar sistema de finales a JSON
- [x] Regenerar JSON completo desde CSVs (Feb-Dic 2026, 61 materias)
- [x] Corregir ordenamiento de fechas en popup (Próximas↑, Anteriores↓)
- [x] Persistir estado colapsado/aberto de boxes em localStorage
- [x] Corrigir CSS duplicado fora do @media query e seletores duplicados
- [x] Corrigir grid-template-columns sem display grid
- [x] Adicionar validação de Date NaN em parseFechaLocal
- [x] Adicionar contadores [N] em todos os boxes e subseções
- [x] Redesenhar botão de calendário com efeito de volume
- [x] Implementar Modo Árbol (vista de árbol de correlatividades)
- [x] Refinar status optativas (optativa-puede-cursar / optativa-no-puede-cursar)
- [x] Reestruturar layout do árbol: cada ano tem sub-colunas (obrigatórias + optativas)
- [x] Adicionar toggle "Optativas" para ocultar/mostrar optativas no árbol
- [x] Adicionar 🟡 em matéria com exatamente 1 pré-requisito faltante no Árbol
- [x] Implementar multi-coluna no Ano 4 obrigatórias e Ano 5 optativas
- [x] Layout horizontal: anos como filas, matérias como cards lado a lado
- [x] Legendas: auto-hide após 10s, botão "📋 Legenda", linhas sólidas (Cursada) e tracejadas (final)
- [x] Efeito vidro (glass reflection) nos nós aprovados
- [x] Botões de ação visíveis apenas no hover (sempre visíveis no mobile)
- [x] Setas verticais: saem do centro-inferior, chegam ao centro-superior
- [x] Layout compacto com espaçamento reduzido
- [x] Correção de scrollbar duplo (overflow: hidden na página, auto no wrapper)
- [x] Layout centralizado (max-width: 1200px)
- [x] Labels "Año" e "Optativa" em espanhol
- [x] Removido border-left cyan das optativas (alinhamento de cards)
- [x] Mobile responsivo otimizado (cards verticais, touch 44px, 100dvh)
- [x] Corrigir bug de ordenação categoryOrder (0 falsy com || 99)
- [x] Corrigir CSS: .top-bar display:flex no desktop
- [x] Corrigir CSS: body margin 20px→12px
- [x] Corrigir CSS: .box h3 margin-left 14px→0
- [x] Aumentar espaçamento entre cards no Modo Árbol
- [x] Acessibilidade: focus-visible, ARIA labels, tabindex, keyboard support
- [x] Acessibilidade: contraste de cores (#4a4a4a→#666, #777→#999, #4ade80→#6ee7a0)
- [x] Touch targets: btn-calendario 44px, node-btn 44px mobile, zoom 44px
- [x] Robustez: try/catch em localStorage (Safari private browsing)
- [x] Performance: remover setTimeout redundante e console.log
- [x] Limpeza: CSS morto removido
- [x] Reorganizar estrutura: dados lógicos em APP/, referência em REF/
- [x] Corrigir setas SVG: scroll/hover/click (updateSvgDimensions, applySelectionVisuals, mouseenter removal)
- [x] Gradiente laranja escuro em matérias regularizadas no Modo Árbol (sem reflexo)
- [x] Botão Cursando (toggle switch) em matérias "puede-cursar" com animação de borda rotativa (cyan/branco com glow)
- [x] Animação sutil (preto/branco) em correlativas que ficariam disponíveis com Cursando
- [x] Cores das optativas alteradas de ciano (#22d3ee) para roxo/lilás (#a855f7)
- [x] Corrigir posição do toggle Cursando (CSS order:-1 para lado esquerdo)
- [x] Corrigir cores das setas paraAprobar: drawConnections prioriza paraAprobar sobre paraCursar
- [x] Adicionar linha tracejada (stroke-dasharray) para setas paraAprobar não cumpridas
- [x] Implementar 4 estados visuais das setas: getConnectionVisualStyle() evalúa paraCursar + paraAprobar simultáneamente
- [x] Legenda: restaurar swatch Cursando (ON), remover botão duplicado 📖 Cursando
- [x] Ocultar labels "Optativa" quando toggle Optativas=OFF no initTree()

## LOG DE IMPLEMENTACIONES
- 05/06/2026
  + Reorganização da estrutura de pastas:
    - Criada pasta APP/ com materias.js e finales/finales.json
    - REF/ agora contém apenas dados de referência (CSV)
    - Removido optativas_lista.js (dados já em materias.js)
    - vacunas_data.js movido para APP/vacunas_data.js
    - Atualizados caminhos em index.html, arbol.html e app.js
- 05/06/2026
  + Layout horizontal: anos como filas, matérias como cards lado a lado com `.subjects-row`
  + Listas longas divididas em 2 `.sub-row` (obrigatórias >8, optativas >6)
  + Legendas atualizadas: "No cumplido (Cursada)" linha sólida, "No cumplido (final)" linha tracejada
  + Auto-hide da legenda após 10 segundos, botão "📋 Legenda" para reexibir
  + Efeito vidro (glass reflection) nos nós aprovados: `::after` com gradiente branco animado (glassShine keyframe)
  + Botões de ação (✅🟨🔄) visíveis apenas no hover, sempre visíveis no mobile
  + Setas SVG verticais: saem do centro-inferior do pré-requisito, chegam ao centro-superior do dependente
  + Linhas tracejadas para paraAprobar (falta final), sólidas para paraCursar (falta cursada)
  + Layout compacto: espaçamento reduzido, fontes menores, padding mais apertado
  + Correção de scrollbar duplo: `height: 100vh; overflow: hidden` na página, `overflow: auto; min-height: 0` no wrapper
  + Layout centralizado: `max-width: 1200px; margin: 0 auto` no zoom container
  + Labels "Año" e "Optativa" em espanhol (corrigido de "Ano")
  + Removido border-left cyan das optativas para alinhamento correto dos cards
  + Mobile responsivo otimizado: cards verticais, botões sempre visíveis, touch targets 44px, `100dvh`
  + Z-index corrigido: SVG atrás dos nós (z-index: 0), nós acima (z-index: 1 via zoom container)
- 04/05/2026
  + Contadores [N] em todos os boxes e subseções: função `actualizarContadores()` lê `children.length` de cada `<ul>` e atualiza spans `.box-count`.
  + Correção de `toggleSubsection()` e `restoreBoxStates()`: uso de `innerHTML` ao trocar ▾/▸ para preservar `<span class="box-count">`.
  + Botão de calendário redesenhado: forma quadrada fixa, sombras internas/externas com efeito de volume, hover sem animação no emoji.
  + Persistência de estado de boxes: novo `boxStates` em localStorage. Funções `getBoxKey()`, `saveBoxState()`, `restoreBoxStates()` e chamada automática no final de `render()`.
  + Correção crítica de CSS: removidas 161 linhas duplicadas fora do `@media` query (CSS mobile era aplicado em todas as telas).
  + Removidos seletores CSS duplicados: `.btn-primary:hover`, `.top-bar-controls label`, `.top-bar-divider`.
  + Corrigido `grid-template-columns: 1fr` sem `display: grid` em `.listas`.
  + Validação de `NaN` em `parseFechaLocal()` retorna `null` para datas inválidas.
  + CSS reduzido de 1132 para ~990 linhas.
- 04/05/2026
  + Regeneración completa de finales.json desde CSVs (61 materias, Feb-Dic 2026).
  + Corrección de bug de timezone: `new Date()` → `parseFechaLocal()` para evitar desfase -1 día en GMT-3.
  + Corrección de nombres de cátedras truncados (ej: "sicología Médica" → "Psicología Médica").
  + Ordenamiento de fechas en popup: Próximas ascendente, Anteriores descendente.
  + Corrección crítica de IDs en `agregar()`: arreglado error de sintaxis en `app.js` (espacios en IDs) que impedía la visualización de fechas.
  + Corrección en despliegue de fechas de finales en UI: ajuste del mapeo de nombres de materias en `cargarFechasFinales()`.
  + Migración de sistema de finales a JSON (`REF/finales/finales.json`) y refactorización de `cargarFechasFinales()` en `app.js`.
  + Actualización de fechas de finales (Abril-Diciembre 2026).
  + Migración de logs a LOG.md y limpieza de README.md.
  + Implementación de paginación en modal de ayuda mostrando últimas actualizaciones.
- 29/03/2026
  + Unificación de datos: fusionado optativas_lista.js en materias.js
  + Corrección de valores 'anio' incorrectos: FM001:2, GE001:2, IES01:1, MGF:5
  + Modificación del cálculo de porcentaje de progreso: excluido segmento 'puede cursar'
  + Verificación de función resetearTodos(): limpia correctamente todos los estados
  + Confirmación de funcionamiento con estructura de datos unificada
- 05/06/2026
  + Implementação completa do Modo Árvol (arbol.html, arbol.js, arbol.css)
  + Grid de 6 colunas (uma por ano) com nós interativos e linhas SVG bezier
  + Sistema de seleção: clique destaca correlativas, ESC/botão limpa seleção
  + Clique direito cicla estado (none→regularizada→aprobada→none)
  + Cores predominantes nos nós com fundo semi-transparente por status
  + Cor "puede cursar" alterada para amarelo (#facc15)
  + Optativas separadas das obrigatórias com divisor cyan dentro de cada coluna
  + Scrollbar customizada para combinar com tema escuro
  + Correção de hover que causava segundo scrollbar
  + Zoom com controles +, -, reset (30%-300%)
  + Layout reorganizado em duas seções lado a lado (Obrigatórias + Optativas)
  + Botões de estado (✅🟨🔄) em cada nó substituindo ciclo por clique direito
  + Conectores SVG visíveis apenas no modo foco (seleção de matéria)
  + Setas dos conectores reduzidas
  + Compartilha localStorage com página principal
  + Refinado status de optativas no árbol: `getSubjectStatus()` agora retorna `optativa-puede-cursar` ou `optativa-no-puede-cursar` baseado em pré-requisitos
  + Layout reestruturado: cada coluna de ano contém duas sub-colunas (obrigatórias + optativas) em vez de seções separadas
  + Adicionado toggle "Optativas" na barra superior para ocultar/mostrar optativas, com redesenho automático das conexões SVG
  + Conexões SVG ignoram nós ocultos (offsetParent === null) para evitar curvas para coordenadas zero
  + Adicionado 🟡 em matérias com exatamente 1 pré-requisito faltante: função `countMissingPrerequisites()` implementada para verificação recursiva de `paraCursar`, incluindo OPT-HORAS
  + Implementada multi-coluna no Ano 4 obrigatórias (17 matérias → 2 sub-colunas) e Ano 5 optativas (12 optativas → 2 sub-colunas)
  + Novas classes CSS `.multi-column` e `.sub-column` para layout flex de 2 colunas
  + Texto escurecido (#4a4a4a) em matérias "no puede cursar" e "optativa-no puede cursar"
- 05/06/2026
  + Atualizada documentação de linhas no AGENTS.md: cores (#22c55e=cumplido, #facc15=falta final, #666=não cumplido, #22d3ee=optativa), legenda refletindo esquema atual
- 05/06/2026
  + Atualizado esquema de cores de linhas: #666 = no cumplido (cursada), #999 = no cumplido (final), removido #facc15 (falta final). Legendas atualizadas: ── No cumplido (Cursada) (gray #666), -- No cumplido (final) (light gray #999).
- 06/06/2026
  + Modo Árbol aprimorado: fundo de aprovadas escurecido (`#003803`), gradiente 100deg.
  + Animação "glass shine" ajustada: mais lenta (6s), contínua e ângulo 100deg.
  + Conectores: removido pontilhado, todos contínuos. Cores: Branco (#ffffff) p/ Final, Cinza (#666) p/ Cursada.
  + Foco (seleção): lógica corrigida para destacar apenas conexões diretas (vizinhos).

