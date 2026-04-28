(function () {
  "use strict";

  const carousel = document.querySelector("[data-services-carousel]");
  if (carousel) {
    const viewport = carousel.querySelector(".services-viewport");
    const track = carousel.querySelector("[data-services-track]");
    const prev = carousel.querySelector("[data-services-prev]");
    const next = carousel.querySelector("[data-services-next]");
    const cards = track ? track.querySelectorAll(".card-service") : [];
    let index = 0;
    let paused = false;
    let timer = null;

    function gapPx() {
      const g = getComputedStyle(track).gap;
      return parseFloat(g) || 0;
    }

    function visibleCount() {
      const w = viewport.clientWidth;
      if (w >= 900) return 3;
      if (w >= 560) return 2;
      return 1;
    }

    function maxIndex() {
      return Math.max(0, cards.length - visibleCount());
    }

    function applyTransform() {
      if (!cards.length || !track) return;
      const m = maxIndex();
      index = Math.min(m, Math.max(0, index));
      const step = cards[0].offsetWidth + gapPx();
      track.style.transform = `translateX(-${index * step}px)`;
    }

    function go(delta) {
      const m = maxIndex();
      index = Math.min(m, Math.max(0, index + delta));
      applyTransform();
    }

    function autoplayStep() {
      const m = maxIndex();
      if (m <= 0) return;
      if (index >= m) index = 0;
      else index += 1;
      applyTransform();
    }

    function startAutoplay() {
      if (timer) clearInterval(timer);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      timer = window.setInterval(() => {
        if (!paused) autoplayStep();
      }, 4500);
    }

    if (prev) prev.addEventListener("click", () => go(-1));
    if (next) next.addEventListener("click", () => go(1));

    carousel.addEventListener("mouseenter", () => {
      paused = true;
    });
    carousel.addEventListener("mouseleave", () => {
      paused = false;
    });

    window.addEventListener("resize", applyTransform);

    if (viewport && window.ResizeObserver) {
      new ResizeObserver(applyTransform).observe(viewport);
    }

    requestAnimationFrame(() => {
      applyTransform();
      startAutoplay();
    });
  }

  const whoRoot = document.querySelector("[data-who-root]");
  if (whoRoot) {
    const tabs = whoRoot.querySelectorAll("[data-who-tab]");
    const textEl = whoRoot.querySelector("[data-who-text]");
    const imgEl = whoRoot.querySelector("[data-who-visual]");
    const titleEl = whoRoot.querySelector("[data-who-title]");

    function activateWho(key) {
      const tab = whoRoot.querySelector(`[data-who-tab="${key}"]`);
      if (!tab || !textEl || !imgEl) return;
      const text = tab.getAttribute("data-who-copy") || "";
      const title = tab.getAttribute("data-who-heading") || "";
      const src = tab.getAttribute("data-who-img") || "";
      const alt = tab.getAttribute("data-who-alt") || "";
      textEl.textContent = text;
      if (titleEl) titleEl.textContent = title;
      imgEl.src = src;
      imgEl.alt = alt;
      tabs.forEach((t) => {
        const on = t.getAttribute("data-who-tab") === key;
        t.setAttribute("aria-selected", on ? "true" : "false");
        t.classList.toggle("is-active", on);
      });
    }

    tabs.forEach((tab) => {
      const key = tab.getAttribute("data-who-tab");
      if (!key) return;
      tab.addEventListener("mouseenter", () => activateWho(key));
      tab.addEventListener("focus", () => activateWho(key));
      tab.addEventListener("click", () => activateWho(key));
    });
  }

  function initSlider(rootSelector, opts) {
    const root = document.querySelector(rootSelector);
    if (!root) return;
    const track = root.querySelector("[data-slider-track]");
    const slides = track ? Array.from(track.children) : [];
    const prev = root.querySelector("[data-slider-prev]");
    const next = root.querySelector("[data-slider-next]");
    const dots = root.querySelector("[data-slider-dots]");
    if (!slides.length) return;

    let index = 0;

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, j) => s.classList.toggle("is-active", j === index));
      if (dots) {
        dots.querySelectorAll("[data-slider-dot]").forEach((d, j) => {
          d.classList.toggle("is-active", j === index);
          d.setAttribute("aria-selected", j === index ? "true" : "false");
        });
      }
    }

    if (dots && slides.length) {
      slides.forEach((_, j) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "slider-dot" + (j === 0 ? " is-active" : "");
        b.setAttribute("data-slider-dot", "");
        b.setAttribute("aria-label", `Slide ${j + 1}`);
        b.setAttribute("aria-selected", j === 0 ? "true" : "false");
        b.addEventListener("click", () => go(j));
        dots.appendChild(b);
      });
    }

    if (prev) prev.addEventListener("click", () => go(index - 1));
    if (next) next.addEventListener("click", () => go(index + 1));

    if (opts && opts.autoplayMs && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.setInterval(() => go(index + 1), opts.autoplayMs);
    }

    go(0);
  }

  initSlider("[data-testimonial-slider]", { autoplayMs: 8000 });
})();
