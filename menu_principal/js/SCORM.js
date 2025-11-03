// -------------------- Utils --------------------
function getAPI(win) {
    let tries = 0;
    while (
        win.API == null &&
        win.parent != null &&
        win.parent !== win &&
        tries < 10
        ) {
        tries++;
        win = win.parent;
    }
    return win.API;
}

let CURSO_ID; // Se setea dinámicamente en setCurso()


// -------------------- Clase SCORM --------------------
class ScormManager {
    // Propiedades estáticas iniciales
    static API = null;
    static config = {};
    static studentInfo = {};
    static moduloId='';
    static paginasCurso = [];

    // ---------- Inicializar comunicación con LMS ----------
    static init() {
        this.API = getAPI(window);

        if (this.API) {
            this.API.LMSInitialize("");
            this.API.LMSSetValue("cmi.core.lesson_status", "incomplete");
            const id = this.API.LMSGetValue("cmi.core.student_id");
            const name = this.API.LMSGetValue("cmi.core.student_name");
            this.moduloId = this.API.LMSGetValue("cmi.launch_data");
            ScormManager.studentInfo = { id, name };
        } else {
            console.warn("⚠️ No se encontró API SCORM, usando modo offline.");
            ScormManager.studentInfo = {
                id: "offline_user",
                name: "Usuario Local"
            };
            localStorage.setItem("studentInfo", JSON.stringify(ScormManager.studentInfo));
        }
    }

// ---------- Inicializar desde scormConfig global ----------
    static initFromConfig() {
        if (typeof scormConfig === 'undefined') {
            console.error("❌ scormConfig no disponible. Incluye scormConfig.js antes de ScormManager.js");
            return false;
        }

        if (!this.API && !this.studentInfo.id) {
            this.init();
        }

        if (this.paginasCurso.length === 0) {
            this.setCurso(scormConfig);
        }

        return true;
    }

    static getValue(param) {
        if (this.API) {
            try {
                const value = this.API.LMSGetValue(param);
                return value;
            } catch (e) {
                console.error(`❌ Error al obtener ${param}:`, e);
                return null;
            }
        } else {
            console.warn(`⚠️ No hay API SCORM, devolviendo null para ${param}`);
            return null;
        }
    }
    // ---------- Configuración del curso ----------
    static setCurso(config = {}) {
        if (!config.cursoId) {
            console.error("❌ Falta cursoId en setCurso()");
            return;
        }

        this.config = config;

        // Armar CURSO_ID único
        CURSO_ID = this.API
            ? config.cursoId + "_" + ScormManager.studentInfo.id + "_" + ScormManager.moduloId
            : config.cursoId + "_offline";

        // Guardar páginas
        ScormManager.paginasCurso = config.paginasCurso || [];

        console.log("📦 Curso configurado:", CURSO_ID);

        // 👉 Asegurar que este curso quede en _curso_ids
        if (this.API) {
            try {
                let data = {};
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                data = raw ? JSON.parse(raw) : {};

                if (!data._curso_ids) data._curso_ids = [];
                if (!data._curso_ids.includes(CURSO_ID)) {
                    data._curso_ids.push(CURSO_ID);
                    this.API.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
                    this.API.LMSCommit("");
                    console.log("✅ CURSO_ID agregado a _curso_ids");
                }
            } catch (e) {
                console.error("❌ Error agregando CURSO_ID a _curso_ids:", e);
            }
        }

        // Depurar progreso inicial
        const visitadas = ScormManager.obtenerPaginasVisitadas();
        const depuradas = ScormManager.limpiarVisitadas(visitadas);

    }



    // ---------- Utilidades ----------
    static resolveDestination(pagina) {
        if (!pagina) return pagina;
        let p = String(pagina).trim();

        if (p.includes("/views/") || p.startsWith("/") || p.startsWith("http")) {
            return p;
        }

        const currentPath = window.location.pathname;
        const isInViews = currentPath.includes("/views/");

        return isInViews ? p : "views/" + p;
    }

