# Correlatividades_FCM_UNLP
Plan de Estudios FCM-UNLP | Correlatividades

Selecciona las materias que ya haya cursado/aprobado y vea lo que ya puedes cursar.

Hecho con chat GPT.

# Log de Modificaciones

29/03/2026
    +Unificación de datos: fusionado optativas_lista.js en materias.js
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