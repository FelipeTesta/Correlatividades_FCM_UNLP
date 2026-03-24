// ===============================
// AI_GUIDE: See README_AI.md for project architecture, state management, and development conventions
// ===============================
// INCLUIR: % concluido, optativas
// ===============================
// ===============================
// ===============================
// BASE LOCAL
// ===============================

let estados = JSON.parse(localStorage.getItem("estados")) || {};
let proyectosExtension = JSON.parse(localStorage.getItem("proyectosExtension")) || [];
let anioIngreso = localStorage.getItem("anioIngreso") || new Date().getFullYear();
let fechasFinales = {};
let catedrasData = {};
let fechasCargadas = false;
let catedrasSeleccionadas = JSON.parse(localStorage.getItem("catedrasSeleccionadas")) || {};

function guardarCatedraSeleccionada(codigo, catedra) {
    catedrasSeleccionadas[codigo] = catedra;
    localStorage.setItem("catedrasSeleccionadas", JSON.stringify(catedrasSeleccionadas));
}

// ===============================
// FECHAS DE FINALES - Parser CSV
// ===============================

const MESES = {
    'ene': 0, 'feb': 1, 'mar': 2, 'abr': 3, 'may': 4, 'jun': 5,
    'jul': 6, 'ago': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dic': 11
};

function parsearFecha(fechaStr, anio = 2026) {
    if (!fechaStr || fechaStr === '-' || fechaStr.trim() === '') return null;
    const fechaStrLimpia = fechaStr.trim().toLowerCase();
    const match = fechaStrLimpia.match(/(\d{1,2})-([a-zé]+)/);
    if (!match) return null;
    const dia = parseInt(match[1]);
    const mes = MESES[match[2]];
    if (mes === undefined) return null;
    return new Date(anio, mes, dia);
}

function cargarFechasFinales() {
    console.log('Cargando fechas de finales...');
    return fetch('finales/finales_1er quad 2026.csv')
        .then(response => {
            console.log('Response:', response);
            return response.text();
        })
        .then(csv => {
            const lineas = csv.split('\n');
            const headers = lineas[0].split(',');
            
            fechasFinales = {};
            catedrasData = {};
            
            for (let i = 1; i < lineas.length; i++) {
                const linea = lineas[i];
                if (!linea.trim()) continue;
                
                const valores = [];
                let actual = '';
                let entreComillas = false;
                for (let char of linea) {
                    if (char === '"') {
                        entreComillas = !entreComillas;
                    } else if (char === ',' && !entreComillas) {
                        valores.push(actual.trim());
                        actual = '';
                    } else {
                        actual += char;
                    }
                }
                valores.push(actual.trim());
                
                const codigo = valores[0];
                const materia = valores[1];
                const esLibre = materia && materia.toLowerCase().includes('libre');
                
                if (!codigo) continue;
                
                if (!fechasFinales[codigo]) {
                    fechasFinales[codigo] = [];
                }
                
                // Extraer cátedra
                let catedra = 'Regular';
                const materiaLower = materia ? materia.toLowerCase() : '';
                
                // Para "Patología A", "Cirugía B" -> extrae "A", "B"
                if (materia && /\s+[A-F]$/.test(materia)) {
                    catedra = materia.slice(-1);
                }
                // Para "Historia de la Medicina-Libre", "Ciencias Exactas - Libre" -> "Libre"
                else if (materiaLower.includes('libre')) {
                    catedra = 'Libre';
                }
                // Para "Historia de la Medicina-Regular" -> "Regular" (já é o padrão)
                else if (materiaLower.includes('regular')) {
                    catedra = 'Regular';
                }
                // Para matérias sem sufixo (como "Genética", "Inmunología") -> "Regular"
                
                const fechas = [];
                for (let j = 2; j < valores.length; j++) {
                    const fechaRaw = valores[j];
                    const fechaDate = parsearFecha(fechaRaw);
                    if (fechaDate) {
                        fechas.push({
                            fecha: fechaDate,
                            label: headers[j].trim()
                        });
                    }
                }
                
                if (fechas.length > 0) {
                    fechasFinales[codigo].push({
                        catedra: catedra,
                        esLibre: esLibre,
                        nombreCompleto: materia,
                        fechas: fechas
                    });
                    
                    if (!catedrasData[codigo]) {
                        catedrasData[codigo] = { tieneCatedras: false, catedras: [] };
                    }
                    if (fechasFinales[codigo].length > 1) {
                        catedrasData[codigo].tieneCatedras = true;
                    }
                    catedrasData[codigo].catedras.push(catedra);
                }
            }
            fechasCargadas = true;
        })
        .catch(err => console.error('Error cargando fechas de finales:', err));
}

function obtenerProximasFechas(codigo, soloLibre = false) {
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    
    const entradas = fechasFinales[codigo];
    if (!entradas || entradas.length === 0) return null;
    
    const catedraSel = catedrasSeleccionadas[codigo];
    const todasFechas = [];
    entradas.forEach(entrada => {
        if (soloLibre && !entrada.esLibre) return;
        if (catedraSel && catedraSel !== 'Regular' && entrada.catedra !== catedraSel) {
            return;
        }
        entrada.fechas.forEach(f => {
            todasFechas.push({
                fecha: f.fecha,
                label: f.label,
                catedra: entrada.catedra,
                esLibre: entrada.esLibre,
                nombreCompleto: entrada.nombreCompleto
            });
        });
    });
    
    if (todasFechas.length === 0) return null;
    
    todasFechas.sort((a, b) => a.fecha - b.fecha);
    
    const proximas = [];
    for (let f of todasFechas) {
        const diffTiempo = f.fecha - ahora;
        const diffDias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24));
        if (diffDias >= 0 && proximas.length < 3) {
            proximas.push({ ...f, diffDias });
        }
    }
    
    if (proximas.length === 0) return null;
    return proximas;
}

