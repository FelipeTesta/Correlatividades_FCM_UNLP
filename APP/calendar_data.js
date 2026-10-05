// ===============================
// MINI CALENDARIO — DATA
// Calendario académico Medicina UNLP (cursadas + inscripciones).
// Pure data only. Logic lives in minical.js.
//
// Convenção de datas: "YYYY-MM-DDTHH:mm" (hora local Argentina).
// research:true = data aproximada/placeholder, precisa confirmação oficial
// (worker.js avisa por email quando a página oficial muda).
//
// Fontes 2026 (verificadas 2026-10-04):
// - Cartelera oficial (cartelera.med.unlp.edu.ar):
//   /noticia/241 (1º año), /248 (2º-5º año W1), /249 (optativas 1º bim form),
//   /255 (W2 + optativas 2º bim), /260 (W3 + optativas 3º bim),
//   /264 (optativas 3º bim — corregido por asueto 12/08),
//   /270 (W4 + optativas 4º bim)
// - Receso invernal UNLP 20/07→02/08 (ic.info.unlp.edu.ar/calendario-academico-2026)
// - Ingresantes: med.unlp.edu.ar/index.php/ingresantes (Ingreso 2027: 09/11→11/12)
// - Dictado cuatrimestral Medicina Interna II: 1º cuatri 20/04→21/08, 2º 24/08→11/12 (cartelera MI B)
// ===============================

