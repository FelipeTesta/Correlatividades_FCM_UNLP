// Version auto-reload check — shared by index.html, arbol.html, cartelera.html
(function(){
  var KEY = 'lastVersion';
  var LOOP_KEY = 'lastReloadAttempt';
  var banner = document.getElementById('privacyBanner');
  fetch('version.json?' + Date.now())
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(data){
      if (!data || !data.version) { if(banner) banner.style.display='flex'; return; }
      var last = null;
      try { last = localStorage.getItem(KEY); } catch(e) {}
      if (last !== data.version) {
        var now = Date.now();
        var lastAttempt = 0;
        try { lastAttempt = parseInt(localStorage.getItem(LOOP_KEY)) || 0; } catch(e) {}
        if (now - lastAttempt < 3000) { if(banner) banner.style.display='flex'; return; }
        try { localStorage.setItem(KEY, data.version); } catch(e) {}
        try { localStorage.setItem(LOOP_KEY, String(now)); } catch(e) {}
        location.reload(true);
      }
      if(banner) banner.style.display='flex';
    })
    .catch(function(){ if(banner) banner.style.display='flex'; });
})();