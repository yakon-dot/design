/**
 * Desktop gate — scratch-to-reveal QR.
 * Active only when the desktop gate is shown (≥768px).
 */
(function () {
  const REVEAL_THRESHOLD = 0.45;

  function prefersDesktop() {
    return window.matchMedia("(min-width: 768px)").matches;
  }

  function fillOverlay(ctx, width, height) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const dpr = ctx.canvas.width / width;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Slightly dustier pink than the #fb2fa3 stage background
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#e84d9a";
    ctx.fillRect(0, 0, width, height);

    // Subtle coated-paper grain (drawn as translucent speckles)
    ctx.save();
    for (let i = 0; i < Math.floor(width * height * 0.08); i += 1) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const a = 0.04 + Math.random() * 0.1;
      const light = Math.random() > 0.5;
      ctx.fillStyle = light
        ? "rgba(255, 255, 255, " + a + ")"
        : "rgba(80, 10, 45, " + a + ")";
      ctx.fillRect(x, y, 1.1, 1.1);
    }
    ctx.restore();

    const sheen = ctx.createLinearGradient(0, 0, width, height);
    sheen.addColorStop(0, "rgba(255, 255, 255, 0.16)");
    sheen.addColorStop(0.45, "rgba(255, 255, 255, 0.03)");
    sheen.addColorStop(1, "rgba(0, 0, 0, 0.07)");
    ctx.fillStyle = sheen;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "rgba(26, 26, 26, 0.72)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const size = Math.max(13, Math.min(width, height) * 0.16);
    ctx.font = '500 ' + size + 'px "Instrument Sans", system-ui, sans-serif';
    ctx.fillText("Scratch me", width / 2, height / 2);
  }

  function clearRatio(ctx, pixelW, pixelH) {
    const { data } = ctx.getImageData(0, 0, pixelW, pixelH);
    const step = Math.max(1, Math.floor(Math.min(pixelW, pixelH) / 90));
    let clear = 0;
    let total = 0;
    for (let y = 0; y < pixelH; y += step) {
      for (let x = 0; x < pixelW; x += step) {
        total += 1;
        if (data[(y * pixelW + x) * 4 + 3] < 48) clear += 1;
      }
    }
    return total ? clear / total : 0;
  }

  function initScratch(canvas) {
    const wrap = canvas.closest(".scratch-card");
    if (!wrap) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    let drawing = false;
    let revealed = false;
    let cssW = 0;
    let cssH = 0;
    let dpr = 1;

    function syncSize() {
      const rect = wrap.getBoundingClientRect();
      cssW = Math.max(1, Math.round(rect.width));
      cssH = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = cssW + "px";
      canvas.style.height = cssH + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!revealed) {
        fillOverlay(ctx, cssW, cssH);
      } else {
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
      if (clearRatio(ctx, canvas.width, canvas.height) < REVEAL_THRESHOLD) return;
      revealed = true;
      canvas.classList.add("is-done");
      canvas.style.transition = "opacity 0.45s ease";
      canvas.style.opacity = "0";
      window.setTimeout(function () {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, cssW, cssH);
      }, 480);
    }

    let lastX = 0;
    let lastY = 0;

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
    if (canvas) initScratch(canvas);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
