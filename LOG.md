### 12/06/2026 - Ajustes finais: legenda e ocultar labels optativas

**Legenda (arbol.html):**
- Restaurado swatch "Cursando (ON)" com gradiente ciano e glow
- Removido botão duplicado "📖 Cursando" de legend-buttons

**Labels Optativa (arbol.js):**
- `initTree()` agora oculta `optLabel` (display:none) quando toggle Optativas=OFF
- Antes apenas a `.subjects-row.optativas` era ocultada, o label "Optativa" permanecia visível

### 12/06/2026 - Sistema de 4 estados visuais para setas de correlatividades

**Nova função `getConnectionVisualStyle()` (arbol.js):**
- Substitui `getLineColor()` — agora avalia paraCursar E paraAprobar simultaneamente
- 4 estados visuais implementados:
  1. Cinza (#666) sólido: Não posso cursar, falta cursada (regularizada não cumprida)
  2. Branco (#ffffff) sólido: Não posso cursar, falta final (aprobada não cumprida)
  3. Verde (#22c55e) tracejado: Posso cursar mas não posso fazer final
  4. Verde (#22c55e) sólido: Posso cursar e fazer final (tudo cumprido)

**Refatoração `drawConnections()` (arbol.js):**
- Agora coleta E armazena ambos os requisitos (paraCursar + paraAprobar) por conexão
- Dois passes: paraCursar primeiro, depois paraAprobar (merge no mesmo objeto)
- Cada conexão usa `getConnectionVisualStyle()` que retorna `{ color, dashed }`

**Legenda atualizada (arbol.html):**
- 5 itens: Cumplido (verde), No cumplido Cursada (cinza), No cumplido Final (branco), Puede cursar falta final (verde tracejado), Optativa (roxo)

### 12/06/2026 - Correções: posição toggle Cursando, cores setas paraAprobar, linhas tracejadas

**Toggle Cursando (arbol.css):**
- Adicionado `order: -1` em `.node-cursando-toggle` para posicionar à esquerda dos botões de ação

**Setas paraAprobar (arbol.js):**
- Refatorada `drawConnections()`: coleta todas as conexões em dois passes (paraAprobar primeiro, depois paraCursar)
- paraAprobar tem prioridade sobre paraCursar quando o mesmo par aparece em ambos os arrays
- Correta coloração: setas paraAprobar não cumpridas agora mostram #ffffff (branco) em vez de #666 (cinza)

**Linhas tracejadas (arbol.js + arbol.html):**
- Adicionado parâmetro `isDashed` em `drawBezier()` com `stroke-dasharray: 6 3`
- Setas paraAprobar não cumpridas são tracejadas; cumpridas ou optativas permanecem sólidas
- Atualizada legenda: "No cumplido (Final)" mostra linha tracejada branca

### 12/06/2026 - Botão Cursando (toggle switch) + Cores Optativas roxo/lilás no Modo Árbol
- **Novo estado `cursando`** persistido em localStorage (`cursando: { "CODE": true }`)
- **Toggle switch "Cursando"** adicionado no lado esquerdo dos nós `puede-cursar` / `optativa-puede-cursar`
  - Layout: "Cursando" {switch mini} à esquerda, botões ✅🟨🔄 à direita (`justify-content: space-between`)
  - Switch mini: 28x16px, slider com fundo ciano quando ativo
- **Quando Cursando ON:**
  - Nó original: fundo gradiente ciano escuro (`#023e4a` → `#065a6b`) + borda rotativa branca/ciano com glow (`box-shadow: 0 0 8px rgba(34,211,238,0.4)`)
  - Correlativas dependentes: apenas animação de borda rotativa preto/branco (sutil, sem glow)
- **Animação CSS:** `@property --border-angle` + `@keyframes borderAngleRotate` (3s linear infinite)
  - Técnica: `background-clip: padding-box, border-box` com `conic-gradient(from var(--border-angle), ...)`
  - `cursando-active`: `conic-gradient(#ffffff, #22d3ee)` + `box-shadow` glow
  - `cursando-pending`: `conic-gradient(#ffffff, #333)` sem glow
- **Cores optativas alteradas** de ciano para roxo/lilás:
  - `#22d3ee` → `#a855f7` (border, text, label, dependents, toggle switch)
  - `#1a6b73` → `#581c87` (dark variant for no-puede-cursar)
  - `rgba(34,211,238,...)` → `rgba(168,85,247,...)` (background opacity)
- **Funções JS:** `isCursando()`, `toggleCursando()`, `cumpleRequisitosConCursando()`, `verificarRequisitoConCursando()`, `wouldBeAvailableWithCursando()`, `applyCursandoEffects()`
- **Legenda atualizada:** entrada "Cursando (ON)" com dot ciano, botão "📖 Cursando" na seção de buttons

### 07/06/2026 - Gradiente laranja escuro em matérias regularizadas no Modo Árbol
- Adicionado gradiente de fundo laranja escuro em `.subject-node.status-regularizada` no `arbol.css`
- Gradiente segue o mesmo padrão do `.status-aprobada` (ângulo 100deg, fallback sólido) porém em tons de laranja escuro (`#4a1a06` → `#782808`)
- Sem efeito glass/reflexo (sem `::after` pseudo-element)

### 07/06/2026 - Corrección de setas SVG no Modo Árbol (scroll, hover, click)
- Problema: setas desapareciam ao fazer scroll, hover e click
- **Fix raiz:** `updateSvgDimensions()` usava `getBoundingClientRect()` (viewport-relative) que encolhia durante scroll. Reescrito para hide-SVG → measure scrollWidth/scrollHeight → restore-SVG
- **Bug de seleção:** `drawConnections()` chamava `selectNode(selectedNode)` para reaplicar highlight, mas `selectNode()` tem lógica toggle (se mesmo nó → deselectAll). Criada `applySelectionVisuals()` que aplica classes highlight/dimmed diretamente sem toggle
- **Flash no click:** Removido listener mouseenter que chamava `drawConnections()` após 250ms, causando ciclo clear+recreate visível
- **Cleanup handlers:** resize e scroll listener não chamam mais `updateSvgDimensions()` — apenas `drawConnections()`
- Scroll listener registrado uma vez no DOMContentLoaded (não dentro de initTree)

### 06/06/2026 - Melhorias Modo Árbol (Reflexo, Linhas e Foco)
- Fundo das matérias aprovadas alterado para gradiente escuro (`#003803`)
- Ângulo da animação "glass shine" ajustado para 100deg (consistente com o fundo)
- Animação "glass shine" tornada mais lenta (6s) e contínua
- Removido estilo de linha pontilhada (`paraAprobar`); agora todas são contínuas
- Cores das linhas atualizadas: Branco (#ffffff) = Requisito não cumprido (Final), Cinza (#666) = Não cumprido (Cursada)
- Corrigido lógica de `selectNode` e `findCorrelatives`: agora mapeia apenas conexões diretas (vizinhos), evitando seleção de toda a rede de uma vez

### 06/06/2026 - Configuração do GitHub Pages
- Adicionado `_config.yml` para desabilitar processamento Jekyll (theme: null)
- Adicionado `.nojekyll` como marcador de segurança para bypass total do Jekyll
- Excluídos do build: AGENTS.md, LOG.md, REF/, .gitignore, README.md
- Scan de segurança concluído: nenhuma informação sensível encontrada (100% limpo para deploy público)

### 05/06/2026 - Reorganização da estrutura de pastas
- Criada pasta `APP/` para dados lógicos do site
- `materias.js` movido para `APP/materias.js`
- `finales.json` movido de `REF/finales/` para `APP/finales/finales.json`
- `vacunas_data.js` movido para `APP/vacunas_data.js`
- `optativas_lista.js` removido (dados já em materias.js)
- `REF/` agora contém apenas dados de referência (CSV)
- Caminhos atualizados em `index.html`, `arbol.html` e `app.js`
- Esquema de cores das linhas SVG atualizado: verde (#22c55e) = cumplido, cinza (#666) = no cumplido (cursada), cinza claro (#999) = no cumplido (final), ciano (#22d3ee) = optativa

### 05/06/2026 - Revisão geral de otimização e compatibilidade
+ Correção de bug: `categoryOrder` com valores 0-3 causava ordenação invertida (0 era falsy com `|| 99`). Valores alterados para 1-4.
+ Correção de CSS: `.top-bar` sem `display:flex` no desktop — botão "¿CÓMO USAR?" não ficava à direita.
+ Correção de CSS: `body { margin: 20px }` reduzido para `12px` (espaço excessivo).
+ Correção de CSS: `.box h3 { margin-left: 14px }` alterado para `0` (inconsistência com `ul`).
+ Aumento de espaçamento entre cards no Modo Árbol: gap 3→6px, margins 4→8px, 2→4px, 8→14px.
+ Acessibilidade: `*:focus-visible` com outline cyan (#22d3ee) adicionado em style.css e arbol.css.
+ Acessibilidade: ARIA labels adicionados aos botões ✅🟨🔄 no Modo Árbol.
+ Acessibilidade: `role="switch"` e `aria-label` adicionados ao toggle de optativas.
+ Acessibilidade: `aria-live="polite"` adicionado ao display de zoom.
+ Acessibilidade: `tabindex="0"` e `role="button"` adicionados aos headers de boxes (h3/h4).
+ Acessibilidade: Suporte a teclado (Enter/Space) para toggles de boxes.
+ Acessibilidade: Contraste de cores corrigido: `#4a4a4a` → `#666`, `#777` → `#999`, `#4ade80` → `#6ee7a0`.
+ Touch targets: `.btn-calendario` aumentado de 28→44px, `.node-btn` mobile 44px mínimo, zoom buttons 44px.
+ Robustez: Todos os `localStorage.getItem/setItem` envolvidos em try/catch (Safari private browsing).
+ Performance: Removido `setTimeout` redundante no arbol.js (double-render).
+ Performance: Removidos `console.log` de produção (4 ocorrências em app.js).
+ Limpeza: Regra CSS morta `.node-border.status-optativa` removida do arbol.css.

### 05/06/2026 - Refinamentos visuais do Modo Árbol (parte 2)
- Layout horizontal: anos como filas, matérias como cards lado a lado com `.subjects-row`
- Listas longas divididas em 2 `.sub-row` (obrigatórias >8, optativas >6)
- Legendas atualizadas: "No cumplido (Cursada)" linha sólida, "No cumplido (final)" linha tracejada
- Auto-hide da legenda após 10 segundos, botão "📋 Legenda" para reexibir
- Efeito vidro (glass reflection) nos nós aprovados: `::after` com gradiente branco animado (glassShine keyframe)
- Botões de ação (✅🟨🔄) visíveis apenas no hover, sempre visíveis no mobile
- Setas SVG verticais: saem do centro-inferior do pré-requisito, chegam ao centro-superior do dependente
- Linhas tracejadas para paraAprobar (falta final), sólidas para paraCursar (falta cursada)
- Layout compacto: espaçamento reduzido, fontes menores, padding mais apertado
- Correção de scrollbar duplo: `height: 100vh; overflow: hidden` na página, `overflow: auto; min-height: 0` no wrapper
- Layout centralizado: `max-width: 1200px; margin: 0 auto` no zoom container
- Labels "Año" e "Optativa" em espanhol (corrigido de "Ano")
- Removido border-left cyan das optativas para alinhamento correto dos cards
- Mobile responsivo otimizado: cards verticais, botões sempre visíveis, touch targets 44px, `100dvh`
- Z-index corrigido: SVG atrás dos nós (z-index: 0), nós acima (z-index: 1 via zoom container)

### 05/06/2026 - Indicador 🟡 e multi-coluna no Modo Árbol
- Adicionado 🟡 em nódos com exatamente 1 pré-requisito faltante (status "no-puede-cursar" ou "optativa-no-puede-cursar")
- Nova função `countMissingPrerequisites()` que conta requisitos não cumpridos em `paraCursar`, incluindo OPT-HORAS
- Implementada multi-coluna para Ano 4 obrigatórias (17 matérias divididas em 2 sub-colunas) e Ano 5 optativas (12 optativas divididas em 2 sub-colunas)
- Novas classes CSS `.multi-column` e `.sub-column` para layout flex de 2 colunas
- Documentação atualizada em AGENTS.md e LOG.md

### 05/06/2026 - Refinamentos do Modo Árbol
- Status de optativas agora distinguem: optativa-puede-cursar (cyan #22d3ee) e optativa-no-puede-cursar (#1a6b73) baseado em pré-requisitos
- Layout reestruturado: 6 colunas de ano, cada uma com sub-colunas obrigatórias (esquerda) + optativas (direita)
- Adicionado toggle "Optativas" na barra superior para ocultar/mostrar colunas de optativas
- Conexões SVG ignoram nós ocultos (offsetParent === null) para evitar curvas inválidas
- Legendas atualizadas com os dois status de optativa

### 05/06/2026 - Implementación del Modo Árbol (vista de árbol de correlatividades)
- Nuevos archivos creados: `arbol.html`, `arbol.css`, `arbol.js`.
- Página independiente que comparte `localStorage` con la página principal.
- Layout de 6 columnas (una por año) con grid CSS.
- Nodos redondeados con borde izquierdo de 4px coloreado por estado (aprobada=#22c55e, regularizada=#f97316, puede-cursar=#4ade80, no-puede-cursar=#333, optativa=#22d3ee).
- Click en nodos cicla estado: ninguno → regularizada → aprobada → ninguno.
- Líneas SVG Bezier curvas desde prerequisitos a dependientes, con flechas.
- Colores de líneas según cumplimiento: verde (cumplido), naranja (pendiente), gris (no cumplido), cian (optativa).
- Manejo de prerequisito especial OPT-HORAS (horas optativas >= 270).
- Manejo de referencia forward PD001 (año 4) → I0001 (año 5) con curvas derecha-a-izquierda.
- Controles de zoom: +, −, restablecer, con transform CSS scale.
- Leyenda flotante fija en esquina inferior derecha.
- Diseño responsive con scroll horizontal en mobile.
- Botón "🌳 Modo Árbol" agregado a la barra superior de `index.html`.

### 04/05/2026 - Persistência de estado de boxes e otimização de código
- Adicionada persistência em localStorage para estado colapsado/aberto dos boxes principais e subseções optativas.
  - Novo key `boxStates` em localStorage salva preferências do usuário entre sessões.
  - Estado restaurado automaticamente após cada `render()`.
- Correção crítica: removido CSS duplicado fora do `@media` query (linhas 987-1132 de 1132). Regras mobile eram aplicadas em todas as telas.
- Removidos seletores CSS duplicados: `.btn-primary:hover`, `.top-bar-controls label`, `.top-bar-divider`.
- Corrigido `grid-template-columns: 1fr` em `.listas` (elemento é flex, não grid).
- Adicionada validação de `NaN` em `parseFechaLocal()` para evitar datas inválidas.
- CSS reduzido de 1132 para 971 linhas.
- Botão de calendário (`.btn-calendario`) redesenhado: forma sempre quadrada, sombras internas/externas com efeito de volume, hover sem escala (só sombras e borda animam).

### 04/05/2026 - Contadores de itens por Box
- Adicionados contadores `[N]` em todos os boxes e subseções (Aprobadas, Regularizadas, Puede cursar, No puede cursar, Proyectos de Extensión + subseções internas).
- Nova função `actualizarContadores()` chamada no final de `render()`. Conta filhos de cada `<ul>` e atualiza spans `.box-count`.
- Corrigido `toggleSubsection()` e `restoreBoxStates()` para usar `innerHTML` ao trocar ícones ▾/▸, preservando o elemento `<span class="box-count">`.

### 04/05/2026 - Corrección de ordenamiento de fechas en popup de finales
- PopUp de "Fechas de Final" ahora ordena correctamente:
  - **Próximas**: ascendente (menor → mayor)
  - **Anteriores**: descendente (mayor → menor)
- Ajuste en `actualizarFechasPopup()` y construcción de `datos` en `mostrarPopupFechas()`.

### 04/05/2026 - Regeneración completa de finales.json desde CSVs
- Regenerado `REF/finales/finales.json` con datos completos de ambas planillas CSV (1er y 2do quad 2026).
- 61 materias con fechas completas (Febrero-Diciembre 2026).
- Corrección de bug de timezone: reemplazado `new Date(f.fecha)` por `parseFechaLocal()` para evitar desfase de -1 día en GMT-3.
- Corrección de nombres de cátedras truncados (ej: "sicología Médica" → "Psicología Médica").

### 04/05/2026 - Corrección crítica de IDs en `agregar()`
- Corregidos errores de sintaxis en `app.js` donde las comparaciones de IDs tenían espacios extra (`"no puedeFinal"` → `"noPuedeFinal"`, `"no puede cursar"` → `"noPuedeCursar"`), lo que impedía la visualización correcta de las fechas de finales en la UI.

### 04/05/2026 - Corrección en despliegue de fechas de finales
- Corrección del mapeo del nombre de la materia en `cargarFechasFinales()` para asegurar que las fechas se visualicen correctamente en la interfaz.

### 04/05/2026 - Migración de sistema de finales a JSON
- Migración de almacenamiento de fechas de finales de CSV a JSON (`REF/finales/finales.json`) para mejorar mantenibilidad y robustez.
- Refactorización de `cargarFechasFinales()` en `app.js` para consumir el archivo JSON.

### 04/05/2026 - Actualización de fechas de finales y migración de registros
- Actualización de fechas de finales (Abril-Diciembre 2026).
- Migración de logs a LOG.md y limpieza de README.md.
- Implementación de paginación en modal de ayuda mostrando últimas actualizaciones.

### 29/03/2026 - Unificación de datos y correcciones
- Unificación de datos: fusionado optativas_lista.js en materias.js
- Corrección de valores 'anio' incorrectos: FM001:2, GE001:2, IES01:1, MGF:5
- Modificación del cálculo de porcentaje de progreso: excluido segmento 'puede cursar'
- Verificación de función resetearTodos(): limpia correctamente todos los estados
- Confirmación de funcionamiento con estructura de datos unificada
