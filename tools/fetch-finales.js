// tools/fetch-finales.js — Update APP/finales/finales.json from SIU Guarani
// (public fecha_examen page, server-rendered with filter params).
//
// Usage:
//   node tools/fetch-finales.js            → dry-run: fetch + report, no write
//   node tools/fetch-finales.js --write     → apply changes to finals.json
//
// Merge policy:
//   - Keeps past dates (historical record + evidence of libre offerings)
//   - Drops FUTURE dates from the old legacy table (unreliable) and replaces
//     them with the real Guarani dates (>= today)
//   - Joint mesas ("Regulares y Libres") update BOTH catedra keys
//   - Two-pass merge: dates from ALL groups feeding the same catedra key are
//     unioned BEFORE writing (sequential groups would otherwise clobber each
//     other's freshly added dates)
//   - Creates missing catedra keys (e.g. "X - Libre" when a Libre mesa appears
//     for a subject without one; SEM91 Semiología A-F; MI291 A-C)
//   - Skips practice exams (Pex N / Sumativo PFO)
//   - Cloudflare worker only triggers this run via email (pre-classes windows)
//
// No browser needed: plain GET returns the rendered HTML.

'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const FINALES_PATH = path.join(ROOT, 'APP', 'finales', 'finales.json');

// ── Guarani filters (update here if the faculty changes plan/carrera) ──
const FILTERS = {
  'formulario_filtro[ra]': '58de1b09b9c9cfe8a9c356ed173ef34333391334',        // Facultad de Ciencias Medicas
  'formulario_filtro[ubicacion]': '41c6e0dde1ed04dda3bbd3d11af29dea314ff87e',  // FCM (Facultad)
  'formulario_filtro[carrera]': 'ae2dec48288c06517a068cf670b7c48b382cf1cc',    // Medicina
  'formulario_filtro[plan]': '9149631f36bbd550a65665acb2fc17dae57c13ae',
  'formulario_filtro[materia]': '',                                            // all subjects
  'formulario_filtro[tipo_mesa]': ''                                           // Regular + Libre
};

