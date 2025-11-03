document.addEventListener('DOMContentLoaded', () => {
    // --- DATOS PARA LA LÍNEA DE TIEMPO Y MODALES ---
    const stepsData = [
        {
            title: 'Ajuste de Acciones de Control',
            description: 'Herramienta que permite ajustar <span class="highlight-hover">acciones de control de fallas</span> y <span class="highlight-hover">estrategias de mantenimiento</span> al <span class="highlight-hover">entorno operacional</span>.'
        },
        {
            title: 'Metodología Sistemática',
            description: 'Metodología basada en un <span class="highlight-hover">procedimiento sistemático</span> que permite generar <span class="highlight-hover">planes óptimos de mantenimiento</span> y produce un <span class="highlight-hover">cambio cultural</span>.'
        },
        {
            title: 'Resultados en Sistemas Complejos',
            description: 'La aplicación del <span class="highlight-hover">RCM</span> tiene su mayor impacto en <span class="highlight-hover">sistemas complejos</span> con diversidad de <span class="highlight-hover">modos de falla</span>, como <span class="highlight-hover">equipos rotativos grandes</span>.'
        },
        {
            title: 'Maduración en el Tiempo',
            description: 'La <span class="highlight-hover">maduración</span> del RCM ocurre en un <span class="highlight-hover">mediano</span> a <span class="highlight-hover">largo plazo</span>, consolidando mejoras sostenibles en confiabilidad.'
        }
    ];


    const modalData = {
        terreno: { img: 'https://i.imgur.com/uNfV4sC.jpg', caption: 'Un terreno nivelado y compactado es fundamental para la estabilidad de la grúa.' },
        cables: { img: 'https://i.imgur.com/nJ5Jt7Y.jpg', caption: 'Respetar la "Distancia Mínima de Aproximación" a líneas eléctricas previene accidentes fatales.' },
        diagrama: { img: 'https://i.imgur.com/YgY7Q2w.png', caption: 'Ignorar o interpretar mal el diagrama de carga puede llevar al colapso del equipo.' }
    };

    const timeline = document.getElementById('timeline');
    const modalContainer = document.getElementById('modal-container');
    const modalImage = document.getElementById('modal-image');
    const modalCaption = document.getElementById('modal-caption');
    const closeModalBtn = document.getElementById('close-modal-btn');

    // --- Construir la línea de tiempo dinámicamente con el estilo original ---
    function buildTimeline() {
        stepsData.forEach((step, index) => {
            const item = document.createElement('div');
            item.classList.add('timeline-item');

            const cardSide = (index % 2 !== 0) ? 'left' : 'right'; // Alternar lado
            let detailsButtonHTML = step.modalTarget ? `<button class="details-btn" data-modal-target="${step.modalTarget}">Ver Detalle</button>` : '';

            item.innerHTML = `
                <div class="timeline-dot">${index + 1}</div>
                <div class="timeline-content">
                    <div class="timeline-card ${cardSide}">
                        <h3>${step.title}</h3>
                        <p>${step.description}</p>
                        ${detailsButtonHTML}
                    </div>
                </div>
            `;
            timeline.appendChild(item);
        });
    }

    // --- Lógica del Modal ---
    timeline.addEventListener('click', (e) => {
        if (e.target.matches('.details-btn')) {
            const target = e.target.dataset.modalTarget;
            const data = modalData[target];
            if (data) {
                modalImage.src = data.img;
                modalCaption.textContent = data.caption;
                modalContainer.classList.add('active');
            }
        }
    });
    const closeModal = () => modalContainer.classList.remove('active');
    closeModalBtn.addEventListener('click', closeModal);
    modalContainer.addEventListener('click', (e) => {
        if (e.target === modalContainer) closeModal();
    });

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                checkAllItemsVisible();
            }
        });
    }, observerOptions);

    // --- Mostrar sección de continuar cuando se hayan visto todos los items ---
    function checkAllItemsVisible() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const allVisible = Array.from(timelineItems).every(item => item.classList.contains('visible'));

        if (allVisible) {
            setTimeout(() => {
                document.querySelector('.continue-section').classList.add('visible');
            }, 1000);
        }
    }

    // --- INICIALIZACIÓN ---
    buildTimeline(); // Crear los elementos de la línea de tiempo
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(item => observer.observe(item)); // Observar cada nuevo elemento

    // Iniciar SCORM y cargar progreso
    ScormManager.init();
    ScormManager.guardarProgreso("M1_pagina3.html"); // Asegúrate que el nombre sea correcto
    const datos = ScormManager.cargarProgreso();
    if (datos && datos.score) {
        const porcentaje = parseInt(datos.score);
        const barra = document.getElementById("progreso-barra");
        const texto = document.getElementById("progreso-texto");
        if (barra && texto) {
            barra.style.width = porcentaje + "%";
            texto.textContent = porcentaje + "%";
        }
    }
});