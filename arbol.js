// ===============================
// MODO ÁRBOL - TREE VIEW LOGIC
// Vanilla JS, reads materias from
// materias.js and estados from
// localStorage.
// ===============================

let currentZoom = 1;
const ZOOM_STEP = 0.2;
const ZOOM_MIN = 0.3;
const ZOOM_MAX = 3;

let selectedNode = null;

const LINE_COLORS = {
    met: '#22c55e',
    notMetCursada: '#666',
    notMetFinal: '#999',
    optativa: '#a855f7',
    finalAprobada: '#ffffff'
};

const STATUS_CLASS_MAP = {
    aprobada: 'status-aprobada',
    regularizada: 'status-regularizada',
    'puede-cursar': 'status-puede-cursar',
    'no-puede-cursar': 'status-no-puede-cursar',
    'optativa-puede-cursar': 'status-optativa-puede-cursar',
    'optativa-no-puede-cursar': 'status-optativa-no-puede-cursar'
};

// ===============================
// INIT
// ===============================

document.addEventListener('DOMContentLoaded', initTree);

// Re-draw connections on resize
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        if (document.querySelector('.tree-wrapper')) {
            updateSvgDimensions();
            drawConnections();
        }
    }, 150);
});

// ===============================
// MAIN
// ===============================

function initTree() {
    selectedNode = null;

    // Read states from localStorage
    var saved;
    try { saved = localStorage.getItem('estados'); } catch(e) { saved = null; }
    try { window.estados = saved ? JSON.parse(saved) : {}; } catch(e) { window.estados = {}; }

    // Group subjects by year and type
    var years = {};
    for (var y = 1; y <= 6; y++) {
        years[y] = { obligatorias: [], optativas: [] };
    }

    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        var year = m.anio || 1;
        if (!years[year]) years[year] = { obligatorias: [], optativas: [] };
        if (m.categoria === 'optativa') {
            years[year].optativas.push(m);
        } else {
            years[year].obligatorias.push(m);
        }
    }

    // Sort subjects by category order within each group
    var categoryOrder = { 'anual': 1, 'cuatrimestral': 2, 'bimestral': 3, 'optativa': 4 };
    for (var sy = 1; sy <= 6; sy++) {
        if (years[sy]) {
            years[sy].obligatorias.sort(function(a, b) {
                return (categoryOrder[a.categoria] || 99) - (categoryOrder[b.categoria] || 99);
            });
            years[sy].optativas.sort(function(a, b) {
                return (categoryOrder[a.categoria] || 99) - (categoryOrder[b.categoria] || 99);
            });
        }
    }

    // Get wrapper
    var wrapper = document.querySelector('.tree-wrapper');
    if (!wrapper) return;

    // Remove previous SVG before clearing
    var oldSvg = document.getElementById('treeSvg');
    if (oldSvg) oldSvg.remove();

    // Clear wrapper
    wrapper.innerHTML = '';

    // Create zoom container (holds year sections, NOT the SVG)
    var zoomContainer = document.createElement('div');
    zoomContainer.className = 'tree-zoom-container';
    wrapper.appendChild(zoomContainer);

    // Create year sections
    for (var year = 1; year <= 6; year++) {
        var section = document.createElement('div');
        section.className = 'year-section';

        var header = document.createElement('div');
        header.className = 'year-header';
        header.textContent = 'Año ' + year;
        section.appendChild(header);

        // Obligatorias
        if (years[year].obligatorias.length > 0) {
            var obrRow = document.createElement('div');
            obrRow.className = 'subjects-row obligatorias';
            for (var j = 0; j < years[year].obligatorias.length; j++) {
                obrRow.appendChild(createSubjectNode(years[year].obligatorias[j]));
            }
            section.appendChild(obrRow);
        }

        // Optativas
        if (years[year].optativas.length > 0) {
            var optLabel = document.createElement('div');
            optLabel.className = 'optativa-label';
            optLabel.textContent = 'Optativa';
            section.appendChild(optLabel);

            var optRow = document.createElement('div');
            optRow.className = 'subjects-row optativas';
            for (var k = 0; k < years[year].optativas.length; k++) {
                optRow.appendChild(createSubjectNode(years[year].optativas[k]));
            }
            // If optativas toggle is unchecked, hide this row and label by default
            if (!document.getElementById('toggleOptativas').checked) {
                optRow.classList.add('hidden');
                optLabel.style.display = 'none';
            }
            section.appendChild(optRow);
        }

        zoomContainer.appendChild(section);
    }

    // Create SVG overlay (sibling to zoomContainer, inside wrapper)
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'tree-svg');
    svg.setAttribute('id', 'treeSvg');
    wrapper.appendChild(svg);

    // Apply current zoom level
    applyZoomTransform();

    // Draw connections after DOM renders
    requestAnimationFrame(function() {
        updateSvgDimensions();
        drawConnections();
    });

    // Apply cursando effects after render
    requestAnimationFrame(function() {
        applyCursandoEffects();
    });

}

