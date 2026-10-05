// vacunas.js
let vacunasHistorico = JSON.parse(localStorage.getItem("vacunasHistorico")) || [];

// Requisitos de materias (para la regla de dTpa)
var estados = getCachedState('estados');

// dTpa: exigida solo al poder cursar Pediatría (PD001, 5º año); antes basta dT
function requiereDtpa() {
    var pediatria = (typeof materias !== 'undefined') && materias.find(m => m.codigo === 'PD001');
    if (!pediatria) return false;
    estados = getCachedState('estados'); // refrescar (sincronización entre pestañas)
    var cursando = getCachedState('cursando');
    return !!(estados[pediatria.codigo] || cursando[pediatria.codigo] || cumpleRequisitos(pediatria.paraCursar));
}

// Vacunas no obligatorias del Calendario Nacional 2026 — se muestran atenuadas, sin alerta
var VACUNAS_OPCIONALES = ['fiebreAmarilla', 'hepatitisA', 'varicela', 'neumococica', 'meningococica', 'fiebreHemorragica'];

function toggleBox(header) {
    const content = header.nextElementSibling;
    content.classList.toggle('collapsed');
}

// Faltantes: colapsar solo la lista (el input de fecha queda visible)
function toggleFaltantes() {
    const content = document.querySelector('#faltantesBox .box-content');
    if (content) content.classList.toggle('collapsed');
}

// ===============================
// MAPA DE VACUNAS Y CEPAS (contornos por vacuna sobre círculos de patógeno)
// ===============================
var vennCircles = null;

function renderVenn() {
    const box = document.getElementById('vennBox');
    if (!box || typeof VACUNAS_VENN_LAYOUT === 'undefined' || typeof VACUNAS_VENN_PATOGENOS === 'undefined') return;
    vennCircles = computeVaccineCircles();
    drawVenn();
    buildVennFilters();
    box.style.display = '';
}

// Subconjuntos reales (dT ⊂ dTpa ⊂ Quíntuple) deben anidar visualmente
function vennEnsureSubsets(circles) {
    const pairs = [
        ['dTpa / DTP', 'Quíntuple'], // primero el par externo
        ['dT', 'dTpa / DTP']
    ];
    pairs.forEach(([child, parent]) => {
        const C = circles[child], P = circles[parent];
        if (!C || !P || C.radius >= P.radius) return;
        const maxD = P.radius - C.radius;
        const d = Math.hypot(C.x - P.x, C.y - P.y);
        if (d > maxD) {
            const ang = Math.atan2(C.y - P.y, C.x - P.x);
            C.x = P.x + maxD * Math.cos(ang);
            C.y = P.y + maxD * Math.sin(ang);
        }
    });
}

// Contorno de vacuna = círculo mínimo que engloba sus patógenos (+ margen)
function computeVaccineCircles() {
    const pos = {};
    VACUNAS_VENN_PATOGENOS.forEach(p => { pos[p.nome] = p; });
    const out = {};
    VACUNAS_VENN_LAYOUT.forEach(v => {
        const pts = v.patogenos.map(n => pos[n]).filter(Boolean);
        if (!pts.length) return;
        const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
        const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
        let r = 0;
        pts.forEach(p => { r = Math.max(r, Math.hypot(p.x - cx, p.y - cy) + p.r); });
        out[v.vacuna] = { x: cx, y: cy, radius: r + 16, labelAngle: v.labelAngle };
    });
    vennEnsureSubsets(out);
    return out;
}

// Partir nombre largo en 2 líneas (evita texto saliendo del círculo)
function vennSplitLabel(s) {
    if (s.length <= 11) return [s];
    let best = -1, bestDiff = 99;
    for (let i = 0; i < s.length; i++) {
        if (s[i] === ' ') {
            const diff = Math.abs(i - s.length / 2);
            if (diff < bestDiff) { bestDiff = diff; best = i; }
        }
    }
    if (best === -1) return [s];
    return [s.slice(0, best), s.slice(best + 1)];
}

function vennCoveredBy(patogenoNome) {
    return VACUNAS_VENN_LAYOUT.filter(v => v.patogenos.indexOf(patogenoNome) !== -1).map(v => v.vacuna);
}

