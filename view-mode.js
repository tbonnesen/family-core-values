(function initViewMode() {
  const fcv = window.FCV || {};
  const STORAGE = fcv.STORAGE || {};
  const VIEW_MODE_KEY = STORAGE.VIEW_MODE || "fcv_view_mode_v1";
  const DEFAULT_MODE = "desktop";
  const VALID_MODES = new Set(["desktop", "mobile"]);
  const MODE_CLASS_PREFIX = "view-mode-";

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

  function updateToggleStates(mode) {
    document.querySelectorAll("[data-view-mode-toggle]").forEach((group) => {
      group.querySelectorAll("button[data-view-mode-option]").forEach((button) => {
        const isActive = button.dataset.viewModeOption === mode;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    });
  }

  function applyMode(mode) {
    const nextMode = normalizeMode(mode);
    if (!document.body) {
      return;
    }

    document.body.classList.remove(`${MODE_CLASS_PREFIX}desktop`, `${MODE_CLASS_PREFIX}mobile`);
    document.body.classList.add(`${MODE_CLASS_PREFIX}${nextMode}`);
    document.body.dataset.viewMode = nextMode;
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

  function init() {
    const storedMode = normalizeMode(safeGetItem(VIEW_MODE_KEY));
    applyMode(storedMode);
    bindToggleGroups();
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
