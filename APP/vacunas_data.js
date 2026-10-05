// vacunas_data.js
// Esquema de Vacunación Personal de Salud - Argentina 2026
// Patologías cubiertas para evitar redundancias

const VACUNAS_CONFIG = {
  'hepatitisB': {
    nome: 'Hepatitis B',
    patologias: ['Hepatitis B'],
    dosesSeries: 3,
    intervaloRefuerzoMeses: null
  },
  'tripleViral': {
    nome: 'Triple Viral',
    patologias: ['Sarampión', 'Rubéola', 'Parotiditis'],
    dosesSeries: 2,
    intervaloRefuerzoMeses: null
  },
  'dtpa': {
    nome: 'Triple Bacteriana Acelular (dTpa)',
    patologias: ['Difteria', 'Tétanos', 'Tos Convulsa'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: 120, // 10 años
    // Exigida solo al poder cursar Pediatría (PD001, 5º año) — regla requiereDtpa() en vacunas.js
  },
  'dt': {
    nome: 'Doble Bacteriana (dT)',
    patologias: ['Difteria', 'Tétanos'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: 120 // 10 años
  },
  'antigripal2026': {
    nome: 'Antigripal 2026',
    patologias: ['Influenza'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: 12 // Anual
  },
  'covid19': {
    nome: 'COVID-19',
    patologias: ['COVID-19'],
    dosesSeries: 3,
    intervaloRefuerzoMeses: 6 // 6 meses recomendado
  },
  'fiebreAmarilla': {
    nome: 'Fiebre Amarilla',
    patologias: ['Fiebre Amarilla'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: null, // dosis única, inmunidad de por vida (OMS, nota descriptiva 2025)
    // No obligatoria: recomendada para viajeros a zonas de riesgo (NEA/NOA, Iguazú)
  },
  'hepatitisA': {
    nome: 'Hepatitis A',
    patologias: ['Hepatitis A'],
    dosesSeries: 2,
    intervaloRefuerzoMeses: null, // esquema 0 y 6 meses
    // No obligatoria en adultos (universal a los 12 meses); útil para viajeros/brotes
  },
  'varicela': {
    nome: 'Varicela',
    patologias: ['Varicela'],
    dosesSeries: 2,
    intervaloRefuerzoMeses: null, // esquema 0 y 1 mes (4-8 semanas)
    // No obligatoria en adultos; indicada en susceptibles (sin antecedente ni vacuna)
  },
  'neumococica': {
    nome: 'Neumocócica',
    patologias: ['Neumococo'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: null, // VNC20 dosis única en adultos sin esquema previo
    // No obligatoria 15-64 años; indicada en factores de riesgo (universal a los 65)
  },
  'meningococica': {
    nome: 'Meningocócica',
    patologias: ['Meningococo'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: null,
    // No obligatoria en adultos; indicada en grupos de riesgo (asplenia, complemento, VIH)
  },
  'fiebreHemorragica': {
    nome: 'Fiebre Hemorrágica Argentina',
    patologias: ['Fiebre Hemorrágica Argentina (Junín)'],
    dosesSeries: 1,
    intervaloRefuerzoMeses: null, // Candid 1, dosis única
    // No obligatoria en La Plata; indicada a partir de los 15 años en zona endémica
    // (ciertas jurisdicciones rurales de Buenos Aires, Córdoba, Santa Fe y La Pampa)
  }
};
