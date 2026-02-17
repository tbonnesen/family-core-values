(function initViewMode() {
  const fcv = window.FCV || {};
  const STORAGE = fcv.STORAGE || {};
  const VIEW_MODE_KEY = STORAGE.VIEW_MODE || "fcv_view_mode_v1";
  const AUTO_MODE_MIGRATION_KEY = "fcv_view_mode_auto_migrated_v1";
  const DEFAULT_MODE = "auto";
  const VALID_MODES = new Set(["auto", "desktop", "mobile"]);
  const MODE_CLASS_PREFIX = "view-mode-";
  const MODE_CLASSES = [`${MODE_CLASS_PREFIX}desktop`, `${MODE_CLASS_PREFIX}mobile`];
  const AUTO_MOBILE_MAX_WIDTH = 1024;
  const AUTO_TABLET_MAX_WIDTH = 1180;
  let currentMode = DEFAULT_MODE;
  let autoResolvedMode = "desktop";
  let viewportListenersBound = false;
  let autoResizeRaf = 0;

  function safeGetItem(key) {
    if (typeof fcv.safeGetItem === "function") {
      return fcv.safeGetItem(key);
    }
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetItem(key, value) {
    if (typeof fcv.safeSetItem === "function") {
      return fcv.safeSetItem(key, value);
    }
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function normalizeMode(value) {
    return VALID_MODES.has(value) ? value : DEFAULT_MODE;
  }

  function resolveAutoMode() {
    if (typeof window.matchMedia === "function") {
      const isNarrowViewport = window.matchMedia(`(max-width: ${AUTO_MOBILE_MAX_WIDTH}px)`).matches;
      const isTabletTouchViewport =
        window.matchMedia(`(max-width: ${AUTO_TABLET_MAX_WIDTH}px)`).matches && window.matchMedia("(pointer: coarse)").matches;

      if (isNarrowViewport || isTabletTouchViewport) {
        return "mobile";
      }
      return "desktop";
    }

    const viewportWidth = Math.max(
      window.innerWidth || 0,
      (document.documentElement && document.documentElement.clientWidth) || 0
    );
    return viewportWidth <= AUTO_MOBILE_MAX_WIDTH ? "mobile" : "desktop";
  }

  function updateToggleStates(mode) {
    document.querySelectorAll("[data-view-mode-toggle]").forEach((group) => {
      group.querySelectorAll("button[data-view-mode-option]").forEach((button) => {
        const isActive = button.dataset.viewModeOption === mode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
        if (button.dataset.viewModeOption === "auto") {
          button.setAttribute("title", `Auto (${autoResolvedMode})`);
        }
      });
    });
  }

  function applyMode(mode) {
    const nextMode = normalizeMode(mode);
    if (!document.body) {
      return;
    }

    document.body.classList.remove(...MODE_CLASSES);
    const resolvedMode = nextMode === "auto" ? resolveAutoMode() : nextMode;
    autoResolvedMode = resolvedMode;
    document.body.classList.add(`${MODE_CLASS_PREFIX}${resolvedMode}`);
    document.body.dataset.viewMode = nextMode;
    document.body.dataset.viewModeResolved = resolvedMode;
    currentMode = nextMode;
    updateToggleStates(nextMode);
  }

  function setMode(mode) {
    const nextMode = normalizeMode(mode);
    applyMode(nextMode);
    safeSetItem(VIEW_MODE_KEY, nextMode);
  }

  function bindToggleGroups() {
    document.querySelectorAll("[data-view-mode-toggle]").forEach((group) => {
      if (group.dataset.viewModeBound === "true") {
        return;
      }

      group.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-view-mode-option]");
        if (!button) {
          return;
        }
        setMode(button.dataset.viewModeOption);
      });

      group.dataset.viewModeBound = "true";
    });
  }

  function refreshAutoModeForViewport() {
    if (currentMode !== "auto") {
      return;
    }
    const nextResolved = resolveAutoMode();
    if (nextResolved === autoResolvedMode && document.body?.classList.contains(`${MODE_CLASS_PREFIX}${nextResolved}`)) {
      return;
    }
    applyMode("auto");
  }

  function bindViewportListeners() {
    if (viewportListenersBound) {
      return;
    }

    const handleViewportChange = () => {
      if (autoResizeRaf) {
        return;
      }
      autoResizeRaf = window.requestAnimationFrame(() => {
        autoResizeRaf = 0;
        refreshAutoModeForViewport();
      });
    };

    window.addEventListener("resize", handleViewportChange, { passive: true });
    window.addEventListener("orientationchange", handleViewportChange);
    viewportListenersBound = true;
  }

  function init() {
    const migratedToAuto = safeGetItem(AUTO_MODE_MIGRATION_KEY) === "1";
    let storedMode = normalizeMode(safeGetItem(VIEW_MODE_KEY));
    if (!migratedToAuto) {
      storedMode = "auto";
      safeSetItem(VIEW_MODE_KEY, storedMode);
      safeSetItem(AUTO_MODE_MIGRATION_KEY, "1");
    }
    applyMode(storedMode);
    bindToggleGroups();
    bindViewportListeners();
  }

  window.addEventListener("storage", (event) => {
    if (event.key !== VIEW_MODE_KEY) {
      return;
    }
    applyMode(normalizeMode(event.newValue));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