function obtenerTodasFechas(codigo) {
    const entradas = fechasFinales[codigo];
    if (!entradas || entradas.length === 0) return null;
    
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    
    const catedraSel = catedrasSeleccionadas[codigo];
    const todasFechas = [];
    entradas.forEach(entrada => {
        if (catedraSel && catedraSel !== 'Regular' && entrada.catedra !== catedraSel) {
            return;
        }
        entrada.fechas.forEach(f => {
            todasFechas.push({
                fecha: f.fecha,
                label: f.label,
                catedra: entrada.catedra,
                esLibre: entrada.esLibre,
                nombreCompleto: entrada.nombreCompleto
            });
        });
    });
    
    if (todasFechas.length === 0) return null;
    
    todasFechas.sort((a, b) => a.fecha - b.fecha);
    
    const proximas = [];
    const anteriores = [];
    
    for (let f of todasFechas) {
        if (f.fecha >= ahora) {
            proximas.push(f);
        } else {
            anteriores.push(f);
        }
    }
    
    return { proximas, anteriores };
}

function formatearFechaDMA(fecha) {
    const dia = fecha.getDate();
    const mes = fecha.getMonth();
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return `${dia}/${meses[mes]}`;
}

document.getElementById("anioIngreso").value = anioIngreso;

// ===============================
// GUARDAR AÑO
// ===============================

function guardarAnio() {
    anioIngreso = document.getElementById("anioIngreso").value;
    localStorage.setItem("anioIngreso", anioIngreso);
    render();
}

// ===============================
// GUARDAR ESTADO
// ===============================

function guardarEstado() {
    const codigo = document.getElementById("materiaSelect").value;
    const estado = document.getElementById("estadoSelect").value;

    if (estado === "ninguno") {
        delete estados[codigo];
    } else {
        estados[codigo] = estado;
    }

    localStorage.setItem("estados", JSON.stringify(estados));
    render();
}

function guardarLocalYRender() {
    localStorage.setItem("estados", JSON.stringify(estados));
    render();
}

// ===============================
// RESETEAR TODOS LOS ESTADOS
// ===============================

function resetearTodos() {
    estados = {};
    localStorage.removeItem("estados");
    render();
}

// ===============================
// PROYECTOS DE EXTENSIÓN
// ===============================

function agregarProyectoExtension() {
    const nombre = document.getElementById("extensionNombre").value.trim();
    const horas = parseInt(document.getElementById("extensionHoras").value) || 0;

    if (!nombre || horas <= 0) {
        alert("Por favor, ingrese nombre y horas válidas");
        return;
    }

    proyectosExtension.push({ id: Date.now(), nombre, horas });
    localStorage.setItem("proyectosExtension", JSON.stringify(proyectosExtension));
    
    document.getElementById("extensionNombre").value = "";
    document.getElementById("extensionHoras").value = "";
    
    render();
}

function eliminarProyectoExtension(id) {
    proyectosExtension = proyectosExtension.filter(p => p.id !== id);
    localStorage.setItem("proyectosExtension", JSON.stringify(proyectosExtension));
    render();
}

// ===============================
// VERIFICACIONES
// ===============================

function cumpleRequisitos(lista, materia = null) {

    // Verificar año de matrícula para optativas
    if (materia && materia.categoria === "optativa" && materia.anio) {
        const aniosMatricula = new Date().getFullYear() - anioIngreso + 1;
        if (aniosMatricula < materia.anio) {
            return false;
        }
    }

    for (let req of lista) {
        if (!verificarRequisito(req)) return false;
    }

    return true;
}

// ===============================
// RENDER
// ===============================

