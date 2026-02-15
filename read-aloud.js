(function () {
  const fcv = window.FCV || {};
  const synth = window.speechSynthesis;
  const supported = !!synth && typeof SpeechSynthesisUtterance !== "undefined";
  const STORAGE = fcv.STORAGE || {
    PROFILES: "fcv_profiles_v2",
    ACTIVE_PROFILE: "fcv_active_profile_v2"
  };
  const state = {
    activeButton: null,
    utterance: null,
    voices: []
  };

  function isVisible(node) {
    if (!(node instanceof HTMLElement)) {
      return false;
    }
    if (node.classList.contains("memory-text--hidden")) {
      return false;
    }
    const style = window.getComputedStyle(node);
    return style.display !== "none" && style.visibility !== "hidden";
  }

  function uniqueInOrder(items) {
    const seen = new Set();
    return items.filter((item) => {
      if (seen.has(item)) {
        return false;
      }
      seen.add(item);
      return true;
    });
  }

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

  function shouldUseKidPacing() {
    let profiles;
    if (typeof fcv.loadJSON === "function") {
      profiles = fcv.loadJSON(STORAGE.PROFILES, []);
    } else {
      try {
        profiles = JSON.parse(safeGetItem(STORAGE.PROFILES) || "[]");
      } catch {
        profiles = [];
      }
    }
    const activeProfileId = safeGetItem(STORAGE.ACTIVE_PROFILE);
    if (!Array.isArray(profiles) || !activeProfileId) {
      return false;
    }

    const activeProfile = profiles.find((profile) => profile && profile.id === activeProfileId);
    const ages = activeProfile && Array.isArray(activeProfile.ages) ? activeProfile.ages : [];
    return ages.some((age) => Number(age) > 0 && Number(age) < 6);
  }

  function collectSectionText(section) {
    const nodes = section.querySelectorAll("h1, h2, h3, p, li, strong");
    const lines = [];

    nodes.forEach((node) => {
      if (!isVisible(node)) {
        return;
      }
      if (node.closest(".read-aloud-btn")) {
        return;
      }
      const text = node.textContent.replace(/\s+/g, " ").trim();
      if (text) {
        lines.push(text);
      }
    });

    return uniqueInOrder(lines).join(". ");
  }

  function chooseVoice() {
    if (!state.voices.length) {
      state.voices = synth.getVoices();
    }

    const english = state.voices.filter((voice) => voice.lang && voice.lang.toLowerCase().startsWith("en"));
    const preferred =
      english.find((voice) => /samantha|allison|google us|karen|alex/i.test(voice.name)) ||
      english[0] ||
      state.voices[0] ||
      null;

    return preferred;
  }

  function resetActiveButton() {
    if (!state.activeButton) {
      return;
    }
    state.activeButton.textContent = "Read Aloud";
    state.activeButton.setAttribute("aria-pressed", "false");
    state.activeButton = null;
  }

  function stopSpeaking() {
    if (!supported) {
      return;
    }
    synth.cancel();
    state.utterance = null;
    resetActiveButton();
  }

  function speak(section, button) {
    if (!supported) {
      button.textContent = "Not Supported";
      return;
    }

    if (state.activeButton === button) {
      stopSpeaking();
      return;
    }

    const text = collectSectionText(section);
    if (!text) {
      button.textContent = "No Text";
      return;
    }

    stopSpeaking();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = chooseVoice();
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = shouldUseKidPacing() ? 0.88 : 0.94;
    utterance.pitch = 1;

    utterance.onend = () => {
      state.utterance = null;
      resetActiveButton();
    };

    utterance.onerror = () => {
      state.utterance = null;
      resetActiveButton();
    };

    state.utterance = utterance;
    state.activeButton = button;
    button.textContent = "Stop";
    button.setAttribute("aria-pressed", "true");
    synth.speak(utterance);
  }

  function injectButtons() {
    const selector = "main > section, main > article, main > aside, .value-focus-grid > section";
    const targets = Array.from(document.querySelectorAll(selector));
    const uniqueTargets = Array.from(new Set(targets));

    uniqueTargets.forEach((section) => {
      if (section.querySelector(":scope > .read-aloud-btn")) {
        return;
      }

      section.classList.add("read-aloud-target");

      const button = document.createElement("button");
      button.type = "button";
      button.className = "read-aloud-btn";
      button.textContent = "Read Aloud";
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", "Read this section aloud");
      button.addEventListener("click", () => speak(section, button));

      section.prepend(button);
    });
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopSpeaking();
    }
  });

  if (supported) {
    state.voices = synth.getVoices();
    synth.onvoiceschanged = () => {
      state.voices = synth.getVoices();
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectButtons);
  } else {
    injectButtons();
  }
})();
