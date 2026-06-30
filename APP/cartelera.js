/* ============================= */
/* CARTELERA - MAIN LOGIC       */
/* ============================= */

const CARTELERA_PROXY = "https://cartelera-proxy.felipestesta.workers.dev/";
const CARTELERA_BASE = "https://cartelera.med.unlp.edu.ar";
const CACHE_KEY = "carteleraCache";
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

const CARTELERA_FALLBACK_CATEDRAS = {
  "SEM91": ["Medicina Interna A", "Medicina Interna B", "Medicina Interna C", "Medicina Interna D", "Medicina Interna E", "Medicina Interna F"],
  "P9001": ["Psiquiatría"]
};

const LEIDAS_KEY = "carteleraLeidas";
const COLLAPSED_KEY = "carteleraCollapsed";
const FILTER_DAYS_KEY = "carteleraFilterDays";
const COLLAPSED_SUBJECTS_KEY = "carteleraCollapsedSubjects";

// State
let currentDays = 365;
try {
  var saved = parseInt(localStorage.getItem(FILTER_DAYS_KEY), 10);
  if (saved === 365 || saved === 30 || saved === 7) currentDays = saved;
} catch (e) {}
let currentMode = "subject"; // "subject" or "chrono"
let fetchedData = null; // { codigo: { catedraName, id, pubs: [...], error: null|string } }
let catedrasData = {}; // loaded from finales.json { CODE: { "CatedraName": [...] } }
var catedrasLoaded = false;

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
      document.querySelectorAll(".filter-btn").forEach(function (b) { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
      currentDays = parseInt(btn.getAttribute("data-days"), 10);
      try { localStorage.setItem(FILTER_DAYS_KEY, String(currentDays)); } catch (e) {}
      if (fetchedData) {
        render();
      }
    });
  });

  // Highlight the filter button matching persisted currentDays
  document.querySelectorAll(".filter-btn").forEach(function (btn) {
    var d = parseInt(btn.getAttribute("data-days"), 10);
    if (d === currentDays) {
      btn.classList.add("active");
      btn.setAttribute("aria-pressed", "true");
    } else {
      btn.classList.remove("active");
      btn.setAttribute("aria-pressed", "false");
    }
  });

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

function isLeida(link) {
  if (!link) return false;
  return !!getLeidas()[link];
}

function marcarLeida(link) {
  if (!link) return;
  var leidas = getLeidas();
  leidas[link] = true;
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
  var cutoff = new Date(Date.now() - currentDays * 24 * 60 * 60 * 1000);
  var leidas = getLeidas();
  var codes = Object.keys(fetchedData);
  for (var i = 0; i < codes.length; i++) {
    var entry = fetchedData[codes[i]];
    var pubs = entry.pubs || [];
    for (var j = 0; j < pubs.length; j++) {
      var pub = pubs[j];
      if (pub.date >= cutoff && pub.link) {
        if (!leidas[pub.link]) return false;
      }
    }
  }
  return true;
}

function updateMarkAllBtn() {
  var markAllBtn = document.getElementById("markAllBtn");
  if (markAllBtn) {
    markAllBtn.textContent = allVisibleRead() ? "👁 todas não lidas" : "👁 todas lidas";
  }
}