function render() {

    limpiarListas();
    actualizarHorasOptativas();
    actualizarBarraProgreso();

    if (!materias) return;

    // coletar itens para noPuedeCursar antes de renderizar
    const noPuedeCursarItems = [];
    const puedeCursarObligatorias = [];
    const puedeCursarOptativas = [];

    materias.forEach(m => {

        const estado = estados[m.codigo];

        if (estado === "aprobada") {
            agregar("aprobadas", m.nombre, m.codigo);
            return;
        }

        if (estado === "regularizada") {

            if (cumpleRequisitos(m.paraAprobar, m)) {
                agregar("puedeFinal", m.nombre, m.codigo);
            } else {
                const progreso = calcularProgreso(m, m.paraAprobar);
                agregar("noPuedeFinal", m.nombre, m.codigo, progreso);
            }

            return;
        }

        // SIN ESTADO
        if (cumpleRequisitos(m.paraCursar, m)) {
            if (m.categoria === "optativa") {
                puedeCursarOptativas.push(m);
            } else {
                puedeCursarObligatorias.push(m);
            }
        } else {
            const progreso = calcularProgreso(m);
            noPuedeCursarItems.push({ nombre: m.nombre, codigo: m.codigo, progreso, categoria: m.categoria });
        }

    });

    // Ordenar por año (menor para maior)
    puedeCursarObligatorias.sort((a, b) => (a.anio || 0) - (b.anio || 0));
    puedeCursarOptativas.sort((a, b) => (a.anio || 0) - (b.anio || 0));

    // Renderizar puede cursar ordenado
    puedeCursarObligatorias.forEach(m => agregar("puedeCursar-obligatorias", m.nombre, m.codigo));
    puedeCursarOptativas.forEach(m => agregar("puedeCursar-optativas", m.nombre, m.codigo));

    // renderizar proyectos de extensión en "aprobadas" y en su propia lista
    proyectosExtension.forEach(p => {
        // En Aprobadas
        const liAprobada = document.createElement("li");
        const spanAprobada = document.createElement("span");
        spanAprobada.innerText = p.nombre;
        spanAprobada.className = "extension-nombre";
        liAprobada.appendChild(spanAprobada);

        const infoSpanAprobada = document.createElement("span");
        infoSpanAprobada.innerText = `${p.horas} Horas | Proyecto de Extensión`;
        infoSpanAprobada.className = "anio-tag";
        liAprobada.appendChild(infoSpanAprobada);

        const rightGroupAprobada = document.createElement("div");
        rightGroupAprobada.className = "right-group";

        const btnDeleteAprobada = document.createElement("button");
        btnDeleteAprobada.innerText = "❌";
        btnDeleteAprobada.onclick = () => eliminarProyectoExtension(p.id);
        rightGroupAprobada.appendChild(btnDeleteAprobada);

        liAprobada.appendChild(rightGroupAprobada);
        document.getElementById("aprobadas").appendChild(liAprobada);

        // En Proyectos de Extensión (la caja dedicada)
        const liExtension = document.createElement("li");
        const spanExtension = document.createElement("span");
        spanExtension.innerText = p.nombre;
        liExtension.appendChild(spanExtension);

        const infoSpanExtension = document.createElement("span");
        infoSpanExtension.innerText = `${p.horas} Horas`;
        infoSpanExtension.className = "anio-tag";
        liExtension.appendChild(infoSpanExtension);

        const rightGroupExtension = document.createElement("div");
        rightGroupExtension.className = "right-group";

        const btnDeleteExtension = document.createElement("button");
        btnDeleteExtension.innerText = "❌";
        btnDeleteExtension.onclick = () => eliminarProyectoExtension(p.id);
        rightGroupExtension.appendChild(btnDeleteExtension);

        liExtension.appendChild(rightGroupExtension);
        document.getElementById("proyectosExtension").appendChild(liExtension);
    });

    // ordenar por faltantes (total - cumplidos) em ordem crescente
    noPuedeCursarItems.sort((a, b) => {
        const faltanteA = a.progreso.total - a.progreso.cumplidos;
        const faltanteB = b.progreso.total - b.progreso.cumplidos;
        return faltanteA - faltanteB;
    });

    // renderizar ordenados
    noPuedeCursarItems.forEach(item => {
        const listId = item.categoria === "optativa" ? "noPuedeCursar-optativas" : "noPuedeCursar-obligatorias";
        agregar(listId, item.nombre, item.codigo, item.progreso);
    });
}

// ===============================
// UTILIDADES
// ===============================

function calcularHorasOptativas() {
    let horas = 0;
    materias.forEach(m => {
        if (m.categoria === "optativa" && m.horas && estados[m.codigo] === "aprobada") {
            horas += m.horas;
        }
    });
    // sumar horas de proyectos de extensión
    proyectosExtension.forEach(p => {
        horas += p.horas;
    });
    return horas;
}

function actualizarBarraProgreso() {
    // solo contar materias obligatorias (no optativas)
    const obligatorias = materias.filter(m => m.categoria !== "optativa");
    
    let aprobadas = 0;
    let regularizadas = 0;
    let optativasPct = 0;
    let puedeCursar = 0;
    let total = 0;
    
    obligatorias.forEach(m => {
        // calcular puntos segun categoria/duracion
        let puntos = 0;
        if (m.categoria === "anual") {
            puntos = 120;
        } else if (m.categoria === "cuatrimestral") {
            puntos = 60;
        } else if (m.categoria === "bimestral") {
            puntos = 30;
        }
        
        total += puntos;
        
        const estado = estados[m.codigo];
        if (estado === "aprobada") {
            aprobadas += puntos;
        } else if (estado === "regularizada") {
            regularizadas += puntos;
        } else if (cumpleRequisitos(m.paraCursar, m)) {
            puedeCursar += puntos;
        }
    });
    
    // Agregar horas optativas al total (270 puntos = 270 horas)
    const horasOptativas = calcularHorasOptativas();
    total += 270;
    const optativasPuntos = Math.min(horasOptativas, 270);
    
    // calcular porcentajes
    const pctAprobadas = total > 0 ? (aprobadas / total) * 100 : 0;
    const pctRegularizadas = total > 0 ? (regularizadas / total) * 100 : 0;
    const pctOptativas = total > 0 ? (optativasPuntos / total) * 100 : 0;
    const pctPuedeCursar = total > 0 ? (puedeCursar / total) * 100 : 0;
    const pctTotal = ((aprobadas + regularizadas + optativasPuntos + puedeCursar) / total) * 100;
    
    // actualizar texto
    document.getElementById("materiasCount").innerText = `Materias: ${obligatorias.filter(m => estados[m.codigo] === "aprobada").length} (Aprobadas) / ${obligatorias.length} (Totales) | Optativas: ${Math.min(horasOptativas, 270)}/270h`;
    
    // actualizar segmentos de barra
    const segAprobadas = document.getElementById("segmentAprobadas");
    const segRegularizadas = document.getElementById("segmentRegularizadas");
    const segOptativas = document.getElementById("segmentOptativas");
    const segPuedeCursar = document.getElementById("segmentPuedeCursar");
    
    segAprobadas.style.width = pctAprobadas + "%";
    segRegularizadas.style.width = pctRegularizadas + "%";
    segOptativas.style.width = pctOptativas + "%";
    segPuedeCursar.style.width = pctPuedeCursar + "%";
    
    // actualizar porcentaje total
    document.getElementById("progressPercent").innerText = Math.round(pctTotal) + "%";
}

