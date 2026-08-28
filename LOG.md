## 27/08/2026
  + Modo Árbol: botão "Ver optativas" reposicionado visualmente entre Zoom e Cartelera (CSS order: zoom=3, toggle=4, cartelera=5); legenda completamente restaurada — Colores: Aprobada, Regularizada, Puede cursar, Cursando, Próximas materias a liberar, No puede cursar, Optativa (puede cursar), Optativa (no puede cursar), 🟡 Falta 1 requisito, ⭕ No puede final, Abreviar nomes (toggle); Flechas: Cumplido, Puede cursar falta final, Falta Cursada, Falta Final; botões: "← Modo Lista", "📋 Cartelera".
  + Toggle switch unificado: desktop min-height auto (padding 6px 12px font 12px), mobile min-height 37px (padding 8px 10px font 11px) igual aos botões padrão; slider reduzido 28×14px (era 36×18px).
  + Fix overlay z-index legenda mobile: 1000→99 (abaixo da legenda z-index 100) — evita fechamento instantâneo ao clicar dentro da legenda.
  + Fix media query CSS @media (max-width: 768px): fechamento de chaves, regras aninhadas inválidas, propriedades órfãs — página voltava a renderizar em branco.
  + Removido código morto NAME_ABBREVIATIONS (arbol.js) e duplicata em README.
  + app.js TDZ fix: _stateCache declarado antes de getCachedState('estados') na linha 11.
  + arbol.js: canTakeFinal() recursivo conta cursando=on como pré-requisito satisfeito.
  + APP/materias.js: MI291 exige final de MI191 (aprobada).

## 25/08/2026 (2)
  + Perf D1+D2: cache memória estados/cursando (invalida no focus), throttle 100ms redraw scroll árvore. Sem mudança visual.
  + Cleanup: removed dead `NAME_ABBREVIATIONS` dictionary (unused, had English keys) from arbol.js; deleted untracked residue files `arbol.js.backup` and `Nomes abreviados.md`. All subject names remain Spanish via `m.nombreCorto`/`m.nombre` in APP/materias.js. arbol.js syntax verified OK.

## 27/08/2026
  + Revertido .cursando-active / .cursando-pending CSS para versão original do GitHub (override bulletproof estava visualmente errado).
  + Revertidas media queries de 1024px/hover:none para 768px (a mudança de 1024px quebrou display do Cursando no PC).
  + Implementada detecção de dispositivo baseada em capacidades: `isMobileDevice()` e help-modal `isMobile` agora usam `!matchMedia('(hover: hover) and (pointer: fine)').matches`; CSS esconder botões de ação agora usa `@media (hover: none) and (pointer: coarse)`. PC com mouse/trackpad mantém botões hover mesmo em janelas pequenas; dispositivos touch verdadeiros (Android/iOS/tablets) recebem FAB de click-hold.

## 25/08/2026
  + Added `nombreCorto` property to all subjects (obligatorias & optativas) in `APP/materias.js`
  + Added "Abreviar nomes" toggle switch in legend panel with localStorage persistence (`arbolAbbreviateNames`)
  + Increased font-size by ~30% (10px -> 13px desktop, 8px -> 11px mobile) when abbreviated mode is ON (.abbreviated-mode .node-name)
  + Fixed `toggleCursando` cache invalidation (`_stateCache['cursando'] = null;`) for instant animation on desktop
  + Disabled text selection (`user-select: none`) and touch callouts on `.subject-node`

## 25/08/2026
  + Fix botão Regularizar amarelo: arbol.js usava escape Unicode \uD83D\uDFE8 (🟨) em vez de \uD83D\uDFE7 (🟧) — L259 (botão do nó) e L1426 (modal ajuda). Grep por emoji literal não detectava escapes. Corrigido também 🟨→🟧 nos diagramas FLOW/main.dot, tree.dot, prerequisites.dot (docs internas).

## 14/08/2026
  + Fix: página Cartelera agora mostra publicações editadas mesmo se a data original de publicação for antiga. Filtro de data usa `(p.modificadaDate || p.date) >= cutoff` (data da última edição prioritária, senão data de publicação). Corrige assimetria com email (worker detectava modificação por snapshot title+date+modified, mas página escondia por filtrar pela data original). Aplicado em render() L1096, allVisibleRead() L385, marcarTodasLeidas() L414/424, e ordenação modo matéria L1099.

## 11/08/2026
  + Cron de notificações atualizado: 1x/dia 8h → 3x/dia 9h/13h/19h ART (0 12,16,22 * * * UTC). Corrige problema onde publicações surgidas após as 8h só eram detectadas no dia seguinte.
  + Worker redeployado: vfc35c8bd

