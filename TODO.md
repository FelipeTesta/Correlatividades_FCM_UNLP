# TODO — Otras Universidades

Evolution plan for `universidades.html`. Keep updated together with `LOG.md` and the informativos (README.md, AGENTS.md, FLOW/universidades.dot).

## Status
- [x] Phase 1 — Visual base: navbar (app-navbar clone; states home/plan + dropdown), home = tabla + mapa, info modal, read-only tree, UNLP → Modo Árbol
- [x] Real plans: UBA (Plan 09 — 42 materias, 7 años CBC→PFO; fmed.uba.ar + correlativas Hornero) + UNC (43 materias, 503 correlativas; fcm.unc.edu.ar + Hornero)
- [x] 📍 focus button per university (scroll to map + z11 center + pin pulse)
- [x] Subject status system in trees (session-only): 🔘→🟢 on ALL subjects (PC click / mobile 1s hold), blue outline = "puede cursar" (all correlativas marked; initial subjects never outlined)
- [x] Metric columns live in table (values: UNLP 6/40, UBA 6.5/42, UNC 6/43; rest "—")
- [x] Stats batch pass (2026-09-28): `distanceToCapitalKm` 24/24 filled (haversine → CABA, uniform recompute — UNLP 57→53); `careerYears` +5 (unr 6 oficial, uncuyo 6, unt 7, unmdp 6, unse 6 vía Hornero); `subjectCount` +4 (uncuyo 61, unt 46, unmdp 50, unse 65 — UNR omitido: Hornero lista 17, incompleto); uner ranking 30/4341 (EduRank Medicine 2026); `rankingSource: null` explícito ×10; descripcion ×10. Validator: 22 WARNs (solo plan pendiente), 0 errors
- [ ] Study plans DEPRIORIZED by user (2026-09-28): completing the rest of the table columns comes first (§2.3)
- [x] webUrl → página del curso/facultad de Medicina (2026-09-29): las 24 universidades apuntan ahora a la página oficial de Medicina (verificado HTTP 200 + título/ocurrencias 'medicina'; Edge para TLS roto). Excepciones http (sitio sin TLS válido): unchaus `http://medicina.uncaus.edu.ar/`, unsalta `http://fsalud.unsa.edu.ar/salud/` → WARN en validador. unlar: sitio caído desde la red del usuario (timeout), URL confirmada por índice web. Validator: 24 loaded, 0 errors, 23 WARNs (21 plan pendiente + 2 http)
- [x] Structural cleanup (2026-09-29): **unmoreno + unfv REMOVIDOS** (verificación oficial: unm.edu.ar oferta sin Medicina / UNFV institución fantasma absorbida por UNAJ 2009); **unrn AÑADIDO** (Medicina Sede Andina Bariloche, Plan 2021 Res. ME 350/22, studentCount 143, careerYears 6, distanceToCapitalKm 1346, webUrl carrera Medicina verificado 200). **UNSAdA: NO se registra** (oferta oficial sin Medicina — ver §2.1)
- [x] Ingreso notes on trees (UBA = CBC; UNC = curso de nivelación) — info line moved below tree
- [x] Table simplified: sigla only + full name on hover; Ciudad = short region tag (per-uni `region` field — centralized)
- [x] Map drag fix: wider maxBounds + viscosity 0.35 + no inertia
- [x] Centralized registration: each university = ONE object in `APP/universidades_data.js` (region + stats + lastReviewed inline; `UNI_REGIONS` map removed) + integrity validator `tools/validate-universidades.js` (schema, correlativas, staleness — run before commits)
- [x] Review cycle: `lastReviewed` (ISO date) per university — bumped on every verification pass; validator warns when > 2 years old
- [x] UBA research (1st Phase 2 pass): QS Medicine 2026 #133 world (Excel REF) / #1 nacional; 28% extranjeros (Facultad 2024, Chequeado/UBA); español C1 (rec.uba.ar, dic 2023); livingCostUsd 1545 (Numbeo Sep 2026, alquiler+gastos sin margen — decisión usuario) — gaps in §2.6 (studentCount carrera = 42677 vía Cuadro 2.1.16)
- [x] UNLP research (2nd Phase 2 pass): QS Medicine 2026 501-550 (Excel REF) / #3 nacional; anuario 2024 (SIU-Araucano, via infoplatense 2026-07-29): 38,5% extranjeros por nacimiento (facultad); español B2 + método Tradicional (med.unlp.edu.ar, LING); livingCostUsd 700 (Numbeo La Plata basket-derived, sin margen, low contributors flag) — gaps in §2.6 (studentCount carrera = 16879 vía Cuadro 2.1.16)
- [x] Ranking source switched: QS World general → QS Subject MEDICINE 2026 (user Excel in REF/) — more relevant. Nacional = orden entre argentinas: UBA 1/133, UNC 2/351-400, UNLP 3/501-550. Fuera de QS → fallback EduRank Medicine 2026 (aprobado por usuario): unlam 36/5360 … uner 30/4341 (lista completa en §2.3 y README)
- [ ] Phase 2 — Remaining data research (delegate to Read agents — specs below)
- [x] gradRate/avgGradYears schema (2026-09-29): clave nueva `avgGraduationYears` (validator 13 STAT_KEYS, rango 1-20); research exhaustiva = sin fuente per-uni en Argentina → ambos `null` documentados en §2.6 (decisión usuario)
- [x] Phase 3 — Sortable metric columns in the table (2026-09-29): 12 columnas ordenables (Universidad, Ciudad, 10 métricas), ciclo 3 estados asc→desc→orden-data, nulls siempre al final, aria-sort, primera columna sticky + cabecera sticky ≥1100px

