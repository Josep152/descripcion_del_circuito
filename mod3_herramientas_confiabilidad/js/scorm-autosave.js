document.addEventListener("DOMContentLoaded", () => {
    const paginaActual = window.location.pathname.split("/").pop();

    if (ScormManager.API) {
        ScormManager.API.LMSSetValue("cmi.core.lesson_location", paginaActual);

        try {
            const raw = ScormManager.API.LMSGetValue("cmi.suspend_data");
            const data = raw ? JSON.parse(raw) : {};
            if (!data[CURSO_ID]) data[CURSO_ID] = {};
            data[CURSO_ID].ultimaPagina = paginaActual;
            ScormManager.API.LMSSetValue("cmi.suspend_data", JSON.stringify(data));
        } catch {}

        ScormManager.API.LMSCommit("");
    }
});
