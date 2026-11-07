
/**
 * ESTÚDIO VÉRTICE
 * Módulos de interface
 *
 * - Navegação responsiva
 * - Acesso rápido
 * - Carrossel de projetos
 */

/* =========================================
   NAVEGAÇÃO
========================================= */

export function initNavigation() {
  const navigation = document.querySelector(
    "[data-navigation]"
  );

  const menuToggle = document.querySelector(
    "[data-menu-toggle]"
  );

  const searchToggle = document.querySelector(
    "[data-search-toggle]"
  );

  const searchPanel = document.querySelector(
    "[data-search-panel]"
  );

  const controller = new AbortController();
  const { signal } = controller;

  const mobileQuery = window.matchMedia(
    "(max-width: 1180px)"
  );

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  function setMenu(open) {
    if (!navigation || !menuToggle) return;

    const isOpen = open && mobileQuery.matches;

    navigation.classList.toggle("is-open", isOpen);
    navigation.inert = mobileQuery.matches && !isOpen;

    menuToggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Fechar menu" : "Abrir menu"
    );
  }

  function setSearch(open) {
    if (!searchPanel || !searchToggle) return;

    searchPanel.hidden = !open;

    searchToggle.setAttribute(
      "aria-expanded",
      String(open)
    );
  }

  function closePanels() {
    setMenu(false);
    setSearch(false);
  }

  function updateActiveLinks(hash) {
    document.querySelectorAll(
      ".site-nav__link, .side-nav__item:not(.side-nav__item--bottom)"
    ).forEach((link) => {
      const active = link.getAttribute("href") === hash;

      link.classList.toggle("is-active", active);

      if (active) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  menuToggle?.addEventListener("click", () => {
    const open =
      menuToggle.getAttribute("aria-expanded") !== "true";

    setSearch(false);
    setMenu(open);

    if (open) navigation?.querySelector("a")?.focus();
  }, { signal });

  searchToggle?.addEventListener("click", () => {
    const open =
      searchToggle.getAttribute("aria-expanded") !== "true";

    setMenu(false);
    setSearch(open);

    if (open) searchPanel?.querySelector("a")?.focus();
  }, { signal });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const anchor = target.closest('a[href^="#"]');

    if (anchor) {
      const hash = anchor.getAttribute("href");

      if (hash && hash !== "#") {
        const destination = document.getElementById(
          hash.slice(1)
        );

        if (destination) {
          event.preventDefault();

          closePanels();
          updateActiveLinks(hash);

          destination.scrollIntoView({
            behavior: reducedMotion.matches
              ? "instant"
              : "smooth",
            block: "start"
          });

          history.replaceState(null, "", hash);
          return;
        }
      }
    }

    if (
      menuToggle &&
      navigation &&
      !menuToggle.contains(target) &&
      !navigation.contains(target)
    ) {
      setMenu(false);
    }

    if (
      searchToggle &&
      searchPanel &&
      !searchToggle.contains(target) &&
      !searchPanel.contains(target)
    ) {
      setSearch(false);
    }
  }, { signal });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const menuOpen =
      menuToggle?.getAttribute("aria-expanded") === "true";

    const searchOpen =
      searchToggle?.getAttribute("aria-expanded") === "true";

    closePanels();

    if (menuOpen) menuToggle?.focus();
    else if (searchOpen) searchToggle?.focus();
  }, { signal });

  mobileQuery.addEventListener("change", closePanels, {
    signal
  });

  window.addEventListener("hashchange", () => {
    updateActiveLinks(location.hash || "#inicio");
  }, { signal });

  closePanels();
  updateActiveLinks(location.hash || "#inicio");

  return () => {
    controller.abort();
    navigation?.classList.remove("is-open");
    navigation?.removeAttribute("inert");

    if (searchPanel) searchPanel.hidden = true;
  };
}

/* =========================================
   DADOS DOS PROJETOS
========================================= */

const projects = [
  {
    title: "Casa Mirante",
    description:
      "Uma residência que valoriza a paisagem, a luz natural e a integração com o entorno.",
    image: "./images/projeto01-bg.jpg",
    alt: "Fotografia do projeto Casa Mirante",
    link: "#contato"
  },
  {
    title: "Refúgio das Oliveiras",
    description:
      "Materiais naturais e ambientes acolhedores em uma arquitetura contemporânea.",
    image: "./images/projeto02-bg.jpg",
    alt: "Fotografia do projeto Refúgio das Oliveiras",
    link: "#contato"
  },
  {
    title: "Pavilhão Horizonte",
    description:
      "Volumes precisos, transparência e uma relação singular entre interior e exterior.",
    image: "./images/projeto03-bg.jpg",
    alt: "Fotografia do projeto Pavilhão Horizonte",
    link: "#contato"
  }
];

