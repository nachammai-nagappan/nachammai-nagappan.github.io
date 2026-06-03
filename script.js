const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const systemThemeQuery = window.matchMedia("(prefers-color-scheme: dark)");
const themeToggle = document.querySelector(".theme-toggle");
const themeColorMeta = document.querySelector('meta[name="theme-color"]');

const getStoredTheme = () => {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch (error) {
    return null;
  }
};

const storeTheme = (theme) => {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch (error) {
    return false;
  }

  return true;
};

const getResolvedTheme = () => {
  const storedTheme = getStoredTheme();
  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return systemThemeQuery.matches ? "dark" : "light";
};

const updateThemeControls = () => {
  const isDark = getResolvedTheme() === "dark";

  if (themeColorMeta) {
    themeColorMeta.setAttribute("content", isDark ? "#241714" : "#FFEDDB");
  }

  if (themeToggle) {
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeToggle.title = isDark ? "Switch to light mode" : "Switch to dark mode";
  }
};

const setTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  storeTheme(theme);
  updateThemeControls();
};

if (window.lucide) {
  window.lucide.createIcons();
}

updateThemeControls();

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    const nextTheme = getResolvedTheme() === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  });
}

const handleSystemThemeChange = () => {
  if (!getStoredTheme()) {
    updateThemeControls();
  }
};

if (systemThemeQuery.addEventListener) {
  systemThemeQuery.addEventListener("change", handleSystemThemeChange);
} else if (systemThemeQuery.addListener) {
  systemThemeQuery.addListener(handleSystemThemeChange);
}

const animatedItems = document.querySelectorAll("[data-animate]");

if (prefersReducedMotion) {
  animatedItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        } else {
          entry.target.classList.remove("is-visible");
        }
      });
    },
    {
      threshold: 0.16,
      rootMargin: "0px 0px -8%",
    }
  );

  animatedItems.forEach((item) => revealObserver.observe(item));
}

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sectionMap = new Map(
  navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? [id.slice(1), link] : null;
    })
    .filter(Boolean)
);
const navSections = Array.from(document.querySelectorAll("main section[id]")).filter((section) =>
  sectionMap.has(section.id)
);
let activeSectionId = "";

const setActiveLink = (sectionId) => {
  if (!sectionId || sectionId === activeSectionId) return;

  activeSectionId = sectionId;
  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${sectionId}`;
    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
};

const updateActiveNav = () => {
  if (!navSections.length) return;

  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  const activationLine = window.scrollY + headerHeight + Math.min(window.innerHeight * 0.28, 220);
  let currentSectionId = navSections[0].id;

  navSections.forEach((section) => {
    if (section.offsetTop <= activationLine) {
      currentSectionId = section.id;
    }
  });

  const isAtPageEnd =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;

  if (isAtPageEnd) {
    currentSectionId = navSections[navSections.length - 1].id;
  }

  setActiveLink(currentSectionId);
};

const progressBar = document.querySelector(".scroll-progress__bar");
const heroImage = document.querySelector(".hero-media img");
let ticking = false;

const updateScrollEffects = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  progressBar.style.width = `${progress}%`;

  if (!prefersReducedMotion && heroImage) {
    const offset = Math.min(scrollTop * 0.12, 72);
    heroImage.style.transform = `translate3d(0, ${offset}px, 0) scale(1.02)`;
  }

  updateActiveNav();
  ticking = false;
};

window.addEventListener(
  "scroll",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  },
  { passive: true }
);

window.addEventListener(
  "resize",
  () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  },
  { passive: true }
);

updateScrollEffects();
