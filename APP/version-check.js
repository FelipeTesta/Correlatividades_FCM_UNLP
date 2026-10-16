// Version auto-reload check — shared by every page of the app
(function(){
  var KEY = 'lastVersion';
  var LOOP_KEY = 'lastReloadAttempt';
  var banner = document.getElementById('privacyBanner');
  function showBanner(){ if(banner) banner.style.display='flex'; }

  // Hardening: never trigger a reload we cannot remember.
  // With storage unavailable (private mode, blocked site data, opaque origin)
  // `lastVersion` can never be written, so the version check would reload in a
  // loop — that made the privacy banner appear and vanish on its own.
  var canStore = false;
  try {
    localStorage.setItem('__vc_probe', '1');
    localStorage.removeItem('__vc_probe');
    canStore = true;
  } catch (e) { canStore = false; }
  if (!canStore || location.protocol === 'file:') { showBanner(); return; }

  fetch('version.json?' + Date.now())
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.version) { showBanner(); return; }
      var last = null;
      try { last = localStorage.getItem(KEY); } catch(e) {}
      if (last !== data.version) {
        var now = Date.now();
        var lastAttempt = 0;
        try { lastAttempt = parseInt(localStorage.getItem(LOOP_KEY)) || 0; } catch(e) {}
        if (now - lastAttempt < 3000) { showBanner(); return; }
        try {
          localStorage.setItem(KEY, data.version);
          localStorage.setItem(LOOP_KEY, String(now));
        } catch(e) { showBanner(); return; }
        location.reload();
        return; // do not flash the banner while the page is about to reload
      }
      showBanner();
    })
    .catch(function(){ showBanner(); });
})();