const MINICAL_CALENDAR = {
    year: 2026,
    lastReviewed: '2026-10-04',
    sources: [
        'https://cartelera.med.unlp.edu.ar/ (noticias 241, 248, 249, 255, 260, 264, 270)',
        'https://ic.info.unlp.edu.ar/calendario-academico-2026/ (receso invernal UNLP)',
        'https://www.med.unlp.edu.ar/index.php/fcm/calendario-academico-2026 (PNG leído por Gemini 2026-10-04: anuales 23/03→21/11, bim 06/04→13/06, 15/06→18/07, 03/08→10/10, 12/10→05/12)',
        'https://www.med.unlp.edu.ar/index.php/ingresantes (Ingreso 2027)'
    ],

    // Eventos fijos del ciclo lectivo — OFICIAL (PNG calendario FCM 2026, leído por Gemini)
    // Referencias de dictado: anuales 23/03(1º)/20/04(2º+)→21/11; cuatrimestrales 1º ciclo →18/07,
    // 2º ciclo 03/08→14/11; bimestrales 1º 06/04→13/06, 2º 15/06→18/07, 3º 03/08→10/10, 4º 12/10→05/12
    fixedEvents: [
        { id: 'verano',   emoji: '⚫', label: 'Vacaciones de verano',            start: '2026-01-01', end: '2026-03-22' },
        { id: 'letivo1',  emoji: '🔘', label: 'Período letivo',                   start: '2026-03-23', end: '2026-07-18' },
        { id: 'invierno', emoji: '🔵', label: 'Vacaciones de invierno (receso UNLP)', start: '2026-07-20', end: '2026-08-02' },
        { id: 'letivo2',  emoji: '🔘', label: 'Período letivo',                   start: '2026-08-03', end: '2026-12-05' },
        { id: 'verano2',  emoji: '⚫', label: 'Vacaciones de verano',               start: '2026-12-06', end: '2026-12-31' },
        { id: 'ingreso',  emoji: '🟠', label: 'Inscripción Ingresantes (Ingreso 2027)', start: '2026-11-09T12:00', end: '2026-12-11T12:00' }
    ],

    // Ventanas de inscripción a MATERIAS OBLIGATORIAS (🟡) — 2026
    // perYear = escalonamento por año recomendado (hora de apertura)
    inscriptionsObligatorias: [
        {
            id: 'W0', emoji: '🟡', label: 'Inscripciones 1º año (marzo)',
            start: '2026-03-11T11:00', end: '2026-03-13T23:59',
            perYear: [{ years: [1], when: '11/03 11h → 13/03 23:59 (ingresantes 2026 y recursantes)' }]
        },
        {
            id: 'W1', emoji: '🟡', label: 'Inscripciones 1er Bim',
            start: '2026-04-14T09:00', end: '2026-04-15T23:59',
            perYear: [
                { years: [5], when: '14/04 09h' },
                { years: [4], when: '14/04 11h' },
                { years: [3], when: '14/04 13h' },
                { years: [2], when: '14/04 15h' }
            ]
        },
        {
            id: 'W2', emoji: '🟡', label: 'Inscripciones 2º Bim',
            start: '2026-06-08T09:00', end: '2026-06-10T23:59', research: true, // cierre no publicado en la noticia 255
            perYear: [
                { years: [5], when: '08/06 09h' },
                { years: [4], when: '08/06 11h' },
                { years: [3], when: '08/06 13h' },
                { years: [1, 2], when: '08/06 15h' }
            ]
        },
        {
            id: 'W3', emoji: '🟡', label: 'Inscripciones 3er Bim',
            start: '2026-08-04T09:00', end: '2026-08-14T23:59',
            perYear: [
                { years: [1], when: '04/08 09h (cierra 05/08)' },
                { years: [5], when: '06/08 09h' },
                { years: [4], when: '06/08 13h' },
                { years: [3], when: '07/08 09h' },
                { years: [2], when: '10/08 16h' }
            ]
        },
        {
            id: 'W4', emoji: '🟡', label: 'Inscripciones 4º Bim',
            start: '2026-10-06T09:00', end: '2026-10-09T23:59',
            perYear: [
                { years: [5], when: '06/10 09h' },
                { years: [4], when: '06/10 11h' },
                { years: [3], when: '06/10 14h' },
                { years: [1, 2], when: '06/10 17h' }
            ]
        }
    ],

    // Ventanas de inscripción a OPTATIVAS (🟣) — 2026 (completas: 1º-4º bim)
    // Sistema escalonado CeSPi por finales aprobados (excepto WO1 = formulario SAE)
    inscriptionsOptativas: [
        {
            id: 'WO1', emoji: '🟣', label: 'Optativas 1º Bim (formulario SAE)',
            start: '2026-03-31T08:00', end: '2026-04-01T08:00',
            perFilter: [
                { filter: 'estudiantes avanzados (prioridad % de carrera)', when: '31/03 08h → 01/04 08h, 3 opciones' }
            ]
        },
        {
            id: 'WO2', emoji: '🟣', label: 'Inscripciones Optativas 2º Bim',
            start: '2026-06-09T09:00', end: '2026-06-10T23:59',
            perFilter: [
                { filter: '≥30 finales aprobados', when: '09/06 09h' },
                { filter: '≥17 finales', when: '10/06 09h' },
                { filter: 'sin filtro', when: '10/06 13h' }
            ]
        },
        {
            id: 'WO3', emoji: '🟣', label: 'Inscripciones Optativas 3er Bim',
            start: '2026-08-11T15:00', end: '2026-08-13T23:59',
            perFilter: [
                { filter: '≥30 finales aprobados', when: '11/08 15h' },
                { filter: '≥17 finales', when: '13/08 09h (12/08 asueto UNLP)' },
                { filter: 'sin filtro', when: '13/08 16h' }
            ]
        },
        {
            id: 'WO4', emoji: '🟣', label: 'Inscripciones Optativas 4º Bim',
            start: '2026-10-08T09:00', end: '2026-10-09T23:59',
            perFilter: [
                { filter: '≥30 finales aprobados', when: '08/10 09h' },
                { filter: '≥17 finales', when: '08/10 11h' },
                { filter: 'sin filtro', when: '08/10 14h' }
            ]
        }
    ]
};

// En qué ventanas abre cada materia (por defecto según categoría).
// Reglas del usuario (TODO.md): anuales → abril (1º bim); 1er año anual → marzo;
// cuatrimestrales → 1ª y 3ª inscripción; bimestrales → todas; optativas → ventanas optativas.
// overrides = excepciones verificadas (Salud Pública I solo 2º cuatrimestre → W3;
// Salud Pública II solo 1º cuatrimestre → W1).
const MINICAL_OFFERINGS = {
    defaults: {
        'anual': ['W1'],
        'cuatrimestral': ['W1', 'W3'],
        'bimestral': ['W1', 'W2', 'W3', 'W4'],
        'optativa': ['WO1', 'WO2', 'WO3', 'WO4']
    },
    firstYearAnual: ['W0'],
    overrides: {
        'HG001': ['W3'],  // Salud Pública I — solo 2º cuatrimestre
        'HG002': ['W1']   // Salud Pública II — solo 1º cuatrimestre
    }
};

// Cuántos días antes de que abra la ventana aparece el sticker "Inscripción"
const MINICAL_STICKER_DAYS_BEFORE = 14;
