// ===============================
// INCLUIR: % concluido, optativas
// ===============================
// ===============================
// ===============================
// BASE LOCAL
// ===============================

let estados = JSON.parse(localStorage.getItem("estados")) || {};
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
// VERIFICACIONES
// ===============================

function cumpleRequisitos(lista) {

    for (let req of lista) {
        const estadoMateria = estados[req.materia];

        if (req.condicion === "aprobada") {
            if (estadoMateria !== "aprobada") return false;
        }

        if (req.condicion === "regularizada") {
            if (!estadoMateria) return false;
        }
    }

    return true;
}

// ===============================
// RENDER
// ===============================

function render() {

    limpiarListas();

    if (!materias) return;

    materias.forEach(m => {

        const estado = estados[m.codigo];

        if (estado === "aprobada") {
            agregar("aprobadas", m.nombre, m.codigo);
            return;
        }

        if (estado === "regularizada") {

            if (cumpleRequisitos(m.paraAprobar)) {
                agregar("puedeFinal", m.nombre, m.codigo);
            } else {
                agregar("noPuedeFinal", m.nombre, m.codigo);
            }

            return;
        }

        // SIN ESTADO
        if (cumpleRequisitos(m.paraCursar)) {
            agregar("puedeCursar", m.nombre, m.codigo);
        } else {
            agregar("noPuedeCursar", m.nombre, m.codigo);
        }

    });
}

// ===============================
// UTILIDADES
// ===============================

function agregar(id, texto, codigo = null) {

    const li = document.createElement("li");

    const span = document.createElement("span");
    span.innerText = texto;
    li.appendChild(span);

    // Se tiver código → adiciona botões de controle
    if (codigo) {

        const btnAprobada = document.createElement("button");
        btnAprobada.innerText = "✅";
        btnAprobada.onclick = () => {
            estados[codigo] = "aprobada";
            guardarLocalYRender();
        };

        const btnRegularizada = document.createElement("button");
        btnRegularizada.innerText = "🟨";
        btnRegularizada.onclick = () => {
            estados[codigo] = "regularizada";
            guardarLocalYRender();
        };

        const btnReset = document.createElement("button");
        btnReset.innerText = "🔄";
        btnReset.onclick = () => {
            delete estados[codigo];
            guardarLocalYRender();
        };

        li.appendChild(btnAprobada);
        li.appendChild(btnRegularizada);
        li.appendChild(btnReset);
    }

    document.getElementById(id).appendChild(li);
}

function limpiarListas() {

    [
        "aprobadas",
        "puedeCursar",
        "noPuedeCursar",
        "puedeFinal",
        "noPuedeFinal"
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

// ===============================
// INICIALIZAR
// ===============================

render();