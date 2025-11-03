let currentStep = 1;
let maxStep = 6;
let failureData = [];
let sortedData = [];
let probabilityData = [];
let transformedData = [];

// Generar datos de ejemplo de fallas
function generateFailureData() {
    const numEquipments = parseInt(document.getElementById('numEquipments').value);
    failureData = [];

    // Generar datos siguiendo aproximadamente una distribución Weibull
    for (let i = 0; i < numEquipments; i++) {
        // Simulación simple de tiempos de falla
        const time = Math.random() * 300 + 50; // Entre 50 y 350 horas
        failureData.push(parseFloat(time.toFixed(3)));
    }

    displayFailureData();
    updateSortedData();
    updateProbabilityData();
    updateTransformedData();
    updateWeibullPlot();
}

function displayFailureData() {
    const display = document.getElementById('failureDataDisplay');
    display.innerHTML = `
                <h5>Datos Generados (Tiempos de Falla en horas):</h5>
                <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid #e2e8f0;">
                    ${failureData.map((time, index) => `Equipo ${index + 1}: ${time}h`).join(', ')}
                </div>
            `;
}

function updateSortedData() {
    sortedData = [...failureData].sort((a, b) => a - b);
    const tbody = document.getElementById('sortedDataBody');
    tbody.innerHTML = sortedData.map((time, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${time}</td>
                </tr>
            `).join('');
}

function updateProbabilityData() {
    const n = sortedData.length;
    probabilityData = sortedData.map((time, index) => {
        const i = index + 1;
        const fi = i / (n + 1);
        return { order: i, time: time, probability: fi };
    });

    const tbody = document.getElementById('probabilityTableBody');
    tbody.innerHTML = probabilityData.map(data => `
                <tr>
                    <td>${data.order}</td>
                    <td>${data.time}</td>
                    <td>${data.probability.toFixed(4)}</td>
                </tr>
            `).join('');
}

function updateTransformedData() {
    transformedData = probabilityData.map(data => {
        const x = Math.log(data.time);
        const y = Math.log(-Math.log(1 - data.probability));
        return {
            order: data.order,
            time: data.time,
            probability: data.probability,
            x: x,
            y: y
        };
    });

    const tbody = document.getElementById('transformedTableBody');
    tbody.innerHTML = transformedData.map(data => `
                <tr>
                    <td>${data.order}</td>
                    <td>${data.time}</td>
                    <td>${data.probability.toFixed(4)}</td>
                    <td>${data.x.toFixed(4)}</td>
                </tr>
            `).join('');
}

function updateWeibullPlot() {
    const ctx = document.getElementById('weibullPlot').getContext('2d');

    if (window.weibullChart) {
        window.weibullChart.destroy();
    }

    window.weibullChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Datos Transformados',
                data: transformedData.map(d => ({ x: d.x, y: d.y })),
                backgroundColor: '#031795',
                borderColor: '#031795',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'ln(t) - Logaritmo del Tiempo'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'ln(-ln(1-F)) - Transformación Weibull'
                    }
                }
            },
            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}

// Navegación entre pasos
function nextStep() {
    if (currentStep < maxStep) {
        currentStep++;
        updateStepVisibility();
        updateNavigation();
        updateProgressF();
    }
}

function previousStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepVisibility();
        updateNavigation();
        updateProgressF();
    }
}

function goToStep(step) {
    currentStep = step;
    updateStepVisibility();
    updateNavigation();
    updateProgressF();
}

function updateStepVisibility() {
    for (let i = 1; i <= maxStep; i++) {
        const section = document.getElementById(`step${i}`);
        if (i === currentStep) {
            section.classList.add('visible');
        } else {
            section.classList.remove('visible');
        }
    }
}

function updateNavigation() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    prevBtn.disabled = currentStep === 1;
    nextBtn.disabled = currentStep === maxStep;

    if (currentStep === maxStep) {
        nextBtn.textContent = 'Finalizar';
    } else {
        nextBtn.textContent = 'Siguiente';
    }
}

function updateProgressF() {
    const progressFill = document.getElementById('progresF');
    const progress = (currentStep / maxStep) * 100;
    progressFill.style.width = `${progress}%`;

    // Actualizar indicadores
    const indicators = document.querySelectorAll('.step-indicator');
    indicators.forEach((indicator, index) => {
        const stepNum = index + 1;
        indicator.classList.remove('active', 'completed');

        if (stepNum === currentStep) {
            indicator.classList.add('active');
        } else if (stepNum < currentStep) {
            indicator.classList.add('completed');
        }
    });
}

// Lista de secciones
    const sections = [ "2", "3","4","5","6"];

    // Objeto para marcar visitadas
    let section_visited = {};

    // Inicializar en false
    sections.forEach(sec => section_visited[sec] = false);


// Event listeners para indicadores de paso
document.getElementById('stepIndicators').addEventListener('click', (e) => {
    const indicator = e.target.closest('.step-indicator');
    if (indicator) {
        const step = parseInt(indicator.dataset.step);
        goToStep(step);

        // Marcar la sección como visitada
        section_visited[indicator.dataset.step] = true;

        // Revisar si todas ya fueron visitadas
        checkAllVisited();
    }
    
});

function checkAllVisited() {
        const allVisited = Object.values(section_visited).every(v => v === true);
        if (allVisited) {
            document.getElementById("continueBtn").style.display = "block";
        }
    }

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    generateFailureData();
    updateProgressF();
    updateNavigation();
});