// ===============================
// NODE CREATION
// ===============================

function createSubjectNode(m) {
    var node = document.createElement('div');
    var status = getSubjectStatus(m.codigo);
    node.className = 'subject-node ' + (STATUS_CLASS_MAP[status] || 'status-no-puede-cursar');
    node.id = 'tree-node-' + m.codigo;
    node.dataset.status = status;
    node.dataset.codigo = m.codigo;

    // Left border
    var border = document.createElement('div');
    border.className = 'node-border ' + (STATUS_CLASS_MAP[status] || 'status-no-puede-cursar');
    node.appendChild(border);

    // Content area
    var content = document.createElement('div');
    content.className = 'node-content';

    var nameSpan = document.createElement('span');
    nameSpan.className = 'node-name';

    // Add 🟡 emoji if this subject cannot be taken yet and is missing exactly 1 prerequisite
    var status = node.dataset.status;
    var isBlocked = (status === 'no-puede-cursar' || status === 'optativa-no-puede-cursar');
    if (isBlocked) {
        var missingCount = countMissingPrerequisites(m.codigo);
        if (missingCount === 1) {
            nameSpan.textContent = '\uD83D\uDFE1 ' + m.nombre;
        } else {
            nameSpan.textContent = m.nombre;
        }
    } else {
        nameSpan.textContent = m.nombre;
    }
    content.appendChild(nameSpan);

    var metaDiv = document.createElement('div');
    metaDiv.className = 'node-meta';

    if (m.categoria !== 'optativa') {
        var depCount = countDependents(m.codigo);
        var depSpan = document.createElement('span');
        depSpan.className = 'node-dependents';
        depSpan.textContent = '(' + depCount + ') ';
        metaDiv.appendChild(depSpan);
    }

    var codeSpan = document.createElement('span');
    codeSpan.className = 'node-code';
    codeSpan.textContent = m.codigo;
    metaDiv.appendChild(codeSpan);

    var catText = m.categoria || '';
    if (catText !== 'optativa') {
        var separator = document.createElement('span');
        separator.className = 'node-separator';
        separator.textContent = ' | ';
        metaDiv.appendChild(separator);

        var catSpan = document.createElement('span');
        catSpan.className = 'node-category';
        catSpan.textContent = catText.charAt(0).toUpperCase() + catText.slice(1);
        metaDiv.appendChild(catSpan);
    }

    content.appendChild(metaDiv);

    // Action buttons - conditionally shown based on current status
    var actions = document.createElement('div');
    actions.className = 'node-actions';

    if (status !== 'aprobada') {
        var btnAprobar = document.createElement('button');
        btnAprobar.className = 'node-btn node-btn-aprobar';
        btnAprobar.textContent = '\u2705';
        btnAprobar.title = 'Aprobar';
        btnAprobar.onclick = function(e) { e.stopPropagation(); setSubjectState(m.codigo, 'aprobada'); };
        btnAprobar.setAttribute('aria-label', 'Aprobar ' + m.nombre);
        actions.appendChild(btnAprobar);
    }

    if (status !== 'regularizada') {
        var btnRegularizar = document.createElement('button');
        btnRegularizar.className = 'node-btn node-btn-regularizar';
        btnRegularizar.textContent = '\uD83D\uDFE8';
        btnRegularizar.title = 'Regularizar';
        btnRegularizar.onclick = function(e) { e.stopPropagation(); setSubjectState(m.codigo, 'regularizada'); };
        btnRegularizar.setAttribute('aria-label', 'Regularizar ' + m.nombre);
        actions.appendChild(btnRegularizar);
    }

    // 🔄 Resetear: only visible when subject has an explicit state (aprobada or regularizada)
    if (status === 'aprobada' || status === 'regularizada') {
        var btnReset = document.createElement('button');
        btnReset.className = 'node-btn node-btn-reset';
        btnReset.textContent = '\uD83D\uDD04';
        btnReset.title = 'Resetear';
        btnReset.onclick = function(e) { e.stopPropagation(); removeSubjectState(m.codigo); };
        btnReset.setAttribute('aria-label', 'Resetear ' + m.nombre);
        actions.appendChild(btnReset);
    }

    // Cursando toggle - only for puede-cursar / optativa-puede-cursar nodes
    var isCursandoStatus = (status === 'puede-cursar' || status === 'optativa-puede-cursar');
    if (isCursandoStatus) {
        var cursandoOn = isCursando(m.codigo);

        var toggleDiv = document.createElement('div');
        toggleDiv.className = 'node-cursando-toggle';

        var cursandoLabel = document.createElement('span');
        cursandoLabel.className = 'node-cursando-label';
        cursandoLabel.textContent = 'Cursando';
        toggleDiv.appendChild(cursandoLabel);

        var cursandoSwitch = document.createElement('label');
        cursandoSwitch.className = 'node-cursando-switch';

        var cursandoInput = document.createElement('input');
        cursandoInput.type = 'checkbox';
        cursandoInput.checked = cursandoOn;
        cursandoInput.setAttribute('aria-label', 'Cursando ' + m.nombre);
        cursandoInput.onchange = function(e) { e.stopPropagation(); toggleCursando(m.codigo); };
        cursandoSwitch.appendChild(cursandoInput);

        var cursandoSlider = document.createElement('span');
        cursandoSlider.className = 'node-cursando-slider';
        cursandoSwitch.appendChild(cursandoSlider);

        toggleDiv.appendChild(cursandoSwitch);
        actions.appendChild(toggleDiv);
    }

    // Apply cursando-active class when cursando is ON
    if (isCursandoStatus) {
        if (isCursando(m.codigo)) {
            node.classList.add('cursando-active');
        }
    }

    content.appendChild(actions);

    node.appendChild(content);

    // Click handler - select/highlight correlatives
    node.addEventListener('click', function () {
        selectNode(m.codigo);
    });

    // Note: mouseenter redraw removed — causes flash on click (clear+recreate cycle)

    // Tooltip
    node.title = m.nombre + ' (' + m.codigo + ')\n' + getStatusLabel(status);

    return node;
}