function drawVenn() {
    const svg = document.getElementById('vennSvg');
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    const NS = 'http://www.w3.org/2000/svg';

    // ── Capa 1: patógenos (círculos maciços, solo visual) ──
    const patoLayer = document.createElementNS(NS, 'g');
    patoLayer.setAttribute('pointer-events', 'none');
    VACUNAS_VENN_PATOGENOS.forEach(p => {
        const color = p.grupo === 'bacteriana' ? '#f59e0b' : '#22d3ee';
        const g = document.createElementNS(NS, 'g');
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('cx', p.x);
        c.setAttribute('cy', p.y);
        c.setAttribute('r', p.r);
        c.setAttribute('fill', color);
        c.setAttribute('fill-opacity', '0.22');
        c.setAttribute('stroke', color);
        c.setAttribute('stroke-opacity', '0.55');
        c.setAttribute('stroke-width', '1');
        g.appendChild(c);

        const lines = vennSplitLabel(p.short || p.nome);
        const baseY = p.y - (lines.length - 1) * 4.5;
        lines.forEach((ln, i) => {
            const t = document.createElementNS(NS, 'text');
            t.setAttribute('x', p.x);
            t.setAttribute('y', baseY + i * 9);
            t.setAttribute('text-anchor', 'middle');
            t.setAttribute('class', 'venn-pato-name');
            t.textContent = ln;
            g.appendChild(t);
        });

        const cubiertas = vennCoveredBy(p.nome);
        const title = document.createElementNS(NS, 'title');
        title.textContent = p.nome + ' — vacunas: ' + (cubiertas.join(', ') || '—');
        g.appendChild(title);
        patoLayer.appendChild(g);
    });
    svg.appendChild(patoLayer);

    // ── Capa 2: vacunas (contornos, clic en todo el disco) ──
    // Grandes primero: los anidados (dT) quedan encima y capturan su zona
    const names = Object.keys(vennCircles).sort((a, b) => vennCircles[b].radius - vennCircles[a].radius);
    names.forEach(name => {
        const c = vennCircles[name];
        const ficha = VACUNAS_FICHAS[name];
        if (!ficha) return;
        const color = VACUNAS_VENN_COLORS[name] || '#22d3ee';
        const g = document.createElementNS(NS, 'g');
        g.setAttribute('class', 'venn-node');
        g.setAttribute('data-vacuna', name);
        g.setAttribute('tabindex', '0');
        g.setAttribute('role', 'button');

        const ring = document.createElementNS(NS, 'circle');
        ring.setAttribute('cx', c.x);
        ring.setAttribute('cy', c.y);
        ring.setAttribute('r', c.radius);
        ring.setAttribute('fill', 'none');
        ring.setAttribute('stroke', color);
        ring.setAttribute('stroke-width', '1.5');
        // fill:none NO recibe clics → todo el disco clickeable
        ring.setAttribute('pointer-events', 'all');
        g.appendChild(ring);

        // Nombre sobre el borde del contorno (ángulo por vacuna, evita solapes)
        const rad = (c.labelAngle !== undefined ? c.labelAngle : -90) * Math.PI / 180;
        const lx = c.x + (c.radius + 8) * Math.cos(rad);
        const ly = c.y + (c.radius + 8) * Math.sin(rad);
        const cos = Math.cos(rad);
        const nameText = document.createElementNS(NS, 'text');
        nameText.setAttribute('x', lx);
        nameText.setAttribute('y', ly);
        nameText.setAttribute('text-anchor', cos < -0.3 ? 'end' : (cos > 0.3 ? 'start' : 'middle'));
        nameText.setAttribute('class', 'venn-vacuna-name');
        nameText.setAttribute('fill', color);
        nameText.textContent = name;
        nameText.setAttribute('pointer-events', 'none');
        g.appendChild(nameText);

        const title = document.createElementNS(NS, 'title');
        title.textContent = ficha.nome + ' — clic para ver la ficha';
        g.appendChild(title);

        g.addEventListener('click', () => abrirFicha(name));
        g.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrirFicha(name); }
        });
        svg.appendChild(g);
    });
}

function buildVennFilters() {
    const wrap = document.getElementById('vennFilters');
    if (!wrap) return;
    while (wrap.firstChild) wrap.removeChild(wrap.firstChild);
    VACUNAS_VENN_FILTERS.forEach(f => {
        const lab = document.createElement('label');
        lab.className = 'venn-filter';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = true;
        cb.addEventListener('change', applyVennFilters);
        lab.appendChild(cb);
        lab.appendChild(document.createTextNode(' ' + f.label));
        wrap.appendChild(lab);
    });
}

function applyVennFilters() {
    const checks = document.querySelectorAll('#vennFilters input');
    const off = [];
    VACUNAS_VENN_FILTERS.forEach((f, i) => {
        if (checks[i] && !checks[i].checked) off.push(f.match);
    });
    document.querySelectorAll('#vennSvg .venn-node').forEach(g => {
        const ficha = VACUNAS_FICHAS[g.getAttribute('data-vacuna')];
        if (!ficha) return;
        const hay = (ficha.patogenos || []).join(' ').toLowerCase();
        g.style.display = off.some(m => hay.indexOf(m) !== -1) ? 'none' : '';
    });
}

