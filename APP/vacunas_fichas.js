// vacunas_fichas.js
// Fichas educativas de vacunas (Calendario Nacional de Vacunación, Argentina 2026)
// + datos para el diagrama de Venn/Euler (librería venn.js, vendor/).
// Audiencia: estudiantes de Medicina. Datos: MSAL/OMS — ver enlaces por ficha.

// ===============================
// VENN — capa base: círculos maciços por PATÓGENO (bacteriana/viral)
//        capa superior: contornos por VACUNA (engloban sus patógenos)
// Posiciones calculadas a mano para evitar solapamiento de textos.
// ===============================
const VACUNAS_VENN_PATOGENOS = [
    // Zona bacteriana (izquierda)
    { nome: 'Tuberculosis', short: 'TB', x: 20, y: 240, r: 32, grupo: 'bacteriana' },
    { nome: 'Difteria', x: 175, y: 125, r: 30, grupo: 'bacteriana' },
    { nome: 'Tétanos', x: 250, y: 105, r: 30, grupo: 'bacteriana' },
    { nome: 'Tos convulsa', x: 245, y: 185, r: 30, grupo: 'bacteriana' },
    { nome: 'Hib', x: 150, y: 215, r: 26, grupo: 'bacteriana' },
    { nome: 'Neumococo', x: 70, y: 70, r: 30, grupo: 'bacteriana' },
    { nome: 'Meningococo', x: 380, y: 75, r: 30, grupo: 'bacteriana' },
    // Hep B: viral, vive en el cluster de la Quíntuple (la cubre)
    { nome: 'Hepatitis B', x: 220, y: 285, r: 30, grupo: 'viral' },
    // Zona viral (derecha)
    { nome: 'Hepatitis A', x: 480, y: 90, r: 28, grupo: 'viral' },
    { nome: 'Poliovirus', x: 600, y: 70, r: 28, grupo: 'viral' },
    { nome: 'Rotavirus', x: 720, y: 70, r: 28, grupo: 'viral' },
    { nome: 'Influenza A', x: 520, y: 190, r: 28, grupo: 'viral' },
    { nome: 'Influenza B', x: 620, y: 160, r: 28, grupo: 'viral' },
    { nome: 'Sarampión', x: 760, y: 185, r: 28, grupo: 'viral' },
    { nome: 'Rubéola', x: 860, y: 155, r: 28, grupo: 'viral' },
    { nome: 'Parotiditis', x: 850, y: 255, r: 28, grupo: 'viral' },
    { nome: 'Varicela', x: 450, y: 310, r: 28, grupo: 'viral' },
    { nome: 'VPH', x: 560, y: 305, r: 28, grupo: 'viral' },
    { nome: 'F. Amarilla', x: 680, y: 325, r: 28, grupo: 'viral' },
    { nome: 'Junín (FHA)', x: 500, y: 425, r: 28, grupo: 'viral' },
    { nome: 'VSR', x: 630, y: 425, r: 28, grupo: 'viral' },
    { nome: 'SARS-CoV-2', x: 760, y: 425, r: 28, grupo: 'viral' },
    { nome: 'Rabia', x: 880, y: 405, r: 28, grupo: 'viral' }
];