// Aliases: normalized Guarani mesa base name → target.
// Target "BASE" = normalized finals.json catedra base to look up in the index.
// Target "CODE|Catedra Key" = explicit entry (created if missing).
const MESA_ALIASES = {
  'BIOL ANUAL': 'Biología',
  'BIOQUI CLI I': 'Bioquímica Clínica I',
  'BIOQUI CLI II': 'Bioquímica Clínica II',
  'BIOQUI Y BOL M': 'Bioquímica y Biología Molecular',
  'SOCIALES Y MED': 'Ciencias Sociales y medicina',
  'CIRUGIA TORAX': 'Cirugía de Tórax',
  'HISTOLOGIA': 'Citología, Histología y Embriología',
  'MED LEGAL': 'Deontología Médica y medicina Legal',
  'DIAG IMAGEN II': 'R9002|Diagnóstico y Terapéutica por imágenes II y Radiologia',
  'ECOLOGIA HUMANA': 'Ecología Humana y Promoción de la Salud',
  'PACIENTE ALTO I': 'El paciente con Enfermedad Crónica de Alto Impacto Familiar',
  'EST APLICADA A LAS CIENCIAS DE LA SALUD': 'Estadística Aplicada a Ciencias de la Salud',
  'FARMACO APLI': 'F9002|Farmacología Aplicada- Farmacología P/V',
  'FARMACO BASICA': 'Farmacología Básica',
  'FILOSOFIA MED': 'Filosofía Médica',
  'FISIOLOGIA': 'Fisiología y Física Biológica',
  'HISTORIA MED': 'Historia de la Medicina',
  'INFORMATICA BASICA': 'IFB01|Informática Básica- Libre',
  'INFO MED': 'Informática Médica',
  'EPISTEMOLOGIA': 'Introducción a la Epistemología',
  'I. APLI AL ANAL': 'IAA01|Informática Aplicada',
  'LITE, CINE Y M': 'Literatura, Cine y Medicina',
  'MED GRAL Y FAMILIAR': 'Medicina General y Familiar',
  'MED INT I A': 'MI191|Medicina Interna A', 'MED INT I B': 'MI191|Medicina Interna B',
  'MED INT I C': 'MI191|Medicina Interna C', 'MED INT I D': 'MI191|Medicina Interna D',
  'MED INT I E': 'MI191|Medicina Interna E', 'MED INT I F': 'MI191|Medicina Interna F',
  'MED INT II A': 'MI291|Medicina Interna A', 'MED INT II B': 'MI291|Medicina Interna B',
  'MED INT II C': 'MI291|Medicina Interna C', 'MED INT II D': 'MI291|Medicina Interna D',
  'MED INT II E': 'MI291|Medicina Interna E', 'MED INT II F': 'MI291|Medicina Interna F',
  'MICROBIOLOGIA': 'Microbiología y Parasitología',
  'NEUROANATOMIA': 'Neuroanatomía Semiológica',
  'NUTRICION CLI': 'Nutrición Clínica',
  'ORTOPEDIA Y TRA': 'Ortopedia y Traumatología',
  'OTORRINO': 'Otorrinolaringología',
  'PSICOLOGIA MED': 'Psicología Médica',
  'SALUD PUBLIC II': 'Salud Pública II',
  'SALUD Y MED COM': 'Salud y Medicina Comunitaria',
  'SEMI INVESTIGA': 'Seminario en Investigación Científica',
  'SEMIOLOGIA A': 'SEM91|Semiología A', 'SEMIOLOGIA B': 'SEM91|Semiología B',
  'SEMIOLOGIA C': 'SEM91|Semiología C', 'SEMIOLOGIA D': 'SEM91|Semiología D',
  'SEMIOLOGIA E': 'SEM91|Semiología E', 'SEMIOLOGIA F': 'SEM91|Semiología F',
  'TERAPIA INTEN': 'Terapia Intensiva',
  'TRANSPLANTE': 'Transplante de Órganos',
  'CS. EXACTAS': 'Ciencias Exactas',
  'CALIDAD DE ATENCION MEDICA': 'Calidad de la Atención Médica'
};

// Practice exams (PFO / Práctica) — not course finals
const SKIP_RE = /^(PEX \d+|SUMATIVO PFO)$/;

