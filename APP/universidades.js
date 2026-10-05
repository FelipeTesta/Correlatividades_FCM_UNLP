// ===============================
// OTRAS UNIVERSIDADES — Map + Tree View
// Vanilla JS, zero localStorage/sessionStorage/cookies
// English identifiers, Spanish UI text
// ===============================

let uniMap = null;
let uniMarkers = {};
let currentUniId = null;
let uniSelectedNode = null;
let uniSvg = null;
let uniTreeContainer = null;
let uniTreeContent = null;
let drawConnectionsThrottle = null;
let uniMenuBuilt = false;

// Simplified subject status (session-only, no persistence):
// 🟢 = "aprobada". Reset on page reload or university switch.
let uniStatusMap = {};
let uniNodeElements = {};
let suppressNextNodeClick = false;
// Simplified plans (plan.simplified): materias list only — no status buttons, no correlativas
let currentPlanSimplified = false;

// ===============================
// INIT
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    initMap();
    buildUniversityTable();
    buildUniversityFilterPanel();
    buildUniMenu();
    handleHashRouting();
    setupEventListeners();
    initOnlineBadge();
});

// === Online visitor badge (same worker + session key as nav.js) ===
function initOnlineBadge() {
    const badge = document.getElementById('uniOnlineBadge');
    if (!badge) return;
    const WORKER_BASE = 'https://cartelera-proxy.felipestesta.workers.dev';

    let sessionId;
    try {
        sessionId = localStorage.getItem('visitorSessionId');
        if (!sessionId) {
            sessionId = crypto.randomUUID();
            localStorage.setItem('visitorSessionId', sessionId);
        }
    } catch (e) {
        sessionId = 'fallback-' + Math.random().toString(36).slice(2);
    }

    async function updateOnlineStatus() {
        try {
            // Single request: the heartbeat response carries the counts
            const res = await fetch(WORKER_BASE + '/heartbeat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId })
            });
            const data = await res.json();
            badge.textContent = '🟢 ' + (data.online || 0) + '/' + (data.visits || 0);
        } catch (e) {
            badge.textContent = '🟢 …';
        }
    }

    // Poll every 60 seconds (Cloudflare free-tier budget), paused while the tab is hidden
    let heartbeatTimer = null;
    function startPolling() {
        if (heartbeatTimer === null) heartbeatTimer = setInterval(updateOnlineStatus, 60000);
    }
    function stopPolling() {
        if (heartbeatTimer !== null) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }
    document.addEventListener('visibilitychange', function () {
        if (document.hidden) {
            stopPolling();
        } else {
            updateOnlineStatus(); // immediate beat on return
            startPolling();
        }
    });
    if (!document.hidden) {
        setTimeout(updateOnlineStatus, 2000);
        startPolling();
    }
}

function setupEventListeners() {
    // ESC key: close modal > close menu > deselect node
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modalOverlay = document.getElementById('uniModalOverlay');
            if (modalOverlay && modalOverlay.style.display !== 'none') {
                closeUniversityModal();
                return;
            }
            const menu = document.getElementById('uniNavMenu');
            if (menu && menu.style.display !== 'none') {
                closeUniMenu();
                return;
            }
            if (uniSelectedNode) deselectUniNode();
        }
    });

    // Window resize → redraw SVG (foreground only, rAF OK)
    window.addEventListener('resize', function() {
        if (document.getElementById('uniTreeView').style.display !== 'none') {
            requestAnimationFrame(function() {
                updateUniSvgDimensions();
                drawUniConnections();
            });
        }
    });

    // Scroll → redraw connections (throttled)
    window.addEventListener('scroll', function() {
        if (document.getElementById('uniTreeView').style.display !== 'none') {
            if (drawConnectionsThrottle) clearTimeout(drawConnectionsThrottle);
            drawConnectionsThrottle = setTimeout(function() {
                drawUniConnections();
            }, 100);
        }
    });

    // Modal overlay click to close
    document.getElementById('uniModalOverlay').addEventListener('click', closeUniversityModal);

    // Click outside navbar menu to close it
    document.addEventListener('click', function(e) {
        const menu = document.getElementById('uniNavMenu');
        const menuBtn = document.getElementById('uniNavMenuBtn');
        if (menu && menu.style.display !== 'none' &&
            !menu.contains(e.target) && e.target !== menuBtn && !menuBtn.contains(e.target)) {
            closeUniMenu();
        }
    });
}

// ===============================
// NAVBAR STATE + DROPDOWN MENU
// ===============================

function setNavbarState(view, uni) {
    const backHome = document.getElementById('uniNavBackHome');
    const backPlan = document.getElementById('uniNavBackPlan');
    const title = document.getElementById('uniNavTitle');
    const menuBtn = document.getElementById('uniNavMenuBtn');

    if (view === 'plan' && uni) {
        backHome.style.display = 'none';
        backPlan.style.display = '';
        title.textContent = uni.sigla + ' — ' + uni.nombre;
        menuBtn.style.display = '';
    } else {
        backHome.style.display = '';
        backPlan.style.display = 'none';
        title.textContent = '🇦🇷 Otras Universidades';
        menuBtn.style.display = 'none';
    }
}

function buildUniMenu() {
    const menu = document.getElementById('uniNavMenu');
    if (!menu) return;

    // Header item: back to list + map
    const listItem = document.createElement('button');
    listItem.type = 'button';
    listItem.className = 'uni-menu-item uni-menu-item-strong';
    listItem.textContent = '🗺️ Lista y mapa';
    listItem.onclick = function() { closeUniMenu(); switchToMap(); };
    menu.appendChild(listItem);

    const divider = document.createElement('hr');
    divider.className = 'uni-menu-divider';
    menu.appendChild(divider);

    UNIVERSIDADES.forEach(function(uni) {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'uni-menu-item' +
            (uni.plan ? ' has-plan' : '') +
            (uni.redirectTo ? ' is-unlp' : '');
        item.dataset.uniId = uni.id;

        const sigla = document.createElement('span');
        sigla.className = 'uni-menu-sigla';
        sigla.textContent = uni.sigla;
        item.appendChild(sigla);

        const nombre = document.createElement('span');
        nombre.className = 'uni-menu-nombre';
        nombre.textContent = uni.nombre + (uni.plan ? '' : ' · sin plan');
        item.appendChild(nombre);

        item.onclick = function() {
            closeUniMenu();
            if (uni.redirectTo) {
                window.location.href = uni.redirectTo;
                return;
            }
            if (uni.plan) {
                switchToTree(uni.id);
                return;
            }
            openUniversityModal(uni.id);
        };
        menu.appendChild(item);
    });

    uniMenuBuilt = true;
}

function toggleUniMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById('uniNavMenu');
    const menuBtn = document.getElementById('uniNavMenuBtn');
    if (!menu || !uniMenuBuilt) return;
    const isOpen = menu.style.display !== 'none';
    if (isOpen) {
        closeUniMenu();
    } else {
        // Mark current university
        menu.querySelectorAll('.uni-menu-item[data-uni-id]').forEach(function(item) {
            item.classList.toggle('active', item.dataset.uniId === currentUniId);
        });
        menu.style.display = 'flex';
        menuBtn.setAttribute('aria-expanded', 'true');
    }
}

