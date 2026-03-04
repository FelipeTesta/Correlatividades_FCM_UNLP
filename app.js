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

    materias.forEach(m => {

        const estado = estados[m.codigo];

        if (estado === "aprobada") {
            agregar("aprobadas", m.nombre);
            return;
        }

        if (estado === "regularizada") {
            agregar("regularizadas", m.nombre);

            if (cumpleRequisitos(m.paraAprobar)) {
                agregar("puedeFinal", m.nombre);
            } else {
                agregar("noPuedeFinal", m.nombre);
            }

            return;
        }

        // SIN ESTADO
        if (cumpleRequisitos(m.paraCursar)) {
            agregar("puedeCursar", m.nombre);
        } else {
            agregar("noPuedeCursar", m.nombre);
        }

    });

}

// ===============================
// UTILIDADES
// ===============================

function agregar(id, texto) {
    const li = document.createElement("li");
    li.innerText = texto;
    document.getElementById(id).appendChild(li);
}

function limpiarListas() {
    [
        "aprobadas",
        "regularizadas",
        "puedeCursar",
        "noPuedeCursar",
        "puedeFinal",
        "noPuedeFinal"
    ].forEach(id => {
        document.getElementById(id).innerHTML = "";
    });
}

// ===============================
// CARGAR SELECT
// ===============================

function cargarSelect() {
    const select = document.getElementById("materiaSelect");

    materias
        .sort((a,b) => a.anio - b.anio)
        .forEach(m => {
            const option = document.createElement("option");
            option.value = m.codigo;
            option.text = m.nombre;
            select.appendChild(option);
        });
}

// ===============================
// INICIALIZAR
// ===============================

cargarSelect();
render();