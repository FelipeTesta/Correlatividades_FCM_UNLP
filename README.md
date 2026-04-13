# Correlatividades_FCM_UNLP
Plan de Estudios FCM-UNLP | Correlatividades

Selecciona las materias que ya haya cursado/aprobado y vea lo que ya puedes cursar.

Hecho con chat GPT.

# Log de Modificaciones

12/04/2026 (Parte 4)
    +Corrección de lógica en el modal explicativo: Verificación de cobertura global de patologías;
    +Corrección de lógica de "Refuerzo" en modal;
    +Cierre de modal al hacer clic fuera del mismo;
    +Formato de fecha unificado a MM/YYYY;
    +Corrección de bug en botón de eliminación (❌) del historial;

12/04/2026 (Parte 3)
    +Simplificación del registro de vacunas: Eliminado selector central;
    +Integración de registro rápido por fila en "Vacunas Necesarias";
    +Selector único de mes/año posicionado en cabecera de "Vacunas Necesarias";
    +Nueva lógica de registro rápido `registrarDosisRapido()`;

12/04/2026 (Parte 2)
    +Reordenamiento de interfaz: Vacunas Necesarias antes del Histórico;
    +Funcionalidad colapsable para Histórico de Vacunas;
    +Estilizado de selector de vacunas (fondo oscuro);
    +Autocompletado de fecha ('26' a '2026');

12/04/2026
    +Implementación de página /vacunas para registro de esquema vacunal;
    +Estructura de datos con patologías cubiertas para cálculo inteligente de dosis/refuerzos faltantes;
    +Integración con localStorage para persistencia local;
    +Reestructuración lógica esquema vacunal: Serie inicial y refuerzos calculados por fecha;
    +Funcionalidades añadidas: Remoción individual de registros (❌) y Reset total del historial (🔄);
    +Botón de acceso rápido en la página principal;

    +Corrección de valores 'anio' incorrectos: FM001:2, GE001:2, IES01:1, MGF:5
    +Modificación del cálculo de porcentaje de progreso: excluido segmento 'puede cursar'
    +Verificación de función resetearTodos(): limpia correctamente todos los estados
    +Confirmación de funcionamiento con estructura de datos unificada

23/03/2026
    +Boton para materias "no puede cursar" que muestra todos los requisitos faltantes;
    +"COMO USAR?"
    +Estilos de botones unificados: "Guardar" y "Resetear" con estilo propio;

24/03/2026
    +Sistema de fechas de finales:
      - Botón 🗓 en materias regularizadas y optativas;
      - Popup con todas las fechas (próximas y anteriores);
      - Selector de cátedra (A, B, C, Libre, Regular);
      - Selección guardada en localStorage;
      - Para optativas en "Puede Cursar": solo muestra fechas de final libre;
      +Interfaz mejorada con texto en ciano;