// Contorno por vacuna: engloba sus círculos de patógeno (radio calculado).
// labelAngle: dónde poner el nombre sobre el contorno (evita solapamientos).
const VACUNAS_VENN_LAYOUT = [
    { vacuna: 'BCG', patogenos: ['Tuberculosis'], labelAngle: -90 },
    { vacuna: 'Quíntuple', patogenos: ['Difteria', 'Tétanos', 'Tos convulsa', 'Hib', 'Hepatitis B'], labelAngle: -110 },
    { vacuna: 'dTpa / DTP', patogenos: ['Difteria', 'Tétanos', 'Tos convulsa'], labelAngle: -80 },
    { vacuna: 'dT', patogenos: ['Difteria', 'Tétanos'], labelAngle: 175 },
    { vacuna: 'Hepatitis B', patogenos: ['Hepatitis B'], labelAngle: -90 },
    { vacuna: 'Neumococo', patogenos: ['Neumococo'], labelAngle: -90 },
    { vacuna: 'Meningococo', patogenos: ['Meningococo'], labelAngle: -90 },
    { vacuna: 'Hepatitis A', patogenos: ['Hepatitis A'], labelAngle: -90 },
    { vacuna: 'Polio', patogenos: ['Poliovirus'], labelAngle: -90 },
    { vacuna: 'Rotavirus', patogenos: ['Rotavirus'], labelAngle: -90 },
    { vacuna: 'Gripe', patogenos: ['Influenza A', 'Influenza B'], labelAngle: 200 },
    { vacuna: 'Triple Viral', patogenos: ['Sarampión', 'Rubéola', 'Parotiditis'], labelAngle: -90 },
    { vacuna: 'Varicela', patogenos: ['Varicela'], labelAngle: -90 },
    { vacuna: 'VPH', patogenos: ['VPH'], labelAngle: 60 },
    { vacuna: 'Fiebre Amarilla', patogenos: ['F. Amarilla'], labelAngle: -90 },
    { vacuna: 'FHA (Junín)', patogenos: ['Junín (FHA)'], labelAngle: -90 },
    { vacuna: 'VSR', patogenos: ['VSR'], labelAngle: -90 },
    { vacuna: 'COVID-19', patogenos: ['SARS-CoV-2'], labelAngle: -90 },
    { vacuna: 'Rabia', patogenos: ['Rabia'], labelAngle: -90 }
];

// Filtros por patología (checkboxes sobre el gráfico)
// match: substring normalizada a buscar en ficha.patogenos
const VACUNAS_VENN_FILTERS = [
    { label: 'Tuberculosis', match: 'tuberculosis' },
    { label: 'Hepatitis B', match: 'hepatitis b' },
    { label: 'Difteria', match: 'difteria' },
    { label: 'Tétanos', match: 'tétanos' },
    { label: 'Tos convulsa', match: 'tos convulsa' },
    { label: 'Hib', match: 'haemophilus' },
    { label: 'Polio', match: 'poliovirus' },
    { label: 'Rotavirus', match: 'rotavirus' },
    { label: 'Neumococo', match: 'pneumoniae' },
    { label: 'Meningococo', match: 'meningitidis' },
    { label: 'Gripe', match: 'influenza' },
    { label: 'Sarampión', match: 'sarampión' },
    { label: 'Rubéola', match: 'rubéola' },
    { label: 'Parotiditis', match: 'parotiditis' },
    { label: 'Hepatitis A', match: 'hepatitis a' },
    { label: 'Varicela', match: 'varicela' },
    { label: 'VPH', match: 'vph' },
    { label: 'Fiebre amarilla', match: 'fiebre amarilla' },
    { label: 'Junín (FHA)', match: 'junín' },
    { label: 'VSR', match: 'sincicial' },
    { label: 'COVID-19', match: 'sars-cov-2' },
    { label: 'Rabia', match: 'rabia' }
];

// Color de círculo por set (bacteriana/viral/mixta)
const VACUNAS_VENN_COLORS = {    'Quíntuple': '#a855f7',      // mixta: bacterianas + Hep B
    'dTpa / DTP': '#f59e0b',
    'dT': '#f59e0b',
    'Hepatitis B': '#22d3ee',
    'BCG': '#f59e0b',
    'Polio': '#22d3ee',
    'Rotavirus': '#22d3ee',
    'Neumococo': '#f59e0b',
    'Meningococo': '#f59e0b',
    'Gripe': '#22d3ee',
    'Triple Viral': '#22d3ee',
    'Hepatitis A': '#22d3ee',
    'Varicela': '#22d3ee',
    'VPH': '#22d3ee',
    'Fiebre Amarilla': '#22d3ee',
    'FHA (Junín)': '#22d3ee',
    'VSR': '#22d3ee',
    'COVID-19': '#22d3ee',
    'Rabia': '#22d3ee'
};

