// Datos para el gráfico
const data = [
    { x: 2.996, y: -2.351 },
    { x: 3.912, y: -1.606 },
    { x: 4.382, y: -1.144 },
    { x: 4.605, y: -0.794 },
    { x: 5.010, y: -0.501 },
    { x: 5.298, y: -0.238 },
    { x: 5.521, y: 0.012 },
    { x: 5.857, y: 0.262 },
    { x: 6.214, y: 0.533 },
    { x: 6.620, y: 0.875 }
];

// Crear gráfico
const ctx = document.getElementById('weibullChart').getContext('2d');

new Chart(ctx, {
    type: 'scatter',
    data: {
        datasets: [
            {
                label: 'Datos Transformados',
                data: data,
                backgroundColor: '#031795',
                borderColor: '#031795',
                pointRadius: 6,
                pointHoverRadius: 8
            },
            {
                label: 'Línea de Regresión (y = 0.907x - 5.07)',
                data: [
                    { x: 2.5, y: 0.907 * 2.5 - 5.07 },
                    { x: 7, y: 0.907 * 7 - 5.07 }
                ],
                type: 'line',
                borderColor: '#ef4444',
                backgroundColor: 'transparent',
                pointRadius: 0,
                borderWidth: 3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Ln(Failure Time - Ti)',
                    font: { size: 12, weight: 'bold' }
                },
                min: 2.5,
                max: 7
            },
            y: {
                title: {
                    display: true,
                    text: 'Ln(-Ln(1-Fi))',
                    font: { size: 12, weight: 'bold' }
                }
            }
        },
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            title: {
                display: true,
                text: 'Weibull Probability Plot'
            }
        }
    }
});