function ddmmyyyy(d) {
  const p = n => String(n).padStart(2, '0');
  return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear();
}
function norm(s) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
}
function unescapeGuarani(s) {
  return s
    .replace(/\\u([0-9a-fA-F]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\"/g, '"')
    .replace(/\\\//g, '/');
}

async function fetchRows() {
  const today = new Date();
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  const params = new URLSearchParams({ ...FILTERS, 'formulario_filtro[fecha_desde]': ddmmyyyy(today), 'formulario_filtro[fecha_hasta]': ddmmyyyy(endOfYear) });
  const url = 'https://autogestion.guarani.unlp.edu.ar/fecha_examen?' + params.toString();
  console.log('GET ' + url);
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const html = unescapeGuarani(await res.text());

  const rowRe = /<tr><td class="hidden-phone">\s*([^<]+?)\s*<\/td><td>(\d{2}\/\d{2}\/\d{4})<\/td><td class="hidden-phone">\s*([^<]*?)\s*<\/td><td>\s*([^<]*?)\s*<\/td><td>\s*([^<]*?)\s*<\/td>/g;
  const rows = [];
  let m;
  while ((m = rowRe.exec(html)) !== null) {
    const [_, mesa, fecha, tipo, insDesde, insHasta] = m;
    const dd = fecha.split('/');
    rows.push({ mesa: mesa.trim(), fecha: dd[2] + '-' + dd[1] + '-' + dd[0], tipo: tipo.trim(), insDesde: insDesde.trim(), insHasta: insHasta.trim() });
  }
  return rows;
}

// finals.json index: normalized catedra base (without -Regular/-Libre suffix) → [{code, key, base, isLibre}]
function buildIndex(finales) {
  const idx = new Map();
  for (const code of Object.keys(finales)) {
    for (const key of Object.keys(finales[code])) {
      const isLibre = /libre/i.test(key);
      const base = key.replace(/\s*[-–]?\s*(libre|regulares?|regular)\s*$/i, '').trim();
      const nb = norm(base);
      if (!idx.has(nb)) idx.set(nb, []);
      idx.get(nb).push({ code, key, base, isLibre });
    }
  }
  return idx;
}

function labelFor(fecha) {
  return fecha.slice(8, 10) + '/' + fecha.slice(5, 7);
}

(async () => {
  const rows = await fetchRows();
  console.log('\nGuarani rows fetched: ' + rows.length);
  if (rows.length === 0) { console.error('NO ROWS — selector or filters broken. Abort.'); process.exit(1); }
  const libreRows = rows.filter(r => /libre/i.test(r.tipo) || /libre/i.test(r.mesa));
  console.log('  Rows touching Libre: ' + libreRows.length + ' | Distinct mesas: ' + new Set(rows.map(r => r.mesa)).size);

  const finales = JSON.parse(fs.readFileSync(FINALES_PATH, 'utf8'));
  const idx = buildIndex(finales);
  const todayStr = new Date().toISOString().slice(0, 10);

  const report = { matched: new Set(), unmatched: [], skipped: new Set(), added: [], created: [], removedFuture: 0, libreFound: new Set() };

  // group by normalized mesa + tipo (raw names have inconsistent spacing)
  const groups = new Map();
  for (const r of rows) {
    const k = norm(r.mesa) + '||' + r.tipo;
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(r);
  }

  // Pass 1: resolve targets per group, ACCUMULATE new dates per (code|key).
  // Multiple groups can feed the same key (e.g. "CS. EXACTAS - Regulares" +
  // "CS. EXACTAS - Regulares y Libres" both → Ciencias Exactas - Regular).
  const pending = new Map(); // code|||key → { code, key, isLibre, dates: Map(fecha→label) }

  for (const [k, rs] of groups) {
    const [rawMesa, tipo] = k.split('||');
    if (SKIP_RE.test(rawMesa)) { report.skipped.add(rawMesa); continue; }

    // Strip modality suffix from the mesa NAME itself (e.g. "HISTORIA MED - REGULARES")
    const nameBase = rawMesa.replace(/\s*-?\s*(REGULARES?\s*(Y\s*)?LIBRES?|REGULARES?|LIBRES?)\s*$/i, '').trim();
    const nameHasLibre = /LIBRE/i.test(rawMesa) && /LIBRE/i.test(rawMesa.slice(nameBase.length));
    const nameHasRegular = /REGULAR/i.test(rawMesa.slice(nameBase.length));

    const typeHasLibre = /libre/i.test(tipo);
    const typeHasRegular = /regular/i.test(tipo);
    const isJoint = (typeHasLibre && typeHasRegular) || (nameHasLibre && nameHasRegular) ||
      (typeHasRegular && nameHasLibre) || (typeHasLibre && nameHasRegular);
    const wantLibre = typeHasLibre || nameHasLibre;
    const wantRegular = typeHasRegular || nameHasRegular || !wantLibre; // plain rows = regular

    // Resolve targets: explicit alias first, then direct index match
    let targets;
    const alias = MESA_ALIASES[norm(nameBase)];
    if (alias && alias.indexOf('|') > 0) {
      const [code, key] = alias.split('|');
      if (!finales[code]) finales[code] = {};
      if (!finales[code][key]) { finales[code][key] = []; report.created.push(code + ' "' + key + '"'); }
      targets = [{ code, key, base: key.replace(/\s*[-–]?\s*(libre|regulares?|regular)\s*$/i, '').trim(), isLibre: /libre/i.test(key) }];
    } else {
      targets = idx.get(norm(alias || nameBase)) || [];
      if (targets.length === 0) { report.unmatched.push(rawMesa + ' (' + tipo + ') — ' + rs.map(r => r.fecha).join(', ')); continue; }
    }

    // Modality filter: joint → all; libre-only → isLibre (create if none); regular-only → !isLibre
    let sel;
    if (isJoint) {
      sel = targets;
    } else if (wantLibre && !wantRegular) {
      sel = targets.filter(t => t.isLibre);
      if (sel.length === 0) {
        // New libre offering for a subject without a "-Libre" catedra → create the key
        const t0 = targets[0];
        const newKey = t0.base + ' - Libre';
        if (!finales[t0.code][newKey]) {
          finales[t0.code][newKey] = [];
          report.created.push(t0.code + ' "' + newKey + '" (nueva modalidad libre)');
        }
        sel = [{ code: t0.code, key: newKey, base: t0.base, isLibre: true }];
      }
    } else {
      sel = targets.filter(t => !t.isLibre);
      if (sel.length === 0) sel = targets;
    }

    for (const t of sel) {
      report.matched.add(rawMesa + ' (' + tipo + ') → ' + t.code + ' / "' + t.key + '"' + (isJoint ? ' [joint]' : ''));
      if (t.isLibre || (isJoint && wantLibre)) report.libreFound.add(t.code + ' ' + t.base);
      const id = t.code + '|||' + t.key;
      if (!pending.has(id)) pending.set(id, { t, dates: new Map() });
      const rec = pending.get(id);
      rs.forEach(r => rec.dates.set(r.fecha, labelFor(r.fecha)));
    }
  }

  // Pass 2: merge ONCE per target — union of all its new dates + kept past dates
  for (const [id, rec] of pending) {
    const t = rec.t;
    const entry = finales[t.code][t.key];
    const pastDates = entry.filter(f => f.fecha < todayStr);
    const removedF = entry.filter(f => f.fecha >= todayStr).length;
    report.removedFuture += removedF;
    const newDates = [...rec.dates.entries()].map(([fecha, label]) => ({ fecha, label }));
    const merged = pastDates.concat(newDates).sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
    if (removedF > 0 || newDates.length > 0) {
      report.added.push(t.code + ' "' + t.key + '": +' + newDates.length + ' nuevas, -' + removedF + ' futuras obsoletas, ' + pastDates.length + ' históricas');
    }
    finales[t.code][t.key] = merged;
  }

  console.log('\n── Report ──');
  console.log('Matched groups: ' + report.matched.size + ' | Catedra keys updated: ' + pending.size);
  [...report.matched].forEach(x => console.log('  ✓ ' + x));
  if (report.skipped.size) { console.log('Skipped (PFO/Pex): ' + [...report.skipped].join(', ')); }
  if (report.created.length) { console.log('Created catedra keys:'); report.created.forEach(x => console.log('  + ' + x)); }
  if (report.unmatched.length) { console.log('UNMATCHED:'); report.unmatched.forEach(x => console.log('  ✗ ' + x)); }
  if (report.libreFound.size) { console.log('LIBRE evidence:'); [...report.libreFound].forEach(x => console.log('  ● ' + x)); }
  console.log('\nChanges per catedra:');
  report.added.forEach(x => console.log('  Δ ' + x));
  console.log('Stale future dates dropped total: ' + report.removedFuture);

  if (process.argv.includes('--write')) {
    fs.writeFileSync(FINALES_PATH, JSON.stringify(finales, null, 2) + '\n', 'utf8');
    console.log('\nWRITTEN: ' + FINALES_PATH);
  } else {
    console.log('\nDRY RUN — no changes written. Use --write to apply.');
  }
})().catch(e => { console.error('ERROR: ' + e.message); process.exit(1); });
