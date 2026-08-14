/* ============================= */
/* CARTELERA - MAIN LOGIC       */
/* ============================= */
/* localStorage keys: carteleraCache(session), carteleraLeidas, carteleraCollapsed,
   carteleraFilterDays, carteleraCollapsedSubjects, carteleraNotifyEmail,
   carteleraSubscribedSubjects */

const CARTELERA_PROXY = "https://cartelera-proxy.felipestesta.workers.dev/";
const CARTELERA_BASE = "https://cartelera.med.unlp.edu.ar";
const CACHE_KEY = "carteleraCache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const CARTELERA_FALLBACK_CATEDRAS = {
  "SEM91": ["Medicina Interna A", "Medicina Interna B", "Medicina Interna C", "Medicina Interna D", "Medicina Interna E", "Medicina Interna F"],
  "P9001": ["Psiquiatría"],
  "HG001": ["Salud Pública"],
  "C2001": ["Cirugía B"],
  "BG008": ["Biología"],
  "BG013": ["Biología"],
  "EDS13": ["Educación para la Salud"],
  "PINV": ["Seminarios de Investigación Científica"]
};

const LEIDAS_KEY = "carteleraLeidas";
const COLLAPSED_KEY = "carteleraCollapsed";
const FILTER_DAYS_KEY = "carteleraFilterDays";
const COLLAPSED_SUBJECTS_KEY = "carteleraCollapsedSubjects";
const SUBSCRIBED_KEY = "carteleraSubscribedSubjects";

const HOME_KEY = "__HOME__";
const HOME_ID = "home";
const HOME_LABEL = "Avisos Generales de la Facultad";

// State
let currentDays = 90;
try {
  var saved = parseInt(localStorage.getItem(FILTER_DAYS_KEY), 10);
  if (saved && saved > 0) currentDays = saved;
} catch (e) {}
let currentMode = "subject"; // "subject" or "chrono"
let fetchedData = null; // { codigo: { catedraName, id, pubs: [...], error: null|string } }
let catedrasData = {}; // loaded from finales.json { CODE: { "CatedraName": [...] } }
var catedrasLoaded = false;

// Centralized filter UI highlight (buttons + custom days wrapper)
function syncFilterUI() {
  var matched = false;
  document.querySelectorAll(".filter-btn").forEach(function (b) {
    var d = parseInt(b.getAttribute("data-days"), 10);
    if (d === currentDays) {
      b.classList.add("active");
      b.setAttribute("aria-pressed", "true");
      matched = true;
    } else {
      b.classList.remove("active");
      b.setAttribute("aria-pressed", "false");
    }
  });
  var wrap = document.getElementById("daysWrap");
  if (wrap) {
    if (matched) {
      wrap.classList.remove("active");
    } else {
      wrap.classList.add("active");
    }
  }
}

// DOM refs
const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");
const selectorEl = document.getElementById("catedraSelector");

// =============================
// INIT
// =============================

document.addEventListener("DOMContentLoaded", function () {
  // Load finales.json for catedra resolution
  loadCatedrasData();

  // Attach event listeners
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      currentDays = parseInt(btn.getAttribute("data-days"), 10);
      var daysInput = document.getElementById("daysInput");
      if (daysInput) { daysInput.value = currentDays; }
      syncFilterUI();
      try { localStorage.setItem(FILTER_DAYS_KEY, String(currentDays)); } catch (e) {}
      if (fetchedData) {
        render();
      }
    });
  });

  // Custom days input: apply on change / Enter
  var daysInput = document.getElementById("daysInput");
  if (daysInput) {
    function applyDaysInput() {
      var val = parseInt(daysInput.value, 10);
      if (val && val > 0) {
        currentDays = val;
        try { localStorage.setItem(FILTER_DAYS_KEY, String(currentDays)); } catch (e) {}
        syncFilterUI();
        if (fetchedData) {
          render();
        }
      } else {
        daysInput.value = currentDays;
      }
    }
    daysInput.addEventListener("change", applyDaysInput);
    daysInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        applyDaysInput();
        daysInput.blur();
      }
    });
  }

  // Sync days input with persisted currentDays
  if (daysInput) { daysInput.value = currentDays; }

  // Highlight the filter button matching persisted currentDays (or custom wrap)
  syncFilterUI();

  document.querySelectorAll(".group-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".group-btn").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      currentMode = btn.getAttribute("data-mode");
      if (fetchedData) {
        render();
      }
    });
    var mode = btn.getAttribute("data-mode");
    if (mode === currentMode) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });

  document.getElementById("refreshBtn").addEventListener("click", function () {
    if (!catedrasLoaded) {
      setStatus("Cargando datos de materias, espera un momento...");
      return;
    }
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch (e) {
      // storage unavailable
    }
    fetchedData = null;
    resolveAndFetch();
  });

  var markAllBtn = document.getElementById("markAllBtn");
  if (markAllBtn) {
    markAllBtn.addEventListener("click", function () {
      marcarTodasLeidas();
    });
  }

  // Notify button
  var notifyBtn = document.getElementById("notifyBtn");
  if (notifyBtn) {
    notifyBtn.addEventListener("click", function () {
      openNotifyModal();
    });
  }

  // Subscribe extra button
  var subscribeBtn = document.getElementById("subscribeBtn");
  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", function () {
      openSubscribeModal();
    });
  }

  // Notify subscribe
  var notifySubscribeBtn = document.getElementById("notifySubscribeBtn");
  if (notifySubscribeBtn) {
    notifySubscribeBtn.addEventListener("click", function () {
      handleNotifySubscribe();
    });
  }

  // Notify close
  var notifyCloseBtn = document.getElementById("notifyCloseBtn");
  if (notifyCloseBtn) {
    notifyCloseBtn.addEventListener("click", function () {
      closeNotifyModal();
    });
  }

  // Hold-to-confirm unsubscribe button
  var unsubscribeBtn = document.getElementById("notifyUnsubscribeBtn");
  if (unsubscribeBtn) {
    var holdTimer = null;
    var touchInProgress = false;
    function startHold(e) {
      if (e.type === 'touchstart') {
        touchInProgress = true;
      } else if (touchInProgress) {
        return; // synthesized mousedown after touchend — ignore
      }
      e.preventDefault();
      unsubscribeBtn.classList.add("holding");
      holdTimer = setTimeout(function () {
        handleNotifyUnsubscribe();
        unsubscribeBtn.classList.remove("holding");
        touchInProgress = false;
      }, 1000);
    }
    function cancelHold() {
      if (holdTimer) {
        clearTimeout(holdTimer);
        holdTimer = null;
      }
      unsubscribeBtn.classList.remove("holding");
      if (touchInProgress) {
        setTimeout(function () { touchInProgress = false; }, 500);
      }
    }
    unsubscribeBtn.addEventListener("mousedown", startHold);
    unsubscribeBtn.addEventListener("touchstart", startHold, { passive: false });
    unsubscribeBtn.addEventListener("mouseup", cancelHold);
    unsubscribeBtn.addEventListener("mouseleave", cancelHold);
    unsubscribeBtn.addEventListener("touchend", cancelHold);
    unsubscribeBtn.addEventListener("touchcancel", cancelHold);
  }
});

function loadCatedrasData() {
  fetch("APP/finales/finales.json")
    .then(function (r) { return r.json(); })
    .then(function (data) {
      catedrasData = data;
      catedrasLoaded = true;
      // now kick off
      resolveAndFetch();
    })
    .catch(function () {
      setStatus("Error al cargar datos de materias. Intenta de nuevo.");
      // Still fetch home publications even if finales.json fails (e.g. file:// CORS)
      resolveAndFetch();
    });
}

// =============================
// STATE HELPERS
// =============================

function getCursandoCodes() {
  var raw;
  try {
    raw = localStorage.getItem("cursando");
  } catch (e) {
    return [];
  }
  if (!raw) return [];
  var obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    return [];
  }
  return Object.keys(obj).filter(function (code) {
    return obj[code] === true;
  });
}