## Data policy
- Data age: only info published/updated within the last 2 years; older = discard; if all sources exhausted → leave field `null` (renders "—") and log it in §2.6
- `duracion`: only set when verified per-subject from official sources; otherwise `null` → renders "—" (never invent)
- `correlativas` = union of para-cursar + para-rendir-final (deduplicated)
- Intra-year dependencies auto-split into sub-rows by `computeYearRows()` (a subject never shares a line with its prerequisite)
- `livingCostUsd`: median of researched rent figures (studio/1-bed) + typical student expenses (food/transport) — **direct value, NO margin (user decision 2026-09-29)** — doesn't need to be perfect

## Centralized registration (cadastro)
Adding a university = ONE object in `APP/universidades_data.js`:
1. Required: `id, sigla, nombre, facultad, ciudad, provincia, region` (PBA/CABA/GBA/CBA/SF/MZA/TUC/COR/…), `lat, lng, fundada, descripcion, wikiUrl, webUrl, lastReviewed` (ISO date)
2. Optional: `redirectTo` (plan lives elsewhere, e.g. UNLP → Modo Árbol), `stats` (13 keys, `null` = "—"), `plan` (`nombre, fuente, ingresoNota, anios[{anio, etiqueta?, materias[{codigo, nombre, duracion?, correlativas[]}]}]`)
3. Run `node tools/validate-universidades.js` — must exit 0 errors
4. Check in browser: table row, map pin, modal, tree (if plan)

Table rows, navbar menu, map pins, modal and tree are ALL generated from the data — no other file needs editing.

## Review cycle (2 years)
- `lastReviewed` = last date that university's info was verified against sources
- Bump it on every real verification/research pass (not on cosmetic edits)
- Re-verify every ~2 years: rankings (annual editions), stats, living costs, study plans
- Validator flags `lastReviewed` older than 730 days (WARN)

## Phase 2 — Research per university

### 2.1 Structural checks
- [x] Medicina en UNLaM/UNPAZ: CONFIRMADA (ambas con studentCount en Cuadro 2.1.16: 1975 / 2310)
- [x] UNFV/UNMoreno: SIN Medicina → **removidos de data.js (2026-09-29)** — verificación con fuente oficial: UNMoreno oferta completa sin Medicina (unm.edu.ar/?oferta-academica=carreras-de-pregrado-y-grado, solo 3 dptos); UNFV = universidad fantasma (proyecto 2009 absorbido por la UNAJ; artículo Wikipedia inexistente 404; la Medicina de Florencio Varela es la UNAJ, ya registrada)
- [x] NEW CANDIDATES via Hornero: UNMdP (50 materias) + UNSE (65) → YA REGISTRADOS en data.js
- [x] unrn registrado (2026-09-29): Sede Andina Bariloche, carrera nueva Plan 2021, Res. ME 350/22, 6 años, inscripción 2027 abierta 31/ago→16/oct/2026 (unrn.edu.ar/carreras/Medicina-81)
- [x] **UNSAdA NO registrada** (2026-09-29) — oferta oficial sin Medicina (unsada.edu.ar/academico/oferta-academica: solo Fonoaudiología/Enfermería/Podología/Gerontología/Acompañamiento Terapéutico); los "7 alumnos" del Cuadro 2.1.16 no corresponden a una carrera de Medicina existente
- [x] Candidatos de asesorías (CABA/GBA) descartados por Cuadro 2.1.16 SPU = 0 alumnos Medicina: UNQ, UNLanús, UNGS, UNLuján, UNRC (EduRank las lista por output de investigación, NO por existencia de la carrera)
- [x] `webUrl` oficial → página de Medicina para todas (2026-09-29, ver batch en Status); `fundada`/`facultad`/`wikiUrl` verificados en el pase estructural. Re-verificación de facultades sospechosas (2026-09-29): **unchaus ✓** (resoluciones cdn.uncaus.edu.ar: "Carrera de Medicina - Departamento de Ciencias Básicas y Aplicadas"), **unvime CORREGIDO** → "Escuela de Medicina" (site oficial; era "Escuela de Ciencias de la Salud"; + careerYears 6, Plan R.R. 822-2018), **unlar**: sitio caído desde ambas redes — facultade sin verificar (dato Gemini provisional), webUrl confirmada por índice web