function closeUniMenu() {
    const menu = document.getElementById('uniNavMenu');
    const menuBtn = document.getElementById('uniNavMenuBtn');
    if (menu) menu.style.display = 'none';
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
}

// ===============================
// MAP INIT (Leaflet)
// ===============================

function initMap() {
    const mapEl = document.getElementById('uniMap');
    if (!mapEl) return;

    uniMap = L.map('uniMap', {
        center: [-35.5, -64.5],
        zoom: 4,
        minZoom: 3,
        // Wide bounds + low viscosity: old tight bounds (~viewport height at z4)
        // rubber-banded vertical drags — felt like the map "locked up".
        maxBounds: L.latLngBounds([-60, -95], [10, -30]),
        maxBoundsViscosity: 0.35,
        scrollWheelZoom: true,
        zoomControl: true,
        attributionControl: true,
        dragging: { inertia: false }
    });

    // CartoDB Dark tiles (API key)
    L.tileLayer('https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png?key=cb1_41qr_1_e31aed0c04d6b1eccbeec395', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19
    }).addTo(uniMap);

    // Add markers for each university
    UNIVERSIDADES.forEach(function(uni) {
        addUniMarker(uni);
    });

    // ⤢ Fit-all control (below the +/- zoom buttons): zoom out until every pin is visible
    const fitAllControl = L.control({ position: 'topleft' });
    fitAllControl.onAdd = function() {
        const div = L.DomUtil.create('div', 'uni-fit-all-control');
        const btn = L.DomUtil.create('button', '', div);
        btn.type = 'button';
        btn.textContent = '⤢';
        btn.title = 'Ver todas las universidades';
        btn.setAttribute('aria-label', 'Enfocar todas las universidades en el mapa');
        L.DomEvent.disableClickPropagation(div);
        btn.onclick = function() { fitAllUniversities(); };
        return div;
    };
    fitAllControl.addTo(uniMap);
}

// ⤢ Fit every university pin into the viewport
function fitAllUniversities() {
    if (!uniMap) return;
    const bounds = L.latLngBounds(UNIVERSIDADES.map(function(u) { return [u.lat, u.lng]; }));
    if (bounds.isValid()) uniMap.fitBounds(bounds, { padding: [30, 30] });
}

function addUniMarker(uni) {
    const hasPlan = !!uni.plan;
    const pinClass = hasPlan ? 'uni-pin has-plan' : 'uni-pin no-plan';

    const pinWidth = Math.max(34, uni.sigla.length * 7 + 10);
    const icon = L.divIcon({
        className: pinClass,
        html: '<span>' + uni.sigla + '</span>',
        iconSize: [pinWidth, 34],
        iconAnchor: [pinWidth / 2, 17]
    });

    const marker = L.marker([uni.lat, uni.lng], { icon: icon })
        .addTo(uniMap)
        .on('click', function() {
            openUniversityModal(uni.id);
        });

    uniMarkers[uni.id] = marker;
}

// 📍 Scroll to map + center on the university + pulse its pin
function focusUniversity(id) {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni || !uniMap) return;

    const marker = uniMarkers[id];
    if (marker) marker.setZIndexOffset(1000);

    const mapEl = document.getElementById('uniMap');
    if (mapEl) mapEl.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // KM-based focus zoom (user preference 2026-09-29): near-capital cluster (CABA/GBA/La Plata, distToCapital ≤100km) → z9; isolated unis (1 per province) → z8 so neighboring pins stay visible without zoom-out
    const distKm = uni.stats ? uni.stats.distanceToCapitalKm : null;
    const focusZoom = (distKm !== null && distKm <= 100) ? 9 : 8;
    uniMap.setView([uni.lat, uni.lng], focusZoom, { animate: true });

    if (marker) {
        const el = marker.getElement();
        if (el) {
            el.classList.remove('uni-pin-pulse');
            void el.offsetWidth; // restart animation
            el.classList.add('uni-pin-pulse');
            setTimeout(function() { el.classList.remove('uni-pin-pulse'); }, 1700);
        }
    }
}

// 📋 Close modal + scroll to the university's table row + pulse it (reverse of 📍)
function scrollToUniversityRow(id) {
    const row = document.querySelector('#uniTable tbody tr[data-uni-id="' + id + '"]');
    if (!row) return;
    closeUniversityModal();
    if (row.tabIndex >= 0) row.focus({ preventScroll: true });
    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
    row.classList.remove('uni-row-pulse');
    void row.offsetWidth; // restart animation
    row.classList.add('uni-row-pulse');
    setTimeout(function() { row.classList.remove('uni-row-pulse'); }, 1700);
}

// ===============================
// UNIVERSITY INFO MODAL
// ===============================

function openUniversityModal(id) {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni) return;

    currentUniId = id;

    const badge = document.getElementById('uniModalBadge');
    const title = document.getElementById('uniModalTitle');
    const body = document.getElementById('uniModalBody');
    const btnPlan = document.getElementById('uniBtnPlan');
    const overlay = document.getElementById('uniModalOverlay');
    const card = document.getElementById('uniModalCard');

    badge.textContent = uni.sigla;
    title.textContent = uni.nombre;

    const hasPlan = !!uni.plan || !!uni.redirectTo;
    let statsHtml = '';
    if (uni.plan) {
        const totalMaterias = uni.plan.anios.reduce(function(sum, a) { return sum + a.materias.length; }, 0);
        statsHtml = '<div class="uni-modal-stats">' +
            '<span>📚 ' + totalMaterias + ' materias</span>' +
            '<span>📅 ' + (uni.stats && uni.stats.careerYears ? uni.stats.careerYears : uni.plan.anios.length) + ' años</span>' +
        '</div>';
    }

    // Ficha: same columns + formatters as the table (null → "—")
    const fichaStats = uni.stats || {};
    let fichaHtml = '<div class="uni-modal-ficha" aria-label="Datos de la tabla"><span class="uni-ficha-head">📊 Datos de la tabla</span><div class="uni-ficha-grid">';
    UNI_STAT_COLUMNS.forEach(function(col) {
        const v = fichaStats[col.key];
        const v2 = col.key2 ? fichaStats[col.key2] : null;
        const hasVal = (v !== null && v !== undefined) || (v2 !== null && v2 !== undefined);
        const text = hasVal ? (col.fmt ? col.fmt(v, v2) : String(v)) : '—';
        fichaHtml += '<div class="uni-ficha-item" title="' + col.title + '">' +
            '<span class="uni-ficha-label">' + col.label + '</span>' +
            '<span class="uni-ficha-value' + (hasVal ? '' : ' is-pending') + '">' + text + '</span>' +
        '</div>';
    });
    fichaHtml += '</div></div>';

    body.innerHTML =
        '<p><strong>Facultad:</strong> ' + uni.facultad + '</p>' +
        '<p>📍 ' + uni.ciudad + ', ' + uni.provincia + '</p>' +
        '<p>Fundada: ' + uni.fundada + '</p>' +
        '<p>' + uni.descripcion + '</p>' +
        '<p>' +
            (uni.webUrl ? '<a href="' + uni.webUrl + '" target="_blank" rel="noopener" class="uni-wiki-link">🌎 Sitio oficial ↗</a> · ' : '') +
            '<a href="' + uni.wikiUrl + '" target="_blank" rel="noopener" class="uni-wiki-link">Wikipedia ↗</a> · ' +
            '<a href="#" class="uni-wiki-link uni-show-table" role="button">📋 Mostrar en la tabla</a>' +
        '</p>' +
        fichaHtml +
        statsHtml;

    const showTableLink = body.querySelector('.uni-show-table');
    if (showTableLink) {
        showTableLink.onclick = function(e) { e.preventDefault(); scrollToUniversityRow(id); };
    }

    if (hasPlan) {
        btnPlan.textContent = '🌲 Ver Plan de Estudios';
        btnPlan.disabled = false;
        btnPlan.classList.remove('uni-btn-disabled');
    } else {
        btnPlan.textContent = '📋 Plan en investigación';
        btnPlan.disabled = true;
        btnPlan.classList.add('uni-btn-disabled');
    }

    overlay.style.display = 'block';
    card.style.display = 'block';
    document.body.style.overflow = 'hidden';

    btnPlan.focus();
}

