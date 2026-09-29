// PLACEHOLDER DATA — Phase 2 research replaces/completes. Isolated module: no imports, no localStorage.

const UNIVERSIDADES = [
    {
        id: 'unlp',
        sigla: 'UNLP',
        nombre: 'Universidad Nacional de La Plata',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'La Plata',
        provincia: 'Buenos Aires',
        region: 'PBA',
        lastReviewed: '2026-09-28',
        lat: -34.9215,
        lng: -57.9555,
        fundada: 1905,
        descripcion: 'Universidad de referencia de esta app — el plan de estudios completo está en el Modo Árbol.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_La_Plata',
        webUrl: 'https://www.med.unlp.edu.ar',
        redirectTo: 'arbol.html',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 700,
            studentCount: 16879,
            immigrantPct: 38.5,
            spanishLevel: 'B2',
            subjectCount: 40,
            rankingNational: 3,
            rankingInternational: '501-550',
            rankingSource: 'QS World University Rankings by Subject — Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 53
        },
        plan: null
    },
    {
        id: 'uba',
        sigla: 'UBA',
        nombre: 'Universidad de Buenos Aires',
        facultad: 'Facultad de Medicina',
        ciudad: 'Buenos Aires',
        provincia: 'CABA',
        region: 'CABA',
        lastReviewed: '2026-09-28',
        lat: -34.6037,
        lng: -58.3816,
        fundada: 1821,
        descripcion: 'Facultad de Ciencias Médicas (Paraguay 2155, CABA). Estructura: CBC, Ciclo Biomédico, Ciclo Clínico y Práctica Final Obligatoria.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_de_Buenos_Aires',
        webUrl: 'https://www.fmed.uba.ar',
        stats: {
            careerYears: 6.5,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 1545,
            studentCount: 42677,
            immigrantPct: 28,
            spanishLevel: 'C1',
            subjectCount: 42,
            rankingNational: 1,
            rankingInternational: 133,
            rankingSource: 'QS World University Rankings by Subject — Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 0
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios 09 (Res. CS 7591/09, mod. 2023)',
            fuente: 'https://www.fmed.uba.ar/carreras/medicina/informacion-general',
            ingresoNota: 'El ingreso a la UBA se realiza mediante el Ciclo Básico Común (CBC): el primer año se cursan las materias del ciclo y no es posible cursar materias de los años siguientes sin tener todas las materias del CBC aprobadas. Las materias del CBC se cursan en sedes distribuidas en CABA y GBA, no necesariamente en la Facultad de Medicina.',
            anios: [
                {
                    anio: 1,
                    etiqueta: 'CBC',
                    materias: [
                        { codigo: 'UBA-101', nombre: 'Biofísica', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: 'UBA-102', nombre: 'Biología Celular', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: 'UBA-103', nombre: 'Introducción al Conocimiento de la Sociedad y el Estado', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: 'UBA-104', nombre: 'Introducción al Pensamiento Científico', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: 'UBA-105', nombre: 'Matemática', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: 'UBA-106', nombre: 'Química', duracion: 'cuatrimestral', correlativas: [] }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'UBA-201', nombre: 'Anatomía', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] },
                        { codigo: 'UBA-202', nombre: 'Biología Molecular y Genética', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] },
                        { codigo: 'UBA-203', nombre: 'Embriología', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] },
                        { codigo: 'UBA-204', nombre: 'Histología', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'UBA-301', nombre: 'Bioética', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] },
                        { codigo: 'UBA-302', nombre: 'Bioquímica', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204'] },
                        { codigo: 'UBA-303', nombre: 'Fisiología y Biofísica', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204'] },
                        { codigo: 'UBA-304', nombre: 'Inmunología Humana', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204'] },
                        { codigo: 'UBA-305', nombre: 'Microbiología y Parasitología', duracion: 'anual', correlativas: ['UBA-302', 'UBA-304'] },
                        { codigo: 'UBA-306', nombre: 'Salud Mental', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] },
                        { codigo: 'UBA-307', nombre: 'Salud Pública', duracion: 'anual', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'UBA-401', nombre: 'Farmacología I', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204', 'UBA-302', 'UBA-303', 'UBA-304', 'UBA-305'] },
                        { codigo: 'UBA-402', nombre: 'Medicina I', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204', 'UBA-302', 'UBA-303', 'UBA-304', 'UBA-305'] },
                        { codigo: 'UBA-403', nombre: 'Patología', duracion: 'anual', correlativas: ['UBA-201', 'UBA-202', 'UBA-203', 'UBA-204', 'UBA-302', 'UBA-303', 'UBA-304', 'UBA-305'] },
                        { codigo: 'UBA-404', nombre: 'Farmacología II', duracion: 'anual', correlativas: ['UBA-401', 'UBA-402'] },
                        { codigo: 'UBA-405', nombre: 'Medicina Legal y Deontología Médica', duracion: 'anual', correlativas: ['UBA-401', 'UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-406', nombre: 'Toxicología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'UBA-501', nombre: 'Dermatología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-502', nombre: 'Diagnóstico por Imágenes', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-503', nombre: 'Infectología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-504', nombre: 'Medicina II', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-505', nombre: 'Neumonología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-506', nombre: 'Neurología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-507', nombre: 'Nutrición', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-508', nombre: 'Psiquiatría', duracion: 'anual', correlativas: ['UBA-306', 'UBA-402', 'UBA-403'] }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'UBA-601', nombre: 'Cirugía General', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-602', nombre: 'Ginecología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-603', nombre: 'Neurocirugía', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-604', nombre: 'Obstetricia', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-605', nombre: 'Oftalmología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-606', nombre: 'Otorrinolaringología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-607', nombre: 'Pediatría', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-608', nombre: 'Traumatología y Ortopedia', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] },
                        { codigo: 'UBA-609', nombre: 'Urología', duracion: 'anual', correlativas: ['UBA-402', 'UBA-403'] }
                    ]
                },
                {
                    anio: 7,
                    etiqueta: 'PFO + Electivas',
                    materias: [
                        { codigo: 'UBA-701', nombre: 'Práctica Final Obligatoria (PFO)', duracion: 'anual', correlativas: [] },
                        { codigo: 'UBA-702', nombre: 'Inglés para Ciencias de la Salud', correlativas: ['UBA-101', 'UBA-102', 'UBA-103', 'UBA-104', 'UBA-105', 'UBA-106'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unlam',
        sigla: 'UNLaM',
        nombre: 'Universidad Nacional de La Matanza',
        facultad: 'Departamento de Ciencias de la Salud',
        ciudad: 'San Justo',
        provincia: 'Buenos Aires (GBA Oeste)',
        region: 'GBA',
        lastReviewed: '2026-09-28',
        lat: -34.6801,
        lng: -58.5588,
        fundada: 1989,
        descripcion: 'Departamento de Ciencias de la Salud en San Justo, GBA Oeste.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_La_Matanza',
        webUrl: 'https://salud.unlam.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 600,
            studentCount: 1975,
            immigrantPct: 7.4,
            spanishLevel: null,
            subjectCount: 36,
            rankingNational: 36,
            rankingInternational: 5360,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 18
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios 2023-2',
            fuente: 'https://www.unlam.edu.ar/wp-content/uploads/2025/09/MEDICINA-Plan-de-Estudio.pdf',
            ingresoNota: 'Acceso libre y gratuito sin examen de ingreso; ingreso mediante curso de ingreso',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: '03242', nombre: 'Psicología y Relación Médico-Paciente' },
                        { codigo: '00901', nombre: 'Inglés Nivel I' },
                        { codigo: '03243', nombre: 'Promoción Intercultural de la Salud y Ambiente' },
                        { codigo: '03261', nombre: 'Integradora Básica I' },
                        { codigo: '03262', nombre: 'Integradora Básica II' },
                        { codigo: '03240', nombre: 'Formación del Ser Humano' },
                        { codigo: '03241', nombre: 'Articulación Básico Clínica I' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: '00902', nombre: 'Inglés Nivel II', correlativas: ['00901'] },
                        { codigo: '03247', nombre: 'Epidemiología e Investigación en Salud', correlativas: ['03243'] },
                        { codigo: '03263', nombre: 'Integradora Salud Pública I', correlativas: ['03261', '03262'] },
                        { codigo: '03264', nombre: 'Integradora Salud Pública II', correlativas: ['03261', '03262'] },
                        { codigo: '00903', nombre: 'Inglés Nivel III', correlativas: ['00902'] },
                        { codigo: '03244', nombre: 'Nacimiento, Crecimiento y Desarrollo', correlativas: ['03241', '03240'] },
                        { codigo: '03245', nombre: 'Articulación Básico Clínica II', correlativas: ['03240', '03241'] },
                        { codigo: '03246', nombre: 'Agentes, Mecanismos de Defensa y Nutrición', correlativas: ['03241', '03240'] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: '00904', nombre: 'Inglés Nivel IV', correlativas: ['00903'] },
                        { codigo: '03249', nombre: 'Farmacología I. Bases Fisiopatológicas del Tratamiento', correlativas: ['03245', '03246'] },
                        { codigo: '00911', nombre: 'Computación Nivel I' },
                        { codigo: '03251', nombre: 'Gestión de Redes y Servicios de Salud', correlativas: ['03247'] },
                        { codigo: '03248', nombre: 'Articulación Básico Clínica III', correlativas: ['03246', '03245'] },
                        { codigo: '03250', nombre: 'Salud Integral de la Mujer', correlativas: ['03245', '03244', '03246'] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: '00912', nombre: 'Computación Nivel II', correlativas: ['00911'] },
                        { codigo: '03254', nombre: 'Farmacología II. Clínica y Terapéutica', correlativas: ['03248', '03249'] },
                        { codigo: '03255', nombre: 'Medicina General', correlativas: ['03248'] },
                        { codigo: '03265', nombre: 'Integradora Clínica I', correlativas: ['03249', '03261', '03262', '03263', '03264'] },
                        { codigo: '03266', nombre: 'Integradora Clínica II', correlativas: ['03261', '03262', '03263', '03264', '03251'] },
                        { codigo: '03256', nombre: 'Salud Mental', correlativas: ['03249', '03242', '03248'] },
                        { codigo: '03252', nombre: 'Salud del Niño, Niña y Adolescente', correlativas: ['03249', '03248', '03244'] },
                        { codigo: '03253', nombre: 'Medicina Interna y Campos Clínicos I', correlativas: ['03248', '03249'] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: '03257', nombre: 'Salud del Adulto Mayor', correlativas: ['03254', '03253'] },
                        { codigo: '03260', nombre: 'Bioética, Derechos Humanos y Legislación en Salud', correlativas: ['03251', '03265', '03266'] },
                        { codigo: '03267', nombre: 'Integradora Avanzada I', correlativas: ['03265', '03266', '03261', '03262', '03263', '03264'] },
                        { codigo: '03268', nombre: 'Integradora Avanzada II', correlativas: ['03261', '03262', '03263', '03264', '03265', '03266'] },
                        { codigo: '03258', nombre: 'Medicina Interna y Campos Clínicos II', correlativas: ['03254', '03253'] },
                        { codigo: '03259', nombre: 'Clínica Quirúrgica', correlativas: ['03253', '03254', '03250'] }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: '03269', nombre: 'Práctica Final Obligatoria', correlativas: ['03267', '03268', '03257', '03252', '03256', '03260', '03259', '03255', '03258'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unpaz',
        sigla: 'UNPAZ',
        nombre: 'Universidad Nacional de José C. Paz',
        facultad: 'Instituto de Ciencias de la Salud',
        ciudad: 'José C. Paz',
        provincia: 'Buenos Aires (GBA)',
        region: 'GBA',
        lastReviewed: '2026-09-28',
        lat: -34.5100,
        lng: -58.7500,
        fundada: 2009,
        descripcion: 'Institución creada en 2009; la carrera de Medicina se dicta en el Instituto de Ciencias de la Salud de José C. Paz, GBA Norte.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Jos%C3%A9_C._Paz',
        webUrl: 'https://www.unpaz.edu.ar/medicina',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 600,
            studentCount: 2310,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 49,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 35
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios',
            fuente: 'https://www.unpaz.edu.ar/sites/default/files/inline-files/2021-12-10%20%20Carrera%20de%20grado%20Medicina.pdf',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: '01', nombre: 'Bases biológicas de la práctica médica I' },
                        { codigo: '02', nombre: 'Historia y salud en Argentina y Latinoamérica' },
                        { codigo: '03', nombre: 'Articulación Básico Clínico Comunitaria I' },
                        { codigo: '04', nombre: 'Salud ambiental' },
                        { codigo: '05', nombre: 'Fundamentos de Salud Comunitaria' },
                        { codigo: '06', nombre: 'Bases biológicas de la práctica médica II' },
                        { codigo: '07', nombre: 'Articulación Básico Clínico Comunitaria II' },
                        { codigo: '08', nombre: 'Sujetos, instituciones y sociedad en el campo de la salud' },
                        { codigo: '09', nombre: 'Alteridad y salud' },
                        { codigo: '10', nombre: 'Comunicación en el Campo de la Salud' },
                        { codigo: '40', nombre: 'Taller de informática aplicada a la salud' },
                        { codigo: '41', nombre: 'Taller de inglés Técnico I' },
                        { codigo: '42', nombre: 'Taller de inglés Técnico II' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: '11', nombre: 'Bases biológicas para la práctica médica III', correlativas: ['06'] },
                        { codigo: '12', nombre: 'Articulación Básico Clínico Comunitaria III', correlativas: ['07'] },
                        { codigo: '13', nombre: 'Salud sexual', correlativas: ['06', '07', '08', '09', '10'] },
                        { codigo: '14', nombre: 'Salud reproductiva', correlativas: ['13'] },
                        { codigo: '15', nombre: 'Producción y Análisis Crítico del Conocimiento en Salud', correlativas: ['07', '08', '09', '10'] },
                        { codigo: '16', nombre: 'Discapacidad y rehabilitación basada en la comunidad', correlativas: ['07', '08', '09'] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: '17', nombre: 'Bases biológicas para la práctica médica IV', correlativas: ['04', '11'] },
                        { codigo: '18', nombre: 'Articulación Básico Clínico Comunitaria IV', correlativas: ['12'] },
                        { codigo: '19', nombre: 'Epidemiología', correlativas: ['12', '15'] },
                        { codigo: '20', nombre: 'Tamizaje y Ciencias del Diagnóstico', correlativas: ['05', '11', '12'] },
                        { codigo: '21', nombre: 'Redes y Sistemas de Salud', correlativas: ['12', '15'] },
                        { codigo: '22', nombre: 'Salud Integral de la Mujer', correlativas: ['14'] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: '23', nombre: 'Medicina Interna y Campos Clínicos I', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] },
                        { codigo: '24', nombre: 'Salud Colectiva y Comunitaria', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] },
                        { codigo: '25', nombre: 'Terapéuticas y Farmacología', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] },
                        { codigo: '26', nombre: 'Salud del/a Trabajador/a, Recreación y Tiempo Libre', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] },
                        { codigo: '27', nombre: 'Salud del Niño, Niña y Adolescencia', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] },
                        { codigo: '28', nombre: 'Salud Mental', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: '29', nombre: 'Medicina Interna y Campos Clínicos II', correlativas: ['23'] },
                        { codigo: '30', nombre: 'Medicina General', correlativas: ['23'] },
                        { codigo: '31', nombre: 'Programas de Salud', correlativas: ['24'] },
                        { codigo: '32', nombre: 'Salud de las Personas Mayores', correlativas: ['23', '25'] },
                        { codigo: '33', nombre: 'Clínica Quirúrgica y Emergentología', correlativas: ['23', '28'] },
                        { codigo: '34', nombre: 'Bioética y Derechos Humanos', correlativas: ['23'] },
                        { codigo: '35', nombre: 'Medicina Legal y Toxicología', correlativas: ['28'] },
                        { codigo: '36', nombre: 'Salud Internacional (Optativa)', correlativas: ['19'] },
                        { codigo: '37', nombre: 'Economía Política de la Salud (Optativa)', correlativas: ['21'] },
                        { codigo: '38', nombre: 'Cuidados paliativos y manejo del dolor (Optativa)', correlativas: ['23'] },
                        { codigo: '39', nombre: 'Gestión y acción en emergencias y desastres (Optativa)', correlativas: ['23'] }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'PF1', nombre: 'Práctica Final — Clínica Médica', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF2', nombre: 'Práctica Final — Clínica Quirúrgica', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF3', nombre: 'Práctica Final — Primer Nivel de Atención', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF4', nombre: 'Práctica Final — Clínica Tocoginecológica', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF5', nombre: 'Práctica Final — Salud Mental', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF6', nombre: 'Práctica Final — Clínica Pediátrica', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] },
                        { codigo: 'PF7', nombre: 'Práctica Final — Emergencias', correlativas: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unc',
        sigla: 'UNC',
        nombre: 'Universidad Nacional de Córdoba',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Córdoba',
        provincia: 'Córdoba',
        region: 'CBA',
        lastReviewed: '2026-09-28',
        lat: -31.4135,
        lng: -64.1811,
        fundada: 1613,
        descripcion: 'Una de las universidades más antiguas del país; su Facultad de Ciencias Médicas funciona en Ciudad Universitaria, Córdoba.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_C%C3%B3rdoba',
        webUrl: 'https://fcm.unc.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 825,
            studentCount: 6415,
            immigrantPct: 3.1,
            spanishLevel: 'B2',
            subjectCount: 43,
            rankingNational: 2,
            rankingInternational: '351-400',
            rankingSource: 'QS World University Rankings by Subject — Medicine 2026',
            teachingMethod: 'Híbrido',
            distanceToCapitalKm: 647
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios FCM UNC',
            fuente: 'https://fcm.unc.edu.ar/medicina-asignaturas-del-plan-de-estudio-por-ano/',
            ingresoNota: 'El ingreso a la UNC, como en todas las universidades estatales argentinas, es gratuito e irrestricto: solo exige aprobar el Curso de Ingreso (nivelación). El primer año combina bases biomédicas con Salud Comunitaria I y II, que se cursan dentro del mismo año — la II exige la I aprobada —, junto con anatomía, bioquímica e informática, por lo que conviene avanzar al día desde el inicio.',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'UNC-101', nombre: 'Anatomía Normal', correlativas: [] },
                        { codigo: 'UNC-102', nombre: 'Bioquímica y Biología Molecular', correlativas: [] },
                        { codigo: 'UNC-103', nombre: 'Informática Médica', correlativas: [] },
                        { codigo: 'UNC-104', nombre: 'Medicina Antropológica', correlativas: [] },
                        { codigo: 'UNC-105', nombre: 'Salud Comunitaria I', correlativas: [] },
                        { codigo: 'UNC-106', nombre: 'Salud Comunitaria II', correlativas: ['UNC-105'] }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'UNC-201', nombre: 'Biología Celular, Histología, Embriología y Genética', correlativas: ['UNC-101', 'UNC-102'] },
                        { codigo: 'UNC-202', nombre: 'Física Biomédica', correlativas: ['UNC-101', 'UNC-102'] },
                        { codigo: 'UNC-203', nombre: 'Fisiología Humana', correlativas: ['UNC-101', 'UNC-102'] },
                        { codigo: 'UNC-204', nombre: 'Medicina Psicosocial', correlativas: ['UNC-104', 'UNC-106'] },
                        { codigo: 'UNC-205', nombre: 'Salud Comunitaria III', correlativas: ['UNC-105', 'UNC-106'] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'UNC-301', nombre: 'Bacteriología y Virología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-203'] },
                        { codigo: 'UNC-302', nombre: 'Farmacología General', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205'] },
                        { codigo: 'UNC-303', nombre: 'Parasitología y Micología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-203'] },
                        { codigo: 'UNC-304', nombre: 'Patología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-203'] },
                        { codigo: 'UNC-305', nombre: 'Semiología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205'] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'UNC-401', nombre: 'Clínica Dermatológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-402', nombre: 'Clínica Ginecológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-403', nombre: 'Clínica Infectológica I', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-404', nombre: 'Clínica Médica I', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-405', nombre: 'Clínica Neurológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-406', nombre: 'Clínica Oftalmológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-407', nombre: 'Clínica Quirúrgica I', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-408', nombre: 'Diagnóstico por Imágenes y Terapia Radiante', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-302', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-409', nombre: 'Farmacología Aplicada I', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305'] },
                        { codigo: 'UNC-410', nombre: 'Medicina Preventiva y Social I', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-302'] },
                        { codigo: 'UNC-411', nombre: 'Salud Mental', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-302', 'UNC-304', 'UNC-305'] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'UNC-501', nombre: 'Clínica Infectológica II', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-403', 'UNC-404', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-502', nombre: 'Clínica Médica II', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-403', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-503', nombre: 'Clínica Obstétrica y Perinatología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-402', 'UNC-407', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-504', nombre: 'Clínica Otorrinolaringológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-407', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-505', nombre: 'Clínica Pediátrica Neonatológica y de la Adolescencia', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-402', 'UNC-403', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-407', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-506', nombre: 'Clínica Quirúrgica II', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-407', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-507', nombre: 'Clínica Urológica', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-407', 'UNC-408', 'UNC-409'] },
                        { codigo: 'UNC-508', nombre: 'Farmacología Aplicada II', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-402', 'UNC-403', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-407', 'UNC-409'] },
                        { codigo: 'UNC-509', nombre: 'Medicina Legal y Toxicología', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-402', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-407', 'UNC-409', 'UNC-411'] },
                        { codigo: 'UNC-510', nombre: 'Medicina Preventiva y Social II', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-402', 'UNC-403', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-407', 'UNC-409', 'UNC-410'] },
                        { codigo: 'UNC-511', nombre: 'Traumatología y Ortopedia', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-407', 'UNC-408', 'UNC-409'] }
                    ]
                },
                {
                    anio: 6,
                    etiqueta: 'Práctica + Electivas',
                    materias: [
                        { codigo: 'UNC-601', nombre: 'Inglés Médico I', correlativas: [] },
                        { codigo: 'UNC-602', nombre: 'Inglés Médico II', correlativas: ['UNC-601'] },
                        { codigo: 'UNC-603', nombre: 'Inglés Médico III', correlativas: ['UNC-602'] },
                        { codigo: 'UNC-604', nombre: 'Módulos Optativos (4)', correlativas: [] },
                        { codigo: 'UNC-605', nombre: 'Práctica Médica Integrada Supervisada', duracion: 'anual', correlativas: ['UNC-101', 'UNC-102', 'UNC-103', 'UNC-104', 'UNC-105', 'UNC-106', 'UNC-201', 'UNC-202', 'UNC-203', 'UNC-204', 'UNC-205', 'UNC-301', 'UNC-302', 'UNC-303', 'UNC-304', 'UNC-305', 'UNC-401', 'UNC-402', 'UNC-403', 'UNC-404', 'UNC-405', 'UNC-406', 'UNC-407', 'UNC-408', 'UNC-409', 'UNC-410', 'UNC-411', 'UNC-501', 'UNC-502', 'UNC-503', 'UNC-504', 'UNC-505', 'UNC-506', 'UNC-507', 'UNC-508', 'UNC-509', 'UNC-510', 'UNC-511'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unr',
        sigla: 'UNR',
        nombre: 'Universidad Nacional de Rosario',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Rosario',
        provincia: 'Santa Fe',
        region: 'SF',
        lastReviewed: '2026-09-28',
        lat: -32.9442,
        lng: -60.6505,
        fundada: 1968,
        descripcion: 'Facultad de Ciencias Médicas en Rosario, provincia de Santa Fe.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Rosario',
        webUrl: 'https://fcm.unr.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 745,
            studentCount: 13969,
            immigrantPct: 31.4,
            spanishLevel: 'Certificado',
            subjectCount: 20,
            rankingNational: 5,
            rankingInternational: 1364,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 279
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios (estructura por ciclos)',
            fuente: 'https://fcs.unr.edu.ar/wp-content/uploads/2024/04/CS-31-24.pdf',
            ingresoNota: 'Acceso libre y gratuito sin examen de ingreso',
            anios: [
                {
                    etiqueta: 'Ciclo de Promoción de la Salud',
                    materias: [
                        { codigo: '1.1', nombre: 'Crecimiento y Desarrollo' },
                        { codigo: '1.2', nombre: 'Nutrición', correlativas: ['1.1'] },
                        { codigo: '1.3', nombre: 'Sexualidad – Género – Reproducción', correlativas: ['1.2'] },
                        { codigo: '1.4', nombre: 'Trabajo y Tiempo Libre', correlativas: ['1.3'] },
                        { codigo: '1.5', nombre: 'El Ser Humano y su Medio', correlativas: ['1.4'] }
                    ]
                },
                {
                    etiqueta: 'Área Instrumental',
                    materias: [
                        { codigo: '6.1', nombre: 'Inglés' },
                        { codigo: '6.2', nombre: 'Informática' },
                        { codigo: '6.3', nombre: 'Metodología de la Investigación Científica' }
                    ]
                },
                {
                    etiqueta: 'Ciclo de Prevención de la Enfermedad',
                    materias: [
                        { codigo: '2.1', nombre: 'Injurias', correlativas: ['1.5'] },
                        { codigo: '2.2', nombre: 'Defensa', correlativas: ['1.5'] },
                        { codigo: '2.3', nombre: 'Electivas', correlativas: ['1.5'] }
                    ]
                },
                {
                    etiqueta: 'Ciclo de Diagnóstico, Tratamiento y Recuperación',
                    materias: [
                        { codigo: '3.1', nombre: 'Pediatría', correlativas: ['2.1', '2.2', '2.3'] },
                        { codigo: '3.2', nombre: 'Gíneco-Obstetricia', correlativas: ['2.1', '2.2', '2.3'] },
                        { codigo: '3.3', nombre: 'Clínica Quirúrgica', correlativas: ['2.1', '2.2', '2.3'] },
                        { codigo: '3.4', nombre: 'Clínica Médica', correlativas: ['2.1', '2.2', '2.3'] },
                        { codigo: '3.5', nombre: 'Electivas', correlativas: ['2.1', '2.2', '2.3'] }
                    ]
                },
                {
                    etiqueta: 'Ciclo de Práctica Final',
                    materias: [
                        { codigo: '4.1', nombre: 'Pediatría', correlativas: ['3.1', '3.2', '3.3', '3.4', '3.5'] },
                        { codigo: '4.2', nombre: 'Gíneco-Obstetricia', correlativas: ['3.1', '3.2', '3.3', '3.4', '3.5'] },
                        { codigo: '4.3', nombre: 'Clínica Quirúrgica', correlativas: ['3.1', '3.2', '3.3', '3.4', '3.5'] },
                        { codigo: '4.4', nombre: 'Clínica Médica', correlativas: ['3.1', '3.2', '3.3', '3.4', '3.5'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unl',
        sigla: 'UNL',
        nombre: 'Universidad Nacional del Litoral',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Santa Fe',
        provincia: 'Santa Fe',
        region: 'SF',
        lastReviewed: '2026-09-28',
        lat: -31.6333,
        lng: -60.7000,
        fundada: 1919,
        descripcion: 'Facultad de Ciencias Médicas de la Universidad Nacional del Litoral, en Santa Fe; universidad fundada en 1919.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Litoral',
        webUrl: 'https://www.fcm.unl.edu.ar',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 570,
            studentCount: 4230,
            immigrantPct: 0.7,
            spanishLevel: null,
            subjectCount: null,
            rankingNational: 8,
            rankingInternational: 1918,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 395
        },
        plan: null
    },
    {
        id: 'uncuyo',
        sigla: 'UNCuyo',
        nombre: 'Universidad Nacional de Cuyo',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Mendoza',
        provincia: 'Mendoza',
        region: 'MZA',
        lastReviewed: '2026-09-28',
        lat: -32.8895,
        lng: -68.8458,
        fundada: 1939,
        descripcion: 'Facultad de Ciencias Médicas en Mendoza, principal universidad de la región de Cuyo (fundada en 1939).',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Cuyo',
        webUrl: 'https://fcm.uncuyo.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 540,
            studentCount: 1056,
            immigrantPct: 2.3,
            spanishLevel: 'B1/B2',
            subjectCount: 61,
            rankingNational: 10,
            rankingInternational: 2072,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 986
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de estudios',
            fuente: 'https://www.horneroapp.ar/carreras/uncuyo-medicina/',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'CUY-101', nombre: 'Bioestadística y Demografía' },
                        { codigo: 'CUY-102', nombre: 'De la Célula al Hombre' },
                        { codigo: 'CUY-103', nombre: 'De las Moléculas a la Célula' },
                        { codigo: 'CUY-104', nombre: 'Estructura del Cuerpo Humano' },
                        { codigo: 'CUY-105', nombre: 'Inglés I' },
                        { codigo: 'CUY-106', nombre: 'Medicina, Hombre y Sociedad' },
                        { codigo: 'CUY-107', nombre: 'Relación Médico-Paciente I' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'CUY-201', nombre: 'Bases Farmacológicas de Terapéutica Racional' },
                        { codigo: 'CUY-202', nombre: 'Epidemiología Básica' },
                        { codigo: 'CUY-203', nombre: 'Funcionamiento del Organismo' },
                        { codigo: 'CUY-204', nombre: 'Inglés II' },
                        { codigo: 'CUY-205', nombre: 'Microbios, Agresión y Defensa' },
                        { codigo: 'CUY-206', nombre: 'Promoción y Prevención en Salud' },
                        { codigo: 'CUY-207', nombre: 'Relación Médico-Paciente II' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'CUY-301', nombre: 'Inglés III' },
                        { codigo: 'CUY-302', nombre: 'Patología Básica Especial I' },
                        { codigo: 'CUY-303', nombre: 'Patología Básica Especial II' },
                        { codigo: 'CUY-304', nombre: 'Patología General' },
                        { codigo: 'CUY-305', nombre: 'Prueba Global de Ciclo Básico' },
                        { codigo: 'CUY-306', nombre: 'Relación Médico-Paciente III' },
                        { codigo: 'CUY-307', nombre: 'Sistema Nervioso y Comportamiento Humano' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'CUY-401', nombre: 'Atención Primaria de la Salud' },
                        { codigo: 'CUY-402', nombre: 'Cardiología' },
                        { codigo: 'CUY-403', nombre: 'Cirugía de Tórax' },
                        { codigo: 'CUY-404', nombre: 'Cirugía Digestiva' },
                        { codigo: 'CUY-405', nombre: 'Cirugía Vascular Periférica' },
                        { codigo: 'CUY-406', nombre: 'Dermatología' },
                        { codigo: 'CUY-407', nombre: 'Diagnóstico por Imágenes' },
                        { codigo: 'CUY-408', nombre: 'Endocrinología, Metabolismo y Nutrición' },
                        { codigo: 'CUY-409', nombre: 'Epidemiología Clínica' },
                        { codigo: 'CUY-410', nombre: 'Gastroenterología' },
                        { codigo: 'CUY-411', nombre: 'Hematología' },
                        { codigo: 'CUY-412', nombre: 'Infectología' },
                        { codigo: 'CUY-413', nombre: 'Inglés IV' },
                        { codigo: 'CUY-414', nombre: 'Inmunología' },
                        { codigo: 'CUY-415', nombre: 'Nefrología' },
                        { codigo: 'CUY-416', nombre: 'Neumonología' },
                        { codigo: 'CUY-417', nombre: 'Neurología Clínica y Quirúrgica' },
                        { codigo: 'CUY-418', nombre: 'Oftalmología' },
                        { codigo: 'CUY-419', nombre: 'Otorrinolaringología' },
                        { codigo: 'CUY-420', nombre: 'Traumatología, Ortopedia y Rehabilitación' },
                        { codigo: 'CUY-421', nombre: 'Urología' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'CUY-501', nombre: 'Aspectos Éticos, Prácticos y Legales del Ejercicio Profesional I' },
                        { codigo: 'CUY-502', nombre: 'Aspectos Éticos, Prácticos y Legales del Ejercicio Profesional II' },
                        { codigo: 'CUY-503', nombre: 'Inglés V' },
                        { codigo: 'CUY-504', nombre: 'Rotación: Cirugía' },
                        { codigo: 'CUY-505', nombre: 'Rotación: Gineco-Obstetricia' },
                        { codigo: 'CUY-506', nombre: 'Rotación: Medicina Interna' },
                        { codigo: 'CUY-507', nombre: 'Rotación: Pediatría' },
                        { codigo: 'CUY-508', nombre: 'Rotación: Psiquiatría' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'CUY-601', nombre: 'Administración de la Salud' },
                        { codigo: 'CUY-602', nombre: 'Emergentología y Trauma' },
                        { codigo: 'CUY-603', nombre: 'Farmacología Clínica' },
                        { codigo: 'CUY-604', nombre: 'Orientación y Desarrollo Profesional' },
                        { codigo: 'CUY-605', nombre: 'Prueba Global de Ciclo Clínico' }
                    ]
                },
                {
                    anio: 7,
                    materias: [
                        { codigo: 'CUY-701', nombre: 'Cursos Optativos' },
                        { codigo: 'CUY-702', nombre: 'Optativa' },
                        { codigo: 'CUY-703', nombre: 'PFO: Cirugía' },
                        { codigo: 'CUY-704', nombre: 'PFO: Gineco-Obstetricia' },
                        { codigo: 'CUY-705', nombre: 'PFO: Medicina Interna' },
                        { codigo: 'CUY-706', nombre: 'PFO: Pediatría' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unt',
        sigla: 'UNT',
        nombre: 'Universidad Nacional de Tucumán',
        facultad: 'Facultad de Medicina',
        ciudad: 'San Miguel de Tucumán',
        provincia: 'Tucumán',
        region: 'TUC',
        lastReviewed: '2026-09-28',
        lat: -26.8241,
        lng: -65.2226,
        fundada: 1914,
        descripcion: 'Facultad de Medicina de la Universidad Nacional de Tucumán, en San Miguel de Tucumán, NOA (universidad fundada en 1914).',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Tucum%C3%A1n',
        webUrl: 'https://www.fm.unt.edu.ar',
        stats: {
            careerYears: 7,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 510,
            studentCount: 5031,
            immigrantPct: 1.0,
            spanishLevel: null,
            subjectCount: 46,
            rankingNational: 6,
            rankingInternational: 1859,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 1084
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de Estudios Medicina 2020',
            fuente: 'https://www.horneroapp.ar/carreras/unt-medicina/',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'UT-101', nombre: 'Anatomía Normal' },
                        { codigo: 'UT-102', nombre: 'Biología' },
                        { codigo: 'UT-103', nombre: 'Bioquímica' },
                        { codigo: 'UT-104', nombre: 'Módulo Introductorio' },
                        { codigo: 'UT-105', nombre: 'Salud Pública I' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'UT-201', nombre: 'Antropología Médica' },
                        { codigo: 'UT-202', nombre: 'Biofísica' },
                        { codigo: 'UT-203', nombre: 'Fisiología' },
                        { codigo: 'UT-204', nombre: 'Histología' },
                        { codigo: 'UT-205', nombre: 'Salud Mental I' },
                        { codigo: 'UT-206', nombre: 'Salud Pública II' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'UT-301', nombre: 'Anatomía Patológica' },
                        { codigo: 'UT-302', nombre: 'Farmacología Básica' },
                        { codigo: 'UT-303', nombre: 'Microbiología' },
                        { codigo: 'UT-304', nombre: 'Parasitología' },
                        { codigo: 'UT-305', nombre: 'Radiología, Diagnóstico por Imágenes y Terapia Radiante I' },
                        { codigo: 'UT-306', nombre: 'Salud Pública III' },
                        { codigo: 'UT-307', nombre: 'Semiología' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'UT-401', nombre: 'Dermatología' },
                        { codigo: 'UT-402', nombre: 'Ética Biomédica' },
                        { codigo: 'UT-403', nombre: 'Farmacología Especial (integrada a Patología y Clínica Médicas I)' },
                        { codigo: 'UT-404', nombre: 'Farmacología Especial II (integrada a Patología y Clínica Médicas II)' },
                        { codigo: 'UT-405', nombre: 'Neurología' },
                        { codigo: 'UT-406', nombre: 'Oftalmología' },
                        { codigo: 'UT-407', nombre: 'Otorrinolaringología' },
                        { codigo: 'UT-408', nombre: 'Patología y Clínica Médicas I' },
                        { codigo: 'UT-409', nombre: 'Patología y Clínica Médicas II' },
                        { codigo: 'UT-410', nombre: 'Radiología, Diagnóstico por Imágenes y Terapia Radiante II (integrada a Patología y Clínica Médicas I)' },
                        { codigo: 'UT-411', nombre: 'Radiología, Diagnóstico por Imágenes y Terapia Radiante III (integrada a Patología y Clínica Médicas II)' },
                        { codigo: 'UT-412', nombre: 'Salud Mental II' },
                        { codigo: 'UT-413', nombre: 'Salud Pública IV' },
                        { codigo: 'UT-414', nombre: 'Urología' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'UT-501', nombre: 'Enfermedades Infecciosas' },
                        { codigo: 'UT-502', nombre: 'Ginecología' },
                        { codigo: 'UT-503', nombre: 'Medicina Infanto Juvenil' },
                        { codigo: 'UT-504', nombre: 'Medicina Legal' },
                        { codigo: 'UT-505', nombre: 'Obstetricia' },
                        { codigo: 'UT-506', nombre: 'Oncología (integrada a Patología y Clínica Quirúrgicas I)' },
                        { codigo: 'UT-507', nombre: 'Ortopedia y Traumatología' },
                        { codigo: 'UT-508', nombre: 'Patología y Clínica Quirúrgicas I' },
                        { codigo: 'UT-509', nombre: 'Patología y Clínica Quirúrgicas II' },
                        { codigo: 'UT-510', nombre: 'Salud Pública V' },
                        { codigo: 'UT-511', nombre: 'Toxicología' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'UT-601', nombre: 'Inglés' }
                    ]
                },
                {
                    anio: 7,
                    materias: [
                        { codigo: 'UT-701', nombre: 'Pasantía Rural' },
                        { codigo: 'UT-702', nombre: 'Practicantado Rotatorio' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unne',
        sigla: 'UNNE',
        nombre: 'Universidad Nacional del Nordeste',
        facultad: 'Facultad de Medicina',
        ciudad: 'Corrientes',
        provincia: 'Corrientes',
        region: 'COR',
        lastReviewed: '2026-09-28',
        lat: -27.4749,
        lng: -58.8315,
        fundada: 1957,
        descripcion: 'Facultad de Medicina en Corrientes, con actividad académica también en Chaco.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Nordeste',
        webUrl: 'https://med.unne.edu.ar/',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 370,
            studentCount: 4011,
            immigrantPct: 4.1,
            spanishLevel: null,
            subjectCount: 44,
            rankingNational: 17,
            rankingInternational: 3040,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 794
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de Estudios (Plan 2000)',
            fuente: 'https://med.unne.edu.ar/carreras/medicina/',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'UNNE-101', nombre: 'Medicina, Hombre y Sociedad' },
                        { codigo: 'UNNE-102', nombre: 'Anatomía Humana Normal' },
                        { codigo: 'UNNE-103', nombre: 'Histología y Embriología' },
                        { codigo: 'UNNE-104', nombre: 'Bioquímica' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'UNNE-201', nombre: 'Fisiología Humana' },
                        { codigo: 'UNNE-202', nombre: 'Inglés II' },
                        { codigo: 'UNNE-203', nombre: 'Microbiología, Parasitología e Inmunología' },
                        { codigo: 'UNNE-204', nombre: 'Historia de la Medicina (Optativa)' },
                        { codigo: 'UNNE-205', nombre: 'Procedimientos y Técnicas en la Atención del Paciente en los Servicios de Salud (Optativa)' },
                        { codigo: 'UNNE-206', nombre: 'Anatomía y Fisiología Patológicas' },
                        { codigo: 'UNNE-207', nombre: 'Atención Primaria de la Salud, Epidemiología e Informática II' },
                        { codigo: 'UNNE-208', nombre: 'Farmacología' },
                        { codigo: 'UNNE-209', nombre: 'Metodología de la Investigación Científica (Optativa)' },
                        { codigo: 'UNNE-210', nombre: 'Nutrición Básica (Optativa)' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'UNNE-301', nombre: 'Medicina I' },
                        { codigo: 'UNNE-302', nombre: 'Emergentología' },
                        { codigo: 'UNNE-303', nombre: 'Salud Pública' },
                        { codigo: 'UNNE-304', nombre: 'Diagnóstico por Imágenes' },
                        { codigo: 'UNNE-305', nombre: 'Salud Mental y Psiquiatría' },
                        { codigo: 'UNNE-306', nombre: 'Sexología (Optativa)' },
                        { codigo: 'UNNE-307', nombre: 'Medicina del Deporte (Optativa)' },
                        { codigo: 'UNNE-308', nombre: 'Medicina Basada en la Evidencia (Optativa)' },
                        { codigo: 'UNNE-309', nombre: 'Homeostasis del Medio Interno (Optativa)' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'UNNE-401', nombre: 'Cirugía I' },
                        { codigo: 'UNNE-402', nombre: 'Clínica Ginecológica' },
                        { codigo: 'UNNE-403', nombre: 'Medicina II' },
                        { codigo: 'UNNE-404', nombre: 'Pediatría' },
                        { codigo: 'UNNE-405', nombre: 'Nutrición (Optativa)' },
                        { codigo: 'UNNE-406', nombre: 'Fundamentos de Instrumentación Quirúrgica (Optativa)' },
                        { codigo: 'UNNE-407', nombre: 'Procedimientos y Técnicas Quirúrgicas (Optativa)' },
                        { codigo: 'UNNE-408', nombre: 'Manejo de las Enfermedades Quirúrgicas Agudas (Optativa)' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'UNNE-501', nombre: 'Medicina III' },
                        { codigo: 'UNNE-502', nombre: 'Pediatría II' },
                        { codigo: 'UNNE-503', nombre: 'Farmacología Clínica y Terapéutica Farmacológica (Optativa)' },
                        { codigo: 'UNNE-504', nombre: 'Oncología (Optativa)' },
                        { codigo: 'UNNE-505', nombre: 'Enfermedades Tropicales (Optativa)' },
                        { codigo: 'UNNE-506', nombre: 'Terapéutica Pediátrica (Optativa)' },
                        { codigo: 'UNNE-507', nombre: 'Medicina Respiratoria (Optativa)' },
                        { codigo: 'UNNE-508', nombre: 'Economía y Gestión en Salud (Optativa)' },
                        { codigo: 'UNNE-509', nombre: 'Medicina Ambulatoria (Optativa)' },
                        { codigo: 'UNNE-510', nombre: 'Cirugía II' },
                        { codigo: 'UNNE-511', nombre: 'Medicina Legal y Toxicología' },
                        { codigo: 'UNNE-512', nombre: 'Clínica Obstétrica' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'UNNE-601', nombre: 'Práctica Obligatoria Final' }
                    ]
                }
            ]
        }
    },
    {
        id: 'uns',
        sigla: 'UNS',
        nombre: 'Universidad Nacional del Sur',
        facultad: 'Departamento de Ciencias de la Salud',
        ciudad: 'Bahía Blanca',
        provincia: 'Buenos Aires',
        region: 'PBA',
        lastReviewed: '2026-09-28',
        lat: -38.7359,
        lng: -62.2660,
        fundada: 1956,
        descripcion: 'Departamento de Ciencias de la Salud en Bahía Blanca, sur bonaerense.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Sur',
        webUrl: 'https://www.dcs.uns.edu.ar',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 410,
            studentCount: 406,
            immigrantPct: 0.2,
            spanishLevel: null,
            subjectCount: null,
            rankingNational: 9,
            rankingInternational: 2002,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 575
        },
        plan: null
    },
    {
        id: 'unmdp',
        sigla: 'UNMdP',
        nombre: 'Universidad Nacional de Mar del Plata',
        facultad: 'Facultad de Medicina',
        ciudad: 'Mar del Plata',
        provincia: 'Buenos Aires',
        region: 'PBA',
        lastReviewed: '2026-09-28',
        lat: -38.0057,
        lng: -57.5713,
        fundada: 1975,
        descripcion: 'Facultad de Medicina en Mar del Plata, costa bonaerense; universidad nacional fundada en 1975.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Mar_del_Plata',
        webUrl: 'https://medicina.mdp.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 450,
            studentCount: 4845,
            immigrantPct: 11.8,
            spanishLevel: null,
            subjectCount: 50,
            rankingNational: 7,
            rankingInternational: 1915,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 385
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de estudios',
            fuente: 'https://www.horneroapp.ar/carreras/mdp-medicina/',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'MDP-101', nombre: 'Articulación Básico Clínico Comunitaria I' },
                        { codigo: 'MDP-102', nombre: 'Articulación Básico Clínico Comunitaria II' },
                        { codigo: 'MDP-103', nombre: 'Ciclo de Formación Inicial' },
                        { codigo: 'MDP-104', nombre: 'Concepción y Formación del Ser Humano I' },
                        { codigo: 'MDP-105', nombre: 'Concepción y Formación del Ser Humano II' },
                        { codigo: 'MDP-106', nombre: 'Hábitat, Ecología y Salud' },
                        { codigo: 'MDP-107', nombre: 'Promoción de Salud Crítica y Educación para la Salud' },
                        { codigo: 'MDP-108', nombre: 'Psicología Comunitaria, Social e Institucional' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'MDP-201', nombre: 'Agentes, Mecanismos de Defensa y Nutrición' },
                        { codigo: 'MDP-202', nombre: 'Articulación Básico Clínico Comunitaria III' },
                        { codigo: 'MDP-203', nombre: 'Desgaste y Envejecimiento' },
                        { codigo: 'MDP-204', nombre: 'Interculturalidad y Salud' },
                        { codigo: 'MDP-205', nombre: 'Nacimiento, Crecimiento y Desarrollo' },
                        { codigo: 'MDP-206', nombre: 'Prevención e Investigación-Acción en Salud' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'MDP-301', nombre: 'Articulación Básico Clínico Comunitaria IV' },
                        { codigo: 'MDP-302', nombre: 'Epidemiología Crítica, Social y Comunitaria' },
                        { codigo: 'MDP-303', nombre: 'Redes y Sistemas de Salud' },
                        { codigo: 'MDP-304', nombre: 'Salud Integral de la Mujer' },
                        { codigo: 'MDP-305', nombre: 'Tamizaje y Ciencias de Diagnóstico' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'MDP-401', nombre: 'Medicina Interna y Campos Clínicos I' },
                        { codigo: 'MDP-402', nombre: 'Salud Colectiva y Comunitaria' },
                        { codigo: 'MDP-403', nombre: 'Salud del Niño, Niña y Adolescente' },
                        { codigo: 'MDP-404', nombre: 'Salud del Trabajador/a y Medicina del Deporte' },
                        { codigo: 'MDP-405', nombre: 'Salud Mental' },
                        { codigo: 'MDP-406', nombre: 'Terapéuticas y Farmacología' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'MDP-501', nombre: 'Bioética y Derechos Humanos' },
                        { codigo: 'MDP-502', nombre: 'Clínica Quirúrgica y Emergentología' },
                        { codigo: 'MDP-503', nombre: 'Medicina General I' },
                        { codigo: 'MDP-504', nombre: 'Medicina General II y Rehabilitación' },
                        { codigo: 'MDP-505', nombre: 'Medicina Interna y Campos Clínicos II' },
                        { codigo: 'MDP-506', nombre: 'Medicina Legal y Toxicología' },
                        { codigo: 'MDP-507', nombre: 'Programas de Salud' },
                        { codigo: 'MDP-508', nombre: 'Salud del Adulto Mayor' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'MDP-601', nombre: 'Anatomía Patológica' },
                        { codigo: 'MDP-602', nombre: 'Consumos Problemáticos' },
                        { codigo: 'MDP-603', nombre: 'Cuidados Paliativos' },
                        { codigo: 'MDP-604', nombre: 'Diagnóstico por Imágenes' },
                        { codigo: 'MDP-605', nombre: 'Discapacidad' },
                        { codigo: 'MDP-606', nombre: 'Ecología' },
                        { codigo: 'MDP-607', nombre: 'Historia Argentina y Latinoamericana de la Salud' },
                        { codigo: 'MDP-608', nombre: 'Informática en Salud' },
                        { codigo: 'MDP-609', nombre: 'Inglés Aplicado a la Medicina I' },
                        { codigo: 'MDP-610', nombre: 'Inglés Aplicado a la Medicina II' },
                        { codigo: 'MDP-611', nombre: 'Inglés Aplicado a la Medicina III' },
                        { codigo: 'MDP-612', nombre: 'Inglés Aplicado a la Medicina IV' },
                        { codigo: 'MDP-613', nombre: 'Medicina Social' },
                        { codigo: 'MDP-614', nombre: 'Práctica Final (Clínica Médica, Clínica Quirúrgica, Primer Nivel de Atención, Clínica Tocoginecológica, Salud Mental, Clínica Pediátrica, Emergencia)' },
                        { codigo: 'MDP-615', nombre: 'Principios de Oncología' },
                        { codigo: 'MDP-616', nombre: 'Salud Global' },
                        { codigo: 'MDP-617', nombre: 'Tecnologías en Salud' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unaj',
        sigla: 'UNAJ',
        nombre: 'Universidad Nacional Arturo Jauretche',
        facultad: 'Instituto de Ciencias de la Salud',
        ciudad: 'Florencio Varela',
        provincia: 'Buenos Aires',
        region: 'GBA',
        lastReviewed: '2026-09-28',
        lat: -34.7752,
        lng: -58.2679,
        fundada: 2009,
        descripcion: 'Instituto de Ciencias de la Salud en Florencio Varela, sur del GBA.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_Arturo_Jauretche',
        webUrl: 'https://www.unaj.edu.ar/carreras/ciencias-de-la-salud/medicina',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 600,
            studentCount: 2312,
            immigrantPct: null,
            spanishLevel: 'B2',
            subjectCount: null,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 22
        },
        plan: null
    },
    {
        id: 'unchaus',
        sigla: 'UNCAus',
        nombre: 'Universidad Nacional del Chaco Austral',
        facultad: 'Departamento de Ciencias Básicas y Aplicadas',
        ciudad: 'Presidencia Roque Sáenz Peña',
        provincia: 'Chaco',
        region: 'CHA',
        lastReviewed: '2026-09-29',
        lat: -26.8011,
        lng: -60.4464,
        fundada: 2007,
        descripcion: 'Carrera de Medicina en Presidencia Roque Sáenz Peña, sur de Chaco; universidad nacional creada en 2007.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Chaco_Austral',
        webUrl: 'http://medicina.uncaus.edu.ar/',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 330,
            studentCount: 2131,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: null,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 890
        },
        plan: null
    },
    {
        id: 'unicen',
        sigla: 'UNICEN',
        nombre: 'Universidad Nacional del Centro de la Provincia de Buenos Aires',
        facultad: 'Escuela Superior de Ciencias de la Salud',
        ciudad: 'Olavarría',
        provincia: 'Buenos Aires',
        region: 'PBA',
        lastReviewed: '2026-09-28',
        lat: -36.8892,
        lng: -60.3075,
        fundada: 1974,
        descripcion: 'Escuela Superior de Ciencias de la Salud en Olavarría, Buenos Aires.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Centro_de_la_Provincia_de_Buenos_Aires',
        webUrl: 'https://www.salud.unicen.edu.ar/',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 500,
            studentCount: 1414,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: null,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 308
        },
        plan: null
    },
    {
        id: 'uner',
        sigla: 'UNER',
        nombre: 'Universidad Nacional de Entre Ríos',
        facultad: 'Facultad de Ciencias de la Salud',
        ciudad: 'Concepción del Uruguay',
        provincia: 'Entre Ríos',
        region: 'ER',
        lastReviewed: '2026-09-28',
        lat: -32.4839,
        lng: -58.2314,
        fundada: 1973,
        descripcion: 'Facultad de Ciencias de la Salud en Concepción del Uruguay, Entre Ríos.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Entre_R%C3%ADos',
        webUrl: 'https://fcs.uner.edu.ar/medicina',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 500,
            studentCount: 2003,
            immigrantPct: 3.4,
            spanishLevel: null,
            subjectCount: 33,
            rankingNational: 30,
            rankingInternational: 4341,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'PBL',
            distanceToCapitalKm: 236
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de Estudios',
            fuente: 'https://fcs.uner.edu.ar/medicina',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'UNER-101', nombre: 'Salud Individual' },
                        { codigo: 'UNER-102', nombre: 'Salud Colectiva' },
                        { codigo: 'UNER-103', nombre: 'Crecimiento y Desarrollo' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'UNER-201', nombre: 'Inglés I' },
                        { codigo: 'UNER-202', nombre: 'Informática I' },
                        { codigo: 'UNER-203', nombre: 'Nutrición' },
                        { codigo: 'UNER-204', nombre: 'Sexualidad, Género y Reproducción' },
                        { codigo: 'UNER-205', nombre: 'Trabajo y Tiempo Libre' },
                        { codigo: 'UNER-206', nombre: 'El Ser Humano y su Medio' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'UNER-301', nombre: 'Injuria' },
                        { codigo: 'UNER-302', nombre: 'Metodología de la Investigación Científica I' },
                        { codigo: 'UNER-303', nombre: 'Defensa' },
                        { codigo: 'UNER-304', nombre: 'Electivas 3ª' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'UNER-401', nombre: 'Informática II' },
                        { codigo: 'UNER-402', nombre: 'Inglés II' },
                        { codigo: 'UNER-403', nombre: 'Salud del Niño y del Adolescente' },
                        { codigo: 'UNER-404', nombre: 'Salud Integral del Adulto Joven' },
                        { codigo: 'UNER-405', nombre: 'Administración y Gestión de Instituciones de Salud' },
                        { codigo: 'UNER-406', nombre: 'Medicina Legal' },
                        { codigo: 'UNER-407', nombre: 'Procedimientos Diagnósticos y Terapéuticos Invasivos y no Invasivos en la Formación Médica de Grado' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'UNER-501', nombre: 'Salud Integral del Adulto Mayor' },
                        { codigo: 'UNER-502', nombre: 'Metodología de la Investigación Científica II' },
                        { codigo: 'UNER-503', nombre: 'Salud Integral de la Mujer' },
                        { codigo: 'UNER-504', nombre: 'Introducción a las Especialidades Clínico-Quirúrgicas' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'UNER-601', nombre: 'Clínica Pediátrica' },
                        { codigo: 'UNER-602', nombre: 'Ginecología y Obstetricia' },
                        { codigo: 'UNER-603', nombre: 'Clínica Quirúrgica' },
                        { codigo: 'UNER-604', nombre: 'Clínica Médica' },
                        { codigo: 'UNER-605', nombre: 'Medicina General y Familiar' },
                        { codigo: 'UNER-606', nombre: 'Emergentología' },
                        { codigo: 'UNER-607', nombre: 'Escuela de Salud Pública' },
                        { codigo: 'UNER-608', nombre: 'Prácticas Integradas' },
                        { codigo: 'UNER-609', nombre: 'Electivas 4ª y 5ª' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unlar',
        sigla: 'UNLaR',
        nombre: 'Universidad Nacional de La Rioja',
        facultad: 'Departamento de Ciencias de la Salud y de la Educación',
        ciudad: 'La Rioja',
        provincia: 'La Rioja',
        region: 'LR',
        lastReviewed: '2026-09-28',
        lat: -29.4288,
        lng: -66.8673,
        fundada: 1993,
        descripcion: 'Departamento de Ciencias de la Salud y de la Educación en La Rioja.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_La_Rioja',
        webUrl: 'https://www.unlar.edu.ar/index.php/oferta-academica/carreras-de-grado/283-medicina',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 370,
            studentCount: 2425,
            immigrantPct: null,
            spanishLevel: 'CELU',
            subjectCount: null,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 985
        },
        plan: null
    },
    {
        id: 'uncomahue',
        sigla: 'UNComahue',
        nombre: 'Universidad Nacional del Comahue',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Cipolletti',
        provincia: 'Río Negro',
        region: 'RN',
        lastReviewed: '2026-09-28',
        lat: -38.9375,
        lng: -67.9922,
        fundada: 1971,
        descripcion: 'Facultad de Ciencias Médicas en Cipolletti, Río Negro (sede distinta del rectorado en Neuquén).',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_del_Comahue',
        webUrl: 'https://medicina.uncoma.edu.ar',
        stats: {
            careerYears: 7,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 480,
            studentCount: 2710,
            immigrantPct: 8.0,
            spanishLevel: null,
            subjectCount: 28,
            rankingNational: 14,
            rankingInternational: 2387,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'Tradicional',
            distanceToCapitalKm: 982
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Listado de Asignaturas (Plan mod. Ordenanza 1047-13)',
            fuente: 'https://medicina.uncoma.edu.ar/wp-content/uploads/2021/10/Asignaturas-Carrera-de-Medicina.pdf',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: '1', nombre: 'Introducción a la Química de los Sistemas Biológicos' },
                        { codigo: '2', nombre: 'Introducción a la Biofísica' },
                        { codigo: '3', nombre: 'Introducción a la Biología Humana' },
                        { codigo: '4', nombre: 'Medicina y Sociedad' },
                        { codigo: '5', nombre: 'Introducción a los Estudios de la Medicina' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: '6', nombre: 'Anatomía e Imágenes Normales' },
                        { codigo: '7', nombre: 'Histología, Embriología, Biología Molecular y Genética' },
                        { codigo: '8', nombre: 'Bioquímica' },
                        { codigo: '9', nombre: 'Atención Primaria de la Salud I' },
                        { codigo: '10', nombre: 'Fisiología' },
                        { codigo: '11', nombre: 'Taller A' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: '12', nombre: 'Patología' },
                        { codigo: '13', nombre: 'Relación Médico-Paciente' },
                        { codigo: '14', nombre: 'Microbiología y Parasitología' },
                        { codigo: '15', nombre: 'Bioética' },
                        { codigo: '16', nombre: 'Atención Primaria de la Salud II' },
                        { codigo: '17', nombre: 'Taller B' },
                        { codigo: '18', nombre: 'Inglés' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: '19', nombre: 'Medicina I' },
                        { codigo: '20', nombre: 'Farmacología' },
                        { codigo: '21', nombre: 'Farmacología Especial' },
                        { codigo: '22', nombre: 'Taller C' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: '23', nombre: 'Medicina y Cirugía' },
                        { codigo: '24', nombre: 'Psiquiatría' },
                        { codigo: '25', nombre: 'Medicina Legal' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: '26', nombre: 'Ginecología y Obstetricia' },
                        { codigo: '27', nombre: 'Medicina Infantil' }
                    ]
                },
                {
                    anio: 7,
                    materias: [
                        { codigo: '28', nombre: 'Práctica Final Obligatoria' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unrn',
        sigla: 'UNRN',
        nombre: 'Universidad Nacional de Río Negro',
        facultad: 'Sede Andina',
        ciudad: 'San Carlos de Bariloche',
        provincia: 'Río Negro',
        region: 'RN',
        lastReviewed: '2026-09-29',
        lat: -41.1335,
        lng: -71.3103,
        fundada: 2008,
        descripcion: 'Carrera de Medicina nueva (Plan 2021, Res. ME 350/22) dictada en la Sede Andina de Bariloche; universidad creada en 2008.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_R%C3%ADo_Negro',
        webUrl: 'https://www.unrn.edu.ar/carreras/Medicina-81',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 680,
            studentCount: 143,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 26,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 1346
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de Estudios 2021 (Res. ME 350/22)',
            fuente: 'https://www.unrn.edu.ar/archivos/planes/81/Plan%20de%20Estudios%202021%20Medicina.docx.pdf',
            ingresoNota: 'Ingreso en 3 etapas: CPU virtual, presencial disciplinar y MEM',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'B0001', nombre: 'Introducción al Estudio de la Medicina' },
                        { codigo: 'B0002', nombre: 'Promoción de la Salud' },
                        { codigo: 'B0003', nombre: 'Vínculos' },
                        { codigo: 'B0004', nombre: 'Movimiento' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'B0005', nombre: 'Ser Humano y Entorno' },
                        { codigo: 'B0006', nombre: 'Sangre y Defensa' },
                        { codigo: 'B0007', nombre: 'La Respiración' },
                        { codigo: 'B0008', nombre: 'Salud Cardiovascular' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'B0009', nombre: 'Alimentación, Nutrición y Endocrinología' },
                        { codigo: 'B0010', nombre: 'Metabolismo y Excreción' },
                        { codigo: 'B0011', nombre: 'Salud Sexual y Reproductiva' },
                        { codigo: 'B0012', nombre: 'Discapacidad' },
                        { codigo: 'B0013', nombre: 'Curso Optativo I' },
                        { codigo: 'B0014', nombre: 'Curso Optativo II' },
                        { codigo: 'B0015', nombre: 'Inglés Comprensión Lectora' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'B0017', nombre: 'Medicina Preventiva, Práctica Ambulatoria y Medicina Rural' },
                        { codigo: 'B0018', nombre: 'Abordajes Quirúrgicos de Baja Complejidad' },
                        { codigo: 'B0019', nombre: 'Urgencias y Emergencias' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'B0020', nombre: 'Internación' },
                        { codigo: 'B0021', nombre: 'Gestión de Pacientes Crónicos' },
                        { codigo: 'B0022', nombre: 'Salud Mental y Medicina Legal' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'B0023', nombre: 'Seguimiento Longitudinal' },
                        { codigo: 'B0024', nombre: 'Medicina Crítica y de Urgencias' },
                        { codigo: 'B0025', nombre: 'Internación PFO' },
                        { codigo: 'B0026', nombre: 'Medicina Ambulatoria y Rural' },
                        { codigo: 'B0027', nombre: 'Módulo Electivo' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unpsjb',
        sigla: 'UNPSJB',
        nombre: 'Universidad Nacional de la Patagonia San Juan Bosco',
        facultad: 'Facultad de Ciencias Naturales y Ciencias de la Salud',
        ciudad: 'Comodoro Rivadavia',
        provincia: 'Chubut',
        region: 'CHU',
        lastReviewed: '2026-09-28',
        lat: -45.8250,
        lng: -67.4631,
        fundada: 1980,
        descripcion: 'Facultad de Ciencias Naturales y Ciencias de la Salud en Comodoro Rivadavia, Chubut.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_la_Patagonia_San_Juan_Bosco',
        webUrl: 'https://www.fcn.unp.edu.ar/academica/oferta/medicina.html',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 510,
            studentCount: 1434,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 38,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 1465
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios',
            fuente: 'https://www.fcn.unp.edu.ar/academica/oferta/medicina.html',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: '16139', nombre: 'Biología', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '16138', nombre: 'Comprensión de Textos', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '16319-20', nombre: 'Anatomía I', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '16320-20', nombre: 'Histología y Embriología I', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '16321-20', nombre: 'Biofísica', duracion: 'cuatrimestral', correlativas: ['16139', '16138', '16319-20'] },
                        { codigo: '16322-20', nombre: 'Anatomía II', duracion: 'cuatrimestral', correlativas: ['16139', '16319-20', '16320-20'] },
                        { codigo: '16323-20', nombre: 'Histología y Embriología II', duracion: 'cuatrimestral', correlativas: ['16139', '16319-20', '16320-20'] },
                        { codigo: '16324-20', nombre: 'Ciencias Sociales y Medicina', duracion: 'cuatrimestral', correlativas: ['16138'] }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: '16325-20', nombre: 'Bioquímica', duracion: 'anual', correlativas: ['16321-20', '16322-20', '16323-20'] },
                        { codigo: '16326-20', nombre: 'Fisiología', duracion: 'anual', correlativas: ['16321-20', '16322-20', '16323-20'] },
                        { codigo: '16327-20', nombre: 'Genética', duracion: 'cuatrimestral', correlativas: ['16322-20', '16323-20'] },
                        { codigo: '16328-20', nombre: 'Inmunología', duracion: 'cuatrimestral', correlativas: ['16322-20', '16323-20'] },
                        { codigo: '16329-20', nombre: 'Salud de la Comunidad', duracion: 'cuatrimestral', correlativas: ['16324-20'] },
                        { codigo: '16330-20', nombre: 'Inglés Médico', duracion: 'cuatrimestral', correlativas: ['16138', '16327-20'] },
                        { codigo: '16331-20', nombre: 'Microbiología', duracion: 'cuatrimestral', correlativas: ['16327-20', '16328-20'] },
                        { codigo: '16332-20', nombre: 'Bioestadística', duracion: 'cuatrimestral', correlativas: ['16321-20'] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: '16333-20', nombre: 'Patología', duracion: 'anual', correlativas: ['16325-20', '16326-20', '16327-20', '16328-20'] },
                        { codigo: '16334-20', nombre: 'Semiología', duracion: 'anual', correlativas: ['16325-20', '16326-20', '16327-20', '16331-20'] },
                        { codigo: '16335-20', nombre: 'Farmacología', duracion: 'anual', correlativas: ['16325-20', '16326-20', '16327-20', '16331-20'] },
                        { codigo: '16336-20', nombre: 'Investigación en Salud y Bioética', duracion: 'cuatrimestral', correlativas: ['16329-20', '16330-20', '16332-20'] },
                        { codigo: '16337-20', nombre: 'Epidemiología', duracion: 'cuatrimestral', correlativas: ['16329-20', '16331-20', '16332-20'] },
                        { codigo: '16338-20', nombre: 'Planificación de la Salud', duracion: 'cuatrimestral', correlativas: ['16337-20'] },
                        { codigo: '16339-20', nombre: 'Diagnóstico por Imágenes', duracion: 'cuatrimestral', correlativas: ['16326-20'] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: '16340-20', nombre: 'Clínica Médica I', duracion: 'anual', correlativas: ['16333-20', '16334-20', '16335-20', '16339-20'] },
                        { codigo: '16341-20', nombre: 'Promoción de la Salud', duracion: 'cuatrimestral', correlativas: ['16336-20', '16337-20', '16338-20'] },
                        { codigo: '16342-20', nombre: 'Traumatología y Ortopedia', duracion: 'cuatrimestral', correlativas: ['16333-20', '16334-20', '16335-20', '16339-20'] },
                        { codigo: '16343-20', nombre: 'Medicina Legal y Deontología', duracion: 'cuatrimestral', correlativas: ['16333-20', '16336-20', '16337-20'] },
                        { codigo: '16344-20', nombre: 'Infectología', duracion: 'cuatrimestral', correlativas: ['16333-20', '16334-20', '16335-20', '16337-20'] },
                        { codigo: '16345-20', nombre: 'Neurología', duracion: 'cuatrimestral', correlativas: ['16334-20', '16335-20'] },
                        { codigo: '16346-20', nombre: 'Salud Mental', duracion: 'cuatrimestral', correlativas: ['16334-20', '16335-20'] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: '16347-20', nombre: 'Clínica Médica II', duracion: 'anual', correlativas: ['16340-20', '16344-20', '16345-20', '16346-20'] },
                        { codigo: '16348-20', nombre: 'Cirugía', duracion: 'anual', correlativas: ['16340-20', '16342-20', '16343-20', '16344-20'] },
                        { codigo: '16349-20', nombre: 'Pediatría', duracion: 'anual', correlativas: ['16340-20', '16342-20', '16344-20'] },
                        { codigo: '16350-20', nombre: 'Emergentología', duracion: 'cuatrimestral', correlativas: ['16340-20', '16342-20', '16343-20', '16345-20'] },
                        { codigo: '16351-20', nombre: 'Ginecología', duracion: 'cuatrimestral', correlativas: ['16340-20', '16343-20'] },
                        { codigo: '16352-20', nombre: 'Obstetricia', duracion: 'cuatrimestral', correlativas: ['16346-20', '16351-20'] },
                        { codigo: '16353-20', nombre: 'Medicina General', duracion: 'cuatrimestral', correlativas: ['16341-20', '16344-20', '16350-20'] }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: '16354-20', nombre: 'Práctica Final Obligatoria', duracion: 'anual', correlativas: [] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unse',
        sigla: 'UNSE',
        nombre: 'Universidad Nacional de Santiago del Estero',
        facultad: 'Facultad de Ciencias Médicas',
        ciudad: 'Santiago del Estero',
        provincia: 'Santiago del Estero',
        region: 'SDE',
        lastReviewed: '2026-09-28',
        lat: -27.8010,
        lng: -64.2511,
        fundada: 1973,
        descripcion: 'Facultad de Ciencias Médicas en Santiago del Estero, NOA; universidad nacional fundada en 1973.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Santiago_del_Estero',
        webUrl: 'https://fcm.unse.edu.ar',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 350,
            studentCount: 1171,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 65,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 940
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de estudios',
            fuente: 'https://www.horneroapp.ar/carreras/unse-medicina/',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'SE-101', nombre: 'Anatomía Normal' },
                        { codigo: 'SE-102', nombre: 'Antropología Médica y Social' },
                        { codigo: 'SE-103', nombre: 'Bioquímica y Biología Molecular' },
                        { codigo: 'SE-104', nombre: 'Citología, Histología y Embriología' },
                        { codigo: 'SE-105', nombre: 'Salud Pública I' },
                        { codigo: 'SE-106', nombre: 'Taller De Integración I' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'SE-201', nombre: 'Fisiología y Biofísica' },
                        { codigo: 'SE-202', nombre: 'Genética Médica' },
                        { codigo: 'SE-203', nombre: 'Informática Médica' },
                        { codigo: 'SE-204', nombre: 'Inglés I' },
                        { codigo: 'SE-205', nombre: 'Inmunología' },
                        { codigo: 'SE-206', nombre: 'Metodología de la Investigación I' },
                        { codigo: 'SE-207', nombre: 'Microbiología' },
                        { codigo: 'SE-208', nombre: 'Relación Médico - Paciente y Familia I' },
                        { codigo: 'SE-209', nombre: 'Salud Pública II' },
                        { codigo: 'SE-210', nombre: 'Taller De Integración II' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'SE-301', nombre: 'Anatomía Patológica' },
                        { codigo: 'SE-302', nombre: 'Bioética' },
                        { codigo: 'SE-303', nombre: 'Diagnóstico por Imágenes' },
                        { codigo: 'SE-304', nombre: 'Farmacología General' },
                        { codigo: 'SE-305', nombre: 'Inglés II' },
                        { codigo: 'SE-306', nombre: 'Metodología de la Investigacion II' },
                        { codigo: 'SE-307', nombre: 'Portugués I' },
                        { codigo: 'SE-308', nombre: 'Relación Médico - Paciente y Familia II' },
                        { codigo: 'SE-309', nombre: 'Salud Pública III' },
                        { codigo: 'SE-310', nombre: 'Semiología' },
                        { codigo: 'SE-311', nombre: 'Taller De Integración III' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'SE-401', nombre: 'Clínica Dermatológica' },
                        { codigo: 'SE-402', nombre: 'Clínica Ginecológica' },
                        { codigo: 'SE-403', nombre: 'Clínica Infectológica I' },
                        { codigo: 'SE-404', nombre: 'Clínica Médica I' },
                        { codigo: 'SE-405', nombre: 'Clínica Neurológica' },
                        { codigo: 'SE-406', nombre: 'Clínica Oftalmológica' },
                        { codigo: 'SE-407', nombre: 'Clínica ORL' },
                        { codigo: 'SE-408', nombre: 'Clínica Quirúrgica I' },
                        { codigo: 'SE-409', nombre: 'Clínica Urológica' },
                        { codigo: 'SE-410', nombre: 'Farmacología Aplicada y Toxicología' },
                        { codigo: 'SE-411', nombre: 'Inglés III' },
                        { codigo: 'SE-412', nombre: 'Medicina Preventiva y Social' },
                        { codigo: 'SE-413', nombre: 'Nutrición' },
                        { codigo: 'SE-414', nombre: 'Portugués II' },
                        { codigo: 'SE-415', nombre: 'Taller de Integración IV' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'SE-501', nombre: 'Administración y Gestión de Servicios de Salud' },
                        { codigo: 'SE-502', nombre: 'Clínica Médica II' },
                        { codigo: 'SE-503', nombre: 'Clínica Obstétrica' },
                        { codigo: 'SE-504', nombre: 'Clínica Pediátrica' },
                        { codigo: 'SE-505', nombre: 'Clínica Psiquiatrica' },
                        { codigo: 'SE-506', nombre: 'Clínica Quirúrgica' },
                        { codigo: 'SE-507', nombre: 'Clínica Traumatológica y Ortopedia' },
                        { codigo: 'SE-508', nombre: 'Emergentología' },
                        { codigo: 'SE-509', nombre: 'Geriatría y Gerontología' },
                        { codigo: 'SE-510', nombre: 'Medicina Legal' },
                        { codigo: 'SE-511', nombre: 'Metodología de la Investigacion Clínica y Bioestadística Aplicada' },
                        { codigo: 'SE-512', nombre: 'Relaciones Humanas' },
                        { codigo: 'SE-513', nombre: 'Salud Mental' },
                        { codigo: 'SE-514', nombre: 'Taller de Integración V' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'SE-601', nombre: 'Materia Optativa I' },
                        { codigo: 'SE-602', nombre: 'Materia Optativa II' },
                        { codigo: 'SE-603', nombre: 'Materia Optativa III' },
                        { codigo: 'SE-604', nombre: 'PFO — Cirugía' },
                        { codigo: 'SE-605', nombre: 'PFO — Medicina' },
                        { codigo: 'SE-606', nombre: 'PFO — Pediatría' },
                        { codigo: 'SE-607', nombre: 'PFO — Rotación Optativa / Investigación' },
                        { codigo: 'SE-608', nombre: 'PFO — Rotación Rural' },
                        { codigo: 'SE-609', nombre: 'PFO — Tocoginecología' }
                    ]
                }
            ]
        }
    },
    {
        id: 'unsalta',
        sigla: 'UNSa',
        nombre: 'Universidad Nacional de Salta',
        facultad: 'Facultad de Ciencias de la Salud',
        ciudad: 'Salta',
        provincia: 'Salta',
        region: 'SAL',
        lastReviewed: '2026-09-28',
        lat: -24.7271,
        lng: -65.4092,
        fundada: 1972,
        descripcion: 'Facultad de Ciencias de la Salud en Salta, NOA; universidad nacional fundada en 1972.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Salta',
        webUrl: 'http://fsalud.unsa.edu.ar/salud/',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 450,
            studentCount: 324,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 60,
            rankingNational: 21,
            rankingInternational: 3269,
            rankingSource: 'EduRank Medicine 2026',
            teachingMethod: 'Híbrido',
            distanceToCapitalKm: 1290
        },
        plan: {
            nombre: 'Medicina — Plan de Estudios',
            fuente: 'http://fsalud.unsa.edu.ar/salud/index.php/carrera/carreras/2016-12-13-16-04-27/noticias',
            ingresoNota: 'Preinscripción; no adeudar materias de secundaria',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: '1', nombre: 'Introducción a los Estudios de Medicina', duracion: 'bimestral', correlativas: [] },
                        { codigo: '2', nombre: 'Anatomía Humana Normal', duracion: 'anual', correlativas: ['1'] },
                        { codigo: '3', nombre: 'Bioquímica', duracion: 'anual', correlativas: ['1'] },
                        { codigo: '4', nombre: 'Biología Celular - Genética - Embriología', duracion: 'cuatrimestral', correlativas: ['1'] },
                        { codigo: '5', nombre: 'Salud-Hombre-Sociedad', duracion: 'cuatrimestral', correlativas: ['1'] },
                        { codigo: '6', nombre: 'Herramientas de la Investigación Científica Básica', duracion: 'cuatrimestral', correlativas: ['1'] },
                        { codigo: '7', nombre: 'Inglés I de Lecto-Comprensión', duracion: 'cuatrimestral', correlativas: ['1'] }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: '8', nombre: 'Fisiología Humana', duracion: 'anual', correlativas: ['2', '3', '4', '10'] },
                        { codigo: '9', nombre: 'Histología e Inmunología', duracion: 'anual', correlativas: ['2', '3', '4'] },
                        { codigo: '10', nombre: 'Biofísica', duracion: 'anual', correlativas: ['2', '3', '4'] },
                        { codigo: '11', nombre: 'Salud Mental', duracion: 'cuatrimestral', correlativas: ['3', '4'] },
                        { codigo: '12', nombre: 'Urgencias y Emergencias Médicas I', duracion: 'cuatrimestral', correlativas: ['2', '3', '4'] },
                        { codigo: '13', nombre: 'Inglés II de Lecto-Comprensión', duracion: 'cuatrimestral', correlativas: ['7'] },
                        { codigo: '14', nombre: 'Salud Comunitaria I', duracion: 'cuatrimestral', correlativas: ['5'] },
                        { codigo: '15', nombre: 'Optativa I', duracion: 'bimestral', correlativas: [] }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: '16', nombre: 'Semiología', duracion: 'anual', correlativas: ['8', '9', '11', '19'] },
                        { codigo: '17', nombre: 'Anatomía Patológica', duracion: 'anual', correlativas: ['8', '9', '11', '19'] },
                        { codigo: '18', nombre: 'Farmacología Básica', duracion: 'anual', correlativas: ['8', '9', '11', '19'] },
                        { codigo: '19', nombre: 'Microbiología y Parasitología', duracion: 'anual', correlativas: ['2', '3', '4', '16', '18'] },
                        { codigo: '20', nombre: 'Ética Biomédica', duracion: 'cuatrimestral', correlativas: ['11'] },
                        { codigo: '21', nombre: 'Psiquiatría y Salud Mental I', duracion: 'cuatrimestral', correlativas: ['11'] },
                        { codigo: '22', nombre: 'Epidemiología Básica y Aplicada', duracion: 'cuatrimestral', correlativas: ['14'] },
                        { codigo: '23', nombre: 'Diagnóstico por Imágenes y Terapia Radiante I', duracion: 'cuatrimestral', correlativas: ['8', '9', '11'] },
                        { codigo: '24', nombre: 'Clínica Oftalmológica', duracion: 'cuatrimestral', correlativas: ['8', '9', '11'] },
                        { codigo: '25', nombre: 'Inglés Técnico para Ciencias de la Salud', duracion: 'cuatrimestral', correlativas: ['13'] },
                        { codigo: '26', nombre: 'Urgencias y Emergencias Médicas II', duracion: 'cuatrimestral', correlativas: ['11', '12'] },
                        { codigo: '27', nombre: 'Antropología Médica. Relación Médico - Paciente', duracion: 'cuatrimestral', correlativas: ['11'] },
                        { codigo: '28', nombre: 'Optativa II', duracion: 'bimestral', correlativas: [] }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: '29', nombre: 'Clínica del Adulto y Adulto Mayor', duracion: 'anual', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '30', nombre: 'Farmacología Especial Integrada a la Clínica', duracion: 'anual', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '31', nombre: 'Diagnóstico por Imágenes y Terapia Radiante II - Integrado a la Clínica', duracion: 'anual', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '32', nombre: 'Psiquiatría y Salud Mental II', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '33', nombre: 'Clínica Neurológica', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '34', nombre: 'Clínica Dermatológica', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '35', nombre: 'Clínica Otorrinolaringológica', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '36', nombre: 'Clínica General de las Intoxicaciones', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '37', nombre: 'Administración y Gestión de Servicios de Salud', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '38', nombre: 'Clínica y Cirugía Urológica', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '39', nombre: 'Salud de la Mujer I. Clínica y Cirugía Ginecológica', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '24', '26', '27'] },
                        { codigo: '40', nombre: 'Urgencias y Emergencias Médicas III', duracion: 'cuatrimestral', correlativas: ['16', '17', '18', '20', '21', '22', '23', '24', '26', '27'] },
                        { codigo: '41', nombre: 'Optativa III', duracion: 'bimestral', correlativas: [] }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: '42', nombre: 'Cirugía General', duracion: 'anual', correlativas: ['29', '33', '38', '39', '40'] },
                        { codigo: '43', nombre: 'Clínica y Cirugía en Oncología (Integrado a Cirugía General)', duracion: 'anual', correlativas: ['29', '33', '38', '39', '40'] },
                        { codigo: '44', nombre: 'Inmunología Clínica', duracion: 'cuatrimestral', correlativas: ['29'] },
                        { codigo: '45', nombre: 'Salud de la Mujer II. Clínica y Cirugía Obstétrica', duracion: 'cuatrimestral', correlativas: ['29', '33', '38', '39', '40'] },
                        { codigo: '46', nombre: 'Clínica y Cirugía Traumatológica – Ortopedia', duracion: 'cuatrimestral', correlativas: ['29', '40'] },
                        { codigo: '47', nombre: 'Metodología de la Investigación Clínica y Bioestadística Aplicada a la Medicina', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '48', nombre: 'Salud Comunitaria II. Planificación y Programación', duracion: 'cuatrimestral', correlativas: ['29', '37'] },
                        { codigo: '49', nombre: 'Clínica de las Enfermedades Infecciosas', duracion: 'cuatrimestral', correlativas: ['29', '33', '39', '40'] },
                        { codigo: '50', nombre: 'Medicina Infanto-Juvenil', duracion: 'cuatrimestral', correlativas: ['29', '33', '38', '39', '40'] },
                        { codigo: '51', nombre: 'Deontología Médica y Medicina Legal', duracion: 'cuatrimestral', correlativas: ['29', '32', '33', '38', '39', '40', '42', '46'] },
                        { codigo: '52', nombre: 'Urgencias y Emergencias en Psiquiatría y Salud Mental', duracion: 'cuatrimestral', correlativas: ['32', '40'] },
                        { codigo: '53', nombre: 'Inglés en Ciencias de la Salud. Conversación', duracion: 'cuatrimestral', correlativas: ['25', '29'] },
                        { codigo: '54', nombre: 'Informática en Ciencias de la Salud', duracion: 'cuatrimestral', correlativas: [] },
                        { codigo: '55', nombre: 'Optativa IV', duracion: 'bimestral', correlativas: [] }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: '56', nombre: 'Practicantado Rotatorio en Pediatría', duracion: 'bimestral', correlativas: [] },
                        { codigo: '57', nombre: 'Practicantado Rotatorio en Gineco-Obstetricia', duracion: 'bimestral', correlativas: [] },
                        { codigo: '58', nombre: 'Practicantado Rotatorio en Clínica Médica', duracion: 'bimestral', correlativas: [] },
                        { codigo: '59', nombre: 'Practicantado Rotatorio en Cirugía', duracion: 'bimestral', correlativas: [] },
                        { codigo: '60', nombre: 'Pasantía Rural Comunitaria', duracion: 'cuatrimestral', correlativas: ['56', '57', '58', '59'] }
                    ]
                }
            ]
        }
    },
    {
        id: 'unvm',
        sigla: 'UNVM',
        nombre: 'Universidad Nacional de Villa María',
        facultad: 'Instituto Académico Pedagógico de Ciencias Humanas',
        ciudad: 'Villa María',
        provincia: 'Córdoba',
        region: 'CBA',
        lastReviewed: '2026-09-28',
        lat: -32.3841,
        lng: -63.2618,
        fundada: 1995,
        descripcion: 'Carrera de Medicina en el Instituto Académico Pedagógico de Ciencias Humanas de la Universidad Nacional de Villa María, Córdoba (fundada en 1995).',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Villa_Mar%C3%ADa',
        webUrl: 'https://www.unvm.edu.ar/medicina',
        stats: {
            careerYears: null,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 400,
            studentCount: 440,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: null,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 515
        },
        plan: null
    },
    {
        id: 'unvime',
        sigla: 'UNViMe',
        nombre: 'Universidad Nacional de Villa Mercedes',
        facultad: 'Escuela de Medicina',
        ciudad: 'Villa Mercedes',
        provincia: 'San Luis',
        region: 'SL',
        lastReviewed: '2026-09-29',
        lat: -33.6868,
        lng: -65.4679,
        fundada: 2009,
        descripcion: 'Escuela de Medicina en Villa Mercedes, San Luis; carrera de 6 años (Plan R.R. 822-2018, Res. Min. 2384); universidad nacional creada en 2009.',
        wikiUrl: 'https://es.wikipedia.org/wiki/Universidad_Nacional_de_Villa_Mercedes',
        webUrl: 'https://www.unvime.edu.ar/em/medicina/',
        stats: {
            careerYears: 6,
            graduationRate: null,
            avgGraduationYears: null,
            livingCostUsd: 430,
            studentCount: 228,
            immigrantPct: null,
            spanishLevel: null,
            subjectCount: 40,
            rankingNational: null,
            rankingInternational: null,
            rankingSource: null,
            teachingMethod: null,
            distanceToCapitalKm: 660
        },
        plan: {
            simplified: true,
            nombre: 'Medicina — Plan de Estudios (Plan R.R. 822-2018)',
            fuente: 'https://www.unvime.edu.ar/em/medicina/',
            ingresoNota: 'Ciclo de Ingreso a Medicina (CIM); Curso de Apoyo al Ingresante (CAI)',
            anios: [
                {
                    anio: 1,
                    materias: [
                        { codigo: 'VIME-101', nombre: 'Anatomía' },
                        { codigo: 'VIME-102', nombre: 'Química Biológica' },
                        { codigo: 'VIME-103', nombre: 'Histología, Biología Celular, Embriología y Genética' },
                        { codigo: 'VIME-104', nombre: 'Salud y Enfermedad' },
                        { codigo: 'VIME-105', nombre: 'Bioética' }
                    ]
                },
                {
                    anio: 2,
                    materias: [
                        { codigo: 'VIME-201', nombre: 'Fisiología y Biofísica I y II' },
                        { codigo: 'VIME-202', nombre: 'Microbiología, Parasitología e Inmunología I y II' },
                        { codigo: 'VIME-203', nombre: 'Nutrición' },
                        { codigo: 'VIME-204', nombre: 'Atención Primaria en Salud' }
                    ]
                },
                {
                    anio: 3,
                    materias: [
                        { codigo: 'VIME-301', nombre: 'Patología I y II' },
                        { codigo: 'VIME-302', nombre: 'Farmacología I y II' },
                        { codigo: 'VIME-303', nombre: 'Diagnóstico por Imágenes' },
                        { codigo: 'VIME-304', nombre: 'Metodología de la Investigación y Bioestadística' },
                        { codigo: 'VIME-305', nombre: 'Salud Pública' },
                        { codigo: 'VIME-306', nombre: 'Medicina Legal y Deontología Médica' }
                    ]
                },
                {
                    anio: 4,
                    materias: [
                        { codigo: 'VIME-401', nombre: 'Medicina I (Semiología y Fisiopatología)' },
                        { codigo: 'VIME-402', nombre: 'Medicina II (Medicina Interna)' },
                        { codigo: 'VIME-403', nombre: 'Infectología' },
                        { codigo: 'VIME-404', nombre: 'Dermatología' },
                        { codigo: 'VIME-405', nombre: 'Pediatría' },
                        { codigo: 'VIME-406', nombre: 'Medicina en catástrofe (Optativa)' },
                        { codigo: 'VIME-407', nombre: 'Fitoterapia y medicación folclórica (Optativa)' },
                        { codigo: 'VIME-408', nombre: 'Medicina del deporte (Optativa)' },
                        { codigo: 'VIME-409', nombre: 'Electrocardiografía clínica (Optativa)' }
                    ]
                },
                {
                    anio: 5,
                    materias: [
                        { codigo: 'VIME-501', nombre: 'Cirugía General' },
                        { codigo: 'VIME-502', nombre: 'Ortopedia y Traumatología' },
                        { codigo: 'VIME-503', nombre: 'Urología' },
                        { codigo: 'VIME-504', nombre: 'Neurología' },
                        { codigo: 'VIME-505', nombre: 'Neurocirugía' },
                        { codigo: 'VIME-506', nombre: 'Psiquiatría' },
                        { codigo: 'VIME-507', nombre: 'Toxicología' },
                        { codigo: 'VIME-508', nombre: 'Obstetricia' },
                        { codigo: 'VIME-509', nombre: 'Ginecología' },
                        { codigo: 'VIME-510', nombre: 'Oftalmología' },
                        { codigo: 'VIME-511', nombre: 'Otorrinolaringología' },
                        { codigo: 'VIME-512', nombre: 'Emergentología' }
                    ]
                },
                {
                    anio: 6,
                    materias: [
                        { codigo: 'VIME-601', nombre: 'Rotación y guardias en Clínica Médica' },
                        { codigo: 'VIME-602', nombre: 'Rotación y guardias en Pediatría' },
                        { codigo: 'VIME-603', nombre: 'Rotación y guardias en Obstetricia' },
                        { codigo: 'VIME-604', nombre: 'Rotación y guardias en Medicina de Urgencias y Emergencias' }
                    ]
                }
            ]
        }
    }
];