function getStatusLabel(status) {
    var labels = {
        'aprobada': '✅ Aprobada',
        'regularizada': '🟨 Regularizada',
        'puede-cursar': 'Puede cursar',
        'no-puede-cursar': 'No puede cursar',
        'optativa-puede-cursar': 'Optativa (puede cursar)',
        'optativa-no-puede-cursar': 'Optativa (no puede cursar)'
    };
    return labels[status] || status;
}

/**
 * Count how many subjects have `codigo` as a prerequisite in their paraCursar array.
 * Excludes OPT-HORAS from counting.
 */
function countDependents(codigo) {
    var count = 0;
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        if (m.codigo === 'OPT-HORAS') continue;
        if (!m.paraCursar) continue;
        for (var j = 0; j < m.paraCursar.length; j++) {
            if (m.paraCursar[j].materia === codigo) {
                count++;
                break; // Count each subject only once
            }
        }
    }
    return count;
}

// ===============================
// STATUS
// ===============================

function getSubjectStatus(codigo) {
    // Find the subject
    var m = null;
    for (var i = 0; i < materias.length; i++) {
        if (materias[i].codigo === codigo) {
            m = materias[i];
            break;
        }
    }
    if (!m) return 'no-puede-cursar';

    // Check explicit state
    if (estados[codigo] === 'aprobada') return 'aprobada';
    if (estados[codigo] === 'regularizada') return 'regularizada';

    // Check if prerequisites are met
    var puedeCursar = cumpleRequisitos(m.paraCursar);

    // Optativas distinguish based on prerequisites
    if (m.categoria === 'optativa') {
        return puedeCursar ? 'optativa-puede-cursar' : 'optativa-no-puede-cursar';
    }

    return puedeCursar ? 'puede-cursar' : 'no-puede-cursar';
}

function cumpleRequisitos(lista) {
    if (!lista || lista.length === 0) return true;

    for (var i = 0; i < lista.length; i++) {
        var req = lista[i];
        if (!verificarRequisito(req)) return false;
    }
    return true;
}

function verificarRequisito(req) {
    // Special prerequisite: optativa hours
    if (req.materia === 'OPT-HORAS') {
        var horas = calcularHorasOptativas();
        if (req.condicion === '>=270') return horas >= 270;
        return false;
    }

    var estadoMateria = estados[req.materia];
    if (req.condicion === 'aprobada') return estadoMateria === 'aprobada';
    if (req.condicion === 'regularizada') return !!estadoMateria;
    return false;
}