function closeUniversityModal() {
    const overlay = document.getElementById('uniModalOverlay');
    const card = document.getElementById('uniModalCard');
    overlay.style.display = 'none';
    card.style.display = 'none';
    document.body.style.overflow = '';
    currentUniId = null;
}

function switchToTreeFromModal() {
    const id = currentUniId;
    if (!id) return;
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni) return;
    if (uni.redirectTo) {
        window.location.href = uni.redirectTo;
        return;
    }
    closeUniversityModal();
    switchToTree(id);
}

// ===============================
// VIEW SWITCHING
// ===============================

function switchToTree(id) {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni || !uni.plan) return;

    currentUniId = id;

    document.getElementById('uniMapView').style.display = 'none';
    document.getElementById('uniTreeView').style.display = 'block';

    setNavbarState('plan', uni);
    updateInfoLine(uni);
    renderUniTree(id);

    window.scrollTo(0, 0);

    try { history.replaceState(null, '', '#' + id); } catch (err) { /* file:// safe */ }
}

function switchToMap() {
    document.getElementById('uniTreeView').style.display = 'none';
    document.getElementById('uniMapView').style.display = 'block';

    setNavbarState('home', null);
    deselectUniNode();
    closeUniMenu();

    try { history.replaceState(null, '', window.location.pathname); } catch (err) { /* file:// safe */ }
}

function handleHashRouting() {
    const hash = window.location.hash.slice(1);
    if (hash) {
        const uni = UNIVERSIDADES.find(function(u) { return u.id === hash; });
        if (uni && uni.plan) {
            switchToTree(hash);
        }
    }
}

function updateInfoLine(uni) {
    const infoLine = document.getElementById('uniInfoLine');
    if (!infoLine || !uni.plan) return;

    infoLine.innerHTML =
        '<strong>' + uni.plan.nombre + '</strong> · ' +
        '<a href="' + uni.plan.fuente + '" target="_blank" rel="noopener" class="uni-fuente-link">fuente ↗</a> · ' +
        (uni.plan.simplified
            ? 'listado de materias — sin correlativas (plan simplificado)'
            : 'clic en una materia para resaltar sus correlativas');
}

// ===============================
// UNIVERSITY TABLE (home sector 1)
// ===============================

// Metric columns — Phase 2 research fills values; null/missing → "—"
const UNI_STAT_COLUMNS = [
    { key: 'careerYears', label: 'Años', title: 'Tiempo de carrera (años)', fmt: function(v) { return Number(v).toLocaleString('es-AR'); } },
    { key: 'graduationRate', label: '% Título', title: 'Se titula dentro del tiempo estimado (%)', fmt: function(v) { return v + '%'; } },
    { key: 'livingCostUsd', label: 'Costo vida', title: 'Costo de vida mensual — alquiler + gastos (USD)', fmt: function(v) { return 'US$ ' + Number(v).toLocaleString('es-AR'); } },
    { key: 'studentCount', label: 'Alumnos', title: 'Estudiantes en la carrera', fmt: function(v) { return Number(v).toLocaleString('es-AR'); } },
    { key: 'immigrantPct', label: 'Extranjeros', title: 'Estudiantes extranjeros (%)', fmt: function(v) { return v + '%'; } },
    { key: 'spanishLevel', label: 'Español', title: 'Nivel de español exigido' },
    { key: 'subjectCount', label: 'Materias', title: 'Materias obligatorias del plan' },
    { key: 'rankingNational', key2: 'rankingInternational', label: 'Ranking', title: 'Ranking nacional/internacional (falta investigar — TODO.md)', fmt: function(v, v2) { return (v === null || v === undefined ? '—' : v) + '/' + (v2 === null || v2 === undefined ? '—' : v2); } },
    { key: 'teachingMethod', label: 'Método', title: 'Método de enseñanza (PBL, tradicional, mixto)' },
    { key: 'distanceToCapitalKm', label: 'Dist. cap.', title: 'Distancia a CABA (km)', fmt: function(v) { return Number(v).toLocaleString('es-AR') + ' km'; } }
];

// Table sorting (session-only state) — 3-state cycle: asc -> desc -> data order
let uniSortCol = null;
let uniSortDir = 1;
const uniSortThs = {};
let uniRowsOriginal = [];   // rows in data order, captured at build time

function uniSortValue(uni, colKey) {
    if (colKey === 'uni-nombre') return uni.nombre;
    if (colKey === 'uni-region') return uni.region || uni.provincia;
    return (uni.stats || {})[colKey];
}

function compareUniForSort(uniA, uniB, colKey, dir) {
    const va = uniSortValue(uniA, colKey);
    const vb = uniSortValue(uniB, colKey);
    const aNull = va === null || va === undefined || va === '';
    const bNull = vb === null || vb === undefined || vb === '';
    if (aNull && bNull) return 0;
    if (aNull) return 1;   // nulls always last, regardless of direction
    if (bNull) return -1;
    const na = parseFloat(va);
    const nb = parseFloat(vb);
    let base;
    if (!isNaN(na) && !isNaN(nb)) {
        base = na - nb;
    } else {
        base = String(va).localeCompare(String(vb), 'es');
    }
    if (base === 0 && colKey === 'rankingNational') {
        // tie-break: international position ('501-550' parses as 501)
        const ia = parseFloat(uniA.stats ? uniA.stats.rankingInternational : null);
        const ib = parseFloat(uniB.stats ? uniB.stats.rankingInternational : null);
        if (!isNaN(ia) && !isNaN(ib)) base = ia - ib;
    }
    return base * dir;
}