function getRegularizadaCodes() {
  var raw;
  try {
    raw = localStorage.getItem("estados");
  } catch (e) {
    return [];
  }
  if (!raw) return [];
  var obj;
  try {
    obj = JSON.parse(raw);
  } catch (e) {
    return [];
  }
  return Object.keys(obj).filter(function (code) {
    return obj[code] === "regularizada";
  });
}

function getSubscribedCodes() {
  try {
    var raw = localStorage.getItem(SUBSCRIBED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return [];
}

function saveSubscribedCodes(codes) {
  var unique = [];
  var seen = {};
  (codes || []).forEach(function (c) {
    if (!seen[c]) { seen[c] = true; unique.push(c); }
  });
  try { localStorage.setItem(SUBSCRIBED_KEY, JSON.stringify(unique)); } catch (e) {}
}

function guardarCatedraSeleccionada(codigo, catedraName) {
  var seleccionadas = {};
  try {
    var raw = localStorage.getItem("catedrasSeleccionadas");
    if (raw) { seleccionadas = JSON.parse(raw); }
  } catch (e) {
    // fallback to empty
  }
  seleccionadas[codigo] = catedraName;
  try {
    localStorage.setItem("catedrasSeleccionadas", JSON.stringify(seleccionadas));
  } catch (e) {
    // storage unavailable
  }
}

function getCatedrasSeleccionadas() {
  try {
    var raw = localStorage.getItem("catedrasSeleccionadas");
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {};
}

function getLeidas() {
  try {
    var raw = localStorage.getItem(LEIDAS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function isLeida(link, currentModTimestamp) {
  if (!link) return false;
  var leidas = getLeidas();
  var entry = leidas[link];
  if (!entry) return false;
  // backward compat: old format was boolean true
  if (entry === true) return true;
  // new format: { read: true, mod: "DD/MM/YYYY HH:MM" }
  if (currentModTimestamp && entry.mod !== currentModTimestamp) return false;
  return entry.read === true;
}

function marcarLeida(link, modificadaTimestamp) {
  if (!link) return;
  var leidas = getLeidas();
  leidas[link] = { read: true, mod: modificadaTimestamp || null };
  try { localStorage.setItem(LEIDAS_KEY, JSON.stringify(leidas)); } catch (e) {}
  render();
}

function desmarcarLeida(link) {
  if (!link) return;
  var leidas = getLeidas();
  delete leidas[link];
  try { localStorage.setItem(LEIDAS_KEY, JSON.stringify(leidas)); } catch (e) {}
  render();
}

function allVisibleRead() {
  if (!fetchedData) return false;
  var cutoff = new Date(Date.now() - (currentDays + 3) * 24 * 60 * 60 * 1000);
  var leidas = getLeidas();
  var codes = Object.keys(fetchedData);
  for (var i = 0; i < codes.length; i++) {
    var entry = fetchedData[codes[i]];
    var pubs = entry.pubs || [];
    for (var j = 0; j < pubs.length; j++) {
      var pub = pubs[j];
      if ((pub.modificadaDate || pub.date) >= cutoff && pub.link) {
        var entryVal = leidas[pub.link];
        if (!entryVal) return false;
        if (entryVal === true) continue; // backward compat: old boolean
        if (!entryVal.read) return false;
      }
    }
  }
  return true;
}

function updateMarkAllBtn() {
  var markAllBtn = document.getElementById("markAllBtn");
  if (markAllBtn) {
    markAllBtn.textContent = allVisibleRead() ? "👁 todas no leídas" : "👁 todas leídas";
  }
}

function marcarTodasLeidas() {
  if (!fetchedData) return;
  var cutoff = new Date(Date.now() - (currentDays + 3) * 24 * 60 * 60 * 1000);
  var leidas = getLeidas();
  var codes = Object.keys(fetchedData);

  if (allVisibleRead()) {
    // All visible are read -> clear them
    codes.forEach(function (code) {
      var entry = fetchedData[code];
      (entry.pubs || []).forEach(function (pub) {
        if ((pub.modificadaDate || pub.date) >= cutoff && pub.link) {
          delete leidas[pub.link];
        }
      });
    });
  } else {
    // Mark all visible as read
    codes.forEach(function (code) {
      var entry = fetchedData[code];
      (entry.pubs || []).forEach(function (pub) {
        if ((pub.modificadaDate || pub.date) >= cutoff && pub.link) {
          var modTs = pub.modificadaDate ? formatDateTime(pub.modificadaDate) : null;
          leidas[pub.link] = { read: true, mod: modTs };
        }
      });
    });
  }
  try { localStorage.setItem(LEIDAS_KEY, JSON.stringify(leidas)); } catch (e) {}
  render();
}

function getCollapsed() {
  try {
    var raw = localStorage.getItem(COLLAPSED_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return {};
}

function isCollapsed(source) {
  return !!getCollapsed()[source];
}

function toggleCollapse(source) {
  var collapsed = getCollapsed();
  if (collapsed[source]) {
    delete collapsed[source];
  } else {
    collapsed[source] = true;
  }
  try { localStorage.setItem(COLLAPSED_KEY, JSON.stringify(collapsed)); } catch (e) {}
  render();
}

function getCollapsedSubjects() {
  try { return JSON.parse(localStorage.getItem(COLLAPSED_SUBJECTS_KEY) || "{}"); } catch (e) { return {}; }
}
function isSubjectCollapsed(codigo) {
  var c = getCollapsedSubjects();
  return !!c[codigo];
}
function toggleSubjectCollapse(codigo) {
  var c = getCollapsedSubjects();
  c[codigo] = !c[codigo];
  try { localStorage.setItem(COLLAPSED_SUBJECTS_KEY, JSON.stringify(c)); } catch (e) {}
  render();
}

function getSubjectName(codigo) {
  if (typeof materias !== "undefined" && Array.isArray(materias)) {
    for (var i = 0; i < materias.length; i++) {
      if (materias[i].codigo === codigo) return materias[i].nombre;
    }
  }
  return null;
}

// =============================
// CATEDRA RESOLUTION
// =============================

// =============================
// CATEDRA NAME NORMALIZATION
// =============================

// Hardcoded aliases for names that normalization can't resolve
// (normalized finales.json name → canonical CARTELERA_IDS key)
var CARTELERA_ALIASES = {
  "transplante de organos": "Trasplante de Órganos",
  "seminario en investigacion cientifica": "Seminarios de Investigación Científica"
};

var _CARTELERA_IDS_NORM = null;

// Normalize a catedra name for fuzzy matching:
// - en-dash/em-dash → hyphen
// - lowercase + strip accents (NFD)
// - remove commas/periods
// - strip "- Libre"/"- Regular"/"- LIBRES"/"- REGULARES" exam-type suffixes
// - collapse whitespace
function normalizeCatedraName(s) {
  if (!s) return "";
  return s
    .replace(/[\u2013\u2014]/g, "-")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[,\.]/g, "")
    .replace(/\s*-\s*(libre|regular|libres|regulares)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Resolve a catedra name (from finales.json or localStorage) to a cartelera ID.
// Tries: direct match → alias → normalized exact → normalized substring prefix.
// Returns the ID (number) or null if no match.
function resolveCatedraId(name) {
  if (!name) return null;
  // 1. Direct match
  if (CARTELERA_IDS[name]) return CARTELERA_IDS[name];
  var norm = normalizeCatedraName(name);
  if (!norm) return null;
  // 2. Alias (finales variant → canonical key)
  if (CARTELERA_ALIASES[norm] && CARTELERA_IDS[CARTELERA_ALIASES[norm]]) {
    return CARTELERA_IDS[CARTELERA_ALIASES[norm]];
  }
  // 3. Build normalized index lazily (once)
  if (!_CARTELERA_IDS_NORM) {
    _CARTELERA_IDS_NORM = {};
    Object.keys(CARTELERA_IDS).forEach(function (k) {
      _CARTELERA_IDS_NORM[normalizeCatedraName(k)] = CARTELERA_IDS[k];
    });
  }
  // 4. Normalized exact match
  if (_CARTELERA_IDS_NORM[norm]) return _CARTELERA_IDS_NORM[norm];
  // 5. Substring: finales name starts with a canonical key (min 10 chars to avoid false positives)
  //    Handles "Psiquiatría II"→"Psiquiatría", "Salud Pública II"→"Salud Pública",
  //    "Diagnóstico...II y Radiologia"→"Diagnóstico...Imágenes", etc.
  var keys = Object.keys(_CARTELERA_IDS_NORM);
  for (var i = 0; i < keys.length; i++) {
    if (keys[i].length >= 10 && norm.indexOf(keys[i]) === 0) {
      return _CARTELERA_IDS_NORM[keys[i]];
    }
  }
  return null;
}

// Deduplicate catedra names that all resolve to the SAME cartelera ID
// (e.g. "Ingles Médico-Regular" / "Ingles Médico-Libre" / "Ingles Médico" → one ID).
// Returns array of { name, id } keeping the first name per distinct resolved ID.
function dedupeCatedraNames(names) {
  var byId = {};
  var order = [];
  (names || []).forEach(function (n) {
    var rid = resolveCatedraId(n);
    var key = (rid === null || rid === undefined) ? "__null_" + n : String(rid);
    if (!byId[key]) {
      byId[key] = { name: n, id: rid };
      order.push(key);
    }
  });
  return order.map(function (k) { return byId[k]; });
}

function resolveCatedraForCode(codigo) {
  // Check localStorage selected catedra first
  var seleccionadas = getCatedrasSeleccionadas();
  if (seleccionadas[codigo] && seleccionadas[codigo].trim() !== "") {
    var selectedName = seleccionadas[codigo];
    var id = resolveCatedraId(selectedName);
    if (id) {
      return { name: selectedName, id: id, error: null };
    }
    // Selected catedra doesn't resolve → fall through to fallback/finales instead of erroring
  }

  // Look up in finales data
  var catedrasObj = catedrasData[codigo];
  if (!catedrasObj) {
    // Fallback for codes not in finales.json
    var fallback = CARTELERA_FALLBACK_CATEDRAS[codigo];
    if (fallback && fallback.length > 0) {
      if (fallback.length === 1) {
        var fbName = fallback[0];
        guardarCatedraSeleccionada(codigo, fbName);
        var fbId = resolveCatedraId(fbName);
        if (!fbId) {
          return { name: fbName, id: null, error: "No hay ID de cartelera para '" + fbName + "'" };
        }
        return { name: fbName, id: fbId, error: null };
      }
      return { name: codigo, id: null, error: null, needsSelection: true, options: fallback };
    }
    return { name: codigo, id: null, error: "No hay datos de cátedras para este código" };
  }

  var catedraNames = Object.keys(catedrasObj);
  if (catedraNames.length === 0) {
    return { name: codigo, id: null, error: "No hay cátedras definidas" };
  }

  // Deduplicate variant keys that resolve to the same cartelera ID
  var dedup = dedupeCatedraNames(catedraNames);
  var distinctIds = {};
  var hasUnresolved = false;
  dedup.forEach(function (d) {
    if (d.id === null || d.id === undefined) {
      hasUnresolved = true;
    } else {
      distinctIds[d.id] = true;
    }
  });

  // All variants map to a single cartelera ID → auto-select (no selector)
  if (!hasUnresolved && Object.keys(distinctIds).length === 1) {
    var auto = dedup[0];
    guardarCatedraSeleccionada(codigo, auto.name);
    return { name: auto.name, id: auto.id, error: null };
  }

  // Multiple distinct cartelera IDs → needs user selection (deduped options)
  return { name: codigo, id: null, error: null, needsSelection: true, options: dedup.map(function (d) { return d.name; }) };
}

// =============================
// CATEDRA OPTIONS HELPERS
// =============================

function getCatedraOptionsForCode(code) {
  var data = catedrasData[code];
  if (data) {
    return dedupeCatedraNames(Object.keys(data)).map(function (d) { return d.name; });
  }
  var fallback = CARTELERA_FALLBACK_CATEDRAS[code];
  if (fallback && fallback.length > 0) {
    return fallback;
  }
  return [];
}

function openCatedraSelectorForCode(code) {
  var options = getCatedraOptionsForCode(code);
  if (options.length <= 1) return;

  var pendingList = [{ codigo: code, options: options, source: "change" }];
  renderCatedraSelector(pendingList);

  // Add close button after renderCatedraSelector (which sets innerHTML)
  var closeBtn = document.createElement("button");
  closeBtn.className = "selector-close-btn";
  closeBtn.textContent = "✕ Cerrar";
  closeBtn.addEventListener("click", function () {
    selectorEl.style.display = "none";
    selectorEl.innerHTML = "";
  });
  selectorEl.insertBefore(closeBtn, selectorEl.firstChild);

  selectorEl.scrollIntoView({ behavior: "smooth", block: "start" });
}

// =============================
// CATEDRA SELECTOR UI
// =============================

function renderCatedraSelector(pendingList) {
  selectorEl.style.display = "block";
  var html = '<p class="selector-title">Selecciona una cátedra para estas materias:</p>';
  pendingList.forEach(function (item) {
    html += '<div class="selector-subject">';
    var subjName = getSubjectName(item.codigo) || item.codigo;
    html += '<p class="selector-subject-name">' + escapeHtml(subjName) + '</p>';
    html += '<div class="selector-options">';
    item.options.forEach(function (opt) {
      html += '<button class="selector-btn" data-code="' + item.codigo + '" data-catedra="' + escapeHtml(opt) + '">' + escapeHtml(opt) + '</button>';
    });
    html += '</div></div>';
  });
  selectorEl.innerHTML = html;

  // Attach click events
  selectorEl.querySelectorAll(".selector-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var code = btn.getAttribute("data-code");
      var catedra = btn.dataset.catedra;
      guardarCatedraSeleccionada(code, catedra);
      // Re-run fetch
      resolveAndFetch();
    });
  });
}

function escapeHtml(str) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// =============================
// FETCHING
// =============================

function fetchCatedra(id) {
  // Check session cache
  var cache;
  try {
    var cachedRaw = sessionStorage.getItem(CACHE_KEY);
    if (cachedRaw) {
      cache = JSON.parse(cachedRaw);
      var entry = cache[id];
      if (entry && (Date.now() - entry.ts < CACHE_TTL)) {
        return Promise.resolve(entry.data);
      }
    }
  } catch (e) {
    // no cache
  }

  var ac = new AbortController();
  var timeoutId = setTimeout(function () { ac.abort(); }, 15000);

  return fetch(CARTELERA_PROXY + "?id=" + id, { signal: ac.signal })
    .then(function (res) {
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (html) {
      clearTimeout(timeoutId);
      // Update cache
      try {
        var c = {};
        var existing = sessionStorage.getItem(CACHE_KEY);
        if (existing) { try { c = JSON.parse(existing); } catch (e) { /* ignore */ } }
        c[id] = { data: html, ts: Date.now() };
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(c));
      } catch (e) {
        // storage unavailable
      }
      return html;
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      throw err;
    });
}

// =============================
// HTML PARSING
// =============================

function parseDateDDMMYYYY(str) {
  if (!str) return null;
  var m = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  var y = parseInt(m[3], 10);
  var mo = parseInt(m[2], 10) - 1;
  var d = parseInt(m[1], 10);
  var dt = new Date(y, mo, d);
  if (isNaN(dt.getTime())) return null;
  return dt;
}

function formatDate(date) {
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  return (d < 10 ? "0" : "") + d + "/" + (m < 10 ? "0" : "") + m + "/" + y;
}

function formatDateTime(date) {
  if (!date || isNaN(date.getTime())) return null;
  var d = date.getDate();
  var m = date.getMonth() + 1;
  var y = date.getFullYear();
  var h = date.getHours();
  var min = date.getMinutes();
  return (d < 10 ? "0" : "") + d + "/" + (m < 10 ? "0" : "") + m + "/" + y + " " +
    (h < 10 ? "0" : "") + h + ":" + (min < 10 ? "0" : "") + min;
}

function tagColor(tag) {
  var map = {
    "Exámenes": "#ef4444",
    "Avisos": "#3b82f6",
    "Notas": "#22c55e",
    "General": "#a855f7",
    "Otros": "#888"
  };
  return map[tag] || "#888";
}

function tagClassName(tag) {
  var map = {
    "Exámenes": "tag-examenes",
    "Avisos": "tag-avisos",
    "Notas": "tag-notas",
    "General": "tag-general",
    "Otros": "tag-otros"
  };
  return map[tag] || "tag-otros";
}

function parseCatedraHtml(html) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");
  var cards = doc.querySelectorAll(".ribbon-wrapper.card");
  var results = [];

  cards.forEach(function (card) {
    // Tag
    var ribbonEl = card.querySelector(".ribbon");
    var tag = ribbonEl ? ribbonEl.textContent.trim() : "Otros";

    // Date from card-text with fa-calendar-alt
    var dateStr = null;
    var dateEl = card.querySelector("p.card-text i.fa-calendar-alt");
    if (dateEl && dateEl.parentElement) {
      dateStr = dateEl.parentElement.textContent.trim();
    }
    if (!dateStr) {
      // try fallback: any card-text
      var allTexts = card.querySelectorAll("p.card-text");
      allTexts.forEach(function (p) {
        if (!dateStr && p.textContent.match(/\d{2}\/\d{2}\/\d{4}/)) {
          dateStr = p.textContent.trim();
        }
      });
    }
    if (!dateStr) return; // skip if no date

    var date = parseDateDDMMYYYY(dateStr);
    if (!date) return;

    // Title and link
    var titleEl = card.querySelector(".card-title a");
    var title = titleEl ? titleEl.textContent.trim() : "Sin título";
    var link = titleEl ? titleEl.getAttribute("href") : null;
    var fullLink = link ? (link.startsWith("http") ? link : CARTELERA_BASE + link) : null;

    // Subtitle
    var subtitleEl = card.querySelector(".card-subtitle");
    var subtitle = subtitleEl ? subtitleEl.textContent.trim() : null;

    // Professor: first p.card-text.text-right without text-muted
    var professor = null;
    var profEls = card.querySelectorAll("p.card-text.text-right");
    profEls.forEach(function (p) {
      if (!professor && !p.classList.contains("text-muted")) {
        var txt = p.textContent.trim();
        if (txt && txt.length > 0) {
          professor = txt;
        }
      }
    });

    // Modificada: p.card-text.text-right.text-muted
    var modificada = null;
    var modificadaDate = null;
    var modEl = card.querySelector("p.card-text.text-right.text-muted");
    if (modEl) {
      modificada = modEl.textContent.trim();
      var m = modificada.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{1,2}):(\d{2})?/);
      if (m) {
        modificadaDate = new Date(+m[3], +m[2]-1, +m[1], +(m[4]||0), +(m[5]||0));
      }
    }

    results.push({
      tag: tag,
      date: date,
      dateStr: formatDate(date),
      title: title,
      link: fullLink,
      subtitle: subtitle,
      professor: professor,
      modificada: modificada,
      modificadaDate: modificadaDate
    });
  });

  return results;
}

function parseHomeHtml(html) {
  var parser = new DOMParser();
  var doc = parser.parseFromString(html, "text/html");
  // Home faculty publications use .card.card-outline-success (NOT .ribbon-wrapper.card)
  var cards = doc.querySelectorAll(".card.card-outline-success");
  var results = [];

  cards.forEach(function (card) {
    // Date inside .card-header h5
    var dateStr = null;
    var headerEl = card.querySelector(".card-header");
    if (headerEl) dateStr = headerEl.textContent.trim();
    if (dateStr && !dateStr.match(/\d{2}\/\d{2}\/\d{4}/)) dateStr = null;
    if (!dateStr) return; // skip if no date
    var date = parseDateDDMMYYYY(dateStr);
    if (!date) return;

    // Title and link (/noticia/N)
    var titleEl = card.querySelector(".card-title a");
    var title = titleEl ? titleEl.textContent.trim() : "Sin título";
    var link = titleEl ? titleEl.getAttribute("href") : null;
    var fullLink = link ? (link.startsWith("http") ? link : CARTELERA_BASE + link) : null;

    // Subtitle
    var subtitleEl = card.querySelector(".card-subtitle");
    var subtitle = subtitleEl ? (subtitleEl.textContent.trim() || null) : null;
    if (subtitle === "-") subtitle = null;

    // Author (department)
    var professor = null;
    var profEl = card.querySelector("p.card-text.text-right");
    if (profEl) {
      var txt = profEl.textContent.trim();
      if (txt && txt.length > 0) professor = txt;
    }

    // Modificada text (home cards may have modification text)
    var modificada = null;
    var modificadaDate = null;
    var allTexts = card.querySelectorAll("p.card-text.text-right");
    allTexts.forEach(function (p) {
      var txt = p.textContent.trim();
      if (/modificad[ao]/i.test(txt)) {
        modificada = txt;
        var m = txt.match(/(\d{2})\/(\d{2})\/(\d{4})\s*(\d{1,2}):(\d{2})?/);
        if (m) {
          modificadaDate = new Date(+m[3], +m[2]-1, +m[1], +(m[4]||0), +(m[5]||0));
        }
      }
    });

    results.push({
      tag: "General",
      date: date,
      dateStr: formatDate(date),
      title: title,
      link: fullLink,
      subtitle: subtitle,
      professor: professor,
      modificada: modificada,
      modificadaDate: modificadaDate
    });
  });

  return results;
}

// =============================
// MAIN ORCHESTRATION
// =============================

function resolveAndFetch() {
  var cursandoCodes = getCursandoCodes();
  var regularCodes = getRegularizadaCodes();

  // Build combined list with source tag. Cursando takes precedence if overlap.
  var codeSourceMap = {};
  cursandoCodes.forEach(function (c) { codeSourceMap[c] = "cursando"; });
  regularCodes.forEach(function (c) {
    if (!codeSourceMap[c]) codeSourceMap[c] = "regular";
  });

  // Add subscribed codes (extra subjects the user chose to follow)
  var estados = {};
  try { estados = JSON.parse(localStorage.getItem("estados") || "{}"); } catch (e) {}
  var subscribedCodes = getSubscribedCodes();
  subscribedCodes.forEach(function (code) {
    if (codeSourceMap[code]) return; // already present
    if (estados[code] === "aprobada") return; // already approved
    var resolved = resolveCatedraForCode(code);
    if (!resolved || resolved.error) return; // can't resolve catedra
    codeSourceMap[code] = "subscribed";
  });

  var codes = Object.keys(codeSourceMap);

  if (codes.length === 0) {
    selectorEl.style.display = "none";
    setStatus("");
    // No active subjects — fallback to first-year obligatorias (filter approved ones)
    materias.forEach(function (m) {
      if (m.anio === 1 && m.categoria !== "optativa" && estados[m.codigo] !== "aprobada") {
        codeSourceMap[m.codigo] = "primero";
      }
    });
    codes = Object.keys(codeSourceMap);
  }

  // Resolve each code
  var resolved = [];
  var pending = [];
  var noData = [];

  codes.forEach(function (code) {
    var r = resolveCatedraForCode(code);
    if (r.needsSelection) {
      pending.push({ codigo: code, options: r.options, source: codeSourceMap[code] });
    } else if (r.error) {
      noData.push({ codigo: code, error: r.error, source: codeSourceMap[code] });
    } else {
      resolved.push({ codigo: code, name: r.name, id: r.id, source: codeSourceMap[code] });
    }
  });

  // Always include home (general faculty publications)
  resolved.push({ codigo: HOME_KEY, name: HOME_LABEL, id: HOME_ID, source: "home" });

  // Show selector if needed
  if (pending.length > 0) {
    renderCatedraSelector(pending);
  } else {
    selectorEl.style.display = "none";
  }

  // Spinner
  var total = resolved.length;
  setSpinner("Obteniendo publicaciones... (0/" + total + ")");

  fetchedData = {};
  var settled = 0;

  var promises = resolved.map(function (item) {
    var fetchPromise;
    if (item.codigo === HOME_KEY) {
      fetchPromise = fetchCatedra(HOME_ID).then(function (html) { return parseHomeHtml(html); });
    } else {
      fetchPromise = fetchCatedra(item.id).then(function (html) { return parseCatedraHtml(html); });
    }
    return fetchPromise
      .then(function (pubs) {
        fetchedData[item.codigo] = {
          catedraName: item.name,
          id: item.id,
          pubs: pubs,
          error: null,
          source: item.source
        };
      })
      .catch(function (err) {
        fetchedData[item.codigo] = {
          catedraName: item.name,
          id: item.id,
          pubs: [],
          error: err.message || "Error de conexión",
          source: item.source
        };
      })
      .then(function () {
        settled++;
        setSpinner("Obteniendo publicaciones... (" + settled + "/" + total + ")");
      });
  });

  // Add no-data items (with error) to fetchedData
  noData.forEach(function (item) {
    fetchedData[item.codigo] = {
      catedraName: item.codigo,
      id: null,
      pubs: [],
      error: item.error,
      source: item.source
    };
  });

  Promise.all(promises).then(function () {
    setStatus("");
    render();
  });
}

// =============================
// RENDER
// =============================

function render() {
  if (!fetchedData) {
    showEmpty("No hay datos cargados. Presiona Actualizar.");
    updateMarkAllBtn();
    return;
  }

  var cutoff = new Date(Date.now() - (currentDays + 3) * 24 * 60 * 60 * 1000);
  var codes = Object.keys(fetchedData);

  // Build filtered pubs per code
  var subjectData = {};

  codes.forEach(function (code) {
    var entry = fetchedData[code];
    var pubs = (entry.pubs || []).filter(function (p) {
      return (p.modificadaDate || p.date) >= cutoff;
    });
    // Sort by date descending
    pubs.sort(function (a, b) { return (b.modificadaDate || b.date) - (a.modificadaDate || a.date); });
    subjectData[code] = {
      catedraName: entry.catedraName,
      error: entry.error,
      pubs: pubs,
      source: entry.source
    };
  });

  // Check if any pubs at all within filter
  var anyPubOverall = codes.some(function (c) {
    return subjectData[c].pubs.length > 0;
  });
  var anyErrorOverall = codes.some(function (c) {
    return !!subjectData[c].error;
  });

  if (!anyPubOverall && !anyErrorOverall) {
    var msg = "No hay publicaciones en los últimos " + currentDays + " días.";
    // Check if there are any pubs at all (beyond filter)
    var hasAnyPubTotal = codes.some(function (c) {
      return (fetchedData[c].pubs || []).length > 0;
    });
    if (hasAnyPubTotal) {
      msg += " Prueba con un filtro de más días.";
    }
    showEmpty(msg);
    updateMarkAllBtn();
    return;
  }

  // Clear results
  resultsEl.innerHTML = "";

  if (currentMode === "subject") {
    renderSubjectMode(subjectData);
  } else {
    renderChronoMode(subjectData);
  }
  updateMarkAllBtn();
}

function renderSubjectMode(subjectData) {
  var codes = Object.keys(subjectData);

  // Split by source
  var cursandoCodes = codes.filter(function (c) { return subjectData[c].source === "cursando"; });
  var regularCodes = codes.filter(function (c) { return subjectData[c].source === "regular"; });
  var primeroCodes = codes.filter(function (c) { return subjectData[c].source === "primero"; });
  var subscribedCodes = codes.filter(function (c) { return subjectData[c].source === "subscribed"; });

  // Only render a source group if it has at least one code with pubs or an error
  function hasVisibleContent(groupCodes) {
    return groupCodes.some(function (c) {
      var d = subjectData[c];
      return d.pubs.length > 0 || d.error;
    });
  }

  function renderSourceGroup(groupCodes, headerText, headerClass) {
    if (groupCodes.length === 0) return;
    if (!hasVisibleContent(groupCodes)) return;

    var group = document.createElement("div");
    group.className = "source-group";

    var sourceKey = headerClass.replace("source-header-", "");

    var header = document.createElement("h2");
    header.className = "source-header " + headerClass;
    if (isCollapsed(sourceKey)) {
      header.classList.add("collapsed");
    }
    header.style.cursor = "pointer";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    var indicator = isCollapsed(sourceKey) ? "▸ " : "▾ ";
    header.textContent = indicator + headerText + " (" + groupCodes.length + ")";
    header.addEventListener("click", function () { toggleCollapse(sourceKey); });
    header.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); header.click(); }
    });
    group.appendChild(header);

    // If collapsed, don't render subject sections
    if (isCollapsed(sourceKey)) {
      resultsEl.appendChild(group);
      return;
    }

    // Split codes: with-pubs first, without-pubs at end
    var withPubsCodes = groupCodes.filter(function(c) {
      var d = subjectData[c];
      return d.pubs.length > 0 || d.error;
    });
    var withoutPubsCodes = groupCodes.filter(function(c) {
      var d = subjectData[c];
      return d.pubs.length === 0 && !d.error;
    });

    // Auto-collapse all without-pubs subjects
    var collapsedData = getCollapsedSubjects();
    withoutPubsCodes.forEach(function(code) {
      collapsedData[code] = true;
    });
    try { localStorage.setItem(COLLAPSED_SUBJECTS_KEY, JSON.stringify(collapsedData)); } catch (e) {}

    // === Render subjects WITH publications ===
    withPubsCodes.forEach(function (code) {
      var data = subjectData[code];
      var subjName = getSubjectName(code) || data.catedraName || code;

      var section = document.createElement("div");
      section.className = "subject-section";

      // Title (collapsible)
      var title = document.createElement("h3");
      title.className = "subject-title collapsible-subject";
      title.style.cursor = "pointer";
      title.setAttribute("role", "button");
      title.setAttribute("tabindex", "0");
      title.addEventListener("click", function (cod) { return function () { toggleSubjectCollapse(cod); }; }(code));
      title.addEventListener("keydown", function (cod) { return function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSubjectCollapse(cod); }
      }; }(code));

      // Text span
      var indicator = isSubjectCollapsed(code) ? "▸ " : "▾ ";
      var textSpan = document.createElement("span");
      textSpan.textContent = indicator + subjName + " (" + data.pubs.length + ")";
      title.appendChild(textSpan);

      // Button group
      var btnGroup = document.createElement("span");
      btnGroup.style.cssText = "display:inline-flex;align-items:center;gap:2px;margin-left:8px;white-space:nowrap";

      var catedraOptions = getCatedraOptionsForCode(code);
      var hasMultipleCatedras = catedraOptions.length > 1;

      if (hasMultipleCatedras || true) {
        var pipe = document.createTextNode(" | ");
        btnGroup.appendChild(pipe);

        if (hasMultipleCatedras) {
          var changeBtn = document.createElement("button");
          changeBtn.className = "catedra-change-btn";
          changeBtn.textContent = "⚙";
          changeBtn.title = "Alterar cátedra";
          changeBtn.setAttribute("aria-label", "Alterar cátedra para " + subjName);
          changeBtn.addEventListener("click", function(cod) { return function(e) {
            e.stopPropagation();
            openCatedraSelectorForCode(cod);
          }; }(code));
          btnGroup.appendChild(changeBtn);
        }

        var linkBtn = document.createElement("button");
        linkBtn.className = "catedra-change-btn";
        linkBtn.textContent = "🔗";
        linkBtn.title = "Abrir cartelera";
        linkBtn.setAttribute("aria-label", "Abrir cartelera de " + subjName);
        linkBtn.addEventListener("click", function(cod, cartId) { return function(e) {
          e.stopPropagation();
          var url = cartId === "home" ? "https://cartelera.med.unlp.edu.ar/" : "https://cartelera.med.unlp.edu.ar/catedra/" + cartId;
          window.open(url, "_blank");
        }; }(code, data.id));
        btnGroup.appendChild(linkBtn);
      }

      title.appendChild(btnGroup);
      section.appendChild(title);

      // Expand subjects that have pubs (they might have been collapsed before)
      if (collapsedData[code]) {
        delete collapsedData[code];
        try { localStorage.setItem(COLLAPSED_SUBJECTS_KEY, JSON.stringify(collapsedData)); } catch (e) {}
      }

      // Skip pubs if collapsed
      if (isSubjectCollapsed(code)) {
        group.appendChild(section);
        return;
      }

      // Error note
      if (data.error) {
        var errNote = document.createElement("p");
        errNote.className = "subject-error";
        errNote.textContent = "⚠ " + data.error;
        section.appendChild(errNote);
      }

      // Cards
      var grid = document.createElement("div");
      grid.className = "cards-grid";
      data.pubs.forEach(function (pub) {
        var card = renderCard(pub, false);
        grid.appendChild(card);
      });
      section.appendChild(grid);

      group.appendChild(section);
    });

    // === "Sin nuevas publicaciones" compact section (at bottom) ===
    if (withoutPubsCodes.length > 0) {
      var noPubsSection = document.createElement("div");
      noPubsSection.className = "no-pubs-section";

      var noPubsP = document.createElement("p");
      noPubsP.className = "no-pubs-text";
      var names = withoutPubsCodes.map(function(c) {
        return getSubjectName(c) || subjectData[c].catedraName || c;
      });
      // Build text with each name clickable to expand
      // Simple version: just list names
      noPubsP.textContent = "Sin nuevas publicaciones (" + withoutPubsCodes.length + "): " + names.join(", ");
      noPubsP.style.color = "#666";
      noPubsP.style.fontSize = "12px";
      noPubsP.style.fontStyle = "italic";
      noPubsP.style.padding = "8px 12px";
      noPubsP.style.margin = "4px 0";
      noPubsSection.appendChild(noPubsP);

      group.appendChild(noPubsSection);
    }

    resultsEl.appendChild(group);
  }

  // Render general faculty publications (home) section first
  function renderHomeGroup() {
    var home = subjectData[HOME_KEY];
    if (!home) return;
    if (home.pubs.length === 0 && !home.error) return;

    var group = document.createElement("div");
    group.className = "source-group";

    var header = document.createElement("h2");
    header.className = "source-header source-header-home";
    if (isCollapsed("home")) header.classList.add("collapsed");
    header.style.cursor = "pointer";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    var indicator = isCollapsed("home") ? "▸ " : "▾ ";
    header.textContent = indicator + HOME_LABEL + " (" + home.pubs.length + ")";
    header.addEventListener("click", function () { toggleCollapse("home"); });
    header.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); header.click(); }
    });
    group.appendChild(header);

    if (!isCollapsed("home")) {
      if (home.error) {
        var errNote = document.createElement("p");
        errNote.className = "subject-error";
        errNote.textContent = "⚠ " + home.error;
        group.appendChild(errNote);
      }
      var grid = document.createElement("div");
      grid.className = "cards-grid";
      home.pubs.forEach(function (pub) {
        var card = renderCard(pub, false);
        grid.appendChild(card);
      });
      group.appendChild(grid);
    }

    resultsEl.appendChild(group);
  }

  renderHomeGroup();
  renderSourceGroup(cursandoCodes, "Cursando", "source-header-cursando");
  renderSourceGroup(regularCodes, "Regularizada", "source-header-regular");
  renderSourceGroup(primeroCodes, "1er A\u00f1o", "source-header-primero");
  renderSourceGroup(subscribedCodes, "Otras", "source-header-subscribed");
}

