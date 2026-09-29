// ============================================================
// validate-universidades.js — data integrity check
// Run: node tools/validate-universidades.js
// Exit code 1 on any ERROR (use in pre-commit / before deploy).
// ============================================================
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_PATH = path.join(__dirname, '..', 'APP', 'universidades_data.js');
const TODAY = new Date();
const REVIEW_CYCLE_DAYS = 730; // user policy: re-verify each university every ~2 years

const STAT_KEYS = [
    'careerYears', 'graduationRate', 'avgGraduationYears', 'livingCostUsd', 'studentCount',
    'immigrantPct', 'spanishLevel', 'subjectCount', 'rankingNational',
    'rankingInternational', 'rankingSource', 'teachingMethod', 'distanceToCapitalKm'
];
const DURACIONES = ['anual', 'cuatrimestral', 'bimestral'];
const REQUIRED = ['id', 'sigla', 'nombre', 'facultad', 'ciudad', 'provincia',
    'region', 'lat', 'lng', 'fundada', 'descripcion', 'wikiUrl', 'webUrl', 'lastReviewed'];

const errors = [];
const warnings = [];
const ok = [];

function err(msg) { errors.push(msg); }
function warn(msg) { warnings.push(msg); }
function pass(msg) { ok.push(msg); }

// ---- Load data file in a sandbox (browser-style const declarations) ----
const src = fs.readFileSync(DATA_PATH, 'utf8');
if (/UNI_REGIONS/.test(src)) err('UNI_REGIONS map still present — region now lives per-university entry (centralized)');
const sandbox = {};
vm.createContext(sandbox);
try {
    vm.runInContext(src + '\n;__out = UNIVERSIDADES;', sandbox, { filename: DATA_PATH });
} catch (e) {
    console.error('FATAL: could not load data file: ' + e.message);
    process.exit(1);
}
const UNIVERSIDADES = sandbox.__out;

if (!Array.isArray(UNIVERSIDADES) || UNIVERSIDADES.length === 0) {
    console.error('FATAL: UNIVERSIDADES empty or not an array');
    process.exit(1);
}
pass(UNIVERSIDADES.length + ' universities loaded');

// ---- Field checks ----
const seenIds = new Set();
const seenSiglas = new Set();

