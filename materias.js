// ===============================
// INCLUIR: HORAS, OPTATIVAS
// ===============================

const materias = [

{ codigo:"A0001", nombre:"Anatomía", anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"BIOL9", nombre:"Biología", anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"CS001", nombre:"Ciencias Sociales y Medicina", anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"H0001", nombre:"Citología, Histología y Embriología", anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"IFB01", nombre:"Informática Básica", anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"B0001", nombre:"Bioquímica y Biología Molecular", anio:2,
  paraCursar:[
    {materia:"BIOL9",condicion:"aprobada"},
    {materia:"H0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"BIOL9",condicion:"aprobada"},
    {materia:"H0001",condicion:"regularizada"}
  ]
},
{ codigo:"EP001", nombre:"Epidemiología", anio:2,
  paraCursar:[
    {materia:"CS001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"CS001",condicion:"aprobada"}
  ]
},
{ codigo:"FB001", nombre:"Fisiología y Física Biológica", anio:2,
  paraCursar:[
    {materia:"A0001",condicion:"regularizada"},
    {materia:"BIOL9",condicion:"regularizada"},
    {materia:"H0001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"BIOL9",condicion:"aprobada"},
    {materia:"A0001",condicion:"regularizada"},
    {materia:"H0001",condicion:"aprobada"}
  ]
},
{ codigo:"IFM02", nombre:"Informática Médica", anio:2,
  paraCursar:[
    {materia:"IFB01",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"IFB01",condicion:"aprobada"}
  ]
},
{ codigo:"PG001", nombre:"Psicología Médica", anio:2,
  paraCursar:[],
  paraAprobar:[
    {materia:"A0001",condicion:"aprobada"}
  ]
},
{ codigo:"F9001", nombre:"Farmacología Básica", anio:3,
  paraCursar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ]
},
{ codigo:"M0001", nombre:"Microbiología y Parasitología", anio:3,
  paraCursar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"FB001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"}
  ]
},
{ codigo:"P9001", nombre:"Psiquiatría - Módulo I", anio:3,
  paraCursar:[
    {materia:"PG001",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PG001",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ]
},
{ codigo:"S0003", nombre:"Salud y Medicina Comunitaria", anio:3,
  paraCursar:[
    {materia:"EP001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"EP001",condicion:"aprobada"}
  ]
},
{ codigo:"SEM91", nombre:"Semiología", anio:3,
  paraCursar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ]
},
{ codigo:"PT001", nombre:"Patología", anio:3,
  paraCursar:[
    {materia:"BIOL9",condicion:"regularizada"},
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"BIOL9",condicion:"regularizada"},
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ]
},
{ codigo:"F9002", nombre:"Farmacología Aplicada", anio:4,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"aprobada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"IMD01", nombre:"Inglés Médico", anio:4,
  paraCursar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"},
    {materia:"CS001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"},
    {materia:"CS001",condicion:"aprobada"}
  ]
},
{ codigo:"OF001", nombre:"Oftalmología", anio:4,
  paraCursar:[
    {materia:"A0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"A0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"}
  ]
},
{ codigo:"P9002", nombre:"Psiquiatría - Módulo II", anio:4,
  paraCursar:[
    {materia:"P9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"aprobada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"P9001",condicion:"regularizada"}
  ]
},
{ codigo:"HG001", nombre:"Salud Pública - Módulo I", anio:4,
  paraCursar:[
    {materia:"S0003",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"S0003",condicion:"regularizada"}
  ]
},
{ codigo:"TX001", nombre:"Toxicología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"U0001", nombre:"Urología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"C1001", nombre:"Cirugía I", anio:4,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"D0001", nombre:"Dermatología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"DL001", nombre:"Deontología Médica y Medicina Legal", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"R9001", nombre:"Diagnóstico y Terapéutica por Imágenes - Módulo I", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ]
},
{ codigo:"MI191", nombre:"Medicina Interna I", anio:4,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"N0001", nombre:"Neurología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"OR001", nombre:"Ortopedia y Traumatología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"O0001", nombre:"Otorrinolaringología", anio:4,
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"PD001", nombre:"Pediatría", anio:4,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"I0001",condicion:"aprobada"},
    {materia:"F9001",condicion:"regularizada"}
  ]
},
{ codigo:"HG002", nombre:"Salud Pública - Módulo II", anio:4,
  paraCursar:[
    {materia:"HG001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"S0003",condicion:"aprobada"},
    {materia:"HG001",condicion:"regularizada"}
  ]
},
{ codigo:"C2001", nombre:"Cirugía II", anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"aprobada"}
  ]
},
{ codigo:"R9002", nombre:"Diagnóstico y Terapéutica por Imágenes - Módulo II", anio:5,
  paraCursar:[
    {materia:"R9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"R9001",condicion:"regularizada"}
  ]
},
{ codigo:"G0001", nombre:"Ginecología", anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"F9002",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"aprobada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"F9002",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"}
  ]
},
{ codigo:"I0001", nombre:"Infectología", anio:5,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"M0001",condicion:"aprobada"},
    {materia:"F9001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"MI291", nombre:"Medicina Interna II", anio:5,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"OB001", nombre:"Obstetricia", anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"F9002",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"aprobada"},
    {materia:"M0001",condicion:"aprobada"},
    {materia:"C1001",condicion:"regularizada"},
    {materia:"F9002",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"}
  ]
},
{ codigo:"PFOFO", nombre:"Práctica Final Obligatoria", anio:6,
  paraCursar:[
    {materia:"IFM02",condicion:"aprobada"},
    {materia:"F9002",condicion:"aprobada"},
    {materia:"MI191",condicion:"aprobada"},
    {materia:"OF001",condicion:"aprobada"},
    {materia:"C1001",condicion:"aprobada"},
    {materia:"C2001",condicion:"aprobada"},
    {materia:"D0001",condicion:"aprobada"},
    {materia:"I0001",condicion:"aprobada"},
    {materia:"N0001",condicion:"aprobada"},
    {materia:"OR001",condicion:"aprobada"},
    {materia:"O0001",condicion:"aprobada"},
    {materia:"PD001",condicion:"aprobada"},
    {materia:"TX001",condicion:"aprobada"},
    {materia:"U0001",condicion:"aprobada"},
    {materia:"DL001",condicion:"aprobada"},
    {materia:"R9002",condicion:"aprobada"},
    {materia:"G0001",condicion:"aprobada"},
    {materia:"OB001",condicion:"aprobada"},
    {materia:"P9002",condicion:"aprobada"},
    {materia:"HG002",condicion:"aprobada"},
    {materia:"OPT19",condicion:">=270 puntos"},
    {materia:"MI291",condicion:"aprobada"},
    {materia:"IMD01",condicion:"aprobada"},
    {materia:"PG001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"IFM02",condicion:"aprobada"},
    {materia:"F9002",condicion:"aprobada"},
    {materia:"MI191",condicion:"aprobada"},
    {materia:"OF001",condicion:"aprobada"},
    {materia:"C1001",condicion:"aprobada"},
    {materia:"C2001",condicion:"aprobada"},
    {materia:"D0001",condicion:"aprobada"},
    {materia:"I0001",condicion:"aprobada"},
    {materia:"N0001",condicion:"aprobada"},
    {materia:"OR001",condicion:"aprobada"},
    {materia:"O0001",condicion:"aprobada"},
    {materia:"PD001",condicion:"aprobada"},
    {materia:"TX001",condicion:"aprobada"},
    {materia:"U0001",condicion:"aprobada"},
    {materia:"DL001",condicion:"aprobada"},
    {materia:"R9002",condicion:"aprobada"},
    {materia:"G0001",condicion:"aprobada"},
    {materia:"OB001",condicion:"aprobada"},
    {materia:"P9002",condicion:"aprobada"},
    {materia:"HG002",condicion:"aprobada"},
    {materia:"OPT19",condicion:">=270 puntos"},
    {materia:"MI291",condicion:"aprobada"},
    {materia:"IMD01",condicion:"aprobada"},
    {materia:"PG001",condicion:"aprobada"}
  ]
}

];