function verificarRequisito(req) {
    // Si es un requisito especial de horas de optativas
    if (req.materia === "OPT-HORAS") {
        const horas = calcularHorasOptativas();
        if (req.condicion === ">=270") return horas >= 270;
        return false;
    }
    const estadoMateria = estados[req.materia];
    if (req.condicion === "aprobada") return estadoMateria === "aprobada";
    if (req.condicion === "regularizada") return !!estadoMateria;
    return false;
}

function resolverRequisitosTransitivos(requisitos) {
    const todosRequisitos = [];
    const visitados = new Set();

    function colectar(reqs) {
        for (let req of reqs) {
            const key = `${req.materia}:${req.condicion}`;
            if (visitados.has(key)) continue;
            visitados.add(key);
            todosRequisitos.push(req);
            const materia = materias.find(m => m.codigo === req.materia);
            if (materia && materia.paraCursar) {
                colectar(materia.paraCursar);
            }
        }
    }

    colectar(requisitos);
    return todosRequisitos;
}

function calcularProgreso(materia, listaRequisitos = null) {
    const requisitosEvaluar = listaRequisitos || resolverRequisitosTransitivos(materia.paraCursar);
    let total = requisitosEvaluar.length;
    
    // Agregar verificación de año de matrícula para optativas (solo si calculamos para cursar)
    let requiereAnioMatricula = false;
    if (!listaRequisitos && materia.categoria === "optativa" && materia.anio) {
        const aniosMatricula = new Date().getFullYear() - anioIngreso;
        if (aniosMatricula < materia.anio) {
            requiereAnioMatricula = true;
            total += 1;
        }
    }
    
    if (total === 0 && !requiereAnioMatricula) return null;
    let cumplidos = 0;
    let faltantes = [];
    
    for (let req of requisitosEvaluar) {
        if (verificarRequisito(req)) {
            cumplidos++;
        } else {
            const m = materias.find(x => x.codigo === req.materia);
            const nombre = m ? m.nombre : req.materia;
            const condicion = req.condicion === "aprobada" ? "Aprobada" : "Regularizada";
            faltantes.push(`${nombre} (${condicion})`);
        }
    }
    
    // Verificar año de matrícula
    if (requiereAnioMatricula) {
        const aniosMatricula = new Date().getFullYear() - anioIngreso;
        if (aniosMatricula >= materia.anio) {
            cumplidos++;
        } else {
            faltantes.push(`${materia.anio}° Año de matrícula`);
        }
    }
    
    return { 
        cumplidos, 
        total, 
        faltante: faltantes.length === 1 ? faltantes[0].split(" (")[0] : null,
        faltantes: faltantes
    };
}

