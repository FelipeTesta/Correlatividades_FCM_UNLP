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
    intervaloRefuerzoMeses: 120 // 10 años
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
  }
};
