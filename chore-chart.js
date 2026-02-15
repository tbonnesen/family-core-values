const fcv = window.FCV || {};
const values = typeof fcv.getValues === "function" ? fcv.getValues() : Array.isArray(window.CORE_VALUES) ? window.CORE_VALUES : [];
const STORAGE = fcv.STORAGE || {
  CHORE_MAP: "fcv_chore_mappings_v1",
  PROFILES: "fcv_profiles_v2",
  PROFILE_CHORE_COMPLETION: "fcv_profile_chore_completion_v2",
  PROFILE_CHORE_APPROVAL: "fcv_profile_chore_approval_v1"
};
const PROFILE_ICON_GLYPHS = {
  rocket: "\u{1F680}",
  star: "\u2B50",
  lion: "\u{1F981}",
  fox: "\u{1F98A}",
  dino: "\u{1F996}",
  soccer: "\u26BD",
  paint: "\u{1F3A8}",
  book: "\u{1F4DA}",
  music: "\u{1F3B5}",
  sparkles: "\u2728",
  crown: "\u{1F451}",
  robot: "\u{1F916}",
  plane: "\u2708",
  puzzle: "\u{1F9E9}",
  gamepad: "\u{1F3AE}",
  globe: "\u{1F30D}",
  camera: "\u{1F4F7}",
  heart: "\u{1F496}",
  rainbow: "\u{1F308}",
  car: "\u{1F697}",
  guitar: "\u{1F3B8}",
  planet: "\u{1FA90}",
  butterfly: "\u{1F98B}",
  dragon: "\u{1F409}"
};
const PROFILE_AGES =
  Array.isArray(fcv.PROFILE_AGES_DEFAULT) && fcv.PROFILE_AGES_DEFAULT.length ? fcv.PROFILE_AGES_DEFAULT : [1, 2, 3, 4, 5, 6, 7];
const PROFILE_ICON_IDS = Object.keys(PROFILE_ICON_GLYPHS);

const weekLabel = document.getElementById("chore-chart-week");
const summaryLabel = document.getElementById("chore-chart-summary");
const chartGrid = document.getElementById("chore-chart-grid");
const choreForm = document.getElementById("chore-chart-form");
const choreInput = document.getElementById("chore-chart-input");
const choreValueSelect = document.getElementById("chore-chart-value-select");
const choreProfileSelect = document.getElementById("chore-chart-profile-select");
const feedbackLabel = document.getElementById("chore-chart-feedback");

const loadJSON =
  typeof fcv.loadJSON === "function"
    ? fcv.loadJSON
    : (key, fallback) => {
        try {
          const raw = localStorage.getItem(key);
          return raw ? JSON.parse(raw) : fallback;
        } catch {
          return fallback;
        }
      };
const saveJSON =
  typeof fcv.saveJSON === "function"
    ? fcv.saveJSON
    : (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
      };

