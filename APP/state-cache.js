// ===============================
// STATE CACHE — Shared across all pages
// Avoids repeated JSON.parse of localStorage
// ===============================

// One-time migration: legacy `cursando` key { code: true } → `estados[code] = 'cursando'`.
// Explicit estado (aprobada/regularizada) always wins; legacy entries are dropped afterwards.
(function migrateLegacyCursando() {
    try {
        var legacyRaw = localStorage.getItem('cursando');
        if (legacyRaw === null) return;
        var legacy = JSON.parse(legacyRaw || '{}');
        var estados = JSON.parse(localStorage.getItem('estados') || '{}');
        var changed = false;
        for (var k in legacy) {
            if (legacy[k] === true && !estados[k]) {
                estados[k] = 'cursando';
                changed = true;
            }
        }
        if (changed) localStorage.setItem('estados', JSON.stringify(estados));
        localStorage.removeItem('cursando');
    } catch (e) {}
})();

var _stateCache = { estados: null, optativasFavoritas: null };

function getCachedState(key) {
    if (_stateCache[key] === null || _stateCache[key] === undefined) {
        try { _stateCache[key] = JSON.parse(localStorage.getItem(key) || '{}'); }
        catch(e) { _stateCache[key] = {}; }
    }
    return _stateCache[key];
}

function invalidateStateCache(key) { _stateCache[key] = null; }

// Cross-tab sync: re-read localStorage when tab regains focus
window.addEventListener('focus', function() {
    invalidateStateCache('estados');
    invalidateStateCache('optativasFavoritas');
});