// ===============================
// FICHAS — una por vacuna (clic en el círculo)
// ===============================
const VACUNAS_FICHAS = {
    'Quíntuple': {
        nome: 'Quíntuple Pentavalente (DTP-HB-Hib)',
        tipo: 'Combinada: anatoxinas diftérica y tetánica + pertussis (celular o acelular) + HBsAg recombinante + polisacárido Hib conjugado',
        esquema: '3 dosis (2, 4 y 6 meses)',
        indicacion: ' lactantes — inicio del esquema (Calendario Nacional)',
        patogenos: ['Difteria', 'Tétanos', 'Tos convulsa', 'Hepatitis B', 'Haemophilus influenzae tipo b'],
        marcas: [
            { marca: 'Easyfive-TT', empresa: 'Serum Institute of India', detalle: 'Pentavalente líquida, pertussis celular' },
            { marca: 'Quinvaxem', empresa: 'Janssen/Berna', detalle: 'Pentavalente líquida, pertussis celular' },
            { marca: 'Pentaxim', empresa: 'Sanofi', detalle: 'Pentavalente acelular (pertussis acelular, HBsAg, Hib liofilizado)' }
        ],
        desarrollo: 'Hexavalente (DTPa-HB-Polio-Hib, p.ej. Infanrix Hexa/Vaxelis) — ya usada en otros países, reemplazaría la IPV separada.',
        enlaces: [
            { label: 'MSAL — Quíntuple pentavalente', url: 'https://www.argentina.gob.ar/salud/vacunas/cuadruple-o-quintuple-pentavalente' }
        ]
    },
    'dTpa / DTP': {
        nome: 'Triple Bacteriana (dTpa acelular / DTP celular)',
        tipo: 'Anatoxinas diftérica y tetánica + componento pertussis',
        tipos: ['Acelular (dTpa — subunidades PT/FHA/PRN/FIM)', 'Celular completa (DTP — inactivada, más reactogénica)'],
        esquema: 'Refuerzos según edad y calendario; dTpa en embarazadas (semana 20) y contactos de lactantes (estrategia del nido)',
        indicacion: 'Calendario infantil (DTP); embarazadas y personal de salud (dTpa)',
        patogenos: ['Difteria', 'Tétanos', 'Tos convulsa'],
        marcas: [
            { marca: 'Boostrix', empresa: 'GSK', detalle: 'dTpa con 3 antígenos de pertussis (PT, FHA, PRN)' },
            { marca: 'Adacel', empresa: 'Sanofi', detalle: 'dTpa con 5 antígenos de pertussis (PT, FHA, PRN, FIM 2/3)' }
        ],
        notaFCM: 'La FCM exige dTpa al poder cursar Pediatría (cursos de 5º año con contacto pediátrico).',
        desarrollo: 'Pertussis acelulares con más antígenos y PT detoxificada genéticamente (Tdapgen) en estudio.',
        enlaces: [
            { label: 'MSAL — Triple bacteriana acelular (dTpa)', url: 'https://www.argentina.gob.ar/salud/vacunas/triplebacterianaacelular' },
            { label: 'MSAL — Triple bacteriana celular', url: 'https://www.argentina.gob.ar/salud/vacunas/triplebacterianacelular' }
        ]
    },
    'dT': {
        nome: 'Doble Bacteriana (dT)',
        tipo: 'Anatoxinas diftérica y tetánica adsorbidas (sin componente pertussis)',
        esquema: 'Adultos sin esquema: 3 dosis (0, 1, 7 meses) + refuerzo cada 10 años',
        indicacion: 'Heridas / adultos (Calendario 15-64 y +65)',
        patogenos: ['Difteria', 'Tétanos'],
        marcas: [
            { marca: 'Anatoxina dT', empresa: 'Varios productores precalificados OMS (Fondo Rotatorio OPS)', detalle: 'Dosis pediátrica de difteria reducida + toxoide tetánico' }
        ],
        desarrollo: '—',
        enlaces: [
            { label: 'MSAL — Doble bacteriana (dT)', url: 'https://www.argentina.gob.ar/salud/vacunas/doblebacteriana' }
        ]
    },
    'Hepatitis B': {
        nome: 'Hepatitis B (monovalente)',
        tipo: 'Recombinante: HBsAg producido en levaduras (S. cerevisiae / Hansenula), adsorbido',
        esquema: '3 dosis (0-1-6 meses); recién nacidos: dosis al nacer + esquema',
        indicacion: 'Universal al nacer; personal de salud; convivientes y riesgo (diálisis, VIH, tatuajes)',
        patogenos: ['Hepatitis B (virus HBV)'],
        marcas: [
            { marca: 'Engerix-B', empresa: 'GSK', detalle: '10 µg (pediátrica) / 20 µg (adulta)' },
            { marca: 'Recombivax HB', empresa: 'Merck/MSD', detalle: '5 µg (pediátrica) / 10-40 µg (adulta)' },
            { marca: 'Euvax-B', empresa: 'LG Chem', detalle: '10/20 µg, precalificada OMS' }
        ],
        desarrollo: 'Vacunas terapéuticas contra HBV crónica (ARNi + inmunoterapia) en fase II.',
        enlaces: [
            { label: 'MSAL — Hepatitis B', url: 'https://www.argentina.gob.ar/salud/vacunas/hepatitisb' }
        ]
    },
    'BCG': {
        nome: 'BCG (Bacilo de Calmette-Guérin)',
        tipo: 'Viva atenuada, derivada de Mycobacterium bovis (cepa Danesa 1331 / Moreau)',
        esquema: '1 dosis intradérmica, recién nacidos (< 1 mes, idealmente en la maternidad)',
        indicacion: 'Universal al nacer (Calendario Nacional)',
        patogenos: ['Tuberculosis (M. tuberculosis)'],
        marcas: [
            { marca: 'BCG Danesa 1331', empresa: 'Productores precalificados OMS', detalle: 'Protege formas graves (miliar, meningea); no previene la primoinfección pulmonar' }
        ],
        desarrollo: 'Candidatas M72/AS01 (GSK, fase IIb — latente), VPM1002 (modificada genéticamente).',
        enlaces: [
            { label: 'MSAL — Tuberculosis', url: 'https://www.argentina.gob.ar/salud/vacunas/tuberculosis' }
        ]
    },
    'Polio': {
        nome: 'Poliomielitis (IPV / bOPV)',
        tipo: 'Vacuna antipoliomielítica',
        tipos: ['Salk IPV — inactivada inyectable (3 serotipos)', 'Sabin bOPV — oral viva atenuada bivalente (1 y 3)'],
        esquema: 'Secuencial según calendario: IPV 2-4-6 meses + bOPV en refuerzos (tOPV retirada por VDPV2)',
        indicacion: 'Universal (Calendario Nacional); erradicación en curso',
        patogenos: ['Poliovirus (serotipos 1, 2 y 3)'],
        marcas: [
            { marca: 'Imovax Polio', empresa: 'Sanofi', detalle: 'IPV inactivada, 3 serotipos' },
            { marca: 'bOPV', empresa: 'Productores precalificados OMS (Bio Farma)', detalle: 'Oral bivalente 1+3, retiro progresivo tras erradicación' }
        ],
        desarrollo: 'Fase final de erradicación (GPEI); IPV de dosis fraccionada intradérmica en brotes.',
        enlaces: [
            { label: 'MSAL — Poliomielitis', url: 'https://www.argentina.gob.ar/salud/vacunas/polio' }
        ]
    },
    'Rotavirus': {
        nome: 'Rotavirus',
        tipo: 'Viva atenuada oral (monovalente humana o pentavalente reasociante bovina)',
        esquema: 'Rotarix: 2 dosis (2 y 4 meses); RotaTeq: 3 dosis (2, 4, 6 meses)',
        indicacion: 'Universal (Calendario Nacional)',
        patogenos: ['Rotavirus (cepas G y P — p. ej. G1P[8], la más frecuente)'],
        marcas: [
            { marca: 'Rotarix', empresa: 'GSK', detalle: 'Humana monovalente G1P[8] atenuada (2 dosis)' },
            { marca: 'RotaTeq', empresa: 'Merck/MSD', detalle: 'Pentavalente bovina-humana G1-G4 + P[8] (3 dosis)' }
        ],
        desarrollo: 'Vacunas neonatales RV3-BB (GSK, nacida en Australia) y alternativas para países de baja renta.',
        enlaces: [
            { label: 'MSAL — Rotavirus', url: 'https://www.argentina.gob.ar/salud/vacunas/rotavirus' }
        ]
    },
    'Neumococo': {
        nome: 'Neumocócica',
        tipo: 'Vacuna antineumocócica',
        tipos: ['Conjugada VNC10 (Synflorix, protD)', 'Conjugada VNC13 (Prevenar, CRM197)', 'Conjugada VNC20 (adultos, calendario 2026)', 'Polisacárida VNP23 (sin memoria T)'],
        esquema: 'VNC según calendario infantil; adultos: VNC20 dosis única (sin esquema previo) o VNC13 + VNP23',
        indicacion: 'Infantes universal; 15-64 con factores de riesgo; universal ≥ 65 años',
        patogenos: ['Streptococcus pneumoniae (neumococo)'],
        marcas: [
            { marca: 'Synflorix', empresa: 'GSK', detalle: 'VNC10 — 10 serotipos conjugados (protD)' },
            { marca: 'Prevenar 13', empresa: 'Pfizer', detalle: 'VNC13 — 13 serotipos conjugados (CRM197)' },
            { marca: 'Apexxnar', empresa: 'Pfizer', detalle: 'VNC20 — 20 serotipos (adultos, calendario 2026)' },
            { marca: 'Pneumovax 23', empresa: 'Merck/MSD', detalle: 'VNP23 — 23 serotipos polisacáridos (no memoria T; usar tras VNC)' }
        ],
        desarrollo: 'VNC21 (Merck V116) aprobada en EE. UU. — ampliación a más serotipos en adultos.',
        enlaces: [
            { label: 'MSAL — Neumococo', url: 'https://www.argentina.gob.ar/salud/vacunas/neumococo' }
        ]
    },
    'Meningococo': {
        nome: 'Meningocócica',
        tipo: 'Vacuna antimeningocócica',
        tipos: ['Conjugada ACWY (Menveo CRM197 / MenQuadfi TT)', 'Recombinante MenB (Bexsero 4CMenB / Trumenba fHbp)'],
        esquema: '1 dosis (+ refuerzo según grupo de riesgo); adolescentes según calendario',
        indicacion: 'Adolescentes; grupos de riesgo: asplenia, déficit de complemento, VIH, brotes',
        patogenos: ['Neisseria meningitidis (serogrupos A, B, C, W, Y)'],
        marcas: [
            { marca: 'Menveo', empresa: 'GSK', detalle: 'Conjugada ACWY (CRM197)' },
            { marca: 'MenQuadfi', empresa: 'Sanofi', detalle: 'Conjugada ACWY (toxoide tetánico)' },
            { marca: 'Bexsero', empresa: 'GSK', detalle: '4CMenB recombinante: NHBA, NadA, fHbp, PorA (vesículas + antígenos)' },
            { marca: 'Trumenba', empresa: 'Pfizer', detalle: 'Bivalente recombinante fHbp (subfamilias A/B)' }
        ],
        desarrollo: 'Combinadas MenABCWY (p. ej. Penbraya) aprobadas en EE. UU. — un solo pinchazo ACWY+B.',
        enlaces: [
            { label: 'MSAL — Meningococo', url: 'https://www.argentina.gob.ar/salud/vacunas/novedadmeningococo' }
        ]
    },
    'Gripe': {
        nome: 'Antigripal (Influenza)',
        tipo: 'Inactivada, cultivada en huevo o célula',
        tipos: ['Fraccionada', 'Subunidades (HA+NA)', 'Trivalente (2 A + 1 B)', 'Tetravalente (2 A + 2 B)'],
        esquema: '1 dosis anual (campaña otoño-invierno, hemisferio sur); niños 6m-8a primovacunados: 2 dosis',
        indicacion: 'Factores de riesgo (con orden médica); personal de salud; embarazadas (cualquier trimestre); ≥ 65',
        patogenos: ['Influenza A (subtipos estacionales H1N1/H3N2)', 'Influenza B (linajes Victoria/Yamagata)'],
        marcas: [
            { marca: 'VaxigripTetra', empresa: 'Sanofi', detalle: 'Tetravalente: 2 A + 2 linajes B' },
            { marca: 'FluarixTetra', empresa: 'GSK', detalle: 'Tetravalente' },
            { marca: 'Influvac Tetra', empresa: 'Abbott', detalle: 'Tetravalente; existe versión trivalente (2 A + 1 B) según temporada' }
        ],
        desarrollo: 'Gripe universal (mRNA y HA tallo conservado) y preparativos H5N1 (gripe aviar) en fase clínica.',
        enlaces: [
            { label: 'MSAL — Antigripal', url: 'https://www.argentina.gob.ar/salud/vacunas/antigripal' }
        ]
    },
    'Triple Viral': {
        nome: 'Triple Viral (SRP)',
        tipo: 'Viva atenuada: sarampión (Edmonston), rubéola (RA27/3), parotiditis (Jeryl Lynn)',
        esquema: '2 dosis (12 meses + ingreso escolar); dosis extra en brotes; doble viral (SR) en adultos/nacidos post-1967',
        indicacion: 'Universal (Calendario); brotes de sarampión — dosis temprana a 6-11 meses',
        patogenos: ['Sarampión (Morbillivirus)', 'Rubéola (Rubivirus)', 'Parotiditis (parotiditis infecciosa)'],
        marcas: [
            { marca: 'Priorix', empresa: 'GSK', detalle: 'SRP viva atenuada' },
            { marca: 'Trimovax-Merieux', empresa: 'Sanofi', detalle: 'SRP viva atenuada' },
            { marca: 'Doble viral (SR)', empresa: 'Productores OMS', detalle: 'Solo sarampión + rubéola, usada en campañas/brotes' }
        ],
        desarrollo: 'Sarampión aerosolizado (fase II, no triplicó inmunidad sistémica); tercera dosis en brotes como estándar OMS.',
        enlaces: [
            { label: 'MSAL — Doble/Triple Viral', url: 'https://www.argentina.gob.ar/salud/vacunas/doble-triple-viral' }
        ]
    },
    'Hepatitis A': {
        nome: 'Hepatitis A',
        tipo: 'Inactivada, virus cultivado en célula (MRC-5), adsorbida',
        esquema: '2 dosis (0 y 6 meses)',
        indicacion: 'Universal 12 meses (Calendario); adultos viajeros/brotes/susceptibles',
        patogenos: ['Hepatitis A (virus HAV)'],
        marcas: [
            { marca: 'Avaxim', empresa: 'Sanofi', detalle: '80 U antigénicas adulta / 80 U pediátrica' },
            { marca: 'Havrix', empresa: 'GSK', detalle: '720/1440 ELU pediátrica/adulta' },
            { marca: 'Vaqta', empresa: 'Merck/MSD', detalle: '25/50 U pediátrica/adulta' }
        ],
        desarrollo: 'Combinadas HAV-HBV (Twinrix) para viajeros; no universal en adultos.',
        enlaces: [
            { label: 'MSAL — Hepatitis A', url: 'https://www.argentina.gob.ar/salud/vacunas/hepatitisa' }
        ]
    },
    'Varicela': {
        nome: 'Varicela',
        tipo: 'Viva atenuada, cepa Oka (Merkvax/Varilrix), cultivada en célula',
        esquema: '2 dosis (calendario: 15 meses y 5 años); adultos susceptibles: 0 y 1 mes',
        indicacion: 'Universal (Calendario); susceptibles ≥ 13 años (2 dosis); evita herpes zóster por vacunación',
        patogenos: ['Varicela-Zóster (VZV)'],
        marcas: [
            { marca: 'Varilrix', empresa: 'GSK', detalle: 'Oka/RIT43856, viva atenuada' },
            { marca: 'Varivax', empresa: 'Merck/MSD', detalle: 'Oka/Merck, viva atenuada' },
            { marca: 'ProQuad', empresa: 'Merck/MSD', detalle: 'Tetraviral SRP+V (MMRV, pediátrica)' }
        ],
        desarrollo: 'Vacuna contra herpes zóster (Shingrix, recombinante zVZV) para ≥ 50/60 años — distinta indicación.',
        enlaces: [
            { label: 'MSAL — Varicela', url: 'https://www.argentina.gob.ar/salud/vacunas/varicela' }
        ]
    },
    'VPH': {
        nome: 'VPH (Papilomavirus)',
        tipo: 'Recombinante: partículas similares a virus (VLP) de proteína L1, adsorbidas',
        esquema: '2 dosis (0 y 6 meses) si inicio < 15 años; 3 dosis (0-1/2-6) si ≥ 15 o inmunocomprometidos',
        indicacion: '11 años (Calendario); previene cáncer cervicouterino, ano-orofaríngeo y verrugas',
        patogenos: ['VPH (genotipos 6, 11, 16, 18, 31, 33, 45, 52, 58)'],
        marcas: [
            { marca: 'Gardasil 9', empresa: 'Merck/MSD', detalle: '9 valencias: 6/11/16/18/31/33/45/52/58' },
            { marca: 'Gardasil', empresa: 'Merck/MSD', detalle: '4 valencias: 6/11/16/18 (generación anterior)' },
            { marca: 'Cervarix', empresa: 'GSK', detalle: 'Bivalente 16/18 con adyuvante AS04 (descontinuada en varios mercados)' }
        ],
        desarrollo: 'VPH terapéutica (contra lesiones establecidas) y ampliación a varones en calendario — en evaluación.',
        enlaces: [
            { label: 'MSAL — VPH', url: 'https://www.argentina.gob.ar/salud/vacunas/vph' }
        ]
    },
    'Fiebre Amarilla': {
        nome: 'Fiebre Amarilla',
        tipo: 'Viva atenuada, cepa 17D-204 (subcultivos de 17D)',
        esquema: '1 dosis ÚNICA — inmunidad de por vida (política OMS 2016; certificado internacional vigente a los 10 días)',
        indicacion: 'No obligatoria en La Plata; viajeros a zona de riesgo (NEA/NOA, Iguazú, países Am. del Sur/África)',
        patogenos: ['Fiebre Amarilla (Flavivirus)'],
        marcas: [
            { marca: 'Stamaril', empresa: 'Sanofi', detalle: '17D-204, la única disponible en AR' }
        ],
        desarrollo: '—',
        enlaces: [
            { label: 'MSAL — Fiebre Amarilla', url: 'https://www.argentina.gob.ar/salud/fiebreamarilla' },
            { label: 'OMS — Nota descriptiva', url: 'https://www.who.int/es/news-room/fact-sheets/detail/yellow-fever' }
        ]
    },
    'FHA (Junín)': {
        nome: 'Fiebre Hemorrágica Argentina',
        tipo: 'Viva atenuada, virus Junín cepa Candid#1 (desarrollo binacional EE. UU.-Argentina)',
        esquema: '1 dosis',
        indicacion: '15+ años que residan/trabajen/transiten en zona endémica rural (jurisdicciones de Buenos Aires, Córdoba, Santa Fe y La Pampa)',
        patogenos: ['Fiebre Hemorrágica Argentina (arenavirus Junín)'],
        marcas: [
            { marca: 'Candid#1', empresa: 'ANLIS "Dr. C. G. Malbrán" (producción nacional)', detalle: 'Única vacuna contra un arenavirus aprobada en el mundo' }
        ],
        desarrollo: 'Candid#1 es caso único de vacuna producida en Argentina por un instituto público.',
        enlaces: [
            { label: 'MSAL — FHA', url: 'https://www.argentina.gob.ar/salud/vacunas/fiebre-hemorragica' }
        ]
    },
    'VSR': {
        nome: 'Virus Sincicial Respiratorio',
        tipo: 'Subunidades recombinantes: proteína F estabilizada en conformación pre-fusión (preF)',
        tipos: ['preF bivalente A+B (embarazadas)', 'preF + adyuvante AS01 (≥ 60 años)', 'mAb pasivo nirsevimab (neonatos — no vacuna)'],
        esquema: 'Embarazadas: 1 dosis (semanas 32-36); ≥ 60 años con riesgo según calendario',
        indicacion: 'Incorporación reciente al Calendario (2025/2026): inmunización pasiva de neonatos vía materna + adultos mayores',
        patogenos: ['Virus Sincicial Respiratorio (VSR, Orthopneumovirus)'],
        marcas: [
            { marca: 'Abrysvo', empresa: 'Pfizer', detalle: 'preF bivalente A+B, embarazadas' },
            { marca: 'Arexvy', empresa: 'GSK', detalle: 'preF + adyuvante AS01, ≥ 60 años' },
            { marca: 'Beyfortus (nirsevimab)', empresa: 'Sanofi/AstraZeneca', detalle: 'No es vacuna: anticuerpo monoclonal de larga duración para neonatos' }
        ],
        desarrollo: 'Vacunas intranasales pediátricas (viva) en fase I/II; mAbs de segunda generación.',
        enlaces: [
            { label: 'MSAL — VSR', url: 'https://www.argentina.gob.ar/salud/vacunas/virus-sincicial-respiratorio-vsr' }
        ]
    },
    'COVID-19': {
        nome: 'COVID-19',
        tipo: 'Vacuna contra SARS-CoV-2',
        tipos: ['ARNm (lipido-nanopartícula)', 'Proteína recombinante + adyuvante', 'Vector adenoviral', 'Inactivada'],
        esquema: 'Esquema basal 2 dosis + refuerzos; composición actualizada a linajes circulantes (p. ej. JN.1/KP.2)',
        indicacion: 'Universal; refuerzos en riesgo y embarazo',
        patogenos: ['SARS-CoV-2'],
        marcas: [
            { marca: 'Comirnaty', empresa: 'Pfizer/BioNTech', detalle: 'ARNm, actualizada anualmente' },
            { marca: 'Spikevax', empresa: 'Moderna', detalle: 'ARNm' },
            { marca: 'Nuvaxovid', empresa: 'Novavax/Sequoia', detalle: 'Proteína recombinante prefusión + Matrix-M' }
        ],
        desarrollo: 'Vacunas pan-coronavirus y nasales (mucosales) en fase preclínica/clínica temprana.',
        enlaces: [
            { label: 'MSAL — Coronavirus', url: 'https://www.argentina.gob.ar/salud/coronavirus' },
            { label: 'OMS — COVID-19 vacunas', url: 'https://www.who.int/es/emergencies/situations/covid-19' }
        ]
    },
    'Rabia': {
        nome: 'Rabia',
        tipo: 'Inactivada, adsorbida',
        tipos: ['Cultivo en célula Vero', 'Cultivo en célula diploide humana', 'Pre-exposición (riesgo)', 'Post-exposición (RIG + series)'],
        esquema: 'Pre-exposición (riesgo ocupacional: veterinaria, quirópteros, laboratorio): 2-3 dosis; post-exposición: inmunoglobulina + series según esquema',
        indicacion: 'No en Calendario; situacional (riesgo ocupacional o exposición)',
        patogenos: ['Rabia (Lyssavirus)'],
        marcas: [
            { marca: 'Verorab', empresa: 'Sanofi', detalle: 'Vero, inactivada' },
            { marca: 'RabAvert / Rabavert', empresa: 'GSK', detalle: 'Célula diploide humana, inactivada' }
        ],
        desarrollo: '—',
        enlaces: [
            { label: 'MSAL — Rabia (glosario)', url: 'https://www.argentina.gob.ar/salud/glosario/rabia' }
        ]
    }
};