### 2.2 Real study plans — DEPRIORIZED (user 2026-09-28): table stats first
- Shortcut: Hornero pages exist for UNCuyo (61 materias), UNR (17 — verify completeness vs official), UNT (46), UNMdP (50), UNSE (65), UNLP (41): `https://www.horneroapp.ar/carreras/<id>-medicina/` — always cross-check against official faculty pages. Pages already downloaded + parsed → `%TEMP%\hornero_plans.json`
- [ ] Per-subject `duracion` from official programas (current: UBA CBC = cuatrimestral, UBA 2°-6° = anual, PFO = anual — from general knowledge, verify; UNC = all "—" pending)
- [ ] Official source URL in `plan.fuente` per university

### 2.3 Metrics — columns live in the table, fill the values (schema `stats`)
- [x] Column rendering + format — `UNI_STAT_COLUMNS` in `universidades.js`
- [x] `careerYears` — unlp 6, uba 6.5, unc 6, unr 6 (oficial fcm.unr.edu.ar Plan 2024), uncuyo 6, unt 7, unmdp 6, unse 6 (últimos 4 = Hornero JSON-LD, cross-check oficial pendiente); [ ] el resto
- [x] `graduationRate` + `avgGraduationYears` — **KNOWN GAP documentado (2026-09-29, decisión usuario)**: no existe fuente pública per-universidad en Argentina para "egreso en tiempo teórico" ni "duración real promedio" (los 2 indicadores de REF/AGENTS.txt). Ambos campos quedan `null` (render "—") en las 24. Ver §2.6 detalle de fuentes agotadas + cifras nacionales de referencia
- [x] `livingCostUsd` — **24/24 COMPLETO (batch 2026-09-29)**. uba 1545, unlp 700 (Numbeo, alquiler + gastos, **SIN margen ×1.2 — decisión del usuario 2026-09-29; los valores en data.js son CORRECTOS, no "corregir" a 1850/830**). Resto: 5 batches de a 5 ciudades (delegados). Valores: unc 825 (Numbeo 2026-08-29, HIGH), unr 745, unrn 680, unlam 600, unpaz 600, unaj 600 (Florencio Varela), unl 570, uncuyo 540, unt 510, unpsjb 510, unicen 500, uner 500, uncomahue 480, unsalta 450, unmdp 450, unvime 430, uns 410, unvm 400, unlar 370, unne 370, unse 350, unchaus 330. Casi todos = Estimated LOW/MEDIUM (Numbeo sin datos) 2026-09-29 → confiabilidad baja. unfv descartado junto con su registro.
- [x] `studentCount` — 25/25 completo y verificado contra Cuadro 2.1.16 SPU Anuario 2024 (alcance CARRERA Medicina, columna EST): uba 42677, unlp 16879 (los valores 47868/23838 de facultad completa en §2.6 estaban fuera de alcance → descartados)
- [x] `immigrantPct` — **13/24 (batch 2026-09-29)**: unlp 38.5 (anuario UNLP, facultad) + uba 28 (UBA oficial 2024, Facultad; via Chequeado 2026-05-13) pre-existentes conservados (scope carrera/facultad, mejor que la base); +11 de la tabla del usuario (42 escuelas EduRank, % inmigrantes, scope UNIVERSIDAD-wide — "nem todos são necessariamente medicina, mas pode servir como base"): unc 3.1, unr 31.4, unt 1.0, unmdp 11.8, unl 0.7, uns 0.2, uncuyo 2.3, uncomahue 8.0, unne 4.1, uner 3.4, unlam 7.4. UNSa "—" en la tabla → null. Null restantes (fuera de la tabla, investigación pendiente): unpaz, unaj, unchaus, unicen, unlar, unrn, unpsjb, unse, unsalta, unvm, unvime
- [x] `spanishLevel` — **7/24 (batch 2026-09-29)**: uba C1, unlp B2, unc B2, uncuyo B1/B2, unr Certificado, unlar CELU, unaj B2. Convención: CEFR si hay nivel; certificado sin nivel → 'CELU'/'Certificado'; rango explícito → 'B1/B2'; CELU "intermedio" → 'B2' (pie de página UNC: AVANZADO=C1, INTERMEDIO=B2, BÁSICO=B1). 17 buscadas → null (sin requisito publicado). Ver §2.6 detalle
- [x] `subjectCount` — unlp 40, uba 42, unc 43, uncuyo 61, unt 46, unmdp 50, unse 65 (Hornero, cross-check pendiente; UNR = 17 incompleto → null); [ ] research the rest
- [x] `rankingNational` + `rankingInternational` — 14/24 (unlp 3/'501-550', uba 1/133, unc 2/'351-400' QS Medicine 2026; 10 EduRank + uner 30/4341). GAPS: 10 unis fuera del top-42 EduRank (unpaz, unaj, unchaus, unicen, unlar, unpsjb, unse, unrn, unvm, unvime) → null documentado, no hay fuente local
- [x] `teachingMethod` — **14/24 (batch 2026-09-29)**: valores únicos PBL / Tradicional / Híbrido (vocabulario del usuario). Fuente = tabla de investigación del usuario (42 escuelas EduRank clasificadas); regla: entradas con DOS opciones → 'Tradicional'. PBL: unlam, unr, unl, uncuyo, uns, uner. Tradicional: unlp, uba, unt, unne, unmdp, uncomahue. Híbrido: unc, unsalta. Null (fuera de tabla EduRank, sin evidencia): unpaz, unaj, unchaus, unicen, unlar, unrn, unpsjb, unse, unvm, unvime. NOTA: unmdp venía "PBL/híbrido" → regla de dos opciones → Tradicional. Taxonomía AR verificada: Coneau archivos/539.pdf (clases teóricas, casos problema, tutorías, pasantías); unlp 'Tradicional' pre-existente consistente
- [x] `distanceToCapitalKm` — 24/24 lleno: haversine calculado sobre lat/lng propios → CABA (-34.6037,-58.3816); campo = distancia a CAPITAL NACIONAL (uba 0, unlp 53, unrn 1346)

