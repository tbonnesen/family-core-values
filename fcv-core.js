(function initFcvCore(global) {
  const PROFILE_AGES_DEFAULT = [1, 2, 3, 4, 5, 6, 7];
  const STORAGE = {
    PROGRESS: "fcv_progress_v1",
    REFLECTION: "fcv_reflections_v1",
    SCENARIO: "fcv_last_scenario_v1",
    CHORE_MAP: "fcv_chore_mappings_v1",
    PARENT_PROFILE: "fcv_parent_profile_v1",
    PROFILES: "fcv_profiles_v2",
    ACTIVE_PROFILE: "fcv_active_profile_v2",
    PROFILE_PROGRESS: "fcv_profile_progress_v2",
    PROFILE_REFLECTION: "fcv_profile_reflections_v2",
    PROFILE_MEMORY_GAME: "fcv_profile_memory_game_v2",
    PROFILE_CHORE_COMPLETION: "fcv_profile_chore_completion_v2"
  };

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function safeSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function loadJSON(key, fallback) {
    try {
      const raw = safeGetItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }

  function saveJSON(key, value) {
    return safeSetItem(key, JSON.stringify(value));
  }

  function normalizeValue(value) {
    return typeof value === "string" ? value.toLowerCase() : "";
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  function unique(array) {
    return Array.from(new Set(Array.isArray(array) ? array : []));
  }

  function shuffle(array) {
    const copy = Array.isArray(array) ? array.slice() : [];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function getValues() {
    return Array.isArray(global.CORE_VALUES) ? global.CORE_VALUES : [];
  }

  function getYearWeekIndex(date = new Date()) {
    const dayMs = 24 * 60 * 60 * 1000;
    const start = new Date(date.getFullYear(), 0, 1);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayIndex = Math.floor((today - start) / dayMs);
    return Math.floor(dayIndex / 7);
  }

  function getWeekKey(date = new Date()) {
    const weekIndex = getYearWeekIndex(date) + 1;
    return `${date.getFullYear()}-W${weekIndex}`;
  }

  function getQuarterInfo(date = new Date(), cycleLength = 13) {
    const safeCycleLength = Math.max(1, Number(cycleLength) || 1);
    const dayMs = 24 * 60 * 60 * 1000;
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    const quarterStart = new Date(date.getFullYear(), (quarter - 1) * 3, 1);
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayIndex = Math.floor((today - quarterStart) / dayMs);
    const weekIndex = Math.floor(dayIndex / 7);

    return {
      quarter,
      weekIndex,
      weekInQuarter: (weekIndex % safeCycleLength) + 1
    };
  }

  function getValueByIdentifier(identifier, values = getValues()) {
    const needle = normalizeValue(identifier);
    return values.find((item) => {
      const slug = item.slug || slugify(item.name);
      return normalizeValue(item.name) === needle || normalizeValue(slug) === needle;
    });
  }

  function getValueToneClass(identifier, values = getValues()) {
    const value = getValueByIdentifier(identifier, values);
    if (!value || !values.length) {
      return "";
    }

    const index = values.findIndex((item) => item.name === value.name);
    return index >= 0 ? `value-tone-${(index % values.length) + 1}` : "";
  }

  function normalizeProfiles(rawProfiles, profileAges = PROFILE_AGES_DEFAULT, profileIcons = []) {
    const allowedAges = Array.isArray(profileAges) && profileAges.length ? profileAges : PROFILE_AGES_DEFAULT;
    const allowedIcons = Array.isArray(profileIcons) ? profileIcons.filter((icon) => typeof icon === "string" && icon) : [];
    const fallbackIcon = allowedIcons[0] || "star";
    const seenIds = new Set();

    const normalized = (Array.isArray(rawProfiles) ? rawProfiles : [])
      .map((profile, index) => {
        const id = typeof profile?.id === "string" && profile.id ? profile.id : `child-${Date.now()}-${index + 1}`;
        if (seenIds.has(id)) {
          return null;
        }
        seenIds.add(id);

        const name = typeof profile?.name === "string" && profile.name.trim() ? profile.name.trim() : `Child ${index + 1}`;
        const ages = unique(
          Array.isArray(profile?.ages)
            ? profile.ages.map((age) => Number(age)).filter((age) => allowedAges.includes(age))
            : []
        ).sort((a, b) => a - b);
        const icon = allowedIcons.includes(profile?.icon) ? profile.icon : allowedIcons[index % Math.max(1, allowedIcons.length)] || fallbackIcon;

        return {
          id,
          name,
          ages,
          icon
        };
      })
      .filter(Boolean);

    return normalized.length
      ? normalized
      : [{ id: `child-${Date.now()}-1`, name: "Child 1", ages: [5], icon: fallbackIcon }];
  }

  function normalizeChoreMappings(rawMappings, profiles, fallbackProfileId, defaultMappings) {
    const safeProfiles = Array.isArray(profiles) ? profiles : [];
    const profileIds = new Set(safeProfiles.map((profile) => profile.id));
    const safeFallback = profileIds.has(fallbackProfileId) ? fallbackProfileId : safeProfiles[0]?.id || "";
    const defaults = Array.isArray(defaultMappings) ? defaultMappings : [];

    function mapDefaults() {
      if (!safeFallback || !defaults.length) {
        return [];
      }
      return defaults.map((item, index) => ({
        id: `default-${index + 1}`,
        chore: String(item.chore || "").trim(),
        value: String(item.value || "").trim(),
        assignedProfileId: safeFallback
      }));
    }

    if (!Array.isArray(rawMappings) || !rawMappings.length) {
      return mapDefaults();
    }

    const normalized = rawMappings
      .map((mapping, index) => {
        const id = typeof mapping?.id === "string" && mapping.id ? mapping.id : `legacy-${index + 1}`;
        const chore = typeof mapping?.chore === "string" ? mapping.chore.trim() : "";
        const value = typeof mapping?.value === "string" ? mapping.value.trim() : "";
        const assignedProfileId = profileIds.has(mapping?.assignedProfileId) ? mapping.assignedProfileId : safeFallback;

        if (!id || !chore || !value || !assignedProfileId) {
          return null;
        }

        return {
          id,
          chore,
          value,
          assignedProfileId
        };
      })
      .filter(Boolean);

    return normalized.length ? normalized : mapDefaults();
  }

  global.FCV = {
    ...(global.FCV || {}),
    STORAGE,
    PROFILE_AGES_DEFAULT,
    safeGetItem,
    safeSetItem,
    loadJSON,
    saveJSON,
    normalizeValue,
    slugify,
    unique,
    shuffle,
    getValues,
    getYearWeekIndex,
    getWeekKey,
    getQuarterInfo,
    getValueByIdentifier,
    getValueToneClass,
    normalizeProfiles,
    normalizeChoreMappings
  };
})(window);