    // ---------- Modal continuar ----------
    static mostrarModalContinuar(callback) {
        const overlay = document.createElement("div");
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex; justify-content: center; align-items: center;
            z-index: 10000; animation: fadeIn 0.3s ease;
        `;

        const modal = document.createElement("div");
        modal.style.cssText = `
            background: white; border-radius: 12px; padding: 30px;
            max-width: 450px; width: 90%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            animation: slideIn 0.3s ease;
        `;

        modal.innerHTML = `
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideIn { from { transform: translateY(-20px); opacity: 0; }
                                     to { transform: translateY(0); opacity: 1; } }
                .modal-title { font-size: 22px; font-weight: 600; color: #031795; margin-bottom: 15px; text-align: center; }
                .modal-message { font-size: 16px; color: #666; margin-bottom: 25px; text-align: center; line-height: 1.5; }
                .modal-buttons { display: flex; gap: 12px; justify-content: center; }
                .modal-btn { padding: 12px 28px; border: none; border-radius: 6px;
                             font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
                .modal-btn-primary { background: #031795; color: white; }
                .modal-btn-primary:hover { background: #0056b3; transform: translateY(-1px); }
                .modal-btn-secondary { background: #f0f0f0; color: #333; }
                .modal-btn-secondary:hover { background: #e0e0e0; transform: translateY(-1px); }
            </style>
            <div class="modal-title">¡Bienvenido de nuevo!</div>
            <div class="modal-message">
                Tienes un progreso guardado. ¿Deseas continuar donde lo dejaste o comenzar desde el inicio?
            </div>
            <div class="modal-buttons">
                <button class="modal-btn modal-btn-primary" id="btnContinuar">Continuar</button>
                <button class="modal-btn modal-btn-secondary" id="btnReiniciar">Desde el inicio</button>
            </div>
        `;

        overlay.appendChild(modal);
        document.body.appendChild(overlay);

        document.getElementById("btnContinuar").addEventListener("click", () => {
            document.body.removeChild(overlay);
            callback(true);
        });

        document.getElementById("btnReiniciar").addEventListener("click", () => {
            document.body.removeChild(overlay);
            callback(false);
        });
    }

    static levantarModal() {
        const progreso = this.cargarProgreso();
        if (progreso && progreso.ultimaPagina && ScormManager.paginasCurso.includes(progreso.ultimaPagina)) {
            ScormManager.mostrarModalContinuar((continuar) => {
                if (continuar) {
                    const destino = ScormManager.resolveDestination(progreso.ultimaPagina);
                    window.location.href = destino;
                } else {
                    console.log("🔄 El estudiante decidió comenzar desde el inicio.");
                }
            });
        }
    }

    // ---------- Guardar y cargar progreso ----------
    // ---------- Guardar y cargar progreso ----------
    static guardarProgreso(pagina) {

        if (ScormManager.paginasCurso.length === 0) {
            console.error("❌ No se ha configurado el curso. Llama a initFromConfig() primero.");
            return;
        }

        const paginasCurso = ScormManager.paginasCurso;
        let visitadas = ScormManager.obtenerPaginasVisitadas();
        visitadas = ScormManager.limpiarVisitadas(visitadas);

        if (paginasCurso.includes(pagina) && !visitadas.includes(pagina)) {
            visitadas.push(pagina);
        }

        ScormManager.guardarPaginasVisitadas(visitadas);

        let porcentaje = 0;
        if (paginasCurso.length > 0) {
            porcentaje = Math.round((visitadas.length / paginasCurso.length) * 100);
            porcentaje = Math.min(porcentaje, 100);
        }

        if (this.API) {
            this.API.LMSSetValue("cmi.core.lesson_location", pagina);
            this.API.LMSSetValue("cmi.core.score.raw", porcentaje.toString());

            let data = {};
            try {
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                data = raw ? JSON.parse(raw) : {};
            } catch { data = {}; }

            if (!data[CURSO_ID]) data[CURSO_ID] = {};
            data[CURSO_ID].ultimaPagina = pagina;
            data[CURSO_ID].progreso = porcentaje;

            this.API.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
            this.API.LMSCommit("");
            console.log("✅ Progreso guardado en LMS");
        } else {
            localStorage.setItem(CURSO_ID + "_ultimaPagina", pagina);
            localStorage.setItem(CURSO_ID + "_porcentaje", porcentaje);
            console.log("✅ Progreso guardado en localStorage");
        }
    }


    static cargarProgreso() {
        if (this.API) {
            const pagina = this.API.LMSGetValue("cmi.core.lesson_location");
            const score = this.API.LMSGetValue("cmi.core.score.raw");

            try {
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                const data = raw ? JSON.parse(raw) : {};
                const curso = data[CURSO_ID];
                if (curso) {
                    return {
                        ultimaPagina: curso.ultimaPagina || pagina,
                        score: curso.progreso || score,
                        student: ScormManager.studentInfo
                    };
                }
            } catch {}
        } else {
            const pagina = localStorage.getItem(CURSO_ID + "_ultimaPagina");
            const score = localStorage.getItem(CURSO_ID + "_porcentaje");
            const student = JSON.parse(localStorage.getItem("studentInfo") || "{}");
            return { ultimaPagina: pagina, score, student };
        }
        return null;
    }

    // ---------- Páginas visitadas ----------
    static obtenerPaginasVisitadas() {
        if (this.API) {
            try {
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                const data = raw ? JSON.parse(raw) : {};
                return data[CURSO_ID]?.visitadas || [];
            } catch { return []; }
        } else {
            const raw = localStorage.getItem(CURSO_ID + "_visitadas");
            return raw ? JSON.parse(raw) : [];
        }
    }

    static guardarPaginasVisitadas(visitadas) {

        const limpias = ScormManager.limpiarVisitadas(visitadas);

        if (this.API) {
            let data = {};
            try {
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                data = raw ? JSON.parse(raw) : {};
            } catch { data = {}; }

            if (!data[CURSO_ID]) data[CURSO_ID] = {};
            data[CURSO_ID].visitadas = limpias;
            this.API.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
        } else {
            localStorage.setItem(CURSO_ID + "_visitadas", JSON.stringify(limpias));
        }
    }

    static limpiarVisitadas(visitadas) {
        const set = new Set(visitadas);
        return Array.from(set).filter((p) => ScormManager.paginasCurso.includes(p));
    }



    // -------------------- Obtener todos los IDs completos --------------------
    static getFullCursoIDs() {
        let fullIDs = {};

        try {
            if (this.API) {
                const raw = this.API.LMSGetValue("cmi.suspend_data");
                const data = raw ? JSON.parse(raw) : {};

                const cursoIDs = data._curso_ids || [];

                cursoIDs.forEach(id => {
                    const parts = id.split("_");
                    if (parts.length > 1) {
                        const base = parts[0]; // prefijo dinámico (ej: "curso1", "curso2", "abc123")
                        fullIDs[base] = id;   // asigna ID completo  //prefijo_user_id_launchdata   //moduidmo_conteni_idconteno
                    }
                });

                console.log("📋 IDs de cursos mapeados:", fullIDs);
            } else {
                console.log("⚠️ No hay API SCORM, fallback con localStorage");
                fullIDs = {
                    default1: "default1_",
                    default2: "default2_"
                };
            }
        } catch (e) {
            console.warn("Error obteniendo IDs de cursos:", e);
            fullIDs = {};
        }

        return fullIDs;
    }

    // -------------------- Obtener un ID completo desde prefijo --------------------
    static getCursoIDFromPrefix(prefix) {
        const ids = this.getFullCursoIDs();
        return ids[prefix] || null;
    }
}

// 👉 Exponer al global
window.ScormManager = ScormManager;
