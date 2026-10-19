# DESIGN.md — Correlatividades Medicina UNLP

> Contrato visual do projeto. **Autoridade:** código > este arquivo > canon global
> (`C:\Users\Testa\.config\opencode\prompts\design-shared.md`). Leia antes de tocar CSS/HTML.
> Criado 2026-10-16 (rodada de auditoria visual). Idioma da UI: **espanhol** (não traduzir).
> Tokens: **`APP/variables.css` é a única fonte de cor** — nenhum hex solto em regra nova.

## 0. Escopo

App estático (vanilla ES6+/HTML5/CSS3, sem framework, sem build). **Tema único escuro
"Deep Black"** (`color-scheme: dark`; não existe tema claro — decisão do projeto, não criar).
Cascata obrigatória: `variables.css → base.css → nav.css → <page>.css`.
6 páginas: `index`, `arbol`, `cartelera`, `vacunas`, `extension`, `universidades`.

## 1. Identidade

- Fundo absoluto preto (`--bg #000000`) com superfícies elevadas em cinza muito baixo.
- Densidade alta: é uma ferramenta de estudo (listas longas, tabelas, árvore), não uma landing.
- Cores saturadas **só** com significado de estado (aprovada/regularizada/cursando/optativa).
- Emojis são a linguagem de ícone (ver §8).

## 2. Paleta (`APP/variables.css` — valores atuais, não re-valorar)

| Token | Valor | Papel | Contraste vs `#000` |
|---|---|---|---|
| `--bg` | `#000000` | fundo da página | — |
| `--bg-elevated` | `#0a0a0a` | trilha de scrollbar, tooltips | — |
| `--bg-card` | `#111111` | cards, caixas de lista | — |
| `--bg-hover` | `#1a1a1a` | hover de linhas/botões | — |
| `--bg-input` | `#222222` | inputs, bordas internas | — |
| `--text` | `#e5e5e5` | texto principal | 15.8:1 ✅ |
| `--text-muted` | `#999999` | texto secundário | 7.4:1 ✅ |
| `--text-faint` | `#888888` | texto terciário | 5.9:1 ✅ |
| `--text-dim` | `#666666` | **só decorativo** (bordas, desativado, textos não essenciais) | 3.7:1 ⚠️ |
| `--border` | `#333333` | borda padrão | (não-texto) |
| `--border-strong` | `#444444` | borda em destaque/hover | (não-texto) |
| `--aprobada` | `#22c55e` | ✅ matéria aprovada | 9.1:1 ✅ |
| `--regularizada` | `#f97316` | 🟧 regularizada (falta final) | 7.5:1 ✅ |
| `--cursando` | `#22d3ee` | 🔄 cursando / foco / destaque | alto ✅ |
| `--optativa` | `#a855f7` | ⭐ optativa favorita | 5.3:1 ✅ |
| `--optativa-dark` | `#581c87` | fundo de optativa (não-texto) | — |
| `--puede-cursar` | `#facc15` | habilitada a cursar | alto ✅ |
| `--danger` | `#ef4444` | ⚠ faltam pré-requisitos / perigo | 5.6:1 ✅ |
| `--danger-text` | `#f87171` | texto de perigo pequeno (pills) | 7.6:1 ✅ |
| `--optativa-text` | `#c084fc` | texto optativa pequeno (pills/links) | 7.9:1 ✅ |
| `--info` | `#3b82f6` | acento de aviso (borda de card) | (não-texto) |
| `--info-text` | `#60a5fa` | texto de aviso pequeno (pill "Avisos") | 8.3:1 ✅ |

**Regra de contraste:** texto informativo ≥ 4.5:1 contra o fundo real. `--text-dim` (3.7:1)
**não pode** ser usado para texto que o usuário precisa ler — fica para bordas, estados
desativados e textos decorativos (ronda 1 Lighthouse: os labels do minical foram para
`--text-faint`). Se precisar de texto legível "bem apagado", use `--text-faint`.
**Tokens saturados (`--optativa`, `--danger`, `--info`) são para borda/acento; texto pequeno
usa as variantes claras (`-text`), que sobre tints `rgba(cor, .15)` continuam ≥ 4.5:1.**

