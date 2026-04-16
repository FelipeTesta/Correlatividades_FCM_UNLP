# AI Development Guide - Correlatividades Medicina UNLP
This document is intended for AI agents to understand the project's internal logic, conventions, and architecture for consistent updates.

Guidelines:
1. At the end of this file, the "# IMPLEMENT" explain new implementations and new functions we want for the project;
2. After full implementing the new functions, update LOG on README.md and include "✅" for each sucessfully implemented idea on this file;
3. If you can't modify files assume you are in planning mode, read the files, plan all the changes and wait for the user to change to Build mode;
4. Always check for resposivity mobile;
5. ALWAYS CHECK AND UPDATE THIS FILE AFTER CHANGES IN THE PROJECT!
6. Keep section "# The APP" updated for future editing. Keep it simple and 'AI reading' optimized. It doesn't need to be readable for humans.
___
# THE APP
## 1. Project Overview
- **Architecture:** Vanilla JavaScript (ES6+), HTML5, and CSS3. No frameworks (React/Vue/etc.).
- **Rendering Engine:** Single-pass rendering. The `render()` function in `app.js` clears all lists and repopulates them based on the current state and data.
- **State Management:** Persistent state stored in `localStorage`:
  - `estados`: Object `{ "COURSE_CODE": "status" }`. Status can be `"aprobada"` or `"regularizada"`.
  - `proyectosExtension`: Array of `{ id, nombre, horas }`.
  - `anioIngreso`: Current year of enrollment.

## 2. Data Structure (`materias.js`)
The `materias` array consists of objects with the following schema:
```javascript
{
  codigo: "A0001",           // Unique ID
  nombre: "Anatomía",        // Display Name
  anio: 1,                   // Recommended year (1-6)
  categoria: "anual",        // Points: anual (120), cuatrimestral (60), bimestral (30), optativa (variable)
  horas: 200,                // (Optional) Total hours, mainly for optativas
  paraCursar: [              // Prerequisites to start the course
    { materia: "CODE", condicion: "aprobada" | "regularizada" }
  ],
  paraAprobar: [...]         // Prerequisites to take the final exam
}
```

## 3. Core Logic (`app.js`)
- **Prerequisite Resolution:** `resolverRequisitosTransitivos` uses recursion to find the entire chain of dependencies.
- **Progress Calculation:** `calcularProgreso` returns an object with `cumplidos`, `total`, and `faltantes` (array of missing requirements).
- **Enforcement:** `cumpleRequisitos` validates if a course should be in "Puede Cursar" or "No Puede Cursar".
- **Progress Bar:** Based on a point system (Anual=120, Cuatr=60, Bim=30). Optativas are capped at 270 points.

## 4. UI & Styling (`style.css`)
- **Theme:** "Deep Black" (#000000 background, #e5e5e5 text).
- **Convention:** Use `.item-row` for list items that require complex layouts (like missing prerequisites).
- **Modals:** A custom modal system exists via `mostrarPopupFaltantes` (dynamic DOM creation).
- **Icons:**
  - ✅: Approved (aprobada)
  - 🟨: Regularized (regularizada)
  - 🔄: Reset state
  - ⚠: Warning/Missing Prerequisites

## 5. Development Rules
1. **Naming Convention:** ALL new functions, variables, and CSS classes must be named in **English**. Do not rename existing legacy code which is mostly in Spanish/Portuguese.
2. **Persistence:** Any state change MUST be followed by a call to `guardarLocalYRender()` to ensure the UI stays in sync with `localStorage`.
3. **DOM Manipulation:** Prefer `document.createElement` and `innerText` for security and performance over `innerHTML` where possible.
4. **Modularity:** Keep `materias.js` as a pure data file. Logic belongs in `app.js`.

## 6. List IDs
- `aprobadas`: Finalized courses.
- `puedeFinal`: Regularized courses ready for final.
- `noPuedeFinal`: Regularized courses blocked by prerequisites.
- `puedeCursar-obligatorias` / `puedeCursar-optativas`: Available courses.
- `noPuedeCursar-obligatorias` / `noPuedeCursar-optativas`: Blocked courses.
___
# IMPLEMENT
- [ ] Implementar modo oscuro
- [ ] Mejorar validación de formularios
- [ ] Añadir exportar/importar estado

## LOG DE IMPLEMENTACIONES
- 29/03/2026
  + Unificación de datos: fusionado optativas_lista.js en materias.js
  + Corrección de valores 'anio' incorrectos: FM001:2, GE001:2, IES01:1, MGF:5
  + Modificación del cálculo de porcentaje de progreso: excluido segmento 'puede cursar'
  + Verificación de función resetearTodos(): limpia correctamente todos los estados
  + Confirmación de funcionamiento con estructura de datos unificada