function agregar(id, texto, codigo = null, progreso = null) {

    const li = document.createElement("li");

    // Para "no puede cursar" o "no puede final": criar dois boxes separados
    if (progreso && (id === "noPuedeCursar" || id.startsWith("noPuedeCursar-") || id === "noPuedeFinal")) {
        li.className = "item-row";
        
        // Box 1: Nome da matéria
        const box1 = document.createElement("div");
        box1.className = "item-box item-nombre";
        
        const span = document.createElement("span");
        span.innerText = texto;
        
        if (codigo) {
            const materia = materias.find(m => m.codigo === codigo);
            if (materia && materia.categoria === "optativa") {
                span.className = "optativa-nombre";
            }
        }
        box1.appendChild(span);
        
        // Box 2: Requisitos
        const box2 = document.createElement("div");
        box2.className = "item-box item-requisitos";
        
        const { cumplidos, total, faltante } = progreso;
        
        if (faltante) {
            const faltaSpan = document.createElement("span");
            faltaSpan.innerText = `Falta: ${faltante}`;
            faltaSpan.className = "falta";
            box2.appendChild(faltaSpan);
            
            const emoji = document.createElement("span");
            emoji.innerText = "🟡";
            emoji.className = "progress-emoji";
            box2.appendChild(emoji);
        }
        
        // Info (ano/categoria)
        let infoSpan = null;
        if (codigo) {
            const materia = materias.find(m => m.codigo === codigo);
            if (materia) {
                let infoText = "";
                if (materia.categoria === "optativa" && materia.horas) {
                    infoText += `${materia.horas}h`;
                }
                if (materia.anio) {
                    if (infoText) infoText += " | ";
                    infoText += `${materia.anio}° Año`;
                }
                if (materia.categoria) {
                    if (infoText) infoText += " | ";
                    infoText += materia.categoria.charAt(0).toUpperCase() + materia.categoria.slice(1);
                }
                if (infoText) {
                    infoSpan = document.createElement("span");
                    infoSpan.innerText = infoText;
                    infoSpan.className = "anio-tag";
                }
            }
        }
        
        if (infoSpan) {
            box2.appendChild(infoSpan);
        }
        
        const progSpan = document.createElement("span");
        progSpan.innerText = `(${cumplidos}/${total})`;
        progSpan.className = "progress";
        box2.appendChild(progSpan);

        if (progreso.faltantes && progreso.faltantes.length > 0) {
            const btnWarn = document.createElement("button");
            btnWarn.innerText = "⚠";
            btnWarn.className = "btn-warning-faltantes";
            btnWarn.title = "Ver materias faltantes";
            btnWarn.onclick = (e) => {
                e.stopPropagation();
                mostrarPopupFaltantes(texto, progreso.faltantes);
            };
            box2.appendChild(btnWarn);
        }
        
        // Botões de controle para noPuedeFinal (Reset e Aprobada)
        if (id === "noPuedeFinal" && codigo) {
            const rightGroup = document.createElement("div");
            rightGroup.className = "right-group";
            
            const btnAprobada = document.createElement("button");
            btnAprobada.innerText = "✅";
            btnAprobada.onclick = () => {
                estados[codigo] = "aprobada";
                guardarLocalYRender();
            };
            rightGroup.appendChild(btnAprobada);

            const btnReset = document.createElement("button");
            btnReset.innerText = "🔄";
            btnReset.onclick = () => {
                delete estados[codigo];
                guardarLocalYRender();
            };
            rightGroup.appendChild(btnReset);
            
            box2.appendChild(rightGroup);
        }
        
        li.appendChild(box1);
        li.appendChild(box2);
        
        document.getElementById(id).appendChild(li);
        return;
    }

    // Para otros casos: estructura original
    const span = document.createElement("span");
    span.innerText = texto;
    
    // aplicar clase para optativas
    let materia = null;
    if (codigo) {
        materia = materias.find(m => m.codigo === codigo);
        if (materia && materia.categoria === "optativa") {
            span.className = "optativa-nombre";
        }
    }
    
    li.appendChild(span);

    // Preparar infoSpan
    let infoSpan = null;
    if (codigo) {
        const materia = materias.find(m => m.codigo === codigo);
        if (materia) {
            infoSpan = document.createElement("span");
            let infoText = "";
            // agregar horas para optativas al principio
            if (materia.categoria === "optativa" && materia.horas) {
                infoText += `${materia.horas}h`;
            }
            if (materia.anio) {
                if (infoText) infoText += " | ";
                infoText += `${materia.anio}° Año`;
            }
            if (materia.categoria) {
                if (infoText) infoText += " | ";
                infoText += materia.categoria.charAt(0).toUpperCase() + materia.categoria.slice(1);
            }
            if (infoText) {
                infoSpan.innerText = infoText;
                infoSpan.className = "anio-tag";
            } else {
                infoSpan = null;
            }
        }
    }

    // create a right-aligned container for progress and buttons
    const rightGroup = document.createElement("div");
    rightGroup.className = "right-group";

    // Preparar elementos de progreso si aplica
    let faltaSpan = null;
    let emoji = null;
    let progSpan = null;
    
    if (progreso && (id === "noPuedeCursar" || id.startsWith("noPuedeCursar-"))) {
        const { cumplidos, total, faltante } = progreso;
        if (faltante) {
            faltaSpan = document.createElement("span");
            faltaSpan.innerText = `Falta: ${faltante}`;
            faltaSpan.className = "falta";

            emoji = document.createElement("span");
            emoji.innerText = "🟡";
            emoji.className = "progress-emoji";
        }
        progSpan = document.createElement("span");
        progSpan.innerText = `(${cumplidos}/${total})`;
        progSpan.className = "progress";
    }

    // Se tiver código → adiciona botões de controle dentro do rightGroup
    if (codigo) {
        // decidir quais botões incluir segundo o id da lista
        const showAprobada = (id === "puedeCursar" || id.startsWith("puedeCursar-") || id.startsWith("puedeFinal") || id.startsWith("noPuedeFinal"));
        const showRegularizada = (id === "aprobadas" || id === "puedeCursar" || id.startsWith("puedeCursar-"));
        const showReset = (id === "aprobadas" || id.startsWith("puedeFinal") || id.startsWith("noPuedeFinal"));
        
        if (showAprobada) {
            const btnAprobada = document.createElement("button");
            btnAprobada.innerText = "✅";
            btnAprobada.onclick = () => {
                estados[codigo] = "aprobada";
                guardarLocalYRender();
            };
            rightGroup.appendChild(btnAprobada);
        }

        if (showRegularizada) {
            const btnRegularizada = document.createElement("button");
            btnRegularizada.innerText = "🟨";
            btnRegularizada.onclick = () => {
                estados[codigo] = "regularizada";
                guardarLocalYRender();
            };
            rightGroup.appendChild(btnRegularizada);
        }

        if (showReset) {
            const btnReset = document.createElement("button");
            btnReset.innerText = "🔄";
            btnReset.onclick = () => {
                delete estados[codigo];
                guardarLocalYRender();
            };
            rightGroup.appendChild(btnReset);
        }
    }

    // Agregar elementos en orden diferente según el contexto
    if (id === "no puede cursar" || id.startsWith("no puede cursar-")) {
        // Para "no puede cursar": criar container para linha 2
        const infoRow = document.createElement("div");
        infoRow.className = "info-row";
        
        // Primero el progress (a la izquierda)
        if (progSpan) {
            infoRow.appendChild(progSpan);
            
            if (progreso.faltantes && progreso.faltantes.length > 0) {
                const btnWarn = document.createElement("button");
                btnWarn.innerText = "⚠";
                btnWarn.className = "btn-warning-faltantes";
                btnWarn.title = "Ver materias faltantes";
                btnWarn.onclick = (e) => {
                    e.stopPropagation();
                    mostrarPopupFaltantes(texto, progreso.faltantes);
                };
                infoRow.appendChild(btnWarn);
            }
        }
        if (faltaSpan) {
            infoRow.appendChild(faltaSpan);
        }
        if (emoji) {
            infoRow.appendChild(emoji);
        }
        if (infoSpan) {
            infoRow.appendChild(infoSpan);
        }
        
        li.appendChild(infoRow);
        
        if (rightGroup.children.length > 0) {
            li.appendChild(rightGroup);
        }
    } else {
        // Para otros: Año/Categoria → botones
        
        // Agregar fechas de finales para puedeFinal, no puedeFinal y puedeCursar-optativas
        let fechasSpan = null;
        let btnCalendario = null;
        const esRegularizada = id === "puedeFinal" || id === "no puedeFinal";
        const esPuedeCursarOptativa = id === "puedeCursar-optativas";
        
        if (codigo && (esRegularizada || esPuedeCursarOptativa)) {
            const tieneDatos = fechasFinales[codigo] && fechasFinales[codigo].length > 0;
            const tieneOpcionLibre = tieneDatos && fechasFinales[codigo].some(e => e.esLibre);
            
            // En puedeCursar-optativas: solo mostrar si tiene opción Libre
            if (esPuedeCursarOptativa && !tieneOpcionLibre) {
                // No mostrar nada
            } else {
                const proximas = obtenerProximasFechas(codigo, esPuedeCursarOptativa);
                const catedraSel = catedrasSeleccionadas[codigo];
                const esOptativa = materia && materia.categoria === "optativa";
                
                if (proximas && proximas.length > 0) {
                    let textoFechas = esRegularizada ? "Finales: " : "Próxima final libre: ";
                    
                    if (esRegularizada && catedraSel && materia) {
                        textoFechas = materia.nombre + " - " + catedraSel + ": ";
                    }
                    
                    textoFechas += proximas.map(f => formatearFechaDMA(f.fecha)).join(", ");
                    
                    fechasSpan = document.createElement("span");
                    fechasSpan.innerText = textoFechas;
                    fechasSpan.className = "fechas-proximas";
                    
                    if (proximas[0].diffDias < 4) {
                        fechasSpan.classList.add("urgente");
                    }
                } else if (tieneDatos) {
                    fechasSpan = document.createElement("span");
                    fechasSpan.innerText = "Próximas Finales: sin fechas previstas";
                    fechasSpan.className = "fechas-proximas";
                }
                
                if (fechasSpan || tieneDatos) {
                    btnCalendario = document.createElement("button");
                    btnCalendario.innerText = "🗓";
                    btnCalendario.className = "btn-calendario";
                    btnCalendario.title = "Ver todas las fechas";
                    btnCalendario.onclick = (e) => {
                        e.stopPropagation();
                        console.log('Botão clicado, codigo:', codigo, 'fechasFinales:', fechasFinales[codigo]);
                        mostrarPopupFechas(codigo, texto);
                    };
                } else if (codigo && fechasFinales[codigo] && fechasFinales[codigo].length > 0) {
                    console.log('Fallback acionado para:', codigo, 'datos:', fechasFinales[codigo]);
                    // Fallback: se tem datos pero no se mostró nada, igualmente mostrar botão
                    btnCalendario = document.createElement("button");
                    btnCalendario.innerText = "🗓";
                    btnCalendario.className = "btn-calendario";
                    btnCalendario.title = "Ver todas las fechas";
                    btnCalendario.onclick = (e) => {
                        e.stopPropagation();
                        mostrarPopupFechas(codigo, texto);
                    };
                }
            }
        }
        
        // Agregar fechas antes del infoSpan (lado izquierdo)
        if (fechasSpan || btnCalendario) {
            if (btnCalendario) {
                li.appendChild(btnCalendario);
            }
            if (fechasSpan) {
                li.appendChild(fechasSpan);
            }
        }
        
        if (infoSpan) {
            li.appendChild(infoSpan);
        }
        if (rightGroup.children.length > 0) {
            li.appendChild(rightGroup);
        }
    }

    document.getElementById(id).appendChild(li);
}