## 3. Tipografia

- Família: `system-ui, -apple-system, Arial, Helvetica, sans-serif` (sem webfont — decisão
  consciente: app offline/estático, zero requisição externa).
- **Escala final (etapa 4, 2026-10-16) — 8 degraus: `9 / 11 / 12 / 13 / 14 / 16 / 18 / 22` px.**
  Papéis: `22` título de página · `18` título de seção/caixa · `16` corpo grande/ênfase · `14` corpo ·
  `13` UI (botões, inputs, controles) · `12` rótulo/metadado · `11` legenda (piso do texto
  informativo) · `9` micro-rótulo. Consolidada a partir de 16 valores medidos
  (`7 · 7.5 · 8 · 8.5 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 18 · 20 · 22 · 24`).
- **Micro-tier 8px = exceção acoplada à geometria:** `.minical-month-label` e os rótulos internos
  dos nós (`.node-*` 8px, árvore e mapa) vivem em caixas de tamanho fixo — o minicalendário é um
  passo de grade de 13px (`--minical-step` ↔ `MINICAL_STEP_PX` em `APP/minical.js`). Não aumentar
  a fonte lá sem refazer as duas constantes juntas.
- **Normalização de base (`base.css`):** `input, button, select, textarea { font-family: inherit;
  font-size: 13px }` + `h1 → 22px / h2 → 18px / h3, h4 → 16px`. Mata os padrões do navegador
  (13.33px nos controles, 1.1em/1.2em/1.5em nos títulos). **Não usar `rem`/`em` em `font-size`
  novo** — usar px da escala.
- **Terceiros:** o Leaflet mantém 10px onde o CSS dele exige (`!important` na atribuição do mapa);
  não é violação da escala.
- Números de contagem (`[14]`, horas) não precisam de fonte tabular; alinhe com `gap`, não com espaços.
- Títulos de página `<h1>` ficam **ocultos** (`display:none !important` em `base.css`) porque a
  navbar já mostra o nome da página. Mantido por decisão — não reintroduzir h1 visível.

## 4. Espaço, raio, borda

- Grade de espaçamento: múltiplos de **4px** (4/6/8/12/16/24) — os valores atuais já respeitam isso.
- Raio: **6px** em botões, cards e containers (padrão do app); **4px** em chips/elementos inline
  pequenos. Nada de pill/20px, exceto elementos já existentes (ex.: tooltip do minical).
- Bordas: `1px solid var(--border)` padrão; `--border-strong` em hover/seleção.
- Sombras: só em camadas flutuantes (tooltip do minical, modais). Nunca em cards de lista.
- Scrollbar custom (8px, `--border`) + `scrollbar-width: thin` é parte da identidade.

### 4.1 Botões — vocabulário único (etapa 1, 2026-10-16)

| Variante | Uso | Regra |
|---|---|---|
| Padrão (secundário) | ação normal | `13px` / `weight 500`, `padding: 8px 14px`, `min-height: 34px`, fundo `--bg-hover`, borda `1px var(--border)`, texto `--text`; hover: fundo `--bg-input` + borda `--border-strong` |
| Compacto | chip inline em listas | `12px`, `padding: 4px 10px`, `min-height: 28px` |
| Destrutivo | remover / resetar / desinscrever | contorno `1px var(--danger)` + texto `--danger`; hover `rgba(239,68,68,.1)`. Ação destrutiva real mantém hold-to-confirm |
| Preenchido (primário) | **só** estado ativo/selecionado | fundo `--cursando`, texto `#000` |
| Ícone | ação compacta em card/linha | sem fundo, `min-width/min-height: 24px`, `border-radius: 6px` |

- Botão não é lugar de hex solto: `#fff` → `--text`, `#f87171`/`#ff4444`/`#ff6666` → `--danger`,
  `#555` → `--border-strong`. Tints com alfa (`rgba(34,211,238,.1)`) são permitidos.