function sortUniversityTable(colKey) {
    const tbody = document.querySelector('#uniTable tbody');
    if (!tbody) return;

    // Cycle: asc -> desc -> original order
    if (uniSortCol !== colKey) { uniSortCol = colKey; uniSortDir = 1; }
    else if (uniSortDir === 1) { uniSortDir = -1; }
    else { uniSortCol = null; uniSortDir = 1; }

    // Header indicators + aria
    Object.keys(uniSortThs).forEach(function(key) {
        const th = uniSortThs[key];
        th.textContent = th.dataset.sortLabel;
        th.classList.remove('uni-th-sorted');
        th.setAttribute('aria-sort', 'none');
    });
    if (uniSortCol && uniSortThs[uniSortCol]) {
        const th = uniSortThs[uniSortCol];
        th.textContent = th.dataset.sortLabel + (uniSortDir === 1 ? ' ▲' : ' ▼');
        th.classList.add('uni-th-sorted');
        th.setAttribute('aria-sort', uniSortDir === 1 ? 'ascending' : 'descending');
    }

    // Reorder rows (appendChild moves existing nodes, keeping listeners)
    const rows = Array.prototype.map.call(tbody.rows, function(row, i) {
        const uni = UNIVERSIDADES.find(function(u) { return u.id === row.dataset.uniId; });
        return { row: row, uni: uni, i: i };
    });
    if (!uniSortCol) {
        // restore data order as captured at build time
        uniRowsOriginal.forEach(function(row) { tbody.appendChild(row); });
    } else {
        rows.sort(function(a, b) { return compareUniForSort(a.uni, b.uni, uniSortCol, uniSortDir); });
        rows.forEach(function(r) { tbody.appendChild(r.row); });
    }
}