function calcularHorasOptativas() {
    var horas = 0;
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        if (m.categoria === 'optativa' && m.horas && estados[m.codigo] === 'aprobada') {
            horas += m.horas;
        }
    }
    return horas;
}

function countMissingPrerequisites(codigo, visited) {
    // Prevent infinite loops (forward references like PD001→I0001)
    if (visited && visited.has(codigo)) return 0;
    if (!visited) visited = new Set();
    visited.add(codigo);

    var m = null;
    for (var i = 0; i < materias.length; i++) {
        if (materias[i].codigo === codigo) {
            m = materias[i];
            break;
        }
    }
    if (!m) return 0;

    // If already approved or regularized, no missing prerequisites
    var estado = estados[codigo];
    if (estado === 'aprobada' || estado === 'regularizada') return 0;

    // Count missing prerequisites recursively
    var missingCount = 0;

    if (m.paraCursar) {
        for (var j = 0; j < m.paraCursar.length; j++) {
            var req = m.paraCursar[j];
            if (req.materia === 'OPT-HORAS') {
                var horas = calcularHorasOptativas();
                if (horas < 270) missingCount += 1; // Count as 1 missing requirement
            } else {
                var reqEstado = estados[req.materia];
                var isMet = (req.condicion === 'aprobada' && reqEstado === 'aprobada') ||
                              (req.condicion === 'regularizada' && (reqEstado === 'aprobada' || reqEstado === 'regularizada'));

                if (!isMet) {
                    // This prerequisite is not met - count its own missing prerequisites recursively
                    missingCount += countMissingPrerequisites(req.materia, new Set(visited));
                }
            }
        }
    }

    // If this subject itself has no missing prerequisites but is not taken,
    // it counts as 1 missing item (leaf unmet prerequisite)
    if (missingCount === 0 && !estado) {
        return 1;
    }

    return missingCount;
}

// ===============================
// STATE HELPERS
// ===============================

function setSubjectState(codigo, estado) {
    var estadosData;
    try { estadosData = JSON.parse(localStorage.getItem('estados') || '{}'); } catch(e) { estadosData = {}; }
    estadosData[codigo] = estado;
    try { localStorage.setItem('estados', JSON.stringify(estadosData)); } catch(e) {}
    window.estados = estadosData;
    updateTree();
}

function removeSubjectState(codigo) {
    var estadosData;
    try { estadosData = JSON.parse(localStorage.getItem('estados') || '{}'); } catch(e) { estadosData = {}; }
    delete estadosData[codigo];
    try { localStorage.setItem('estados', JSON.stringify(estadosData)); } catch(e) {}
    window.estados = estadosData;

    // Also clear cursando state for this subject
    var cursandoData;
    try { cursandoData = JSON.parse(localStorage.getItem('cursando') || '{}'); } catch(e) { cursandoData = {}; }
    if (cursandoData[codigo]) {
        delete cursandoData[codigo];
        try { localStorage.setItem('cursando', JSON.stringify(cursandoData)); } catch(e) {}
    }

    updateTree();
}

// ===============================
// CURSANDO STATE
// ===============================

function isCursando(codigo) {
    var data;
    try { data = JSON.parse(localStorage.getItem('cursando') || '{}'); } catch(e) { data = {}; }
    return !!data[codigo];
}

function toggleCursando(codigo) {
    var data;
    try { data = JSON.parse(localStorage.getItem('cursando') || '{}'); } catch(e) { data = {}; }
    if (data[codigo]) {
        delete data[codigo];
    } else {
        data[codigo] = true;
    }
    try { localStorage.setItem('cursando', JSON.stringify(data)); } catch(e) {}
    updateTree();
}

function cumpleRequisitosConCursando(lista) {
    if (!lista || lista.length === 0) return true;
    for (var i = 0; i < lista.length; i++) {
        var req = lista[i];
        if (!verificarRequisitoConCursando(req)) return false;
    }
    return true;
}

function verificarRequisitoConCursando(req) {
    if (req.materia === 'OPT-HORAS') {
        var horas = calcularHorasOptativas();
        if (req.condicion === '>=270') return horas >= 270;
        return false;
    }
    var estadoMateria = estados[req.materia];
    if (req.condicion === 'aprobada') return estadoMateria === 'aprobada';
    if (req.condicion === 'regularizada') return !!estadoMateria || isCursando(req.materia);
    return false;
}