### 2.4 General info
- [ ] `descripcion` richer (2-3 sentences, Wikipedia reference)
- Plan-derived stats (subjects/years) are computed automatically by the app

### 2.5 Ingreso notes (`plan.ingresoNota`)
- [x] UBA (CBC — fmed.uba.ar) + UNC (curso de nivelación — Wikipedia UNC)
- [ ] Ingreso note for each new university added in Phase 2
- [ ] Consult real students' opinions (forums, Reddit, student unions) to make the notes realistic — admission conditions + what starting the degree feels like at each university

### 2.6 Research log (per university — sources, dates, gaps)
- **UBA** (2026-09-28): QS World 2026 #84 / #1 LatAm (infobae 2026-06-17 + multiple) — SUPERSEDED as displayed ranking by QS Medicine 2026 #133 (user Excel in REF/, national 1). Extranjeros 28% + 13.403 + 47.868 total Facultad 2024 (Chequeado 2026-05-13 / 2026-07-29, citing UBA; gov's 39% = different methodology, discarded). NOTA ALCANCE: 47.868 = facultad completa → NO es el valor de `studentCount` (cuadro correcto = 42677 carrera Medicina, Cuadro 2.1.16). Español C1 (academica.rec.uba.ar, policy since Dec 2023 — still current per official page). livingCost: Numbeo CABA 2026-09-23 (rent 1-bed center 749/outside 543 + expenses 899) → **1545 sin margen (decisión del usuario; el 1850 con margen quedó desactualizado)**. GAPS: teachingMethod (fmed.uba.ar 404 p/ agentes — reintentar con navegador/usuario), graduationRate UBA-specific (solo nacional 2022, fuera de ventana), THE 2026 (404), ARWU 2025 (stale), SCImago (no accesible) → campos null hasta verificación
- **UNLP** (2026-09-28): QS Medicine 2026 501-550 (user Excel in REF/) → nacional 3. studentCount 23.838 + immigrantPct 38,5% (9.173 nacidos en el extranjero): anuario estadístico 2024 UNLP (SIU-Araucano) via infoplatense 2026-07-29; gov's 51% = carrera Medicina + criterio nacimiento — metodología distinta, descartada. NOTA ALCANCE: 23.838 = facultad completa → NO es el valor de `studentCount` (cuadro correcto = 16879 carrera Medicina, Cuadro 2.1.16); immigrantPct 38.5 conservado (sobre facultad, única fuente). Español B2: CELU Intermedio Muy Bueno / SIELE 700 / CEI B2 / CertEA B2 (med.unlp.edu.ar Inscripción 2027, extranjeros — LING). teachingMethod Tradicional: anual + cuatrimestral + bimestral, RM 578/25 (med.unlp.edu.ar Plan de Estudio — LING). livingCost: Numbeo La Plata 2026-03-04 (LOW reliability: 7 contributors; rent center 350.79 / outside 237.90; summary widget absent) → basket-derived: rent median 294 + expenses ~400 = **700 sin margen (decisión del usuario)**. Dist. capital 53 km (haversine uniforme). Ingreso: preinscripción Guaraní nov-dic, título secundario (para ingresoNota). GAPS: graduationRate — UNLP_informe_egreso_2025.pdf en transparencia.unlp.edu.ar requiere LOGIN SAML → PEDIR DESCARGA MANUAL AL USUARIO
- **Estructura + webUrl** (2026-09-29): alta unrn (2008, Sede Andina Bariloche, Medicina Plan 2021 Res. ME 350/22, 143 estudiantes Cuadro 2.1.16, 6 años); baja unmoreno (Wikipedia 2026-05-27: ninguna carrera de Medicina) + unfv (ausente Cuadro 2.1.16, sin artículo Wikipedia, agente sin evidencia). webUrl → página de Medicina en las 24: método = curl `--http1.1 -A Chrome/126` (status + ocurrencias 'medicina' en body) + websearch + Edge para TLS roto. Verificados 200: fmed.uba.ar, salud.unlam.edu.ar, unpaz.edu.ar/medicina, fcm.unc.edu.ar, fcm.unr.edu.ar, fcm.unl.edu.ar, fcm.uncuyo.edu.ar, fm.unt.edu.ar, med.unne.edu.ar, dcs.uns.edu.ar, medicina.mdp.edu.ar, unaj.edu.ar/.../medicina, salud.unicen.edu.ar (sitio en mantenimiento pero con links INGRESO 2027/Medicina), fcs.uner.edu.ar/medicina, medicina.uncoma.edu.ar, fcn.unp.edu.ar/.../medicina.html, fcm.unse.edu.ar, unvm.edu.ar/medicina, unvime.edu.ar/em/medicina/, unrn.edu.ar/carreras/Medicina-81. HTTP sin TLS: unchaus (https = ERR_SSL_UNRECOGNIZED_NAME_ALERT), unsalta (https rechazado + Bitdefender). unlar: timeout desde red del usuario (170.210.152.122), URL vía índice web. Validador: regla webUrl relajada a http(s) + WARN si http
- **Agent tests** (2026-09-28): LING (ling-3-0-flash-sante-Read) 2 runs UNLP = high-value (oficial med.unlp.edu.ar, Guaraní, RM 578/25), run 1 vacío → retry. Gemini (gemini-2.5-flash-Read quota exceeded ×2; flash-lite-Read): GOOGLE BLOCKED (mismo webfetch, CAPTCHA) — no Google Search grounding en este setup. BYPASS REAL: navegador Edge del usuario (Google carga sin CAPTCHA, JS widgets renderizan) — usar edge-devtools para búsquedas Google de ahora en adelante