function buildUniversityTable() {
    const table = document.getElementById('uniTable');
    if (!table) return;

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    const headCells = [
        { label: 'Universidad', title: null },
        { label: 'Ciudad', title: null },
        { label: '📍', title: 'Ver en el mapa' },
        { label: 'Plan', title: null },
        { label: 'Sitio', title: null }
    ].concat(UNI_STAT_COLUMNS);
    headCells.forEach(function(col) {
        const th = document.createElement('th');
        th.scope = 'col';
        th.textContent = col.label;
        th.dataset.sortLabel = col.label;
        if (col.title) th.title = col.title;
        const sortKey = (col.label === 'Universidad') ? 'uni-nombre' : (col.label === 'Ciudad') ? 'uni-region' : col.key || null;
        if (sortKey) {
            th.classList.add('uni-th-sortable');
            th.title = (th.title ? th.title + ' — ' : '') + 'clic para ordenar';
            uniSortThs[sortKey] = th;
            th.onclick = function() { sortUniversityTable(sortKey); };
        }
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    UNIVERSIDADES.forEach(function(uni) {
        const row = document.createElement('tr');
        row.className = 'uni-table-row' + (uni.redirectTo ? ' is-unlp' : '') + (uni.plan ? ' has-plan' : '');
        row.dataset.uniId = uni.id;
        row.setAttribute('tabindex', '0');
        row.setAttribute('role', 'button');
        row.setAttribute('aria-label', uni.nombre + ' — información');

        // Universidad cell: sigla only — full name as hover title, click opens modal
        const tdUni = document.createElement('td');
        tdUni.className = 'uni-table-uni';
        tdUni.title = uni.nombre;

        const sigla = document.createElement('span');
        sigla.className = 'uni-table-sigla';
        sigla.textContent = uni.sigla;
        tdUni.appendChild(sigla);

        row.appendChild(tdUni);

        // Ciudad cell: short region tag (GBA, CBA…) — full location as hover title
        const tdCity = document.createElement('td');
        tdCity.className = 'uni-table-ciudad';
        tdCity.textContent = uni.region || uni.provincia;
        tdCity.title = uni.ciudad + ', ' + uni.provincia;
        row.appendChild(tdCity);

        // Mapa cell: 📍 focus button (scroll to map + center + pulse)
        const tdMap = document.createElement('td');
        tdMap.className = 'uni-table-mapa';
        const btnMap = document.createElement('button');
        btnMap.type = 'button';
        btnMap.className = 'uni-table-btn';
        btnMap.textContent = '📍';
        btnMap.title = 'Ver en el mapa';
        btnMap.setAttribute('aria-label', uni.sigla + ' — centrar en el mapa');
        btnMap.onclick = function(e) { e.stopPropagation(); focusUniversity(uni.id); };
        tdMap.appendChild(btnMap);
        row.appendChild(tdMap);

        // Plan cell: 🌲 button (or — if none)
        const tdPlan = document.createElement('td');
        tdPlan.className = 'uni-table-plan';
        if (uni.plan || uni.redirectTo) {
            const btnPlan = document.createElement('button');
            btnPlan.type = 'button';
            btnPlan.className = 'uni-table-btn';
            btnPlan.textContent = '🌲';
            btnPlan.title = uni.redirectTo ? 'Ver plan (Modo Árbol)' : 'Ver plan de estudios';
            btnPlan.setAttribute('aria-label', uni.sigla + ' — plan de estudios');
            btnPlan.onclick = function(e) { e.stopPropagation(); openUniPlan(uni.id); };
            tdPlan.appendChild(btnPlan);
        } else {
            const pending = document.createElement('span');
            pending.className = 'uni-table-pending';
            pending.textContent = '—';
            pending.title = 'Plan en investigación';
            tdPlan.appendChild(pending);
        }
        row.appendChild(tdPlan);

        // Sitio cell: 🌎 link
        const tdSite = document.createElement('td');
        tdSite.className = 'uni-table-sitio';
        if (uni.webUrl) {
            const link = document.createElement('a');
            link.className = 'uni-table-btn';
            link.textContent = '🌎';
            link.title = 'Sitio oficial';
            link.setAttribute('aria-label', uni.sigla + ' — sitio oficial');
            link.href = uni.webUrl;
            link.target = '_blank';
            link.rel = 'noopener';
            tdSite.appendChild(link);
        }
        row.appendChild(tdSite);

        // Metric cells (stats schema — values researched in Phase 2)
        const stats = uni.stats || {};
        UNI_STAT_COLUMNS.forEach(function(col) {
            const tdStat = document.createElement('td');
            tdStat.className = 'uni-table-metric';
            const val = stats[col.key];
            const val2 = col.key2 ? stats[col.key2] : null;
            const hasVal = (val !== null && val !== undefined) || (val2 !== null && val2 !== undefined);
            if (!hasVal) {
                tdStat.textContent = '—';
                tdStat.classList.add('uni-table-pending');
                tdStat.title = 'En investigación';
            } else {
                tdStat.textContent = col.fmt ? col.fmt(val, val2) : String(val);
                // Ranking cells: per-university source tooltip (QS primary, EduRank fallback)
                tdStat.title = (col.key === 'rankingNational' && stats.rankingSource) ? stats.rankingSource : col.title;
            }
            row.appendChild(tdStat);
        });

        row.onclick = function() { openUniversityModal(uni.id); };
        row.onkeydown = function(e) { if (e.key === 'Enter') openUniversityModal(uni.id); };

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    uniRowsOriginal = Array.prototype.slice.call(tbody.rows);
}

// =====================
// Table FILTERS (session-only — no storage, like sorting)
// Quantitative metrics → single-track dual-handle sliders (min+max, CodePen
// pattern). Qualitative → checkbox groups. User pick (2026-09-29):
// costo de vida, alumnos, extranjeros, ranking, distancia (sliders) +
// español, método (checkboxes). NO ciudad, NO nombre, NO materias.
// =====================

const UNI_FILTER_SLIDERS = ['livingCostUsd', 'studentCount', 'immigrantPct', 'rankingNational', 'distanceToCapitalKm'];
const UNI_FILTER_CHECKS = ['spanishLevel', 'teachingMethod'];

let uniFilterPanelOpen = false;
let uniFilterTimer = null;
const uniFilterSliders = {}; // key -> {lo, hi, minEl, maxEl, fillEl, valEl}
const uniFilterChecks = {}; // key -> { value -> input }

function uniFilterBounds(key) {
    const vals = [];
    UNIVERSIDADES.forEach(function(u) {
        const v = (u.stats || {})[key];
        if (v !== null && v !== undefined) {
            const n = parseFloat(v);
            if (!isNaN(n)) vals.push(n);
        }
    });
    if (!vals.length) return null;
    const lo = Math.min.apply(null, vals);
    const hi = Math.max.apply(null, vals);
    if (lo === hi) return null; // constant value — filter useless
    // Step must land exactly on BOTH bounds, else the browser snaps the value
    // off-grid and the filter turns "active" on its own (breaks reset).
    const step = (Number.isInteger(lo) && Number.isInteger(hi)) ? 1 : 0.1;
    return { lo: lo, hi: hi, step: step };
}

function uniFilterFormat(key, v) {
    const col = UNI_STAT_COLUMNS.find(function(c) { return c.key === key; });
    if (col && col.fmt && key !== 'rankingNational') return col.fmt(v);
    return Number(v).toLocaleString('es-AR');
}

function buildUniversityFilterPanel() {
    const panel = document.getElementById('uniFilterPanel');
    const btn = document.getElementById('uniFilterBtn');
    const clear = document.getElementById('uniFilterClear');
    if (!panel || !btn || !clear) return;

    UNI_FILTER_SLIDERS.forEach(function(key) {
        const b = uniFilterBounds(key);
        if (!b) return;
        const col = UNI_STAT_COLUMNS.find(function(c) { return c.key === key; });

        const box = document.createElement('fieldset');
        box.className = 'uni-filter-group uni-slider-box';

        const head = document.createElement('div');
        head.className = 'uni-slider-head';
        const name = document.createElement('span');
        name.textContent = col ? col.label : key;
        const val = document.createElement('span');
        val.className = 'uni-slider-val';
        head.appendChild(name);
        head.appendChild(val);
        box.appendChild(head);

        const track = document.createElement('div');
        track.className = 'uni-slider-track';
        const bar = document.createElement('div');
        bar.className = 'uni-slider-bar';
        const fill = document.createElement('div');
        fill.className = 'uni-slider-fill';
        track.appendChild(bar);
        track.appendChild(fill);

        const inMin = document.createElement('input');
        inMin.type = 'range';
        inMin.min = b.lo;
        inMin.max = b.hi;
        inMin.step = b.step;
        inMin.value = b.lo;
        inMin.setAttribute('aria-label', (col ? col.label : key) + ' — mínimo');
        const inMax = document.createElement('input');
        inMax.type = 'range';
        inMax.min = b.lo;
        inMax.max = b.hi;
        inMax.step = b.step;
        inMax.value = b.hi;
        inMax.setAttribute('aria-label', (col ? col.label : key) + ' — máximo');
        track.appendChild(inMin);
        track.appendChild(inMax);
        box.appendChild(track);
        panel.appendChild(box);

        uniFilterSliders[key] = { lo: b.lo, hi: b.hi, minEl: inMin, maxEl: inMax, fillEl: fill, valEl: val, invert: key === 'rankingNational' };

        inMin.addEventListener('input', function() {
            if (parseFloat(inMin.value) > parseFloat(inMax.value)) inMin.value = inMax.value;
            updateUniSliderUI(key);
            scheduleUniversityFilterApply();
        });
        inMax.addEventListener('input', function() {
            if (parseFloat(inMax.value) < parseFloat(inMin.value)) inMax.value = inMin.value;
            updateUniSliderUI(key);
            scheduleUniversityFilterApply();
        });
    });

    UNI_FILTER_CHECKS.forEach(function(key) {
        const col = UNI_STAT_COLUMNS.find(function(c) { return c.key === key; });
        const vals = [];
        UNIVERSIDADES.forEach(function(u) {
            const v = (u.stats || {})[key];
            if (v !== null && v !== undefined && vals.indexOf(String(v)) === -1) vals.push(String(v));
        });
        if (!vals.length) return;

        const fs = document.createElement('fieldset');
        fs.className = 'uni-filter-group uni-filter-checks';
        const lg = document.createElement('legend');
        lg.textContent = col ? col.label : key;
        fs.appendChild(lg);
        uniFilterChecks[key] = {};
        // '—' option = include rows without data
        ['—'].concat(vals.sort()).forEach(function(v) {
            const label = document.createElement('label');
            label.className = 'uni-filter-check';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.value = v;
            cb.checked = true; // e-commerce pattern: all ON by default, unchecking excludes
            cb.addEventListener('change', scheduleUniversityFilterApply);
            uniFilterChecks[key][v] = cb;
            label.appendChild(cb);
            label.appendChild(document.createTextNode(' ' + v));
            fs.appendChild(label);
        });
        panel.appendChild(fs);
    });

    updateAllUniSliderUI();

    btn.onclick = function() {
        uniFilterPanelOpen = !uniFilterPanelOpen;
        panel.hidden = !uniFilterPanelOpen;
        btn.setAttribute('aria-expanded', String(uniFilterPanelOpen));
        btn.classList.toggle('uni-filter-open', uniFilterPanelOpen);
    };
    clear.onclick = function() { resetUniversityFilters(); };
}

function updateUniSliderUI(key) {
    const r = uniFilterSliders[key];
    if (!r) return;
    const span = r.hi - r.lo;
    const pMin = parseFloat(r.minEl.value);
    const pMax = parseFloat(r.maxEl.value);
    // Fill tracks the THUMBS (position space) — inversion only remaps
    // the printed values and the filter predicate, never the bar geometry.
    r.fillEl.style.left = ((pMin - r.lo) / span * 100) + '%';
    r.fillEl.style.width = ((pMax - pMin) / span * 100) + '%';
    // Ranking axis inverted: best (#1) sits at the RIGHT end, like every other
    // slider keeps its "desirable" end to the right. Positions map: rank = lo+hi-p.
    const lo = r.invert ? (r.lo + r.hi - pMax) : pMin;
    const hi = r.invert ? (r.lo + r.hi - pMin) : pMax;
    r.valEl.textContent = uniFilterFormat(key, lo) + ' – ' + uniFilterFormat(key, hi);
}

function updateAllUniSliderUI() {
    Object.keys(uniFilterSliders).forEach(updateUniSliderUI);
}

function scheduleUniversityFilterApply() {
    if (uniFilterTimer) clearTimeout(uniFilterTimer);
    uniFilterTimer = setTimeout(applyUniversityFilters, 120);
}

function uniFilterActive(key) {
    const r = uniFilterSliders[key];
    if (!r) return false;
    return parseFloat(r.minEl.value) > r.lo || parseFloat(r.maxEl.value) < r.hi;
}

function uniPassesFilters(uni) {
    const stats = uni.stats || {};
    for (const key in uniFilterSliders) {
        if (!uniFilterActive(key)) continue;
        const r = uniFilterSliders[key];
        const raw = stats[key];
        if (raw === null || raw === undefined) return false; // narrowed slider hides '—'
        const v = parseFloat(raw);
        if (isNaN(v)) return false;
        const pMin = parseFloat(r.minEl.value);
        const pMax = parseFloat(r.maxEl.value);
        const fLo = r.invert ? (r.lo + r.hi - pMax) : pMin;
        const fHi = r.invert ? (r.lo + r.hi - pMin) : pMax;
        if (v < fLo || v > fHi) return false;
    }
    // Qualitative: all options start checked; the user UNCHECKS to exclude
    for (const key in uniFilterChecks) {
        const map = uniFilterChecks[key];
        const excluded = [];
        Object.keys(map).forEach(function(opt) {
            if (!map[opt].checked) excluded.push(opt);
        });
        if (!excluded.length) continue;
        const raw = stats[key];
        const v = (raw === null || raw === undefined) ? '—' : String(raw);
        if (excluded.indexOf(v) !== -1) return false;
    }
    return true;
}

function applyUniversityFilters() {
    const tbody = document.querySelector('#uniTable tbody');
    const status = document.getElementById('uniFilterStatus');
    const clear = document.getElementById('uniFilterClear');
    const btn = document.getElementById('uniFilterBtn');
    if (!tbody) return;

    let visible = 0;
    UNIVERSIDADES.forEach(function(uni) {
        const keep = uniPassesFilters(uni);
        const row = tbody.querySelector('tr[data-uni-id="' + uni.id + '"]');
        if (row) row.style.display = keep ? '' : 'none';
        if (keep) visible++;
        // Map mirrors the filter: faded pin when the university is filtered out
        const marker = uniMarkers[uni.id];
        if (marker) {
            const pinEl = marker.getElement();
            if (pinEl) pinEl.classList.toggle('uni-pin-filtered', !keep);
        }
    });

    const active = visible !== UNIVERSIDADES.length;
    if (status) {
        status.hidden = !active;
        if (active) status.textContent = visible + ' de ' + UNIVERSIDADES.length + ' universidades';
    }
    if (clear) clear.hidden = !active;
    if (btn) btn.classList.toggle('uni-filter-active', active);
}

function resetUniversityFilters() {
    Object.keys(uniFilterSliders).forEach(function(key) {
        const r = uniFilterSliders[key];
        r.minEl.value = r.lo;
        r.maxEl.value = r.hi;
    });
    Object.keys(uniFilterChecks).forEach(function(key) {
        Object.keys(uniFilterChecks[key]).forEach(function(v) {
            uniFilterChecks[key][v].checked = true;
        });
    });
    updateAllUniSliderUI();
    applyUniversityFilters();
}

function openUniPlan(id) {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni) return;
    if (uni.redirectTo) {
        window.location.href = uni.redirectTo;
        return;
    }
    if (uni.plan) {
        switchToTree(id);
        return;
    }
    openUniversityModal(id);
}

// ===============================
// TREE RENDERING
// ===============================

function renderUniTree(id) {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === id; });
    if (!uni || !uni.plan) return;

    currentPlanSimplified = !!uni.plan.simplified;

    uniTreeContent = document.getElementById('uniTreeContent');
    uniSvg = document.getElementById('uniSvg');
    uniTreeContainer = document.getElementById('uniTreeContainer');

    if (!uniTreeContent || !uniSvg || !uniTreeContainer) return;

    // Ingreso note (top of tree) — admission + first-year experience
    const noteEl = document.getElementById('uniIngresoNote');
    if (noteEl) {
        noteEl.textContent = uni.plan.ingresoNota || '';
        noteEl.style.display = uni.plan.ingresoNota ? '' : 'none';
    }

    // Clear previous
    uniTreeContent.innerHTML = '';
    uniTreeContent.classList.toggle('is-simplified', currentPlanSimplified);
    uniSelectedNode = null;
    uniStatusMap = {};
    uniNodeElements = {};

    // Remove old SVG defs
    const oldDefs = uniSvg.querySelector('defs');
    if (oldDefs) oldDefs.remove();

    // Build year sections (with intra-year dependency sub-rows)
    uni.plan.anios.forEach(function(yearData) {
        const section = document.createElement('div');
        section.className = 'uni-year-section';

        const header = document.createElement('div');
        header.className = 'uni-year-header';
        // Sections WITHOUT `anio` = blocks/ciclos (e.g. UNR): show etiqueta alone.
        header.textContent = yearData.anio != null
            ? 'Año ' + yearData.anio + (yearData.etiqueta ? ' (' + yearData.etiqueta + ')' : '')
            : (yearData.etiqueta || '');
        section.appendChild(header);

        // Split into sub-rows: a subject that depends on another subject of the
        // SAME year always goes in a lower row (never side by side with its prerequisite).
        const rows = computeYearRows(yearData.materias);
        rows.forEach(function(rowMaterias) {
            const row = document.createElement('div');
            row.className = 'uni-subjects-row';
            rowMaterias.forEach(function(materia) {
                row.appendChild(createUniNode(materia));
            });
            section.appendChild(row);
        });

        uniTreeContent.appendChild(section);
    });

    // Synchronous draw: must render in background tabs (rAF stalls there)
    updateUniSvgDimensions();
    drawUniConnections();
}

function computeYearRows(materias) {
    const rowIndex = {};
    const byCode = {};
    materias.forEach(function(m) { byCode[m.codigo] = m; rowIndex[m.codigo] = 0; });

    // Fixpoint: row(m) = max(row(dep)+1) over same-year prerequisites
    let changed = true;
    let guard = 0;
    while (changed && guard < materias.length + 1) {
        changed = false;
        guard++;
        materias.forEach(function(m) {
            (m.correlativas || []).forEach(function(dep) {
                if (dep in byCode && rowIndex[m.codigo] <= rowIndex[dep]) {
                    rowIndex[m.codigo] = rowIndex[dep] + 1;
                    changed = true;
                }
            });
        });
    }

    const maxRow = materias.reduce(function(max, m) { return Math.max(max, rowIndex[m.codigo]); }, 0);
    const rows = [];
    for (let r = 0; r <= maxRow; r++) rows.push([]);
    materias.forEach(function(m) { rows[rowIndex[m.codigo]].push(m); });
    return rows;
}

function createUniNode(materia) {
    const node = document.createElement('div');
    node.className = 'uni-node';
    node.dataset.codigo = materia.codigo;
    node.dataset.uniId = currentUniId;

    const content = document.createElement('div');
    content.className = 'uni-node-content';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'uni-node-name';
    nameSpan.textContent = materia.nombre;
    content.appendChild(nameSpan);

    const durSpan = document.createElement('span');
    durSpan.className = 'uni-node-duracion';
    if (materia.duracion) {
        durSpan.textContent = materia.duracion.charAt(0).toUpperCase() + materia.duracion.slice(1);
        content.appendChild(durSpan);
    }

    node.appendChild(content);

    // Status button on ALL subjects (PC: click; mobile: 1s hold on the card).
    // The "puede cursar" blue outline only applies to subjects WITH correlativas —
    // initial subjects (no prerequisites) are obviously cursable from the start.
    // Simplified plans (list only): no status button, no hold toggle.
    if (!currentPlanSimplified) {
        const statusBtn = document.createElement('button');
        statusBtn.type = 'button';
        statusBtn.className = 'uni-node-status';
        statusBtn.textContent = '🔘';
        statusBtn.title = 'Marcar como aprobada (solo esta sesión)';
        statusBtn.setAttribute('aria-pressed', 'false');
        statusBtn.setAttribute('aria-label', materia.nombre + ' — marcar como aprobada');
        statusBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleUniStatus(materia.codigo);
        });
        node.appendChild(statusBtn);

        attachUniHoldToggle(node, materia.codigo);
        node.addEventListener('contextmenu', function(e) { e.preventDefault(); });
    }

    // Selection (dependency highlight) only for plans WITH correlativas —
    // simplified plans are a plain list, nothing to select.
    if (!currentPlanSimplified) {
        node.addEventListener('click', function(e) {
            e.stopPropagation();
            if (suppressNextNodeClick) { suppressNextNodeClick = false; return; }
            selectUniNode(materia.codigo);
        });
    }

    uniNodeElements[materia.codigo] = node;
    return node;
}

