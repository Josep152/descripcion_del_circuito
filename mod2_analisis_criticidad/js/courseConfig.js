/**
 * Configuración general del curso
 */
const courseConfig = {
    // Información general del curso
    courseInfo: {
        title: "Análisis de Criticidad",
        company: "Quellaveco",
        version: "1.0"
    },

    // Recursos de imágenes
    images: {
        logo_color: {
            src: "images/logo_color.png",
            alt: "Logo Quellaveco Color"
        },
        logo_blanco: {
            src: "assets/images/logo_blanco.png",
            alt: "Logo Quellaveco Blanco"
        },
        background: {
            src: "assets/images/fondo_index.png",
            alt: "Fondo del curso"
        }
    },
};


document.addEventListener('DOMContentLoaded', iniciarConfiguracion);

function iniciarConfiguracion() {

    //index.html

    // Actualizar el título del documento
    document.title = courseConfig.courseInfo.title;

    const titleCourse = document.getElementById('title_course');
    titleCourse.textContent = courseConfig.courseInfo.title;

    // Actualizar el logo
    const logoElement = document.querySelector('.logo');
    if (logoElement) {
        logoElement.src = courseConfig.images.logo_blanco.src;
        logoElement.alt = courseConfig.images.logo_blanco.alt;
    }

    // Actualizar la imagen de fondo
    const mainContainer = document.getElementById('background_image');
    if (mainContainer) {
        mainContainer.src = courseConfig.images.background.src;
        mainContainer.alt = courseConfig.images.background.alt;
    }

    //sidebar.html

};

window.addEventListener('DOMContentLoaded', function () {
    var bgImg = document.getElementById('background_image');
    if (bgImg) {
        bgImg.src = 'assets/images/fondo_index.png';
    }
});