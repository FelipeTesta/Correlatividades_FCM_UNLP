// ===============================
// INCLUIR: HORAS, OPTATIVAS
// ===============================

const materias = [

{ codigo:"A0001", nombre:"Anatomía", anio:1, categoria:"anual",
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"BIOL9", nombre:"Biología", anio:1, categoria:"anual",
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"CS001", nombre:"Ciencias Sociales y Medicina", anio:1, categoria:"cuatrimestral",
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"H0001", nombre:"Citología, Histología y Embriología", anio:1, categoria:"anual",
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"IFB01", nombre:"Informática Básica", anio:1, categoria:"bimestral",
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"B0001", nombre:"Bioquímica y Biología Molecular", anio:2, categoria:"anual",
  paraCursar:[
    {materia:"BIOL9",condicion:"aprobada"},
    {materia:"H0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"BIOL9",condicion:"aprobada"},
    {materia:"H0001",condicion:"regularizada"}
  ]
},
{ codigo:"EP001", nombre:"Epidemiología", anio:2, categoria:"bimestral",
  paraCursar:[
    {materia:"CS001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"CS001",condicion:"aprobada"}
  ]
},
{ codigo:"FB001", nombre:"Fisiología y Física Biológica", anio:2, categoria:"anual",
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
{ codigo:"IFM02", nombre:"Informática Médica", anio:2, categoria:"bimestral",
  paraCursar:[
    {materia:"IFB01",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"IFB01",condicion:"aprobada"}
  ]
},
{ codigo:"PG001", nombre:"Psicología Médica", anio:2, categoria:"bimestral",
  paraCursar:[],
  paraAprobar:[
    {materia:"A0001",condicion:"aprobada"}
  ]
},
{ codigo:"F9001", nombre:"Farmacología Básica", anio:3, categoria:"anual",
  paraCursar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ]
},
{ codigo:"M0001", nombre:"Microbiología y Parasitología", anio:3, categoria:"anual",
  paraCursar:[
    {materia:"B0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"FB001",condicion:"aprobada"},
    {materia:"B0001",condicion:"aprobada"}
  ]
},
{ codigo:"P9001", nombre:"Psiquiatría - Módulo I", anio:3, categoria:"bimestral",
  paraCursar:[
    {materia:"PG001",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PG001",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ]
},
{ codigo:"S0003", nombre:"Salud y Medicina Comunitaria", anio:3, categoria:"cuatrimestral",
  paraCursar:[
    {materia:"EP001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"EP001",condicion:"aprobada"}
  ]
},
{ codigo:"SEM91", nombre:"Semiología", anio:3, categoria:"anual",
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
{ codigo:"PT001", nombre:"Patología", anio:3, categoria:"anual",
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
{ codigo:"F9002", nombre:"Farmacología Aplicada", anio:4, categoria:"cuatrimestral",
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
{ codigo:"IMD01", nombre:"Inglés Médico", anio:4, categoria:"anual",
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
{ codigo:"OF001", nombre:"Oftalmología", anio:4, categoria:"bimestral",
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
{ codigo:"P9002", nombre:"Psiquiatría - Módulo II", anio:4, categoria:"bimestral",
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
{ codigo:"HG001", nombre:"Salud Pública - Módulo I", anio:4, categoria:"cuatrimestral",
  paraCursar:[
    {materia:"S0003",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"S0003",condicion:"regularizada"}
  ]
},
{ codigo:"TX001", nombre:"Toxicología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"U0001", nombre:"Urología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"C1001", nombre:"Cirugía I", anio:4, categoria:"bimestral",
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
{ codigo:"D0001", nombre:"Dermatología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"DL001", nombre:"Deontología Médica y Medicina Legal", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"R9001", nombre:"Diagnóstico y Terapéutica por Imágenes - Módulo I", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ]
},
{ codigo:"MI191", nombre:"Medicina Interna I", anio:4, categoria:"anual",
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
{ codigo:"N0001", nombre:"Neurología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"OR001", nombre:"Ortopedia y Traumatología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"O0001", nombre:"Otorrinolaringología", anio:4, categoria:"bimestral",
  paraCursar:[
    {materia:"PT001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"PD001", nombre:"Pediatría", anio:4, categoria:"anual",
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"I0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"I0001",condicion:"aprobada"},
    {materia:"F9001",condicion:"regularizada"}
  ]
},
{ codigo:"HG002", nombre:"Salud Pública - Módulo II", anio:4, categoria:"cuatrimestral",
  paraCursar:[
    {materia:"HG001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"S0003",condicion:"aprobada"},
    {materia:"HG001",condicion:"regularizada"}
  ]
},
{ codigo:"C2001", nombre:"Cirugía II", anio:5, categoria:"bimestral",
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"aprobada"}
  ]
},
{ codigo:"R9002", nombre:"Diagnóstico y Terapéutica por Imágenes - Módulo II", anio:5, categoria:"bimestral",
  paraCursar:[
    {materia:"R9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"R9001",condicion:"regularizada"}
  ]
},
{ codigo:"G0001", nombre:"Ginecología", anio:5, categoria:"cuatrimestral",
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
{ codigo:"I0001", nombre:"Infectología", anio:5, categoria:"bimestral",
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
{ codigo:"MI291", nombre:"Medicina Interna II", anio:5, categoria:"anual",
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
{ codigo:"OB001", nombre:"Obstetricia", anio:5, categoria:"bimestral",
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
{ codigo:"PFOFO", nombre:"Práctica Final Obligatoria", anio:6, categoria:"anual",
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
    {materia:"OPT-HORAS",condicion:">=270"}
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
    {materia:"OPT-HORAS",condicion:">=270"},
    {materia:"MI291",condicion:"aprobada"},
    {materia:"IMD01",condicion:"aprobada"},
    {materia:"PG001",condicion:"aprobada"}
  ]
},
{ codigo:"BC001", nombre:"Bioquímica Clínica I", categoria:"optativa", horas:50, anio:4,
  paraCursar:[
    {materia:"B0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"regularizada"}
  ]
},
{ codigo:"BC002", nombre:"Bioquímica Clínica II", categoria:"optativa", horas:50, anio:5,
  paraCursar:[
    {materia:"B0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"regularizada"}
  ]
},
{ codigo:"BE001", nombre:"Bioética", categoria:"optativa", horas:50, anio:5,
  paraCursar:[
    {materia:"HG001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"HG001",condicion:"aprobada"}
  ]
},
{ codigo:"BG008", nombre:"Biología", categoria:"optativa", horas:40, anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"BG013", nombre:"Biología", categoria:"optativa", horas:50, anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"CATME", nombre:"Calidad de la Atención Médica", categoria:"optativa", horas:60, anio:5,
  paraCursar:[
    {materia:"HG001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"HG001",condicion:"aprobada"}
  ]
},
{ codigo:"CDT01", nombre:"Cirugía de Tórax", categoria:"optativa", horas:60, anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"regularizada"}
  ]
},
{ codigo:"CE001", nombre:"Ciencias Exactas", categoria:"optativa", horas:60, anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"DISIN", nombre:"Discapacidad Intelectual", categoria:"optativa", horas:60, anio:5,
  paraCursar:[
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"SEM91",condicion:"regularizada"}
  ]
},
{ codigo:"E0001", nombre:"Ecología Humana y Promoción de la Salud", categoria:"optativa", horas:50, anio:2,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"EDS13", nombre:"Educación para la Salud", categoria:"optativa", horas:50, anio:3,
  paraCursar:[
    {materia:"CS001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"CS001",condicion:"regularizada"}
  ]
},
{ codigo:"ENFPF", nombre:"Enfermedades poco frecuentes en medicina", categoria:"optativa", horas:50, anio:5,
  paraCursar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"}
  ]
},
{ codigo:"EACS1", nombre:"Estadística Aplicada a Ciencias de la Salud", categoria:"optativa", horas:60, anio:3,
  paraCursar:[
    {materia:"FB001",condicion:"aprobada"},
    {materia:"EP001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"FB001",condicion:"aprobada"},
    {materia:"EP001",condicion:"aprobada"}
  ]
},
{ codigo:"FM001", nombre:"Filosofía Médica", categoria:"optativa", horas:50, anio:4,
  paraCursar:[
    {materia:"CS001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"CS001",condicion:"regularizada"}
  ]
},
{ codigo:"GE001", nombre:"Genética", categoria:"optativa", horas:50, anio:3,
  paraCursar:[
    {materia:"BIOL9",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"BIOL9",condicion:"regularizada"}
  ]
},
{ codigo:"HM001", nombre:"Historia de la Medicina", categoria:"optativa", horas:60, anio:2,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"IAA01", nombre:"La Informática aplicada al análisis y presentación de trabajos científicos en Ciencias de la Salud", categoria:"optativa", horas:50, anio:2,
  paraCursar:[
    {materia:"IFB01",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"IFB01",condicion:"aprobada"}
  ]
},
{ codigo:"IES01", nombre:"Introducción a la Epistemología de la Salud", categoria:"optativa", horas:50, anio:4,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"IM001", nombre:"Inmunología", categoria:"optativa", horas:50, anio:3,
  paraCursar:[
    {materia:"B0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"regularizada"}
  ]
},
{ codigo:"LCM01", nombre:"Literatura, Cine y Medicina", categoria:"optativa", horas:60, anio:2,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"MGF", nombre:"Medicina General y Familiar", categoria:"optativa", horas:70, anio:4,
  paraCursar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"PT001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"F9001",condicion:"regularizada"},
    {materia:"M0001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"PT001",condicion:"aprobada"}
  ]
},
{ codigo:"NEUAT", nombre:"Neuroanatomía Semiológica", categoria:"optativa", horas:60, anio:4,
  paraCursar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ],
  paraAprobar:[
    {materia:"A0001",condicion:"aprobada"},
    {materia:"FB001",condicion:"aprobada"}
  ]
},
{ codigo:"NCG", nombre:"Neurocirugía", categoria:"optativa", horas:60, anio:5,
  paraCursar:[
    {materia:"R9001",condicion:"aprobada"},
    {materia:"R9002",condicion:"regularizada"},
    {materia:"N0001",condicion:"regularizada"},
    {materia:"OR001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"C1001",condicion:"aprobada"},
    {materia:"O0001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"R9001",condicion:"aprobada"},
    {materia:"R9002",condicion:"regularizada"},
    {materia:"N0001",condicion:"regularizada"},
    {materia:"OR001",condicion:"regularizada"},
    {materia:"PT001",condicion:"aprobada"},
    {materia:"SEM91",condicion:"aprobada"},
    {materia:"C1001",condicion:"aprobada"},
    {materia:"O0001",condicion:"regularizada"}
  ]
},
{ codigo:"NUTRI", nombre:"Nutrición Clínica", categoria:"optativa", horas:30, anio:4,
  paraCursar:[
    {materia:"B0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"B0001",condicion:"regularizada"},
    {materia:"FB001",condicion:"regularizada"}
  ]
},
{ codigo:"PENFC", nombre:"El paciente con enfermedad crónica de alto impacto familiar", categoria:"optativa", horas:60, anio:5,
  paraCursar:[
    {materia:"S0003",condicion:"regularizada"},
    {materia:"P9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"S0003",condicion:"regularizada"},
    {materia:"P9001",condicion:"regularizada"}
  ]
},
{ codigo:"PINV", nombre:"Proyecto de Investigación", categoria:"optativa", horas:60, anio:5,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"SA001", nombre:"Salud Ambiental", categoria:"optativa", horas:50, anio:3,
  paraCursar:[
    {materia:"CS001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"CS001",condicion:"regularizada"}
  ]
},
{ codigo:"SIC01", nombre:"Seminario en Investigación Científica", categoria:"optativa", horas:50, anio:1,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"T0100", nombre:"Transplante de Órganos", categoria:"optativa", horas:100, anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"}
  ]
},
{ codigo:"TASPO", nombre:"Taller de Salud Popular", categoria:"optativa", horas:30, anio:3,
  paraCursar:[],
  paraAprobar:[]
},
{ codigo:"TIN01", nombre:"Terapia Intensiva", categoria:"optativa", horas:50, anio:5,
  paraCursar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ],
  paraAprobar:[
    {materia:"C1001",condicion:"regularizada"},
    {materia:"SEM91",condicion:"regularizada"},
    {materia:"F9001",condicion:"regularizada"}
  ]
}

];