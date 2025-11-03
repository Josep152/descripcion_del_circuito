
const audioPlayer = document.getElementById('audioPlayer');
const audioContainer = document.getElementById('audioContainer');
const playPauseBtn = document.getElementById('playPauseBtn');
const closeBtn = document.getElementById('closeBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const timeDisplay = document.getElementById('timeDisplay');
const volumeSlider = document.getElementById('volumeSlider');
const volumeFill = document.getElementById('volumeFill');
const volumeToggle = document.getElementById('volumeToggle');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const volumeIcon = document.getElementById('volumeIcon');
const muteIcon = document.getElementById('muteIcon');

let isPlaying = false;
let isMuted = false;
let previousVolume = 0.8;
let isExpanded = false;
let expandTimeout;

let isDragging = false;

// Función para formatear tiempo
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Función para actualizar progreso
function updateProgress() {
    const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressFill.style.width = progress + '%';
}

// Expandir controles (click en el contenedor, pero no en el botón)
audioContainer.addEventListener('click', function (e) {
    if (e.target.closest('.play-pause-btn') || e.target.closest('.expanded-controls')) {
        return;
    }

    if (!isExpanded) {
        isExpanded = true;
        audioContainer.classList.add('expanded');

        // Auto-cerrar después de 8 segundos si no está interactuando
        clearTimeout(expandTimeout);
        expandTimeout = setTimeout(() => {
            if (isExpanded && !audioContainer.matches(':hover')) {
                closeControls();
            }
        }, 8000);
    }
});

// Cerrar controles
function closeControls() {
    isExpanded = false;
    audioContainer.classList.remove('expanded');
    clearTimeout(expandTimeout);
}

// Botón de cerrar
closeBtn.addEventListener('click', closeControls);

// Play/Pause functionality
playPauseBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
});

// Audio event listeners
audioPlayer.addEventListener('play', function () {
    isPlaying = true;
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    playPauseBtn.classList.add('playing');
});

audioPlayer.addEventListener('pause', function () {
    isPlaying = false;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    playPauseBtn.classList.remove('playing');
});

// Progress bar functionality
audioPlayer.addEventListener('timeupdate', function () {
    if (!isDragging) {
        updateProgress();
    }
});

audioPlayer.addEventListener('loadedmetadata', function () {
    updateProgress();
});

// Click en la barra de progreso
progressBar.addEventListener('click', function (e) {
    if (e.target === progressThumb) return; // No hacer nada si se hace click en el thumb

    e.stopPropagation();
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.currentTime = percent * audioPlayer.duration;
});

// Funcionalidad de arrastre para el thumb
let startX, startProgress;

progressThumb.addEventListener('mousedown', function (e) {
    isDragging = true;
    startX = e.clientX;
    const rect = progressBar.getBoundingClientRect();
    startProgress = (e.clientX - rect.left) / rect.width;

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    e.preventDefault();
    e.stopPropagation();
});

function onMouseMove(e) {
    if (!isDragging) return;

    const rect = progressBar.getBoundingClientRect();
    let percent = (e.clientX - rect.left) / rect.width;
    percent = Math.max(0, Math.min(1, percent)); // Limitar entre 0 y 1

    progressFill.style.width = (percent * 100) + '%';
    audioPlayer.currentTime = percent * audioPlayer.duration;
}

function onMouseUp() {
    isDragging = false;
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
}

// Volume control
volumeSlider.addEventListener('click', function (e) {
    e.stopPropagation();
    const rect = volumeSlider.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioPlayer.volume = percent;
    volumeFill.style.width = (percent * 100) + '%';

    if (percent > 0 && isMuted) {
        isMuted = false;
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
    }
});

// Mute/unmute functionality
volumeToggle.addEventListener('click', function (e) {
    e.stopPropagation();
    if (isMuted) {
        audioPlayer.volume = previousVolume;
        volumeFill.style.width = (previousVolume * 100) + '%';
        volumeIcon.style.display = 'block';
        muteIcon.style.display = 'none';
        isMuted = false;
    } else {
        previousVolume = audioPlayer.volume;
        audioPlayer.volume = 0;
        volumeFill.style.width = '0%';
        volumeIcon.style.display = 'none';
        muteIcon.style.display = 'block';
        isMuted = true;
    }
});

// Mantener expandido mientras se está usando
audioContainer.addEventListener('mouseenter', function () {
    clearTimeout(expandTimeout);
});

audioContainer.addEventListener('mouseleave', function () {
    if (isExpanded) {
        expandTimeout = setTimeout(() => {
            closeControls();
        }, 3000);
    }
});

// Cerrar al hacer click fuera
document.addEventListener('click', function (e) {
    if (!e.target.closest('.audio-player-container')) {
        closeControls();
    }
});

// Initialize volume
audioPlayer.volume = 0.8;
volumeFill.style.width = '80%';

// Prevenir que los clics en controles expandidos cierren el menú
document.querySelector('.expanded-controls').addEventListener('click', function (e) {
    e.stopPropagation();
});

// Initialize volume
audioPlayer.volume = 0.8;
volumeFill.style.width = '80%';

// Reproducir automáticamente cuando se carga
audioPlayer.addEventListener('canplaythrough', function() {
    audioPlayer.play().catch(function(error) {
        console.log('Autoplay bloqueado por el navegador:', error);
    });
}, { once: true });