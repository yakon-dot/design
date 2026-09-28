(() => {
  const wrap = document.querySelector(".hero-monster-wrap");
  if (!wrap) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const enter = () => {
    wrap.classList.add("is-in");
  };

  if (reduceMotion) {
    enter();
    return;
  }

  const heroReveals = document.querySelectorAll(
    ".section--selected-hero .reveal"
  );

  const startAfterCopy = () => {
    // Let the existing text reveal settle, then slide in once.
    window.setTimeout(enter, 420);
  };

  if (!heroReveals.length) {
    startAfterCopy();
    return;
  }

  const allVisible = () =>
    Array.from(heroReveals).every((el) => el.classList.contains("is-visible"));

  if (allVisible()) {
    startAfterCopy();
    return;
  }

  const observer = new MutationObserver(() => {
    if (!allVisible()) return;
    observer.disconnect();
    startAfterCopy();
  });

  heroReveals.forEach((el) => {
    observer.observe(el, { attributes: true, attributeFilter: ["class"] });
  });

  // Fallback if reveals never fire (e.g. observer unsupported mid-flight)
  window.setTimeout(() => {
    observer.disconnect();
    if (!wrap.classList.contains("is-in")) enter();
  }, 2200);
})();