function limpiarListas() {

    [
        "aprobadas",
        "puedeCursar",
        "puedeCursar-obligatorias",
        "puedeCursar-optativas",
        "noPuedeCursar",
        "noPuedeCursar-obligatorias",
        "noPuedeCursar-optativas",
        "puedeFinal",
        "noPuedeFinal",
        "proyectosExtension"
    ].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });
}

// ===============================
// COLAPSAR BOXES
// ===============================

function toggleBox(titleElement) {

    const box = titleElement.closest(".box");
    const content = box.querySelector(".box-content");

    const isCollapsed = content.classList.contains("collapsed");

    if (isCollapsed) {
        content.classList.remove("collapsed");
        titleElement.innerHTML = titleElement.innerHTML.replace("▸", "▾");
    } else {
        content.classList.add("collapsed");
        titleElement.innerHTML = titleElement.innerHTML.replace("▾", "▸");
    }
}

function toggleSubsection(headerElement) {

    const subContent = headerElement.nextElementSibling;
    
    if (!subContent || !subContent.classList.contains("sub-content")) {
        return;
    }

    const isCollapsed = subContent.classList.contains("collapsed");

    if (isCollapsed) {
        subContent.classList.remove("collapsed");
        headerElement.innerText = headerElement.innerText.replace("▸", "▾");
    } else {
        subContent.classList.add("collapsed");
        headerElement.innerText = headerElement.innerText.replace("▾", "▸");
    }
}