function renderChronoMode(subjectData) {
  // Collect all pubs with their catedra name
  var allPubs = [];
  var codes = Object.keys(subjectData);
  codes.forEach(function (code) {
    var data = subjectData[code];
    data.pubs.forEach(function (pub) {
      allPubs.push({
        pub: pub,
        catedraName: data.catedraName || (code === HOME_KEY ? HOME_LABEL : code),
        source: data.source,
        subjectName: code === HOME_KEY ? HOME_LABEL : getSubjectName(code)
      });
    });
  });

  // Sort by date descending
  allPubs.sort(function (a, b) {
    var da = a.pub.modificadaDate || a.pub.date;
    var db = b.pub.modificadaDate || b.pub.date;
    return db - da;
  });

  // Group by date (same day)
  var groups = {};
  allPubs.forEach(function (item) {
    var key = item.pub.modificadaDate ? formatDate(item.pub.modificadaDate) : item.pub.dateStr;
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  });

  var sortedDates = Object.keys(groups).sort(function (a, b) {
    // Parse for sorting: DD/MM/YYYY
    var da = parseDateDDMMYYYY(a);
    var db = parseDateDDMMYYYY(b);
    return db - da; // descending
  });

  sortedDates.forEach(function (dateKey) {
    var group = document.createElement("div");
    group.className = "date-group";

    var header = document.createElement("h3");
    header.className = "date-group-header";
    header.textContent = dateKey;
    group.appendChild(header);

    var grid = document.createElement("div");
    grid.className = "cards-grid";
    groups[dateKey].forEach(function (item) {
      var card = renderCard(item.pub, true, item.catedraName, item.subjectName);
      // Insert source badge into card-header (after subject-name or first child)
      var srcBadge = document.createElement("span");
      srcBadge.className = "pub-source " + (item.source === "cursando" ? "pub-source-cursando" : (item.source === "home" ? "pub-source-home" : (item.source === "primero" ? "pub-source-primero" : (item.source === "subscribed" ? "pub-source-subscribed" : "pub-source-regular"))));
      srcBadge.textContent = item.source === "cursando" ? "Cursando" : (item.source === "home" ? "General" : (item.source === "primero" ? "1er A\u00f1o" : (item.source === "subscribed" ? "Otras" : "Regular")));
      var cardHeader = card.querySelector(".pub-card-header");
      if (cardHeader) {
        var subjName = cardHeader.querySelector(".pub-subject-name");
        if (subjName && subjName.nextSibling) {
          cardHeader.insertBefore(srcBadge, subjName.nextSibling);
        } else {
          cardHeader.insertBefore(srcBadge, cardHeader.firstChild);
        }
      }
      grid.appendChild(card);
    });
    group.appendChild(grid);

    resultsEl.appendChild(group);
  });
}