// ===============================
// SUBJECT STATUS (session-only)
// ===============================

// 🟢 = aprobada. "Can cursar" (blue outline) = not marked && ALL correlativas
// marked. Entry subjects (no correlativas, no button) can never be satisfied,
// mirroring the main page semantics — correlativas list is the union of
// para-cursar + para-rendir-final gates.
function toggleUniStatus(codigo) {
    if (uniStatusMap[codigo]) delete uniStatusMap[codigo];
    else uniStatusMap[codigo] = true;
    recomputeUniStatusClasses();
}

function recomputeUniStatusClasses() {
    const uni = UNIVERSIDADES.find(function(u) { return u.id === currentUniId; });
    if (!uni || !uni.plan) return;

    const byCode = {};
    uni.plan.anios.forEach(function(a) {
        a.materias.forEach(function(m) { byCode[m.codigo] = m; });
    });

    Object.keys(uniNodeElements).forEach(function(codigo) {
        const m = byCode[codigo];
        const el = uniNodeElements[codigo];
        if (!m || !el) return;

        const marked = !!uniStatusMap[codigo];
        const btn = el.querySelector('.uni-node-status');
        if (btn) {
            btn.textContent = marked ? '🟢' : '🔘';
            btn.title = marked ? 'Quitar marca' : 'Marcar como aprobada (solo esta sesión)';
            btn.setAttribute('aria-pressed', marked ? 'true' : 'false');
        }

        const hasCorrel = (m.correlativas || []).length > 0;
        const canCursar = hasCorrel && !marked && (m.correlativas || []).every(function(c) {
            return !!uniStatusMap[c];
        });

        el.classList.toggle('is-marked', marked);
        el.classList.toggle('can-cursar', canCursar);
    });
}