/* =========================================
   CARROSSEL
========================================= */

export function initProjectCarousel() {
  const carousel = document.querySelector(
    "[data-carousel]"
  );

  if (!carousel) return () => {};

  const image = carousel.querySelector(
    "[data-project-image]"
  );

  const title = carousel.querySelector(
    "[data-project-title]"
  );

  const description = carousel.querySelector(
    "[data-project-description]"
  );

  const link = carousel.querySelector(
    "[data-project-link]"
  );

  const status = carousel.querySelector(
    "[data-carousel-status]"
  );

  const prevButton = carousel.querySelector(
    "[data-carousel-prev]"
  );

  const nextButton = carousel.querySelector(
    "[data-carousel-next]"
  );

  const dots = [
    ...carousel.querySelectorAll("[data-slide-to]")
  ];

  const controller = new AbortController();
  const { signal } = controller;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const INTERVAL = 5000;

  let currentIndex = 0;
  let intervalId = null;
  let transitionId = null;
  let transitionToken = 0;
  let isVisible = true;
  let isHovering = false;
  let hasFocus = false;

  // Pré-carrega as imagens restantes.
  const imageCache = projects.map((project) => {
    const preload = new Image();
    preload.src = project.image;
    return preload;
  });

  function shouldAutoplay() {
    return (
      !reducedMotion.matches &&
      !document.hidden &&
      isVisible &&
      !isHovering &&
      !hasFocus
    );
  }

  function stopAutoplay() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  function startAutoplay() {
    stopAutoplay();

    if (!shouldAutoplay()) return;

    intervalId = window.setInterval(() => {
      goTo(currentIndex + 1, false);
    }, INTERVAL);
  }

  function renderProject(index, announce = false) {
    const project = projects[index];

    title.textContent = project.title;
    description.textContent = project.description;
    link.href = project.link;
    link.setAttribute(
      "aria-label",
      `Solicitar informações sobre ${project.title}`
    );

    image.src = project.image;
    image.alt = project.alt;

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;

      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });

    if (announce && status) {
      status.textContent =
        `Projeto ${index + 1} de ${projects.length}: ${project.title}`;
    }
  }

  function goTo(index, announce = false) {
    const nextIndex =
      (index + projects.length) % projects.length;

    if (nextIndex === currentIndex) return;

    currentIndex = nextIndex;

    clearTimeout(transitionId);
    transitionToken++;

    const token = transitionToken;

    if (reducedMotion.matches) {
      image.classList.remove("is-changing");
      renderProject(currentIndex, announce);
      return;
    }

    image.classList.add("is-changing");

    transitionId = window.setTimeout(() => {
      if (token !== transitionToken) return;

      renderProject(currentIndex, announce);

      requestAnimationFrame(() => {
        if (token === transitionToken) {
          image.classList.remove("is-changing");
        }
      });
    }, 180);
  }

  function navigateTo(index) {
    goTo(index, true);
    startAutoplay();
  }

  prevButton?.addEventListener("click", () => {
    navigateTo(currentIndex - 1);
  }, { signal });

  nextButton?.addEventListener("click", () => {
    navigateTo(currentIndex + 1);
  }, { signal });

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      navigateTo(Number(dot.dataset.slideTo));
    }, { signal });
  });

  carousel.addEventListener("mouseenter", () => {
    isHovering = true;
    stopAutoplay();
  }, { signal });

  carousel.addEventListener("mouseleave", () => {
    isHovering = false;
    startAutoplay();
  }, { signal });

  carousel.addEventListener("focusin", () => {
    hasFocus = true;
    stopAutoplay();
  }, { signal });

  carousel.addEventListener("focusout", (event) => {
    if (!carousel.contains(event.relatedTarget)) {
      hasFocus = false;
      startAutoplay();
    }
  }, { signal });

  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      navigateTo(currentIndex + 1);
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      navigateTo(currentIndex - 1);
    }
  }, { signal });

  document.addEventListener("visibilitychange", () => {
    startAutoplay();
  }, { signal });

  reducedMotion.addEventListener("change", () => {
    startAutoplay();
  }, { signal });

  // Não anima quando o card está fora da viewport.
  const observer = new IntersectionObserver(
    (entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
      startAutoplay();
    },
    { threshold: 0.2 }
  );

  observer.observe(carousel);

  renderProject(0);
  startAutoplay();

  return () => {
    stopAutoplay();
    clearTimeout(transitionId);
    transitionToken++;

    controller.abort();
    observer.disconnect();

    image.classList.remove("is-changing");

    // Mantém as referências locais apenas durante a vida do módulo.
    imageCache.length = 0;
  };
}
