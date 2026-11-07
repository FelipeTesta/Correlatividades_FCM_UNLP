// ===============================
// MINI CALENDARIO — LOGIC
// Strip de semanas dentro del tree-top-bar (Modo Árbol).
// Render: línea de meses + bolillas (una semana = una bolilla).
// Hover/tap: tooltip con fechas y eventos de la semana.
// Drag horizontal para mover (sin scrollbar visible).
// Expone getUpcomingEnrollment(materia) para stickers de inscripción.
// ===============================

var MINICAL_STEP_PX = 13; // ancho de cada bolilla (debe matchear --minical-step en arbol.css)
var MINICAL_MONTH_GAP_PX = 4; // espacio tras el último dot de cada mes (debe matchear --minical-month-gap)

function minicalParseDate(s) {
    return new Date(s + (s.length > 10 ? '' : 'T00:00'));
}

function minicalPad2(n) {
    return (n < 10 ? '0' : '') + n;
}

function minicalFmtDate(d) {
    return minicalPad2(d.getDate()) + '/' + minicalPad2(d.getMonth() + 1);
}

function minicalFmtDateTime(d) {
    return minicalFmtDate(d) + ' ' + minicalPad2(d.getHours()) + ':' + minicalPad2(d.getMinutes());
}

function minicalAllEvents() {
    return MINICAL_CALENDAR.fixedEvents
        .concat(MINICAL_CALENDAR.inscriptionsObligatorias)
        .concat(MINICAL_CALENDAR.inscriptionsOptativas);
}

// Semanas de lunes a domingo cubriendo el año calendario
function minicalBuildWeeks(year) {
    var weeks = [];
    var start = new Date(year, 0, 1);
    var shift = (start.getDay() + 6) % 7; // lunes=0
    start = new Date(year, 0, 1 - shift);
    var endOfYear = new Date(year, 11, 31);
    while (start <= endOfYear) {
        var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
        weeks.push({ start: new Date(start), end: end });
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 7);
    }
    return weeks;
}

function minicalEventsForWeek(week) {
    var all = minicalAllEvents();
    var found = [];
    for (var i = 0; i < all.length; i++) {
        var ev = all[i];
        var s = minicalParseDate(ev.start);
        var e = minicalParseDate(ev.end);
        if (s <= week.end && e >= week.start) found.push(ev);
    }
    return found;
}

var MINICAL_PRIORITY = {
    'insc-obl': 0,
    'insc-opt': 1,
    'invierno': 2,
    'ingreso': 3,
    'letivo1': 4,
    'letivo2': 4,
    'verano': 5,
    'verano2': 5,
    'elecciones': 0
};

function minicalPriorityRank(ev) {
    if (ev.id.charAt(0) === 'W' && ev.id !== 'W0') {
        return ev.emoji === '🟣' && ev.id.indexOf('WO') === 0 ? 1 : 0;
    }
    if (ev.id === 'W0') return 0;
    if (ev.id === 'WO4') return 1;
    if (MINICAL_PRIORITY[ev.id] !== undefined) return MINICAL_PRIORITY[ev.id];
    return 9;
}

function minicalWeekTooltipText(week, events) {
    var line1 = minicalFmtDate(week.start) + '–' + minicalFmtDate(week.end) + ' | ';
    var names = [];
    for (var i = 0; i < events.length; i++) {
        if (names.indexOf(events[i].label) === -1) names.push(events[i].label);
    }
    var text = line1 + names.join(', ');
    for (var j = 0; j < events.length; j++) {
        var ev = events[j];
        if (ev.perYear) {
            var parts = [];
            for (var k = 0; k < ev.perYear.length; k++) {
                parts.push(ev.perYear[k].years.join('º/') + 'º: ' + ev.perYear[k].when);
            }
            text += '\n' + parts.join(' · ');
            break;
        }
        if (ev.perFilter) {
            var fp = [];
            for (var f = 0; f < ev.perFilter.length; f++) {
                fp.push(ev.perFilter[f].filter + ': ' + ev.perFilter[f].when);
            }
            text += '\n' + fp.join(' · ');
            break;
        }
    }
    return text;
}

// ─── Oferta por materia (stickers) ──────────────────────────

