// ===============================
// STATE CACHE — Shared across all pages
// Avoids repeated JSON.parse of localStorage
// ===============================

var _stateCache = { estados: null, cursando: null, optativasFavoritas: null };

function getCachedState(key) {
    if (_stateCache[key] === null) {
        try { _stateCache[key] = JSON.parse(localStorage.getItem(key) || '{}'); }
        catch(e) { _stateCache[key] = {}; }
    }
    return _stateCache[key];
}

function invalidateStateCache(key) { _stateCache[key] = null; }

// Cross-tab sync: re-read localStorage when tab regains focus
window.addEventListener('focus', function() {
    invalidateStateCache('estados');
    invalidateStateCache('cursando');
    invalidateStateCache('optativasFavoritas');
});