- Nada de "primário preenchido" para ação comum: enche a tela e mata a hierarquia; o preenchido
  fica reservado para o que está **selecionado/ativo**.

### 4.2 Densidade vertical — menos scroll (etapa 8, 2026-10-16)

- Objetivo: cada página deve pedir o **menor scroll possível** sem quebrar §3 (tipografia),
  §4.1 (botões) nem §7 (alvos ≥ 24px). Densidade não é licença para encolher controle.
- Escala vertical canônica: **2 / 4 / 6 / 8 / 10 / 12 / 16 / 24** px (padding, margin, gap).
- Linhas de lista (`li`): `padding: 3px 8px` + `margin-bottom: 2px`; `ul` `margin: 4px 0`.
- Caixa: `.box` `padding: 2px 0`; `.box h3` `padding: 6px 12px` + `margin: 0 0 6px`.
- `hr`: `border: none; border-top: 1px solid var(--border); margin: 4px 0` — o default do navegador
  abria um vão de ~16px (regra em `base.css`; o margin caiu de 10px para 4px na etapa 9).
- Cartões: padding de 8–12px (`.pub-card` 8px 10px, `.extension-card` 12px) e gaps de 8–12px.
- Células de tabela: **9px** de padding (universidades). A etapa 5 chegou a subir para 12px;
  revertido em favor de menos scroll (etapas 8–9) — **9px é o valor canônico**.
- Mapa de universidades: `height: 45vh; min-height: 320px`.
- **Índice em UMA coluna** (decisão do usuário, etapa 9): o `column-count: 2` experimental da
  etapa 8 foi revertido — com `break-inside: avoid` as caixas altas não se dividem e a 2ª coluna
  ficava ~724px mais curta (vão morto no rodapé). 1 coluna = página mais alta, porém sem vãos.
- **Hover de linhas** (etapa 9): `li:not(.app-navbar-list li):hover { background: var(--bg-hover) }`
  — antes NENHUMA linha de lista do app tinha feedback de hover.
- Vãos invisíveis: `#status:empty { display: none }` (cartelera) e `.card-links { margin-top: auto }`
  (extension: links pregados no rodapé dos cards esticados — acaba com os "fundos mortos" de cada
  fileira do grid).
- Proibido para compactar: reduzir `min-height` de botões/alvos, sair da escala tipográfica (§3),
  usar `rem`/`em` em `font-size`, ou esconder conteúdo.

### 4.3 Tarjetas de la cartelera — spec visual (etapa 9, 2026-10-16)

Referências: rows de inbox do Linear (meta em uppercase + título clampado), cards do GitHub
(list row compacta com ações à direita) e acento lateral por tipo (padrão de dashboards).

- **Casca** (`.pub-card`): `border: 1px solid var(--border)`, radius 8px, `padding: 5px 8px`,
  `gap: 2px`, fundo `var(--bg-card)`, transição de borda 0.15s.
- **Acento lateral por tipo** via `:has()`: `.tag-avisos` → `var(--info)`,
  `.tag-examenes` → `var(--danger)`, `.tag-notas` → `var(--aprobada)`, `.tag-general` →
  `var(--optativa)`, `.tag-otros` → `var(--text-faint)` — 3px à esquerda. Cards lidas não levam.
- **Header**: matéria em `11px` `--text-muted` **UPPERCASE** (`letter-spacing: 0.4px`); data com
  📅 em `11px` `--text-faint`, empurrada à direita (`margin-left: auto`).
- **Título**: `13px/600` em `--text`, clamp de 2 linhas (`-webkit-line-clamp: 2`) — cards uniformes.
- **Rodapé único** (`.pub-card-bottom`): pills (`9px`, radius 4px, `padding: 1px 5px`) à esquerda +
  botão "👁 leído"/"Desmarcar" (`11px`, `min-height: 24px`) à direita — uma linha a menos por card.
