
/**
 * ESTÚDIO VÉRTICE
 * Application Entry Point
 */

import {
  initNavigation,
  initProjectCarousel
} from "./modules.js";

let cleanups = [];

function destroyApp() {
  cleanups.forEach((cleanup) => {
    if (typeof cleanup === "function") {
      cleanup();
    }
  });

  cleanups = [];
}

function initApp() {
  destroyApp();

  document.documentElement.classList.add(
    "js-enabled"
  );

  cleanups = [
    initNavigation(),
    initProjectCarousel()
  ];

  console.info(
    "[Vértice] Etapa 04 inicializada."
  );
}

initApp();

window.addEventListener("pagehide", destroyApp);