function wouldBeAvailableWithCursando(m) {
    if (estados[m.codigo] === 'aprobada' || estados[m.codigo] === 'regularizada') return false;
    if (m.categoria === 'optativa') {
        return cumpleRequisitosConCursando(m.paraCursar) ? 'optativa-puede-cursar' : null;
    }
    return cumpleRequisitosConCursando(m.paraCursar) ? 'puede-cursar' : null;
}

function applyCursandoEffects() {
    // Find all nodes that are currently blocked but would be available with cursando
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        var currentStatus = getSubjectStatus(m.codigo);
        var wouldBe = wouldBeAvailableWithCursando(m);
        
        if (wouldBe && (currentStatus === 'no-puede-cursar' || currentStatus === 'optativa-no-puede-cursar')) {
            var nodeEl = document.getElementById('tree-node-' + m.codigo);
            if (nodeEl) {
                nodeEl.classList.add('cursando-pending');
            }
        }
    }
}

function updateTree() {
    var prevSelected = selectedNode;
    initTree();
    if (prevSelected) {
        var restoreFn = function() { selectNode(prevSelected); };
        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(restoreFn);
        } else {
            setTimeout(restoreFn, 150);
        }
    }
}

// ===============================
// LINE COLORS
// ===============================

function getConnectionVisualStyle(prereqCode, paraCursarReq, paraAprobarReq) {
    // Check if the prerequisite subject is optativa
    for (var i = 0; i < materias.length; i++) {
        if (materias[i].codigo === prereqCode && materias[i].categoria === 'optativa') {
            return { color: LINE_COLORS.optativa, dashed: false };
        }
    }

    var estado = estados[prereqCode];

    // Check if paraCursar requirement is met
    var hasCursar = !!paraCursarReq;
    var cursarMet = false;
    if (hasCursar) {
        if (paraCursarReq.condicion === 'aprobada') {
            cursarMet = (estado === 'aprobada');
        } else {
            cursarMet = !!estado;
        }
    }

    // Check if paraAprobar requirement is met
    var hasAprobar = !!paraAprobarReq;
    var aprobarMet = false;
    if (hasAprobar) {
        if (paraAprobarReq.condicion === 'aprobada') {
            aprobarMet = (estado === 'aprobada');
        } else {
            aprobarMet = !!estado;
        }
    }

    // Case 1 & 2: Can't take course (paraCursar exists and NOT met)
    if (hasCursar && !cursarMet) {
        if (paraCursarReq.condicion === 'aprobada') {
            return { color: LINE_COLORS.finalAprobada, dashed: false }; // Case 2: falta final (white)
        }
        return { color: LINE_COLORS.notMetCursada, dashed: false }; // Case 1: falta cursada (gray)
    }

    // Case 3: Can take course but can't take final (paraAprobar NOT met)
    if (hasAprobar && !aprobarMet) {
        return { color: LINE_COLORS.met, dashed: true }; // Case 3: green dashed
    }

    // Case 4: Everything met (green solid)
    return { color: LINE_COLORS.met, dashed: false };
}

// ===============================
// SVG DIMENSIONS
// ===============================

function getTreeSvg() {
    return document.getElementById('treeSvg') || document.querySelector('.tree-svg');
}

function updateSvgDimensions() {
    var wrapper = document.querySelector('.tree-wrapper');
    var svg = getTreeSvg();
    if (!wrapper || !svg) return;

    // Temporarily hide SVG to avoid it contributing to scrollWidth/scrollHeight
    var prevDisplay = svg.style.display;
    svg.style.display = 'none';
    void wrapper.offsetHeight; // force reflow

    var w = wrapper.scrollWidth;
    var h = wrapper.scrollHeight;

    // Add extra padding for mobile card expansion (buttons appearing)
    var extraPadding = 60;
    h += extraPadding;

    svg.style.display = prevDisplay || '';

    svg.setAttribute('width', w);
    svg.setAttribute('height', h);
    svg.style.width = w + 'px';
    svg.style.height = h + 'px';
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
}

// ===============================
// DRAW CONNECTIONS
// ===============================

