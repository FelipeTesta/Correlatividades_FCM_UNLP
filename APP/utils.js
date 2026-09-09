// ===============================
// UTILS — Shared utility functions
// ===============================

/**
 * Save a value to localStorage as JSON. Silently fails on quota/private browsing.
 * @param {string} key - localStorage key
 * @param {*} value - value to serialize (object, array, or primitive)
 */
function saveState(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) {}
}

/**
 * Read and parse a JSON value from localStorage.
 * @param {string} key - localStorage key
 * @param {*} fallback - default value if missing or parse error
 * @returns {*} parsed value or fallback
 */
function getLocalStorageJSON(key, fallback) {
    try {
        var raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
    } catch(e) {}
    return fallback;
}

/**
 * Format a Date object as "DD/MMM" (e.g. "15/ene").
 * @param {Date} fecha
 * @returns {string}
 */
function formatearFechaDMA(fecha) {
    var dia = fecha.getDate();
    var mes = fecha.getMonth();
    var meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    return dia + "/" + meses[mes];
}
