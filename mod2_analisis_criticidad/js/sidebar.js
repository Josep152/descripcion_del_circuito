// Referencias a elementos del DOM
let sidebar, toggleBtn, dropdownBtns;

// Inicializar la app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
    loadSidebarAndInitialize();
});

// Cargar el menú dinámicamente y inicializar todo
function loadSidebarAndInitialize() {
    fetch("sidebar.html")
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById("menu-container");

            // Inyectar el sidebar
            container.innerHTML = html;

            // Ahora que el sidebar está cargado, obtener las referencias
            sidebar = document.getElementById('sidebar');
            toggleBtn = document.getElementById('toggle-btn');
            dropdownBtns = document.querySelectorAll('.dropdown-btn');

            // Inicializar eventos
            initializeSidebarEvents();

            // Configurar estilos del sidebar
            if (sidebar) {
                sidebar.style.maxHeight = "100vh";
                sidebar.style.overflowY = "auto";
            }

            // Resaltar el menú activo
            highlightActiveMenu();

            // Manejar progreso SCORM si está disponible
            handleScormProgress();

            // Inicializar el manejo del botón "volver"
            initializeBackButton();
        })
        .catch(error => console.error("Error al cargar el menú:", error));
}

// Inicializar todos los eventos del sidebar
function initializeSidebarEvents() {
    // Evento para el botón toggle del sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleSidebar);
    }

    // Eventos para los botones dropdown
    if (dropdownBtns.length > 0) {
        dropdownBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                handleSubmenuToggle(this);
            });
        });
    }
}

// Función para abrir/cerrar el sidebar
function toggleSidebar() {
    if (!sidebar) return;
    
    sidebar.classList.toggle('close');

    // Cerrar todos los submenús cuando se cierra el sidebar
    if (sidebar.classList.contains('close')) {
        closeAllSubmenus();
    } else {
        // Abrir automáticamente el primer menú padre al expandir el sidebar
        const firstDropdownBtn = document.querySelector('.dropdown-btn[data-level="1"]');
        if (firstDropdownBtn) {
            const submenu = firstDropdownBtn.nextElementSibling;
            if (submenu && submenu.classList.contains('sub-menu')) {
                submenu.classList.add('show');
                firstDropdownBtn.classList.add('active');
            }
        }
        // Resaltar menús activos cuando se abre
        highlightActiveMenu();
    }
}

// Función para manejar el clic en un botón de submenú
function handleSubmenuToggle(button) {
    if (!sidebar) return;
    
    // Si el sidebar está cerrado, abrirlo primero
    if (sidebar.classList.contains('close')) {
        sidebar.classList.remove('close');
    }

    // Obtener el submenú asociado al botón
    const submenu = button.nextElementSibling;

    // Si no hay submenú (es un enlace final), simplemente retornar
    if (!submenu || !submenu.classList.contains('sub-menu')) {
        return;
    }

    // Alternar visibilidad del submenú actual
    submenu.classList.toggle('show');
    button.classList.toggle('active');
}

// Función para cerrar todos los submenús
function closeAllSubmenus() {
    const openMenus = document.querySelectorAll('.sub-menu.show');
    const activeButtons = document.querySelectorAll('.dropdown-btn.active');

    openMenus.forEach(menu => menu.classList.remove('show'));
    activeButtons.forEach(btn => btn.classList.remove('active'));
}

// Función para resaltar el menú activo
function highlightActiveMenu() {
    const links = document.querySelectorAll('.menu-link');
    const currentPath = window.location.pathname.split('/').pop();

    links.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');

            let currentElement = link.closest('ul.sub-menu');

            while (currentElement) {
                if (!currentElement.parentElement.closest('ul.sub-menu')) {
                    break;
                }
                currentElement.classList.add('show');

                const parentButton = currentElement.previousElementSibling;
                if (parentButton && parentButton.classList.contains('dropdown-btn')) {
                    parentButton.classList.add('active');
                }

                currentElement = currentElement.parentElement.closest('ul.sub-menu');
            }

            // Opcional: asegurarse de que el link esté visible
            link.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });
}

// Manejo del progreso SCORM
function handleScormProgress() {
    const enlaces = document.querySelectorAll('#menu .menu-link');
    const visitadas = (window.ScormManager && ScormManager.obtenerPaginasVisitadas())
        ? ScormManager.obtenerPaginasVisitadas()
        : [];
    const paginaActual = window.location.pathname.split('/').pop();

    enlaces.forEach(link => {
        const url = link.getAttribute('href');

        if (visitadas.includes(url) || url === paginaActual) {
            // ✔ habilitar
            link.classList.add('visited');

            if (!link.querySelector('.checkmark')) {
                const check = document.createElement('span');
                check.textContent = ' ✅';
                check.classList.add('checkmark');
                link.appendChild(check);
            }
        } else {
            // 🔒 bloquear
            link.classList.add('locked');
            link.removeAttribute('href');
        }
    });
}

// Inicializar el manejo del botón volver
function initializeBackButton() {
    const backButton = document.querySelector('.back-page-btn');
    
    if (!backButton || !sidebar) {
        // Si no existe el botón volver o el sidebar, no hacer nada
        return;
    }

    function actualizarEstilos() {
        backButton.style.left = `${sidebar.offsetWidth}px`;

        if (sidebar.classList.contains('close')) {
            backButton.style.height = `${sidebar.offsetHeight}px`;
        } else {
            backButton.style.height = ''; // Altura por defecto
        }
    }

    // Ejecutar al inicio
    actualizarEstilos();

    // Escuchar cambios en el sidebar
    sidebar.addEventListener('transitionend', actualizarEstilos);

    // Escuchar clics en el botón toggle
    if (toggleBtn) {
        toggleBtn.addEventListener('click', function () {
            // Esperar un poco para que la transición termine
            setTimeout(actualizarEstilos, 50);
        });
    }
}

// Función para iniciar video en un segundo específico (si se necesita)
function startVideoAtSecond() {
    const video = document.getElementById('video_1');
    const startTime = 10;
    
    if (video) {
        video.addEventListener('loadedmetadata', function () {
            video.currentTime = startTime;
        });
        video.load();
        video.play();
    }
}