function minicalWindowsById() {
    var map = {};
    var lists = [MINICAL_CALENDAR.inscriptionsObligatorias, MINICAL_CALENDAR.inscriptionsOptativas];
    for (var i = 0; i < lists.length; i++) {
        for (var j = 0; j < lists[i].length; j++) map[lists[i][j].id] = lists[i][j];
    }
    return map;
}

function minicalWindowsForMateria(m) {
    var ids = MINICAL_OFFERINGS.overrides[m.codigo];
    if (!ids) {
        if (m.categoria === 'anual' && m.anio === 1) {
            ids = MINICAL_OFFERINGS.firstYearAnual;
        } else {
            ids = MINICAL_OFFERINGS.defaults[m.categoria] || [];
        }
    }
    var map = minicalWindowsById();
    var out = [];
    for (var i = 0; i < ids.length; i++) {
        if (map[ids[i]]) out.push(map[ids[i]]);
    }
    out.sort(function (a, b) { return minicalParseDate(a.start) - minicalParseDate(b.start); });
    return out;
}

// Ventana de inscripción activa o próxima (<=14 días antes del inicio).
// Devuelve {label, rangeLabel, start, end} o null.
function getUpcomingEnrollment(materia) {
    var today = new Date();
    var windows = minicalWindowsForMateria(materia);
    for (var i = 0; i < windows.length; i++) {
        var w = windows[i];
        var s = minicalParseDate(w.start);
        var e = minicalParseDate(w.end);
        var warnStart = new Date(s.getFullYear(), s.getMonth(), s.getDate() - MINICAL_STICKER_DAYS_BEFORE);
        if (today >= warnStart && today <= e) {
            return {
                label: w.label,
                start: s,
                end: e,
                rangeLabel: minicalFmtDateTime(s) + ' → ' + minicalFmtDateTime(e)
            };
        }
    }
    return null;
}

// ─── Render ─────────────────────────────────────────────────