- **Hover**: `border-color: var(--border-strong)` + `background: var(--bg-hover)` (lift sutil).
- **Lidas**: pills somem; título/data em `--text-faint`.
- **Texto das pills** (ronda 1 Lighthouse): variantes claras da paleta — `.tag-avisos` em
  `--info-text`, `.tag-examenes` em `--danger-text`, `.tag-general` em `--optativa-text`
  (≥ 4.5:1 sobre o tint `rgba(cor, .15)`); chips ativos dos filtros: texto `var(--bg)` inclusive
  o sufixo "dias".

## 5. Layout e responsivo

- `body { margin: 12px }` e **`12%` lateral a partir de 769px** (`base.css`) — o app "vive" em
  76% da largura no desktop. `universidades` sobrescreve com `margin: 12px 0` (a tabela precisa
  da largura) e devolve a moldura na tree view.
- `padding-top: 48px` reserva a navbar fixa. Qualquer âncora/scroll deve descontar isso.
- **Estrutura de página:** `nav` (navbar) + `main` (conteúdo). O `<main>` é um wrapper de bloco
  **sem estilo próprio** — o layout segue dirigido pelas classes internas de cada página; não
  aplicar `display: flex/grid` nele sem reconferir as 6 páginas (etapa 6).
- **Banner de privacidade** (`.privacy-notice`/`#privacyBanner`, CSS em `base.css`): **visível por
  padrão** no markup das **6** páginas (sem `display:none` inline) — decisão do usuário (2026-10-16):
  o aviso aparece **sempre** e só é fechado **manualmente** (✕); não pode depender de `localStorage`,
  `fetch` nem de nenhum script. `version-check.js` **nunca toca no banner** — só faz auto-reload de
  versão (desativado em `localhost`/`file:`). Não reintroduzir `display:none` inline nem
  condicionar o banner a JS.
- **Mobile-first:** toda mudança testada em **390px**; nunca criar `overflow:hidden` sem caminho
  de rolagem. `html,body` usam `overflow-x: hidden` + `overflow-x: clip` (fallback iOS < 15.4).
- **Grids com conteúdo nowrap:** usar `minmax(0, 1fr)`, nunca `1fr` puro — `1fr` = `minmax(auto, 1fr)`
  e o min-content estoura a coluna (era o bug dos cards da cartelera saindo da tela a 360px).
- **Botões em flex containers:** `overflow: hidden` zera o min-width automático do item e o texto
  corta (era o bug do `#btnResetear` a ≤320px). Em grupos que embrulham: `flex: 0 0 auto` +
  `white-space: nowrap` nos botões + `flex-wrap: wrap` no pai.
- **Barra de controles da cartelera (mobile):** uma fila com `flex-wrap` e botões slim
  (`12px`, `padding: 5px 10px`, `min-height: 30px`).
- Breakpoints reais em uso: `768` (mobile), `769` (desktop), `1250` (tabela de universidades
  ganha sticky header). Não inventar novos sem necessidade.
- **Ordem importa:** regras dentro de `@media` que empatam em especificidade com a regra base
  precisam vir **depois** dela (bug real na tabela de universidades).

## 6. Estados e interação

- Foco: `*:focus-visible { outline: 2px solid var(--cursando); outline-offset: 2px }` — já global
  em `base.css`. Não remover.
- Hover: superfície `--bg-hover`; nunca só `opacity`.
- Estado de matéria: cores **sempre acompanhadas de emoji/texto** (cor sozinha não informa).
- Árvore: contorno azul (`--cursando`) = "puede cursar"; clique (PC) / toque 1s (mobile) alterna
  estado. Interação canônica — não trocar por clique simples no mobile.
- Nada de animação decorativa nova. As existentes (`fadeIn` de modal, `minical-blink` do dia
  atual) fazem parte da identidade e **não devem ser desligadas** — ver §7.

## 7. Acessibilidade (piso)

- Alvos de toque ≥ **24×24px** (mobile e desktop). Corrigido em 2026-10-16 (`.btn-star-optativa`,
  `.btn-warning-faltantes`, `li button`, `.privacy-close`, `.node-btn`): medição no index **43 → 0**.