- **Verificación de existencia + EduRank completo** (2026-09-29): (1) UNMoreno — oferta oficial completa fetcheada (unm.edu.ar): 17 carreras, 3 departamentos, CERO salud → baja definitiva. (2) UNSAdA — oferta oficial completa fetcheada (unsada.edu.ar/academico/oferta-academica): 6 carreras salud SIN Medicina → no registrar. (3) UNFV — wiki es 404 (institución inexistente); proyecto absorbido por UNAJ 2009 (Diario Vespertino: "Comisión Pro Apertura de la UNFV" → UNAJ). (4) UNRN — página oficial carrera fetcheada: título Médico/a, 6 años, Sede Andina Mitre 630 Bariloche, Plan 2021 Res ME 350/22, ingreso 3 etapas (CPU virtual oct-dic 2026 + curso disciplinar presencial feb 2027 + MEM), dirección Germán Guaresti → registrada con studentCount 143 (Cuadro 2.1.16), dist 1346 haversine. (5) EduRank Medicine Argentina fetcheado COMPLETO (edurank.org/medicine/ar/, 42 escuelas, actualizado 2026-03-15): confirma todas las posiciones EduRank en data.js (UNR 5/1364, UNT 6/1859, UNMdP 7/1915, UNL 8/1918, UNS 9/2002, UNCuyo 10/2072, UNComahue 14/2387, UNNE 17/3040, UNSa 21/3269, UNER 30/4341, UNLaM 36/5360) + las 10 restantes confirmadas FUERA del top-42 → null definitivo. (6) Re-verificación de datos del agente concurrente: UNER 30/4341 ✓ exacto vs EduRank; unlp dist 53 ✓ haversine; unt careerYears 7 ✓ confirmado en oficial fm.unt.edu.ar ("duración de siete años")

- **graduationRate + avgGraduationYears — FUENTES AGOTADAS, gap documentado** (2026-09-29, decisión usuario: documentar, no rellenar): schema nuevo `avgGraduationYears` (duración real promedio, 1-20 años) = 2º indicador de REF/AGENTS.txt; validator STAT_KEYS 13. Fuentes escaneadas SIN resultado per-uni/carrera: SPU Anuario 2023 completo (rv_anuario_finales_todos.zip, todos los xlsx full-text — cap. 1.2 NO tiene Cuadro 1.2.4), adelanto parcial 2024, CSV 2022, Síntesis 2023-2024 PDF (95pp), anuario UNLP 2023 PDF (solo permanencia/trayectorias), CONICET PH-CRUP-2025 (CRUP = solo universidades PRIVADAS), websearch ×N. Solo existen cifras NACIONALES: 26,6% grado 2023 (estatal 23,2% / privado 38,3%, El Día 2024-06-24 vte. Depto. Información Universitaria), 25,1% 2022, 29,6% 2021; UNCuyo "90% más que teórico" institucional vía Guaraní (Clarín 2023). España SIIU publica tasa de idoneidad por carrera — Argentina no. Pilot delegado (5 unis) = 0/5. Cada universidad guarda esto en su análisis interno SIU Guaraní → sin ventana pública. UNLP: informe egreso 2025 tras login SAML (descarga manual posible → si el usuario la aporta, se rellena unlp)