function initMinical() {
    var container = document.getElementById('minicalContainer');
    if (!container || typeof MINICAL_CALENDAR === 'undefined') return;

    container.innerHTML = '';
    container.className = 'tree-minical';

    var weeks = minicalBuildWeeks(MINICAL_CALENDAR.year);

    var scroller = document.createElement('div');
    scroller.className = 'minical-scroller';

    var inner = document.createElement('div');
    inner.className = 'minical-inner';

    // Meses: cada label ocupa tantas bolillas como semanas empiecen en ese mes
    var monthNames = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
    var monthCounts = new Array(12).fill(0);
    var i;
    for (i = 0; i < weeks.length; i++) {
        var mIdx = weeks[i].start.getMonth();
        if (weeks[i].start.getFullYear() < MINICAL_CALENDAR.year) mIdx = 0; // semana del año previo → ENE
        monthCounts[mIdx]++;
    }
    var monthsRow = document.createElement('div');
    monthsRow.className = 'minical-months';
    for (i = 0; i < 12; i++) {
        if (monthCounts[i] === 0) continue;
        var lbl = document.createElement('span');
        lbl.className = 'minical-month-label';
        lbl.textContent = monthNames[i];
        lbl.style.width = (monthCounts[i] * MINICAL_STEP_PX + MINICAL_MONTH_GAP_PX) + 'px';
        monthsRow.appendChild(lbl);
    }
    inner.appendChild(monthsRow);

    // Bolillas
    var today = new Date();
    var dotsRow = document.createElement('div');
    dotsRow.className = 'minical-dots';
    var currentDot = null;
    for (i = 0; i < weeks.length; i++) {
        var week = weeks[i];
        var events = minicalEventsForWeek(week);
        events.sort(function (a, b) { return minicalPriorityRank(a) - minicalPriorityRank(b); });
        var emoji = events.length > 0 ? events[0].emoji : '⚪';
        var isCurrent = today >= week.start && today <= week.end;

        var dot = document.createElement('span');
        dot.className = 'minical-dot' + (isCurrent ? ' current' : '');
        // Gap entre meses: último dot del mes (mes de la semana siguiente distinto)
        var monthBoundary = (i === weeks.length - 1) ||
            (week.start.getFullYear() < MINICAL_CALENDAR.year ? 0 : week.start.getMonth()) !==
            (weeks[i + 1].start.getFullYear() < MINICAL_CALENDAR.year ? 0 : weeks[i + 1].start.getMonth());
        if (monthBoundary) dot.className += ' month-end';
        dot.setAttribute('role', 'button');
        dot.setAttribute('tabindex', '0');
        var tipText = minicalWeekTooltipText(week, events.length > 0 ? events : []);
        dot.setAttribute('aria-label', tipText.replace(/\n/g, ' · '));

        var base = document.createElement('span');
        base.className = 'minical-dot-base';
        base.textContent = emoji;
        dot.appendChild(base);

        if (isCurrent) {
            var now = document.createElement('span');
            now.className = 'minical-dot-now';
            now.textContent = '🟢';
            dot.appendChild(now);
            currentDot = dot;
        }
        dot._minicalTip = tipText;
        dotsRow.appendChild(dot);
    }
    inner.appendChild(dotsRow);
    scroller.appendChild(inner);
    container.appendChild(scroller);

    // Tooltip
    var tooltip = document.createElement('div');
    tooltip.className = 'minical-tooltip';
    container.appendChild(tooltip);

    function showTooltip(dot) {
        tooltip.textContent = dot._minicalTip;
        tooltip.classList.add('visible');
        var cRect = container.getBoundingClientRect();
        var dRect = dot.getBoundingClientRect();
        var tRect = tooltip.getBoundingClientRect();
        // Sin espacio arriba (navbar fijo) → abrir hacia abajo, dentro de la página
        var nav = document.getElementById('appNavbar');
        var navH = nav ? nav.getBoundingClientRect().height : 0;
        var spaceAbove = cRect.top - navH;
        tooltip.classList.toggle('below', spaceAbove < tRect.height + 12);
        // Clamp horizontal dentro del ancho del contenedor (no sale de la página)
        var left = dRect.left - cRect.left + dRect.width / 2 - tRect.width / 2;
        if (left < 0) left = 0;
        if (left + tRect.width > cRect.width) left = cRect.width - tRect.width;
        tooltip.style.left = left + 'px';
    }
    function hideTooltip() {
        tooltip.classList.remove('visible');
    }

    // Hover (desktop) + tap (mobile)
    dotsRow.addEventListener('mouseover', function (e) {
        var dot = e.target.closest('.minical-dot');
        if (dot) showTooltip(dot);
    });
    dotsRow.addEventListener('mouseout', hideTooltip);
    dotsRow.addEventListener('click', function (e) {
        if (scroller._minicalDragged) return;
        var dot = e.target.closest('.minical-dot');
        if (dot) showTooltip(dot);
    });

    // Drag horizontal
    var userScrolled = false;
    scroller._minicalDragged = false;
    scroller.addEventListener('pointerdown', function (e) {
        scroller._minicalDragging = true;
        scroller._minicalDragged = false;
        scroller._minicalStartX = e.clientX;
        scroller._minicalStartScroll = scroller.scrollLeft;
        hideTooltip();
        try { scroller.setPointerCapture(e.pointerId); } catch (err) { /* pointer capture opcional */ }
    });
    scroller.addEventListener('pointermove', function (e) {
        if (!scroller._minicalDragging) return;
        var dx = e.clientX - scroller._minicalStartX;
        if (Math.abs(dx) > 4) {
            scroller._minicalDragged = true;
            userScrolled = true;
        }
        scroller.scrollLeft = scroller._minicalStartScroll - dx;
    });
    function endDrag() {
        scroller._minicalDragging = false;
        setTimeout(function () { scroller._minicalDragged = false; }, 50);
    }
    scroller.addEventListener('pointerup', endDrag);
    scroller.addEventListener('pointercancel', endDrag);

    // Centrar en la semana actual
    function centerCurrent() {
        if (!currentDot) return;
        scroller.scrollLeft = currentDot.offsetLeft + currentDot.offsetWidth / 2 - scroller.clientWidth / 2;
    }
    requestAnimationFrame(centerCurrent);
    window.addEventListener('resize', function () {
        if (!userScrolled) requestAnimationFrame(centerCurrent);
    });

    // ─── Elecciones Estudiantiles ──────────────────────────────
    var ELECCIONES_DATA_KEY = 'eleccionesVotos';
    var ELECCIONES_LAST_UPDATE_KEY = 'eleccionesLastUpdate';
    var ELECCIONES_AUTO_REFRESH_KEY = 'eleccionesAutoRefresh';
    var ELECCIONES_FINAL_KEY = 'eleccionesDatosFinales';
    var ELECCIONES_COOLDOWN_ENABLED = false; // desabilitado até sistema 100% funcional

    // Dados iniciais (cópia da página oficial, med.unlp.edu.ar, eleições 2026)
    var ELECCIONES_DEFAULT = [
        { nombre: 'Lista 17: Remediar', votosCentro: 2457, votosClaustro: 1921 },
        { nombre: 'Lista 22: Viento de abajo', votosCentro: 1150, votosClaustro: 941 },
        { nombre: 'Lista 3: Franja Morada', votosCentro: 189, votosClaustro: 155 },
        { nombre: 'Lista 4: La izquierda al frente', votosCentro: 45, votosClaustro: 42 },
        { nombre: 'Lista 7: UniTE', votosCentro: 43, votosClaustro: 36 },
        { nombre: 'Lista 10: La campora salud', votosCentro: 24, votosClaustro: 19 },
        { nombre: 'Blancos', votosCentro: 33, votosClaustro: 26 },
        { nombre: 'Nulos', votosCentro: 15, votosClaustro: 12 },
        { nombre: 'Impugnados', votosCentro: 1, votosClaustro: 1 }
    ];

    function eleccionesGetData() {
        try {
            var raw = localStorage.getItem(ELECCIONES_DATA_KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return ELECCIONES_DEFAULT.slice();
    }

    function eleccionesSaveData(data) {
        try {
            localStorage.setItem(ELECCIONES_DATA_KEY, JSON.stringify(data));
            localStorage.setItem(ELECCIONES_LAST_UPDATE_KEY, new Date().toISOString());
        } catch (e) { /* ignore */ }
    }

    var ELECCIONES_META_VOTOS = 15000;

    // Porcentagem de votos computados — base: APENAS votos Centro (meta 15.000)
    // Claustro é eleição separada com eleitorado próprio; NÃO entra na barra
    // 100% se worker detectou "Datos Finales"; cap em 99% se passar da meta sem finais
    function eleccionesPctVotos(data) {
        if (localStorage.getItem(ELECCIONES_FINAL_KEY) === 'true') return 100;
        var total = 0;
        for (var i = 0; i < data.length; i++) total += (data[i].votosCentro || 0);
        var pct = Math.floor(total / ELECCIONES_META_VOTOS * 100);
        if (pct < 0) pct = 0;
        if (pct > 99) pct = 99;
        return pct;
    }

    // Barra textual: |▮▮▮▯▯▯… NN%| (18 slots)
    // floor evita que 99% preencha a barra toda (round faria)
    function eleccionesRenderBarraVotos(pct) {
        var slots = 18;
        var cheias = Math.floor(pct / 100 * slots);
        var barra = '';
        for (var i = 0; i < slots; i++) barra += (i < cheias) ? '▮' : '▯';
        return '|' + barra + ' ' + pct + '%|';
    }

    // Atualiza a barra no modal aberto
    function eleccionesAtualizarBarraVotos(data) {
        if (!eleccionesModal) return;
        var el = eleccionesModal.querySelector('.elecciones-barra-votos');
        if (el) el.textContent = eleccionesRenderBarraVotos(eleccionesPctVotos(data));
    }

    function eleccionesIsUltimaSexta() {
        var d = new Date();
        // Última sexta-feira do mês: sexta-feira cujo próximo +7d vai para o mês seguinte
        if (d.getDay() !== 5) return false;
        var prox = new Date(d);
        prox.setDate(d.getDate() + 7);
        return prox.getMonth() !== d.getMonth();
    }

    function eleccionesEsHorarioAuto() {
        var d = new Date();
        var h = d.getHours();
        // Das 18h até 3h do dia seguinte (cruzando meia-noite)
        return h >= 18 || h < 3;
    }

    function eleccionesShouldAutoRefresh() {
        return eleccionesIsUltimaSexta() && eleccionesEsHorarioAuto();
    }

    // Verifica se a semana atual (currentDot) contém evento de eleições
    function eleccionesSemanaAtual() {
        if (!currentDot) return false;
        var tip = currentDot._minicalTip || '';
        return tip.indexOf('Elecciones Estudiantiles') !== -1;
    }

    // Injeta o botão "Elecciones Estudantiles" abaixo do calendário
    function eleccionesInjetarBotao() {
        // Remove se já existir
        var existente = document.getElementById('eleccionesBanner');
        if ( existente ) existente.remove();

        if ( !eleccionesSemanaAtual() ) return;

        var banner = document.createElement('div');
        banner.id = 'eleccionesBanner';
        banner.className = 'elecciones-banner';
        banner.innerHTML = '<button id="btnElecciones" class="elecciones-btn" aria-label="Abrir Elecciones Estudiantiles">🗳 Elecciones Estudiantiles</button>';
        banner.style.marginTop = '8px';
        banner.style.textAlign = 'center';

        var btn = banner.querySelector('#btnElecciones');
        btn.addEventListener('click', function () {
            eleccionesAbrirModal();
        });

        container.parentNode.insertBefore(banner, container.nextSibling);
    }

    // Modal flutuante
    var eleccionesModal = null;
    var eleccionesOverlay = null;

    function eleccionesFecharModal() {
        if (eleccionesModal) { eleccionesModal.remove(); eleccionesModal = null; }
        if (eleccionesOverlay) { eleccionesOverlay.remove(); eleccionesOverlay = null; }
    }

    // ─── Ordem fixa do resultado (decrescente) ───

    function eleccionesRenderLista(data, dataAnterior) {
        // Ordem fixa: maior votos Centro em cima (tie-break: Claustro desc, depois nome)
        var ordenado = data.slice().sort(function (a, b) {
            if (b.votosCentro !== a.votosCentro) return b.votosCentro - a.votosCentro;
            if (b.votosClaustro !== a.votosClaustro) return b.votosClaustro - a.votosClaustro;
            var na = (a.nombre || '').toLowerCase(), nb = (b.nombre || '').toLowerCase();
            return na < nb ? -1 : na > nb ? 1 : 0;
        });
        // Mapa de votos anteriores por nome (para comparar)
        var mapAnt = {};
        if (dataAnterior) {
            for (var k = 0; k < dataAnterior.length; k++) {
                mapAnt[dataAnterior[k].nombre] = dataAnterior[k];
            }
        }
        var ul = document.createElement('ul');
        ul.className = 'elecciones-lista';

        for (var i = 0; i < ordenado.length; i++) {
            var item = ordenado[i];
            var li = document.createElement('li');
            li.className = 'elecciones-item';

            // Destaque: 1º mais forte, 2º um pouco menos, outros lightgray
            if (i === 0) li.className += ' primero';
            else if (i === 1) li.className += ' segundo';
            else li.style.color = 'lightgray';

            var nome = document.createElement('span');
            nome.className = 'elecciones-nombre';
            nome.textContent = item.nombre;

            var votosC = document.createElement('span');
            votosC.className = 'elecciones-votos centro';
            var diffC = '';
            if (mapAnt[item.nombre]) {
                var d = item.votosCentro - mapAnt[item.nombre].votosCentro;
                if (d > 0) diffC = ' <span class="elecciones-diff">(+'+d+')</span>';
                else if (d < 0) diffC = ' <span class="elecciones-diff">('+d+')</span>';
            }
            votosC.innerHTML = item.votosCentro + diffC;

            var votosCl = document.createElement('span');
            votosCl.className = 'elecciones-votos claustro';
            var diffCl = '';
            if (mapAnt[item.nombre]) {
                var dl = item.votosClaustro - mapAnt[item.nombre].votosClaustro;
                if (dl > 0) diffCl = ' <span class="elecciones-diff">(+'+dl+')</span>';
                else if (dl < 0) diffCl = ' <span class="elecciones-diff">('+dl+')</span>';
            }
            votosCl.innerHTML = item.votosClaustro + diffCl;

            li.appendChild(nome);
            li.appendChild(votosC);
            li.appendChild(votosCl);
            ul.appendChild(li);
        }
        return ul;
    }

    function eleccionesAbrirModal() {
        eleccionesFecharModal();

        var data = eleccionesGetData();
        var ultimo = localStorage.getItem(ELECCIONES_LAST_UPDATE_KEY);
        var ultimoTxt = ultimo ? new Date(ultimo).toLocaleString('es-AR') : '—';

        // Overlay
        eleccionesOverlay = document.createElement('div');
        eleccionesOverlay.className = 'elecciones-overlay';
        eleccionesOverlay.style.position = 'fixed';
        eleccionesOverlay.style.inset = '0';
        eleccionesOverlay.style.background = 'rgba(0,0,0,0.6)';
        eleccionesOverlay.style.zIndex = '5000';
        eleccionesOverlay.style.display = 'flex';
        eleccionesOverlay.style.alignItems = 'center';
        eleccionesOverlay.style.justifyContent = 'center';
        eleccionesOverlay.addEventListener('click', function (e) {
            if (e.target === eleccionesOverlay) eleccionesFecharModal();
        });

        // Modal
        eleccionesModal = document.createElement('div');
        eleccionesModal.className = 'elecciones-modal';
        eleccionesModal.style.background = 'var(--bg-card)';
        eleccionesModal.style.border = '1px solid var(--border-strong)';
        eleccionesModal.style.borderRadius = '8px';
        eleccionesModal.style.padding = '16px';
        eleccionesModal.style.width = 'min(92vw, 520px)';
        eleccionesModal.style.maxHeight = '85vh';
        eleccionesModal.style.overflowY = 'auto';
        eleccionesModal.style.position = 'relative';
        eleccionesModal.style.zIndex = '5001';
        eleccionesModal.style.color = 'var(--text)';
        eleccionesModal.style.fontFamily = 'inherit';
        eleccionesModal.style.fontSize = '13px';

        // Título
        var h = document.createElement('h3');
        h.textContent = 'Elecciones Estudiantiles — FCM UNLP 2026';
        h.style.margin = '0 0 12px 0';
        h.style.fontSize = '16px';
        h.style.color = 'var(--text)';
        eleccionesModal.appendChild(h);

        // Barra de progresso de votos (acima da tabela)
        var barraVotos = document.createElement('div');
        barraVotos.className = 'elecciones-barra-votos';
        barraVotos.textContent = eleccionesRenderBarraVotos(eleccionesPctVotos(data));
        barraVotos.style.textAlign = 'center';
        barraVotos.style.fontFamily = 'monospace';
        barraVotos.style.fontSize = '13px';
        barraVotos.style.marginBottom = '10px';
        barraVotos.style.color = 'var(--text)';
        eleccionesModal.appendChild(barraVotos);

        // Cabeçalho fixo
        var cabec = document.createElement('div');
        cabec.style.display = 'flex';
        cabec.style.fontSize = '11px';
        cabec.style.fontWeight = '600';
        cabec.style.color = 'var(--text-muted)';
        cabec.style.marginBottom = '8px';
        cabec.style.cursor = 'default';

        var thAgrup = document.createElement('span');
        thAgrup.textContent = 'Agrupación';
        thAgrup.style.flex = '1';
        thAgrup.style.paddingLeft = '2px';
        thAgrup.className = 'elecciones-th';
        cabec.appendChild(thAgrup);

        var thCentro = document.createElement('span');
        thCentro.textContent = 'Centro';
        thCentro.style.textAlign = 'right';
        thCentro.style.width = '70px';
        thCentro.style.paddingRight = '4px';
        thCentro.className = 'elecciones-th';
        cabec.appendChild(thCentro);

        var thClaustro = document.createElement('span');
        thClaustro.textContent = 'Claustro';
        thClaustro.style.textAlign = 'right';
        thClaustro.style.width = '70px';
        thClaustro.style.paddingRight = '4px';
        thClaustro.className = 'elecciones-th';
        cabec.appendChild(thClaustro);

        eleccionesModal.appendChild(cabec);

        // Lista
        var ul = eleccionesRenderLista(data);
        eleccionesModal.appendChild(ul);

        // Rodapé centralizado: barra de progresso + botão Actualizar + timestamp abaixo
        var foot = document.createElement('div');
        foot.className = 'elecciones-foot';
        foot.style.display = 'flex';
        foot.style.flexDirection = 'column';
        foot.style.alignItems = 'center';
        foot.style.marginTop = '12px';
        foot.style.paddingTop = '8px';
        foot.style.borderTop = '1px solid var(--border)';
        foot.style.textAlign = 'center';

        // Barra de progresso (oculta por padrão, cresce durante o scrape)
        var progressBar = document.createElement('div');
        progressBar.className = 'elecciones-progress-bar';
        progressBar.style.width = '100%';
        progressBar.style.height = '3px';
        progressBar.style.background = 'var(--border)';
        progressBar.style.borderRadius = '2px';
        progressBar.style.overflow = 'hidden';
        progressBar.style.marginBottom = '8px';

        var progressFill = document.createElement('div');
        progressFill.className = 'elecciones-progress-fill';
        progressFill.style.width = '0%';
        progressFill.style.height = '100%';
        progressFill.style.background = 'var(--cursando)';
        progressFill.style.transition = 'width 0.3s ease';
        progressBar.appendChild(progressFill);
        foot.appendChild(progressBar);

        var btnAct = document.createElement('button');
        btnAct.textContent = '🔄 Actualizar';
        btnAct.className = 'elecciones-btn-actualizar';
        btnAct.style.padding = '6px 16px';
        btnAct.style.fontSize = '12px';
        btnAct.style.background = 'var(--cursando)';
        btnAct.style.color = 'var(--bg)';
        btnAct.style.border = 'none';
        btnAct.style.borderRadius = '4px';
        btnAct.style.cursor = 'pointer';
        btnAct.style.fontWeight = '600';
        btnAct.addEventListener('click', function (e) { e.stopPropagation(); eleccionesAtualizar(); });
        foot.appendChild(btnAct);

        var ts = document.createElement('div');
        ts.id = 'eleccionesUltimaActualizacao';
        ts.textContent = 'Últ. actualización: ' + ultimoTxt;
        ts.style.fontSize = '10px';
        ts.style.color = 'var(--text-faint)';
        ts.style.marginTop = '6px';
        foot.appendChild(ts);

        eleccionesModal.appendChild(foot);

        // Fechar com ESC
        var onEsc = function (e) {
            if (e.key === 'Escape') {
                eleccionesFecharModal();
                document.removeEventListener('keydown', onEsc);
            }
        };
        document.addEventListener('keydown', onEsc);

        eleccionesOverlay.appendChild(eleccionesModal);
        document.body.appendChild(eleccionesOverlay);
    }

    function eleccionesAtualizar() {
        // Cooldown de 5 min — GATED por ELECCIONES_COOLDOWN_ENABLED (desabilitado até sistema 100% funcional)
        var btn = eleccionesModal.querySelector('.elecciones-btn-actualizar');
        var agora = new Date().getTime();
        var ultimo = localStorage.getItem(ELECCIONES_LAST_UPDATE_KEY);
        if (ELECCIONES_COOLDOWN_ENABLED && ultimo && agora - parseInt(ultimo, 10) < 5 * 60 * 1000 && btn) {
            return; // ainda em cooldown
        }

        // Dados anteriores para comparação
        var dataAnterior = eleccionesGetData();

        // Marca o instante do attempt no localStorage ANTES de chamar o worker,
        // assim o botão fica desabilitado por 5 min mesmo se o scrape falhar
        try {
            localStorage.setItem(ELECCIONES_LAST_UPDATE_KEY, agora.toString());
        } catch (e) { /* ignore */ }

        // Tenta scraping da página oficial via worker
        var WORKER_BASE = 'https://cartelera-proxy.felipestesta.workers.dev';
        var ctrl = new AbortController();
        var t = setTimeout(function () { ctrl.abort(); }, 15000);
        if (btn) {
            btn.disabled = true;
            btn.style.opacity = '0.5';
            btn.style.cursor = 'not-allowed';
            btn.textContent = '⏳ Atualizando…';
        }
        // Iniciar animação da barra de progresso (cresce para ~70% enquanto carrega)
        var progressFill = eleccionesModal.querySelector('.elecciones-progress-fill');
        if (progressFill) {
            progressFill.style.width = '70%';
        }
        fetch(WORKER_BASE + '/elecciones-scrape', {
            method: 'POST',
            signal: ctrl.signal
        })
            .then(function (resp) { return resp.json(); })
            .then(function (result) {
                clearTimeout(t);
                if (progressFill) {
                    progressFill.style.width = '100%';
                }
                if (result.ok && result.data && result.data.length > 0) {
                    // Salva dados scrapados no localStorage
                    try {
                        localStorage.setItem(ELECCIONES_DATA_KEY, JSON.stringify(result.data));
                        // Atualiza timestamp com o instante real de conclusão
                        localStorage.setItem(ELECCIONES_LAST_UPDATE_KEY, new Date().toISOString());
                        if (result.eleicoesTerminadas) {
                            localStorage.setItem(ELECCIONES_FINAL_KEY, 'true');
                        } else {
                            // Scrape fresco confirmou recuento em andamento — limpa flag antiga
                            localStorage.removeItem(ELECCIONES_FINAL_KEY);
                        }
                    } catch (e) { /* ignore */ }
                    // Re-render lista se modal aberto, passando dados anteriores para comparação
                    var ul = eleccionesModal.querySelector('.elecciones-lista');
                    if (ul) {
                        var novo = eleccionesRenderLista(result.data, dataAnterior);
                        ul.parentNode.replaceChild(novo, ul);
                    }
                    eleccionesAtualizarBarraVotos(result.data);
                    // Atualiza timestamp visível
                    var ts = document.getElementById('eleccionesUltimaActualizacao');
                    if (ts) {
                        ts.textContent = 'Últ. actualización: ' + new Date().toLocaleString('es-AR');
                    }
                    // Se o worker detectou "Datos Finales" (eleições terminadas),
                    // dispara envio automático de email para todos os inscritos cadastrados
                    if (result.eleicoesTerminadas) {
                        eleccionesEnviarEmailAutomatico();
                    }
                } else {
                    throw new Error(result.error || 'Scrape falhou');
                }
                // Reabilita o botão (ele permanecerá desabilitado pelo cooldown de 5 min
                // através do ELECCIONES_LAST_UPDATE_KEY salvo acima)
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.textContent = '🔄 Actualizar';
                }
            })
            .catch(function () {
                clearTimeout(t);
                if (progressFill) {
                    progressFill.style.width = '0%';
                }
                // Sem rede ou scrape falhou — mantém dados locais
                var data = eleccionesGetData();
                var ul = eleccionesModal.querySelector('.elecciones-lista');
                if (ul) {
                    var novo = eleccionesRenderLista(data, dataAnterior);
                    ul.parentNode.replaceChild(novo, ul);
                }
                eleccionesAtualizarBarraVotos(data);
                // Reabilita o botão (cooldown continua ativo via localStorage)
                if (btn) {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                    btn.style.cursor = 'pointer';
                    btn.textContent = '🔄 Actualizar';
                }
            });
    }

    // ─── Envio automático de email quando eleições terminarem ───
    function eleccionesEnviarEmailAutomatico() {
        var WORKER_BASE = 'https://cartelera-proxy.felipestesta.workers.dev';
        var ctrl = new AbortController();
        var t = setTimeout(function () { ctrl.abort(); }, 15000);
        fetch(WORKER_BASE + '/elecciones-send', {
            method: 'POST',
            signal: ctrl.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        })
            .then(function (resp) { return resp.json(); })
            .then(function (result) {
                clearTimeout(t);
                if (result.ok) {
                    console.log('📧 Resultado final enviado automaticamente para ' + result.enviados + ' destinatário(s).');
                } else {
                    console.error('❌ Falha ao enviar email automático: ' + (result.error || 'erro desconhecido'));
                }
            })
            .catch(function () {
                clearTimeout(t);
                console.error('❌ Falha de rede ao enviar email automático.');
            });
    }

    // Auto-atualização a cada 20 min (última sexta-feira, 18h–3h)
    if (eleccionesShouldAutoRefresh()) {
        var ultimoUpdate = localStorage.getItem(ELECCIONES_LAST_UPDATE_KEY);
        var agora = new Date().getTime();
        if (!ultimoUpdate || agora - parseInt(ultimoUpdate, 10) > 20 * 60 * 1000) {
            var data = eleccionesGetData();
            eleccionesSaveData(data);
        }
        setInterval(function () {
            if (!eleccionesShouldAutoRefresh()) return;
            var data = eleccionesGetData();
            eleccionesSaveData(data);
        }, 20 * 60 * 1000);
    }

    // Injetar botão se a semana atual for de eleições
    eleccionesInjetarBotao();
}

document.addEventListener('DOMContentLoaded', initMinical);