// Mobile: hold card 1s to toggle status (hold again to reset)
function attachUniHoldToggle(node, codigo) {
    let holdTimer = null;
    let holdStart = null;

    node.addEventListener('pointerdown', function(e) {
        if (e.pointerType !== 'touch') return;
        holdStart = { x: e.clientX, y: e.clientY };
        holdTimer = setTimeout(function() {
            holdTimer = null;
            suppressNextNodeClick = true;
            setTimeout(function() { suppressNextNodeClick = false; }, 350);
            if (navigator.vibrate) navigator.vibrate(15);
            toggleUniStatus(codigo);
        }, 1000);
    });

    node.addEventListener('pointermove', function(e) {
        if (!holdTimer || !holdStart) return;
        if (Math.abs(e.clientX - holdStart.x) > 12 || Math.abs(e.clientY - holdStart.y) > 12) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    });

    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function(evt) {
        node.addEventListener(evt, function() {
            if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
        });
    });
}

// ===============================
// SVG CONNECTIONS
// ===============================

// Arrow colors: gray base (hidden), silver = prerequisites (retrógradas),
// cyan = dependents (anterógradas) — sequence reading aid
const UNI_ARROW_GRAY = '#666';
const UNI_ARROW_SILVER = '#c0c0c0';
const UNI_ARROW_CYAN = '#22d3ee';

function uniArrowMarkerId(hex) {
    return 'uni-arrow-' + hex.replace('#', '');
}

function ensureUniArrowMarker(svg, hex) {
    const id = uniArrowMarkerId(hex);
    if (svg.querySelector('#' + id)) return id;
    let defs = svg.querySelector('defs');
    if (!defs) {
        defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        svg.insertBefore(defs, svg.firstChild);
    }
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', id);
    marker.setAttribute('markerWidth', '6');
    marker.setAttribute('markerHeight', '4');
    marker.setAttribute('refX', '3');
    marker.setAttribute('refY', '2');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');
    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', '0 0, 6 2, 0 4');
    arrow.setAttribute('fill', hex);
    marker.appendChild(arrow);
    defs.appendChild(marker);
    return id;
}

function updateUniSvgDimensions() {
    if (!uniTreeContent || !uniSvg) return;

    // Hide SVG to measure content without it contributing to scroll
    const prevDisplay = uniSvg.style.display;
    uniSvg.style.display = 'none';
    void uniTreeContent.offsetHeight;

    const w = uniTreeContent.scrollWidth;
    const h = uniTreeContent.scrollHeight;

    uniSvg.style.display = prevDisplay || '';

    uniSvg.setAttribute('width', w);
    uniSvg.setAttribute('height', h);
    uniSvg.style.width = w + 'px';
    uniSvg.style.height = h + 'px';
    uniSvg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
}

