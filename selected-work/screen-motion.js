(() => {
  const rail = document.querySelector("[data-screen-rail]");
  const pager = document.querySelector("[data-screen-pager]");
  if (!rail || !pager) return;

  const items = Array.from(rail.querySelectorAll(".screen-motion__item"));
  if (!items.length) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Pagination — one indicator per rendered media item
  const dots = items.map((_, index) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "screen-motion__dot";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `Piece ${index + 1} of ${items.length}`);
    btn.addEventListener("click", () => {
      items[index].scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        inline: "start",
        block: "nearest",
      });
    });
    pager.appendChild(btn);
    return btn;
  });

  const setActive = (index) => {
    dots.forEach((dot, i) => {
      const on = i === index;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", on ? "true" : "false");
      dot.tabIndex = on ? 0 : -1;
    });
  };

  setActive(0);

  const nearestIndex = () => {
    const railLeft = rail.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.offsetLeft - rail.offsetLeft - railLeft);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  };

  let scrollTick = 0;
  rail.addEventListener(
    "scroll",
    () => {
      if (scrollTick) return;
      scrollTick = window.requestAnimationFrame(() => {
        scrollTick = 0;
        setActive(nearestIndex());
      });
    },
    { passive: true }
  );

  // Videos — play when sufficiently visible in the rail; pause otherwise
  const videos = Array.from(rail.querySelectorAll("video"));
  if (!videos.length) return;

  videos.forEach((video) => {
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.playsInline = true;
    video.controls = false;
    video.removeAttribute("controls");
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    videos.forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
    return;
  }

  const videoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
          const play = video.play();
          if (play && typeof play.catch === "function") play.catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { root: rail, threshold: [0, 0.45, 0.75] }
  );

  videos.forEach((video) => videoObserver.observe(video));
})();