// ===============================
// FICHA DE VACUNA (modal)
// ===============================
function fichaAddSection(body, titulo, buildContent) {
    const sec = document.createElement('div');
    sec.className = 'ficha-section';
    const h4 = document.createElement('h4');
    h4.textContent = titulo;
    sec.appendChild(h4);
    buildContent(sec);
    body.appendChild(sec);
}

function fichaAddTags(sec, items, makeText, makeTitle) {
    const wrap = document.createElement('div');
    wrap.className = 'ficha-tags';
    items.forEach(item => {
        const tag = document.createElement('span');
        tag.className = 'ficha-tag';
        tag.textContent = makeText(item);
        const t = makeTitle(item);
        if (t) tag.title = t;
        wrap.appendChild(tag);
    });
    sec.appendChild(wrap);
}

function abrirFicha(name) {
    const f = VACUNAS_FICHAS[name];
    if (!f) return;
    const body = document.getElementById('fichaBody');
    while (body.firstChild) body.removeChild(body.firstChild);

    const h = document.createElement('h3');
    h.textContent = f.nome || name;
    body.appendChild(h);

    if (f.tipo) fichaAddSection(body, 'Tipo', sec => {
        const p = document.createElement('p');
        p.textContent = f.tipo;
        sec.appendChild(p);
    });

    if (f.tipos) fichaAddSection(body, 'Tipos', sec => {
        fichaAddTags(sec, f.tipos, t => t, null);
    });

    if (f.esquema) fichaAddSection(body, 'Esquema', sec => {
        const p = document.createElement('p');
        p.textContent = f.esquema;
        sec.appendChild(p);
    });

    if (f.indicacion) fichaAddSection(body, 'Indicación', sec => {
        const p = document.createElement('p');
        p.textContent = f.indicacion;
        sec.appendChild(p);
    });

    if (f.patogenos) fichaAddSection(body, 'Patógenos cubiertos', sec => {
        const ul = document.createElement('ul');
        f.patogenos.forEach(p => {
            const li = document.createElement('li');
            li.textContent = p;
            ul.appendChild(li);
        });
        sec.appendChild(ul);
    });

    if (f.marcas) fichaAddSection(body, 'Marcas', sec => {
        fichaAddTags(sec, f.marcas, m => m.marca + (m.empresa ? ' — ' + m.empresa : ''), m => m.detalle || '');
    });

    if (f.notaFCM) fichaAddSection(body, 'Nota FCM', sec => {
        const p = document.createElement('p');
        p.textContent = f.notaFCM;
        sec.appendChild(p);
    });

    if (f.desarrollo && f.desarrollo !== '—') fichaAddSection(body, 'En desarrollo / estado del arte', sec => {
        const p = document.createElement('p');
        p.textContent = f.desarrollo;
        sec.appendChild(p);
    });

    if (f.enlaces) fichaAddSection(body, 'Enlaces oficiales', sec => {
        const ul = document.createElement('ul');
        f.enlaces.forEach(e => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = e.url;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = e.label;
            li.appendChild(a);
            ul.appendChild(li);
        });
        sec.appendChild(ul);
    });

    document.getElementById('modalFicha').style.display = 'flex';
}

function cerrarFicha() {
    document.getElementById('modalFicha').style.display = 'none';
}

function abrirExplicacion(key) {
    const config = VACUNAS_CONFIG[key];
    const modal = document.getElementById("modalExplicacion");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("modalExplicacionList");
    
    title.textContent = config.nome;
    list.innerHTML = "";
    
    // Obter todas as patologias já cobertas por vacinas aplicadas
    const patologiasCobertas = new Set();
    vacunasHistorico.forEach(h => {
        const hConfig = VACUNAS_CONFIG[h.key];
        if (hConfig && hConfig.patologias) {
            hConfig.patologias.forEach(p => patologiasCobertas.add(p));
        }
    });
    
    const aplicadasEstaVacuna = vacunasHistorico
        .filter(h => h.key === key)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Status de Patologias
    if (config.patologias) {
        config.patologias.forEach(pat => {
            const li = document.createElement("li");
            const temCobertura = patologiasCobertas.has(pat);
            li.textContent = `${pat} ${temCobertura ? "✅" : "❌"}`;
            list.appendChild(li);
        });
    }

    if (config.intervaloRefuerzoMeses) {
        const li = document.createElement("li");
        const tieneRefuerzo = aplicadasEstaVacuna.length > config.dosesSeries;
        const labelRefuerzo = config.intervaloRefuerzoMeses >= 12 
            ? `${config.intervaloRefuerzoMeses / 12} año(s)` 
            : `${config.intervaloRefuerzoMeses} mes(es)`;
        li.textContent = `Refuerzo ${labelRefuerzo} ${tieneRefuerzo ? "✅" : "❌"}`;
        list.appendChild(li);
    }
    
    modal.style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalExplicacion").style.display = "none";
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById("modalExplicacion");
    if (event.target == modal) {
        cerrarModal();
    }
    const ficha = document.getElementById("modalFicha");
    if (event.target == ficha) {
        cerrarFicha();
    }
}