UNIVERSIDADES.forEach(function(u) {
    const tag = '[' + (u.id || '???') + '] ';

    REQUIRED.forEach(function(f) {
        if (u[f] === undefined || u[f] === null || u[f] === '') err(tag + 'missing required field: ' + f);
    });
    if (u.id) { if (seenIds.has(u.id)) err(tag + 'duplicate id'); seenIds.add(u.id); }
    if (u.sigla) { if (seenSiglas.has(u.sigla)) err(tag + 'duplicate sigla'); seenSiglas.add(u.sigla); }

    if (u.wikiUrl && !/^https:\/\//.test(u.wikiUrl)) err(tag + 'wikiUrl must be https URL: ' + u.wikiUrl);
    if (u.webUrl && !/^https?:\/\//.test(u.webUrl)) err(tag + 'webUrl must be http(s) URL: ' + u.webUrl);
    else if (u.webUrl && /^http:\/\//.test(u.webUrl)) warn(tag + 'webUrl is http (official site has no working TLS): ' + u.webUrl);
    if (typeof u.lat !== 'number' || u.lat < -56 || u.lat > -21) err(tag + 'lat out of Argentina range: ' + u.lat);
    if (typeof u.lng !== 'number' || u.lng < -74 || u.lng > -53) err(tag + 'lng out of Argentina range: ' + u.lng);
    if (u.fundada && !/^(1[6-9]|20)\d{2}$/.test(String(u.fundada))) err(tag + 'fundada not a plausible year: ' + u.fundada);

    // lastReviewed — review cycle
    if (u.lastReviewed) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(u.lastReviewed)) {
            err(tag + 'lastReviewed must be ISO YYYY-MM-DD: ' + u.lastReviewed);
        } else {
            const ageDays = Math.round((TODAY - new Date(u.lastReviewed)) / 86400000);
            if (ageDays > REVIEW_CYCLE_DAYS) warn(tag + 'lastReviewed ' + u.lastReviewed + ' is ' + ageDays + ' days old — due for 2-year review');
        }
    }

    // stats
    if (u.stats) {
        Object.keys(u.stats).forEach(function(k) {
            if (STAT_KEYS.indexOf(k) === -1) err(tag + 'unknown stats key "' + k + '" (schema drift?)');
        });
        const s = u.stats;
        if (s.careerYears !== null && (typeof s.careerYears !== 'number' || s.careerYears < 4 || s.careerYears > 9)) err(tag + 'careerYears implausible: ' + s.careerYears);
        if (s.studentCount !== null && (typeof s.studentCount !== 'number' || s.studentCount < 50)) err(tag + 'studentCount implausible: ' + s.studentCount);
        [s.graduationRate, s.immigrantPct].forEach(function(v, i) {
            if (v !== null && (typeof v !== 'number' || v < 0 || v > 100)) err(tag + ['graduationRate', 'immigrantPct'][i] + ' must be 0-100: ' + v);
        });
        if (s.avgGraduationYears !== null && s.avgGraduationYears !== undefined && (typeof s.avgGraduationYears !== 'number' || s.avgGraduationYears < 1 || s.avgGraduationYears > 20)) err(tag + 'avgGraduationYears must be 1-20: ' + s.avgGraduationYears);
        if (s.rankingNational !== null && s.rankingInternational === null && !u.redirectTo) warn(tag + 'rankingNational set but rankingInternational null (incomplete)');
        const missing = STAT_KEYS.filter(function(k) { return s[k] === undefined; });
        if (missing.length) warn(tag + 'stats missing keys (implicit null): ' + missing.join(', '));
    }

    // plan
    if (u.plan) {
        if (!u.plan.nombre || !u.plan.fuente) err(tag + 'plan missing nombre/fuente');
        if (!u.plan.ingresoNota) warn(tag + 'plan without ingresoNota (admission note)');
        if (!Array.isArray(u.plan.anios) || u.plan.anios.length === 0) err(tag + 'plan.anios empty');
        const codes = new Set();
        u.plan.anios.forEach(function(a) {
            if (!a.materias || !a.materias.length) err(tag + 'año ' + a.anio + ' has no materias');
            a.materias.forEach(function(m) {
                if (!m.codigo || !m.nombre) err(tag + 'materia without codigo/nombre in año ' + a.anio);
                if (codes.has(m.codigo)) err(tag + 'duplicate materia codigo: ' + m.codigo);
                codes.add(m.codigo);
                if (m.duracion && DURACIONES.indexOf(m.duracion) === -1) err(tag + m.codigo + ' invalid duracion: ' + m.duracion);
            });
        });
        u.plan.anios.forEach(function(a) {
            a.materias.forEach(function(m) {
                (m.correlativas || []).forEach(function(c) {
                    if (!codes.has(c)) err(tag + m.codigo + ' correlates with unknown codigo: ' + c);
                });
            });
        });
        if (u.stats && u.stats.subjectCount !== null) {
            const real = u.plan.anios.reduce(function(n, a) { return n + a.materias.length; }, 0);
            if (real !== u.stats.subjectCount) err(tag + 'subjectCount ' + u.stats.subjectCount + ' != plan materias ' + real);
        }
    } else if (!u.redirectTo) {
        warn(tag + 'no plan and no redirectTo (Phase 2 pending)');
    }
});

// ---- Report ----
console.log('=== validate-universidades ===');
console.log('');
ok.forEach(function(m) { console.log('  OK    ' + m); });
warnings.forEach(function(m) { console.log('  WARN  ' + m); });
errors.forEach(function(m) { console.log('  ERROR ' + m); });
console.log('');
console.log('Result: ' + ok.length + ' ok, ' + warnings.length + ' warnings, ' + errors.length + ' errors');

if (errors.length) {
    process.exit(1);
}