const slugify =
  typeof fcv.slugify === "function"
    ? fcv.slugify
    : (text) =>
        String(text || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
const getYearWeekIndex =
  typeof fcv.getYearWeekIndex === "function"
    ? fcv.getYearWeekIndex
    : (date = new Date()) => {
        const dayMs = 24 * 60 * 60 * 1000;
        const start = new Date(date.getFullYear(), 0, 1);
        const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayIndex = Math.floor((today - start) / dayMs);
        return Math.floor(dayIndex / 7);
      };
const getWeekKey =
  typeof fcv.getWeekKey === "function"
    ? fcv.getWeekKey
    : (date = new Date()) => {
        const weekIndex = getYearWeekIndex(date) + 1;
        return `${date.getFullYear()}-W${weekIndex}`;
      };
const getValueByIdentifier =
  typeof fcv.getValueByIdentifier === "function"
    ? (identifier) => fcv.getValueByIdentifier(identifier, values)
    : (identifier) => {
        const needle = String(identifier || "").toLowerCase();
        return values.find((item) => {
          const slug = item.slug || slugify(item.name);
          return String(item.name || "").toLowerCase() === needle || String(slug || "").toLowerCase() === needle;
        });
      };
const getValueToneClass =
  typeof fcv.getValueToneClass === "function"
    ? (identifier) => fcv.getValueToneClass(identifier, values)
    : (identifier) => {
        const value = getValueByIdentifier(identifier);
        if (!value || !values.length) {
          return "";
        }
        const index = values.findIndex((item) => item.name === value.name);
        return index >= 0 ? `value-tone-${(index % values.length) + 1}` : "";
      };
const normalizeChoreMappings =
  typeof fcv.normalizeChoreMappings === "function"
    ? fcv.normalizeChoreMappings
    : (rawMappings, profiles, fallbackProfileId) => {
        if (!Array.isArray(rawMappings)) {
          return [];
        }
        return rawMappings
          .map((mapping, index) => {
            const assigned =
              Array.isArray(profiles) && profiles.some((profile) => profile.id === mapping?.assignedProfileId)
                ? mapping.assignedProfileId
                : fallbackProfileId;
            const chore = typeof mapping?.chore === "string" ? mapping.chore.trim() : "";
            const value = typeof mapping?.value === "string" ? mapping.value.trim() : "";
            if (!chore || !value || !assigned) {
              return null;
            }
            return {
              id: typeof mapping?.id === "string" && mapping.id ? mapping.id : `legacy-${index + 1}`,
              chore,
              value,
              assignedProfileId: assigned
            };
          })
          .filter(Boolean);
      };

let profiles = [];
let choreMappings = [];
let profileChoreCompletionMap = {};
let profileChoreApprovalMap = {};
let controlsBound = false;
const VALUE_TRANSITION_KEY = "fcv_transition_value_slug";
let valueLinkTransitionBound = false;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function toPlainObject(value) {
  return isPlainObject(value) ? value : {};
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function setPanelStaggerIndexes(selector) {
  document.querySelectorAll(selector).forEach((element, index) => {
    element.style.setProperty("--panel-index", String(index));
  });
}

function markPageReady() {
  document.body.classList.remove("is-loading");
  window.requestAnimationFrame(() => {
    document.body.classList.add("is-ready");
  });
}

function setValueTransitionIntent(slug) {
  if (!slug) {
    return;
  }
  try {
    sessionStorage.setItem(VALUE_TRANSITION_KEY, slug);
  } catch {
    // Ignore session storage failures.
  }
}

function initValueNavigationIntentCapture() {
  if (valueLinkTransitionBound) {
    return;
  }

  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest("a[href*='value.html']");
      if (!link) {
        return;
      }
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }
      let url;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      const slug = url.searchParams.get("value");
      if (slug) {
        setValueTransitionIntent(slug);
      }
    },
    { capture: true }
  );

  valueLinkTransitionBound = true;
}

function getProfileWeekCompletion(completionMap, profileId, weekKey) {
  const byProfile = completionMap && completionMap[profileId] ? completionMap[profileId] : {};
  return byProfile[weekKey] || {};
}

function getProfileWeekApprovals(approvalMap, profileId, weekKey) {
  const byProfile = approvalMap && approvalMap[profileId] ? approvalMap[profileId] : {};
  return byProfile[weekKey] || {};
}

function getProfileIconGlyph(iconId) {
  return PROFILE_ICON_GLYPHS[iconId] || PROFILE_ICON_GLYPHS.star;
}

function setFeedback(message) {
  if (!feedbackLabel) {
    return;
  }
  feedbackLabel.classList.remove("is-visible");
  feedbackLabel.textContent = message || "";
  if (!message) {
    return;
  }
  window.requestAnimationFrame(() => {
    feedbackLabel.classList.add("is-visible");
  });
}

function loadChartState() {
  const rawProfiles = loadJSON(STORAGE.PROFILES, []);
  profiles =
    typeof fcv.normalizeProfiles === "function"
      ? fcv.normalizeProfiles(rawProfiles, PROFILE_AGES, PROFILE_ICON_IDS)
      : Array.isArray(rawProfiles)
        ? rawProfiles.filter((profile) => profile && typeof profile.id === "string" && profile.id)
        : [];

  const validProfileIds = new Set(profiles.map((profile) => profile.id));
  const rawCompletion = loadJSON(STORAGE.PROFILE_CHORE_COMPLETION, {});
  const rawApprovals = loadJSON(STORAGE.PROFILE_CHORE_APPROVAL, {});
  profileChoreCompletionMap = {};
  profileChoreApprovalMap = {};

  validProfileIds.forEach((profileId) => {
    const completionByWeek = toPlainObject(rawCompletion[profileId]);
    const cleanCompletionByWeek = {};
    Object.keys(completionByWeek).forEach((weekKey) => {
      const weekCompletion = toPlainObject(completionByWeek[weekKey]);
      const cleanWeek = {};
      Object.keys(weekCompletion).forEach((choreId) => {
        if (weekCompletion[choreId] === true) {
          cleanWeek[choreId] = true;
        }
      });
      cleanCompletionByWeek[weekKey] = cleanWeek;
    });
    profileChoreCompletionMap[profileId] = cleanCompletionByWeek;

    const approvalsByWeek = toPlainObject(rawApprovals[profileId]);
    const cleanApprovalsByWeek = {};
    Object.keys(approvalsByWeek).forEach((weekKey) => {
      const weekApprovals = toPlainObject(approvalsByWeek[weekKey]);
      const cleanWeek = {};
      Object.keys(weekApprovals).forEach((choreId) => {
        const approval = weekApprovals[choreId];
        if (!isPlainObject(approval) || approval.status !== "pending") {
          return;
        }
        cleanWeek[choreId] = {
          status: "pending",
          requestedAt: typeof approval.requestedAt === "string" ? approval.requestedAt : ""
        };
      });
      cleanApprovalsByWeek[weekKey] = cleanWeek;
    });
    profileChoreApprovalMap[profileId] = cleanApprovalsByWeek;
  });

  choreMappings = normalizeChoreMappings(loadJSON(STORAGE.CHORE_MAP, []), profiles, profiles[0]?.id || "", []);
}

