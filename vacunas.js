// vacunas.js
let vacunasHistorico = JSON.parse(localStorage.getItem("vacunasHistorico")) || [];

function toggleBox(header) {
    const content = header.nextElementSibling;
    content.classList.toggle('collapsed');
}

function abrirExplicacion(key) {
    const config = VACUNAS_CONFIG[key];
    const modal = document.getElementById("modalExplicacion");
    const title = document.getElementById("modalTitle");
    const list = document.getElementById("modalExplicacionList");
    
    title.textContent = config.nome;
    list.innerHTML = "";
    
    // Obter todas as patologias já cobertas por vacinas aplicadas
    const patologiasCobertas = new Set();
    vacunasHistorico.forEach(h => {
        const hConfig = VACUNAS_CONFIG[h.key];
        if (hConfig && hConfig.patologias) {
            hConfig.patologias.forEach(p => patologiasCobertas.add(p));
        }
    });
    
    const aplicadasEstaVacuna = vacunasHistorico
        .filter(h => h.key === key)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Status de Patologias
    if (config.patologias) {
        config.patologias.forEach(pat => {
            const li = document.createElement("li");
            const temCobertura = patologiasCobertas.has(pat);
            li.textContent = `${pat} ${temCobertura ? "✅" : "❌"}`;
            list.appendChild(li);
        });
    }

    if (config.intervaloRefuerzoMeses) {
        const li = document.createElement("li");
        const tieneRefuerzo = aplicadasEstaVacuna.length > config.dosesSeries;
        const labelRefuerzo = config.intervaloRefuerzoMeses >= 12 
            ? `${config.intervaloRefuerzoMeses / 12} año(s)` 
            : `${config.intervaloRefuerzoMeses} mes(es)`;
        li.textContent = `Refuerzo ${labelRefuerzo} ${tieneRefuerzo ? "✅" : "❌"}`;
        list.appendChild(li);
    }
    
    modal.style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalExplicacion").style.display = "none";
}

// Fechar modal ao clicar fora
window.onclick = function(event) {
    const modal = document.getElementById("modalExplicacion");
    if (event.target == modal) {
        cerrarModal();
    }
}

function registrarDosisRapido(key) {
    const fechaInput = document.getElementById("globalVacunaFecha");
    let input = fechaInput.value.trim();
    
    fechaInput.classList.remove('input-error');

    // Parse MM/YYYY or MM/YY
    let [month, year] = input.split('/');
    if (!month || !year) {
        fechaInput.classList.add('input-error');
        alert("Formato inválido. Use MM/YYYY (ej: 03/2026)");
        return;
    }
    
    // Normalize year
    if (year.length === 2) year = '20' + year;
    // Normalize month
    month = month.padStart(2, '0');
    
    let fecha = `${year}-${month}`;

    if (!/^\d{4}-\d{2}$/.test(fecha)) {
        alert("Formato inválido. Use MM/YYYY (ej: 03/2026)");
        fechaInput.classList.add('input-error');
        return;
    }

    fechaInput.value = `${month}/${year}`;
    vacunasHistorico.push({ key, fecha });
    localStorage.setItem("vacunasHistorico", JSON.stringify(vacunasHistorico));
    renderizar();
}

function removerDosis(index) {
    // Ordenar o array conforme exibido na lista antes de remover
    const historicoOrdenado = [...vacunasHistorico].sort((a,b) => new Date(b.fecha) - new Date(a.fecha));
    const itemParaRemover = historicoOrdenado[index];
    
    // Encontrar o índice real no array original
    const realIndex = vacunasHistorico.indexOf(itemParaRemover);
    
    if (realIndex > -1) {
        vacunasHistorico.splice(realIndex, 1);
        localStorage.setItem("vacunasHistorico", JSON.stringify(vacunasHistorico));
        renderizar();
    }
}

function resetearHistorico() {
    if (confirm("¿Estás seguro de borrar todo el historial?")) {
        vacunasHistorico = [];
        localStorage.removeItem("vacunasHistorico");
        renderizar();
    }
}

function renderizar() {
    const historicoList = document.getElementById("historicoList");
    historicoList.innerHTML = "";
    
    // Sort by date (descending)
    vacunasHistorico.sort((a,b) => new Date(b.fecha) - new Date(a.fecha));

    vacunasHistorico.forEach((item, index) => {
        const li = document.createElement("li");
        // Convert YYYY-MM back to MM/YYYY for display
        const [y, m] = item.fecha.split('-');
        li.innerHTML = `${VACUNAS_CONFIG[item.key].nome} - ${m}/${y} 
            <button onclick="removerDosis(${index})" style="background:none; border:none; color:red; cursor:pointer;">❌</button>`;
        historicoList.appendChild(li);
    });
    
    // ... rest of renderizar is unchanged


    // Faltantes/Recomendaciones
    const faltantesList = document.getElementById("faltantesList");
    faltantesList.innerHTML = "";
    
    const hoje = new Date();
    
    for (const key in VACUNAS_CONFIG) {
        const config = VACUNAS_CONFIG[key];
        const aplicadas = vacunasHistorico
            .filter(h => h.key === key)
            .map(h => new Date(h.fecha))
            .sort((a, b) => b - a);
        
        // 1. Serie Inicial
        if (aplicadas.length < config.dosesSeries) {
            const li = document.createElement("li");
            li.innerHTML = `${config.nome}: Falta(n) ${config.dosesSeries - aplicadas.length} dosis 
                <button class="btn-warning-faltantes" onclick="abrirExplicacion('${key}')">⚠</button>
                <button class="btn-primary" style="margin-left: auto; padding: 2px 6px;" onclick="registrarDosisRapido('${key}')">Agregar</button>`;
            faltantesList.appendChild(li);
        } 
        // 2. Refuerzos (Si ya completó la serie)
        else if (config.intervaloRefuerzoMeses) {
            const ultimaDose = aplicadas[0];
            const proximoRefuerzo = new Date(ultimaDose);
            proximoRefuerzo.setMonth(proximoRefuerzo.getMonth() + config.intervaloRefuerzoMeses);
            
            if (proximoRefuerzo <= hoje) {
                const li = document.createElement("li");
                li.innerHTML = `${config.nome}: Requiere refuerzo 
                    <button class="btn-warning-faltantes" onclick="abrirExplicacion('${key}')">⚠</button>
                    <button class="btn-primary" style="margin-left: auto; padding: 2px 6px;" onclick="registrarDosisRapido('${key}')">Agregar</button>`;
                faltantesList.appendChild(li);
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    renderizar();
});