function renderCard(pub, showCatedra, catedraName, subjectName) {
  var card = document.createElement("div");
  card.className = "pub-card";
  var color = tagColor(pub.tag);
  card.style.borderLeftColor = color;
  card.style.borderLeftWidth = "3px";
  card.style.borderLeftStyle = "solid";

  var modTs = pub.modificadaDate ? formatDateTime(pub.modificadaDate) : null;
  var leida = isLeida(pub.link, modTs);
  if (leida) { card.classList.add("pub-read"); }

  // === HEADER: subject-name (chrono) + date (right) ===
  var header = document.createElement("div");
  header.className = "pub-card-header";

  if (showCatedra && subjectName) {
    var subjEl = document.createElement("span");
    subjEl.className = "pub-subject-name";
    subjEl.textContent = subjectName;
    header.appendChild(subjEl);
  }

  // Date: show modified if exists, else original. Only ONE date.
  var dateEl = document.createElement("div");
  dateEl.className = "pub-date";
  if (pub.modificadaDate) {
    dateEl.textContent = "\uD83D\uDCC5 " + formatDateTime(pub.modificadaDate);
    dateEl.classList.add("pub-date-modified");
  } else {
    dateEl.textContent = "\uD83D\uDCC5 " + pub.dateStr;
  }
  header.appendChild(dateEl);

  card.appendChild(header);

  // === TITLE ===
  if (pub.link) {
    var titleLink = document.createElement("a");
    titleLink.className = "pub-title";
    titleLink.setAttribute("href", pub.link);
    titleLink.setAttribute("target", "_blank");
    titleLink.setAttribute("rel", "noopener");
    titleLink.textContent = pub.title;
    card.appendChild(titleLink);
  } else {
    var titleEl = document.createElement("div");
    titleEl.className = "pub-title";
    titleEl.textContent = pub.title;
    card.appendChild(titleEl);
  }

  // === TAGS ROW (all info as pills, hidden if read) ===
  var tagsRow = document.createElement("div");
  tagsRow.className = "pub-tags-row";

  // Tag type (Avisos/Exámenes/etc.) as first pill
  var tagPill = document.createElement("span");
  tagPill.className = "pub-detail-pill " + tagClassName(pub.tag);
  tagPill.textContent = pub.tag;
  tagsRow.appendChild(tagPill);

  // Subtitle pill
  if (pub.subtitle) {
    var subPill = document.createElement("span");
    subPill.className = "pub-detail-pill";
    subPill.textContent = pub.subtitle;
    tagsRow.appendChild(subPill);
  }

  // Catedra pill (chrono mode)
  if (showCatedra && catedraName) {
    var catPill = document.createElement("span");
    catPill.className = "pub-detail-pill";
    catPill.textContent = catedraName;
    tagsRow.appendChild(catPill);
  }

  if (tagsRow.children.length > 0 && !leida) {
    card.appendChild(tagsRow);
  }

  // === ACTIONS (bottom-right) ===
  var btnContainer = document.createElement("div");
  btnContainer.className = "pub-actions";
  if (leida) {
    var btnDesmarcar = document.createElement("button");
    btnDesmarcar.className = "btn-desmarcar";
    btnDesmarcar.textContent = "\uD83D\uDC41 desmarcar";
    btnDesmarcar.setAttribute("aria-label", "Desmarcar como le\u00EDdo");
    btnDesmarcar.addEventListener("click", function () { desmarcarLeida(pub.link); });
    btnContainer.appendChild(btnDesmarcar);
  } else {
    var btnLeido = document.createElement("button");
    btnLeido.className = "btn-leido";
    btnLeido.textContent = "\uD83D\uDC41 lido";
    btnLeido.setAttribute("aria-label", "Marcar como le\u00EDdo");
    (function(link, modTs) {
      btnLeido.addEventListener("click", function () { marcarLeida(link, modTs); });
    })(pub.link, modTs);
    btnContainer.appendChild(btnLeido);
  }
  card.appendChild(btnContainer);

  return card;
}

