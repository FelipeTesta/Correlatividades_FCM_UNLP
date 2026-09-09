// ===============================
// REQUISITOS — Shared prerequisite logic
// Used by both app.js (main page) and arbol.js (tree view)
// ===============================

/**
 * Check if all prerequisites in a list are met.
 * @param {Array} lista - array of { materia, condicion }
// * @param {Object} [materia] - optional subject object (for optativa year check)
// * @returns {boolean}
 */
function cumpleRequisitos(lista, materia) {
    // Verificar año de matrícula para optativas
    if (materia && materia.categoria === "optativa" && materia.anio) {
        var aniosMatricula = new Date().getFullYear() - anioIngreso + 1;
        if (aniosMatricula < materia.anio) {
            return false;
        }
    }

    if (!lista || lista.length === 0) return true;

    for (var i = 0; i < lista.length; i++) {
        if (!verificarRequisito(lista[i])) return false;
    }
    return true;
}

/**
 * Check if a single prerequisite is met.
 * @param {Object} req - { materia, condicion }
// * @returns {boolean}
 */
function verificarRequisito(req) {
    // Special prerequisite: optativa hours
    if (req.materia === "OPT-HORAS") {
        var horas = calcularHorasOptativas();
        if (req.condicion === ">=270") return horas >= 270;
        return false;
    }
    var estadoMateria = estados[req.materia];
    if (req.condicion === "aprobada") return estadoMateria === "aprobada";
    if (req.condicion === "regularizada") return !!estadoMateria;
    return false;
}

/**
 * Calculate total approved optativa hours + extension project hours.
// * @returns {number}
 */
function calcularHorasOptativas() {
    var horas = 0;
    for (var i = 0; i < materias.length; i++) {
        var m = materias[i];
        if (m.categoria === "optativa" && m.horas && estados[m.codigo] === "aprobada") {
            horas += m.horas;
        }
    }
    // sumar horas de proyectos de extensión
    if (typeof proyectosExtension !== 'undefined') {
        for (var j = 0; j < proyectosExtension.length; j++) {
            horas += proyectosExtension[j].horas;
        }
    }
    return horas;
}