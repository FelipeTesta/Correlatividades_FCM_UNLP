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
    'verano2': 5
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
}

document.addEventListener('DOMContentLoaded', initMinical);