// =============================
// UI HELPERS
// =============================

function setStatus(msg) {
  statusEl.innerHTML = "";
  if (msg) {
    var p = document.createElement("p");
    p.textContent = msg;
    statusEl.appendChild(p);
  }
}

function setSpinner(msg) {
  statusEl.innerHTML = "";
  var spinner = document.createElement("div");
  spinner.className = "spinner";
  statusEl.appendChild(spinner);
  var p = document.createElement("p");
  p.textContent = msg;
  statusEl.appendChild(p);
}

function showEmpty(msg) {
  resultsEl.innerHTML = "";
  var empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = msg;
  resultsEl.appendChild(empty);
}

// =============================
// NOTIFY / SUBSCRIPTION
// =============================

const CARTELERA_NOTIFY_ENDPOINT = "https://cartelera-proxy.felipestesta.workers.dev";
const NOTIFY_EMAIL_KEY = "carteleraNotifyEmail";

function populateNotifySubjects() {
  if (!catedrasLoaded || !catedrasData) {
    alert('Cargando datos de cátedras, intenta nuevamente en unos segundos.');
    return;
  }
  var container = document.getElementById("notifySubjects");
  if (!container) return;
  container.innerHTML = "";

  var cursando = getCursandoCodes();
  var regular = getRegularizadaCodes();
  var all = cursando.concat(regular);
  // deduplicate
  var seen = {};
  all = all.filter(function (c) {
    if (seen[c]) return false;
    seen[c] = true;
    return true;
  });

  all.forEach(function (code) {
    var resolved = resolveCatedraForCode(code);
    if (!resolved || !resolved.id) return; // skip if no resolved catedra

    var label = document.createElement("label");
    label.className = "notify-subject-label";

    var checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = String(resolved.id);
    checkbox.className = "notify-subject-checkbox";
    checkbox.checked = true;

    var subjName = getSubjectName(code) || code;
    checkbox.dataset.subjectName = subjName;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + subjName + " (" + resolved.name + ")"));

    container.appendChild(label);
  });

  // Add subscribed extra subjects section
  var subscribed = getSubscribedCodes();
  if (subscribed.length > 0) {
    var hr = document.createElement("div");
    hr.style.cssText = "border-top:1px solid #2a2a2a;margin:10px 0";
    container.appendChild(hr);

    var header = document.createElement("div");
    header.style.cssText = "font-size:13px;color:#a855f7;font-weight:600;margin-bottom:6px";
    header.textContent = "📬 Suscripciones adicionales";
    container.appendChild(header);

    subscribed.forEach(function (code) {
      var resolved = resolveCatedraForCode(code);
      if (!resolved || !resolved.id) return;

      var label = document.createElement("label");
      label.className = "notify-subject-label";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = String(resolved.id);
      checkbox.className = "notify-subject-checkbox";
      checkbox.checked = true;

      var subjName = getSubjectName(code) || code;
      checkbox.dataset.subjectName = subjName;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + subjName + " (" + resolved.name + ")"));
      var note = document.createElement("span");
      note.style.cssText = "font-size:11px;color:#888;margin-left:4px";
      note.textContent = "(Otras)";
      label.appendChild(note);

      container.appendChild(label);
    });
  }
}