## 07/08/2026
  + Welcome email restriction (worker.js): initial welcome email now filters publications to include only the last 5 publications from the last 12 months (`pubsFromLastMonths` helper + `parsePubDate`), avoiding ancient pubs flood.
  + Feature "Recibir novedades de": añadido tabs Obligatorias/Optativas, agrupado por año con divisores ("1° año", "2° año", etc.). Modal rediseñado: tabBar con botones .subscribe-tab.active (purple #a855f7), renderSubjectGroup() ordena por anio + inserta .subscribe-year-divider entre años, checkbox selección persiste en localStorage carteleraSubscribedSubjects. Fix: saveBtn ahora consulta content.querySelectorAll (ambos tabs) en vez de body inexistente. CSS: .subscribe-tab-bar, .subscribe-tab, .subscribe-tab.active, .subscribe-year-divider + mobile min-height/size.
  + Feature "Recibir novedades de": nuevo botón 📬 en controls-bar de cartelera.html, modal con checkboxes de todas las materias con cartelera disponible (resolveCatedraForCode), almacenado en localStorage carteleraSubscribedSubjects, integrado en resolveAndFetch (source="subscribed") y populateNotifySubjects. Grupo "Suscripciones extra" en modo Por materia, badge "Suscripción" en cronológico. Estilos CSS: .subscribe-modal, .subscribe-subject-label, .btn-subscribe (purple #a855f7), .source-header-subscribed, .pub-source-subscribed.
  + Detección de publicaciones editadas (worker.js): parseCatedraHtml/parseHomeHtml extraen campo modified con regex (text-muted + "Modificad[ao] el día DD/MM/YYYY HH:MM"). Snapshot comparison en scheduled() ahora incluye s.modified === p.modified. Nuevo endpoint /test-edits para diagnóstico. Client (APP/cartelera.js): parseCatedraHtml/parseHomeHtml parsean modificadaDate (Date object), rendering muestra badge "🔄 Actualizada DD/MM/YYYY HH:MM" (.pub-modificada-badge), isLeida/marcarLeida con timestamp de modificación — si publicación fue editada después de leída, vuelve a aparecer como no leída. Backward compat con formato antiguo boolean. CSS: .pub-modificada-badge (orange italic).
  + Nuevas funciones: getSubscribedCodes, saveSubscribedCodes, formatDateTime, openSubscribeModal, closeSubscribeModal
  + Nuevo localStorage key: carteleraSubscribedSubjects
  + Nuevo formato carteleraLeidas: {read: true, mod: "DD/MM/YYYY HH:MM"} (backward compat con boolean true)
  + Rediseño de cards: tag type movido al container de tags como pill, fecha única (modificada si existe, sino original), botón "lido" bottom-right, estado leído oculta todas las tags. CSS: eliminados .pub-tag standalone, .pub-details-row, .pub-modificada-pill; nuevos .pub-tags-row, .pub-date-modified.
  + Rename "Suscripción" → "Otras" (cartelera.js — 3 labels: renderSourceGroup header, chrono badge, subscribe modal note)
  + Cartelera CSS card hierarchy: .pub-title 15px white bold 600 line-height 1.3 (+ mobile 13px→15px)
  + .pub-subject-name always visible in read cards (removed from .pub-read display:none list), dimmed #666 when read
  + .pub-subject-name font-size 12px→13px
  + .pub-read .pub-title dimmed #888 weight 400
  + Subscribed source color purple #a855f7 → amber #f59e0b (header + badge)

## 04/08/2026
  + Corregido PG001 (Psicología Médica, año 2): paraCursar vacío → agregado [{materia:"A0001",condicion:"regularizada"}]. PG001 era la única obligatoria de año 2 sin prerequisito para cursar. Archivo: APP/materias.js (línea 66).
  + Aviso de privacidad: banner fijo 🔒 añadido como primer hijo de <body> en index.html (línea 12), arbol.html (línea 10), cartelera.html (línea 10). CSS .privacy-notice añadido en style.css (línea 1057) y arbol.css (línea 1408) — fondo #111, borde #222, texto centrado #888.
  + Corrigido bug PG001 (Psicología Médica): paraCursar vazio → inclui A0001 (Anatomía) regularizada como pré-requisito para cursar (padrão de todas as outras obrigatórias do año 2)
  + Adicionado aviso de privacidade "Este sitio no comparte tus datos académicos..." como banner em todas as páginas (index.html, arbol.html, cartelera.html) + CSS (style.css, arbol.css, cartelera.css)
  + Aviso privacidade convertido para barra flutuante com botão X (reaparece ao recarregar)
  + Modal "Cómo usar" reescrito: 1 página, 9 itens curtos, sem paginação
  + Fix FAB mobile: posicionamento via CSS left/right (removido cálculo pixel), overflow eliminado
  + Toggle Cursando na página principal: sincronizado com localStorage, fundo cyan sutil, afeta barra de progresso
  + Hover sutil em list items no desktop (rgba 0.03)
  + Fix privacy banner flash no PC: banner começa com display:none, version auto-reload script mostra banner após confirmar que não vai recarregar; anti-loop (lastReloadAttempt 3s) previne reload infinito por cache do version.json

## 03/08/2026
  + Cartelera: publicações gerais da Faculdade (home cartelera.med.unlp.edu.ar/) agora aparecem na página Cartelera e nas notificações de email.
  + Página (cliente): nova seção roxa "🏛 Avisos Generales de la Facultad" — sempre visível, no topo do modo "Por materia" (grupo colapsável home, header .source-header-home roxo #a855f7) e com badge "General" (.pub-source-home) no modo "Cronológico". Mesmo com 0 matérias ativas a home renderiza. Novos consts HOME_KEY="__HOME__", HOME_ID="home", HOME_LABEL="Avisos Generales de la Facultad"; tag "General" → #a855f7/.tag-general; parseHomeHtml() (DOMParser: .card.card-outline-success, data em .card-header h5, link /noticia/N); resolveAndFetch() sempre anexa {codigo:HOME_KEY, id:'home'} e roteia fetch ?id=home → parseHomeHtml; renderHomeGroup() primeiro no renderSubjectMode; badge General no cronológico. CSS: .source-header-home, .pub-source-home, .pub-tag.tag-general, .notify-home-label. Arquivos: APP/cartelera.js, APP/cartelera.css, cartelera.html (checkbox #notifyHomeCheckbox no modal).
  + Email (worker): /subscribe aceita {email,codes,names,home} (default false), KV {codes,names,home}; se home → fetchHomePubs + snapshot KV 'home' + welcome inclui buildHomeEmailSection (slice 5). Cron scheduled(): constrói homeEmails[] (subs home:true), após loop de catedras fetcha home 1x, diff vs snapshot 'home', email a todos (try/catch, assunto "Nueva publicación general en la Facultad - Cartelera UNLP"), snapshot atualiza só se ≥1 email OK. Proxy ?id=home → racine https://cartelera.med.unlp.edu.ar/ (senão /catedra/ID). /test-cron inclui diagnóstico home. Helpers: parseHomeHtml (regex, split card.card-outline-success), fetchHomePubs, buildHomeEmailSection; buildWelcomeHtml(catedraPubs,names,homePubs). Arquivo: worker.js.
  + Docs atualizados: AGENTS.md (seção Cartelera + IMPLEMENT), FLOW/cartelera.dot (nós resolve_home, cron_home, home_optin, helper_home_email; rotas proxy/subscribe/cron; badges render).
  + Sincronización materias↔cátedras: agregados 6 fallbacks a CARTELERA_FALLBACK_CATEDRAS (HG001→Salud Pública, C2001→Cirugía B, BG008/BG013→Biología, EDS13→Educación para la Salud, PINV→Seminarios de Investigación Científica). Mensaje de error "No hay datos de cátedras para este código" preservado (PFOFO, TASPO sin cátedra). Arquivo: APP/cartelera.js.
  + Filtros cartelera: intervalo padrão 365→90 dias; campo personalizado #daysInput com sufixo "dias" (.filter-days-wrap/.filter-days-suffix); nova função syncFilterUI() centraliza highlight (botão pré-definido 60/30/7 OU wrapper .filter-days-wrap.active em ciano #22d3ee quando intervalo personalizado ativo). Arquivos: cartelera.html, APP/cartelera.js, APP/cartelera.css.
  + Cartelera cutoff +3: intervalo de filtro usa currentDays+3 invisible (ex: 30→33) para garantir visibilidade de publicações pré fim-de-semana. Arquivo: APP/cartelera.js (render).
  + Cartelera cards grid: publicações renderizadas em grade CSS (grid auto-fill minmax 260px) para melhor uso do espaço desktop. Wrappers .cards-grid em renderSourceGroup, renderHomeGroup, renderChronoMode. Arquivos: APP/cartelera.js, APP/cartelera.css.
  + Sistema de auto-reload silencioso via version.json: detecta nova versão, recarrega página automaticamente (localStorage sobrevive ao reload). 4 arquivos: version.json + script inline em index.html, arbol.html, cartelera.html.

## 14/07/2026
  + Corrigido bug: FAB mobile (touch-and-hold) aparecia fora dos limites da tela no Modo Árbol. Causa: createFAB media fabContainer.getBoundingClientRect() dentro de requestAnimationFrame enquanto a animação fabSlideIn estava no frame inicial (transform: scale(0.7)), retornando largura ~70% da real → centramento deslocado à direita e clamp de borda não detectava overflow. Fix: usar offsetWidth/offsetHeight (dimensão de layout, ignorando transforms), reordenar clamp (borda direita primeiro, depois left>=8 para nunca ser negativo), e adicionar flex-wrap/justify-content:center/max-width:calc(100vw-16px) em .mobile-fab-container como rede de segurança. Arquivos: arbol.js (createFAB) e arbol.css (.mobile-fab-container).

## 07/07/2026 (5)
  + Corrigir overlay blur da legenda no PC: @media (min-width:769px) oculta .tree-legend-overlay/.visible com display:none!important — overlay (z-index:1000, backdrop-filter:blur) cobria .tree-legend (z-index:100) no desktop
  + Mobile Árbol: switch "Ver materias optativas" rediseñado como botón (border #444, padding 4px 8px, border-radius 4px, min-height 37px) — slider vertical menor (44×24px→18×28px, knob 20×20px→14×14px, translateX(20px)→translateY(12px)), label 11px→10px
  + Mobile Árbol: altura dos botões reducida 15% (min-height 44px→37px en btn-back/btn-legend/btn-cartelera/btn-help; zoom-controls button 44×44px→37×37px)
  + Desktop Árbol: switch "Ver materias optativas" rediseñado como botón también en PC (border #444, padding 4px 8px, border-radius 4px, min-height 37px, slider vertical 18×28px, knob 14×14px, translateX→translateY(12px)) + CSS mobile redundante unificado (removido .toggle-slider/.toggle-slider::after/:checked overrides duplicados)
  + Mobile Árbol top-bar compactado verticalmente: gap 6px→4px, padding 8px→4px 6px, h1 font-size 14px→13px, btn-back font-size 13px→12px + padding 8px 12px→6px 10px
  + Pinch-to-zoom gesture (2 dedos) no Modo Árbol mobile: touchstart captura distância inicial + zoom base, touchmove calcula ratio e ajusta currentZoom com clamp (ZOOM_MIN..ZOOM_MAX), chama applyZoomTransform + updateZoomDisplay em tempo real, touchend reconfigura SVG (updateSvgDimensions + drawConnections). Cancela long-press FAB se 2 dedos ativos.
  + Botões de zoom + e − ocultos no mobile (CSS nth-of-type display:none), reset ⟲ e indicador % permanecem visíveis

## 07/07/2026 (3)
+ FAB fix: removed CSS translateX(-50%) from .mobile-fab-container + fabSlideIn keyframes — JS already handles centering with bounds checking, CSS was causing double-centering (FAB shifted half-width to the left)
+ Scroll fix attempt reverted: height adjustment (scrollHeight × zoom) broke scroll entirely — transform:scale() restored without height fix, empty space issue remains pending
+ REVERTIDO: scroll da página inteira no Modo Árbol — voltou ao sistema original (scroll no .tree-wrapper, top-bar fixa, html/body overflow-x:hidden, .tree-page overflow:hidden height:100vh, .tree-wrapper overflow:auto flex:1) — sistema de zoom/scroll original do commit 0f7ccdc restaurado
+ Corrigir nome matéria duplicado no campo fechas-proximas (app.js: remover prefixo materia.nombre + catedraSel que causava exibição dupla)
+ Redesenhar botão "🗓 Ver Fechas": de quadrado 44×44px (ícone-only) para pill compacto (padding 6px 10px, border-radius 20px, font 12px, gap 4px, white-space nowrap) + aria-label acessibilidade
+ Botão calendário "🗓" → "🗓 Ver Fechas" em todas as ocorrências

## 07/07/2026
+ Mobile: touch-and-hold FAB (400ms long press, 10px threshold) com dark overlay e botões contextuais
+ Help button "❓ Cómo usar" no top-bar com modal context-aware (desktop=hover, mobile=long-press)
+ Leyenda redesignada: seções "Colores" (8 itens) + "Flechas" (5 itens), botão ×, overlay backdrop
+ Flash animation leyenda (red+white glow 2s) dispara em todo fechamento (auto-hide, X, overlay)
+ Emoji 🟨→🟧 para regularizar em todos os arquivos
+ FAB melhorias: 58px, container transparente, 🔛/🟦 cursando toggle
+ Toggle label: "Ver materias optativas"
+ Top-bar mobile: layout 3 linhas com CSS order
+ CSS: color-scheme dark, overscroll-behavior, touch-action, prefers-reduced-motion
+ Mobile: botões de ação (✅🟧🔄) substituídos por touch-and-hold (400ms long press) floating action buttons (FAB) com dark overlay
+ FAB aparece acima do nó com botões contextuais (Aprobar/Regularizar/Resetear/Cursando) baseados no status atual
+ Tap no overlay ou clique fora fecha o FAB
+ FAB buttons têm 52×52px (touch targets ≥44px), animação slideIn
+ Desktop behavior inalterado (hover buttons permanecem)

## 05/07/2026
+ Top-bar reorganizado em 3 colunas: [Vacunas, Modo Árbol] | [Año de ingreso] | [¿Cómo usar?, ⚠️ Resetear]
+ Botão Resetear com hold-to-confirm: 1.5s com barra de progresso animada (CSS ::after + transition), reset só após animação completa
+ Título h1 centralizado (text-align: center)
+ Plan actualizado de 2004 a 2023 en título

## 05/07/2026
+ Corrección plan estudios UNLP (RM 578/25): DL001 Deontología, TX001 Toxicología, P9002 Psiquiatría II movidas de anio:4 a anio:5 (obligatorias 5° año según plan oficial)

## 05/07/2026
+ 🔴 Bug crítico corrigido: snapshot se actualizaba incluso cuando el email fallaba → publicaciones perdidas para siempre. Fix: flag anyEmailSent, solo actualiza snapshot si al menos 1 email se envió exitosamente; si todos fallan, log + reintenta próximo cron
+ Endpoint /test-cron (GET): diagnóstico completo sin enviar emails — fetch + parse + comparación de snapshots por cada catedra suscrita
+ Endpoint /test-send (POST): envía email de prueba para verificar Resend API desde el Worker
+ Desplegado v39e7661f → c759c36e

## 30/06/2026 (2)
+ Email notificaciones mejorado: nombres de materias en vez de "Cátedra ID" (names map enviado desde cliente, almacenado en KV junto a codes)
+ Links clicables a cada publicación en emails (welcome + cron): parseCatedraHtml extrae href de <a> en card-title
+ Link de desinscripción en emails: apunta a https://felipetesta.github.io/Correlatividades_FCM_UNLP/cartelera.html
+ Botón "Remover mi email" en modal: hold-to-confirm 1s (barra de progreso CSS), llama POST /unsubscribe, limpia localStorage
+ KV format changed: [codes] → {codes, names} (backward-compat en scheduled() maneja ambos formatos)
+ Review fixes: (1) regex title capture `.*?` → `[\s\S]*?` para multi-línea; (2) pub link maneja URLs absolutas; (3) touch device double-fire guard (touchInProgress); (4) mobile touch target min-height 44px

## 30/06/2026 (Review + Bug Fix)
- Review geral pós-deploy encontrou 5 bugs + 1 bug crítico
- 5 fixes aplicadas: typeof guard email, try/catch proxy fetch, response.ok check, catedrasLoaded guard, AbortController 15s timeout
- 🔴 Bug crítico: parseCatedraHtml usava DOMParser (browser-only API) no Cloudflare Workers → falha silenciosa, emails nunca enviados. Reescrito com regex parser
- .gitignore: .wrangler/ adicionado
- Worker redeployado v8a894969, teste /subscribe confirmou welcomeEmailSent:True
- URL correta do Worker: https://cartelera-proxy.felipestesta.workers.dev

### 30/06/2026 - ⚙ button inline + /subscribe overwrite + Welcome email + Worker refactor + 6 review fixes

**⚙ "Alterar cátedras" button moved inside h3 (APP/cartelera.js + APP/cartelera.css):**
- Botão ⚙ agora é inserido **dentro do `<h3>`** do título da matéria (não mais após), usando `flex` + `margin-left: auto` para alinhar à direita
- Mesmo comportamento: visível apenas se >1 opção de cátedra, `e.stopPropagation()` no clique

**/subscribe changed from MERGE → OVERWRITE (worker.js):**
- Antes: `{email, codes}` fazia merge dos códigos novos com existentes — usuário NÃO podia remover matérias
- Agora: `POST /subscribe` **substitui** completamente a lista de códigos — desmarcar checkbox remove a matéria da subscription

**Welcome email on /subscribe (worker.js + cartelera.js):**
- Ao confirmar modal, `/subscribe` agora:
  1. Salva subscription em KV
  2. Busca últimas 5 publicações de cada cátedra (via `fetchCatedraPubs`)
  3. Envia email de boas-vindas com essas publicações (via `buildWelcomeHtml`)
  4. Inicializa snapshot no KV com as publicações atuais (evita flood no primeiro cron)
- Nova função `buildWelcomeHtml()` para template do email de boas-vindas

**Worker refactor: shared helpers (worker.js):**
- Extraídas funções compartilhadas usadas por `/subscribe` e `scheduled()`:
  - `parseCatedraHtml(html)`: extrai array de publicações do HTML da cartelera
  - `fetchCatedraPubs(id, env)`: busca e parseia publicações de uma cátedra
  - `sendEmail(to, html, apiKey)`: envia email via Resend API
  - `buildWelcomeHtml(pubsByCatedra)`: monta HTML do email de boas-vindas
- `scheduled()` refatorado para usar as mesmas funções

**Snapshot stores FULL pubs array (worker.js):**
- Antes: snapshot armazenava `pubs.slice(0, 5)` (apenas 5 primeiras) — causava falsos positivos quando pub #6 era nova mas #1-#5 estavam no snapshot
- Agora: snapshot armazena **array completo** de publicações — comparação exata, sem falsos positivos

**6 review fixes (worker.js):**
1. `escapeHtml(str)`: função de sanitização aplicada a catedra IDs em links e conteúdo de email HTML (previne XSS via nome de cátedra malicioso)
2. Email validation regex + lowercase normalization: email validado com regex antes de salvar em KV; convertido para lowercase para evitar duplicatas (a@B.com vs A@b.com)
3. CORS header on proxy error: resposta de erro do proxy `?id=` (quando sem parâmetro) agora inclui `Access-Control-Allow-Origin: *` para evitar CORS no frontend
4. Per-email try/catch in scheduled(): cada email é processado em try/catch individual — falha em um email NÃO interrompe o batch (outros subscribers ainda recebem notificações)
5. Promise.allSettled parallel fetch in /subscribe: busca de publicações por cátedra usa `Promise.allSettled` em vez de sequential — reduz tempo total e evita timeout do Worker (30s limit)
6. Snapshot full array fix (item 3 acima)

### 30/06/2026 - Botão ⚙ Alterar cátedras + Notificações email (Worker Cron + Resend)

**Botão ⚙ "Alterar cátedras" por matéria (APP/cartelera.js + APP/cartelera.css):**
- Novo helper `getCatedraOptionsForCode(code)`: retorna array de opções de cátedra (catedrasData[code] → CARTELERA_FALLBACK_CATEDRAS[code] → []) sem auto-selecionar ou mutar localStorage
- Nova função `openCatedraSelectorForCode(code)`: reabre seletor de cátedras para uma matéria específica, adiciona botão "✕ Cerrar" e faz scroll suave até #catedraSelector
- Injeção do botão ⚙ em `renderSubjectMode()` após título da matéria (apenas se >1 opção de cátedra), com `e.stopPropagation()` para não colapsar h3
- CSS `.catedra-change-btn` (28×28px desktop, 44×44px mobile) + `.selector-close-btn`

**Notificações por email — Worker Cron + Resend (worker.js + wrangler.toml + cartelera.html + APP/cartelera.js + APP/cartelera.css):**
- `worker.js` estendido (179 linhas): mantém proxy `?id=` existente intacto; adiciona `scheduled(event,env,ctx)` handler (Cron 1x/dia 8am) que lê subscriptions do KV `CARTELERA_SUBS`, busca cada catedra, compara com snapshot em KV `CARTELERA_SNAPSHOTS` (últimas 5 title+date pairs), envia email via Resend API se nova publicação, atualiza snapshot
- Novas rotas no Worker: `POST /subscribe` (salva {email, codes:[...]} em KV), `POST /unsubscribe` (remove), `GET /health`, com CORS preflight (OPTIONS)
- try/catch: falha no envio de email NÃO atualiza snapshot (retry no próximo cron); Resend response status checado (4xx/5xx → throw)
- Novo `wrangler.toml`: cron `0 8 * * *`, 2 KV namespaces (CARTELERA_SUBS, CARTELERA_SNAPSHOTS) com IDs placeholder
- UI em `cartelera.html`: botão 🔔 Notificarme na controls-bar + modal com input email + checkboxes de matérias ativas
- `APP/cartelera.js`: `populateNotifySubjects()`, `openNotifyModal()`, `closeNotifyModal()`, `handleNotifySubscribe()` + persistência email em localStorage `carteleraNotifyEmail`
- CSS modal: overlay fixo, .modal-content borda #22d3ee, input escuro, responsivo mobile 90vw

**Review fixes (cavecrew-reviewer):**
- Resend fetch response status check adicionado (não atualiza snapshot se email falha)
- Touch targets mobile 44px para `.selector-close-btn` e `#notifyBtn` (padding 10px 14px no @media)

### 29/06/2026 - 4 batches de correções pós-implementação Cartelera

**Batch 1 (3 fixes):**
- SEM91 fallback expandido de 3 para 6 opções: Medicina Interna A, B, C, D, E, F
- Seletor de cátedras agora mostra nome da matéria via `getSubjectName()` em vez do código
- Botão "👁 todas lidas" agora alterna: 1º clique marca todas visíveis como lidas, 2º clique desmarca (texto alterna entre "lidas" e "não lidas")

**Batch 2 (3 fixes):**
- Filtros de data (365d/30d/7d) persistem em `localStorage.carteleraFilterDays`
- Cada matéria pode ser colapsada individualmente no modo "Por materia" (click h3 ▾/▸), persistido em `localStorage.carteleraCollapsedSubjects` como `{CODE: bool}`
- Semiología bug fix: `resolveCatedraForCode` agora faz fallback chain quando nome de cátedra selecionada não resolve (em vez de retornar erro que escondia a matéria)

**Batch 3 (1 fix):**
- Seletor de cátedras não auto-fecha no render — `render()` não esconde mais `selectorEl`. Apenas `resolveAndFetch` gerencia visibilidade.

**Batch 4 (8 fixes de revisão):**
- `catedrasLoaded` guard: botão refresh bloqueado até `finales.json` carregado
- `render()` early-exit agora checa `anyErrorOverall` (não só `anyPubOverall`) — mensagens de erro renderizam em vez de vazio genérico
- `renderCatedraSelector` usa `btn.dataset.catedra` (auto-decode HTML entities) em vez de `getAttribute`
- `fetchCatedra` com `AbortController` timeout de 15s (sem spinner infinito)
- `console.log` removido do código de produção
- Touch targets mobile: padding 10px 14px (≥44px) para botões de filtro/grupo/refresh/seletor
- Contraste: `.pub-professor` #777→#aaa, `.pub-modificada` #666→#999 (WCAG AA)
- Acessibilidade: `focus-visible` outline (#22d3ee), `aria-pressed` em toggle buttons, `aria-label` em botões 👁, `role=button` + `tabindex=0` + `onkeydown` em h2/h3 colapsáveis

### 29/06/2026 - 5 melhorias na Cartelera (fallback, leitura, colapso, nomes)

- **Cátedras fallback:** Adicionado `CARTELERA_FALLBACK_CATEDRAS` para SEM91 (Medicina Interna D/E/F) e P9001 (Psiquiatría I) quando ausentes de `finales.json`
- **Botão "👁 lido":** Cada publicação tem botão que a marca como lida, colapsa o card e persiste estado em `localStorage.carteleraLeidas`
- **Botão "👁 todas lidas":** Barra superior, marca como lidas todas as publicações visíveis no momento
- **Seções colapsáveis:** Headers "Cursando" e "Regularizada" clicáveis com indicador ▾/▸, estado persistido em `localStorage.carteleraCollapsed`
- **Nomes no cronológico:** Modo Cronológico agora exibe nome da matéria via `getSubjectName()` (carga de `materias.js`)

### 29/06/2026 - Inclusão de matérias regularizadas na Cartelera

- **cartelera.js:** Adicionada função `getRegularizadaCodes()` que lê matérias com status `"regularizada"` do `localStorage.estados`
- **resolveAndFetch():** Agora combina matérias cursando + regularizadas, com precedência cursando > regular (se mesma matéria tem ambos, só curso)
- **Modo "Por materia":** Headers de grupo coloridos — Cursando em cyan (#22d3ee), Regularizada em orange (#f97316)
- **Modo "Cronológico":** Cada card exibe badge de origem (Cursando / Regularizada) com cor correspondente
- **cartelera.html:** Seletor de cátedras e timeline agora incluem ambas as fontes

### 14/06/2026 - Correção de flash nas setas SVG

- **arbol.css:** Removida transição CSS `opacity 0.3s` em `svg path.connection-line` — setas aparecem instantaneamente no clique, sem flash
- **arbol.js (scroll handler):** Removido `updateSvgDimensions()` do scroll handler (scroll não altera dimensões, apenas `drawConnections()` é necessário)
- **arbol.js (selectNode):** Removida chamada redundante de `applySelectionVisuals()` em paths antigos que seriam destruídos — elimina flash duplo
- **arbol.js (drawConnections):** Agora preserva `<defs>` do SVG ao limpar paths (remove apenas `path.connection-line`, não todos os filhos)
- **arbol.js (selectNode):** Adicionado `requestAnimationFrame()` para recálculo imediato do SVG + `setTimeout(300ms)` para correção pós-expansão
- **arbol.js (deselectAll):** Substituído `setTimeout(250ms)` por `requestAnimationFrame()` para recálculo imediato do SVG
- **arbol.css:** Adicionado `transition: none` em `.subject-node.selected .node-actions` — botões aparecem instantaneamente no clique
- **arbol.css (mobile):** Adicionado `margin: 0 2px 8px 2px` em `.subject-node` para espaçamento vertical entre cards

### 14/06/2026 - Mobile: botões de ação apenas no highlight

**Mobile (arbol.css):**
- Botões de ação (✅🟨🔄) agora ficam ocultos por padrão no mobile (opacity: 0, max-height: 0)
- Aparecem apenas quando o card está `.highlighted` (selecionado/tocado) com transição suave
- Lógica equivalente ao hover do desktop, adaptada para touch

### 14/06/2026 - Mobile portrait: layout vertical (correção)

**Mobile portrait (arbol.css):**
- `.node-content` agora usa `flex-direction: column` (como desktop) em vez de `row` — cards são verticais: nome em cima, meta embaixo
- Removido `text-overflow: ellipsis`, `white-space: nowrap`, `overflow: hidden` — texto quebra naturalmente com `word-wrap: break-word`
- `.node-meta` com `flex-wrap: wrap` para sub-informações que precisam quebrar linha
- Zoom portrait aumentado de 55% para 65% para melhor leitura
- Cards mantêm compactação lateral (min-width 65px, max-width 110px) mas crescem verticalmente

### 14/06/2026 - Mobile portrait compacto + SVG arrows fix

**Mobile portrait (arbol.css):**
- `.subject-node` não empilha mais em `flex: 1 1 100%` — agora usa `flex: 0 0 auto` com min-width 65px e max-width 110px
- Novo `@media (max-width: 768px) and (orientation: portrait)` aplica `transform: scale(0.55)` no `.tree-zoom-container`
- Cards mobile: nome 8px (ellipsis), meta 7px, botões 28px, padding compacto
- Usuário é forçado a rotacionar para landscape ou usar PC/tablet para experiência completa

**SVG arrows (arbol.js):**
- Resize handler (linha 44) agora chama `updateSvgDimensions()` antes de `drawConnections()`
- Antes: ao mudar orientação, setas SVG ficavam cortadas porque dimensões do SVG estavam desatualizadas (ainda sized para viewport portrait)

### 12/06/2026 - Reset de estado Cursando

**removeSubjectState() (arbol.js):**
- Ao resetar uma matéria (botão 🔄), o estado cursando correspondente também é removido do localStorage

**resetearTodos() (app.js):**
- Ao resetar todos os estados (botão da página principal), a chave "cursando" também é removida do localStorage

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

### 29/06/2026 - Implementação da feature "Verificar Cartelera"
- **Criado APP/cartelera_ids.js:** mapeamento de 67 cátedras para IDs de cartelera (const CARTELERA_IDS)
- **Criado APP/cartelera.js:** lógica completa de busca via proxy Cloudflare Worker, cache em sessionStorage, parser HTML (DOMParser), renderização de cards por matéria ou cronológico, filtros de data (365d/30d/7d), seletor de cátedras para resolução de ambigüidades
- **Criado APP/cartelera.css:** tema escuro consistente, cards com tags coloridas (Avisos/Exámenes/Notas/Otros), spinner CSS, responsivo mobile
- **Criado cartelera.html:** página standalone que lê localStorage (cursando + catedrasSeleccionadas), resolve via finales.json e CARTELERA_IDS
- **Criado worker.js:** referência do Cloudflare Worker proxy deployado
- **Modificado arbol.html:** adicionado botão "📋 Verificar Cartelera" na top-bar
- **Modificado arbol.css:** adicionado estilo .btn-cartelera (mesmo padrão do .btn-legend)

### 29/03/2026 - Unificación de datos y correcciones
- Unificación de datos: fusionado optativas_lista.js en materias.js
- Corrección de valores 'anio' incorrectos: FM001:2, GE001:2, IES01:1, MGF:5
- Modificación del cálculo de porcentaje de progreso: excluido segmento 'puede cursar'
- Verificación de función resetearTodos(): limpia correctamente todos los estados
- Confirmación de funcionamiento con estructura de datos unificada