function drawConnections() {
    var svg = getTreeSvg();
    if (!svg) return;

    // Clear previous paths (preserve <defs> and other elements)
    var oldPaths = svg.querySelectorAll('path.connection-line');
    for (var i = oldPaths.length - 1; i >= 0; i--) {
        oldPaths[i].remove();
    }

    // Use the SVG element itself as reference (not the wrapper)
    var svgRect = svg.getBoundingClientRect();
    if (svgRect.width === 0 || svgRect.height === 0) return;

    // Collect all unique connections, storing BOTH paraCursar and paraAprobar requirements per pair
    var connections = {};

    // Pass 1: collect paraCursar requirements
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        if (m.paraCursar) {
            for (var j = 0; j < m.paraCursar.length; j++) {
                var req = m.paraCursar[j];
                if (req.materia === 'OPT-HORAS') continue;
                var key = req.materia + '->' + m.codigo;
                if (!connections[key]) {
                    connections[key] = { from: req.materia, to: m.codigo, paraCursarReq: req, paraAprobarReq: null };
                }
                connections[key].paraCursarReq = req;
            }
        }
    }

    // Pass 2: collect paraAprobar requirements (merge into same connections)
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        if (m.paraAprobar) {
            for (var k = 0; k < m.paraAprobar.length; k++) {
                var req = m.paraAprobar[k];
                if (req.materia === 'OPT-HORAS') continue;
                var key = req.materia + '->' + m.codigo;
                if (!connections[key]) {
                    connections[key] = { from: req.materia, to: m.codigo, paraCursarReq: null, paraAprobarReq: req };
                } else {
                    connections[key].paraAprobarReq = req;
                }
            }
        }
    }

    // Draw each connection with the correct visual style
    for (var key in connections) {
        var conn = connections[key];
        var prereqNode = document.getElementById('tree-node-' + conn.from);
        var depNode = document.getElementById('tree-node-' + conn.to);

        if (!prereqNode || !depNode) continue;
        if (prereqNode.offsetParent === null || depNode.offsetParent === null) continue;

        var prereqRect = prereqNode.getBoundingClientRect();
        var depRect = depNode.getBoundingClientRect();

        var style = getConnectionVisualStyle(conn.from, conn.paraCursarReq, conn.paraAprobarReq);

        drawBezier(svg, svgRect, prereqRect, depRect, style.color, conn.from, conn.to, style.dashed);
    }

    // Re-apply selection visuals (without toggle logic)
    applySelectionVisuals();
}

function drawBezier(svg, svgRect, startRect, endRect, color, fromCode, toCode, isDashed) {
    // Calculate center points relative to the SVG element.
    // Both node rects and svgRect are viewport-relative, so their difference
    // gives stable SVG coordinates regardless of scroll position.
    var startCenterX = startRect.left + startRect.width / 2 - svgRect.left;
    var startCenterY = startRect.top + startRect.height / 2 - svgRect.top;
    var endCenterX = endRect.left + endRect.width / 2 - svgRect.left;
    var endCenterY = endRect.top + endRect.height / 2 - svgRect.top;

    var startX, startY, endX, endY;
    var path;

    var verticalDist = Math.abs(startCenterY - endCenterY);
    var horizontalDist = Math.abs(startCenterX - endCenterX);

    if (verticalDist < 30) {
        // HORIZONTAL CONNECTION (same row)
        startX = startRect.right - svgRect.left;
        startY = startCenterY;
        endX = endRect.left - svgRect.left;
        endY = endCenterY;

        if (startCenterX > endCenterX) {
            startX = startRect.left - svgRect.left;
            endX = endRect.right - svgRect.left;
        }

        var hOffset = Math.max(horizontalDist * 0.4, 20);
        path = 'M ' + startX + ' ' + startY +
               ' C ' + (startX + (startCenterX < endCenterX ? hOffset : -hOffset)) + ' ' + startY +
               ', ' + (endX + (startCenterX < endCenterX ? -hOffset : hOffset)) + ' ' + endY +
               ', ' + endX + ' ' + endY;
    } else {
        // VERTICAL CONNECTION (different rows)
        startX = startCenterX;
        startY = startRect.bottom - svgRect.top;
        endX = endCenterX;
        endY = endRect.top - svgRect.top;

        var vOffset = Math.max(verticalDist * 0.4, 20);
        path = 'M ' + startX + ' ' + startY +
               ' C ' + startX + ' ' + (startY + vOffset) +
               ', ' + endX + ' ' + (endY - vOffset) +
               ', ' + endX + ' ' + endY;
    }

    // Create path element
    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', path);
    pathEl.setAttribute('stroke', color);
    pathEl.setAttribute('stroke-width', '2');
    if (isDashed) {
        pathEl.setAttribute('stroke-dasharray', '6 3');
    }
    pathEl.setAttribute('fill', 'none');
    pathEl.setAttribute('stroke-linecap', 'round');
    pathEl.setAttribute('class', 'connection-line');
    
    if (fromCode) pathEl.setAttribute('data-from', fromCode);
    if (toCode) pathEl.setAttribute('data-to', toCode);

    // Add arrow marker
    var markerId = 'arrow-' + color.replace('#', '');
    var existingMarker = svg.querySelector('#' + markerId);

    if (!existingMarker) {
        var defs = svg.querySelector('defs');
        if (!defs) {
            defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
            svg.insertBefore(defs, svg.firstChild);
        }

        var marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', markerId);
        marker.setAttribute('markerWidth', '6');
        marker.setAttribute('markerHeight', '4');
        marker.setAttribute('refX', '3');
        marker.setAttribute('refY', '2');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        var arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', '0 0, 6 2, 0 4');
        arrow.setAttribute('fill', color);
        marker.appendChild(arrow);
        defs.appendChild(marker);
    }

    pathEl.setAttribute('marker-end', 'url(#' + markerId + ')');

    svg.appendChild(pathEl);
}