- **spanishLevel — batch 7/24, 17 null documentado** (2026-09-29): convención de valores cortos (filtro de tabla usa String(v) crudo → sin frases). Nuevos: **unc B2** (unc.edu.ar/internacionales/requisito-de-idioma, fetcheada ✓: FCM Medicina exige CELU "Intermedio Alto"; pie de página CEFR AVANZADO=C1/INTERMEDIO=B2/BÁSICO=B1; publish_date 2022-09-05 pero página viva en sitio con logo 2025 → log como live-page); **unr Certificado** (fcm.unr.edu.ar/ingresantes, fetcheada ✓: "Certificado de Lengua Española – Aspirantes No Hispanos Parlantes (Copia legalizada de Estándares Reconocidos por UNR, u otras certificaciones Internacionales reconocidas)" — sin nivel CEFR); **uncuyo B1/B2** (uncuyo.edu.ar/international-students: "A B1/B2 Spanish language proficiency level certificate"; EHU fact-sheet "intermedio-avanzado" = intercambio, corrobora); **unlar CELU** (unlar.edu.ar/.../ingresantes/requisitos-de-ingreso/extranjeros vía websearch: acredita suficiencia con "Certificado de examen CELU, del Consorcio ELSE, o Aprobación del examen respectivo instrumentado en la UNLaR"); **unaj B2** (unaj.edu.ar/ingresantes, fetcheada ✓: CELU "nivel intermedio", presentación excluyente → B2 por mapeo UNC). Corroboración unlp B2 existente (med.unlp.edu.ar FAQ): CELU ≥ Intermedio Muy Bueno / CEI B2 / CertEA B2, vigencia 3 años. FALSOS POSITIVOS descartados: unpaz (enlace de menú Centro de Idiomas CEDLE, no requisito de ingreso), UNS (página de extranjeros = shell dinámica vacía; tha.de "Spanish B1 recommended" 2024 = solo intercambio), UNL (CELU Centro de Idiomas ≠ requisito de admisión). Null tras búsqueda: unlam, unpaz, unl, unt, unne, uns, unmdp, unchaus, unicen, uner, uncomahue, unrn, unpsjb, unse, unsalta, unvm, unvime. UNT: existe CEPE (certificado ELE propio) pero sin link de exigencia en ingreso. Método: delegado nvidia-nemotron (batches de 5, mayormente 'not found' honestos) + websearch propio para verificar positivos

- **teachingMethod — batch 14/24, vocabulario único del usuario** (2026-09-29): tras 3 rondas delegadas mayormente 'not found' (las facultades AR declaran ACTIVIDADES no etiquetas — taxonomía Coneau coneau.gob.ar/archivos/539.pdf: clases teóricas, casos problema, tutorías, pasantías), el usuario aportó tabla propia de investigación (42 escuelas EduRank clasificadas) + reglas: valor único de {PBL, Tradicional, Híbrido} y entradas con DOS opciones → 'Tradicional'. Aplicado: **PBL** unlam, unr, unl, uncuyo, uns, uner; **Tradicional** unlp, uba, unt, unne, unmdp (era "PBL/híbrido" → regla), uncomahue; **Híbrido** unc, unsalta. Null (fuera de la tabla): unpaz, unaj, unchaus, unicen, unlar, unrn, unpsjb, unse, unvm, unvime. Ancla de edición: teachingMethod + distanceToCapitalKm (km únicos por uni). NOTA: universidades.js:439 tooltip dice "mixto" → debería decir "híbrido" (archivo de otro agente)

- **immigrantPct — batch 13/24 + búsqueda de gaps** (2026-09-29): +11 de la tabla del usuario (% inmigrantes 42 escuelas EduRank, alcance UNIVERSIDAD — "nem todos são necessariamente medicina, mas pode servir como base"): unc 3.1, unr 31.4, unt 1.0, unmdp 11.8, unl 0.7, uns 0.2, uncuyo 2.3, uncomahue 8.0, unne 4.1, uner 3.4, unlam 7.4; UNSa "—" → null. Conservados unlp 38.5 + uba 28 (alcance facultad/carrera, fuentes propias > base). Búsqueda delegada (nvidia-nemotron, 3 batches = 12 unis): 10 'not found' honestos (paz, aj, chaus, icen, lar-noticia, rn, psjb, se, salta, vm, vime); **unlar**: riojavirtual.com.ar 2024-12-04, decana Cs. de la Salud: "No se llega a un 2%" (150 extranjeros total, medicina predominante) → solo cota, sin número exacto → null con fuente anotada. Null restantes: unpaz, unaj, unchaus, unicen, unlar, unrn, unpsjb, unse, unsalta, unvm, unvime

## Phase 3 — Future features
- [ ] Sortable/filterable columns in the table by `stats` metrics (cost, graduation %, ranking, distance...)
- [ ] Metric badges in table rows

## Maintenance
- Update this file together with `LOG.md` after each session
- Informativos: README.md (usage), AGENTS.md (IMPLEMENT), FLOW/universidades.dot (flow)
- CARTO API key lives in `APP/universidades.js` (tile URL) — rotate in the CARTO dashboard if abused

