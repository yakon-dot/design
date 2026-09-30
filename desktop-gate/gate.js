/**
 * Desktop gate — scratch-to-reveal QR.
 * Scratch layer is the supplied scratch-card-overlay.png drawn on canvas.
 */
(function () {
  const REVEAL_THRESHOLD = 0.45;
  const OVERLAY_SRC = "desktop-gate/images/scratch-card-overlay.png";

  function prefersDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  function clearRatio(ctx, pixelW, pixelH, initialAlpha) {
    const { data } = ctx.getImageData(0, 0, pixelW, pixelH);
    const step = Math.max(1, Math.floor(Math.min(pixelW, pixelH) / 90));
    let cleared = 0;
    let solid = 0;
    for (let y = 0; y < pixelH; y += step) {
      for (let x = 0; x < pixelW; x += step) {
        const i = (y * pixelW + x) * 4 + 3;
        // Only measure pixels that started as part of the opaque card
        if (!initialAlpha || initialAlpha[i] < 200) continue;
        solid += 1;
        if (data[i] < 48) cleared += 1;
      }
    }
    return solid ? cleared / solid : 0;
  }

  function initScratch(canvas, overlayImg) {
    const wrap = canvas.closest(".scratch-card");
    if (!wrap) return;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: true,
    });
    // Ensure the bitmap starts fully transparent (no opaque default buffer)
    ctx.clearRect(0, 0, canvas.width || 1, canvas.height || 1);
    let drawing = false;
    let revealed = false;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;
    let lastX = 0;
    let lastY = 0;
    let initialAlpha = null;

    function paintOverlay() {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.globalCompositeOperation = "source-over";
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // Draw the supplied PNG with its alpha intact — no fill behind it
      ctx.drawImage(overlayImg, 0, 0, cssW, cssH);
      initialAlpha = ctx.getImageData(0, 0, canvas.width, canvas.height).data.slice();
    }

    function syncSize() {
      const rect = wrap.getBoundingClientRect();
      cssW = Math.max(1, Math.round(rect.width));
      cssH = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      if (!revealed) {
        paintOverlay();
      } else {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
        canvas.style.opacity = "0";
      }
    }

    function pos(event) {
      const rect = canvas.getBoundingClientRect();
      const point = event.touches ? event.touches[0] : event;
      return {
        x: ((point.clientX - rect.left) / rect.width) * cssW,
        y: ((point.clientY - rect.top) / rect.height) * cssH,
      };
    }

    function eraseAt(x, y) {
      const radius = Math.max(14, Math.min(cssW, cssH) * 0.14);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }

    function maybeReveal() {
      if (revealed) return;
      if (clearRatio(ctx, canvas.width, canvas.height, initialAlpha) < REVEAL_THRESHOLD) return;
      revealed = true;
      canvas.classList.add("is-done");
      canvas.style.transition = "opacity 0.45s ease";
      canvas.style.opacity = "0";
      window.setTimeout(function () {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
      }, 480);
    }

    function onDown(event) {
      if (revealed) return;
      drawing = true;
      const p = pos(event);
      lastX = p.x;
      lastY = p.y;
      eraseAt(p.x, p.y);
      maybeReveal();
      event.preventDefault();
    }

    function onMove(event) {
      if (!drawing || revealed) return;
      const p = pos(event);
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = Math.max(28, Math.min(cssW, cssH) * 0.28);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
      ctx.globalCompositeOperation = "source-over";
      lastX = p.x;
      lastY = p.y;
      maybeReveal();
      event.preventDefault();
    }

    function onUp() {
      drawing = false;
    }

    canvas.addEventListener("mousedown", onDown);
    canvas.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("touchstart", onDown, { passive: false });
    canvas.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);

    syncSize();
    window.addEventListener("resize", function () {
      if (!prefersDesktop()) return;
      syncSize();
    });
  }

  function boot() {
    if (!prefersDesktop()) return;
    const canvas = document.querySelector("[data-scratch-canvas]");
    if (!canvas) return;

    const img = new Image();
    img.decoding = "async";
    img.onload = function () {
      initScratch(canvas, img);
    };
    img.onerror = function () {
      initScratch(canvas, img);
    };
    img.src = OVERLAY_SRC;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