- **Exceção aceita:** as células do minicalendário (`.minical-dot`, 13×14px) ficam abaixo de 24px —
  grid acoplado (`--minical-step` ↔ `MINICAL_STEP_PX`) e o alvo real é a célula do dia. Não
  aumentar sem refazer as duas constantes juntas.
- **`<main>` landmark (etapa 6, 2026-10-16):** as 6 páginas agora têm **um** `<main>` envolvendo o
  conteúdo. Na `arbol` o container existente virou `<main class="tree-page">` (classe preservada);
  nas outras o `<main>` foi inserido ao redor do bloco de conteúdo, com `nav`, modais, banner de
  privacidade e scripts **fora** dele. `base.css` esconde `main > h1` junto com `body > h1` (o h1
  segue oculto por decisão, §3).
- **Nomes acessíveis em controles (etapa 6):** `#anioIngreso` ganhou `for` no `<label>` visível;
  `#extensionNombre`, `#extensionHoras`, `#notifyEmail` e `#globalVacunaFecha` ganharam `aria-label`
  (sem custo de layout). Todo `<input>`/`<select>` do app tem nome acessível — manter assim.
- **Padrões de aria (ronda 1 Lighthouse, 2026-10-18):** `aria-label` deve conter o texto visível
  ("🗓 Ver Fechas" → `aria-label="Ver Fechas: …"`); toggle com `<label>` de texto **não** usa
  `role="switch"` (exigiria `aria-checked`; o checkbox nativo já comunica o estado); toggles de
  cursando nomeados por matéria ("Cursando: Anatomía"); itens não-obrigatórios de vacunas em
  `opacity 0.65` (0.5 quebrava 4.5:1); Leaflet `{y}{r}.png` + `detectRetina: true` (tiles @2x).
- Contraste ≥ 4.5:1 para texto (§2); não usar `--text-dim` para conteúdo.
- `img` sem `alt`: 0 (mantido).
- **Reduced motion: NÃO usar.** Decisão do usuário (2026-10-16): este app **não** implementa
  `prefers-reduced-motion` e não deve ganhar guardas que desliguem `minical-blink`, `fadeIn` ou
  transições. As animações são parte da identidade ("Deep Black" / minical piscando o dia atual).
  Não adicionar esse media query de novo — se algum dia for pedido, é mudança de escopo, não de
  acessibilidade.

## 8. Emojis (canônico — não trocar por ícones/SVG)

✅ aprovada · 🟧 regularizada · 🔄 reset/cursando · ⚠️ pré-requisitos faltando · ⭐ optativa
favorita · 📅 minical/inscrição. Fazem parte da linguagem do app e da sua identidade;
substituí-los por ícones vetoriais é regressão.

## 9. Loop de verificação (obrigatório)

1. Servir estático: `bun C:\Users\Testa\AppData\Local\Temp\opencode\serve-static.ts . 8080`.
2. Capturar com o chrome-devtools MCP: **desktop 1440×900** e **mobile 390×844×2 (mobile+touch)**.
3. Semear estado realista (a página lê `localStorage`): `estados`, `cursando`, `anioIngreso`.
4. Evidência vai para `FLOW/design-2026-10-16/` (gitignored) — nome `NN-pagina-viewport.png`.
5. Medir sempre: `documentElement.scrollWidth > innerWidth` (overflow), tamanhos de fonte
   distintos, alvos < 24px, contraste do par cor/fundo tocado.
6. Depois de mexer em estado: `guardarLocalYRender()` (regra do AGENTS.md).
7. **Sem screenshot antes/depois, não está pronto.**

## 10. Não fazer

- Não renomear identificadores legado (ES/PT) — regra do `AGENTS.md`.
- Não hardcodear hex do palette (nem `rgba()` do palette) fora de `variables.css`.
- Não remover a seção "Licencia y Uso" nem enfraquecer a licença.
- Não trocar emoji por ícone, nem reordenar a navbar sem alinhar HTML + CSS `order`.
- Não tocar no acoplamento `--minical-step` ↔ `MINICAL_STEP_PX` (nem nas fontes 8/9px do minical)
  sem ajustar os dois lados.