// ===============================
// ZOOM CONTROLS
// ===============================

function zoomIn() {
    currentZoom = Math.min(currentZoom + ZOOM_STEP, ZOOM_MAX);
    applyZoomTransform();
    updateZoomDisplay();
    requestAnimationFrame(function () {
        updateSvgDimensions();
        drawConnections();
    });
}

function zoomOut() {
    currentZoom = Math.max(currentZoom - ZOOM_STEP, ZOOM_MIN);
    applyZoomTransform();
    updateZoomDisplay();
    requestAnimationFrame(function () {
        updateSvgDimensions();
        drawConnections();
    });
}

function resetZoom() {
    currentZoom = 1;
    applyZoomTransform();
    updateZoomDisplay();
    requestAnimationFrame(function () {
        updateSvgDimensions();
        drawConnections();
    });
}

function applyZoomTransform() {
    var container = document.querySelector('.tree-zoom-container');
    if (container) {
        container.style.transform = 'scale(' + currentZoom + ')';
        container.style.transformOrigin = 'top left';
    }
}

function updateZoomDisplay() {
    var display = document.getElementById('zoomLevel');
    if (display) {
        display.textContent = Math.round(currentZoom * 100) + '%';
    }
}

// ===============================
// SELECTION SYSTEM
// ===============================

function selectNode(codigo) {
    if (selectedNode === codigo) {
        deselectAll();
        return;
    }
    selectedNode = codigo;

    // Add 'selected' class to the clicked node (for mobile action buttons)
    var clickedNode = document.getElementById('tree-node-' + codigo);
    if (clickedNode) clickedNode.classList.add('selected');

    // Recalculate SVG immediately (no delay), then again after card expansion
    requestAnimationFrame(function() {
        updateSvgDimensions();
        drawConnections();
    });

    // Second recalculation after card expansion transition completes
    setTimeout(function() {
        updateSvgDimensions();
        drawConnections();
    }, 300);
}

function findCorrelatives(codigo) {
    var foundNodes = {};
    var foundLines = {};
    foundNodes[codigo] = true;

    // Find subject
    var m = null;
    for (var i = 0; i < materias.length; i++) {
        if (materias[i].codigo === codigo) {
            m = materias[i];
            break;
        }
    }
    if (!m) return { nodes: foundNodes, lines: foundLines };

    // 1. Direct Prerequisites (paraCursar + paraAprobar)
    var prereqs = (m.paraCursar || []).concat(m.paraAprobar || []);
    for (var j = 0; j < prereqs.length; j++) {
        var reqCode = prereqs[j].materia;
        if (reqCode === 'OPT-HORAS') continue;
        foundNodes[reqCode] = true;
        foundLines[reqCode + '->' + codigo] = true;
    }

    // 2. Direct Dependents (lookup in all subjects)
    for (var k = 0; k < materias.length; k++) {
        var m2 = materias[k];
        var deps = (m2.paraCursar || []).concat(m2.paraAprobar || []);
        for (var l = 0; l < deps.length; l++) {
            if (deps[l].materia === codigo) {
                var depCode = m2.codigo;
                foundNodes[depCode] = true;
                foundLines[codigo + '->' + depCode] = true;
            }
        }
    }

    return { nodes: foundNodes, lines: foundLines };
}