function openNotifyModal() {
  var modal = document.getElementById("notifyModal");
  if (!modal) return;

  // Pre-fill email
  var emailInput = document.getElementById("notifyEmail");
  if (emailInput) {
    try {
      var savedEmail = localStorage.getItem(NOTIFY_EMAIL_KEY);
      if (savedEmail) emailInput.value = savedEmail;
    } catch (e) {}
  }

  populateNotifySubjects();
  modal.style.display = "flex";
}

function closeNotifyModal() {
  var modal = document.getElementById("notifyModal");
  if (modal) modal.style.display = "none";
}

function handleNotifySubscribe() {
  var emailInput = document.getElementById("notifyEmail");
  var email = emailInput ? emailInput.value.trim() : "";
  if (!email || !email.includes("@")) {
    alert("Por favor ingresa un email válido.");
    return;
  }

  // Gather checked catedra IDs + names
  var checkboxes = document.querySelectorAll("#notifySubjects .notify-subject-checkbox:checked");
  var codes = [];
  var names = {};
  checkboxes.forEach(function (cb) {
    codes.push(cb.value);
    var subjName = cb.dataset.subjectName || cb.value;
    names[cb.value] = subjName;
  });

  // General faculty publications opt-in (home)
  var homeCheckbox = document.getElementById("notifyHomeCheckbox");
  var home = !!(homeCheckbox && homeCheckbox.checked);

  if (codes.length === 0 && !home) {
    alert("Selecciona al menos una cátedra o los avisos generales.");
    return;
  }

  // Persist email
  try { localStorage.setItem(NOTIFY_EMAIL_KEY, email); } catch (e) {}

  var subscribeBtn = document.getElementById("notifySubscribeBtn");
  if (subscribeBtn) {
    subscribeBtn.disabled = true;
    subscribeBtn.textContent = "Enviando...";
  }

  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, 15000);

  fetch(CARTELERA_NOTIFY_ENDPOINT + "/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email, codes: codes, names: names, home: home }),
    signal: controller.signal
  })
    .then(function (r) {
      clearTimeout(timeoutId);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function () {
      clearTimeout(timeoutId);
      alert("✓ Suscripción confirmada. Recibirás un email diario cuando haya novedades.");
      closeNotifyModal();
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      alert("Error al suscribir: " + (err.message || "desconocido"));
    })
      .finally(function () {
      clearTimeout(timeoutId);
      if (subscribeBtn) {
        subscribeBtn.disabled = false;
        subscribeBtn.textContent = "Suscribirme";
      }
    });
}

