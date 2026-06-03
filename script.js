const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (window.lucide) {
  window.lucide.createIcons();
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
          revealObserver.unobserve(entry.target);
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

updateScrollEffects();

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const sectionMap = new Map(
  navLinks
    .map((link) => {
      const id = link.getAttribute("href");
      return id ? [id.slice(1), link] : null;
    })
    .filter(Boolean)
);

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      const link = sectionMap.get(entry.target.id);
      if (!link) return;

      if (entry.isIntersecting) {
        navLinks.forEach((item) => item.classList.remove("is-active"));
        link.classList.add("is-active");
      }
    });
  },
  {
    threshold: 0.32,
    rootMargin: "-20% 0px -48%",
  }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  navObserver.observe(section);
});
