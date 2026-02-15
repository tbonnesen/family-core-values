const fcv = window.FCV || {};
const values = typeof fcv.getValues === "function" ? fcv.getValues() : Array.isArray(window.CORE_VALUES) ? window.CORE_VALUES : [];
const STORAGE = fcv.STORAGE || {
  CHORE_MAP: "fcv_chore_mappings_v1",
  PROFILES: "fcv_profiles_v2",
  PROFILE_CHORE_COMPLETION: "fcv_profile_chore_completion_v2"
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

const weekLabel = document.getElementById("chore-chart-week");
const summaryLabel = document.getElementById("chore-chart-summary");
const chartGrid = document.getElementById("chore-chart-grid");

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

function getProfileWeekCompletion(completionMap, profileId, weekKey) {
  const byProfile = completionMap && completionMap[profileId] ? completionMap[profileId] : {};
  return byProfile[weekKey] || {};
}

function getProfileIconGlyph(iconId) {
  return PROFILE_ICON_GLYPHS[iconId] || PROFILE_ICON_GLYPHS.star;
}

function renderChoreChart() {
  if (!chartGrid || !weekLabel || !summaryLabel) {
    return;
  }

  const profiles = loadJSON(STORAGE.PROFILES, []);
  const completionMap = loadJSON(STORAGE.PROFILE_CHORE_COMPLETION, {});
  const choreMappings = normalizeChoreMappings(loadJSON(STORAGE.CHORE_MAP, []), profiles, profiles[0]?.id || "", []);
  const weekKey = getWeekKey();
  const weekNumber = getYearWeekIndex() + 1;

  weekLabel.textContent = `Week ${weekNumber} of ${new Date().getFullYear()} • ${weekKey}`;

  if (!Array.isArray(profiles) || !profiles.length) {
    summaryLabel.textContent = "No child profiles found. Add a profile on the dashboard first.";
    chartGrid.innerHTML = "";
    return;
  }

  let totalAssigned = 0;
  let totalCompleted = 0;
  chartGrid.innerHTML = "";

  profiles.forEach((profile) => {
    const assigned = choreMappings.filter((mapping) => mapping.assignedProfileId === profile.id);
    const completion = getProfileWeekCompletion(completionMap, profile.id, weekKey);
    const completedCount = assigned.filter((mapping) => Boolean(completion[mapping.id])).length;

    totalAssigned += assigned.length;
    totalCompleted += completedCount;

    const card = document.createElement("article");
    card.className = "chore-profile-card";

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
      const row = document.createElement("li");
      row.className = `chore-chart-item${completion[mapping.id] ? " is-complete" : ""}`;

      const name = document.createElement("span");
      name.className = "chore-chart-name";
      name.textContent = mapping.chore;

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
      status.textContent = completion[mapping.id] ? "Done" : "Open";

      row.appendChild(name);
      row.appendChild(valueTag);
      row.appendChild(status);
      list.appendChild(row);
    });

    card.appendChild(list);
    chartGrid.appendChild(card);
  });

  summaryLabel.textContent = `${totalCompleted}/${totalAssigned} assigned chores complete this week`;
}

if (fcv.ready && typeof fcv.ready.then === "function") {
  fcv.ready.finally(renderChoreChart);
} else {
  renderChoreChart();
}

window.addEventListener("fcv:remote-update", renderChoreChart);