// ===============================
// INICIALIZAR
// ===============================

cargarFechasFinales().then(() => {
    render();
});

// Check if first time
if (!localStorage.getItem("hasSeenHelp")) {
    showHelpModal();
    localStorage.setItem("hasSeenHelp", "true");
}

function showHelpModal() {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.onclick = () => document.body.removeChild(overlay);

    const modal = document.createElement("div");
    modal.className = "modal-content";
    modal.onclick = (e) => e.stopPropagation();

    const btnX = document.createElement("button");
    btnX.innerText = "×";
    btnX.className = "modal-close-x";
    btnX.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnX);

    const title = document.createElement("h3");
    title.innerText = "¿Cómo usar este sitio?";
    modal.appendChild(title);

    const list = document.createElement("ul");
    
    const items = [
        "Los iconos ✅🟨🔄 son botones y sirven para marcar el estado de cada materia.",
        "✅ <b>Aprobada</b>: Ya rendiste el final y aprobaste la materia.",
        "🟨 <b>Cursada</b>: Tiene la cursada aprobada pero te falta rendir el final.",
        "🔄 <b>Resetear</b>: Quita el estado de la materia si la marcaste mal.",
        "⚠ <b>Info</b>: Haz clic para ver qué requisitos te faltan para cursar o rendir final.",
        "🗓 <b>Fechas de Final</b>: En materias regularizadas y optativas, muestra las próximas fechas de examen. Haz clic para ver todas las fechas y seleccionar una cátedra específica.",
        "Para optativas en 'Puede Cursar', solo se muestran las fechas de final libre."
    ];

    items.forEach(text => {
        const li = document.createElement("li");
        li.innerHTML = text;
        li.style.background = "transparent";
        li.style.borderBottom = "1px solid #222";
        li.style.padding = "12px 0";
        list.appendChild(li);
    });
    modal.appendChild(list);

    const btnCerrar = document.createElement("button");
    btnCerrar.innerText = "¡ENTENDIDO!";
    btnCerrar.style.width = "100%";
    btnCerrar.style.marginTop = "15px";
    btnCerrar.style.padding = "10px";
    btnCerrar.style.backgroundColor = "#22d3ee";
    btnCerrar.style.color = "#000";
    btnCerrar.style.fontWeight = "bold";
    btnCerrar.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnCerrar);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

function actualizarHorasOptativas() {
    const horas = calcularHorasOptativas();
    const el = document.getElementById("horasOptativas");
    if (el) el.innerText = horas;
}

// ===============================
// POPUP MATERIAS FALTANTES
// ===============================

function mostrarPopupFaltantes(materiaNombre, faltantes) {
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.onclick = () => document.body.removeChild(overlay);

    const modal = document.createElement("div");
    modal.className = "modal-content";
    modal.onclick = (e) => e.stopPropagation();

    const btnX = document.createElement("button");
    btnX.innerText = "×";
    btnX.className = "modal-close-x";
    btnX.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnX);

    const title = document.createElement("h3");
    title.innerText = "Requisitos faltantes para:";
    modal.appendChild(title);

    const subtitle = document.createElement("h2");
    subtitle.innerText = materiaNombre;
    subtitle.style.fontSize = "18px";
    subtitle.style.marginBottom = "15px";
    subtitle.style.color = "#fff";
    modal.appendChild(subtitle);

    const list = document.createElement("ul");
    list.style.maxHeight = "300px";
    list.style.overflowY = "auto";
    
    faltantes.sort().forEach(faltante => {
        const li = document.createElement("li");
        li.innerText = "• " + faltante;
        li.style.background = "transparent";
        li.style.borderBottom = "1px solid #222";
        li.style.borderRadius = "0";
        list.appendChild(li);
    });
    modal.appendChild(list);

    const btnCerrar = document.createElement("button");
    btnCerrar.innerText = "Cerrar";
    btnCerrar.className = "btn-primary";
    btnCerrar.style.width = "100%";
    btnCerrar.style.marginTop = "15px";
    btnCerrar.style.padding = "12px";
    btnCerrar.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnCerrar);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

// ===============================
// POPUP FECHAS DE FINALES
// ===============================

