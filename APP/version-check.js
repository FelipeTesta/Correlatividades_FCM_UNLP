// Version auto-reload check — shared by every page of the app.
// NOTE: the privacy banner (#privacyBanner) is visible by DEFAULT in the markup
// of every page — this script never touches it (user decision, 2026-10-16:
// the notice must not depend on localStorage in any way).
(function(){
  var KEY = 'lastVersion';
  var LOOP_KEY = 'lastReloadAttempt';

  // Without storage we could never remember the version seen, so any reload
  // would loop forever. There is nothing this script can do then — the banner
  // does not depend on it, so we just stop.
  var canStore = false;
  try {
    localStorage.setItem('__vc_probe', '1');
    localStorage.removeItem('__vc_probe');
    canStore = true;
  } catch (e) { canStore = false; }
  if (!canStore || location.protocol === 'file:') return;

  fetch('version.json?' + Date.now())
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.version) return;
      var last = null;
      try { last = localStorage.getItem(KEY); } catch(e) {}
      if (last !== data.version) {
        var now = Date.now();
        var lastAttempt = 0;
        try { lastAttempt = parseInt(localStorage.getItem(LOOP_KEY)) || 0; } catch(e) {}
        if (now - lastAttempt < 3000) return; // reload cooldown: never loop
        try {
          localStorage.setItem(KEY, data.version);
          localStorage.setItem(LOOP_KEY, String(now));
        } catch(e) { return; }
        location.reload(); // new deploy detected — refresh once, silently
      }
    })
    .catch(function(){ /* version check is best-effort only */ });
})();
