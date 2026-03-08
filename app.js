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
        const aniosMatricula = new Date().getFullYear() - anioIngreso;
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
                agregar("noPuedeFinal", m.nombre, m.codigo);
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
            const progreso = calcularProgresoParaCursar(m);
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
    aprobadas += Math.min(horasOptativas, 270); // contar solo hasta 270 horas
    
    // calcular porcentajes
    const pctAprobadas = total > 0 ? (aprobadas / total) * 100 : 0;
    const pctRegularizadas = total > 0 ? (regularizadas / total) * 100 : 0;
    const pctPuedeCursar = total > 0 ? (puedeCursar / total) * 100 : 0;
    const pctTotal = ((aprobadas + regularizadas + puedeCursar) / total) * 100;
    
    // actualizar texto
    document.getElementById("materiasCount").innerText = `Materias: ${obligatorias.filter(m => estados[m.codigo] === "aprobada").length} (Aprobadas) / ${obligatorias.length} (Totales) | Optativas: ${Math.min(horasOptativas, 270)}/270h`;
    
    // actualizar segmentos de barra
    const segAprobadas = document.getElementById("segmentAprobadas");
    const segRegularizadas = document.getElementById("segmentRegularizadas");
    const segPuedeCursar = document.getElementById("segmentPuedeCursar");
    
    segAprobadas.style.width = pctAprobadas + "%";
    segRegularizadas.style.width = pctRegularizadas + "%";
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

function calcularProgresoParaCursar(materia) {
    const requisitosTransitivos = resolverRequisitosTransitivos(materia.paraCursar);
    let total = requisitosTransitivos.length;
    
    // Agregar verificación de año de matrícula para optativas
    let requiereAnioMatricula = false;
    if (materia.categoria === "optativa" && materia.anio) {
        const aniosMatricula = new Date().getFullYear() - anioIngreso;
        if (aniosMatricula < materia.anio) {
            requiereAnioMatricula = true;
            total += 1;
        }
    }
    
    if (total === 0 && !requiereAnioMatricula) return null;
    let cumplidos = 0;
    let faltanteNombre = null;
    
    for (let req of requisitosTransitivos) {
        const estadoMateria = estados[req.materia];
        const condicionCumple = req.condicion === "aprobada"
            ? estadoMateria === "aprobada"
            : /* regularizada */ !!estadoMateria;
        if (condicionCumple) {
            cumplidos++;
        } else if (!faltanteNombre) {
            // primera materia que no cumple
            const m = materias.find(x => x.codigo === req.materia);
            faltanteNombre = m ? m.nombre : req.materia;
        }
    }
    
    // Verificar año de matrícula
    if (requiereAnioMatricula) {
        const aniosMatricula = new Date().getFullYear() - anioIngreso;
        if (aniosMatricula >= materia.anio) {
            cumplidos++;
        } else if (!faltanteNombre) {
            faltanteNombre = `${materia.anio}° Año de matrícula`;
        }
    }
    
    const faltantesCount = total - cumplidos;
    return { cumplidos, total, faltante: faltantesCount === 1 ? faltanteNombre : null };
}

function agregar(id, texto, codigo = null, progreso = null) {

    const li = document.createElement("li");

    // Para "no puede cursar": criar dois boxes separados
    if (progreso && (id === "noPuedeCursar" || id.startsWith("noPuedeCursar-"))) {
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
        
        li.appendChild(box1);
        li.appendChild(box2);
        
        document.getElementById(id).appendChild(li);
        return;
    }

    // Para otros casos: estructura original
    const span = document.createElement("span");
    span.innerText = texto;
    
    // aplicar clase para optativas
    if (codigo) {
        const materia = materias.find(m => m.codigo === codigo);
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
    if (id === "noPuedeCursar" || id.startsWith("noPuedeCursar-")) {
        // Para "no puede cursar": criar container para linha 2
        const infoRow = document.createElement("div");
        infoRow.className = "info-row";
        
        if (faltaSpan) {
            infoRow.appendChild(faltaSpan);
        }
        if (emoji) {
            infoRow.appendChild(emoji);
        }
        if (infoSpan) {
            infoRow.appendChild(infoSpan);
        }
        if (progSpan) {
            infoRow.appendChild(progSpan);
        }
        
        li.appendChild(infoRow);
        
        if (rightGroup.children.length > 0) {
            li.appendChild(rightGroup);
        }
    } else {
        // Para otros: Año/Categoria → botones
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
        titleElement.innerText = titleElement.innerText.replace("▸", "▾");
    } else {
        content.classList.add("collapsed");
        titleElement.innerText = titleElement.innerText.replace("▾", "▸");
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

render();

function actualizarHorasOptativas() {
    const horas = calcularHorasOptativas();
    const el = document.getElementById("horasOptativas");
    if (el) el.innerText = horas;
}