function handleNotifyUnsubscribe() {
  var emailInput = document.getElementById("notifyEmail");
  var email = emailInput ? emailInput.value.trim() : "";
  if (!email || !email.includes("@")) {
    alert("Por favor ingresa tu email para cancelar la suscripción.");
    return;
  }

  var unsubscribeBtn = document.getElementById("notifyUnsubscribeBtn");
  if (unsubscribeBtn) {
    unsubscribeBtn.disabled = true;
    unsubscribeBtn.textContent = "Enviando...";
  }

  var controller = new AbortController();
  var timeoutId = setTimeout(function() { controller.abort(); }, 15000);

  fetch(CARTELERA_NOTIFY_ENDPOINT + "/unsubscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email }),
    signal: controller.signal
  })
    .then(function (r) {
      clearTimeout(timeoutId);
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function () {
      clearTimeout(timeoutId);
      try { localStorage.removeItem(NOTIFY_EMAIL_KEY); } catch (e) {}
      alert("✓ Email removido. No recibirás más notificaciones.");
      closeNotifyModal();
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      alert("Error al cancelar suscripción: " + (err.message || "desconocido"));
    })
    .finally(function () {
      clearTimeout(timeoutId);
      if (unsubscribeBtn) {
        unsubscribeBtn.disabled = false;
        unsubscribeBtn.textContent = "Remover mi email";
      }
    });
}