function pruneStaleChartStateReferences() {
  const assignedByProfile = new Map();
  profiles.forEach((profile) => {
    assignedByProfile.set(
      profile.id,
      new Set(choreMappings.filter((mapping) => mapping.assignedProfileId === profile.id).map((mapping) => mapping.id))
    );
  });

  let completionChanged = false;
  Object.keys(profileChoreCompletionMap).forEach((profileId) => {
    const allowedIds = assignedByProfile.get(profileId) || new Set();
    const byWeek = toPlainObject(profileChoreCompletionMap[profileId]);
    Object.keys(byWeek).forEach((weekKey) => {
      const weekCompletion = toPlainObject(byWeek[weekKey]);
      Object.keys(weekCompletion).forEach((choreId) => {
        if (!allowedIds.has(choreId)) {
          delete weekCompletion[choreId];
          completionChanged = true;
        }
      });
      byWeek[weekKey] = weekCompletion;
    });
    profileChoreCompletionMap[profileId] = byWeek;
  });

  let approvalChanged = false;
  Object.keys(profileChoreApprovalMap).forEach((profileId) => {
    const allowedIds = assignedByProfile.get(profileId) || new Set();
    const byWeek = toPlainObject(profileChoreApprovalMap[profileId]);
    Object.keys(byWeek).forEach((weekKey) => {
      const weekApprovals = toPlainObject(byWeek[weekKey]);
      Object.keys(weekApprovals).forEach((choreId) => {
        if (!allowedIds.has(choreId)) {
          delete weekApprovals[choreId];
          approvalChanged = true;
        }
      });
      byWeek[weekKey] = weekApprovals;
    });
    profileChoreApprovalMap[profileId] = byWeek;
  });

  if (completionChanged) {
    saveProfileChoreCompletionMap();
  }
  if (approvalChanged) {
    saveProfileChoreApprovalMap();
  }
}

function saveChoreMappings() {
  saveJSON(STORAGE.CHORE_MAP, choreMappings);
}

function saveProfileChoreCompletionMap() {
  saveJSON(STORAGE.PROFILE_CHORE_COMPLETION, profileChoreCompletionMap);
}

function saveProfileChoreApprovalMap() {
  saveJSON(STORAGE.PROFILE_CHORE_APPROVAL, profileChoreApprovalMap);
}

function getProfileById(profileId) {
  return profiles.find((profile) => profile.id === profileId) || null;
}

function populateValueSelect(selectEl, selectedValue = "") {
  if (!selectEl) {
    return;
  }

  selectEl.innerHTML = "";
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value.name;
    option.textContent = value.name;
    selectEl.appendChild(option);
  });

  const hasRequested = selectedValue && values.some((value) => value.name === selectedValue);
  if (hasRequested) {
    selectEl.value = selectedValue;
  }
}