function marcarTodasLeidas() {
  if (!fetchedData) return;
  var cutoff = new Date(Date.now() - currentDays * 24 * 60 * 60 * 1000);
  var leidas = getLeidas();
  var codes = Object.keys(fetchedData);

  if (allVisibleRead()) {
    // All visible are read -> clear them
    codes.forEach(function (code) {
      var entry = fetchedData[code];
      (entry.pubs || []).forEach(function (pub) {
        if (pub.date >= cutoff && pub.link) {
          delete leidas[pub.link];
        }
      });
    });
  } else {
    // Mark all visible as read
    codes.forEach(function (code) {
      var entry = fetchedData[code];
      (entry.pubs || []).forEach(function (pub) {
        if (pub.date >= cutoff && pub.link) {
          leidas[pub.link] = true;
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

  if (catedraNames.length === 1) {
    var name = catedraNames[0];
    // Auto-select: save to localStorage
    guardarCatedraSeleccionada(codigo, name);
    var id = resolveCatedraId(name);
    if (!id) {
      return { name: name, id: null, error: "No hay ID de cartelera para '" + name + "'" };
    }
    return { name: name, id: id, error: null };
  }

  // Multiple catedras, needs user selection
  return { name: codigo, id: null, error: null, needsSelection: true, options: catedraNames };
}

// =============================
// CATEDRA OPTIONS HELPERS
// =============================

function getCatedraOptionsForCode(code) {
  var data = catedrasData[code];
  if (data) {
    return Object.keys(data);
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

function tagColor(tag) {
  var map = {
    "Exámenes": "#ef4444",
    "Avisos": "#3b82f6",
    "Notas": "#22c55e",
    "Otros": "#888"
  };
  return map[tag] || "#888";
}

function tagClassName(tag) {
  var map = {
    "Exámenes": "tag-examenes",
    "Avisos": "tag-avisos",
    "Notas": "tag-notas",
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
    var modEl = card.querySelector("p.card-text.text-right.text-muted");
    if (modEl) {
      modificada = modEl.textContent.trim();
    }

    results.push({
      tag: tag,
      date: date,
      dateStr: formatDate(date),
      title: title,
      link: fullLink,
      subtitle: subtitle,
      professor: professor,
      modificada: modificada
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
  var codes = Object.keys(codeSourceMap);

  if (codes.length === 0) {
    selectorEl.style.display = "none";
    setStatus("");
    showEmpty("No hay materias con 'Cursando' activado ni materias 'Regularizadas'. Ve al Modo Árbol y activa el toggle Cursando o marca materias como Regularizadas.");
    fetchedData = null;
    return;
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

  // Show selector if needed
  if (pending.length > 0) {
    renderCatedraSelector(pending);
  } else {
    selectorEl.style.display = "none";
  }

  if (resolved.length === 0) {
    setStatus("");
    if (pending.length > 0) {
      showEmpty("Selecciona las cátedras arriba para ver sus publicaciones.");
    } else {
      showEmpty("No se pudieron resolver cátedras para las materias seleccionadas.");
    }
    fetchedData = null;
    return;
  }

  // Show spinner
  var total = resolved.length;
  setSpinner("Obteniendo publicaciones... (0/" + total + ")");

  fetchedData = {};
  var settled = 0;

  var promises = resolved.map(function (item) {
    return fetchCatedra(item.id)
      .then(function (html) {
        var pubs = parseCatedraHtml(html);
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

  var cutoff = new Date(Date.now() - currentDays * 24 * 60 * 60 * 1000);
  var codes = Object.keys(fetchedData);

  // Build filtered pubs per code
  var subjectData = {};

  codes.forEach(function (code) {
    var entry = fetchedData[code];
    var pubs = (entry.pubs || []).filter(function (p) {
      return p.date >= cutoff;
    });
    // Sort by date descending
    pubs.sort(function (a, b) { return b.date - a.date; });
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

    var header = document.createElement("h2");
    header.className = "source-header " + headerClass;
    if (isCollapsed(headerClass === "source-header-cursando" ? "cursando" : "regular")) {
      header.classList.add("collapsed");
    }
    header.style.cursor = "pointer";
    header.setAttribute("role", "button");
    header.setAttribute("tabindex", "0");
    var sourceKey = headerClass === "source-header-cursando" ? "cursando" : "regular";
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

    groupCodes.forEach(function (code) {
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
      var indicator = isSubjectCollapsed(code) ? "▸ " : "▾ ";
      title.textContent = indicator + subjName + " (" + data.pubs.length + ")";
      title.addEventListener("click", function (cod) { return function () { toggleSubjectCollapse(cod); }; }(code));
      title.addEventListener("keydown", function (cod) { return function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSubjectCollapse(cod); }
      }; }(code));
      section.appendChild(title);

      // Catedra change button (only if multiple options)
      var catedraOptions = getCatedraOptionsForCode(code);
      if (catedraOptions.length > 1) {
        var subjName = getSubjectName(code) || code;
        var changeBtn = document.createElement("button");
        changeBtn.className = "catedra-change-btn";
        changeBtn.textContent = "⚙";
        changeBtn.title = "Alterar cátedra";
        changeBtn.setAttribute("aria-label", "Alterar cátedra para " + subjName);
        changeBtn.addEventListener("click", function(cod) { return function(e) {
          e.stopPropagation();
          openCatedraSelectorForCode(cod);
        }; }(code));
        title.appendChild(changeBtn);
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
      if (data.pubs.length === 0 && !data.error) {
        var emptyNote = document.createElement("p");
        emptyNote.className = "subject-error";
        emptyNote.textContent = "Sin publicaciones en este período.";
        emptyNote.style.color = "#666";
        section.appendChild(emptyNote);
      }

      data.pubs.forEach(function (pub) {
        var card = renderCard(pub, false);
        section.appendChild(card);
      });

      group.appendChild(section);
    });

    resultsEl.appendChild(group);
  }

  renderSourceGroup(cursandoCodes, "Cursando", "source-header-cursando");
  renderSourceGroup(regularCodes, "Regularizada", "source-header-regular");
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
        catedraName: data.catedraName || code,
        source: data.source,
        subjectName: getSubjectName(code)
      });
    });
  });

  // Sort by date descending
  allPubs.sort(function (a, b) { return b.pub.date - a.pub.date; });

  // Group by date (same day)
  var groups = {};
  allPubs.forEach(function (item) {
    var key = item.pub.dateStr;
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

    groups[dateKey].forEach(function (item) {
      var card = renderCard(item.pub, true, item.catedraName, item.subjectName);
      // Add source badge (Cursando / Regular)
      var srcBadge = document.createElement("span");
      srcBadge.className = "pub-source " + (item.source === "cursando" ? "pub-source-cursando" : "pub-source-regular");
      srcBadge.textContent = item.source === "cursando" ? "Cursando" : "Regular";
      card.insertBefore(srcBadge, card.firstChild);
      group.appendChild(card);
    });

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

  var leida = isLeida(pub.link);
  if (leida) {
    card.classList.add("pub-read");
  }

  // Tag badge
  var tagEl = document.createElement("span");
  tagEl.className = "pub-tag " + tagClassName(pub.tag);
  tagEl.textContent = pub.tag;
  card.appendChild(tagEl);

  // Date
  var dateEl = document.createElement("div");
  dateEl.className = "pub-date";
  dateEl.textContent = "📅 " + pub.dateStr;
  card.appendChild(dateEl);

  // Title with link
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

  // Subject name (chrono mode)
  if (showCatedra && subjectName) {
    var subjEl = document.createElement("div");
    subjEl.className = "pub-subject-name";
    subjEl.textContent = "📚 " + subjectName;
    card.appendChild(subjEl);
  }

  // Subtitle
  if (pub.subtitle && !leida) {
    var subEl = document.createElement("div");
    subEl.className = "pub-subtitle";
    subEl.textContent = pub.subtitle;
    card.appendChild(subEl);
  }

  // Professor
  if (pub.professor && !leida) {
    var profEl = document.createElement("div");
    profEl.className = "pub-professor";
    profEl.textContent = "👤 " + pub.professor;
    card.appendChild(profEl);
  }

  // Modificada
  if (pub.modificada && !leida) {
    var modEl = document.createElement("div");
    modEl.className = "pub-modificada";
    modEl.textContent = pub.modificada;
    card.appendChild(modEl);
  }

  // Catedra name (chrono mode) — only if not read
  if (showCatedra && catedraName && !leida) {
    var catEl = document.createElement("div");
    catEl.className = "pub-catedra";
    catEl.textContent = catedraName;
    card.appendChild(catEl);
  }

  // Read / unread button
  var btnContainer = document.createElement("div");
  btnContainer.className = "pub-actions";
  if (leida) {
    var btnDesmarcar = document.createElement("button");
    btnDesmarcar.className = "btn-desmarcar";
    btnDesmarcar.textContent = "👁 desmarcar";
    btnDesmarcar.setAttribute("aria-label", "Desmarcar como leído");
    btnDesmarcar.addEventListener("click", function () { desmarcarLeida(pub.link); });
    btnContainer.appendChild(btnDesmarcar);
  } else {
    var btnLeido = document.createElement("button");
    btnLeido.className = "btn-leido";
    btnLeido.textContent = "👁 lido";
    btnLeido.setAttribute("aria-label", "Marcar como leído");
    btnLeido.addEventListener("click", function () { marcarLeida(pub.link); });
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
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(" " + subjName + " (" + resolved.name + ")"));

    container.appendChild(label);
  });
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

  // Gather checked catedra IDs
  var checkboxes = document.querySelectorAll("#notifySubjects .notify-subject-checkbox:checked");
  var codes = [];
  checkboxes.forEach(function (cb) {
    codes.push(cb.value);
  });

  if (codes.length === 0) {
    alert("Selecciona al menos una cátedra.");
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
    body: JSON.stringify({ email: email, codes: codes }),
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