function mostrarPopupFechas(codigo, nombreMateria) {
    const entradas = fechasFinales[codigo];
    if (!entradas || entradas.length === 0) {
        alert('No hay datos para: ' + codigo);
        return;
    }
    
    // Usar datos directamente sin filtro para el popup
    const todasFechas = [];
    entradas.forEach(entrada => {
        entrada.fechas.forEach(f => {
            todasFechas.push({
                fecha: f.fecha,
                label: f.label,
                catedra: entrada.catedra,
                esLibre: entrada.esLibre,
                nombreCompleto: entrada.nombreCompleto
            });
        });
    });
    
    if (todasFechas.length === 0) {
        alert('No hay fechas para: ' + codigo);
        return;
    }
    
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0);
    todasFechas.sort((a, b) => a.fecha - b.fecha);
    
    const proximas = [];
    const anteriores = [];
    for (let f of todasFechas) {
        if (f.fecha >= ahora) {
            proximas.push(f);
        } else {
            anteriores.push(f);
        }
    }
    
    const datos = { proximas, anteriores };
    
    const tieneCatedras = catedrasData[codigo] && catedrasData[codigo].tieneCatedras;
    
    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";
    overlay.onclick = () => document.body.removeChild(overlay);

    const modal = document.createElement("div");
    modal.className = "modal-content";
    modal.onclick = (e) => e.stopPropagation();

    const btnX = document.createElement("button");
    btnX.innerText = "×";
    btnX.className = "modal-close-x";
    btnX.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnX);

    const title = document.createElement("h3");
    title.innerText = "Fechas de Final";
    modal.appendChild(title);

    const subtitle = document.createElement("h2");
    subtitle.innerText = nombreMateria;
    subtitle.style.fontSize = "18px";
    subtitle.style.marginBottom = "15px";
    subtitle.style.color = "#fff";
    modal.appendChild(subtitle);

    if (tieneCatedras) {
        const selectCatedra = document.createElement("select");
        selectCatedra.className = "catedra-select";
        
        catedrasData[codigo].catedras.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat;
            option.textContent = cat === 'Regular' ? 'Cátedra Regular' : `Cátedra ${cat}`;
            selectCatedra.appendChild(option);
        });
        
        // Definir valor primeiro
        if (catedrasSeleccionadas[codigo]) {
            selectCatedra.value = catedrasSeleccionadas[codigo];
        }
        
        modal.appendChild(selectCatedra);
        
        selectCatedra.onchange = () => {
            const catedraSeleccionada = selectCatedra.value;
            guardarCatedraSeleccionada(codigo, catedraSeleccionada);
            render();
            const container = modal.querySelector('.fechas-container');
            if (container) {
                actualizarFechasPopup(modal, codigo, nombreMateria, catedraSeleccionada);
            }
        };
    }

    const containerFechas = document.createElement("div");
    containerFechas.className = "fechas-container";
    modal.appendChild(containerFechas);

    // Definir função antes de chamar
    const actualizarFechasPopup = (modalEl, cod, nomMateria, catedraSel) => {
        const container = modalEl.querySelector('.fechas-container');
        if (!container) return;
        container.innerHTML = '';
        
        let fechasFiltradas = { proximas: [], anteriores: [] };
        
        if (catedraSel && catedraSel !== 'Regular') {
            const entrada = fechasFinales[cod].find(e => e.catedra === catedraSel);
            if (entrada) {
                const ahora = new Date();
                ahora.setHours(0, 0, 0, 0);
                
                entrada.fechas.forEach(f => {
                    if (f.fecha >= ahora) {
                        fechasFiltradas.proximas.push(f);
                    } else {
                        fechasFiltradas.anteriores.push(f);
                    }
                });
                
                fechasFiltradas.proximas.sort((a, b) => b.fecha - a.fecha);
                fechasFiltradas.anteriores.sort((a, b) => b.fecha - a.fecha);
            }
        } else {
            fechasFiltradas = datos;
        }
        
        if (fechasFiltradas.proximas.length > 0) {
            const h4Prox = document.createElement("h4");
            h4Prox.innerText = "Próximas";
            h4Prox.className = "fechas-section-title";
            container.appendChild(h4Prox);
            
            const ulProx = document.createElement("ul");
            fechasFiltradas.proximas.forEach(f => {
                const li = document.createElement("li");
                li.style.background = "transparent";
                li.style.borderBottom = "1px solid #222";
                li.style.borderRadius = "0";
                
                const fechaSpan = document.createElement("span");
                fechaSpan.innerText = formatearFechaDMA(f.fecha);
                fechaSpan.className = "fecha-item";
                
                const labelSpan = document.createElement("span");
                labelSpan.innerText = ` (${f.label})`;
                labelSpan.style.color = "#999";
                labelSpan.style.fontSize = "12px";
                
                li.appendChild(fechaSpan);
                li.appendChild(labelSpan);
                ulProx.appendChild(li);
            });
            container.appendChild(ulProx);
        }
        
        if (fechasFiltradas.anteriores.length > 0) {
            const h4Ant = document.createElement("h4");
            h4Ant.innerText = "Anteriores";
            h4Ant.className = "fechas-section-title";
            container.appendChild(h4Ant);
            
            const ulAnt = document.createElement("ul");
            fechasFiltradas.anteriores.forEach(f => {
                const li = document.createElement("li");
                li.style.background = "transparent";
                li.style.borderBottom = "1px solid #222";
                li.style.borderRadius = "0";
                li.style.color = "#777";
                
                const fechaSpan = document.createElement("span");
                fechaSpan.innerText = formatearFechaDMA(f.fecha);
                fechaSpan.className = "fecha-item-anterior";
                
                const labelSpan = document.createElement("span");
                labelSpan.innerText = ` (${f.label})`;
                labelSpan.style.color = "#555";
                labelSpan.style.fontSize = "12px";
                
                li.appendChild(fechaSpan);
                li.appendChild(labelSpan);
                ulAnt.appendChild(li);
            });
            container.appendChild(ulAnt);
        }
    };

    if (tieneCatedras) {
        const catedraInicial = catedrasSeleccionadas[codigo] || catedrasData[codigo].catedras[0];
        actualizarFechasPopup(modal, codigo, nombreMateria, catedraInicial);
    } else {
        actualizarFechasPopup(modal, codigo, nombreMateria, null);
    }

    const btnCerrar = document.createElement("button");
    btnCerrar.innerText = "Cerrar";
    btnCerrar.className = "btn-primary";
    btnCerrar.style.width = "100%";
    btnCerrar.style.marginTop = "15px";
    btnCerrar.style.padding = "12px";
    btnCerrar.onclick = () => document.body.removeChild(overlay);
    modal.appendChild(btnCerrar);

    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}