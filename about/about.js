(() => {
  const timeline = document.querySelector("[data-career-timeline]");
  if (timeline) {
    const rail = timeline.querySelector(".career-timeline__rail");
    const dot = timeline.querySelector(".career-timeline__dot");
    if (rail && dot) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      const update = () => {
        const railRect = rail.getBoundingClientRect();
        const railHeight = rail.offsetHeight;
        const dotSize = dot.offsetHeight;
        const travel = Math.max(railHeight - dotSize, 0);

        if (travel <= 0) {
          dot.style.transform = "translate3d(-50%, 0, 0)";
          return;
        }

        // Progress as the rail moves through the viewport centre band
        const viewH =
          window.innerHeight || document.documentElement.clientHeight;
        const start = viewH * 0.65;
        const end = viewH * 0.28;
        const raw = (start - railRect.top) / (start - end + railHeight);
        const progress = Math.min(1, Math.max(0, raw));

        const y = progress * travel;
        dot.style.transform = `translate3d(-50%, ${y}px, 0)`;
      };

      if (reduceMotion) {
        // Park the dot at the start of the line
        dot.style.transform = "translate3d(-50%, 0, 0)";
      } else {
        let ticking = false;
        const onScroll = () => {
          if (ticking) return;
          ticking = true;
          window.requestAnimationFrame(() => {
            update();
            ticking = false;
          });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onScroll);
        update();
      }
    }
  }

  // Occasional pocket-monster peek — stationary most of the time
  const monster = document.querySelector("[data-pocket-monster]");
  if (!monster) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (reduceMotion) return;

  let timer = 0;

  const schedule = () => {
    const delay = 5000 + Math.random() * 3000; // 5–8s
    timer = window.setTimeout(peek, delay);
  };

  const peek = () => {
    monster.classList.remove("is-peeking");
    // Force reflow so repeated peeks retrigger the animation
    void monster.offsetWidth;
    monster.classList.add("is-peeking");
  };

  monster.addEventListener("animationend", () => {
    monster.classList.remove("is-peeking");
    schedule();
  });

  schedule();
})();