## Vacunas — dTpa condicional + vacunas opcionales ✅ (2026-10-05)
- dTpa exigida solo al poder cursar **Pediatría (PD001, 5º año)** — `requiereDtpa()` en `APP/vacunas.js` (materias.js + state-cache.js + requisitos.js ahora cargan en vacunas.html). Antes de eso: solo dT.
- Opcionales del Calendario Nacional 2026 (fiebreAmarilla 1 dosis de por vida —OMS, hepatitisA, varicela, neumococica VNC20, meningococica, fiebreHemorragica Candid#1): listadas **atenuadas (opacity 0.5) y sin ⚠**, con botón Agregar. La dTpa no exigida se muestra igual (atenuada, sin ⚠).

## Vacunas — Mapa de Vacunas y Cepas (interactivo) ✅ (2026-10-05)
Página: `vacunas.html` · Datos: `APP/vacunas_fichas.js` · Lógica: `APP/vacunas.js` (layout calculado a mano — **venn.js/d3 descartados** en la iteración m0413: el diseño de 2 capas no necesita la librería).

Diseño final (según feedback m0376-m0418):
1. **Dos capas**: capa base = círculos maciços semitransparentes **por PATÓGENO** (bacterianas #f59e0b / virales #22d3ee, nombre dentro en 1-2 líneas, campo `short` para nombres largos); capa superior = **contornos por VACUNA** (círculo mínimo que engloba sus patógenos +16px, nombre sobre el borde en `labelAngle` anti-solape, halo negro). `pointer-events: all` en el contorno → todo el disco clickeable (fix "fichas no abren": `fill:none` solo recibe clics en el trazo).
2. **Anidamiento real**: dT ⊂ dTpa ⊂ Quíntuple forzado por `vennEnsureSubsets()`; vacuna Hep B solapa Quíntuple (patógeno compartido). En zonas compartidas clickea el círculo interior (intuitivo).
3. **Filtros por patología** (22 checkboxes): vacina oculta si ALGUNO de sus patógenos está desmarcado (despeja el gráfico). Default todo marcado.
4. **Ficha por vacuna** (UNA por tipo de vacuna del calendario, no por marca): Tipo(s) —tags si hay varios—, Marcas —tags "marca — empresa" con detalle en tooltip—, Esquema, Indicación, Patógenos, Nota FCM (dTpa), En desarrollo/estado del arte, Enlaces oficiales MSAL/OMS.
5. **"Vacunas Necesarias/Faltantes" colapsable** (`toggleFaltantes()` — solo la lista, input de fecha siempre visible).
6. **Rodapé**: Calendario Nacional MSAL + SADI + ANLIS Malbrán.
7. Cobertura: calendario NACIONAL completo (19 vacunas / 23 patógenos: BCG, Quíntuple, dTpa/DTP, dT, Hep B, Polio, Rotavirus, Neumococo, Meningococo, Gripe, Triple Viral, Hep A, Varicela, VPH, Fiebre Amarilla, FHA, VSR, COVID-19, Rabia).
8. Verificado live (localhost:5500): 19 contornos clickeables (16 directos + 3 del cluster anidado → anillo interior), 0 colisiones de texto, 0 fuera de canvas, filtro Difteria oculta Quíntuple/dTpa/dT, fichas con tags, subconjuntos anidados ✓.

## Mini calendario ✅ (implementado 2026-10-04)
Implementado en `arbol.html` + `index.html` (página principal, debajo de la barra de progreso, tag "Inscripción" tras el nombre en Puede Cursar) + `APP/calendar_data.js` + `APP/minical.js` (strip 53 semanas, tooltips, drag móvil, stickers "Inscripción", worker mensual día 1). Componente CSS compartido en `base.css` (skins: arbol transparente / principal caja centrada). Proceso: `FLOW/minical.dot`. Abajo queda la especificación original + los datos de referencia usados.
Em modo árbol, dentro do `tree-top-bar`, vamos criar uma espécie de mini calendário; a ideia é usar esse calendário visualmente e indicar períodos próximos de inscrições.

O formato será por emojis, onde vamos representar cada semana do ano, e com hover vamos dizer as informações dos dias e meses e eventos importantes que acontecem naquela semana geralmente, podemos criar um trigger para conferir e atualizar a cada mês ou periodo >3m;

No calendário da UNLP/Argentina:

⚫ Vacaciones de verano: dezembro → fevereiro/início de março
🔘 Período letivo: aproximadamente março → dezembro
🔵 Vacaciones de invierno: aproximadamente duas semanas em julho
🟡 Inscrições (Materias Obrigatórias): nos períodos específicos de cada ano/bimestre
🟣 Inscrições (Materias Optativas) - se sobrepor, deixar amarelo como preferencia
🟠 Ingresso/inscrição de ingressantes: principalmente no fim do ano anterior ao ingresso
🟢 SEMANA ATUAL (mudar dinamicamente, quando sobrepor, pode criar uma animação e intercalar entre verde e a cor que ficou de fundo)

```
JAN         FEV         MAR      ABR         MAI          JUN       JUL              AGO         SET     OUT    NOV     DEZ
⚫⚫⚫⚫ ⚫⚫⚫⚫ ⚫🔘🔘🔘 🟡🔘🔘🔘 🔘🔘🔘🔘 🟡🔘🔘🔘 🔵🔵🔘🔘 🟡🔘🔘🔘 🔘🔘🔘🔘 🟡🔘🔘🔘 🟣🟣🟣🔘 🔘🔘🔘⚫
```

A lógica fica:
⚫ verão → 🔘 início das aulas → 🟡 inscrição 1º bimestre → 🔘 → 🟡 inscrição 2º → 🔵 inverno → 🟡 inscrição 3º → 🔘 → 🟡 inscrição 4º → 🔘 → 🟣 processo de ingressantes → ⚫ verão.

Hover na bolinha, exemplo:
05/02-04/05 | Inscripciones 1er Bim

No celular temos que deixar isso o mais compacto possivel horizontalmente (não queremos isso em duas linhas). Talvez deixar saindo da tela centralizado na semana atual, mas com possibilidade de arrastar (sem scrollbar);

### Objetivo
A ideia é, além de ser uma referencia visual resumida do que vai acontecer durante o ano, também incluir uma marcação nas matérias pode cursar, quando estiverem chegando os períodos de inscrição (2 semanas antes); precisamos criar um sistema para saber quando abre cada matéria, matérias anuais só nas inscrições de abril, as bimestrais a cada inscrição, as quatrimestrais só na 1ra e 3ra inscrição. Salud Publica 1 só abre no segundo quad e sp2 só abre no primeiro, pesquisar de cada matéria;
matérias do primeiro ano abrem as inscrições em março (pesquisar) e as matérias do 2do em diante (anuais) abrem em abril, pesquisar.

A marcação deve entrar só nas matérias PODE CURSAR ou OPTATIVAS (PODE CURSAR), e deve sumir assim que passar o período de inscrições; podemos armazenar só a semana, o usuário tem que procurar saber o dia e horário correto de se inscrever por conta própria;

marcação: incluir uma tag/sticker `Inscripción` no canto inferior direito do card da matéria, com um hover "Inscripciones Proximas" ou similar;

### Inscrições de 2026 — Medicina UNLP
Período	Inscrição das obrigatórias
1º bimestre	14/04 às 09:00 → 15/04 às 23:59
2º bimestre	08/06, escalonada por ano
3º bimestre	04/08 a 14/08, escalonada por ano
4º bimestre	06/10 às 09:00 → 09/10 às 23:59

1º bimestre:

5º: 14/04 às 09h
4º: 14/04 às 11h
3º: 14/04 às 13h
2º: 14/04 às 15h
fechamento: 15/04 às 23:59

2º bimestre:

5º: 08/06 às 09h
4º: 08/06 às 11h
3º: 08/06 às 13h
1º/2º: 08/06 às 15h

3º bimestre:

1º: 04/08 às 09h
5º: 06/08 às 09h
4º: 06/08 às 13h
3º: 07/08 às 09h
2º: 10/08 às 16h
fechamento: 14/08 às 23:59
E o 4º bimestre já foi publicado

Aqui está a correção mais importante: a inscrição do 4º bimestre já foi anunciada em 25/09/2026.

Obrigatórias — 4º bimestre:

5º ano: 06/10 às 09h
4º ano: 06/10 às 11h
3º ano: 06/10 às 14h
2º e 1º ano: 06/10 às 17h
encerramento: 09/10 às 23:59

Optativas:

≥30 finais aprovados: 08/10 às 09h
≥17 finais: 08/10 às 11h
sem filtro: 08/10 às 14h
encerramento: 09/10 às 23:59

### Pesquisa pendente (datos `research:true` en calendar_data.js)
Confirmar com fontes oficiais e remover o flag:
- [x] Início/fim do período letivo 2026 — OFICIAL PNG FCM (`calendario_academico_2026.png`, leído por Gemini 2026-10-04): letivo 23/03→18/07 + 03/08→05/12; anuales 23/03 (1º) / 20/04 (2º+)→21/11; cuatrimestrales 2º ciclo →14/11
- [x] Férias de inverno exatas — OFICIAL: receso 20/07→02/08 (PNG FCM + ic.info.unlp)
- [x] Férias de verão fim exato — OFICIAL: aulas 1º año 23/03 → verano hasta 22/03; bim 4º termina 05/12 (PNG FCM)
- [x] W0: data real da inscrição de março 1º año — OFICIAL: 11/03 11:00→13/03 23:59 SIU (cartelera noticia 241)
- [ ] W2: fechamento da inscrição do 2º bimestre (placeholder: 09/06 23:59 — cartelera 255 publica solo apertura 08/06)
- [x] Optativas: janelas dos bimestres 1–3 — OFICIAL: WO1 31/03→01/04 SAE (249); WO2 09–10/06 (255); WO3 11–13/08 (260 + 264 asueto 12/08)
- [ ] Oferta por bimestre de cada matéria bimestral (pesquisa por matéria — regras genéricas aplicadas por enquanto)
- [x] Confirmar anuais de 1º ano → março e demais anuais → abril — CONFIRMADO (PNG FCM)
Fonte oficial principal: med.unlp.edu.ar/index.php/inscripciones (worker avisa por email no dia 1 de cada mês quando muda)