// =============================
// SUBSCRIBE EXTRA MODAL
// =============================

function openSubscribeModal() {
  if (!catedrasLoaded) {
    alert("Cargando datos de materias, espera un momento...");
    return;
  }

  // Build list of ALL subjects with catedra (deduplicate by subject code)
  var subscribed = getSubscribedCodes();
  var subscribedSet = {};
  subscribed.forEach(function (c) { subscribedSet[c] = true; });

  var subjectsList = [];
  var seenCodes = {};
  if (typeof materias !== "undefined" && Array.isArray(materias)) {
    materias.forEach(function (m) {
      if (seenCodes[m.codigo]) return;
      seenCodes[m.codigo] = true;
      var resolved = resolveCatedraForCode(m.codigo);
      if (!resolved || !resolved.id) return; // no cartelera
      subjectsList.push({
        code: m.codigo,
        name: m.nombre,
        anio: m.anio,
        categoria: m.categoria,
        catedraName: resolved.name,
        catedraId: resolved.id,
        checked: !!subscribedSet[m.codigo]
      });
    });
  }

  var obligatorias = subjectsList.filter(function(s) { return s.categoria !== "optativa"; });
  var optativas = subjectsList.filter(function(s) { return s.categoria === "optativa"; });

  // Create overlay
  var overlay = document.createElement("div");
  overlay.className = "modal subscribe-modal";
  overlay.addEventListener("click", function (e) {
    if (e.target === overlay) closeSubscribeModal();
  });
  document.addEventListener("keydown", function escHandler(e) {
    if (e.key === "Escape") { closeSubscribeModal(); document.removeEventListener("keydown", escHandler); }
  });

  var content = document.createElement("div");
  content.className = "modal-content";

  var title = document.createElement("h2");
  title.textContent = "📬 Recibir novedades de materias";
  content.appendChild(title);

  var p = document.createElement("p");
  p.textContent = "Selecciona materias adicionales para recibir actualizaciones aunque no estén en tu plan actual.";
  p.style.cssText = "font-size:13px;color:#999;margin:0 0 12px 0";
  content.appendChild(p);

  // --- Tabs ---
  var tabBar = document.createElement("div");
  tabBar.className = "subscribe-tab-bar";

  var tabOblig = document.createElement("button");
  tabOblig.className = "subscribe-tab active";
  tabOblig.textContent = "Obligatorias";
  tabOblig.setAttribute("data-tab", "obligatorias");
  tabBar.appendChild(tabOblig);

  var tabOpt = document.createElement("button");
  tabOpt.className = "subscribe-tab";
  tabOpt.textContent = "Optativas";
  tabOpt.setAttribute("data-tab", "optativas");
  tabBar.appendChild(tabOpt);
  content.appendChild(tabBar);

  // --- Tab content containers ---
  var bodyOblig = document.createElement("div");
  bodyOblig.className = "modal-body subscribe-tab-content";
  bodyOblig.setAttribute("data-tab-content", "obligatorias");
  content.appendChild(bodyOblig);

  var bodyOpt = document.createElement("div");
  bodyOpt.className = "modal-body subscribe-tab-content";
  bodyOpt.style.display = "none";
  bodyOpt.setAttribute("data-tab-content", "optativas");
  content.appendChild(bodyOpt);

  // Render subjects grouped by year with dividers
  function renderSubjectGroup(list, container) {
    // Sort by anio
    list.sort(function(a, b) { return a.anio - b.anio; });
    var currentAnio = 0;
    list.forEach(function(subj) {
      if (subj.anio !== currentAnio) {
        currentAnio = subj.anio;
        var divider = document.createElement("div");
        divider.className = "subscribe-year-divider";
        divider.textContent = currentAnio + "\u00b0 a\u00f1o";
        container.appendChild(divider);
      }
      var label = document.createElement("label");
      label.className = "subscribe-subject-label";

      var checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.className = "subscribe-subject-checkbox";
      checkbox.checked = subj.checked;
      checkbox.setAttribute("data-code", subj.code);

      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(" " + subj.name));
      var catedraSpan = document.createElement("span");
      catedraSpan.className = "subscribe-catedra-name";
      catedraSpan.textContent = subj.catedraName;
      label.appendChild(catedraSpan);

      container.appendChild(label);
    });
  }

  renderSubjectGroup(obligatorias, bodyOblig);
  renderSubjectGroup(optativas, bodyOpt);

  // Tab switching logic
  tabOblig.addEventListener("click", function() {
    tabOblig.classList.add("active");
    tabOpt.classList.remove("active");
    bodyOblig.style.display = "";
    bodyOpt.style.display = "none";
  });
  tabOpt.addEventListener("click", function() {
    tabOpt.classList.add("active");
    tabOblig.classList.remove("active");
    bodyOblig.style.display = "none";
    bodyOpt.style.display = "";
  });

  var buttons = document.createElement("div");
  buttons.className = "modal-buttons";

  var saveBtn = document.createElement("button");
  saveBtn.className = "btn-save";
  saveBtn.textContent = "Guardar";
  saveBtn.addEventListener("click", function () {
    var checkedCodes = [];
    content.querySelectorAll(".subscribe-subject-checkbox:checked").forEach(function (cb) {
      checkedCodes.push(cb.getAttribute("data-code"));
    });
    saveSubscribedCodes(checkedCodes);
    closeSubscribeModal();
    resolveAndFetch();
  });
  buttons.appendChild(saveBtn);

  var cancelBtn = document.createElement("button");
  cancelBtn.className = "btn-cancel";
  cancelBtn.textContent = "✕ Cancelar";
  cancelBtn.addEventListener("click", function () {
    closeSubscribeModal();
  });
  buttons.appendChild(cancelBtn);

  content.appendChild(buttons);
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

function closeSubscribeModal() {
  var overlay = document.querySelector(".subscribe-modal");
  if (overlay) {
    document.body.removeChild(overlay);
  }
}
