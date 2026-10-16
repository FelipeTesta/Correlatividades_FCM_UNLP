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
| `--text-dim` | `#666666` | **só decorativo** (labels do minical) | 3.7:1 ⚠️ |
| `--border` | `#333333` | borda padrão | (não-texto) |
| `--border-strong` | `#444444` | borda em destaque/hover | (não-texto) |
| `--aprobada` | `#22c55e` | ✅ matéria aprovada | 9.1:1 ✅ |
| `--regularizada` | `#f97316` | 🟧 regularizada (falta final) | 7.5:1 ✅ |
| `--cursando` | `#22d3ee` | 🔄 cursando / foco / destaque | alto ✅ |
| `--optativa` | `#a855f7` | ⭐ optativa favorita | 5.3:1 ✅ |
| `--optativa-dark` | `#581c87` | fundo de optativa (não-texto) | — |
| `--puede-cursar` | `#facc15` | habilitada a cursar | alto ✅ |
| `--danger` | `#ef4444` | ⚠ faltam pré-requisitos / perigo | 5.6:1 ✅ |

**Regra de contraste:** texto informativo ≥ 4.5:1 contra o fundo real. `--text-dim` (3.7:1)
**não pode** ser usado para texto que o usuário precisa ler — hoje só aparece nos labels do
minical (8px, decorativos). Se precisar de texto legível "bem apagado", use `--text-faint`.

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

## 5. Layout e responsivo

- `body { margin: 12px }` e **`12%` lateral a partir de 769px** (`base.css`) — o app "vive" em
  76% da largura no desktop. `universidades` sobrescreve com `margin: 12px 0` (a tabela precisa
  da largura) e devolve a moldura na tree view.
- `padding-top: 48px` reserva a navbar fixa. Qualquer âncora/scroll deve descontar isso.
- **Mobile-first:** toda mudança testada em **390px**; nunca criar `overflow:hidden` sem caminho
  de rolagem. `html,body` usam `overflow-x: hidden` + `overflow-x: clip` (fallback iOS < 15.4).
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
- `<main>` landmark ausente (só `nav`): envolver o conteúdo principal de cada página.
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
      **20px/700 em `--text`** (mobile 13px)
- [x] Auditoria do `--text-dim`: 12 usos informativos → `--text-faint` (5.9:1). Mantido em bordas/
      fundos, estados desativados (`no-puede-cursar`, `:disabled`), ícones e minical 8px
- [ ] `<main>` nas 6 páginas + `label` nos 3 inputs sem rótulo (`#anioIngreso`, `#extensionNombre`, `#extensionHoras`)
- [x] Consolidação da escala tipográfica — FEITO (etapa 4, rama `design/visual-system`): 16 valores medidos → 8 degraus `9/11/12/13/14/16/18/22` + micro-tier 8px (exceção acoplada) + normalização em `base.css`; Leaflet mantém 10px. Censo no DOM: `badCount: 0` nas 6 páginas (1440) e em index/arbol/cartelera (390).
- [ ] Densidade/padding da tabela de universidades
- [ ] `user-select: none` global em `body` bloqueia copiar texto de estudo — revisar escopo
