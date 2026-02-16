(function initFcvCore(global) {
  const PROFILE_AGES_DEFAULT = [1, 2, 3, 4, 5, 6, 7];
  const STORAGE = {
    PROGRESS: "fcv_progress_v1",
    REFLECTION: "fcv_reflections_v1",
    SCENARIO: "fcv_last_scenario_v1",
    CHORE_MAP: "fcv_chore_mappings_v1",
    DASHBOARD_LAYOUT: "fcv_dashboard_layout_v1",
    PARENT_PROFILE: "fcv_parent_profile_v1",
    DASHBOARD_FILTER_PROFILE: "fcv_dashboard_filter_profile_v1",
    PROFILES: "fcv_profiles_v2",
    ACTIVE_PROFILE: "fcv_active_profile_v2",
    PROFILE_PROGRESS: "fcv_profile_progress_v2",
    PROFILE_REFLECTION: "fcv_profile_reflections_v2",
    PROFILE_MEMORY_GAME: "fcv_profile_memory_game_v2",
    PROFILE_CHORE_COMPLETION: "fcv_profile_chore_completion_v2",
    PROFILE_WEEKLY_PLANS: "fcv_profile_weekly_plans_v1",
    PROFILE_GOAL_MILESTONES: "fcv_profile_goal_milestones_v1",
    PROFILE_CHORE_APPROVAL: "fcv_profile_chore_approval_v1",
    VIEW_MODE: "fcv_view_mode_v1"
  };
  const SHARED_SYNC_KEYS = [
    STORAGE.PARENT_PROFILE,
    STORAGE.PROFILES,
    STORAGE.PROFILE_PROGRESS,
    STORAGE.PROFILE_REFLECTION,
    STORAGE.PROFILE_MEMORY_GAME,
    STORAGE.PROFILE_CHORE_COMPLETION,
    STORAGE.PROFILE_WEEKLY_PLANS,
    STORAGE.PROFILE_GOAL_MILESTONES,
    STORAGE.PROFILE_CHORE_APPROVAL,
    STORAGE.CHORE_MAP,
    STORAGE.DASHBOARD_LAYOUT
  ];
  const SHARED_SYNC_KEY_SET = new Set(SHARED_SYNC_KEYS);
  const LOCAL_SHARED_UPDATED_AT_KEY = "fcv_shared_state_updated_at_v1";
  const API_STATE_PATH = "/api/state";
  const SYNC_PUSH_DELAY_MS = 220;
  const SYNC_POLL_MS = 15000;
  const SYNC_BOOTSTRAP_RETRY_MS = 5000;

  let syncEnabled = false;
  let syncPushTimer = null;
  let isApplyingRemoteState = false;
  let lastRemoteUpdatedAt = "";
  let lastRemoteStateSignature = "";
  let syncPollTimer = null;
  let syncBootstrapTimer = null;
  let syncBootstrapInFlight = false;

  function canUseRemoteSync() {
    const isHttp = global.location && /^(http|https):$/.test(global.location.protocol || "");
    return Boolean(isHttp && typeof global.fetch === "function");
  }

  function toEpochMs(value) {
    if (typeof value !== "string" || !value) {
      return 0;
    }
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function getLocalSharedUpdatedAt() {
    return safeGetItem(LOCAL_SHARED_UPDATED_AT_KEY) || "";
  }

  function touchLocalSharedUpdatedAt(timestamp = new Date().toISOString()) {
    rawSetItem(LOCAL_SHARED_UPDATED_AT_KEY, timestamp);
  }

  function isSharedSyncKey(key) {
    return SHARED_SYNC_KEY_SET.has(key);
  }

  function getCurrentSharedState() {
    const state = {};
    SHARED_SYNC_KEYS.forEach((key) => {
      const value = safeGetItem(key);
      if (typeof value === "string") {
        state[key] = value;
      }
    });
    return state;
  }

  function getSerializedArrayLength(sharedState, key) {
    const raw = sharedState && typeof sharedState[key] === "string" ? sharedState[key] : "";
    if (!raw) {
      return 0;
    }
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }

  function hasLikelyNewerLocalData(localState, remoteState) {
    const localProfiles = getSerializedArrayLength(localState, STORAGE.PROFILES);
    const remoteProfiles = getSerializedArrayLength(remoteState, STORAGE.PROFILES);
    if (localProfiles !== remoteProfiles) {
      return localProfiles > remoteProfiles;
    }

    const localChores = getSerializedArrayLength(localState, STORAGE.CHORE_MAP);
    const remoteChores = getSerializedArrayLength(remoteState, STORAGE.CHORE_MAP);
    if (localChores !== remoteChores) {
      return localChores > remoteChores;
    }

    return false;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function hasIdField(item) {
    return Boolean(item) && typeof item === "object" && !Array.isArray(item) && typeof item.id === "string" && item.id;
  }

  function tryParseJson(raw) {
    if (typeof raw !== "string") {
      return undefined;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  function mergeArrays(localArray, remoteArray) {
    const local = Array.isArray(localArray) ? localArray : [];
    const remote = Array.isArray(remoteArray) ? remoteArray : [];
    const localHasIds = local.length && local.every((item) => hasIdField(item));
    const remoteHasIds = remote.length && remote.every((item) => hasIdField(item));

    if (localHasIds && remoteHasIds) {
      const byId = new Map();
      remote.forEach((item) => {
        byId.set(item.id, item);
      });
      local.forEach((item) => {
        const existing = byId.get(item.id);
        byId.set(item.id, existing ? mergeParsed(item, existing) : item);
      });
      return Array.from(byId.values());
    }

    return local.length >= remote.length ? local : remote;
  }

  function mergeParsed(localValue, remoteValue) {
    if (typeof localValue === "undefined") {
      return remoteValue;
    }
    if (typeof remoteValue === "undefined") {
      return localValue;
    }

    if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
      return mergeArrays(localValue, remoteValue);
    }

    if (isPlainObject(localValue) && isPlainObject(remoteValue)) {
      const merged = { ...remoteValue };
      Object.keys(localValue).forEach((key) => {
        merged[key] = mergeParsed(localValue[key], remoteValue[key]);
      });
      return merged;
    }

    return localValue;
  }

  function mergeSharedState(localState, remoteState) {
    const merged = {};

    SHARED_SYNC_KEYS.forEach((key) => {
      const localRaw = typeof localState[key] === "string" ? localState[key] : null;
      const remoteRaw = typeof remoteState[key] === "string" ? remoteState[key] : null;

      if (localRaw === null && remoteRaw === null) {
        return;
      }
      if (localRaw === null) {
        merged[key] = remoteRaw;
        return;
      }
      if (remoteRaw === null) {
        merged[key] = localRaw;
        return;
      }
      if (localRaw === remoteRaw) {
        merged[key] = localRaw;
        return;
      }

      const localParsed = tryParseJson(localRaw);
      const remoteParsed = tryParseJson(remoteRaw);
      if (typeof localParsed !== "undefined" && typeof remoteParsed !== "undefined") {
        try {
          merged[key] = JSON.stringify(mergeParsed(localParsed, remoteParsed));
          return;
        } catch {
          // Fall through to raw merge.
        }
      }

      merged[key] = localRaw || remoteRaw;
    });

    return merged;
  }

  function hasAnySharedState(state) {
    return Object.keys(state).length > 0;
  }

  function safeGetItem(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  function rawSetItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch {
      return false;
    }
  }

  function rawRemoveItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  function safeSetItem(key, value) {
    const previous = safeGetItem(key);
    if (previous === value) {
      return true;
    }
    const ok = rawSetItem(key, value);
    if (ok && isSharedSyncKey(key)) {
      touchLocalSharedUpdatedAt();
      if (syncEnabled && !isApplyingRemoteState) {
        scheduleSharedStatePush();
      }
    }
    return ok;
  }

  function safeRemoveItem(key) {
    if (safeGetItem(key) === null) {
      return true;
    }
    const ok = rawRemoveItem(key);
    if (ok && isSharedSyncKey(key)) {
      touchLocalSharedUpdatedAt();
      if (syncEnabled && !isApplyingRemoteState) {
        scheduleSharedStatePush();
      }
    }
    return ok;
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
        const icon = allowedIcons.includes(profile?.icon)
          ? profile.icon
          : allowedIcons[index % Math.max(1, allowedIcons.length)] || fallbackIcon;

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

  function applySharedStateFromRemote(remoteState) {
    if (!remoteState || typeof remoteState !== "object") {
      return;
    }
    isApplyingRemoteState = true;
    try {
      SHARED_SYNC_KEYS.forEach((key) => {
        const value = remoteState[key];
        if (typeof value === "string") {
          rawSetItem(key, value);
        } else {
          rawRemoveItem(key);
        }
      });
    } finally {
      isApplyingRemoteState = false;
    }
  }

  async function pushSharedStateToServer() {
    if (!syncEnabled || !canUseRemoteSync() || isApplyingRemoteState) {
      return;
    }

    const payload = {
      state: getCurrentSharedState(),
      updatedAt: new Date().toISOString()
    };

    try {
      const response = await global.fetch(API_STATE_PATH, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        return;
      }

      const body = await response.json().catch(() => null);
      if (body && typeof body.updatedAt === "string") {
        lastRemoteUpdatedAt = body.updatedAt;
      }
    } catch {
      // Keep local state authoritative if the shared API is temporarily unavailable.
    }
  }

  function scheduleSharedStatePush(delay = SYNC_PUSH_DELAY_MS) {
    if (!syncEnabled || !canUseRemoteSync() || isApplyingRemoteState) {
      return;
    }

    if (syncPushTimer) {
      global.clearTimeout(syncPushTimer);
    }

    syncPushTimer = global.setTimeout(() => {
      syncPushTimer = null;
      pushSharedStateToServer();
    }, delay);
  }

  async function refreshSharedStateFromServer() {
    if (!canUseRemoteSync()) {
      return;
    }
    if (!syncEnabled) {
      scheduleSyncBootstrapRetry(0);
      return;
    }

    try {
      const response = await global.fetch(API_STATE_PATH, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        return;
      }

      const payload = await response.json().catch(() => null);
      if (!payload || typeof payload !== "object") {
        return;
      }

      const remoteUpdatedAt = typeof payload.updatedAt === "string" ? payload.updatedAt : "";
      const remoteState = payload.state && typeof payload.state === "object" ? payload.state : {};
      const remoteStateSignature = JSON.stringify(remoteState);
      const localState = getCurrentSharedState();
      const localHasState = hasAnySharedState(localState);
      const localUpdatedAtMs = toEpochMs(getLocalSharedUpdatedAt());
      const remoteUpdatedAtMs = toEpochMs(remoteUpdatedAt);
      const preferLocalByHeuristic =
        localHasState && (!localUpdatedAtMs || !remoteUpdatedAtMs) && hasLikelyNewerLocalData(localState, remoteState);

      if (remoteUpdatedAt && remoteUpdatedAt === lastRemoteUpdatedAt) {
        return;
      }

      if (!remoteUpdatedAt && remoteStateSignature === lastRemoteStateSignature) {
        return;
      }

      if ((localHasState && localUpdatedAtMs && localUpdatedAtMs > remoteUpdatedAtMs) || preferLocalByHeuristic) {
        const mergedState = mergeSharedState(localState, remoteState);
        applySharedStateFromRemote(mergedState);
        lastRemoteUpdatedAt = remoteUpdatedAt;
        lastRemoteStateSignature = JSON.stringify(mergedState);
        global.dispatchEvent(new CustomEvent("fcv:remote-update", { detail: { updatedAt: lastRemoteUpdatedAt } }));
        scheduleSharedStatePush(0);
        return;
      }

      applySharedStateFromRemote(remoteState);
      lastRemoteUpdatedAt = remoteUpdatedAt;
      lastRemoteStateSignature = remoteStateSignature;
      global.dispatchEvent(new CustomEvent("fcv:remote-update", { detail: { updatedAt: lastRemoteUpdatedAt } }));
    } catch {
      // No-op: keep local copy while remote is unreachable.
    }
  }

  function startSyncPolling() {
    if (syncPollTimer || !syncEnabled || !canUseRemoteSync()) {
      return;
    }

    syncPollTimer = global.setInterval(() => {
      refreshSharedStateFromServer();
    }, SYNC_POLL_MS);
  }

  function scheduleSyncBootstrapRetry(delay = SYNC_BOOTSTRAP_RETRY_MS) {
    if (syncEnabled || syncBootstrapTimer || !canUseRemoteSync()) {
      return;
    }

    syncBootstrapTimer = global.setTimeout(() => {
      syncBootstrapTimer = null;
      bootstrapSharedStateSync();
    }, Math.max(0, Number(delay) || 0));
  }

  async function bootstrapSharedStateSync() {
    if (syncEnabled || !canUseRemoteSync()) {
      return;
    }
    if (syncBootstrapInFlight) {
      return;
    }
    syncBootstrapInFlight = true;
    if (syncBootstrapTimer) {
      global.clearTimeout(syncBootstrapTimer);
      syncBootstrapTimer = null;
    }

    const localBefore = getCurrentSharedState();

    try {
      const response = await global.fetch(API_STATE_PATH, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json"
        }
      });
      if (!response.ok) {
        scheduleSyncBootstrapRetry();
        return;
      }

      const payload = await response.json().catch(() => null);
      if (!payload || typeof payload !== "object") {
        scheduleSyncBootstrapRetry();
        return;
      }

      const remoteState = payload.state && typeof payload.state === "object" ? payload.state : {};
      lastRemoteUpdatedAt = typeof payload.updatedAt === "string" ? payload.updatedAt : "";
      lastRemoteStateSignature = JSON.stringify(remoteState);
      const localUpdatedAtMs = toEpochMs(getLocalSharedUpdatedAt());
      const remoteUpdatedAtMs = toEpochMs(lastRemoteUpdatedAt);
      const localLooksNewerByTimestamp = hasAnySharedState(localBefore) && localUpdatedAtMs && localUpdatedAtMs > remoteUpdatedAtMs;
      const localLooksNewerByHeuristic =
        hasAnySharedState(localBefore) && (!localUpdatedAtMs || !remoteUpdatedAtMs) && hasLikelyNewerLocalData(localBefore, remoteState);
      const localLooksNewer = localLooksNewerByTimestamp || localLooksNewerByHeuristic;

      syncEnabled = true;

      if (localLooksNewer) {
        const mergedState = mergeSharedState(localBefore, remoteState);
        applySharedStateFromRemote(mergedState);
        lastRemoteStateSignature = JSON.stringify(mergedState);
        global.dispatchEvent(new CustomEvent("fcv:remote-update", { detail: { updatedAt: lastRemoteUpdatedAt } }));
        scheduleSharedStatePush(0);
      } else if (lastRemoteUpdatedAt || Object.keys(remoteState).length) {
        applySharedStateFromRemote(remoteState);
        global.dispatchEvent(new CustomEvent("fcv:remote-update", { detail: { updatedAt: lastRemoteUpdatedAt } }));
      } else if (hasAnySharedState(localBefore)) {
        scheduleSharedStatePush(0);
      }

      startSyncPolling();
    } catch {
      // Keep local-only mode if shared sync endpoint is not present.
      scheduleSyncBootstrapRetry();
    } finally {
      syncBootstrapInFlight = false;
    }
  }

  if (global && typeof global.addEventListener === "function") {
    global.addEventListener("online", () => {
      if (syncEnabled) {
        refreshSharedStateFromServer();
      } else {
        scheduleSyncBootstrapRetry(0);
      }
    });
  }

  if (global.document && typeof global.document.addEventListener === "function") {
    global.document.addEventListener("visibilitychange", () => {
      if (global.document.hidden) {
        return;
      }
      if (syncEnabled) {
        refreshSharedStateFromServer();
      } else {
        scheduleSyncBootstrapRetry(0);
      }
    });
  }

  const ready = bootstrapSharedStateSync();

  global.FCV = {
    ...(global.FCV || {}),
    STORAGE,
    PROFILE_AGES_DEFAULT,
    safeGetItem,
    safeSetItem,
    safeRemoveItem,
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
    normalizeChoreMappings,
    ready,
    refreshSharedStateFromServer,
    pushSharedStateToServer
  };
})(window);
