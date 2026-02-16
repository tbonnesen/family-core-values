(function initJetonMotion() {
  const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function queryMotionTargets() {
    return Array.from(
      document.querySelectorAll(
        ".hero, .layout > .panel, .detail-layout > .panel, .chore-chart-layout > .panel, .value-card, .chore-profile-card, .other-value-link"
      )
    );
  }

  function assignRevealOrder() {
    queryMotionTargets().forEach((node, index) => {
      node.classList.add("jeton-reveal");
      node.style.setProperty("--jeton-order", String(index));
    });
  }

  function setupRevealObserver() {
    if (REDUCED_MOTION || typeof IntersectionObserver !== "function") {
      queryMotionTargets().forEach((node) => node.classList.add("is-inview"));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
    );

    queryMotionTargets().forEach((node) => observer.observe(node));
  }

  function setupHeroParallax() {
    if (REDUCED_MOTION) {
      return;
    }

    document.querySelectorAll(".hero").forEach((hero) => {
      hero.addEventListener("pointermove", (event) => {
        const rect = hero.getBoundingClientRect();
        if (!rect.width || !rect.height) {
          return;
        }

        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        hero.style.setProperty("--jeton-mx", (x * 14).toFixed(2) + "px");
        hero.style.setProperty("--jeton-my", (y * 10).toFixed(2) + "px");
      });

      hero.addEventListener("pointerleave", () => {
        hero.style.setProperty("--jeton-mx", "0px");
        hero.style.setProperty("--jeton-my", "0px");
      });
    });
  }

  function setupHoverTilt() {
    if (REDUCED_MOTION) {
      return;
    }

    document.querySelectorAll(".layout > .panel, .value-card, .chore-profile-card, .other-value-link").forEach((card) => {
      if (card.dataset.jetonTiltBound === "true") {
        return;
      }

      card.addEventListener("pointermove", (event) => {
        if (document.body.classList.contains("layout-editing")) {
          return;
        }

        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--jeton-tilt-x", (px * 2.4).toFixed(2) + "deg");
        card.style.setProperty("--jeton-tilt-y", (py * -2.2).toFixed(2) + "deg");
      });

      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--jeton-tilt-x", "0deg");
        card.style.setProperty("--jeton-tilt-y", "0deg");
      });

      card.dataset.jetonTiltBound = "true";
    });
  }

  function markFloatingTargets() {
    const selectors = [
      ".panel--spotlight",
      ".panel--weekly",
      ".panel--chorechart",
      ".panel--progress",
      ".chore-chart-overview",
      ".chore-chart-manage"
    ];
    selectors.forEach((selector, groupIndex) => {
      document.querySelectorAll(selector).forEach((node, index) => {
        node.classList.add("jeton-float");
        node.style.setProperty("--jeton-float-delay", `${(groupIndex + index) * 0.18}s`);
      });
    });
  }

  function refreshMotionBindings() {
    assignRevealOrder();
    setupRevealObserver();
    setupHoverTilt();
    markFloatingTargets();
  }

  function init() {
    document.body.classList.add("jeton-motion-ready");
    refreshMotionBindings();
    setupHeroParallax();

    if (typeof MutationObserver === "function") {
      const observer = new MutationObserver(() => {
        refreshMotionBindings();
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
