// ===============================
// ABBREVIATION — Shared subject name abbreviation system
// Medical student shorthand for long subject names
// ===============================

(function() {
    // Default config — pages can override ABBREVIATION_CONFIG before this script loads
    var config = (typeof ABBREVIATION_CONFIG !== 'undefined') ? ABBREVIATION_CONFIG : {
        storageKey: 'mainAbbreviateNames',
        targetSelector: 'body',
        extraClasses: []
    };

    var _abbreviateNames = (function() {
        var stored = localStorage.getItem(config.storageKey);
        return stored !== null ? stored === 'true' : true; // default ON
    })();

    function isAbbreviatingNames() { return _abbreviateNames; }

    function toggleAbbreviateNames() {
        _abbreviateNames = !_abbreviateNames;
        try { localStorage.setItem(config.storageKey, _abbreviateNames); } catch(e) {}
        updateAbbreviateModeClass();
        // Call page-specific update if available
        if (typeof onAbbreviationToggle === 'function') {
            onAbbreviationToggle();
        }
    }

    function updateAbbreviateModeClass() {
        var el = document.querySelector(config.targetSelector);
        if (el) {
            if (_abbreviateNames) {
                el.classList.add('abbreviated-mode');
                config.extraClasses.forEach(function(cls) { el.classList.add(cls); });
            } else {
                el.classList.remove('abbreviated-mode');
                config.extraClasses.forEach(function(cls) { el.classList.remove(cls); });
            }
        }
        var cb = document.getElementById('toggleAbbreviateNames');
        if (cb) cb.checked = _abbreviateNames;
    }

    // Expose to global scope
    window.isAbbreviatingNames = isAbbreviatingNames;
    window.toggleAbbreviateNames = toggleAbbreviateNames;
    window.updateAbbreviateModeClass = updateAbbreviateModeClass;

    // Apply on DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function() {
        updateAbbreviateModeClass();
    });
})();