- Não editar arquivos por PowerShell (`Set-Content`/`Out-File`) — usar as ferramentas de edição.

## 11. Pendências desta rodada (2026-10-16)

- [x] Auditoria visual + baseline (8 screenshots desktop/mobile, medições de overflow/fonte/alvos)
- [x] Alvos < 24px — corrigido (43 → 0 no index); exceção do minical documentada (§7)
- [x] Reduced motion: decidido **não** usar (ver §7)
- [x] Vocabulário de botões unificado (etapa 1): radius 6px, `13px/500`, variantes em §4.1
- [x] Rótulos de ano do arbol (`AÑO N`): 14px em `--cursando` (cor de status, uso decorativo) →
      20px/700 em `--text` → **ajustado a pedido do usuário (2026-10-18): 14px/600 em
      `--text-muted`** (mobile 12px), `letter-spacing` 2 → 1px — "é só um label"
- [x] Auditoria do `--text-dim`: 12 usos informativos → `--text-faint` (5.9:1). Mantido em bordas/
      fundos, estados desativados (`no-puede-cursar`, `:disabled`), ícones e minical 8px
- [x] `<main>` nas 6 páginas + nome acessível nos inputs — **FEITO (etapa 6)**: um `<main>` por
      página (`nav`, modais, banner e scripts ficam fora; na `arbol` o container virou
      `<main class="tree-page">`); `for="anioIngreso"` no label visível e `aria-label` em
      `#extensionNombre`, `#extensionHoras`, `#notifyEmail`, `#globalVacunaFecha`; hexes inline do
      `#globalVacunaFecha` trocados por tokens. Verificado em 1440 e 390 (`mains: 1`, `hOverflow: 0`).
- [x] Consolidação da escala tipográfica — FEITO (etapa 4, rama `design/visual-system`): 16 valores medidos → 8 degraus `9/11/12/13/14/16/18/22` + micro-tier 8px (exceção acoplada) + normalização em `base.css`; Leaflet mantém 10px. Censo no DOM: `badCount: 0` nas 6 páginas (1440) e em index/arbol/cartelera (390).
- [x] Densidade/padding da tabela de universidades — FEITO (etapa 5): `th`/`td` de `10px 12px`/`9px 12px`
      para **`12px`** (altura de linha 31 → 57px) e `#222` → `var(--bg-input)`; mobile mantém `8px`
- [x] `user-select: none` global em `body` — **REVISADO: mantido de propósito**. É exigência explícita
      do usuário (comentário no próprio código em `universidades.css`); os controles já têm regra
      própria, então nada muda aqui. **Não remover.**
- [x] Compactação vertical das 6 páginas — **FEITO (etapa 8, rama `design/visual-system`)**: alturas
      medidas a 1440 — index 3523 → **2302** (−35%, 2 colunas em ≥1250px), universidades 2128 →
      **1835**, vacunas 1659 → **1288**, extension 2234 → **2086**; `arbol` já cabia (900).
      Contrato de densidade em §4.2. `hOverflow: 0` em 1440 e 390. A cartelera não é comparável 1:1
      (altura depende das publicações do Worker) — compactação verificada elemento a elemento.
- [x] Pulido visual da cartelera e de vacunas — **FEITO (etapa 8)**: cartelera (cards com borda/raio
      e hover consistentes, `.source-header` 16px, pills 11px, data sem o emoji 📅, botão "👁 leído"
      em espanhol); vacunas (faltantes/histórico em 2 colunas — acabou o vão morto antes do botão
      "Agregar" —, os 3 cabeçalhos com tinta de estado, `.box-head-row` para encabezado + fecha,
      footer compacto).
- [x] Banner de privacidade presente e visível nas **6** páginas — **FEITO (etapa 8)**: `vacunas` e
      `universidades` não carregavam `APP/version-check.js` (a `universidades` também não tinha o
      markup). Verificado: `banner: visible 37px` @1440 e 43–45px @390.