function drawUniConnections() {
    if (!uniSvg || !uniTreeContent) return;

    // Clear previous paths (preserve defs)
    const oldPaths = uniSvg.querySelectorAll('path.uni-connection-line');
    oldPaths.forEach(function(p) { p.remove(); });

    const svgRect = uniSvg.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    // Build connection map from all nodes in current tree
    const nodes = uniTreeContent.querySelectorAll('.uni-node');
    const nodeMap = {};
    nodes.forEach(function(node) {
        nodeMap[node.dataset.codigo] = node;
    });

    // Get current university plan
    const uni = UNIVERSIDADES.find(function(u) { return u.id === currentUniId; });
    if (!uni || !uni.plan) return;

    // Collect all connections across all years
    const connections = [];
    uni.plan.anios.forEach(function(yearData) {
        yearData.materias.forEach(function(materia) {
            if (materia.correlativas && materia.correlativas.length > 0) {
                materia.correlativas.forEach(function(prereqCode) {
                    connections.push({ from: prereqCode, to: materia.codigo });
                });
            }
        });
    });

    // Draw each connection (arbol palette: neutral #666; hidden by default via CSS,
    // highlighted on selection like arbol Modo Árbol)
    connections.forEach(function(conn) {
        const fromNode = nodeMap[conn.from];
        const toNode = nodeMap[conn.to];

        if (!fromNode || !toNode) return;
        if (fromNode.offsetParent === null || toNode.offsetParent === null) return;

        const fromRect = fromNode.getBoundingClientRect();
        const toRect = toNode.getBoundingClientRect();

        drawUniBezier(uniSvg, svgRect, fromRect, toRect, conn.from, conn.to);
    });

    // Re-apply selection visuals
    applyUniSelectionVisuals();
}

function drawUniBezier(svg, svgRect, startRect, endRect, fromCode, toCode) {
    // Center points relative to SVG
    const startCenterX = startRect.left + startRect.width / 2 - svgRect.left;
    const startCenterY = startRect.top + startRect.height / 2 - svgRect.top;
    const endCenterX = endRect.left + endRect.width / 2 - svgRect.left;
    const endCenterY = endRect.top + endRect.height / 2 - svgRect.top;

    let startX, startY, endX, endY, path;

    const verticalDist = Math.abs(startCenterY - endCenterY);
    const horizontalDist = Math.abs(startCenterX - endCenterX);

    if (verticalDist < 30) {
        // Horizontal connection (same row)
        startX = startRect.right - svgRect.left;
        startY = startCenterY;
        endX = endRect.left - svgRect.left;
        endY = endCenterY;

        if (startCenterX > endCenterX) {
            startX = startRect.left - svgRect.left;
            endX = endRect.right - svgRect.left;
        }

        const hOffset = Math.max(horizontalDist * 0.4, 20);
        path = 'M ' + startX + ' ' + startY +
               ' C ' + (startX + (startCenterX < endCenterX ? hOffset : -hOffset)) + ' ' + startY +
               ', ' + (endX + (startCenterX < endCenterX ? -hOffset : hOffset)) + ' ' + endY +
               ', ' + endX + ' ' + endY;
    } else {
        // Vertical connection (different rows)
        startX = startCenterX;
        startY = startRect.bottom - svgRect.top;
        endX = endCenterX;
        endY = endRect.top - svgRect.top;

        const vOffset = Math.max(verticalDist * 0.4, 20);
        path = 'M ' + startX + ' ' + startY +
               ' C ' + startX + ' ' + (startY + vOffset) +
               ', ' + endX + ' ' + (endY - vOffset) +
               ', ' + endX + ' ' + endY;
    }

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('stroke', '#666');
    pathEl.setAttribute('stroke-width', '2');
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke-linecap', 'round');
    pathEl.setAttribute('class', 'uni-connection-line');
    pathEl.setAttribute('data-from', fromCode);
    pathEl.setAttribute('data-to', toCode);

    // Arrow marker (arbol neutral gray)
    ensureUniArrowMarker(svg, UNI_ARROW_GRAY);
    pathEl.setAttribute('marker-end', 'url(#' + uniArrowMarkerId(UNI_ARROW_GRAY) + ')');

    svg.appendChild(pathEl);
}

// ===============================
// NODE SELECTION
// ===============================

function selectUniNode(codigo) {
    if (uniSelectedNode === codigo) {
        deselectUniNode();
        return;
    }
    uniSelectedNode = codigo;

    updateUniSvgDimensions();
    drawUniConnections();
}

function deselectUniNode() {
    uniSelectedNode = null;

    document.querySelectorAll('.uni-node').forEach(function(node) {
        node.classList.remove('highlighted', 'dimmed', 'selected');
    });

    document.querySelectorAll('svg path.uni-connection-line').forEach(function(path) {
        path.classList.remove('highlighted', 'dimmed', 'is-prereq');
    });

    if (document.getElementById('uniTreeView').style.display !== 'none') {
        updateUniSvgDimensions();
        drawUniConnections();
    }
}

function applyUniSelectionVisuals() {
    if (!uniSelectedNode) return;

    const uni = UNIVERSIDADES.find(function(u) { return u.id === currentUniId; });
    if (!uni || !uni.plan) return;

    const highlightedNodes = { [uniSelectedNode]: true };
    const highlightedLines = {};

    // Direct prerequisites + dependents
    uni.plan.anios.forEach(function(yearData) {
        yearData.materias.forEach(function(m) {
            if (m.codigo === uniSelectedNode && m.correlativas) {
                m.correlativas.forEach(function(prereq) {
                    highlightedNodes[prereq] = true;
                    highlightedLines[prereq + '->' + uniSelectedNode] = true;
                });
            }
            if (m.correlativas && m.correlativas.includes(uniSelectedNode)) {
                highlightedNodes[m.codigo] = true;
                highlightedLines[uniSelectedNode + '->' + m.codigo] = true;
            }
        });
    });

    document.querySelectorAll('.uni-node').forEach(function(node) {
        const nodeCode = node.dataset.codigo;
        if (highlightedNodes[nodeCode]) {
            node.classList.add('highlighted');
            node.classList.remove('dimmed');
        } else {
            node.classList.add('dimmed');
            node.classList.remove('highlighted');
        }
        node.classList.toggle('selected', nodeCode === uniSelectedNode);
    });

    const svgEl = document.getElementById('uniSvg');
    document.querySelectorAll('svg path.uni-connection-line').forEach(function(path) {
        const from = path.getAttribute('data-from');
        const to = path.getAttribute('data-to');
        if (highlightedLines[from + '->' + to]) {
            // Retrógradas (prerequisites, line points INTO selected) = silver;
            // anterógradas (dependents, line leaves selected) = cyan
            const isPrereqLine = (to === uniSelectedNode);
            path.classList.add('highlighted');
            path.classList.toggle('is-prereq', isPrereqLine);
            path.classList.remove('dimmed');
            if (svgEl) {
                const hex = isPrereqLine ? UNI_ARROW_SILVER : UNI_ARROW_CYAN;
                ensureUniArrowMarker(svgEl, hex);
                path.setAttribute('marker-end', 'url(#' + uniArrowMarkerId(hex) + ')');
            }
        } else {
            path.classList.add('dimmed');
            path.classList.remove('highlighted', 'is-prereq');
            path.setAttribute('marker-end', 'url(#' + uniArrowMarkerId(UNI_ARROW_GRAY) + ')');
        }
    });
}