function populateProfileSelect(selectEl, selectedProfileId = "") {
  if (!selectEl) {
    return;
  }

  selectEl.innerHTML = "";
  profiles.forEach((profile) => {
    const option = document.createElement("option");
    option.value = profile.id;
    option.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}`;
    selectEl.appendChild(option);
  });

  const hasRequested = selectedProfileId && profiles.some((profile) => profile.id === selectedProfileId);
  if (hasRequested) {
    selectEl.value = selectedProfileId;
    return;
  }
  if (profiles[0]) {
    selectEl.value = profiles[0].id;
  }
}

function clearChoreCompletion(mappingId) {
  Object.keys(profileChoreCompletionMap).forEach((profileId) => {
    const byWeek = toPlainObject(profileChoreCompletionMap[profileId]);
    if (!byWeek || typeof byWeek !== "object") {
      return;
    }
    Object.keys(byWeek).forEach((weekKey) => {
      const completion = toPlainObject(byWeek[weekKey]);
      if (completion && completion[mappingId]) {
        delete completion[mappingId];
      }
      byWeek[weekKey] = completion;
    });
    profileChoreCompletionMap[profileId] = byWeek;
  });
}

function clearChoreApproval(mappingId) {
  Object.keys(profileChoreApprovalMap).forEach((profileId) => {
    const byWeek = toPlainObject(profileChoreApprovalMap[profileId]);
    if (!byWeek || typeof byWeek !== "object") {
      return;
    }
    Object.keys(byWeek).forEach((weekKey) => {
      const approvals = toPlainObject(byWeek[weekKey]);
      if (approvals && approvals[mappingId]) {
        delete approvals[mappingId];
      }
      byWeek[weekKey] = approvals;
    });
    profileChoreApprovalMap[profileId] = byWeek;
  });
}

function renderChoreChart() {
  if (!chartGrid || !weekLabel || !summaryLabel) {
    return;
  }

  loadChartState();
  pruneStaleChartStateReferences();

  const weekKey = getWeekKey();
  const weekNumber = getYearWeekIndex() + 1;
  weekLabel.textContent = `Week ${weekNumber} of ${new Date().getFullYear()} • ${weekKey}`;

  const selectedValue = choreValueSelect ? choreValueSelect.value : "";
  const selectedProfile = choreProfileSelect ? choreProfileSelect.value : "";
  populateValueSelect(choreValueSelect, selectedValue);
  populateProfileSelect(choreProfileSelect, selectedProfile);

  if (choreForm && choreInput && choreValueSelect && choreProfileSelect) {
    const formEnabled = profiles.length > 0 && values.length > 0;
    choreInput.disabled = !formEnabled;
    choreValueSelect.disabled = !formEnabled;
    choreProfileSelect.disabled = !formEnabled;
    const submitButton = choreForm.querySelector("button[type='submit']");
    if (submitButton) {
      submitButton.disabled = !formEnabled;
    }
  }

  if (!Array.isArray(profiles) || !profiles.length) {
    summaryLabel.textContent = "No child profiles found. Add a profile on the dashboard first.";
    chartGrid.innerHTML = "";
    setFeedback("Add a child profile on the dashboard before assigning chores.");
    return;
  }

  let totalAssigned = 0;
  let totalCompleted = 0;
  chartGrid.innerHTML = "";

  profiles.forEach((profile, profileIndex) => {
    const assigned = choreMappings.filter((mapping) => mapping.assignedProfileId === profile.id);
    const completion = getProfileWeekCompletion(profileChoreCompletionMap, profile.id, weekKey);
    const approvals = getProfileWeekApprovals(profileChoreApprovalMap, profile.id, weekKey);
    const completedCount = assigned.filter((mapping) => Boolean(completion[mapping.id])).length;

    totalAssigned += assigned.length;
    totalCompleted += completedCount;

    const card = document.createElement("article");
    card.className = "chore-profile-card";
    card.style.setProperty("--card-index", String(profileIndex));

    const header = document.createElement("div");
    header.className = "chore-profile-header";

    const title = document.createElement("h3");
    title.textContent = `${getProfileIconGlyph(profile.icon)} ${profile.name}`;

    const stat = document.createElement("span");
    stat.className = "chore-profile-stat";
    stat.textContent = `${completedCount}/${assigned.length} complete`;

    header.appendChild(title);
    header.appendChild(stat);
    card.appendChild(header);

    if (!assigned.length) {
      const empty = document.createElement("p");
      empty.className = "chore-profile-empty";
      empty.textContent = "No assigned chores yet.";
      card.appendChild(empty);
      chartGrid.appendChild(card);
      return;
    }

    const list = document.createElement("ul");
    list.className = "chore-chart-list";

    assigned.forEach((mapping) => {
      const isPending = approvals[mapping.id]?.status === "pending";
      const row = document.createElement("li");
      row.className = `chore-chart-item${completion[mapping.id] ? " is-complete" : ""}${isPending ? " is-pending" : ""}`;

      const main = document.createElement("div");
      main.className = "chore-chart-main";

      const name = document.createElement("span");
      name.className = "chore-chart-name";
      name.textContent = mapping.chore;

      const meta = document.createElement("div");
      meta.className = "chore-chart-meta";

      const value = getValueByIdentifier(mapping.value);
      const toneClass = getValueToneClass(mapping.value);

      const valueTag = document.createElement("a");
      valueTag.className = "chore-chart-value";
      if (toneClass) {
        valueTag.classList.add(toneClass);
      }
      if (value) {
        valueTag.href = `value.html?value=${encodeURIComponent(value.slug || slugify(value.name))}`;
        valueTag.textContent = value.name;
      } else {
        valueTag.href = "#";
        valueTag.textContent = mapping.value;
      }

      const status = document.createElement("span");
      status.className = "chore-chart-status";
      status.textContent = completion[mapping.id] ? "Done" : isPending ? "Pending" : "Open";

      meta.appendChild(valueTag);
      meta.appendChild(status);
      main.appendChild(name);
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "chore-chart-actions";

      const moveSelect = document.createElement("select");
      moveSelect.className = "chore-chart-move";
      moveSelect.dataset.id = mapping.id;
      moveSelect.setAttribute("aria-label", `Move ${mapping.chore} to a different child`);
      populateProfileSelect(moveSelect, mapping.assignedProfileId);

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "chore-chart-remove";
      removeBtn.dataset.id = mapping.id;
      removeBtn.textContent = "Remove";
      removeBtn.setAttribute("aria-label", `Remove ${mapping.chore}`);

      actions.appendChild(moveSelect);
      actions.appendChild(removeBtn);
      row.appendChild(main);
      row.appendChild(actions);
      list.appendChild(row);
    });

    card.appendChild(list);
    chartGrid.appendChild(card);
  });

  summaryLabel.textContent = `${totalCompleted}/${totalAssigned} assigned chores complete this week`;
}

function handleChoreFormSubmit(event) {
  event.preventDefault();

  if (!choreInput || !choreValueSelect || !choreProfileSelect) {
    return;
  }

  const chore = choreInput.value.trim();
  const value = choreValueSelect.value;
  const assignedProfileId = choreProfileSelect.value;
  if (!chore || !value || !assignedProfileId) {
    return;
  }
  if (!profiles.some((profile) => profile.id === assignedProfileId)) {
    return;
  }

  choreMappings.unshift({
    id: createId("chore"),
    chore,
    value,
    assignedProfileId
  });

  saveChoreMappings();
  setFeedback(`Added "${chore}".`);
  choreInput.value = "";
  renderChoreChart();
}

function handleChartGridClick(event) {
  const removeBtn = event.target.closest("button.chore-chart-remove");
  if (!removeBtn) {
    return;
  }

  const { id } = removeBtn.dataset;
  const mapping = choreMappings.find((item) => item.id === id);
  if (!mapping) {
    return;
  }

  choreMappings = choreMappings.filter((item) => item.id !== id);
  clearChoreCompletion(id);
  clearChoreApproval(id);

  saveChoreMappings();
  saveProfileChoreCompletionMap();
  saveProfileChoreApprovalMap();
  setFeedback(`Removed "${mapping.chore}".`);
  renderChoreChart();
}

function handleChartGridChange(event) {
  const moveSelect = event.target.closest("select.chore-chart-move");
  if (!moveSelect) {
    return;
  }

  const { id } = moveSelect.dataset;
  const nextProfileId = moveSelect.value;
  const mapping = choreMappings.find((item) => item.id === id);

  if (!mapping || !nextProfileId || mapping.assignedProfileId === nextProfileId) {
    return;
  }
  if (!profiles.some((profile) => profile.id === nextProfileId)) {
    renderChoreChart();
    return;
  }

  const previousProfile = getProfileById(mapping.assignedProfileId);
  const nextProfile = getProfileById(nextProfileId);

  mapping.assignedProfileId = nextProfileId;
  clearChoreCompletion(id);
  clearChoreApproval(id);
  saveChoreMappings();
  saveProfileChoreCompletionMap();
  saveProfileChoreApprovalMap();

  if (previousProfile && nextProfile) {
    setFeedback(`Moved "${mapping.chore}" from ${previousProfile.name} to ${nextProfile.name}.`);
  } else {
    setFeedback(`Moved "${mapping.chore}" to a new child profile.`);
  }

  renderChoreChart();
}

function bindControls() {
  if (controlsBound) {
    return;
  }

  if (choreForm) {
    choreForm.addEventListener("submit", handleChoreFormSubmit);
  }
  if (chartGrid) {
    chartGrid.addEventListener("click", handleChartGridClick);
    chartGrid.addEventListener("change", handleChartGridChange);
  }

  controlsBound = true;
}

function startChoreChartApp() {
  initValueNavigationIntentCapture();
  setPanelStaggerIndexes(".chore-chart-layout > .panel");
  bindControls();
  renderChoreChart();
  markPageReady();
}

if (fcv.ready && typeof fcv.ready.then === "function") {
  fcv.ready.finally(startChoreChartApp);
} else {
  startChoreChartApp();
}

window.addEventListener("fcv:remote-update", renderChoreChart);