- [x] Vãos verticais identificados e compactados — **FEITO (etapa 9)**: auditoria com detector de
      faixas vazias (>45px) @1440 — index/arbol/universidades: 0 faixas; cartelera: 52px (bloco
      `#status` vazio → `#status:empty { display: none }`); extension: 5×47px de "fundos mortos"
      dos cards esticados (`.card-links { margin-top: auto }`); demais gaps reduzidos (`hr` 4px,
      `.year-section` 10px, `.source-group` 12px, `.vacunas-footer` 10px).
- [x] Hover de linhas — **FEITO (etapa 9)**: `li:not(.app-navbar-list li):hover` com `--bg-hover`
      (antes NENHUMA linha de lista tinha hover no app).
- [x] Índice de volta a UMA coluna — **FEITO (etapa 9, decisão do usuário)**: o `column-count: 2`
      da etapa 8 deixava ~724px mortos no fim da 2ª coluna. Altura com listas vazias: 3523 → 3076.
- [x] Tarjetas de la cartelera repensadas — **FEITO (etapa 9)**: spec em §4.3 (acento por tipo,
      clamp de 2 linhas, matéria uppercase, rodapé único pills+botão, hover lift); 📅 da data
      RESTAURADO (a etapa 8 o removeu achando que era um bug de fonte do navegador headless).
- [x] Mobile — **FEITO (etapa 9, reportes do usuário)**: cards saindo da tela a 360px
      (`minmax(0, 1fr)`); botões da cartelera em fila com slim 30px; `#btnResetear` cortando
      texto a ≤320px (`flex: 0 0 auto` + `white-space: nowrap` + wrap no pai). `hOverflow: 0`
      em 320/360/390.
- [x] Banner "aparece e fecha sozinho" — **FEITO (etapa 9, reporte do usuário)**:
      `location.reload()` sem `return` exibia o banner logo antes de recarregar; com localStorage
      bloqueado entrava em loop infinito → `showBanner()` + guarda `canStore` + `file:` + `return`
      antes do reload (`APP/version-check.js`).
- [x] Banner **incondicional** — **FEITO (decisão do usuário: "o aviso não deveria salvar no
      localStorage de qualquer forma" / "deve aparecer sempre e o usuário fecha manualmente")**:
      supersede o item acima — o banner ficou **visível por padrão no markup** das 6 páginas
      (`display:none` inline removido) e o `version-check.js` parou de tocá-lo de vez (só faz
      auto-reload). Verificado: `flex` 37px estável nas 6 páginas @1440, 45px @390, fechamento
      manual OK, e na primeira visita (reload de versão) o banner nunca desaparece.
- [x] **Ronda 1 — Lighthouse a11y/SEO (2026-10-18, branch `design/polish-a11y-seo`)**: index
      A11y 87→96 / SEO 90→100; arbol 90→96; cartelera 96→**100**/100; universidades SEO 91→100,
      BP 96→100; vacunas 93→96; extension 100. 4 tokens `-text`/`--info` (§2), meta description +
      preconnects nas 6 páginas, aria-labels alinhados ao texto visível, `role="switch"` fora,
      tiles @2x (retina). Perf real medida (FCP 120–656ms) — sem problema de performance; o MCP
      roda sem categoria Performance (`--no-performance-crux`), o CLS aparece em "Agentic Browsing".
- [ ] **Ronda 2 (abertos)**: hit-area dos dots do minical (`::before` `inset: -6px`, mantém o
      visual); acordeões `role=button` em headings → `<button>` real dentro do heading; **CLS**
      (index 0.366, vacunas ~0.3, universidades 0.061 — investigar com layout-shift); links do
      rodapé de vacunas < 24px; pins do mapa (exceção geográfica — documentar); Venn viewBox
      1000×500 vs ~455 de conteúdo; hexes neutros de `universidades.css` → tokens de superfície;
      scroll em retrato mobile do Modo Árbol.