function registrarDosisRapido(key) {
    const fechaInput = document.getElementById("globalVacunaFecha");
    let input = fechaInput.value.trim();
    
    fechaInput.classList.remove('input-error');

    // Parse MM/YYYY or MM/YY
    let [month, year] = input.split('/');
    if (!month || !year) {
        fechaInput.classList.add('input-error');
        alert("Formato inválido. Use MM/YYYY (ej: 03/2026)");
        return;
    }
    
    // Normalize year
    if (year.length === 2) year = '20' + year;
    // Normalize month
    month = month.padStart(2, '0');
    
    let fecha = `${year}-${month}`;

    if (!/^\d{4}-\d{2}$/.test(fecha)) {
        alert("Formato inválido. Use MM/YYYY (ej: 03/2026)");
        fechaInput.classList.add('input-error');
        return;
    }

    fechaInput.value = `${month}/${year}`;
    vacunasHistorico.push({ key, fecha });
    localStorage.setItem("vacunasHistorico", JSON.stringify(vacunasHistorico));
    renderizar();
}

function removerDosis(index) {
    // Ordenar o array conforme exibido na lista antes de remover
    const historicoOrdenado = [...vacunasHistorico].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    const itemParaRemover = historicoOrdenado[index];
    
    // Encontrar o índice real no array original
    const realIndex = vacunasHistorico.indexOf(itemParaRemover);
    
    if (realIndex > -1) {
        vacunasHistorico.splice(realIndex, 1);
        localStorage.setItem("vacunasHistorico", JSON.stringify(vacunasHistorico));
        renderizar();
    }
}

function resetearHistorico() {
    if (confirm("¿Estás seguro de borrar todo el historial?")) {
        vacunasHistorico = [];
        localStorage.removeItem("vacunasHistorico");
        renderizar();
    }
}

function renderizar() {
    const historicoList = document.getElementById("historicoList");
    historicoList.innerHTML = "";
    
    // Sort by date (descending)
    vacunasHistorico.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    vacunasHistorico.forEach((item, index) => {
        const li = document.createElement("li");
        // Convert YYYY-MM back to MM/YYYY for display
        const [y, m] = item.fecha.split('-');
        li.innerHTML = `${VACUNAS_CONFIG[item.key].nome} - ${m}/${y} 
            <button onclick="removerDosis(${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>`;
        historicoList.appendChild(li);
    });
    
    // ... rest of renderizar is unchanged


    // Faltantes/Recomendaciones
    const faltantesList = document.getElementById("faltantesList");
    faltantesList.innerHTML = "";
    
    const hoje = new Date();
    
    for (const key in VACUNAS_CONFIG) {
        const config = VACUNAS_CONFIG[key];
        // Opcionales y dTpa (antes de Pediatría): mostradas atenuadas, sin ⚠
        const alerta = !VACUNAS_OPCIONALES.includes(key) && !(key === 'dtpa' && !requiereDtpa());
        const aplicadas = vacunasHistorico
            .filter(h => h.key === key)
            .map(h => new Date(h.fecha))
            .sort((a, b) => b - a);
        
        // 1. Serie Inicial
        if (aplicadas.length < config.dosesSeries) {
            const li = document.createElement("li");
            if (!alerta) li.style.opacity = "0.5";
            li.innerHTML = `${config.nome}: Falta(n) ${config.dosesSeries - aplicadas.length} dosis 
                ${alerta ? `<button class="btn-warning-faltantes" onclick="abrirExplicacion('${key}')">⚠</button>` : ''}
                <button class="btn-primary" style="margin-left: auto; padding: 2px 6px;" onclick="registrarDosisRapido('${key}')">Agregar</button>`;
            faltantesList.appendChild(li);
        } 
        // 2. Refuerzos (Si ya completó la serie)
        else if (config.intervaloRefuerzoMeses) {
            const ultimaDose = aplicadas[0];
            const proximoRefuerzo = new Date(ultimaDose);
            proximoRefuerzo.setMonth(proximoRefuerzo.getMonth() + config.intervaloRefuerzoMeses);
            
            if (proximoRefuerzo <= hoje) {
                const li = document.createElement("li");
                if (!alerta) li.style.opacity = "0.5";
                li.innerHTML = `${config.nome}: Requiere refuerzo 
                    ${alerta ? `<button class="btn-warning-faltantes" onclick="abrirExplicacion('${key}')">⚠</button>` : ''}
                    <button class="btn-primary" style="margin-left: auto; padding: 2px 6px;" onclick="registrarDosisRapido('${key}')">Agregar</button>`;
                faltantesList.appendChild(li);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderizar();
    renderVenn();
});
