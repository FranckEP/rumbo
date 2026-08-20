export const THEME_STORAGE_KEY = "rumbo-theme";

/** Inyectado en <head> para fijar el tema antes del primer paint y evitar parpadeo. */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}");if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;