function deselectAll() {
    selectedNode = null;

    var allNodes = document.querySelectorAll('.subject-node');
    for (var i = 0; i < allNodes.length; i++) {
        allNodes[i].classList.remove('highlighted', 'dimmed', 'selected');
    }

    var allPaths = document.querySelectorAll('svg path.connection-line');
    for (var j = 0; j < allPaths.length; j++) {
        allPaths[j].classList.remove('highlighted', 'dimmed');
    }

    // Recalculate SVG immediately
    requestAnimationFrame(function() {
        updateSvgDimensions();
        drawConnections();
    });
}


function applySelectionVisuals() {
    if (!selectedNode) return;
    var correlatives = findCorrelatives(selectedNode);

    // Apply visual changes to nodes
    var allNodes = document.querySelectorAll('.subject-node');
    for (var n = 0; n < allNodes.length; n++) {
        var node = allNodes[n];
        var nodeCode = node.dataset.codigo;
        if (correlatives.nodes[nodeCode]) {
            node.classList.add('highlighted');
            node.classList.remove('dimmed');
        } else {
            node.classList.add('dimmed');
            node.classList.remove('highlighted');
        }
    }

    // Apply visual changes to SVG lines
    var allPaths = document.querySelectorAll('svg path.connection-line');
    for (var p = 0; p < allPaths.length; p++) {
        var path = allPaths[p];
        var from = path.getAttribute('data-from');
        var to = path.getAttribute('data-to');
        if (correlatives.lines[from + '->' + to]) {
            path.classList.add('highlighted');
            path.classList.remove('dimmed');
        } else {
            path.classList.add('dimmed');
            path.classList.remove('highlighted');
        }
    }

    // Ensure only selectedNode has the 'selected' class (for mobile action buttons)
    for (var sn = 0; sn < allNodes.length; sn++) {
        var nd = allNodes[sn];
        if (nd.dataset.codigo === selectedNode) {
            nd.classList.add('selected');
        } else {
            nd.classList.remove('selected');
        }
    }
}


// ESC key to deselect
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') deselectAll();
});

// Click on empty space to deselect
var treeWrapper = document.querySelector('.tree-wrapper');
if (treeWrapper) {
    treeWrapper.addEventListener('click', function(e) {
        if (!e.target.closest('.subject-node')) {
            deselectAll();
        }
    });
}

// ===============================
// TOGGLE OPTATIVAS
// ===============================

function toggleOptativasVisibility() {
    var checkbox = document.getElementById('toggleOptativas');
    var optRows = document.querySelectorAll('.subjects-row.optativas');
    var labels = document.querySelectorAll('.optativa-label');
    var i;

    if (checkbox.checked) {
        for (i = 0; i < optRows.length; i++) {
            optRows[i].classList.remove('hidden');
        }
        for (i = 0; i < labels.length; i++) {
            labels[i].style.display = '';
        }
    } else {
        for (i = 0; i < optRows.length; i++) {
            optRows[i].classList.add('hidden');
        }
        for (i = 0; i < labels.length; i++) {
            labels[i].style.display = 'none';
        }
    }

    function updateAfterToggle() {
        // Force reflow to get accurate dimensions after hiding/showing elements
        var zoomContainer = document.querySelector('.tree-zoom-container');
        if (zoomContainer) void zoomContainer.offsetHeight;

        updateSvgDimensions();
        drawConnections();
        if (selectedNode) {
            applySelectionVisuals();
        }
    }

    requestAnimationFrame(updateAfterToggle);
    setTimeout(updateAfterToggle, 100);
}

// ===============================
// LEGEND AUTO-HIDE
// ===============================

var legendTimeout;

function autoHideLegend() {
    var legend = document.getElementById('treeLegend');
    if (legend) {
        legend.classList.add('hidden');
    }
}

function toggleLegend() {
    var legend = document.getElementById('treeLegend');
    if (!legend) return;
    
    if (legend.classList.contains('hidden')) {
        legend.classList.remove('hidden');
        // Reset auto-hide timer
        clearTimeout(legendTimeout);
        legendTimeout = setTimeout(autoHideLegend, 10000);
    } else {
        legend.classList.add('hidden');
    }
}

// Auto-hide legend after 10 seconds
document.addEventListener('DOMContentLoaded', function() {
    legendTimeout = setTimeout(autoHideLegend, 10000);
});

// ===============================
// SCROLL REDRAW & COMPACT INIT (one-time setup)
// ===============================
document.addEventListener('DOMContentLoaded', function() {
    var wrapper = document.querySelector('.tree-wrapper');
    if (wrapper) {
        wrapper.addEventListener('scroll', function() {
            requestAnimationFrame(function() {
                drawConnections();
            });
        }, { passive: true });
    }

});
